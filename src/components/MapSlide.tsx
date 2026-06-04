import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Info, 
  Star, 
  Globe,
  Map as MapIcon,
  Users,
} from 'lucide-react';
import { MusicalEvent, EventRegistration } from '../types';

interface MapSlideProps {
  events: MusicalEvent[];
  onSelectEvent: (eventId: string) => void;
  theme?: string;
  registrations?: EventRegistration[];
}

export const MapSlide: React.FC<MapSlideProps> = ({
  events,
  onSelectEvent,
  theme,
  registrations = [],
}) => {
  const [hoveredEvent, setHoveredEvent] = useState<MusicalEvent | null>(null);
  const [activeCategory, setActiveCategory] = useState<'ITALIA' | 'ESTERO'>('ITALIA');

  // Filter events based on isInternational field
  const filteredEventsForMap = events.filter(ev => 
    activeCategory === 'ITALIA' ? !ev.isInternational : !!ev.isInternational
  );

  const getCountdownText = (timestamp: number) => {
    const diff = timestamp - Date.now();
    if (diff <= 0) {
      return 'LIVE';
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `-${days}g ${hours}h`;
  };

  const [activeEvent, setActiveEvent] = useState<MusicalEvent>(() => {
    return filteredEventsForMap.find(ev => ev.id === 'no-art-puglia') || filteredEventsForMap[0];
  });

  // Keep activeEvent in sync when category switches
  useEffect(() => {
    if (filteredEventsForMap.length > 0) {
      const exists = filteredEventsForMap.find(ev => ev.id === activeEvent?.id);
      if (!exists) {
        setActiveEvent(filteredEventsForMap[0]);
      }
    }
  }, [activeCategory, events]);

  const [zoomLevel, setZoomLevel] = useState<number>(3); // 1-5 simulated zoom level

  const isLight = theme === 'light';

  // Specific highly-optimized Google Maps query mapper for 1:1 local town pinning
  const getGoogleMapsQuery = (event: MusicalEvent) => {
    if (!event) return '';
    switch (event.id) {
      case 'no-art-puglia':
        return 'Parco Archeologico di Egnazia, Fasano, Brindisi, Puglia, Italy';
      case 'badawi-puglia':
        return 'Fasano, Brindisi, Puglia, Italy';
      case 'viva-festival':
        return 'Locorotondo, Bari, Puglia, Italy';
      case 'crx-festival':
        return 'Grottaglie, Taranto, Puglia, Italy';
      case 'circoloco-grottella':
        return 'Masseria Grottella, Grottaglie, Taranto, Puglia, Italy';
      case 'masseria-wave':
        return 'Lequile, Lecce, Puglia, Italy';
      case 'iperibleo':
        return 'Palazzolo Acreide, Siracusa, Sicilia, Italy';
      case 'opera-festival':
        return 'Milo, Catania, Sicilia, Italy';
      case 'zamna-sardinia':
        return 'Baja Sardinia, Sassari, Sardegna, Italy';
      case 'selectors-croatia':
        return 'The Garden Tisno, Tisno, Croatia';
      case 'butik-slovenia':
        return 'Tolmin, Slovenia';
      case 'waking-life':
        return 'Crato, Alentejo, Portugal';
      case 'dekmantel-amsterdam':
        return 'Amsterdamse Bos, Amstelveen, Netherlands';
      default:
        return `${event.venue}, ${event.location}`;
    }
  };

  const handleSelectLocalEvent = (ev: MusicalEvent) => {
    setActiveEvent(ev);
  };

  return (
    <div id="slide-map" className={`relative w-full flex flex-col p-4 font-sans ${
      isLight ? 'text-slate-900 bg-white' : 'text-white bg-[#070b13]'
    }`}>
      
      {/* Design accents (hidden on smaller screens to maximize space) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none hidden md:block">
        <div className={`absolute top-8 bottom-8 left-8 right-8 border ${isLight ? 'border-black/5' : 'border-white/5'}`} />
      </div>

      {/* Top Slide Indicator */}
      <div className="w-full flex justify-between items-center border-b pb-2 mb-4 shrink-0 transition-colors duration-200 border-slate-200/50 md:border-transparent">
        <div className="font-mono text-[10px] tracking-widest text-[#f43f5e] uppercase font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e]" />
          <span>03 // MAPPA LOCATION</span>
        </div>
        <div className={`font-mono text-[9px] tracking-widest uppercase ${isLight ? 'text-black/40' : 'text-white/40'}`}>
          SATELLITE POSITION 1:1
        </div>
      </div>

      {/* Slide Title & Description */}
      <div className="z-10 shrink-0 mb-4">
        <h2 className={`font-display font-black text-2xl md:text-3xl uppercase tracking-tight ${
          isLight ? 'text-slate-800' : 'text-white'
        }`}>
          MAPPA
        </h2>
        <p className={`font-sans font-normal text-xs md:text-sm max-w-xl mt-1.5 leading-relaxed ${
          isLight ? 'text-slate-600' : 'text-white/70'
        }`}>
          Trova club e festival estivi in base alla geolocalizzazione dei diversi contesti musicali italiani e internazionali.
        </p>
      </div>

      {/* GEOGRAPHIC SELECTION BOXES (Italia vs Estero) */}
      <div className="grid grid-cols-2 gap-2 mb-4 z-10 shrink-0">
        <button
          type="button"
          onClick={() => setActiveCategory('ITALIA')}
          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
            activeCategory === 'ITALIA'
              ? 'bg-[#f43f5e]/15 border-[#f43f5e] text-[#f43f5e] font-bold shadow-md shadow-[#f43f5e]/10'
              : (isLight ? 'bg-slate-150 border-slate-200 text-slate-500 hover:text-slate-800' : 'bg-slate-900/40 border-white/5 text-white/50 hover:text-white')
          }`}
        >
          <MapIcon className="w-4 h-4 text-[#f43f5e]" />
          <span className="font-mono text-[10px] uppercase tracking-wider">ITALIA</span>
          <span className="text-[8.5px] font-mono opacity-60">
            {events.filter(e => !e.isInternational).length} Eventi
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('ESTERO')}
          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
            activeCategory === 'ESTERO'
              ? 'bg-[#f43f5e]/15 border-[#f43f5e] text-[#f43f5e] font-bold shadow-md shadow-[#f43f5e]/10'
              : (isLight ? 'bg-slate-150 border-slate-200 text-slate-500 hover:text-slate-800' : 'bg-slate-900/40 border-white/5 text-white/50 hover:text-white')
          }`}
        >
          <Globe className="w-4 h-4 text-sky-400" />
          <span className="font-mono text-[10px] uppercase tracking-wider">ESTERO</span>
          <span className="text-[8.5px] font-mono opacity-60">
            {events.filter(e => !!e.isInternational).length} Eventi
          </span>
        </button>
      </div>

      {/* Main Flow Content */}
      <div className="z-10 flex flex-col gap-4 w-full">
        
        {/* Events flow list */}
        <div className="flex flex-col space-y-3">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border self-start ${
            isLight ? 'bg-black/5 border-black/10 text-slate-800' : 'bg-white/5 border-white/10 text-white/70'
          }`}>
            <Compass className="w-3 h-3 text-[#f43f5e]" />
            <span className="font-mono text-[9px] tracking-wider font-bold uppercase">
              GEOLOCALIZZAZIONE ATTIVA ({activeCategory === 'ITALIA' ? 'ITALIA' : 'ESTERO'})
            </span>
          </div>

          {/* Vertical flowing list of event locations - Scroll is vertical via parent viewport as requested */}
          <div className="space-y-1.5">
            {filteredEventsForMap.length === 0 ? (
              <div className="p-4 text-center font-mono text-[9.5px] text-white/30 italic">
                Nessun evento registrato in questa categoria.
              </div>
            ) : (
              filteredEventsForMap.map((event) => {
                const isSelected = activeEvent?.id === event.id;
                const isHovered = hoveredEvent?.id === event.id;

                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => handleSelectLocalEvent(event)}
                    onMouseEnter={() => setHoveredEvent(event)}
                    onMouseLeave={() => setHoveredEvent(null)}
                    className={`w-full text-left p-2.5 rounded-xl border text-[11px] font-sans transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? (isLight 
                            ? 'bg-gradient-to-r from-[#f43f5e]/15 to-[#f43f5e]/5 border-[#f43f5e] translate-x-1 font-semibold' 
                            : 'bg-[#f43f5e]/15 border-[#f43f5e] translate-x-1 font-semibold')
                        : isHovered
                        ? (isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-white/20')
                        : (isLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm' : 'bg-[#121824]/50 border-white/5 hover:border-white/10')
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      <div className="min-w-0">
                        <div className={`font-bold uppercase flex items-center gap-1 truncate text-[10.5px] ${isLight ? 'text-slate-800' : 'text-white'}`}>
                          <span>{event.name}</span>
                          {event.isFavorite && (
                            <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500 shrink-0" />
                          )}
                        </div>
                        <div className={`text-[9px] font-mono truncate ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                          {event.venue} &bull; {event.location}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span 
                        className="font-mono text-[8px] font-bold bg-[#f43f5e]/10 text-[#f43f5e] px-1.5 py-0.5 rounded-full border border-[#f43f5e]/15 shrink-0 flex items-center gap-0.5"
                        title={`${registrations.filter(r => r.eventIds.includes(event.id)).length} registrati`}
                      >
                        <Users className="w-2.5 h-2.5" />
                        <span>{registrations.filter(r => r.eventIds.includes(event.id)).length}</span>
                      </span>
                      <Navigation className="w-3 h-3 text-[#f43f5e] shrink-0" />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className={`pt-2 border-t font-mono text-[9px] flex items-center gap-2 ${
            isLight ? 'text-slate-500 border-slate-200' : 'text-white/40 border-white/5'
          }`}>
            <Info className="w-3 h-3 text-[#f43f5e] shrink-0" />
            <span>Seleziona un evento per vederlo sulla mappa satellitare in tempo reale.</span>
          </div>
        </div>

        {/* Clean satellite view container - ALWAYS placed at the bottom */}
        {activeEvent && (
          <div className="relative h-[220px] w-full flex flex-col justify-between bg-[#0b0f19] rounded-2xl border border-white/10 overflow-hidden shrink-0 mt-1">
            
            {/* Dynamic Map Satellite View Canvas / Google Maps Iframe Rendering */}
            <div className="flex-grow flex-1 relative w-full h-full overflow-hidden flex items-center justify-center bg-[#070b13]">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(getGoogleMapsQuery(activeEvent))}&t=k&z=${12 + zoomLevel}&ie=UTF8&iwloc=&output=embed`}
                className="absolute inset-0 w-full h-full border-0 rounded-2xl z-10 opacity-90"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer"
                title={`Google Map Satellite for ${activeEvent.name}`}
              />
            </div>

            {/* Coordinates overlay stats footer */}
            <div className="h-9 bg-[#0f1424] border-t border-white/10 px-4 flex items-center justify-between z-40 text-white/50 font-mono text-[8px] shrink-0">
              <div>GOOGLE SATELLITE RADAR • REAL-TIME MAPPING</div>
              <div className="uppercase">PIN POINTED AT {activeEvent.location.split(',')[0]}</div>
            </div>

          </div>
        )}

      </div>

      {/* Slide footer summary */}
      <div className={`font-mono text-[9px] tracking-wider flex flex-wrap justify-between items-center gap-3 z-10 border-t pt-3 mt-4 shrink-0 ${
        isLight ? 'text-slate-500 border-slate-200' : 'text-white/40 border-white/5'
      }`}>
        <div>VISUALIZZAZIONE SATELLITARE INTEGRATA</div>
        <div className="flex gap-2.5 items-center">
          <span className="flex items-center gap-1"><MapIcon className="w-3 h-3 text-[#f43f5e]" /> Global Map</span>
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
          <span>Coordinate Scalate 1:1</span>
        </div>
      </div>
    </div>
  );
};
