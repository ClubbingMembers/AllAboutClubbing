import React, { useState } from 'react';
import { 
  Users, 
  Instagram, 
  Phone, 
  User, 
  Check, 
  Home as HomeIcon, 
  Calendar as CalendarIcon, 
  Send, 
  ChevronDown,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { MusicalEvent, EventRegistration } from '../types';

interface Suggestion {
  id: string;
  title: string;
  date: string;
  createdAt: number;
}

interface PartecipaSlideProps {
  events: MusicalEvent[];
  registrations: EventRegistration[];
  onAddRegistration: (reg: EventRegistration) => void;
  onDeleteRegistration?: (id: string) => void;
  suggestions: Suggestion[];
  onAddSuggestion: (title: string, date: string) => void;
  theme?: string;
  onSelectEvent?: (eventId: string) => void;
}

export const PartecipaSlide: React.FC<PartecipaSlideProps> = ({
  events,
  registrations,
  onAddRegistration,
  onDeleteRegistration,
  suggestions = [],
  onAddSuggestion,
  theme,
  onSelectEvent,
}) => {
  const isLight = theme === 'light';

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [seeksAccommodation, setSeeksAccommodation] = useState(false);
  const [accommodationNote, setAccommodationNote] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Suggestions states
  const [suggestionTitle, setSuggestionTitle] = useState('');
  const [suggestionDate, setSuggestionDate] = useState('');
  const [suggestionError, setSuggestionError] = useState('');
  const [showSuggestSuccess, setShowSuggestSuccess] = useState(false);

  // Toggle event selection
  const handleToggleEvent = (eventId: string) => {
    setSelectedEventIds(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  // Profile avatar initial builder
  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '?';
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!firstName.trim() || !lastName.trim()) {
      setFormError('Nome e Cognome sono obbligatori.');
      return;
    }
    if (selectedEventIds.length === 0) {
      setFormError('Seleziona almeno un evento a cui partecipare.');
      return;
    }

    // Clean instagram handle
    let igHandle = instagram.trim();
    if (igHandle && !igHandle.startsWith('@')) {
      igHandle = `@${igHandle}`;
    }

    const newReg: EventRegistration = {
      id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      instagram: igHandle || undefined,
      whatsapp: whatsapp.trim() || undefined,
      eventIds: selectedEventIds,
      seeksAccommodation,
      accommodationNote: seeksAccommodation && accommodationNote.trim() ? accommodationNote.trim() : undefined,
      createdAt: Date.now(),
    };

    onAddRegistration(newReg);

    // Reset Form & show success
    setFirstName('');
    setLastName('');
    setInstagram('');
    setWhatsapp('');
    setSelectedEventIds([]);
    setSeeksAccommodation(false);
    setAccommodationNote('');
    setIsDropdownOpen(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 4000);
  };

  // Handle Suggestion submit
  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestionError('');

    if (!suggestionTitle.trim()) {
      setSuggestionError('Inserisci un titolo per il nuovo evento.');
      return;
    }

    if (suggestionTitle.length > 100) {
      setSuggestionError('Il nome dell\'evento non può superare i 100 caratteri.');
      return;
    }

    if (!suggestionDate) {
      setSuggestionError('Seleziona la data dell\'evento dal calendario.');
      return;
    }

    onAddSuggestion(suggestionTitle.trim(), suggestionDate);

    // Reset suggestion fields
    setSuggestionTitle('');
    setSuggestionDate('');
    setShowSuggestSuccess(true);
    setTimeout(() => {
      setShowSuggestSuccess(false);
    }, 4000);
  };

  // Sort events chronologically from closest to furthest for simple chronological search layout
  const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

  // Group registrations by event using sorted list
  // Only show events that have at least one registration
  const eventsWithRegistrations = sortedEvents.filter(event => 
    registrations.some(reg => reg.eventIds.includes(event.id))
  );

  // Retrieve the IDs of registrations made on this device
  const getMyRegistrations = () => {
    try {
      const savedIds = localStorage.getItem('my_registrations_ids');
      if (!savedIds) return [];
      const parsedIds = JSON.parse(savedIds) as string[];
      // Filter registrations list to find those owned by this browser
      return registrations.filter(reg => parsedIds.includes(reg.id));
    } catch {
      return [];
    }
  };

  const myRegs = getMyRegistrations();

  return (
    <div className="p-4 sm:p-5 flex flex-col gap-6" id="partecipa-slide-container">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
        <div className="p-1.5 rounded-lg bg-[#f43f5e]/10 text-[#f43f5e]">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <span className={`font-mono text-[9px] tracking-widest uppercase ${isLight ? 'text-black/60' : 'text-white/50'}`}>REGISTRATI & CONDIVIDI</span>
          <h2 className={`font-syne font-bold text-lg leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            PARTECIPA AL DECK
          </h2>
        </div>
      </div>

      {/* Success Notification Bar */}
      {showSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-mono flex items-center gap-2 animate-pulse" id="success-alert">
          <Check className="w-4 h-4 shrink-0" />
          <span>Richiesta inviata! Ora sei registrato nella community.</span>
        </div>
      )}

      {/* Form Section */}
      <form onSubmit={handleSubmit} className={`p-4 rounded-2xl border flex flex-col gap-4 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-950/75 border-white/5'
      }`} id="registration-form">
        <h3 className={`font-mono text-[10px] tracking-wider uppercase ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
          INVIA LA TUA ADESIONE
        </h3>

        {/* Name and Surname */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1.5">
            <label className={`font-mono text-[8px] uppercase select-none ${isLight ? 'text-slate-500' : 'text-white/40'}`}>Nome</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"><User className="w-3.5 h-3.5" /></span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="es. Mario"
                className={`w-full text-xs font-mono pl-8 pr-3 py-2.5 rounded-xl border outline-none transition-all ${
                  isLight 
                    ? 'bg-slate-100/50 border-slate-200 text-slate-800 focus:border-[#f43f5e]' 
                    : 'bg-black/30 border-white/10 text-white focus:border-[#f43f5e] focus:bg-black/50'
                }`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={`font-mono text-[8px] uppercase select-none ${isLight ? 'text-slate-500' : 'text-white/40'}`}>Cognome</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"><User className="w-3.5 h-3.5" /></span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="es. Rossi"
                className={`w-full text-xs font-mono pl-8 pr-3 py-2.5 rounded-xl border outline-none transition-all ${
                  isLight 
                    ? 'bg-slate-100/50 border-slate-200 text-slate-800 focus:border-[#f43f5e]' 
                    : 'bg-black/30 border-white/10 text-white focus:border-[#f43f5e] focus:bg-black/50'
                }`}
              />
            </div>
          </div>
        </div>

        {/* WhatsApp & Instagram */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className={`font-mono text-[8px] uppercase select-none ${isLight ? 'text-slate-500' : 'text-white/40'}`}>WhatsApp (Per Gruppo)</label>
            <span className="text-[7.5px] font-mono text-white/30 italic">Opzionale</span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500"><Phone className="w-3.5 h-3.5" /></span>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+39 345 67890"
              className={`w-full text-xs font-mono pl-8 pr-3 py-2.5 rounded-xl border outline-none transition-all ${
                isLight 
                  ? 'bg-slate-100/50 border-slate-200 text-slate-800 focus:border-[#f43f5e]' 
                  : 'bg-black/30 border-white/10 text-white focus:border-[#f43f5e] focus:bg-black/50'
              }`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className={`font-mono text-[8px] uppercase select-none ${isLight ? 'text-slate-500' : 'text-white/40'}`}>Username Instagram</label>
            <span className="text-[7.5px] font-mono text-white/30 italic">Opzionale</span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-500"><Instagram className="w-3.5 h-3.5" /></span>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="es. @mario_rossi"
              className={`w-full text-xs font-mono pl-8 pr-3 py-2.5 rounded-xl border outline-none transition-all ${
                isLight 
                  ? 'bg-slate-100/50 border-slate-200 text-slate-800 focus:border-[#f43f5e]' 
                  : 'bg-black/30 border-white/10 text-white focus:border-[#f43f5e] focus:bg-black/50'
              }`}
            />
          </div>
        </div>

        {/* Custom Multiple Selection Event Dropdown */}
        <div className="flex flex-col gap-1.5 relative">
          <label className={`font-mono text-[8px] uppercase select-none ${isLight ? 'text-slate-500' : 'text-white/40'}`}>Eventi Selezionati</label>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full text-xs font-mono px-3 py-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
              isLight 
                ? 'bg-slate-100/50 border-slate-200 text-slate-800' 
                : 'bg-black/30 border-white/10 text-white'
            }`}
          >
            <span className="truncate">
              {selectedEventIds.length === 0
                ? 'Scegli gli eventi...'
                : `${selectedEventIds.length} event${selectedEventIds.length > 1 ? 'i' : 'o'} scelt${selectedEventIds.length > 1 ? 'i' : 'o'}`}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className={`absolute top-full left-0 w-full mt-1.5 p-2 rounded-xl border z-20 shadow-2xl flex flex-col gap-1 max-h-48 overflow-y-auto ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'
            }`} id="event-multiselect-dropdown">
              {sortedEvents.map((ev) => {
                const isSelected = selectedEventIds.includes(ev.id);
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => handleToggleEvent(ev.id)}
                    className={`text-left text-[11px] px-2.5 py-2.5 rounded-lg flex items-center justify-between transition-colors ${
                      isSelected 
                        ? 'bg-[#f43f5e]/15 text-[#f43f5e] font-semibold' 
                        : (isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-black/40 text-white/80')
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] leading-tight truncate">{ev.name}</span>
                      <span className="text-[8.5px] text-white/40 font-mono mt-0.5">{ev.date}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#f43f5e]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Accommodation Flag */}
        <div className="space-y-2">
          <label className={`p-3 rounded-xl border cursor-pointer select-none flex items-center justify-between transition-colors ${
            seeksAccommodation
              ? 'bg-[#f43f5e]/5 border-[#f43f5e]/25'
              : (isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/25 border-white/5')
          }`}>
            <div className="flex items-center gap-2.5">
              <HomeIcon className={`w-4 h-4 ${seeksAccommodation ? 'text-[#f43f5e]' : 'text-white/40'}`} />
              <div className="flex flex-col">
                <span className={`text-[10px] font-mono leading-tight ${isLight ? 'text-slate-800' : 'text-white'}`}>Cerca alloggio con noi?</span>
                <span className="text-[8px] font-mono text-white/40 mt-0.5">Spunta se vuoi dividere villa/masseria</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={seeksAccommodation}
              onChange={(e) => setSeeksAccommodation(e.target.checked)}
              className="w-4 h-4 accent-[#f43f5e] rounded cursor-pointer"
            />
          </label>

          {seeksAccommodation && (
            <div className="flex flex-col gap-1.5" id="accommodation-note-container">
              <div className="flex justify-between items-center">
                <span className={`font-mono text-[8px] uppercase select-none ${isLight ? 'text-slate-500' : 'text-white/40'}`}>Inserisci una nota alloggio (Max 300 car.)</span>
                <span className={`text-[8.5px] font-mono ${300 - accommodationNote.length < 30 ? 'text-rose-500 font-bold' : 'text-white/30'}`}>
                  {300 - accommodationNote.length}/300
                </span>
              </div>
              <textarea
                value={accommodationNote}
                onChange={(e) => setAccommodationNote(e.target.value.substring(0, 300))}
                placeholder="Scrivi qui le preferenze (es. date, compagni di viaggio, budget...)"
                rows={3}
                className={`w-full text-xs font-mono p-3 rounded-xl border outline-none resize-none transition-all ${
                  isLight 
                    ? 'bg-slate-100/50 border-slate-200 text-slate-800 focus:border-[#f43f5e]' 
                    : 'bg-black/30 border-white/10 text-white focus:border-[#f43f5e] focus:bg-black/50'
                }`}
              />
            </div>
          )}
        </div>

        {/* Display form error */}
        {formError && (
          <div className="text-rose-400 text-[10px] font-mono flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-[#f43f5e] hover:bg-[#e11d48] text-white py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-[#f43f5e]/10"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Invia la registrazione</span>
        </button>
      </form>

      {/* REQUIREMENT 2: EVENT SUGGESTIONS FORM */}
      <form onSubmit={handleSuggestionSubmit} className={`p-4 rounded-2xl border flex flex-col gap-4 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-950/75 border-white/5'
      }`} id="suggestions-form">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#f43f5e]" />
          <h3 className={`font-mono text-[10px] tracking-wider uppercase ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
            SUGGERISCI UN NUOVO EVENTO
          </h3>
        </div>

        {showSuggestSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-[10.5px] font-mono flex items-center gap-2 animate-pulse">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>Suggerimento inviato con successo e salvato globalmente!</span>
          </div>
        )}

        {/* Suggestion Event Name (Max 100 Character limit check) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className={`font-mono text-[8px] uppercase select-none ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
              Titolo Evento (Max 100 Caratteri)
            </label>
            <span className={`text-[8px] font-mono ${100 - suggestionTitle.length < 15 ? 'text-rose-500 font-bold' : 'text-white/30'}`}>
              {100 - suggestionTitle.length}/100
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"><Sparkles className="w-3.5 h-3.5" /></span>
            <input
              type="text"
              maxLength={100}
              value={suggestionTitle}
              onChange={(e) => setSuggestionTitle(e.target.value)}
              placeholder="es. Boiler Room Ostuni, Circoloco Milan Showcase..."
              className={`w-full text-xs font-mono pl-8 pr-3 py-2.5 rounded-xl border outline-none transition-all ${
                isLight 
                  ? 'bg-slate-100/50 border-slate-200 text-slate-800 focus:border-[#f43f5e]' 
                  : 'bg-black/30 border-white/10 text-white focus:border-[#f43f5e] focus:bg-black/50'
              }`}
            />
          </div>
        </div>

        {/* Suggestion Calender Selector */}
        <div className="flex flex-col gap-1.5">
          <label className={`font-mono text-[8px] uppercase select-none ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
            Data dell'evento (Finestra Calendario)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f43f5e]"><CalendarIcon className="w-3.5 h-3.5" /></span>
            <input
              type="date"
              value={suggestionDate}
              onChange={(e) => setSuggestionDate(e.target.value)}
              className={`w-full text-xs font-mono pl-8 pr-3 py-2.5 rounded-xl border outline-none transition-all ${
                isLight 
                  ? 'bg-slate-100/50 border-slate-200 text-slate-800 focus:border-[#f43f5e]' 
                  : 'bg-black/30 border-white/10 text-white focus:border-[#f43f5e] focus:bg-black/50'
              }`}
            />
          </div>
        </div>

        {suggestionError && (
          <div className="text-rose-400 text-[10px] font-mono flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{suggestionError}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-[#f43f5e] hover:bg-[#e11d48] text-white py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-[#f43f5e]/10"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Invia Suggerimento</span>
        </button>
      </form>

      {/* Summary Box Section */}
      <div className="flex flex-col gap-3" id="presenze-section">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-white/40 uppercase">PRESENZE REGISTRATE</span>
          <span className="text-[9px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-white/60">
            {registrations.length} Membr{registrations.length !== 1 ? 'i' : 'o'}
          </span>
        </div>

        {eventsWithRegistrations.length === 0 ? (
          <div className={`p-6 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-950/30 border-white/5'
          }`} id="no-registration-alert">
            <Users className="w-6 h-6 text-white/20" />
            <p className="text-[10px] font-mono text-white/40 leading-snug">
              Nessuna presenza ancora registrata.<br />Compila il form sopra per attivare le sale degli eventi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5" id="community-event-boxes">
            {eventsWithRegistrations.map((event) => {
              // Extract people registered for this exact eventId
              const eventGuests = registrations.filter(reg => reg.eventIds.includes(event.id));

              return (
                <div 
                  key={event.id}
                  onClick={() => onSelectEvent && onSelectEvent(event.id)}
                  title="Clicca per visualizzare la lineup e i dettagli di questo evento"
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.01] ${
                    isLight 
                       ? 'bg-white border-slate-200 hover:border-[#f43f5e]/40 hover:shadow-md hover:shadow-slate-100' 
                      : 'bg-[#0f1524] border-[#f43f5e]/10 hover:border-[#f43f5e]/40 hover:bg-[#12192b]'
                  }`}
                >
                  {/* Event mini header */}
                  <div className="flex justify-between items-start pb-2 border-b border-white/5 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e] animate-pulse" />
                      <h4 className={`text-[11px] font-syne font-bold uppercase tracking-wider leading-tight group-hover:text-[#f43f5e] transition-colors ${
                        isLight ? 'text-slate-800' : 'text-white'
                      }`}>
                        {event.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[7.5px] font-mono text-emerald-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
                        VEDI DETTAGLIO →
                      </span>
                    </div>
                  </div>

                  {/* Registered users list / avatars */}
                  <div className="flex flex-wrap gap-2">
                    {eventGuests.map((guest) => (
                      <div 
                        key={guest.id}
                        className={`text-[10px] px-2.5 py-1.5 rounded-full flex items-center gap-2 border transition-all ${
                          isLight 
                            ? 'bg-slate-50 border-slate-100 text-slate-800 hover:bg-slate-100' 
                            : 'bg-black/30 border-white/5 text-white/90 hover:bg-black/50'
                        }`}
                        title={`${guest.firstName} ${guest.lastName} ${guest.whatsapp ? `(${guest.whatsapp})` : ''} ${guest.seeksAccommodation ? '- Cerca alloggio' : ''}`}
                        onClick={(e) => {
                          // Prevent triggering the card's click event when clicking on a guest element
                          e.stopPropagation();
                        }}
                      >
                        {guest.instagram ? (
                          // Instagram user: displays first name and last name, Instagram icon next to it
                          <div className="flex items-center gap-1.5">
                            {/* Instagram initials circular avatar badge with gradient border */}
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[1.2px] flex items-center justify-center shrink-0">
                              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center font-mono text-[7px] font-bold text-white uppercase">
                                {getInitials(guest.firstName, guest.lastName)}
                              </div>
                            </div>
                            <span className={`font-sans font-medium ${isLight ? 'text-slate-800' : 'text-white/90'}`}>
                              {guest.firstName} {guest.lastName}
                            </span>
                            <a
                              href={`https://instagram.com/${guest.instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 -mr-1 text-fuchsia-400 hover:text-fuchsia-300 hover:scale-125 transition-transform"
                              onClick={(e) => {
                                // Prevent card selection event bubble
                                e.stopPropagation();
                              }}
                              title={`Vedi profilo Instagram di ${guest.firstName}`}
                            >
                              <Instagram className="w-3.5 h-3.5 shrink-0" />
                            </a>
                          </div>
                        ) : (
                          // Fallback initials circle representation
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-800 text-white/80 font-mono text-[8px] font-bold flex items-center justify-center shrink-0 border border-white/10 uppercase">
                              {getInitials(guest.firstName, guest.lastName)}
                            </div>
                            <span className={`font-sans font-medium ${isLight ? 'text-slate-750' : 'text-white/70'}`}>
                              {guest.firstName} {guest.lastName}
                            </span>
                          </div>
                        )}

                        {/* Lodging icon helper badge if they look to stay together */}
                        {guest.seeksAccommodation && (
                          <span 
                            className="p-0.5 rounded bg-[#f43f5e]/20 text-[#f43f5e] shrink-0" 
                            title={guest.accommodationNote ? `Cerca alloggio: ${guest.accommodationNote}` : "Cerca alloggio con noi"}
                          >
                            <HomeIcon className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PERSISTENT SUGGESTIONS DISPLAY FEED */}
      <div className="flex flex-col gap-3" id="suggerimenti-list-section">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-white/40 uppercase">SUGGERIMENTI DELLA COMMUNITY</span>
          <span className="text-[9px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-white/60">
            {suggestions.length} Suggeriment{suggestions.length !== 1 ? 'i' : 'o'}
          </span>
        </div>

        {suggestions.length === 0 ? (
          <div className={`p-5 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-950/30 border-white/5'
          }`}>
            <Sparkles className="w-5 h-5 text-white/20" />
            <p className="text-[10px] font-mono text-white/40 leading-snug">
              Ancora nessun evento suggerito.<br />Sii il primo a proporne uno compilando il form sopra!
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
            {suggestions.map((sug) => {
              const formattedDate = new Date(sug.date).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });
              return (
                <div 
                  key={sug.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isLight 
                      ? 'bg-slate-50/50 border-slate-200' 
                      : 'bg-[#121824]/60 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4.5 h-4.5 text-[#f43f5e]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className={`text-[11.5px] font-mono font-bold leading-tight truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>
                        {sug.title}
                      </h4>
                      <p className={`text-[9px] font-mono flex items-center gap-1 mt-0.5 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                        <CalendarIcon className="w-3 h-3 text-[#f43f5e]" />
                        <span>Data: {formattedDate}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
