import express from "express";
import path from "path";
import fs from "fs";

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

// In-memory cache synced with disk
let registrations: Registration[] = loadJSON<Registration>(REGISTRATIONS_FILE, []);
let suggestions: Suggestion[] = loadJSON<Suggestion>(SUGGESTIONS_FILE, []);

// KVDB.io Endpoint using the unique App ID for zero-config global cloud synchronization
const KVDB_BASE = "https://kvdb.io/36b8f192-2012-4d22-b417-cdf6c475e3aa";

async function getRegistrations(): Promise<Registration[]> {
  // If we are on Vercel or running on serverless, or local memory is uninitialized,
  // we eagerly sync with the secure cloud key-value store to retrieve other instances' writes.
  if (process.env.VERCEL || registrations.length === 0) {
    try {
      const res = await fetch(`${KVDB_BASE}/registrations`);
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim() !== "") {
          const cloudRegs = JSON.parse(text);
          if (Array.isArray(cloudRegs)) {
            registrations = cloudRegs;
            // Backup locally
            saveJSON(REGISTRATIONS_FILE, registrations);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching registrations from cloud KV:", err);
    }
  }
  return registrations;
}

async function getSuggestions(): Promise<Suggestion[]> {
  if (process.env.VERCEL || suggestions.length === 0) {
    try {
      const res = await fetch(`${KVDB_BASE}/suggestions`);
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim() !== "") {
          const cloudSugs = JSON.parse(text);
          if (Array.isArray(cloudSugs)) {
            suggestions = cloudSugs;
            // Backup locally
            saveJSON(SUGGESTIONS_FILE, suggestions);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching suggestions from cloud KV:", err);
    }
  }
  return suggestions;
}

async function persistRegistrations(list: Registration[]) {
  saveJSON(REGISTRATIONS_FILE, list);
  try {
    await fetch(`${KVDB_BASE}/registrations`, {
      method: "POST",
      body: JSON.stringify(list),
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Failed to sync registrations to Cloud KV store:", err);
  }
}

async function persistSuggestions(list: Suggestion[]) {
  saveJSON(SUGGESTIONS_FILE, list);
  try {
    await fetch(`${KVDB_BASE}/suggestions`, {
      method: "POST",
      body: JSON.stringify(list),
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Failed to sync suggestions to Cloud KV store:", err);
  }
}

// API Endpoints
app.get("/api/registrations", async (req, res) => {
  const list = await getRegistrations();
  res.json(list);
});

app.post("/api/registrations", async (req, res) => {
  const { firstName, lastName, instagram, whatsapp, eventIds, seeksAccommodation, accommodationNote } = req.body;
  
  if (!firstName || !lastName || !whatsapp || !eventIds || !Array.isArray(eventIds)) {
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

  registrations.unshift(newReg);
  await persistRegistrations(registrations);
  res.status(201).json(newReg);
});

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

  suggestions.unshift(newSuggestion);
  await persistSuggestions(suggestions);
  res.status(201).json(newSuggestion);
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
