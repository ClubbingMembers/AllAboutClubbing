import React, { useState } from 'react';
import { Sliders, Sun, Edit3, Image as ImageIcon, Plus, Trash2, Check, X, RefreshCw } from 'lucide-react';
import { MusicalEvent, DeckConfig } from '../types';

interface SettingsPanelProps {
  config: DeckConfig;
  onChangeConfig: (newConfig: DeckConfig) => void;
  events: MusicalEvent[];
  onUpdateEvent: (updatedEvent: MusicalEvent) => void;
  onAddEvent: (newEvent: MusicalEvent) => void;
  onDeleteEvent: (id: string) => void;
  onResetEvents: () => void;
  bgPath: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  config,
  onChangeConfig,
  events,
  onUpdateEvent,
  onAddEvent,
  onDeleteEvent,
  onResetEvents,
  bgPath,
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'events'>('visual');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  
  // State for temporary edits
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [locationName, setLocationName] = useState('');
  const [date, setDate] = useState('');
  const [genre, setGenre] = useState('');
  const [lineupStr, setLineupStr] = useState('');
  const [desc, setDesc] = useState('');
  const [vibe, setVibe] = useState('');

  // States for adding a new event
  const [isAdding, setIsAdding] = useState(false);

  const startEditing = (event: MusicalEvent) => {
    setEditingEventId(event.id);
    setName(event.name);
    setVenue(event.venue);
    setLocationName(event.location);
    setDate(event.date);
    setGenre(event.genre);
    setLineupStr(event.lineup.join(', '));
    setDesc(event.description);
    setVibe(event.vibe);
  };

  const saveEdit = (id: string) => {
    const original = events.find(e => e.id === id);
    if (!original) return;

    onUpdateEvent({
      ...original,
      name,
      venue,
      location: locationName,
      date,
      genre,
      lineup: lineupStr.split(',').map(s => s.trim()).filter(Boolean),
      description: desc,
      vibe,
    });
    setEditingEventId(null);
  };

  const handleAddNew = () => {
    const customId = `event-${Date.now()}`;
    const newEv: MusicalEvent = {
      id: customId,
      name: name || 'Nuovo Evento Summer 2026',
      venue: venue || 'Discoteca Outdoor',
      location: locationName || 'Costa del Sole, Italia',
      coordinates: { x: 45 + Math.random() * 20, y: 30 + Math.random() * 50 },
      date: date || '15 Agosto 2026',
      timestamp: new Date().getTime(),
      genre: genre || 'Tech House / Deep Tech',
      lineup: lineupStr ? lineupStr.split(',').map(s => s.trim()).filter(Boolean) : ['DJ Resident', 'Guest Star'],
      description: desc || 'Un party esclusivo sotto la luna con dj set internazionali.',
      status: 'Tickets Available',
      priceRange: '€35 - €50',
      vibe: vibe || 'Sunset Warm DJ Set',
    };

    onAddEvent(newEv);
    setIsAdding(false);
    // clear fields
    setName('');
    setVenue('');
    setLocationName('');
    setDate('');
    setGenre('');
    setLineupStr('');
    setDesc('');
    setVibe('');
  };

  return (
    <div id="settings-panel" className="bg-slate-950/95 border-l border-white/10 h-full w-full flex flex-col font-sans text-white">
      {/* Panel Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#f43f5e]" />
          <h2 className="font-display font-bold text-lg uppercase tracking-tight">Slide Customizer</h2>
        </div>
        <button
          onClick={onResetEvents}
          title="Ripristina file dati di default"
          className="text-xs font-mono text-white/40 hover:text-[#f43f5e] flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Mode Switches */}
      <div className="grid grid-cols-2 border-b border-white/5 font-mono text-xs text-center">
        <button
          onClick={() => setActiveTab('visual')}
          className={`py-3 transition-colors ${
            activeTab === 'visual'
              ? 'border-b-2 border-[#f43f5e] text-white font-semibold'
              : 'text-white/40 hover:text-white'
          }`}
        >
          CONTROLLI VISIVI
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`py-3 transition-colors ${
            activeTab === 'events'
              ? 'border-b-2 border-[#f43f5e] text-white font-semibold'
              : 'text-white/40 hover:text-white'
          }`}
        >
          EDITA DATI EVENTO ({events.length})
        </button>
      </div>

      {/* Main configuration content scrollable */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {activeTab === 'visual' && (
          <div className="space-y-5">
            {/* Background Opacity (Requested is 60 - 70%) */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm font-sans">
                <span className="font-medium text-white/90">Trasparenza Immagine Sfondo</span>
                <span className="font-mono text-xs text-[#f43f5e] font-semibold bg-[#f43f5e]/10 px-2 py-0.5 rounded border border-[#f43f5e]/30">
                  {config.backgroundOpacity}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.backgroundOpacity}
                onChange={(e) => onChangeConfig({ ...config, backgroundOpacity: parseInt(e.target.value) })}
                className="w-full accent-[#f43f5e] bg-slate-900 h-2 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] font-sans text-white/50 leading-relaxed">
                Opacità consigliata tra <span className="font-semibold text-emerald-400">60% e 70%</span> (in conformità con la tua richiesta) per massimizzare la leggibilità del testo pur vedendo la foto portale.
              </p>
            </div>

            {/* Background Blur Size */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-sans">
                <span className="font-medium text-white/90">Sfocatura Sfondo (Blur)</span>
                <span className="font-mono text-xs bg-white/10 px-2 py-0.5 rounded">
                  {config.backgroundBlur}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                value={config.backgroundBlur}
                onChange={(e) => onChangeConfig({ ...config, backgroundBlur: parseInt(e.target.value) })}
                className="w-full accent-purple-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Config theme toggles */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-white/40 uppercase">PRESENTATION STYLE PRESETS</span>
              <div className="grid grid-cols-2 gap-2">
                {(['dark', 'neon-dance'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => onChangeConfig({ ...config, theme: t })}
                    className={`py-2 px-1 text-[11px] font-mono tracking-wider uppercase border rounded-lg transition-all ${
                      config.theme === t
                        ? 'bg-[#f43f5e] border-[#f43f5e] text-white shadow-md'
                        : 'bg-slate-950 border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {t === 'neon-dance' ? 'NEON CLUB ⚡' : 'DEEP DARK 🌙'}
                  </button>
                ))}
              </div>
            </div>

            {/* Image mock path specification block */}
            <div className="p-3.5 bg-slate-900 border border-white/5 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#f43f5e]" />
                <span className="font-semibold uppercase tracking-wider font-mono text-[10px]">INFORMAZIONE SFONDO</span>
              </div>
              <p className="text-[11px] font-sans text-white/60 leading-relaxed">
                Abbiamo catturato ed elaborato la cornice monumentale della Masseria con una generazione ad alta fedeltà. Lo sfondo è montato in overlay.
              </p>
              <div className="text-[10px] bg-black/40 p-2 rounded border border-white/5 font-mono text-white/40 select-all truncate">
                {bgPath.split('/').pop()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            
            {!isAdding && (
              <button
                onClick={() => {
                  setIsAdding(true);
                  // Setup empty defaults
                  setName('');
                  setVenue('');
                  setLocationName('');
                  setDate('');
                  setGenre('');
                  setLineupStr('');
                  setDesc('');
                  setVibe('');
                }}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-white hover:to-white hover:text-black font-display font-bold text-xs uppercase tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Aggiungi Nuovo Evento</span>
              </button>
            )}

            {isAdding && (
              <div className="p-4 bg-slate-900 border-2 border-emerald-500 rounded-xl space-y-3">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="font-display font-medium text-xs text-emerald-400">REGISTRA EVENTO</span>
                  <button onClick={() => setIsAdding(false)} className="text-white/40 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-white/50 mb-1 font-mono">NOME EVENTO</label>
                    <input
                      type="text"
                      value={name}
                      placeholder="es. Boiler Room Puglia"
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 mb-1 font-mono">CLUB / VENUE</label>
                    <input
                      type="text"
                      value={venue}
                      placeholder="es. Clorophilla Club"
                      onChange={(e) => setVenue(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 mb-1 font-mono">LOCATION (CITTÀ)</label>
                    <input
                      type="text"
                      value={locationName}
                      placeholder="es. Castellaneta Marina, Puglia"
                      onChange={(e) => setLocationName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 mb-1 font-mono">DATA (FINE LUG - FINE AGO)</label>
                    <input
                      type="text"
                      value={date}
                      placeholder="es. 15 Agosto 2026"
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 mb-1 font-mono">STILE / GENERE MUSICALE</label>
                    <input
                      type="text"
                      value={genre}
                      placeholder="es. Minimal / Tech House"
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 mb-1 font-mono">ARTISTI (Separati da virgola)</label>
                    <input
                      type="text"
                      value={lineupStr}
                      placeholder="es. Wade, Cloonee, Loco Dice"
                      onChange={(e) => setLineupStr(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 mb-1 font-mono">VIBE / ATMOSFERA (Tag)</label>
                    <input
                      type="text"
                      value={vibe}
                      placeholder="es. Sunset, Forest, Laser Dome"
                      onChange={(e) => setVibe(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 mb-1 font-mono">DESCRIZIONE / PERCHÈ CITARLO</label>
                    <textarea
                      value={desc}
                      placeholder="Scrivi qui la motivazione e la descrizione per la slide di PowerPoint..."
                      onChange={(e) => setDesc(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white focus:border-emerald-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddNew}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-display uppercase tracking-wide text-xs rounded-lg transition-colors"
                >
                  Salva e Inserisci
                </button>
              </div>
            )}

            {/* List of current events for quick edits/deletion */}
            <div className="space-y-2.5">
              {events.map((ev) => {
                const isEditingThis = editingEventId === ev.id;

                return (
                  <div key={ev.id} className="p-3 bg-slate-900 rounded-xl border border-white/5 space-y-2">
                    {isEditingThis ? (
                      <div className="space-y-2.5 text-xs">
                        <div>
                          <label className="block text-white/40 mb-0.5 text-[10px]">NOME</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded p-1 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-white/40 mb-0.5 text-[10px]">CLUB</label>
                          <input
                            type="text"
                            value={venue}
                            onChange={(e) => setVenue(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded p-1 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-white/40 mb-0.5 text-[10px]">DATA</label>
                          <input
                            type="text"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded p-1 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[#f43f5e] mb-0.5 text-[10px]">DESCRIZIONE</label>
                          <textarea
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-950 border border-white/10 rounded p-1 text-white text-[11px]"
                          />
                        </div>
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            onClick={() => setEditingEventId(null)}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[11px]"
                          >
                            Annulla
                          </button>
                          <button
                            onClick={() => saveEdit(ev.id)}
                            className="px-2 py-1 bg-emerald-500 text-slate-950 font-bold rounded text-[11px] flex items-center gap-0.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Salva
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-xs font-bold text-white uppercase truncate">{ev.name}</div>
                          <div className="text-[10px] text-white/50">{ev.venue} • {ev.date}</div>
                        </div>
                        <div className="flex gap-1.5 items-center shrink-0">
                          <button
                            onClick={() => startEditing(ev)}
                            className="p-1 hover:bg-white/10 text-white/50 hover:text-white rounded"
                            title="Modifica"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {events.length > 2 && (
                            <button
                              onClick={() => onDeleteEvent(ev.id)}
                              className="p-1 hover:bg-red-500/10 text-white/40 hover:text-red-400 rounded"
                              title="Elimina slide"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>

      {/* Info strip */}
      <div className="p-4 bg-black/40 border-t border-white/5 text-center font-mono text-[10px] text-white/40">
        EDITION MODE • STATE SYNC ACTIVE
      </div>
    </div>
  );
};
