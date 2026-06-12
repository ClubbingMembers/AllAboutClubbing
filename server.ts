import express from "express";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, getDoc, runTransaction } from "firebase/firestore";

interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  instagram?: string;
  whatsapp: string;
  eventIds: string[];
  seeksAccommodation: boolean;
  accommodationNote?: string;
  createdAt: number;
}

interface Suggestion {
  id: string;
  title: string;
  date: string;
  createdAt: number;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent JSON file paths
const REGISTRATIONS_FILE = path.join(process.cwd(), "registrations_db.json");
const SUGGESTIONS_FILE = path.join(process.cwd(), "suggestions_db.json");

// Helper to safely load data
function loadJSON<T>(file: string, defaultValue: T[]): T[] {
  try {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, "utf8");
      return JSON.parse(data) as T[];
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
  return defaultValue;
}

// Helper to safely save data
function saveJSON<T>(file: string, list: T[]) {
  try {
    fs.writeFileSync(file, JSON.stringify(list, null, 2), "utf8");
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
  }
}

// Helper to clean undefined/null/empty-string values for Firestore compatibility
function cleanFirestoreData<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value !== undefined && value !== null && value !== "") {
      cleaned[key] = value;
    }
  }
  return cleaned as Partial<T>;
}

// Initialize Firebase
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8"));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// In-memory cache synced with disk (used as backup fallbacks)
let registrations: Registration[] = loadJSON<Registration>(REGISTRATIONS_FILE, []);
let suggestions: Suggestion[] = loadJSON<Suggestion>(SUGGESTIONS_FILE, []);

async function getRegistrations(): Promise<Registration[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "registrations"));
    const list: Registration[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Registration;
      if (data) list.push(data);
    });
    // Sort registrations by createdAt descending
    list.sort((a, b) => b.createdAt - a.createdAt);
    registrations = list;
    saveJSON(REGISTRATIONS_FILE, registrations);
  } catch (err) {
    console.error("Error fetching registrations from Firestore, falling back to local cache:", err);
  }
  return registrations;
}

async function getSuggestions(): Promise<Suggestion[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "suggestions"));
    const list: Suggestion[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Suggestion;
      if (data) list.push(data);
    });
    // Sort suggestions by createdAt descending
    list.sort((a, b) => b.createdAt - a.createdAt);
    suggestions = list;
    saveJSON(SUGGESTIONS_FILE, suggestions);
  } catch (err) {
    console.error("Error fetching suggestions from Firestore, falling back to local cache:", err);
  }
  return suggestions;
}

async function getEventViews(): Promise<Record<string, number>> {
  const viewsMap: Record<string, number> = {};
  try {
    const querySnapshot = await getDocs(collection(db, "event_views"));
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && typeof data.count === "number") {
        viewsMap[docSnap.id] = data.count;
      }
    });
  } catch (err) {
    console.error("Error fetching event views from Firestore:", err);
  }
  return viewsMap;
}

async function incrementEventView(eventId: string): Promise<number> {
  const docRef = doc(db, "event_views", eventId);
  try {
    let newCount = 1;
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(docRef);
      if (sfDoc.exists()) {
        const currentCount = sfDoc.data().count || 0;
        newCount = currentCount + 1;
        transaction.update(docRef, { count: newCount });
      } else {
        transaction.set(docRef, { eventId, count: 1 });
      }
    });
    return newCount;
  } catch (err) {
    console.error(`Error incrementing event view for ${eventId}, trying fallback:`, err);
    try {
      const docSnap = await getDoc(docRef);
      const count = docSnap.exists() ? (docSnap.data().count || 0) + 1 : 1;
      await setDoc(docRef, { eventId, count }, { merge: true });
      return count;
    } catch (fallbackErr) {
      console.error("Fallback setting view also failed:", fallbackErr);
      return 1;
    }
  }
}

// API Endpoints
app.get("/api/registrations", async (req, res) => {
  const list = await getRegistrations();
  res.json(list);
});

app.post("/api/registrations", async (req, res) => {
  const { firstName, lastName, instagram, whatsapp, eventIds, seeksAccommodation, accommodationNote } = req.body;
  
  if (!firstName || !lastName || !eventIds || !Array.isArray(eventIds)) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newReg: Registration = {
    id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    firstName,
    lastName,
    instagram,
    whatsapp,
    eventIds,
    seeksAccommodation: !!seeksAccommodation,
    accommodationNote,
    createdAt: Date.now(),
  };

  try {
    const cleanedReg = cleanFirestoreData(newReg) as Registration;
    await setDoc(doc(db, "registrations", newReg.id), cleanedReg);
    res.status(201).json(cleanedReg);
  } catch (err) {
    console.error("Error setting doc in firestore:", err);
    res.status(500).json({ error: "Errore nel salvataggio della registrazione nel database cloud" });
  }
});

app.delete("/api/registrations/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteDoc(doc(db, "registrations", id));
    res.json({ success: true, message: "Registration deleted successfully" });
  } catch (err) {
    console.error("Error deleting doc from firestore:", err);
    res.status(500).json({ error: "Errore nella cancellazione dal database cloud" });
  }
});

async function sendSuggestionEmail(suggestion: Suggestion) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);

  if (!smtpUser || !smtpPass) {
    console.warn(
      `[EMAIL NOTICE] SMTP_USER or SMTP_PASS non definiti negli environment secrets. Suggerimento memorizzato localmente, ma non è stato possibile inviare l'email a clubbingmembersonly@gmail.com: Title="${suggestion.title}", Date="${suggestion.date}"`
    );
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailOptions = {
      from: `"Clubbing Members Only" <${smtpUser}>`,
      to: "clubbingmembersonly@gmail.com",
      subject: `Nuovo Suggerimento Evento: ${suggestion.title}`,
      text: `Ciao,\n\nÈ stato inserito un nuovo suggerimento di evento sulla piattaforma:\n\nTitolo Evento: ${suggestion.title}\nData: ${suggestion.date}\nInserito il: ${new Date(suggestion.createdAt).toLocaleString("it-IT")}\n\nSaluti,\nClubbing Members Only Team`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0;">
          <h2 style="color: #f43f5e; font-size: 20px; border-bottom: 2px solid #fda4af; padding-bottom: 8px; margin-top: 0;">Nuovo Suggerimento Evento!</h2>
          <p style="font-size: 14px; line-height: 1.6;">Ciao,</p>
          <p style="font-size: 14px; line-height: 1.6;">È stato inserito un nuovo suggerimento di evento sulla piattaforma <strong>Clubbing Members Only</strong>:</p>
          <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border-left: 4px solid #f43f5e; margin: 15px 0; border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Titolo Evento:</strong> ${suggestion.title}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Data:</strong> ${suggestion.date}</p>
            <p style="margin: 0; font-size: 12px; color: #64748b;"><strong>Inserito il:</strong> ${new Date(suggestion.createdAt).toLocaleString("it-IT")}</p>
          </div>
          <p style="font-size: 12px; color: #64748b; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-bottom: 0;">Questa è una notifica automatica generata dal sistema.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SUCCESS] Email inviata con successo a clubbingmembersonly@gmail.com. Message ID: ${info.messageId}`);
  } catch (err) {
    console.error("[EMAIL ERROR] Impossibile inviare l'email con nodemailer:", err);
  }
}

app.get("/api/suggestions", async (req, res) => {
  const list = await getSuggestions();
  res.json(list);
});

app.post("/api/suggestions", async (req, res) => {
  const { title, date } = req.body;

  if (!title || !date) {
    return res.status(400).json({ error: "Tiolo e data sono obbligatori" });
  }

  if (title.length > 100) {
    return res.status(400).json({ error: "Il titolo deve contenere al massimo 100 caratteri." });
  }

  const newSuggestion: Suggestion = {
    id: `sug-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: title.trim(),
    date,
    createdAt: Date.now(),
  };

  try {
    const cleanedSug = cleanFirestoreData(newSuggestion) as Suggestion;
    await setDoc(doc(db, "suggestions", newSuggestion.id), cleanedSug);
    await sendSuggestionEmail(newSuggestion);
    res.status(201).json(cleanedSug);
  } catch (err) {
    console.error("Error setting dynamic suggestion in firestore:", err);
    res.status(500).json({ error: "Errore nel salvataggio del suggerimento nel database cloud" });
  }
});

// Event Views endpoints for global click tracking
app.get("/api/views", async (req, res) => {
  const viewsMap = await getEventViews();
  res.json(viewsMap);
});

app.post("/api/views/:eventId", async (req, res) => {
  const { eventId } = req.params;
  if (!eventId) {
    return res.status(400).json({ error: "eventId is required" });
  }
  const count = await incrementEventView(eventId);
  res.json(count);
});

// Configure Vite integration
async function main() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Serving in Development Mode (Vite Middleware)...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving in Production Mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

// If we are on VERCEL, we do NOT start listening on port 3000 asynchronously.
// Instead, Vercel loads and executes our exported 'app' serverlessly.
if (!process.env.VERCEL) {
  main().catch((err) => {
    console.error("Failed to start server:", err);
  });
}

export default app;
