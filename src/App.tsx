import React, { useState, useEffect, useRef } from 'react';
import { MarsVisualizer } from './components/MarsVisualizer';
import { MissionHUD } from './components/MissionHUD';
import { InteractiveMartianMap } from './components/InteractiveMartianMap';
import { GuidedMissionJourney } from './components/GuidedMissionJourney';
import { TimelineControls } from './components/TimelineControls';
import { TopBar } from './components/TopBar';
import { DirectorsBriefModal } from './components/DirectorsBriefModal';
import { PlanetarySearchOverlay, PlanetaryLocation } from './components/PlanetarySearchOverlay';
import { soundManager } from './services/soundManager';
import { videoRecorder } from './services/recorder';
import { FileText, Compass, RotateCcw, Sliders } from 'lucide-react';

export default function App() {
  // Opening Experience Stages:
  // 'observing': Stage 1 — Realistic space view, Mars floating in space, slow rotation, Phobos & Deimos, minimal UI
  // 'searching': Stage 2 — Clicked Mars -> Search location panel opened over Mars
  // 'zooming': Transitioning — Continuous cinematic dive into Jezero Crater
  // 'arrived': Target acquired & locked at Jezero Crater
  const [stage, setStage] = useState<'observing' | 'searching' | 'zooming' | 'arrived'>('observing');

  const [currentTime, setCurrentTime] = useState<number>(0.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentView, setCurrentView] = useState<'cinematic' | 'journey' | 'map'>('cinematic');
  const [isCinematic169, setIsCinematic169] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [freeCameraMode, setFreeCameraMode] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [showBriefModal, setShowBriefModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showManualControls, setShowManualControls] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const appContainerRef = useRef<HTMLDivElement>(null);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const animationFrameRef = useRef<number | null>(null);

  // Playback Animation Loop for Zoom Transition (0.00s to 8.00s)
  useEffect(() => {
    const loop = (now: number) => {
      const delta = (now - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = now;

      if (isPlaying && (stage === 'zooming' || freeCameraMode)) {
        setCurrentTime((prevTime) => {
          const nextTime = prevTime + delta * playbackSpeed;
          if (nextTime >= 8.0) {
            // Reached Jezero Crater
            setIsPlaying(false);
            setStage('arrived');
            if (isRecording) {
              videoRecorder.stopRecording();
              setIsRecording(false);
            }
            return 8.0;
          }
          return nextTime;
        });
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    lastFrameTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, isRecording, stage, freeCameraMode]);

  // Stage 1 -> Stage 2: User clicks Mars
  const handleMarsClick = () => {
    if (stage === 'observing') {
      setStage('searching');
    }
  };

  // Close search and return to observation
  const handleCloseSearch = () => {
    setStage('observing');
  };

  // Stage 2 -> Zoom: User selects location (Jezero Crater)
  const handleSelectLocation = (_loc: PlanetaryLocation) => {
    // Initiate continuous cinematic zoom into Jezero Crater
    setStage('zooming');
    setCurrentTime(0.0);
    soundManager.resetTimelineFlags();
    setIsPlaying(true);
    lastFrameTimeRef.current = performance.now();
  };

  // Return from Jezero back to Orbit observation (Stage 1)
  const handleReturnToOrbit = () => {
    setStage('observing');
    setCurrentTime(0.0);
    setIsPlaying(false);
    setCurrentView('cinematic');
    soundManager.resetTimelineFlags();
    lastFrameTimeRef.current = performance.now();
  };

  // Handle Play/Pause in manual zoom mode
  const handleTogglePlay = () => {
    if (currentTime >= 8.0) {
      handleReturnToOrbit();
      return;
    }
    setIsPlaying(!isPlaying);
  };

  // Seek handler from scrubber
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (time > 0 && stage === 'observing') {
      setStage('zooming');
    }
    if (time >= 8.0) {
      setStage('arrived');
    }
    lastFrameTimeRef.current = performance.now();
  };

  // Start Guided Mission Journey
  const handleStartJourney = () => {
    setIsPlaying(false);
    setCurrentView('journey');
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      appContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Start 8-second 60fps video recording
  const handleStartRecording = () => {
    if (!canvasRef.current || isRecording) return;
    setStage('zooming');
    setCurrentTime(0.0);
    soundManager.resetTimelineFlags();
    setIsPlaying(true);
    const started = videoRecorder.startRecording(canvasRef.current);
    if (started) {
      setIsRecording(true);
    }
  };

  // In Stage 1 & 2, keep the space view completely immersive (no dashboards or cards)
  const isImmersiveOpening = (stage === 'observing' || stage === 'searching') && currentView === 'cinematic';
  const showNavBars = !isImmersiveOpening || showManualControls;

  return (
    <div
      ref={appContainerRef}
      className="flex flex-col h-screen w-screen bg-[#010204] text-slate-100 overflow-hidden font-sans select-none"
    >
      {/* 1. Header Bar: Shown when exploring surface/journey or when toggled */}
      {showNavBars && (
        <TopBar
          currentView={currentView}
          onSelectView={(view) => {
            setCurrentView(view);
            if (view === 'cinematic') {
              handleReturnToOrbit();
            }
          }}
          onPlayCinematic={() => {
            setCurrentView('cinematic');
            handleSelectLocation({} as PlanetaryLocation);
          }}
          onStartJourney={handleStartJourney}
        />
      )}

      {/* 2. Main Visual Stage */}
      <main className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
        {currentView === 'cinematic' ? (
          /* Interactive 3D Mars Viewport */
          <div
            className={`relative w-full h-full flex items-center justify-center ${
              isCinematic169 ? 'max-w-[1920px] aspect-video max-h-full' : ''
            }`}
          >
            {/* 3D WebGL Mars Engine */}
            <MarsVisualizer
              currentTime={currentTime}
              isPlaying={isPlaying}
              isCinematic169={isCinematic169}
              freeCameraMode={freeCameraMode}
              stage={stage}
              onMarsClick={handleMarsClick}
              onCanvasReady={(canvas) => {
                canvasRef.current = canvas;
              }}
            />

            {/* Stage 2: Planetary Search Overlay (Appears when Mars is clicked) */}
            <PlanetarySearchOverlay
              isOpen={stage === 'searching'}
              onClose={handleCloseSearch}
              onSelectLocation={handleSelectLocation}
            />

            {/* Scientific Mission HUD: Active during zoom descent into Jezero Crater */}
            <MissionHUD
              currentTime={currentTime}
              stage={stage}
              onSkipToMap={() => setCurrentView('map')}
              onStartJourney={handleStartJourney}
              onReturnToOrbit={handleReturnToOrbit}
              showTelemetryDetails={!freeCameraMode}
            />

            {/* Top Right Quick Controls in Stage 1 & 2 */}
            <div className="absolute top-5 right-5 pointer-events-auto z-20 flex items-center gap-2">
              {/* Reset to orbit button if arrived or zooming */}
              {(stage === 'arrived' || stage === 'zooming') && (
                <button
                  onClick={handleReturnToOrbit}
                  className="px-2.5 py-1 bg-slate-900/85 hover:bg-slate-800 text-[11px] font-mono-data text-slate-300 hover:text-cyan-300 border border-slate-700/80 rounded transition-colors flex items-center gap-1.5 backdrop-blur-md cursor-pointer"
                  title="Return to Space Orbit Observation"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">ORBIT VIEW</span>
                </button>
              )}

              {/* Toggle manual controls / timeline */}
              <button
                onClick={() => setShowManualControls(!showManualControls)}
                className={`p-1.5 rounded transition-colors backdrop-blur-md cursor-pointer border ${
                  showManualControls
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-900/70 text-slate-400 border-slate-700/60 hover:text-white hover:bg-slate-800'
                }`}
                title="Toggle Mission Navigation Bars & Timeline"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>

              {/* Director's Brief Modal trigger */}
              <button
                onClick={() => setShowBriefModal(true)}
                className="px-2.5 py-1 bg-slate-900/85 hover:bg-slate-800 text-[11px] font-mono-data text-slate-400 hover:text-cyan-300 border border-slate-700/80 rounded transition-colors flex items-center gap-1.5 backdrop-blur-md cursor-pointer"
                title="View NASA Director's Brief & Presentation Cue Sheet"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">DIRECTOR'S BRIEF</span>
              </button>
            </div>
          </div>
        ) : currentView === 'journey' ? (
          /* Guided Mission Journey */
          <div className="w-full h-full animate-fadeIn">
            <GuidedMissionJourney
              onReplayDescent={handleReturnToOrbit}
              onOpenMap={() => setCurrentView('map')}
            />
          </div>
        ) : (
          /* Interactive Digital Martian Map Application */
          <div className="w-full h-full animate-fadeIn">
            <InteractiveMartianMap
              onReplayCinematic={handleReturnToOrbit}
              onStartJourney={handleStartJourney}
            />
          </div>
        )}
      </main>

      {/* 3. Bottom Timeline Scrubber (Shown during descent, arrived, or when manual controls toggled) */}
      {showNavBars && (
        <TimelineControls
          currentTime={currentTime}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
          onReset={handleReturnToOrbit}
          playbackSpeed={playbackSpeed}
          onChangeSpeed={setPlaybackSpeed}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isCinematic169={isCinematic169}
          onToggleCinematic169={() => setIsCinematic169(!isCinematic169)}
          isRecording={isRecording}
          onStartRecording={handleStartRecording}
          freeCameraMode={freeCameraMode}
          onToggleFreeCamera={() => setFreeCameraMode(!freeCameraMode)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        />
      )}

      {/* 4. Director's Brief & Cue Sheet Modal */}
      <DirectorsBriefModal
        isOpen={showBriefModal}
        onClose={() => setShowBriefModal(false)}
      />
    </div>
  );
}
