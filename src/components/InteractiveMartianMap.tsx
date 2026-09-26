import React, { useState } from 'react';
import { JEZERO_WAYPOINTS, MISSION_METRICS } from '../data/jezeroData';
import { MissionWaypoint, MapLayer } from '../types';
import { Layers, MapPin, ZoomIn, ZoomOut, RotateCcw, Compass, Crosshair, ChevronRight, Info, Play, Radio, Eye } from 'lucide-react';

interface InteractiveMartianMapProps {
  onReplayCinematic: () => void;
  onStartJourney?: () => void;
}

export const InteractiveMartianMap: React.FC<InteractiveMartianMapProps> = ({
  onReplayCinematic,
  onStartJourney,
}) => {
  const [selectedWaypoint, setSelectedWaypoint] = useState<MissionWaypoint>(JEZERO_WAYPOINTS[0]);
  const [activeLayer, setActiveLayer] = useState<MapLayer>('ortho');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [showRoverPath, setShowRoverPath] = useState<boolean>(true);
  const [hoveredWaypoint, setHoveredWaypoint] = useState<MissionWaypoint | null>(null);

  // Satellite and surface image paths
 const orthoImage = new URL(
  '../assets/images/jezero_crater_ortho_1790269015798.jpg',
  import.meta.url
).href;

const obliqueImage = new URL(
  '../assets/images/jezero_delta_surface_1790269027984.jpg',
  import.meta.url
).href;

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 2.2));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.85));
  const handleResetZoom = () => setZoomLevel(1.0);

  return (
    <div className="flex flex-col h-full bg-[#07090e] text-slate-100 font-sans">
      {/* 1. Main Interactive Workspace Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Interactive Crater Map Canvas (8 cols on lg) */}
        <div className="lg:col-span-8 relative bg-black flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden select-none">
          {/* Map Top Bar Control Ribbon */}
          <div className="h-11 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between z-20">
            {/* Layer Selectors (Segmented interactive controls) */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono-data text-slate-400 mr-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                LAYER:
              </span>
              <div className="flex items-center bg-slate-800/80 p-0.5 rounded border border-slate-700">
                <button
                  onClick={() => setActiveLayer('ortho')}
                  className={`px-2.5 py-1 text-xs font-mono-data rounded transition-colors ${
                    activeLayer === 'ortho'
                      ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  HiRISE Ortho
                </button>
                <button
                  onClick={() => setActiveLayer('elevation')}
                  className={`px-2.5 py-1 text-xs font-mono-data rounded transition-colors ${
                    activeLayer === 'elevation'
                      ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  MOLA Elevation
                </button>
                <button
                  onClick={() => setActiveLayer('minerals')}
                  className={`px-2.5 py-1 text-xs font-mono-data rounded transition-colors ${
                    activeLayer === 'minerals'
                      ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  CRISM Mineralogy
                </button>
              </div>
            </div>

            {/* Map Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRoverPath(!showRoverPath)}
                className={`px-2.5 py-1 text-xs font-mono-data rounded border transition-colors flex items-center gap-1.5 ${
                  showRoverPath
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Crosshair className="w-3 h-3" />
                <span>Traverse Path</span>
              </button>

              <div className="flex items-center bg-slate-800 rounded border border-slate-700">
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border-l border-slate-700"
                  title="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border-l border-slate-700"
                  title="Reset view"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Map Viewport Area */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center cursor-crosshair">
            <div
              className="relative w-full h-full transition-transform duration-300 ease-out"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* Satellite Ortho Base */}
              <img
                src={orthoImage}
                alt="Jezero Crater High Resolution Satellite Orthomosaic"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none"
              />

              {/* Layer 2: MOLA Elevation false color gradient */}
              {activeLayer === 'elevation' && (
                <div
                  className="absolute inset-0 mix-blend-color opacity-75 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse at 35% 48%, rgba(20, 60, 180, 0.85) 0%, rgba(30, 160, 110, 0.75) 45%, rgba(220, 140, 30, 0.75) 85%, rgba(180, 40, 20, 0.85) 100%)'
                  }}
                />
              )}

              {/* Layer 3: CRISM Mineralogy Hydrated minerals heatmap */}
              {activeLayer === 'minerals' && (
                <div
                  className="absolute inset-0 mix-blend-screen opacity-70 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle at 32% 48%, rgba(6, 182, 212, 0.85) 0%, rgba(168, 85, 247, 0.45) 30%, transparent 70%), radial-gradient(circle at 45% 62%, rgba(234, 179, 8, 0.75) 0%, transparent 40%)'
                  }}
                />
              )}

              {/* Coordinate Grid Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
                  backgroundSize: '80px 80px'
                }}
              />

              {/* SVG Rover Traverse Path & Sol Checkpoints */}
              {showRoverPath && (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
  >
    {/* Traverse line */}
    <polyline
      points="48,54 45,62 40,52 36,50 32,48 30,24"
      fill="none"
      stroke="#f59e0b"
      strokeWidth="0.5"
      strokeDasharray="1.5 1"
      vectorEffect="non-scaling-stroke"
    />

    {/* Trajectory dots */}
    <circle cx="48" cy="54" r="1" fill="#10b981" />
    <circle cx="45" cy="62" r="0.75" fill="#f59e0b" />
    <circle cx="40" cy="52" r="0.75" fill="#f59e0b" />
    <circle cx="32" cy="48" r="1" fill="#38bdf8" />
    <circle cx="30" cy="24" r="0.75" fill="#f59e0b" />
  </svg>
)}

              {/* Interactive Waypoint Pins */}
              {JEZERO_WAYPOINTS.map((wp) => {
                const isSelected = selectedWaypoint.id === wp.id;
                const isHovered = hoveredWaypoint?.id === wp.id;

                return (
                  <button
                    key={wp.id}
                    onClick={() => setSelectedWaypoint(wp)}
                    onMouseEnter={() => setHoveredWaypoint(wp)}
                    onMouseLeave={() => setHoveredWaypoint(null)}
                    style={{ left: `${wp.coordinates[0]}%`, top: `${wp.coordinates[1]}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none z-10 cursor-pointer"
                  >
                    {/* Ring ping on selected */}
                    {isSelected && (
                      <span className="absolute -inset-2 rounded-full border border-cyan-400 animate-ping opacity-75" />
                    )}

                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-full border transition-transform ${
                        isSelected
                          ? 'bg-cyan-500 border-white text-slate-950 scale-110 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                          : 'bg-slate-900/90 border-cyan-400/60 text-cyan-300 hover:scale-110'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>

                    {/* Floating label */}
                    <div
                      className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-slate-950/90 border border-slate-700 rounded text-[11px] font-mono-data whitespace-nowrap pointer-events-none transition-opacity ${
                        isSelected || isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <span className="text-white font-medium">{wp.name}</span>
                      <span className="text-slate-500 ml-1.5 font-mono-data">Sol {wp.sol}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom-left Map Compass & Scale */}
            <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-xs border border-slate-800 px-3 py-2 rounded text-xs font-mono-data text-slate-300 pointer-events-none z-10">
              <div className="flex items-center gap-2 text-cyan-400">
                <Compass className="w-4 h-4" />
                <span>NORTH: 000° AREOCENTRIC</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-slate-400">
                <div className="w-12 h-1 bg-slate-400" />
                <span>5.0 KM</span>
              </div>
            </div>

            {/* Bottom-right Layer Legend */}
            <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-xs border border-slate-800 px-3 py-2 rounded text-xs font-mono-data text-slate-300 pointer-events-none z-10">
              {activeLayer === 'ortho' && <span>HiRISE 25cm/px Ground Sampling</span>}
              {activeLayer === 'elevation' && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs" />
                  <span>-2.6 km (Floor)</span>
                  <span className="text-slate-500">→</span>
                  <span className="w-2.5 h-2.5 bg-amber-600 rounded-xs" />
                  <span>-1.5 km (Rim)</span>
                </div>
              )}
              {activeLayer === 'minerals' && (
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">● Fe/Mg Smectites</span>
                  <span className="text-amber-400">● Olivine</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Scientific Telemetry & Selected Waypoint Dossier (4 cols on lg) */}
        <div className="lg:col-span-4 bg-[#0c1018] flex flex-col justify-between border-t lg:border-t-0 border-slate-800 overflow-y-auto">
          {/* Waypoint Detail Section */}
          <div className="p-6 space-y-5">
            {/* Header with Coordinates */}
            <div>
              <div className="flex items-center gap-2 text-xs font-mono-data text-slate-400 mb-1">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>TARGET DOSSIER</span>
                <span className="text-slate-600">·</span>
                <span className="text-cyan-400 uppercase font-mono-data">{selectedWaypoint.type.replace('_', ' ')}</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight font-tech">
                {selectedWaypoint.name}
              </h2>
            </div>

            {/* Oblique Geological Snapshot preview */}
            <div className="relative rounded-lg overflow-hidden border border-slate-800 h-36 bg-slate-900">
              <img
                src={obliqueImage}
                alt={selectedWaypoint.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-mono-data text-slate-300">
                <span>SURFACE OBLIQUE ELEVATION</span>
                <span className="text-emerald-400">SOL {selectedWaypoint.sol} ACQUIRED</span>
              </div>
            </div>

            {/* Scientific Metrics Grid (Tabular Numbers) */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
              <div>
                <div className="text-[11px] uppercase font-mono-data text-slate-400">Latitude</div>
                <div className="text-sm font-mono-data font-semibold text-slate-200">
                  {selectedWaypoint.lat.toFixed(4)}° N
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase font-mono-data text-slate-400">Longitude</div>
                <div className="text-sm font-mono-data font-semibold text-slate-200">
                  {selectedWaypoint.lon.toFixed(4)}° E
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase font-mono-data text-slate-400">Elevation</div>
                <div className="text-sm font-mono-data font-semibold text-cyan-300">
                  {selectedWaypoint.elevation}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase font-mono-data text-slate-400">Mission Sol</div>
                <div className="text-sm font-mono-data font-semibold text-amber-300">
                  Sol {selectedWaypoint.sol}
                </div>
              </div>
            </div>

            {/* Geological Description */}
            <div className="space-y-2">
              <div className="text-xs font-mono-data text-slate-400 uppercase tracking-wide">
                Geological Observation
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedWaypoint.description}
              </p>
            </div>

            {/* Astrobiological Significance */}
            <div className="space-y-1.5 p-3 rounded bg-cyan-950/20 border border-cyan-900/40">
              <div className="text-xs font-mono-data text-cyan-400 uppercase flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Biosignature Potential
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedWaypoint.significance}
              </p>
            </div>

            {/* Quick Waypoint Selector List */}
            <div className="space-y-1 pt-2 border-t border-slate-800">
              <div className="text-xs font-mono-data text-slate-400 uppercase mb-2">
                Mission Target Waypoints
              </div>
              <div className="space-y-1">
                {JEZERO_WAYPOINTS.map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => setSelectedWaypoint(wp)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono-data flex items-center justify-between transition-colors ${
                      selectedWaypoint.id === wp.id
                        ? 'bg-slate-800 text-cyan-300 border-l-2 border-cyan-400'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <span className="truncate">{wp.name}</span>
                    <span className="text-slate-500 shrink-0 ml-2">Sol {wp.sol}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Action Drawer: Actions */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
            {onStartJourney ? (
              <button
                onClick={onStartJourney}
                className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono-data rounded transition-colors flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>START GUIDED JOURNEY</span>
              </button>
            ) : (
              <div className="text-[11px] font-mono-data text-slate-400">
                NASA SPACE APPS CHALLENGE
              </div>
            )}

            <button
              onClick={onReplayCinematic}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs font-mono-data rounded border border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>REPLAY 8S</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
