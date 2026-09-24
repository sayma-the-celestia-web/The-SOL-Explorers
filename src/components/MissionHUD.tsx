import React from 'react';

interface MissionHUDProps {
  currentTime: number; // 0.00 to 8.00s
  onSkipToMap?: () => void;
  onStartJourney?: () => void;
  onReturnToOrbit?: () => void;
  showTelemetryDetails?: boolean;
  stage?: 'observing' | 'searching' | 'zooming' | 'arrived';
}

export const MissionHUD: React.FC<MissionHUDProps> = ({
  currentTime,
  onSkipToMap,
  onStartJourney,
  onReturnToOrbit,
  showTelemetryDetails = true,
  stage = 'zooming',
}) => {
  // If in initial observation or search stage, do NOT show dashboard HUD
  if (stage === 'observing' || stage === 'searching') {
    return null;
  }
  // Calculated live telemetry based on descent curve
  // 0s: 6,840 km altitude
  // 2s: 5,420 km altitude
  // 4s: 320 km altitude (orbital entry)
  // 6s: 48 km altitude (crater acquisition)
  // 8s: 12 km altitude (surface map lock)
  const getAltitude = (t: number): string => {
    if (t < 2.0) {
      const alt = 6840 - (t / 2.0) * 1420;
      return `${Math.round(alt).toLocaleString()} KM`;
    } else if (t < 4.0) {
      const progress = (t - 2.0) / 2.0;
      const alt = 5420 - Math.pow(progress, 1.8) * 5100;
      return `${Math.round(alt).toLocaleString()} KM`;
    } else if (t < 6.0) {
      const progress = (t - 4.0) / 2.0;
      const alt = 320 - Math.pow(progress, 0.9) * 272;
      return `${alt.toFixed(1)} KM`;
    } else {
      const progress = (t - 6.0) / 2.0;
      const alt = 48 - progress * 36;
      return `${alt.toFixed(2)} KM`;
    }
  };

  const getVelocity = (t: number): string => {
    if (t < 2.0) {
      return '3.42 KM/S';
    } else if (t < 4.0) {
      const v = 3.42 + ((t - 2.0) / 2.0) * 4.15;
      return `${v.toFixed(2)} KM/S`;
    } else if (t < 6.0) {
      const v = 7.57 - ((t - 4.0) / 2.0) * 6.2;
      return `${v.toFixed(2)} KM/S`;
    } else {
      const v = 1.37 - ((t - 6.0) / 2.0) * 0.95;
      return `${v.toFixed(2)} KM/S`;
    }
  };

  // Optical field of view calculation
  const getFov = (t: number): string => {
    if (t < 2.0) return '42.0°';
    if (t < 4.0) return `${(42.0 - ((t - 2.0) / 2.0) * 14.0).toFixed(1)}°`;
    if (t < 6.0) return `${(28.0 - ((t - 4.0) / 2.0) * 9.0).toFixed(1)}°`;
    return '19.0°';
  };

  // Phase badges and indicators
  const isPhaseOrbit = currentTime < 2.0;
  const isPhaseDescent = currentTime >= 2.0 && currentTime < 4.0;
  const isPhaseAcquire = currentTime >= 4.0 && currentTime < 6.0;
  const isPhaseLock = currentTime >= 6.0;

  // Fade in factor for subtle mission-interface elements around Mars during opening (0-2s)
  const orbitTelemetryOpacity = Math.max(0, Math.min(1, (currentTime - 0.3) / 0.8));

  // Typewriter coordinate effect for 4s-6s
  const textProgress = Math.max(0, Math.min(1, (currentTime - 4.0) / 0.7));
  const fullTargetText = 'TARGET AREA: ACQUIRED';
  const displayedTargetText = fullTargetText.slice(0, Math.ceil(fullTargetText.length * textProgress));

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 font-sans text-slate-100 flex flex-col justify-between p-6 sm:p-8">
      {/* 1. Viewfinder Corner Optical Fiducials (NASA metric camera reseau crosses) */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/35">
        <span className="absolute top-1 left-1 text-[8px] font-mono-data text-white/30">NW-1</span>
      </div>
      <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/35">
        <span className="absolute top-1 right-1 text-[8px] font-mono-data text-white/30">NE-2</span>
      </div>
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/35">
        <span className="absolute bottom-1 left-1 text-[8px] font-mono-data text-white/30">SW-3</span>
      </div>
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/35">
        <span className="absolute bottom-1 right-1 text-[8px] font-mono-data text-white/30">SE-4</span>
      </div>

      {/* Metric Camera Reseau Crosshair Marks on Focal Plane */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 text-white/20 font-mono-data text-[10px] leading-none pointer-events-none select-none">
        +
      </div>
      <div className="absolute top-1/4 right-1/4 w-2 h-2 text-white/20 font-mono-data text-[10px] leading-none pointer-events-none select-none">
        +
      </div>
      <div className="absolute bottom-1/4 left-1/4 w-2 h-2 text-white/20 font-mono-data text-[10px] leading-none pointer-events-none select-none">
        +
      </div>
      <div className="absolute bottom-1/4 right-1/4 w-2 h-2 text-white/20 font-mono-data text-[10px] leading-none pointer-events-none select-none">
        +
      </div>

      {/* 2. Top Header Ribbon */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Mission Brand & Trajectory */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-xs font-semibold tracking-wider text-slate-200 uppercase font-tech">
              The Sol Explorers
            </span>
            <span className="text-xs text-slate-500 font-mono-data">·</span>
            <span className="text-xs text-slate-400 font-mono-data tracking-tight">
              NASA SPACE APPS CHALLENGE
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono-data tracking-wide">
            {isPhaseOrbit && 'ORBITAL OBSERVATION // MARS GLOBAL ESTABLISHMENT'}
            {isPhaseDescent && 'APPROACH VECTOR: CONTROLLED DESCENT TRAJECTORY'}
            {isPhaseAcquire && 'OPTICAL RECOGNITION: JEZERO REGION QUADRANGLE'}
            {isPhaseLock && 'SECTOR LOCK: JEZERO CRATER PALEOFAN'}
          </div>
        </div>

        {/* Right: Scientific Telemetry Stream */}
        {showTelemetryDetails && (
          <div className="text-right flex flex-col gap-1 items-end">
            <div className="flex items-center gap-3 text-xs font-mono-data text-slate-300">
              <span>
                <span className="text-slate-500 mr-1">ALT</span>
                <span className="font-semibold text-cyan-300">{getAltitude(currentTime)}</span>
              </span>
              <span className="text-slate-600">|</span>
              <span>
                <span className="text-slate-500 mr-1">VEL</span>
                <span className="font-semibold text-slate-200">{getVelocity(currentTime)}</span>
              </span>
              <span className="text-slate-600">|</span>
              <span>
                <span className="text-slate-500 mr-1">FOV</span>
                <span className="font-semibold text-slate-300">{getFov(currentTime)}</span>
              </span>
            </div>

            <div className="text-[11px] font-mono-data text-slate-400 flex items-center gap-2">
              <span className="text-slate-500">T+00:0{currentTime.toFixed(2)}S</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400">● TELEMETRY NOMINAL</span>
            </div>
          </div>
        )}
      </div>

      {/* 2.5 Subtle Orbital Telemetry Elements Fading in around Mars (0-2s) */}
      {isPhaseOrbit && (
        <div
          className="absolute left-8 top-1/3 max-w-xs transition-opacity duration-700 pointer-events-none"
          style={{ opacity: orbitTelemetryOpacity }}
        >
          <div className="border-l-2 border-cyan-400/50 pl-3 py-1 flex flex-col gap-1 text-[11px] font-mono-data text-slate-300 backdrop-blur-[2px] bg-slate-950/20 rounded-r">
            <div className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
              <span>MARS APPROACH TELEMETRY</span>
            </div>
            <div className="text-slate-400 flex justify-between gap-4">
              <span>TARGET BARYCENTER:</span>
              <span className="text-slate-200">NAIF ID 499</span>
            </div>
            <div className="text-slate-400 flex justify-between gap-4">
              <span>SOLAR PHASE:</span>
              <span className="text-slate-200">38.4° (WAXING GIBBOUS)</span>
            </div>
            <div className="text-slate-400 flex justify-between gap-4">
              <span>SOLAR IRRADIANCE:</span>
              <span className="text-slate-200">590 W/m² (1.524 AU)</span>
            </div>
            <div className="text-slate-400 flex justify-between gap-4">
              <span>1-WAY LIGHT TIME:</span>
              <span className="text-cyan-300">11m 48.2s</span>
            </div>
            <div className="text-slate-400 flex justify-between gap-4">
              <span>DSN GROUND LINK:</span>
              <span className="text-emerald-400">GOLDSTONE 8.4 GHz</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Center Screen Targeting Reticle & HUD Prompt (Appears at 4.0s - 8.0s) */}
      {(isPhaseAcquire || isPhaseLock) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative flex flex-col items-center">
            {/* The Reticle Frame */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center">
              {/* Thin circular scan ring */}
              <div
                className={`absolute inset-0 rounded-full border transition-all duration-300 ${
                  isPhaseLock
                    ? 'border-cyan-400/90 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                    : 'border-cyan-400/40 border-dashed animate-scan-sweep'
                }`}
              />

              {/* Reticle brackets */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

              {/* Crosshair Center */}
              <div className="w-2 h-2 rounded-full bg-cyan-400/80" />
              <div className="absolute w-8 h-[1px] bg-cyan-400/60" />
              <div className="absolute h-8 w-[1px] bg-cyan-400/60" />

              {/* Circular scan pulse for 6s-8s */}
              {isPhaseLock && (
                <div className="absolute inset-2 rounded-full border border-cyan-300/60 animate-ping opacity-30" />
              )}
            </div>

            {/* Scientific HUD Typography & Clean Location Representation */}
            <div className="mt-4 flex flex-col items-center text-center bg-slate-950/85 backdrop-blur-md px-5 py-3 rounded-lg border border-cyan-500/35 shadow-[0_0_25px_rgba(6,182,212,0.2)] max-w-sm sm:max-w-md">
              {/* Mission Header Tag */}
              <div className="flex items-center gap-2 text-[10px] font-mono-data tracking-wider uppercase text-cyan-400 font-semibold mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>NASA MARS 2020 · OPTICAL NAVIGATION</span>
              </div>

              {/* Clean, Prominent Location Name */}
              <div className="text-lg sm:text-xl font-bold tracking-[0.25em] text-white font-tech uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                JEZERO CRATER
              </div>

              {/* Precise Coordinates and Elevation */}
              <div className="flex items-center justify-center gap-2 mt-1.5 text-xs font-mono-data text-slate-200 border-y border-slate-800/80 py-1 w-full">
                <span className="text-cyan-300 font-medium">18.4446° N</span>
                <span className="text-slate-600">·</span>
                <span className="text-cyan-300 font-medium">77.4509° E</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-300">ELEV -2,540 M</span>
              </div>

              {/* Sector & Landing Zone Description */}
              <div className="text-[10px] font-mono-data text-slate-400 mt-1">
                OCTAVIA E. BUTLER LANDING SITE · DELTA PALEOFAN
              </div>

              {/* Target Status State */}
              <div className="mt-2 text-xs font-mono-data tracking-wider uppercase font-semibold w-full">
                {isPhaseAcquire && (
                  <span className="text-cyan-300 flex items-center justify-center gap-1.5 bg-cyan-950/50 border border-cyan-800/60 py-1 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    {displayedTargetText}
                  </span>
                )}

                {isPhaseLock && (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-emerald-300 tracking-widest flex items-center justify-center gap-1.5 bg-emerald-950/50 border border-emerald-800/60 py-1 px-3 rounded w-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      MISSION SECTOR LOCKED
                    </span>

                    {/* Start The Journey Interactive Guidance Prompt */}
                    {onStartJourney && (
                      <div className="mt-1 pointer-events-auto w-full">
                        <button
                          onClick={onStartJourney}
                          className="w-full py-2 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono-data rounded shadow-[0_0_15px_rgba(6,182,212,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <span>START THE JOURNEY</span>
                          <span>→</span>
                        </button>
                        <div className="text-[10px] text-cyan-300 font-mono-data mt-1 tracking-tight">
                          EXPEDITION GUIDANCE FOR HUMANS & MACHINES
                        </div>
                      </div>
                    )}

                    {currentTime >= 7.2 && !onStartJourney && (
                      <span className="text-[10px] text-slate-400 tracking-normal normal-case mt-0.5 animate-pulse">
                        Transitioning to interactive expedition...
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bottom Mission Status & Map / Journey Quick-Transition Buttons */}
      <div className="flex items-end justify-between w-full">
        {/* Left: Scientific Reference Data */}
        <div className="text-[11px] font-mono-data text-slate-400 hidden sm:block">
          <div>QUADRANGLE: MC-13 SYRTIS MAJOR</div>
          <div>DATUM: AREOCENTRIC / MARS 2020 REFERENCE SPHEROID</div>
        </div>

        {/* Right: Quick Transitions */}
        <div className="pointer-events-auto flex items-center gap-2">
          {onReturnToOrbit && (
            <button
              onClick={onReturnToOrbit}
              className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-xs font-mono-data text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Return to Space Orbit Observation"
            >
              <span>↺</span>
              <span>ORBIT VIEW</span>
            </button>
          )}

          {onStartJourney && (
            <button
              onClick={onStartJourney}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono-data rounded shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>START JOURNEY</span>
              <span>→</span>
            </button>
          )}

          {onSkipToMap && (
            <button
              onClick={onSkipToMap}
              className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-xs font-mono-data text-slate-300 hover:text-white border border-slate-700 hover:border-cyan-500/50 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>SURFACE MAP</span>
              <span className="text-cyan-400">→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
