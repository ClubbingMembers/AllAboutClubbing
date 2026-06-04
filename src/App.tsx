import { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Settings, 
  Monitor, 
  Maximize2, 
  Edit3, 
  Eye, 
  Music, 
  MapPin, 
  Calendar, 
  HelpCircle,
  FileCheck2,
  RefreshCcw,
  Volume2,
  Home,
  Compass,
  Map,
  Sparkles,
  Users
} from 'lucide-react';
import { MusicalEvent, Slide, DeckConfig, EventRegistration } from './types';
import { INITIAL_EVENTS } from './initialEvents';
import { IntroductionSlide } from './components/IntroductionSlide';
import { TimelineSlide } from './components/TimelineSlide';
import { MapSlide } from './components/MapSlide';
import { EventDetailSlide } from './components/EventDetailSlide';
import { DuoConsigliSlide } from './components/DuoConsigliSlide';
import { PartecipaSlide } from './components/PartecipaSlide';
import { SettingsPanel } from './components/SettingsPanel';

// Import our custom generated high fidelity festival background image
// @ts-ignore
import bgImage from './assets/images/no_art_portal_1780053741314.png';

const DEFAULT_CONFIG: DeckConfig = {
  backgroundOpacity: 65, // Default 65% opacity as requested by user to easily read the text!
  isAutoPlay: false,
  autoPlayDuration: 5,
  backgroundBlur: 2,
  theme: 'dark',
};

export default function App() {
  // Try loading events and choices from localStorage to make editing persistent
  const [events, setEvents] = useState<MusicalEvent[]>(() => {
    try {
      const saved = localStorage.getItem('clubbing_events_data_v5');
      if (saved) {
        const parsed = JSON.parse(saved) as MusicalEvent[];
        // Sync preset event details (lineup, date, description, venue, location) directly from INITIAL_EVENTS presets
        const synced = parsed.map(pe => {
          const matchingPreset = INITIAL_EVENTS.find(ie => ie.id === pe.id);
          if (matchingPreset) {
            return {
              ...pe,
              name: matchingPreset.name,
              venue: matchingPreset.venue,
              location: matchingPreset.location,
              date: matchingPreset.date,
              timestamp: matchingPreset.timestamp,
              genre: matchingPreset.genre,
              lineup: matchingPreset.lineup,
              description: matchingPreset.description,
              isInternational: matchingPreset.isInternational,
              priceRange: matchingPreset.priceRange,
            };
          }
          return pe;
        });

        // Auto-merge any entirely missing events from INITIAL_EVENTS (e.g. Nextones, Selectors, Butik)
        const missing = INITIAL_EVENTS.filter(initEv => !synced.some(pe => pe.id === initEv.id));
        const merged = [...synced, ...missing];
        localStorage.setItem('clubbing_events_data_v5', JSON.stringify(merged));
        return merged;
      }
      return INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [config, setConfig] = useState<DeckConfig>(() => {
    try {
      const saved = localStorage.getItem('clubbing_deck_config_v2');
      if (saved) {
        const parsed = JSON.parse(saved) as DeckConfig;
        if (parsed.theme === 'light') {
          parsed.theme = 'dark'; // Force dark layout
        }
        return parsed;
      }
      return DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [activeTab, setActiveTab] = useState<'home' | 'timeline' | 'map' | 'duo-consigli' | 'partecipa'>('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const [registrations, setRegistrations] = useState<EventRegistration[]>(() => {
    try {
      const saved = localStorage.getItem('clubbing_registrations_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [suggestions, setSuggestions] = useState<{ id: string; title: string; date: string; createdAt: number; }[]>([]);

  // Periodically fetch fresh global registrations & suggestions from backend server API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const regRes = await fetch('/api/registrations');
        if (regRes.ok) {
          const regData = await regRes.json();
          setRegistrations(regData);
        }
      } catch (err) {
        console.error('Failed to load registrations from backend:', err);
      }

      try {
        const sugRes = await fetch('/api/suggestions');
        if (sugRes.ok) {
          const sugData = await sugRes.json();
          setSuggestions(sugData);
        }
      } catch (err) {
        console.error('Failed to load suggestions from backend:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 8000); // Poll every 8s for live real-time feel
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('clubbing_registrations_v2', JSON.stringify(registrations));
  }, [registrations]);

  const handleAddRegistration = async (newReg: EventRegistration) => {
    // Optimistic UI state update
    setRegistrations(prev => [newReg, ...prev]);
    triggerNotification(`Registrato con successo: ${newReg.firstName}!`);

    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReg),
      });
      if (res.ok) {
        const saved = await res.json();
        // Sync real server version
        setRegistrations(prev => prev.map(r => r.id === newReg.id ? saved : r));
      }
    } catch (err) {
      console.error('Error posting registration:', err);
    }
  };

  const handleAddSuggestion = async (title: string, date: string) => {
    const tempId = `tempSug-${Date.now()}`;
    const newSug = {
      id: tempId,
      title,
      date,
      createdAt: Date.now(),
    };

    // Optimistic UI state update
    setSuggestions(prev => [newSug, ...prev]);
    triggerNotification(`Suggerimento registrato!`);

    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, date }),
      });
      if (res.ok) {
        const saved = await res.json();
        // Replace temp item with saved db instance
        setSuggestions(prev => prev.map(s => s.id === tempId ? saved : s));
      }
    } catch (err) {
      console.error('Error posting suggestion:', err);
    }
  };

  // Sync edits to LocalStorage
  useEffect(() => {
    localStorage.setItem('clubbing_events_data_v5', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('clubbing_deck_config_v2', JSON.stringify(config));
  }, [config]);

  // Compute sorted events
  const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

  // Quick toast feedback helper
  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Keyboard navigation through active tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return; // Skip when typing in text fields
      }
      
      const tabs: ('home' | 'timeline' | 'map' | 'duo-consigli' | 'partecipa')[] = ['home', 'timeline', 'map', 'duo-consigli', 'partecipa'];
      
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          if (selectedEventId) {
            setSelectedEventId(null);
          } else {
            setActiveTab((prev) => {
              const idx = tabs.indexOf(prev);
              return tabs[(idx + 1) % tabs.length];
            });
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (selectedEventId) {
            setSelectedEventId(null);
          } else {
            setActiveTab((prev) => {
              const idx = tabs.indexOf(prev);
              return tabs[(idx - 1 + tabs.length) % tabs.length];
            });
          }
          break;
        case 'Escape':
          setIsFullscreen(false);
          setSelectedEventId(null);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEventId]);

  // Handle Event selections to set active event detail screen
  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    triggerNotification(`Aperto dettaglio evento`);
  };

  // Updates and data builders
  const handleUpdateEvent = (updated: MusicalEvent) => {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    triggerNotification(`Contenuto modificato per: ${updated.name}`);
  };

  const handleAddEvent = (newEvent: MusicalEvent) => {
    setEvents(prev => [...prev, newEvent]);
    triggerNotification(`Nuovo evento aggiunto: ${newEvent.name}`);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    if (selectedEventId === id) {
      setSelectedEventId(null);
    }
    triggerNotification("Evento eliminato correttamente.");
  };

  const handleResetEvents = () => {
    if (window.confirm("Sei sicuro di voler ripristinare alle impostazioni ed eventi di default?")) {
      setEvents(INITIAL_EVENTS);
      setRegistrations([]);
      setConfig(DEFAULT_CONFIG);
      setActiveTab('home');
      setSelectedEventId(null);
      triggerNotification("Contenuti ripristinati con successo.");
    }
  };

  const isLightMode = config.theme === 'light';

  return (
    <div id="deck-workspace" className={`h-screen w-screen flex flex-col md:flex-row overflow-hidden font-sans select-none relative transition-colors duration-300 ${
      isLightMode ? 'bg-slate-50 text-slate-900' : 'bg-[#070b13] text-white'
    }`}>
      
      {/* Toast Notification HUD */}
      {notification && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-950 border border-emerald-500/50 text-white px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2.5 animate-bounce font-mono text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Slide show arena */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        


        {/* Cinematic Presentation Desk Backing area */}
        <div className={`flex-grow flex items-center justify-center p-2 sm:p-5 transition-all duration-300 overflow-hidden ${
          isFullscreen ? 'p-0 bg-black' : 'bg-slate-900/40'
        }`}>
          
          {/* PowerPoint style locked smartphone view frame (full screen on physical mobile, simulated on desktop) */}
          <div
            id="ppt-slide-monitor"
            className={`w-full max-w-[375px] h-[680px] md:max-w-[375px] md:h-[680px] ring-8 ring-slate-950 rounded-[44px] border-[8px] border-slate-900 relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.8)] transition-all max-md:max-w-none max-md:h-full max-md:rounded-none max-md:border-none max-md:ring-0 ${
              config.theme === 'light' ? 'bg-slate-100 text-[#0f172a]' : 'bg-[#0f1524]'
            }`}
          >
            {/* The absolute user photo background component overlay with dynamic custom opacity for text legibility */}
            <div 
              className="absolute inset-0 transition-all duration-500 pointer-events-none"
              style={{
                opacity: config.backgroundOpacity / 100,
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: `blur(${config.backgroundBlur}px)`,
              }}
            />

            {/* Sfumatura scura per agevolare ulteriormente la lettura nei punti critici (Gradient veil overlay) */}
            <div className={`absolute inset-0 pointer-events-none z-10 ${
              config.theme === 'light' 
                ? 'bg-gradient-to-t from-white/95 via-white/70 to-white/80' 
                : 'bg-gradient-to-t from-slate-950/98 via-transparent to-slate-950/75'
            }`} />

            {/* Slide Component Renderer */}
            {/* Optimize safety container layout padding inside smartphone display scale */}
            <div className="absolute inset-0 flex flex-col h-full w-full pt-0">
              
              {/* Active content viewport */}
              <div className="flex-1 w-full relative overflow-y-auto pb-16">
                {selectedEventId ? (
                  (() => {
                    const ev = events.find(e => e.id === selectedEventId);
                    const idx = ev ? sortedEvents.findIndex(e => e.id === ev.id) : 0;
                    return ev ? (
                      <EventDetailSlide
                        event={ev}
                        slideNumber={idx + 4}
                        theme={config.theme}
                        onBack={() => setSelectedEventId(null)}
                        registrations={registrations}
                      />
                    ) : (
                      <div className="p-10 text-center font-mono text-xs text-rose-400">
                        Errore caricamento dati per questo evento.
                      </div>
                    );
                  })()
                ) : activeTab === 'home' ? (
                  <IntroductionSlide
                    title={"CLUBBING MEMBERS\nONLY"}
                    subtitle=""
                    eventCount={events.length}
                    registrationsCount={registrations.length}
                    theme={config.theme}
                  />
                ) : activeTab === 'timeline' ? (
                  <TimelineSlide 
                    events={events} 
                    onSelectEvent={handleSelectEvent} 
                    theme={config.theme}
                    registrations={registrations}
                  />
                ) : activeTab === 'map' ? (
                  <MapSlide 
                    events={events} 
                    onSelectEvent={handleSelectEvent} 
                    theme={config.theme}
                    registrations={registrations}
                  />
                ) : activeTab === 'duo-consigli' ? (
                  <DuoConsigliSlide
                    theme={config.theme}
                    onSelectEvent={handleSelectEvent}
                  />
                ) : activeTab === 'partecipa' ? (
                  <PartecipaSlide
                    events={events}
                    registrations={registrations}
                    onAddRegistration={handleAddRegistration}
                    suggestions={suggestions}
                    onAddSuggestion={handleAddSuggestion}
                    theme={config.theme}
                    onSelectEvent={handleSelectEvent}
                  />
                ) : null}
              </div>

              {/* Seamless Mobile Bottom Navigation Tab Bar */}
              <div className={`h-16 border-t flex items-center justify-around z-30 shrink-0 backdrop-blur-md px-2 ${
                isLightMode 
                  ? 'bg-white/95 border-slate-200 text-slate-800' 
                  : 'bg-[#090e18]/95 border-white/5 text-white'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('home');
                    setSelectedEventId(null);
                  }}
                  className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all hover:scale-105 cursor-pointer ${
                    activeTab === 'home'
                      ? 'text-[#f43f5e] font-bold'
                      : (isLightMode ? 'text-slate-500 hover:text-slate-800' : 'text-white/50 hover:text-white')
                  }`}
                >
                  <Home className="w-5 h-5 text-[#f43f5e]" />
                  <span className="font-mono text-[8px] uppercase tracking-wider">HOME</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('timeline');
                    setSelectedEventId(null);
                  }}
                  className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all hover:scale-105 cursor-pointer ${
                    activeTab === 'timeline'
                      ? 'text-[#f43f5e] font-bold'
                      : (isLightMode ? 'text-slate-500 hover:text-slate-800' : 'text-white/50 hover:text-white')
                  }`}
                >
                  <Calendar className="w-5 h-5 text-emerald-500" />
                  <span className="font-mono text-[8px] uppercase tracking-wider">EVENTI</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('map');
                    setSelectedEventId(null);
                  }}
                  className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all hover:scale-105 cursor-pointer ${
                    activeTab === 'map'
                      ? 'text-[#f43f5e] font-bold'
                      : (isLightMode ? 'text-slate-500 hover:text-slate-800' : 'text-white/50 hover:text-white')
                  }`}
                >
                  <Compass className="w-5 h-5 text-[#00b4d8]" />
                  <span className="font-mono text-[8px] uppercase tracking-wider">MAPPA</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('duo-consigli');
                    setSelectedEventId(null);
                  }}
                  className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all hover:scale-105 cursor-pointer ${
                    activeTab === 'duo-consigli'
                      ? 'text-[#f43f5e] font-bold'
                      : (isLightMode ? 'text-slate-500 hover:text-slate-800' : 'text-white/50 hover:text-white')
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <span className="font-mono text-[8px] uppercase tracking-wider">CONSIGLI</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('partecipa');
                    setSelectedEventId(null);
                  }}
                  className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all hover:scale-105 cursor-pointer ${
                    activeTab === 'partecipa'
                      ? 'text-[#f43f5e] font-bold'
                      : (isLightMode ? 'text-slate-500 hover:text-slate-800' : 'text-white/50 hover:text-white')
                  }`}
                >
                  <Users className="w-5 h-5 text-[#f59e0b]" />
                  <span className="font-mono text-[8px] uppercase tracking-wider">PARTECIPA</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customizable edit desk side drawer sheet */}
      {showSettings && (
        <div className="w-full md:w-80 lg:w-[350px] h-2/3 md:h-full border-t md:border-t-0 md:border-l border-white/10 shrink-0 z-30 transition-all shadow-2xl relative">
          {/* Close button inside drawer for mobile spaces */}
          <button 
            onClick={() => setShowSettings(false)}
            className="md:hidden absolute top-4 right-16 z-50 p-2 bg-slate-900 border border-white/10 text-white rounded-lg"
          >
            Chiudi
          </button>
          
          <SettingsPanel
            config={config}
            onChangeConfig={setConfig}
            events={events}
            onUpdateEvent={handleUpdateEvent}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            onResetEvents={handleResetEvents}
            bgPath={bgImage}
          />
        </div>
      )}
    </div>
  );
}
