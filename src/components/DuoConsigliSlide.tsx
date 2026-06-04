import React, { useState } from 'react';
import { 
  Sparkles, 
  Star, 
  ThumbsUp, 
  Instagram, 
  ArrowUpRight, 
  Car, 
  Home as HomeIcon, 
  Ticket, 
  Users 
} from 'lucide-react';

interface RecommendedEvent {
  id: string;
  name: string;
  venue: string;
  location: string;
  date: string;
  instagram: string;
  comment: string;
  vibeTag: string;
  badge: string;
}

interface DuoConsigliSlideProps {
  theme?: string;
  onSelectEvent: (eventId: string) => void;
}

export const DuoConsigliSlide: React.FC<DuoConsigliSlideProps> = ({
  theme,
  onSelectEvent,
}) => {
  const isLight = theme === 'light';

  // Budget calculations states
  const [travelers, setTravelers] = useState<number>(2);
  const [attendNoArt, setAttendNoArt] = useState<boolean>(true);
  const [attendWave, setAttendWave] = useState<boolean>(true);
  const [attendCRX, setAttendCRX] = useState<boolean>(true);

  // Constants
  const NO_ART_PRICE = 50;
  const WAVE_PRICE = 10;
  const CRX_TICKET_PRICE = 58; // €58 il biglietto

  const NO_ART_LODGING_PRICE = 90;
  const WAVE_LODGING_PRICE = 65;
  const CRX_LODGING_PRICE = 70; // €70 l'alloggio

  const AUTO_FUEL_ROME = 110;
  const AUTO_TOLL_ROME = 80;
  const TOTAL_ROME_TRAVEL_COST = AUTO_FUEL_ROME + AUTO_TOLL_ROME; // €190 total

  // Calculated totals
  const totalTickets = 
    (attendNoArt ? NO_ART_PRICE : 0) + 
    (attendWave ? WAVE_PRICE : 0) + 
    (attendCRX ? CRX_TICKET_PRICE : 0);

  const totalLodging = 
    (attendNoArt ? NO_ART_LODGING_PRICE : 0) + 
    (attendWave ? WAVE_LODGING_PRICE : 0) +
    (attendCRX ? CRX_LODGING_PRICE : 0);

  const individualCarCost = Math.round(TOTAL_ROME_TRAVEL_COST / travelers);
  const totalCombinedCostValue = totalTickets + totalLodging + individualCarCost;

  const recommendations: RecommendedEvent[] = [
    {
      id: 'no-art-puglia',
      name: 'No Art Puglia Showcase',
      venue: 'Parco Archeologico di Egnazia',
      location: 'Fasano (Brindisi)',
      date: '01 Agosto 2026',
      instagram: 'https://www.instagram.com/noartmusic/',
      comment: 'L\'evento dell\'estate: un portale millenario incontra il sound olandese più acclamato al mondo. Alloggio consigliato: Masseria Fragnale.',
      vibeTag: 'Unico & Imboccatissimo',
      badge: 'TOP CHOICE'
    },
    {
      id: 'masseria-wave',
      name: 'MASSERIA WAVE',
      venue: 'Masseria Lequile',
      location: 'Lequile (Lecce)',
      date: '06 Agosto 2026',
      instagram: 'https://www.instagram.com/presents_severino/',
      comment: 'Il pool party ideale gratuito fino a mezzanotte. Sonorità house e disco cariche di Good Vibes, eccellente per aprire il weekend caldissimo d\'agosto.',
      vibeTag: 'Pool Party & Free Entry',
      badge: 'VIBE MASTER'
    },
    {
      id: 'crx-festival',
      name: 'CRX Fest & Bus Shuttle',
      venue: 'Masseria Grottaglie',
      location: 'Grottaglie',
      date: '07 & 08 Agosto 2026',
      instagram: 'https://www.instagram.com/crx.festival/',
      comment: 'Masseria rurale con alloggio abbinata a bus navetta continuo per la consolle, logistica super comoda senza alcuno stress stradale!',
      vibeTag: 'Comodità & Bus Navetta',
      badge: 'LOGISTIC KING'
    }
  ];

  return (
    <div id="slide-duo-consigli" className={`relative w-full p-4 font-sans ${
      isLight ? 'text-slate-900 bg-white' : 'text-white bg-[#070b13]'
    }`}>
      
      {/* Design accents (hidden on mobile) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none hidden md:block">
        <div className={`absolute top-8 bottom-8 left-8 right-8 border ${isLight ? 'border-black/5' : 'border-white/5'}`} />
      </div>

      {/* Top Slide Indicator (Flow-based to avoid overlap) */}
      <div className="w-full flex justify-between items-center border-b pb-2 mb-4 shrink-0 transition-colors duration-200 border-slate-200/50 md:border-transparent">
        <div className="font-mono text-[10px] tracking-widest text-[#f43f5e] uppercase font-bold flex items-center gap-1.5">
          <ThumbsUp className="w-3.5 h-3.5 text-[#f43f5e]" />
          <span>★ COSA SUGGERIAMO ★</span>
        </div>
        <div className={`font-mono text-[9px] tracking-widest uppercase ${isLight ? 'text-black/40' : 'text-white/40'}`}>
          MEMBERZ SELECTION
        </div>
      </div>

      {/* Main Title Section */}
      <div className="z-10 shrink-0 mb-4">
        <h2 className={`font-display font-black text-xl md:text-3xl uppercase tracking-tight flex items-center gap-2 ${
          isLight ? 'text-slate-800' : 'text-white'
        }`}>
          COSA SUGGERIAMO
          <Sparkles className="w-4 h-4 text-yellow-500 fill-yellow-500 animate-pulse shrink-0" />
        </h2>
        <p className={`font-sans font-normal text-[11px] md:text-sm max-w-2xl mt-1 leading-relaxed ${
          isLight ? 'text-slate-600' : 'text-white/70'
        }`}>
          Abbiamo selezionato la triade dorata per l'estate pugliese più calda. I migliori per atmosfera, direzione artistica, stile e organizzazione sul territorio.
        </p>
      </div>

      {/* Recommended Cards vertical list */}
      <div className="space-y-4 z-10 w-full mb-6">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${
              isLight
                ? 'bg-slate-50 border-slate-200 hover:border-[#f43f5e] shadow-sm'
                : 'bg-slate-950/40 border-white/5 hover:border-[#f43f5e]'
            }`}
          >
            {/* Top Badge Overlay */}
            <div className="absolute top-0 right-0">
              <span className="font-mono text-[8px] font-bold px-2 py-0.5 bg-[#f43f5e] text-white rounded-bl-lg tracking-wider uppercase">
                {rec.badge}
              </span>
            </div>

            <div className="space-y-2">
              <div className="font-mono text-[9px] text-[#f43f5e] font-bold">{rec.date}</div>
              
              <h3 className={`font-display font-bold text-xs md:text-sm tracking-tight uppercase ${
                isLight ? 'text-slate-900 group-hover:text-[#f43f5e]' : 'text-white group-hover:text-glow'
              }`}>
                {rec.name}
              </h3>

              <div className={`text-[10px] font-mono leading-none ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                <span>{rec.venue} &bull; {rec.location}</span>
              </div>

              <blockquote className={`text-[11px] font-sans italic leading-relaxed border-l-2 border-[#f43f5e] pl-2 py-0.5 ${
                isLight ? 'text-slate-600' : 'text-white/80'
              }`}>
                "{rec.comment}"
              </blockquote>
            </div>

            {/* Bottom Actions layout */}
            <div className="mt-4 pt-3 border-t border-dashed border-slate-200/50 flex items-center justify-between gap-2 flex-wrap">
              {/* Vibe tag label */}
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                isLight ? 'bg-amber-100 text-amber-800' : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                {rec.vibeTag}
              </span>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Jump to specific event slide inside applet */}
                <button
                  type="button"
                  onClick={() => onSelectEvent(rec.id)}
                  className={`text-[9.5px] font-mono px-2.5 py-1 rounded transition-colors border cursor-pointer ${
                    isLight 
                      ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800' 
                      : 'bg-slate-900 hover:bg-slate-800 border-white/10 text-white'
                  }`}
                  title="Apri slide dettagliata"
                >
                  SLIDE
                </button>

                {/* Real external Instagram Link */}
                <a
                  href={rec.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className="p-1 px-2.5 rounded-md bg-gradient-to-r from-purple-600 via-[#f43f5e] to-orange-500 hover:brightness-110 text-white flex items-center gap-1 text-[9px] font-mono transition-transform duration-200 active:scale-95 font-bold"
                  title="Visita il profilo Instagram ufficiale"
                >
                  <Instagram className="w-3.5 h-3.5 shrink-0" />
                  <span>IG LINK</span>
                  <ArrowUpRight className="w-2.5 h-2.5 shrink-0" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* COST CALCULATOR SECTION */}
      <div className={`p-4 rounded-xl border mt-6 z-10 relative transition-all duration-350 ${
        isLight 
          ? 'bg-slate-50 border-slate-200 shadow-sm' 
          : 'bg-gradient-to-b from-[#0e1424] to-[#0a0d18] border-white/10'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-[#f43f5e]/15 flex items-center justify-center">
            <Car className="w-4 h-4 text-[#f43f5e]" />
          </div>
          <div>
            <h3 className={`font-display font-extrabold text-sm uppercase tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              Stima delle Spese da Roma
            </h3>
            <p className={`font-mono text-[9px] mt-0.5 uppercase ${isLight ? 'text-slate-500' : 'text-[#f43f5e]'}`}>
              Calcolo interattivo budget estate pugliese
            </p>
          </div>
        </div>

        <p className={`font-sans text-[11px] mb-4.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/70'}`}>
          Ottimizza e stima il budget personale selezionando gli eventi che vuoi frequentare d'estate e indicando in quanti condividete l'auto con partenza da <strong>Roma</strong>.
        </p>

        {/* Dynamic Controls Grid */}
        <div className="space-y-3.5 mt-4 border-t border-b border-white/5 py-4 mb-4">
          
          {/* Traveler Selectors */}
          <div className="flex items-center justify-between gap-2.5 flex-wrap">
            <span className={`font-mono text-[10px] uppercase font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
              <Users className="w-3.5 h-3.5 text-[#f43f5e]" />
              <span>Numero di Persone:</span>
            </span>
            
            <div className="flex bg-slate-900/60 p-0.5 rounded-lg border border-white/5 items-center">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTravelers(num)}
                  className={`w-7 h-7 font-mono text-xs rounded transition-all flex items-center justify-center font-bold cursor-pointer ${
                    travelers === num
                      ? 'bg-[#f43f5e] text-white shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Event Attending toggles list */}
          <div className="space-y-2 mt-4 pt-2 border-t border-white/5">
            <span className={`font-mono text-[9px] uppercase tracking-wider block opacity-50 ${isLight ? 'text-black' : 'text-white'}`}>
              Seleziona Eventi per Calcolare Dettagli:
            </span>

            {/* No Art selector */}
            <label className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
              attendNoArt 
                ? (isLight ? 'bg-rose-50/20 border-[#f43f5e]' : 'bg-[#f43f5e]/10 border-[#f43f5e]/80') 
                : (isLight ? 'bg-slate-100/50 border-slate-200' : 'bg-slate-950/20 border-white/5')
            }`}>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={attendNoArt}
                  onChange={(e) => setAttendNoArt(e.target.checked)}
                  className="rounded border-[#f43f5e] text-[#f43f5e] focus:ring-[#f43f5e] accent-[#f43f5e]"
                />
                <span className={`font-sans text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                  No Art Showcase
                </span>
              </div>
              <div className="text-right">
                <div className={`font-mono text-[10px] uppercase font-bold text-emerald-400`}>
                  +€{NO_ART_PRICE} tkt &bull; +€{NO_ART_LODGING_PRICE} allogg.
                </div>
              </div>
            </label>

            {/* Masseria Wave selector */}
            <label className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
              attendWave 
                ? (isLight ? 'bg-rose-50/20 border-[#f43f5e]' : 'bg-[#f43f5e]/10 border-[#f43f5e]/80') 
                : (isLight ? 'bg-slate-100/50 border-slate-200' : 'bg-slate-950/20 border-white/5')
            }`}>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={attendWave}
                  onChange={(e) => setAttendWave(e.target.checked)}
                  className="rounded border-[#f43f5e] text-[#f43f5e] focus:ring-[#f43f5e] accent-[#f43f5e]"
                />
                <span className={`font-sans text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                  Masseria Wave Party
                </span>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase font-bold text-emerald-400">
                  +€{WAVE_PRICE} tkt &bull; +€{WAVE_LODGING_PRICE} allogg.
                </div>
              </div>
            </label>

            {/* CRX Festival selector with Lodging included statement */}
            <label className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
              attendCRX 
                ? (isLight ? 'bg-rose-50/20 border-[#f43f5e]' : 'bg-[#f43f5e]/10 border-[#f43f5e]/80') 
                : (isLight ? 'bg-slate-100/50 border-slate-200' : 'bg-slate-950/20 border-white/5')
            }`}>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={attendCRX}
                  onChange={(e) => setAttendCRX(e.target.checked)}
                  className="rounded border-[#f43f5e] text-[#f43f5e] focus:ring-[#f43f5e] accent-[#f43f5e]"
                />
                <div className="text-left">
                  <span className={`font-sans text-xs font-semibold block ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    CRX Festival Combo
                  </span>
                  <span className="font-mono text-[8.5px] block text-[#f43f5e]">Ticket €58 + Alloggio €70</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase font-bold text-emerald-400">
                  +€{CRX_TICKET_PRICE} tkt &bull; +€{CRX_LODGING_PRICE} allogg.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Budget Breakdown Summary */}
        <div className="space-y-2 mb-4 bg-slate-900/40 p-3 rounded-lg border border-white/5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono text-white/50 flex items-center gap-1">
              <Ticket className="w-3.5 h-3.5 text-[#f43f5e]" />
              Biglietti:
            </span>
            <span className="font-mono font-bold text-white">€{totalTickets}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="font-mono text-white/50 flex items-center gap-1">
              <HomeIcon className="w-3.5 h-3.5 text-[#f43f5e]" />
              Alloggi Stimati:
            </span>
            <span className="font-mono font-bold text-white">
              €{totalLodging}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="font-mono text-white/50 flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-[#f43f5e]" />
              Spese Auto (da Roma):
            </span>
            <span className="font-mono font-bold text-white">
              €{individualCarCost} <span className="text-[9px] text-[#f43f5e]">({travelers} pers. &bull; tot. €{TOTAL_ROME_TRAVEL_COST})</span>
            </span>
          </div>
          
          <div className="text-[9.5px] font-mono border-t border-white/5 pt-2 text-white/40 leading-snug">
            <span>Formula calcolo Auto: Benzina (110€) + Autostrada (80€) diviso {travelers} passeggeri.</span>
          </div>
        </div>

        {/* Massive Final Total Card Indicator */}
        <div className="bg-[#f43f5e] p-3.5 rounded-xl flex items-center justify-between text-white shadow-lg shadow-[#f43f5e]/10">
          <div className="text-left font-mono">
            <span className="text-[9.5px] uppercase tracking-wider block font-bold leading-none">STIMA TOTALE PERSONALE</span>
            <span className="text-[8px] opacity-80 block tracking-tight leading-none mt-1">Include ticket, auto da Roma & alloggio</span>
          </div>
          <div className="text-right">
            <span className="font-display font-black text-2xl tracking-tighter block">
              €{totalCombinedCostValue}
            </span>
          </div>
        </div>
      </div>

      {/* Slide footer summary */}
      <div className={`font-mono text-[9px] tracking-wider flex flex-wrap justify-between items-center gap-3 z-10 border-t pt-3 mt-4 shrink-0 ${
        isLight ? 'text-slate-600 border-slate-200' : 'text-white/40 border-white/5'
      }`}>
        <div>COSA SUGGERIAMO • BUDGET GENERATORE</div>
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500 fill-current" /> Best in Puglia</span>
        </div>
      </div>
    </div>
  );
};
