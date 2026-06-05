import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Music, 
  UserCheck, 
  Play, 
  Pause, 
  Sparkles, 
  Ticket, 
  Star, 
  Instagram, 
  Globe,
  ChevronLeft,
  Users,
  Home as HomeIcon,
  MessageSquare
} from 'lucide-react';
import { MusicalEvent, EventRegistration } from '../types';

interface EventDetailSlideProps {
  event: MusicalEvent;
  slideNumber: number;
  theme?: string;
  onBack?: () => void;
  registrations?: EventRegistration[];
}

// Complete real-world map of social handles and official sites for each electronic music event
const EVENT_LINKS_MAP: Record<string, { instagram: string; website: string }> = {
  'sonora-festival': {
    instagram: 'https://www.instagram.com/sonorafestival/',
    website: 'https://www.sonorafestival.it'
  },
  'vox-marmoris': {
    instagram: 'https://www.instagram.com/voxmarmoris/',
    website: 'https://www.voxmarmoris.it'
  },
  'iperibleo': {
    instagram: 'https://www.instagram.com/iperibleo/',
    website: 'https://www.iperibleo.it'
  },
  'no-art-puglia': {
    instagram: 'https://www.instagram.com/noartmusic/',
    website: 'https://www.noartmusic.com'
  },
  'viva-festival': {
    instagram: 'https://www.instagram.com/vivafestival/',
    website: 'https://www.vivafestival.it'
  },
  'masseria-wave': {
    instagram: 'https://www.instagram.com/presents_severino/',
    website: 'https://www.masseriawave.com'
  },
  'crx-festival': {
    instagram: 'https://www.instagram.com/crx.festival/',
    website: 'https://www.crxfestival.it'
  },
  'zamna-sardinia': {
    instagram: 'https://www.instagram.com/zamna.music/',
    website: 'https://www.zamnamusic.com'
  },
  'circoloco-grottella': {
    instagram: 'https://www.instagram.com/circolocoibiza/',
    website: 'https://www.circolocoibiza.com'
  },
  'opera-festival': {
    instagram: 'https://www.instagram.com/operafestival/',
    website: 'https://www.operafestival.it'
  },
  'badawi-puglia': {
    instagram: 'https://www.instagram.com/badawi.puglia/',
    website: 'https://www.badawipuglia.it'
  },
  'cocorico-exclusive': {
    instagram: 'https://www.instagram.com/cocoricoriccione/',
    website: 'https://www.cocorico.it'
  },
  'inota-festival': {
    instagram: 'https://www.instagram.com/inotafestival/',
    website: 'https://www.inotafestival.hu'
  },
  'creamfields-uk': {
    instagram: 'https://www.instagram.com/creamfieldsofficial/',
    website: 'https://www.creamfields.com'
  },
  'decibel-jesolo': {
    instagram: 'https://www.instagram.com/decibelopenair/',
    website: 'https://www.decibelopenair.com'
  },
  'polifonic-puglia': {
    instagram: 'https://www.instagram.com/polifonic_/',
    website: 'https://www.polifonic.it'
  },
  'panorama-festival': {
    instagram: 'https://www.instagram.com/panoramafestival.it/',
    website: 'https://www.panorama-festival.it'
  },
  'cala-mariposa': {
    instagram: 'https://www.instagram.com/calamariposabeach/',
    website: 'https://www.calamariposa.com'
  },
  'clorophilla-club': {
    instagram: 'https://www.instagram.com/clorophillaclub/',
    website: 'https://clorophillaclub.it'
  },
  'the-sanctuary-itria': {
    instagram: 'https://www.instagram.com/thesanctuaryecoretreat/',
    website: 'https://thesanctuaryunderground.com/'
  },
  'sacro-puglia': {
    instagram: 'https://www.instagram.com/sacroitaly/',
    website: 'https://www.sacroritual.com'
  },
  'mandarino-club': {
    instagram: 'https://www.instagram.com/mandarinoclub/',
    website: 'https://www.mandarinoclub.it'
  },
  'plaza-bay': {
    instagram: 'https://www.instagram.com/plazabaybarletta/',
    website: 'https://plazabay.it'
  },
  'nextones-fest': {
    instagram: 'https://www.instagram.com/nextones/',
    website: 'https://www.tonesteatronatura.com/nextones/'
  },
  'selectors-croatia': {
    instagram: 'https://www.instagram.com/dekmantelselectors/',
    website: 'https://www.dekmantel.com/selectors'
  },
  'butik-slovenia': {
    instagram: 'https://www.instagram.com/butik_festival/',
    website: 'https://www.butikfestival.com'
  },
  'waking-life': {
    instagram: 'https://www.instagram.com/wakinglife_pt/',
    website: 'https://wakinglife.pt'
  },
  'dekmantel-amsterdam': {
    instagram: 'https://www.instagram.com/dekmantelfestival/',
    website: 'https://www.dekmantelfestival.com'
  },
  'monegros-desert-festival': {
    instagram: 'https://www.instagram.com/monegrosfestival/',
    website: 'https://www.monegrosfestival.com'
  }
};

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

export const EventDetailSlide: React.FC<EventDetailSlideProps> = ({
  event,
  slideNumber,
  theme,
  onBack,
  registrations = [],
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchLineupQuery, setSearchLineupQuery] = useState('');

  const isLight = theme === 'light';

  // Retrieve Instagram and website for current event
  const links = EVENT_LINKS_MAP[event.id] || {
    instagram: 'https://www.instagram.com/',
    website: 'https://www.google.com'
  };

  // Sound play simulation widget
  useEffect(() => {
    let intervalId: any;
    if (isPlaying) {
      intervalId = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 2.5; // Advances preview player
        });
      }, 200);
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [isPlaying]);

  // Handle setting progress back to 0 if event changes
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setSearchLineupQuery('');
  }, [event.id]);

  return (
    <div id={`slide-event-${event.id}`} className={`relative h-full w-full flex flex-col justify-between p-4 md:p-8 font-sans overflow-y-auto ${
      isLight ? 'text-slate-900 bg-white' : 'text-white bg-[#070b13]'
    }`}>
      
      {/* Design layout accents (hidden on mobile) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none hidden md:block">
        <div className={`absolute top-8 bottom-8 left-8 right-8 border ${isLight ? 'border-black/5' : 'border-white/5'}`} />
      </div>

      {/* Top Slide Indicator (Flow-based to avoid overlap) */}
      <div className="w-full flex justify-between items-center border-b pb-2 mb-4 shrink-0 transition-colors duration-200 border-slate-200/50 md:border-transparent">
        {onBack ? (
          <button 
            type="button"
            onClick={onBack}
            className={`font-mono text-[10px] tracking-wider uppercase font-bold flex items-center gap-1.5 transition-colors duration-200 hover:text-[#f43f5e] cursor-pointer ${
              isLight ? 'text-slate-800' : 'text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4 text-[#f43f5e]" />
            <span>INDIETRO</span>
          </button>
        ) : (
          <div className="font-mono text-[10px] tracking-widest text-[#f43f5e] uppercase font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e]" />
            <span>{`0${slideNumber} // DETTAGLIO EVENTO`}</span>
          </div>
        )}
        <div className={`font-mono text-[9px] tracking-widest uppercase ${isLight ? 'text-black/40' : 'text-white/40'}`}>
          STATION FOCUS REPORT
        </div>
      </div>

      {/* Core double column layout suited for tall scrolling screens */}
      <div className="space-y-4 z-10 w-full flex-grow">
        
        {/* Genre & Vibe Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 text-[9px] font-mono tracking-wider text-[#f43f5e] bg-[#f43f5e]/10 border border-[#f43f5e]/20 rounded uppercase">
            {event.genre}
          </span>
          <span className="px-2.5 py-0.5 text-[9px] font-mono tracking-wider text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded uppercase font-bold">
            {event.vibe.split(',')[0]}
          </span>
        </div>

        {/* Event Title */}
        <div className="space-y-1">
          <h1 className={`font-display font-black text-2xl md:text-4xl tracking-tight uppercase leading-tight flex items-center gap-1.5 flex-wrap ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            <span>{event.name}</span>
            {event.isFavorite && (
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0 fill-current" />
            )}
          </h1>

          {/* Date & Location */}
          <div className="space-y-1">
            <div className={`flex items-center gap-1.5 font-sans text-xs ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
              <Calendar className="w-3.5 h-3.5 text-[#f43f5e] shrink-0" />
              <span className="font-semibold">{event.date}</span>
            </div>
            <div className={`flex items-center gap-1.5 font-sans text-xs ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
              <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="font-semibold">{event.venue}, {event.location}</span>
            </div>
          </div>
        </div>

        {/* Description Bubble */}
        <div className={`p-3.5 rounded-xl border ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-white/5'
        }`}>
          <p className={`font-sans font-light text-xs md:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/90'}`}>
            {event.description}
          </p>
        </div>

        {/* Lineup Block with Main 4 summary & Search engine for all DJs */}
        <div className="space-y-3 p-3.5 rounded-xl border border-dashed border-[#f43f5e]/30 bg-[#f43f5e]/[0.02]">
          <div className="flex items-center justify-between">
            <h3 className={`font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5 font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <UserCheck className="w-3.5 h-3.5 text-[#f43f5e]" />
              LINE-UP HIGHLIGHTS (MAIN 4):
            </h3>
            <span className="font-mono text-[8.5px] tracking-widest text-[#f43f5e] font-bold uppercase">
              TOP VIBES
            </span>
          </div>

          {/* Core summary grid for the top 4 DJs */}
          <div className="grid grid-cols-2 gap-1.5">
            {event.lineup.slice(0, 4).map((artist) => (
              <div
                key={artist}
                className={`p-2 border rounded-lg text-xs font-bold text-center truncate tracking-tight transition-all duration-200 ${
                  isLight 
                    ? 'bg-white border-slate-200 hover:border-[#f43f5e]/30 hover:scale-[1.02] text-slate-800' 
                    : 'bg-[#121824]/80 border border-white/5 hover:border-[#f43f5e]/20 hover:scale-[1.02] text-white'
                }`}
              >
                {artist}
              </div>
            ))}
          </div>

          {/* Search Box in the Lineup: "cerca nella line up" where all DJs are listed */}
          <div className={`p-2.5 rounded-lg space-y-2 ${isLight ? 'bg-slate-100/80 border border-slate-200' : 'bg-[#0f1424]/90 border border-white/5'}`} id="lineup-search-container">
            <div className="flex items-center justify-between">
              <label htmlFor="lineup-search-input" className={`font-mono text-[8.5px] uppercase tracking-wider font-bold ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                CERCA NELLA LINE-UP COMPLETA ({event.lineup.length} ARTISTI)
              </label>
              {searchLineupQuery && (
                <button
                  type="button"
                  onClick={() => setSearchLineupQuery('')}
                  className="font-mono text-[8px] text-[#f43f5e] hover:underline cursor-pointer"
                >
                  RESET
                </button>
              )}
            </div>

            <div className="relative">
              <input
                id="lineup-search-input"
                type="text"
                placeholder="Digita il nome del DJ..."
                value={searchLineupQuery}
                onChange={(e) => setSearchLineupQuery(e.target.value)}
                className={`w-full py-1.5 px-3 rounded-md text-xs font-sans outline-none border transition-all ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-[#f43f5e]'
                    : 'bg-black/40 border-white/5 text-white focus:border-[#f43f5e]'
                }`}
              />
            </div>

            {/* Filtered list of all DJs matching query */}
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pt-1 pr-1" id="lineup-search-results">
              {(() => {
                const query = searchLineupQuery.toLowerCase().trim();
                const filtered = event.lineup.filter(artist => 
                  artist.toLowerCase().includes(query)
                );

                if (filtered.length === 0) {
                  return (
                    <div className={`w-full text-center py-1 font-mono text-[9px] ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
                      Nessun DJ corrisponde alla ricerca.
                    </div>
                  );
                }

                return filtered.map((artist) => {
                  const isMain4 = event.lineup.slice(0, 4).includes(artist);
                  return (
                    <span
                      key={artist}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono leading-none tracking-tight flex items-center gap-1 ${
                        isMain4
                          ? 'bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/20 font-bold'
                          : (isLight ? 'bg-slate-200 text-slate-700 border border-slate-300' : 'bg-white/5 text-white/75 border border-white/5')
                      }`}
                    >
                      {artist}
                    </span>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Ticket / Official Social Buttons Block */}
        <div className="space-y-2">
          {event.ticketLink ? (
            /* If ticket link exists, show standard box */
            <div className={`p-4 rounded-xl border ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#121824]/80 border-white/5'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-[9px] text-[#f43f5e] font-bold">INFO BIGLIETTI</span>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{event.status}</span>
              </div>
              <div className="font-display font-black text-lg text-white mb-2">{event.priceRange}</div>
              <a
                href={event.ticketLink}
                target="_blank"
                rel="noreferrer"
                className="block w-full py-2.5 px-3 rounded-lg bg-[#f43f5e] hover:bg-[#e11d48] text-white font-bold text-center text-xs uppercase"
              >
                Acquista ticket
              </a>
            </div>
          ) : (
            /* If NO ticket link, remove standard buy box and show official social information block instead */
            <div className={`p-4 rounded-xl border ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#121824]/80 border-white/5'
            }`}>
              <div className="flex justify-between items-center mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-[#f43f5e]" />
                  <span className={`font-mono text-[9px] font-bold ${isLight ? 'text-slate-500' : 'text-white/40'}`}>CANALI UFFICIALI</span>
                </div>
                <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full ${
                  event.status === 'Sold Out'
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold'
                }`}>
                  {event.status}
                </span>
              </div>

              <div className="mb-3">
                <div className={`text-base font-display font-bold ${isLight ? 'text-[#f43f5e]' : 'text-[#f43f5e]'}`}>
                  {event.priceRange}
                </div>
                <div className={`text-[10px] font-mono mt-0.5 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                  Ingresso regolato da canali e piattaforme esterne accreditate.
                </div>
              </div>

              {/* Two Column Button Layout for Instagram & Website links with referrer policy */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold">
                <a
                  href={links.instagram}
                  target="_blank"
                  rel="noreferrer"
                  referrerPolicy="no-referrer"
                  className="py-2.5 px-3 rounded-lg border flex items-center justify-center gap-1.5 transition-colors bg-gradient-to-r from-purple-600 to-[#f43f5e] text-white border-transparent hover:brightness-110 shadow-sm"
                >
                  <Instagram className="w-3.5 h-3.5 shrink-0" />
                  <span>INSTAGRAM</span>
                </a>
                <a
                  href={links.website}
                  target="_blank"
                  rel="noreferrer"
                  referrerPolicy="no-referrer"
                  className={`py-2.5 px-3 rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                    isLight 
                      ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300' 
                      : 'bg-slate-900 hover:bg-slate-850 text-white border-white/10'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span>SITO WEB</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* ADD ON GOOGLE MAPS LOCATION RIG */}
        <div className="space-y-2 pt-2" id="detail-map-addon-section">
          <h3 className={`font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-white/50'}`}>
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            MAPPA LOCATION / CLUB:
          </h3>
          <div className={`relative h-[200px] w-full flex flex-col justify-between rounded-xl overflow-hidden border ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0f1424]/60 border-white/5'
          }`}>
            <div className="flex-grow flex-1 relative w-full h-full overflow-hidden flex items-center justify-center bg-[#070b13]">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(getGoogleMapsQuery(event))}&t=m&z=13&ie=UTF8&iwloc=&output=embed`}
                className="absolute inset-0 w-full h-full border-0 rounded-xl z-10 opacity-90"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer"
                title={`Google Map Satellite for ${event.name}`}
              />
            </div>
            {/* Coordinates overlay stats footer */}
            <div className={`h-8 border-t px-3.5 flex items-center justify-between z-40 font-mono text-[8px] shrink-0 ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-[#0f1424] border-white/5 text-white/50'
            }`}>
              <div>GOOGLE MAPS COORDINATE INTEGRATE</div>
              <div className="uppercase">LOCATION: {event.location.split(',')[0]}</div>
            </div>
          </div>
        </div>

        {/* PARTECIPANTI REGISTRATI */}
        <div className="space-y-2.5 pt-2" id="detail-registrations-section">
          <h3 className={`font-mono text-[10px] uppercase tracking-wider flex items-center justify-between ${isLight ? 'text-slate-600' : 'text-white/50'}`}>
            <span className="flex items-center gap-1.5 font-bold">
              <Users className="w-3.5 h-3.5 text-amber-500" />
              PRESENZE REGISTRATE ({registrations.filter(reg => reg.eventIds.includes(event.id)).length}):
            </span>
            {registrations.filter(reg => reg.eventIds.includes(event.id)).length > 0 && (
              <span className="text-[8.5px] tracking-normal uppercase bg-[#f43f5e]/15 text-[#f43f5e] font-semibold font-mono px-1.5 py-0.5 rounded">community list</span>
            )}
          </h3>

          {registrations.filter(reg => reg.eventIds.includes(event.id)).length === 0 ? (
            <div className={`p-4 border rounded-xl text-center text-[10px] font-mono leading-normal ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white/[0.02] border-white/5 text-white/40'
            }`}>
              Nessuna presenza ancora registrata per questo evento.<br />
              Registrati nella scheda "Partecipa" per comparire qui!
            </div>
          ) : (
            <div className="space-y-2">
              {registrations.filter(reg => reg.eventIds.includes(event.id)).map((guest) => {
                const premiumIgUrl = guest.instagram ? `https://instagram.com/${guest.instagram.replace('@', '')}` : undefined;

                return (
                  <div
                    key={guest.id}
                    className={`p-3 border rounded-xl flex flex-col gap-2 transition-all ${
                      isLight 
                        ? 'bg-slate-50/50 border-slate-200 hover:bg-slate-50' 
                        : 'bg-[#121824]/60 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold ${isLight ? 'text-slate-800' : 'text-white/95'}`}>
                          {guest.firstName} {guest.lastName}
                        </span>
                        {premiumIgUrl && (
                          <a
                            href={premiumIgUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ml-1"
                            title={`Vedi profilo Instagram di ${guest.instagram}`}
                          >
                            <div className="w-4 h-4 rounded bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center shrink-0 shadow-sm">
                              <Instagram className="w-2.5 h-2.5 text-white shrink-0" />
                            </div>
                          </a>
                        )}
                      </div>

                      {/* Info Badge */}
                      <div className="flex items-center gap-1.5">
                        {guest.seeksAccommodation && (
                          <span className="px-2 py-0.5 rounded bg-[#f43f5e]/10 border border-[#f43f5e]/20 text-[#f43f5e] font-mono text-[8px] uppercase flex items-center gap-1">
                            <HomeIcon className="w-2.5 h-2.5" />
                            <span>ALLOGGIO</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Accommodation optional detailed note info */}
                    {guest.seeksAccommodation && guest.accommodationNote && (
                      <div className={`text-[10px] px-2.5 py-2 rounded-lg border flex items-start gap-1.5 font-mono ${
                        isLight 
                          ? 'bg-white border-slate-100 text-slate-600' 
                          : 'bg-black/20 border-white/5 text-white/70'
                      }`}>
                        <MessageSquare className="w-3.5 h-3.5 text-[#f43f5e] shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <span className="text-[#f43f5e] font-semibold text-[9px] block uppercase tracking-wider mb-0.5">Nota Alloggio:</span>
                          {guest.accommodationNote}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Slide footer summary */}
      <div className={`font-mono text-[9px] tracking-wider flex flex-wrap justify-between items-center gap-2.5 z-10 border-t pt-3 mt-4 shrink-0 ${
        isLight ? 'text-slate-500 border-slate-200' : 'text-white/40 border-white/5'
      }`}>
        <div>INFO ENTRY: AGE LIMIT 18+</div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-[#f43f5e]" /> Slide #{slideNumber} di 7</span>
        </div>
      </div>
    </div>
  );
};
