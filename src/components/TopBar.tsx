import React from 'react';
import { Play, Map, Compass } from 'lucide-react';

interface TopBarProps {
  currentView: 'cinematic' | 'journey' | 'map';
  onSelectView: (view: 'cinematic' | 'journey' | 'map') => void;
  onPlayCinematic: () => void;
  onStartJourney: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onSelectView,
  onPlayCinematic,
  onStartJourney,
}) => {
  return (
    <header className="h-14 bg-[#070a10]/95 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between z-40 select-none">
      {/* Zone 1: Brand Title - Single text element wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelectView('cinematic');
        }}
        className="text-base sm:text-lg font-bold tracking-tight text-white font-tech hover:text-cyan-300 transition-colors whitespace-nowrap"
      >
        The Sol Explorers
      </a>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-mono-data text-slate-400">
        <button
          onClick={() => onSelectView('cinematic')}
          className={`hover:text-white transition-colors cursor-pointer ${
            currentView === 'cinematic' ? 'text-cyan-300 font-semibold border-b border-cyan-400 pb-0.5' : ''
          }`}
        >
          Cinematic Descent (8s)
        </button>
        <button
          onClick={() => onSelectView('journey')}
          className={`hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 ${
            currentView === 'journey' ? 'text-cyan-300 font-semibold border-b border-cyan-400 pb-0.5' : ''
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Guided Journey (Whole Video)
        </button>
        <button
          onClick={() => onSelectView('map')}
          className={`hover:text-white transition-colors cursor-pointer ${
            currentView === 'map' ? 'text-cyan-300 font-semibold border-b border-cyan-400 pb-0.5' : ''
          }`}
        >
          Jezero Crater Map
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2.5">
        {currentView === 'cinematic' ? (
          <button
            onClick={onStartJourney}
            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono-data rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Start The Journey</span>
          </button>
        ) : (
          <button
            onClick={onPlayCinematic}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-mono-data rounded border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="whitespace-nowrap">Play 8s Transition</span>
          </button>
        )}
      </div>
    </header>
  );
};

