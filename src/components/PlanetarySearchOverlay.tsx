import React, { useState, useEffect, useRef } from 'react';
import { Search, Crosshair, X, Compass, ChevronRight, Check } from 'lucide-react';
import { soundManager } from '../services/soundManager';

export interface PlanetaryLocation {
  id: string;
  name: string;
  type: string;
  region: string;
  lat: string;
  lon: string;
  latDeg: number;
  lonDeg: number;
  elevation: string;
  quadrangle: string;
  targetBadge?: string;
  isPrimary?: boolean;
}

export const PLANETARY_LOCATIONS: PlanetaryLocation[] = [
  {
    id: 'jezero',
    name: 'JEZERO CRATER',
    type: 'CRATER',
    region: 'ISIDIS PLANITIA',
    lat: '18.4° N',
    lon: '77.5° E',
    latDeg: 18.44,
    lonDeg: 77.50,
    elevation: '-2,540 M',
    quadrangle: 'MC-13 SYRTIS MAJOR',
    targetBadge: 'NASA MARS 2020 · PRIMARY TARGET',
    isPrimary: true,
  },
  {
    id: 'gale',
    name: 'GALE CRATER',
    type: 'CRATER',
    region: 'AEOLIS PALUS',
    lat: '5.4° S',
    lon: '137.4° E',
    latDeg: -5.37,
    lonDeg: 137.44,
    elevation: '-4,450 M',
    quadrangle: 'MC-23 AEOLIS',
    targetBadge: 'MSL CURIOSITY ROVER (2012)',
  },
  {
    id: 'olympus',
    name: 'OLYMPUS MONS',
    type: 'SHIELD VOLCANO',
    region: 'THARSIS RISE',
    lat: '18.7° N',
    lon: '226.2° E',
    latDeg: 18.65,
    lonDeg: 226.20,
    elevation: '+21,287 M',
    quadrangle: 'MC-09 THARSIS',
    targetBadge: 'SOLAR SYSTEM HIGHEST PEAK',
  },
  {
    id: 'marineris',
    name: 'VALLES MARINERIS',
    type: 'TECTONIC RIFT',
    region: 'COPRATES CHASMA',
    lat: '14.0° S',
    lon: '300.8° E',
    latDeg: -14.00,
    lonDeg: 300.80,
    elevation: '-7,000 M',
    quadrangle: 'MC-18 COPRATES',
    targetBadge: '4,000 KM CANYON SYSTEM',
  },
];

interface PlanetarySearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: PlanetaryLocation) => void;
}

export const PlanetarySearchOverlay: React.FC<PlanetarySearchOverlayProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus the planetary search input
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery('');
      setSelectedId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Filter locations dynamically based on user input
  const filteredLocations = PLANETARY_LOCATIONS.filter((loc) => {
    if (!normalizedQuery) return true;
    return (
      loc.name.toLowerCase().includes(normalizedQuery) ||
      loc.region.toLowerCase().includes(normalizedQuery) ||
      loc.type.toLowerCase().includes(normalizedQuery) ||
      loc.lat.toLowerCase().includes(normalizedQuery) ||
      loc.lon.toLowerCase().includes(normalizedQuery)
    );
  });

  const handleSelect = (loc: PlanetaryLocation) => {
    if (selectedId) return; // already transitioning
    setSelectedId(loc.id);
    soundManager.playTargetSelectTone();

    // Give visual feedback for "TARGET SELECTED"
    setTimeout(() => {
      onSelectLocation(loc);
    }, 700);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && filteredLocations.length > 0) {
      handleSelect(filteredLocations[0]);
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 pointer-events-auto animate-fadeIn select-none">
      {/* Subtle outer vignette backdrop allowing Mars to remain clearly visible */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[4px] transition-opacity"
        onClick={onClose}
      />

      {/* Main Floating Planetary Navigation Search Panel */}
      <div
        className="relative w-full max-w-xl bg-slate-950/85 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.85),0_0_25px_rgba(34,211,238,0.12)] overflow-hidden transition-all duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Precision NASA Corner Reticle Brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

        {/* Panel Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/90 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-tech tracking-[0.2em] text-white uppercase">
                  SEARCH MARS
                </span>
                <span className="text-[9px] font-mono-data px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                  AREOGRAPHIC GIS
                </span>
              </div>
              <div className="text-[10px] font-mono-data text-slate-400">
                PLANETARY EXPLORATION NAVIGATION // THE SOL EXPLORERS
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Return to Space Observation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="p-6 pb-4">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-cyan-400/80 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search location... (e.g. Jezero Crater)"
              className="w-full pl-11 pr-10 py-3.5 bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-lg text-white placeholder-slate-500 font-mono-data text-sm outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Target Suggestions */}
          <div className="flex items-center flex-wrap gap-1.5 mt-3 text-[10px] font-mono-data">
            <span className="text-slate-500 uppercase tracking-wider mr-1">TARGETS:</span>
            {PLANETARY_LOCATIONS.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setSearchQuery(loc.name)}
                className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                  loc.isPrimary
                    ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/60'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between text-[10px] font-mono-data text-slate-500 tracking-wider uppercase mb-2">
            <span>SEARCH RESULTS ({filteredLocations.length})</span>
            <span>PRESS ENTER OR CLICK TO SELECT</span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((loc) => {
                const isSelected = selectedId === loc.id;

                return (
                  <div
                    key={loc.id}
                    onClick={() => handleSelect(loc)}
                    className={`group relative p-3.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                        : loc.isPrimary
                        ? 'bg-slate-900/70 border-cyan-500/40 hover:border-cyan-400 hover:bg-slate-850'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-600 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {/* Target Badge / Category */}
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[9px] font-mono-data px-1.5 py-0.2 rounded border font-semibold ${
                              loc.isPrimary
                                ? 'bg-cyan-950 text-cyan-300 border-cyan-700/60'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {loc.type}
                          </span>
                          <span className="text-[10px] font-mono-data text-slate-400">
                            {loc.region} · MARS
                          </span>
                        </div>

                        {/* Location Name */}
                        <div className="text-base font-bold font-tech tracking-[0.18em] text-white group-hover:text-cyan-200 transition-colors uppercase">
                          {loc.name}
                        </div>

                        {/* Coordinates & Scientific Data */}
                        <div className="flex items-center gap-2 text-xs font-mono-data text-slate-300 mt-1">
                          <span className="text-cyan-300 font-semibold">{loc.lat}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-cyan-300 font-semibold">{loc.lon}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-400">{loc.elevation}</span>
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      <div className="flex flex-col items-end justify-center">
                        {isSelected ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500 text-[10px] font-mono-data font-bold tracking-wider animate-pulse">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>TARGET SELECTED</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[11px] font-mono-data text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity">
                            <span className="hidden sm:inline text-[9px] tracking-wider uppercase text-slate-400">
                              SELECT
                            </span>
                            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status notification when selected */}
                    {isSelected && (
                      <div className="mt-2 pt-2 border-t border-cyan-500/30 text-[10px] font-mono-data text-cyan-200 flex items-center justify-between">
                        <span>INITIATING CONTINUOUS DESCENT VECTOR...</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-slate-900/30 rounded-lg border border-slate-800 text-slate-400 font-mono-data text-xs">
                <Crosshair className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                <div>NO MATCHING AREOGRAPHIC LOCATION FOUND</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Try searching for "Jezero Crater", "Gale", "Olympus Mons", or "Valles Marineris"
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel Footer */}
        <div className="px-6 py-2.5 bg-slate-950 border-t border-slate-900 flex items-center justify-between text-[9px] font-mono-data text-slate-500">
          <span>REFERENCE: AREOCENTRIC COORDINATE SYSTEM 2020</span>
          <span>CLICK OUTSIDE OR ESC TO CANCEL</span>
        </div>
      </div>
    </div>
  );
};
