import React, { useState } from 'react';
import { ChevronRight, Clock, MapPin, Tag, Star, ChevronLeft, Users, Search, Eye } from 'lucide-react';
import { MusicalEvent, EventRegistration } from '../types';

interface TimelineSlideProps {
  events: MusicalEvent[];
  onSelectEvent: (eventId: string) => void;
  theme?: string;
  registrations?: EventRegistration[];
  eventViews?: Record<string, number>;
}

export const TimelineSlide: React.FC<TimelineSlideProps> = ({
  events,
  onSelectEvent,
  theme,
  registrations = [],
  eventViews = {},
}) => {
  const isLight = theme === 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [sortingMode, setSortingMode] = useState<'none' | 'views' | 'popularity'>('none');

  const getEventViews = (eventId: string) => {
    return eventViews[eventId] || 0;
  };

  const getParticipantsCount = (eventId: string) => {
    return registrations.filter(r => r.eventIds.includes(eventId)).length;
  };

  const handleEventClick = (eventId: string) => {
    onSelectEvent(eventId);
  };

  // Sort events dynamically
  const sortedEvents = [...events].sort((a, b) => {
    if (sortingMode === 'views') {
      const viewsA = getEventViews(a.id);
      const viewsB = getEventViews(b.id);
      return viewsB - viewsA; // Descending
    } else if (sortingMode === 'popularity') {
      const popA = getParticipantsCount(a.id);
      const popB = getParticipantsCount(b.id);
      return popB - popA; // Descending
    } else {
      return a.timestamp - b.timestamp; // Chronological ascending
    }
  });

  // Filter events based on search query match
  const filteredEvents = sortedEvents.filter(event => 
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Chronological calendar months range calculator
  const getMonthsRange = () => {
    if (sortedEvents.length === 0) return [];
    
    const firstDate = new Date(sortedEvents[0].timestamp);
    const lastDate = new Date(sortedEvents[sortedEvents.length - 1].timestamp);
    
    let y = firstDate.getFullYear();
    let m = firstDate.getMonth();
    
    const endY = lastDate.getFullYear();
    const endM = lastDate.getMonth();
    
    const list: { year: number; month: number; label: string }[] = [];
    while (y < endY || (y === endY && m <= endM)) {
      list.push({
        year: y,
        month: m,
        label: new Date(y, m, 1).toLocaleString('it-IT', { month: 'long', year: 'numeric' })
      });
      m++;
      if (m > 11) {
        m = 0;
        y++;
      }
    }
    return list;
  };

  const monthRange = getMonthsRange();
  const [currentMonthIdx, setCurrentMonthIdx] = useState(0);

  // Navigate months safely
  const prevMonth = () => {
    if (currentMonthIdx > 0) {
      setCurrentMonthIdx(currentMonthIdx - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonthIdx < monthRange.length - 1) {
      setCurrentMonthIdx(currentMonthIdx + 1);
    }
  };

  // Get days representation of selected month
  const activeMonthInfo = monthRange[currentMonthIdx] || { year: new Date().getFullYear(), month: new Date().getMonth(), label: '' };
  const { year: activeYear, month: activeMonthNum, label: activeMonthLabel } = activeMonthInfo;

  const daysInMonth = new Date(activeYear, activeMonthNum + 1, 0).getDate();
  const firstDayOffset = (new Date(activeYear, activeMonthNum, 1).getDay() + 6) % 7; // Monday is index 0

  // Quick helper to check if a day has events
  const getEventsForDay = (day: number) => {
    return filteredEvents.filter(e => {
      const d = new Date(e.timestamp);
      return d.getFullYear() === activeYear && d.getMonth() === activeMonthNum && d.getDate() === day;
    });
  };

  return (
    <div id="slide-timeline" className={`relative w-full p-4 font-sans ${
      isLight ? 'text-slate-900 bg-white' : 'text-white bg-[#070b13]'
    }`}>
      
      {/* Design accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none hidden md:block">
        <div className={`absolute top-8 bottom-8 left-8 right-8 border ${isLight ? 'border-black/5' : 'border-white/5'}`} />
      </div>

      {/* Top Slide Indicator (Flow-based to avoid overlap) */}
      <div className="w-full flex justify-between items-center border-b pb-2 mb-4 shrink-0 transition-colors duration-200 border-slate-200/50 md:border-transparent">
        <div className="font-mono text-[10px] tracking-widest text-[#f43f5e] uppercase font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e]" />
          <span>02 // EVENTI ESTIVI</span>
        </div>
        <div className={`font-mono text-[9px] tracking-widest uppercase ${isLight ? 'text-black/40' : 'text-white/40'}`}>
          SELECT TO EXPLORE
        </div>
      </div>

      {/* Slide Title & Subtitle */}
      <div className="z-10 shrink-0">
        <h2 className={`font-display font-black text-xl md:text-3xl uppercase tracking-tight ${
          isLight ? 'text-slate-800' : 'text-white'
        }`}>
          EVENTI
        </h2>
        <p className={`font-sans font-normal text-[11px] md:text-xs max-w-xl mt-1 leading-relaxed ${
          isLight ? 'text-slate-600' : 'text-white/70'
        }`}>
          La cronologia temporale da luglio a fine estate. Clicca sul calendario o su un evento per aprire i dettagli, line-up e biglietti.
        </p>
      </div>

      {/* COMPRESSIVE SEARCH BAR */}
      <div className="my-4 z-10 relative">
        <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#f43f5e]/40 ${
          isLight ? 'bg-slate-50 border-slate-200 focus-within:bg-white' : 'bg-slate-950/40 border-white/5 focus-within:bg-[#0c1220]'
        }`}>
          <Search className="w-4 h-4 text-[#f43f5e] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca per evento"
            className="w-full bg-transparent border-0 outline-none text-xs font-sans placeholder-slate-500 focus:ring-0 p-0 text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#f43f5e]/10 text-[#f43f5e] hover:bg-[#f43f5e] hover:text-white transition-colors cursor-pointer"
            >
              RESET
            </button>
          )}
        </div>
      </div>

      {/* COMPACT CALENDAR BOX */}
      {monthRange.length > 0 && (
        <div className={`my-4 p-3 rounded-2xl border transition-all z-10 relative ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-white/5'
        }`}>
          {/* Header navigation bar */}
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-dashed border-slate-200/50 dark:border-white/5">
            <button
              type="button"
              disabled={currentMonthIdx === 0}
              onClick={prevMonth}
              className={`p-1 rounded-md border transition-all ${
                currentMonthIdx === 0 
                  ? 'opacity-30 cursor-not-allowed border-transparent' 
                  : 'hover:bg-[#f43f5e]/15 border-slate-300 dark:border-white/10 text-[#f43f5e] cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10.5px] uppercase font-bold tracking-wider text-center flex-1 text-[#f43f5e]">
              {activeMonthLabel}
            </span>
            <button
              type="button"
              disabled={currentMonthIdx === monthRange.length - 1}
              onClick={nextMonth}
              className={`p-1 rounded-md border transition-all ${
                currentMonthIdx === monthRange.length - 1
                  ? 'opacity-30 cursor-not-allowed border-transparent'
                  : 'hover:bg-[#f43f5e]/15 border-slate-300 dark:border-white/10 text-[#f43f5e] cursor-pointer'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid layout days name */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[8.5px] font-bold text-slate-400 mb-1 select-none">
            {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(d => (
              <div key={d} className="uppercase">{d}</div>
            ))}
          </div>

          {/* Grid dates cells */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Offsets empty boxes */}
            {Array.from({ length: firstDayOffset }).map((_, idx) => (
              <div key={`offset-${idx}`} className="h-7" />
            ))}

            {/* Real month days cells */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dayEvents = getEventsForDay(day);
              const hasEvents = dayEvents.length > 0;

              return (
                <div key={`day-${day}`} className="h-7 flex items-center justify-center relative">
                  {hasEvents ? (
                    <button
                      type="button"
                      onClick={() => handleEventClick(dayEvents[0].id)}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-[#f43f5e] text-white text-[9.5px] font-bold select-none cursor-pointer transition-transform hover:scale-115 active:scale-95 shadow-[0_2px_8px_rgba(244,63,94,0.4)]"
                      title={`${dayEvents.length} Eventi: ${dayEvents.map(e => e.name).join(', ')}`}
                    >
                      {day}
                    </button>
                  ) : (
                    <span className={`text-[9.5px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {day}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TWO SMALLEST FILTER BOXES: MOST VIEWED AND POPULAR */}
      <div className="grid grid-cols-2 gap-2 mb-4" id="timeline-sorting-bar">
        <button
          type="button"
          onClick={() => setSortingMode(sortingMode === 'views' ? 'none' : 'views')}
          className={`py-1.5 px-3 rounded-xl border font-mono text-[10px] uppercase font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
            sortingMode === 'views'
              ? 'bg-[#f43f5e] border-[#f43f5e] text-white shadow-md shadow-[#f43f5e]/25 scale-[1.02]'
              : isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-[#121824]/60 hover:bg-[#121824] border-white/5 text-slate-300'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Most Viewed</span>
        </button>

        <button
          type="button"
          onClick={() => setSortingMode(sortingMode === 'popularity' ? 'none' : 'popularity')}
          className={`py-1.5 px-3 rounded-xl border font-mono text-[10px] uppercase font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
            sortingMode === 'popularity'
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-[1.02]'
              : isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-[#121824]/60 hover:bg-[#121824] border-white/5 text-slate-300'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Popular</span>
        </button>
      </div>

      {/* Vertical Timeline List Container */}
      <div className="my-5 z-10 flex-grow relative w-full pr-1">
        
        {/* Timeline main vertical line stem */}
        {filteredEvents.length > 0 && (
          <div className="absolute top-0 bottom-0 left-[14px] w-0.5 bg-gradient-to-b from-[#f43f5e] via-purple-500 to-emerald-500 rounded-full" />
        )}

        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className={`p-8 text-center border border-dashed rounded-2xl ${
              isLight ? 'border-slate-250 text-slate-500 bg-slate-50/50' : 'border-white/5 text-white/40 bg-[#0f1424]/40'
            }`}>
              <div className="font-mono text-xs font-bold text-[#f43f5e] mb-1">NESSUN EVENTO TROVATO</div>
              <p className="text-[10px] leading-relaxed">Nessun evento corrisponde alle lettere inserite ("{searchQuery}"). Prova a digitare un altro nome o clicca su RESET.</p>
            </div>
          ) : (
            filteredEvents.map((event) => {
              return (
                <button
                  key={event.id}
                  id={`timeline-node-${event.id}`}
                  onClick={() => handleEventClick(event.id)}
                  className="w-full text-left flex items-start gap-2.5 group focus:outline-none transition-transform duration-300 active:scale-[0.99] hover:translate-x-0.5"
                >
                  {/* Visual Circle Indicator along vertical path */}
                  <div className="relative shrink-0 flex items-center justify-center pt-2">
                    <div className={`w-7 h-7 rounded-full border-2 border-[#f43f5e]/80 group-hover:border-slate-400 transition-all flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.25)] z-20 ${
                      isLight ? 'bg-white' : 'bg-slate-900'
                    }`}>
                      <Clock className={`w-3 h-3 ${isLight ? 'text-[#f43f5e]' : 'text-white'}`} />
                    </div>
                    {/* Subtle pulse under nodes */}
                    <div className="absolute w-7 h-7 rounded-full bg-[#f43f5e]/10 -z-10 animate-pulse" />
                  </div>

                  {/* Event Information Card */}
                  <div className={`flex-grow p-3 border rounded-xl shadow-sm transition-all duration-300 w-full min-w-0 overflow-hidden ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 group-hover:border-[#f43f5e]/80 group-hover:bg-amber-50/10'
                      : 'bg-[#121824]/60 border-white/5 group-hover:border-white/20 group-hover:bg-slate-900/40'
                  }`}>
                    <div className="flex flex-col gap-2">
                      <div className="space-y-1">
                        {/* Date Indicator badge and Registered User count replacing Countdown */}
                        <div className="flex justify-between items-center gap-2 select-none">
                          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[9px] font-bold text-[#f43f5e] tracking-wider uppercase">
                            <span>{event.date}</span>
                            {sortingMode === 'views' ? (
                              <span className="flex items-center gap-1 text-slate-400 bg-slate-500/10 px-1 py-0.5 rounded border border-slate-400/15 shrink-0 font-bold font-mono text-[8px] normal-case">
                                <Eye className="w-2.5 h-2.5 text-rose-400 animate-pulse" />
                                <span>{getEventViews(event.id)} views</span>
                              </span>
                            ) : sortingMode === 'popularity' ? (
                              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-400/15 shrink-0 font-bold font-mono text-[8px] normal-case">
                                <Users className="w-2.5 h-2.5" />
                                <span>{getParticipantsCount(event.id)} presenze</span>
                              </span>
                            ) : null}
                          </div>
                          <span 
                            className="font-mono text-[9px] font-bold bg-[#f43f5e]/10 text-[#f43f5e] px-2 py-0.5 rounded-full border border-[#f43f5e]/15 shrink-0 flex items-center gap-1"
                            title={`${registrations.filter(r => r.eventIds.includes(event.id)).length} registrati`}
                          >
                            <Users className="w-2.5 h-2.5" />
                            <span>{registrations.filter(r => r.eventIds.includes(event.id)).length}</span>
                          </span>
                        </div>
                        
                        <h3 className={`font-display font-bold text-xs md:text-sm leading-snug flex items-center gap-1.5 flex-wrap whitespace-normal ${
                          isLight ? 'text-slate-800' : 'text-white'
                        }`}>
                          <span className="break-words">{event.name}</span>
                          {event.isFavorite && (
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0" />
                          )}
                          {event.isInternational && (
                            <span className="font-mono text-[7px] bg-sky-500/10 text-sky-400 border border-sky-400/20 px-1 rounded uppercase shrink-0 font-bold">ESTERO</span>
                          )}
                        </h3>

                        <p className={`font-mono text-[10px] flex items-start gap-1 mt-1 leading-snug whitespace-normal ${
                          isLight ? 'text-slate-500' : 'text-white/50'
                        }`}>
                          <MapPin className="w-3 h-3 text-[#f43f5e] shrink-0 mt-0.5" />
                          <span className="block min-w-0 flex-1 break-words">
                            <strong className={`block font-bold tracking-tight ${isLight ? 'text-slate-750' : 'text-white/90'}`}>{event.venue}</strong>
                            <span className={`text-[9px] block ${isLight ? 'text-slate-500' : 'text-white/40'}`}>{event.location}</span>
                          </span>
                        </p>
                      </div>

                      <div className={`flex items-center justify-between border-t pt-1.5 mt-1 ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                        <span className={`text-[8px] font-mono px-2 py-0.5 rounded uppercase ${
                          isLight 
                            ? 'bg-slate-100 border border-slate-200 text-slate-700' 
                            : 'bg-white/5 border border-white/10 text-white/80'
                        }`}>
                          {event.genre}
                        </span>
                        
                        <div className="text-[10px] text-[#f43f5e] font-mono flex items-center gap-0.5 opacity-85 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                          <span>Vedi</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Slide footer summary */}
      <div className={`font-mono text-[9px] tracking-wider flex flex-wrap justify-between items-center gap-2.5 z-10 border-t pt-3 mt-4 shrink-0 ${
        isLight ? 'text-slate-500 border-slate-200' : 'text-white/40 border-white/5'
      }`}>
        <div>EVENTI ESTIVI • SHARING PERSISTENTE</div>
        <div className="flex gap-2 items-center">
          <span className="flex items-center gap-1"><Tag className="w-3 h-3 text-[#f43f5e]" /> Estate 2026</span>
        </div>
      </div>
    </div>
  );
};
