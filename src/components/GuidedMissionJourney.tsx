import React, { useState, useEffect, useRef } from 'react';
import { JOURNEY_CHAPTERS } from '../data/jezeroData';
import { GuidePerspective, JourneyChapter } from '../types';
import { soundManager } from '../services/soundManager';
const jezeroOrthoImage = new URL(
  '../assets/images/jezero_crater_ortho_1790269015798.jpg',
  import.meta.url
).href;
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Bot,
  User,
  Volume2,
  VolumeX,
  Compass,
  MapPin,
  Cpu,
  ShieldAlert,
  Zap,
  Radio,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  Activity
} from 'lucide-react';

interface GuidedMissionJourneyProps {
  onReplayDescent: () => void;
  onOpenMap: () => void;
}

export const GuidedMissionJourney: React.FC<GuidedMissionJourneyProps> = ({
  onReplayDescent,
  onOpenMap,
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [perspective, setPerspective] = useState<GuidePerspective>('machine');
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [chapterTimer, setChapterTimer] = useState<number>(0);
  const [voiceNarration, setVoiceNarration] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());

  // Clamped chapter index to ensure safe array access in all states
  const totalChapters = JOURNEY_CHAPTERS?.length || 0;
  const currentChapterIndexClamped = Math.max(
    0,
    Math.min(currentChapterIndex, Math.max(0, totalChapters - 1))
  );
  const currentChapter: JourneyChapter =
    JOURNEY_CHAPTERS[currentChapterIndexClamped] || JOURNEY_CHAPTERS[0];
  const chapterDuration = currentChapter?.durationSec || 10;

  const timerRef = useRef<number | null>(null);

  // Trigger narration & waypoint chime on chapter change
  useEffect(() => {
    soundManager.playWaypointAdvance();
    if (voiceNarration && currentChapter?.narrativeScript) {
      soundManager.speakNarrative(currentChapter.narrativeScript, true);
    }
    setChapterTimer(0);
  }, [currentChapterIndexClamped, voiceNarration]);

  // Autoplay whole video / story flow timer ticker
  useEffect(() => {
    if (!isAutoPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      setChapterTimer((prev) => prev + 0.5);
    }, 500);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isAutoPlaying]);

  // Handle stage progression when chapter duration is elapsed
  useEffect(() => {
    if (!isAutoPlaying) return;

    if (chapterTimer >= chapterDuration) {
      if (currentChapterIndexClamped < totalChapters - 1) {
        setCurrentChapterIndex((prev) => Math.min(prev + 1, totalChapters - 1));
        setChapterTimer(0);
      } else {
        // Reached the end of the expedition
        setIsAutoPlaying(false);
      }
    }
  }, [chapterTimer, isAutoPlaying, chapterDuration, currentChapterIndexClamped, totalChapters]);

  const handleNext = () => {
    if (currentChapterIndexClamped < totalChapters - 1) {
      setCurrentChapterIndex(currentChapterIndexClamped + 1);
      setChapterTimer(0);
    }
  };

  const handlePrev = () => {
    if (currentChapterIndexClamped > 0) {
      setCurrentChapterIndex(currentChapterIndexClamped - 1);
      setChapterTimer(0);
    }
  };

  const handleSelectChapter = (index: number) => {
    const safeIdx = Math.max(0, Math.min(index, totalChapters - 1));
    setCurrentChapterIndex(safeIdx);
    setChapterTimer(0);
  };

  const handleToggleAutoPlay = () => {
    const nextAuto = !isAutoPlaying;
    setIsAutoPlaying(nextAuto);
    if (
      nextAuto &&
      chapterTimer >= chapterDuration &&
      currentChapterIndexClamped === totalChapters - 1
    ) {
      setCurrentChapterIndex(0);
      setChapterTimer(0);
    }
  };

  const handleToggleVoice = () => {
    const next = !voiceNarration;
    setVoiceNarration(next);
    if (next && currentChapter?.narrativeScript) {
      soundManager.speakNarrative(currentChapter.narrativeScript, true);
    } else {
      soundManager.stopNarrative();
    }
  };

  const handleToggleMute = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
  };

  const chapterProgress = chapterDuration > 0 ? (chapterTimer / chapterDuration) * 100 : 0;
  const overallProgress =
    totalChapters > 0
      ? ((currentChapterIndexClamped + (chapterDuration > 0 ? chapterTimer / chapterDuration : 0)) /
          totalChapters) *
        100
      : 0;

  return (
    <div className="flex flex-col h-full bg-[#05070c] text-slate-100 font-sans select-none overflow-hidden">
      {/* 1. Header Bar: Expedition Overview & Perspective Switcher */}
      <div className="h-13 bg-[#0a0e17] border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-20">
        {/* Left: Journey Title & Sol Counter */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-white font-tech uppercase">
                The Sol Explorers: Expedition Guidance
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-mono-data text-amber-400 font-semibold">
                SOL {currentChapter.sol}
              </span>
            </div>
            <div className="text-[11px] font-mono-data text-slate-400 hidden sm:block">
              STAGE {currentChapterIndexClamped + 1} OF {totalChapters}: {currentChapter.title}
            </div>
          </div>
        </div>

        {/* Center: Perspective Switcher (Human Astronaut vs Machine AI) */}
        <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-700/80">
          <button
            onClick={() => setPerspective('machine')}
            className={`px-3 py-1 text-xs font-mono-data rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              perspective === 'machine'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>MACHINE / ROVER AI</span>
          </button>

          <button
            onClick={() => setPerspective('human')}
            className={`px-3 py-1 text-xs font-mono-data rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              perspective === 'human'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>HUMAN ASTRONAUT EVA</span>
          </button>
        </div>

        {/* Right: Autoplay whole video & audio toggles */}
        <div className="flex items-center gap-2">
          {/* Voice Narrator toggle */}
          <button
            onClick={handleToggleVoice}
            className={`px-2.5 py-1 text-xs font-mono-data rounded border transition-colors flex items-center gap-1.5 ${
              voiceNarration
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle voice narration synthesis"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">NARRATION</span>
          </button>

          {/* Mute */}
          <button
            onClick={handleToggleMute}
            className={`p-1.5 rounded border transition-colors ${
              isMuted
                ? 'bg-slate-900 border-slate-800 text-slate-500'
                : 'bg-slate-800 border-slate-700 text-cyan-400'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Whole Video Play/Pause */}
          <button
            onClick={handleToggleAutoPlay}
            className={`px-3 py-1.5 rounded text-xs font-mono-data font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
              isAutoPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
            }`}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isAutoPlaying ? 'PAUSE STORY' : 'PLAY WHOLE VIDEO'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Visual & Story Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Cinematic Visual Viewport & Picture-in-Picture Map (7 cols) */}
        <div className="lg:col-span-7 bg-black relative flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden">
          {/* Primary Cinematic Shot */}
          <div className="relative flex-1 overflow-hidden flex items-center justify-center">
            <img
              src={currentChapter.image}
              alt={currentChapter.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-all duration-700 ease-out"
            />

            {/* Cinematic Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none" />

            {/* Target Reticle Overlay on the Active Waypoint */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* Circular scanner */}
                <div className="absolute inset-0 rounded-full border border-cyan-400/40 border-dashed animate-scan-sweep" />
                {/* Brackets */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
                {/* Center dot */}
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <div className="absolute text-[10px] font-mono-data text-cyan-300 top-full mt-2 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/30 whitespace-nowrap">
                  TARGET LOCK: {currentChapter.coordinates}
                </div>
              </div>
            </div>

            {/* Top-Left Scene Watermark & Quadrangle */}
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-xs border border-slate-800 px-3 py-1.5 rounded text-xs font-mono-data text-slate-300">
              <div className="text-cyan-400 font-semibold">{currentChapter.subtitle}</div>
              <div className="text-slate-400 text-[11px] mt-0.5">ELEVATION: {currentChapter.elevation}</div>
            </div>

            {/* Bottom-Right Picture-in-Picture Jezero Context Map */}
            <div className="absolute bottom-4 right-4 w-44 sm:w-56 h-32 sm:h-40 bg-slate-950/90 rounded-lg border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col z-10">
              <div className="px-2 py-1 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[10px] font-mono-data text-slate-400">
                <span className="flex items-center gap-1 text-cyan-300">
                  <Compass className="w-3 h-3" />
                  AREOCENTRIC RADAR
                </span>
                <span>45 KM BASIN</span>
              </div>

              <div className="relative flex-1 overflow-hidden cursor-pointer" onClick={onOpenMap} title="Click to open full map">
                <img
                  src="/src/assets/images/jezero_crater_ortho_1790269015798.jpg"
                  alt="Jezero Radar Overview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-80"
                />

                {/* Rover Traverse Trail */}
                <svg
  className="absolute inset-0 w-full h-full pointer-events-none"
  viewBox="0 0 100 100"
  preserveAspectRatio="none"
>
  <polyline
    points="48,54 45,62 40,52 36,50 32,48 30,24"
    fill="none"
    stroke="#f59e0b"
    strokeWidth="0.5"
    strokeDasharray="1.5 1"
    vectorEffect="non-scaling-stroke"
  />

  {/* Waypoint pins */}
  {JOURNEY_CHAPTERS.map((ch, idx) => (
    <circle
      key={ch.id}
      cx={ch.mapPercent[0]}
      cy={ch.mapPercent[1]}
      r={idx === currentChapterIndex ? 4 : 2}
      fill={idx === currentChapterIndex ? '#38bdf8' : '#64748b'}
    />
  ))}
</svg>
                {/* Active Waypoint Marker */}
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${currentChapter.mapPercent[0]}%`, top: `${currentChapter.mapPercent[1]}%` }}
                >
                  <span className="w-3 h-3 rounded-full bg-cyan-400 block animate-ping opacity-75" />
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 border border-white block -mt-2.5" />
                </div>
              </div>

              <div className="px-2 py-1 bg-slate-950 text-[10px] font-mono-data text-slate-400 flex items-center justify-between">
                <span>SECTOR {currentChapterIndex + 1}/6</span>
                <span className="text-cyan-400 hover:underline">FULL MAP →</span>
              </div>
            </div>

            {/* Bottom Chapter Progress Bar */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-800">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${chapterProgress}%` }}
              />
            </div>
          </div>

          {/* Narrative Transcript Subtitles Ribbon (At bottom of visual) */}
          <div className="bg-slate-950/95 border-t border-slate-800 px-5 py-3">
            <div className="flex items-center gap-2 text-[11px] font-mono-data text-slate-400 mb-1">
              <Radio className="w-3 h-3 text-cyan-400" />
              <span>EXPEDITION DISPATCH</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">NASA MISSION LOG</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              "{currentChapter.narrativeScript}"
            </p>
          </div>
        </div>

        {/* Right Column: Mission Guidance Telemetry Dossier (5 cols) */}
        <div className="lg:col-span-5 bg-[#0a0e17] flex flex-col justify-between overflow-y-auto border-t lg:border-t-0 border-slate-800">
          <div className="p-6 space-y-6">
            {/* Header: Sector Title */}
            <div>
              <div className="flex items-center gap-2 text-xs font-mono-data text-cyan-400 mb-1">
                <span>WAYPOINT {currentChapterIndex + 1} OF 6</span>
                <span className="text-slate-600">·</span>
                <span>{currentChapter.coordinates}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-tech tracking-tight">
                {currentChapter.title}
              </h2>
            </div>

            {/* Dynamic Guidance Panel: Machine vs Human Mode */}
            {perspective === 'machine' ? (
              /* --- 1. AUTONOMOUS MACHINE GUIDANCE PANEL --- */
              <div className="space-y-4 animate-fadeIn">
                {/* Navigation Mode Banner */}
                <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-lg">
                  <div className="text-[11px] font-mono-data text-cyan-400 uppercase flex items-center gap-1.5 mb-1">
                    <Cpu className="w-3.5 h-3.5" />
                    AUTONAV SYSTEM DIRECTIVE
                  </div>
                  <div className="text-xs font-mono-data font-semibold text-white">
                    {currentChapter.machineGuidance.navMode}
                  </div>
                  <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {currentChapter.machineGuidance.driveTelemetry}
                  </div>
                </div>

                {/* Machine Telemetry Gauges (Tabular 4-grid) */}
                <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div>
                    <div className="text-[10px] font-mono-data text-slate-400 uppercase">Wheel Slip Ratio</div>
                    <div className="text-sm font-mono-data font-semibold text-emerald-400">
                      {currentChapter.machineGuidance.telemetryReadout.slipRatio}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono-data text-slate-400 uppercase">Terrain Grade</div>
                    <div className="text-sm font-mono-data font-semibold text-slate-200">
                      {currentChapter.machineGuidance.telemetryReadout.inclineGrade}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono-data text-slate-400 uppercase">Power Output</div>
                    <div className="text-sm font-mono-data font-semibold text-amber-300">
                      {currentChapter.machineGuidance.telemetryReadout.powerGeneration}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono-data text-slate-400 uppercase">UHF Downlink</div>
                    <div className="text-sm font-mono-data font-semibold text-cyan-300">
                      {currentChapter.machineGuidance.telemetryReadout.downlinkUHF}
                    </div>
                  </div>
                </div>

                {/* Science Instrument Payload Active */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono-data text-slate-400 uppercase">
                    Active Sensor Array
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentChapter.machineGuidance.activeSensors.map((sensor) => (
                      <span
                        key={sensor}
                        className="px-2 py-0.5 bg-slate-800/90 text-cyan-300 border border-slate-700 rounded text-[11px] font-mono-data"
                      >
                        ● {sensor}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Science Directive */}
                <div className="p-3 bg-slate-900/60 rounded border border-slate-800 space-y-1">
                  <div className="text-[11px] font-mono-data text-slate-400 uppercase">
                    Machine Science Operation
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentChapter.machineGuidance.sciencePayload}
                  </p>
                </div>
              </div>
            ) : (
              /* --- 2. HUMAN ASTRONAUT EVA GUIDANCE PANEL --- */
              <div className="space-y-4 animate-fadeIn">
                {/* EVA Objective */}
                <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg">
                  <div className="text-[11px] font-mono-data text-amber-400 uppercase flex items-center gap-1.5 mb-1">
                    <Activity className="w-3.5 h-3.5" />
                    CREW EVA MISSION OBJECTIVE
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {currentChapter.humanGuidance.evaObjective}
                  </p>
                </div>

                {/* Human Life Support Telemetry Gauges */}
                <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div>
                    <div className="text-[10px] font-mono-data text-slate-400 uppercase">EVA Stopwatch</div>
                    <div className="text-sm font-mono-data font-semibold text-slate-200">
                      {currentChapter.humanGuidance.telemetryReadout.evaTimer}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono-data text-slate-400 uppercase">Radiation Exposure</div>
                    <div className="text-sm font-mono-data font-semibold text-emerald-400">
                      {currentChapter.humanGuidance.telemetryReadout.radiationDose}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono-data text-slate-400 uppercase">Suit O2 Pressure</div>
                    <div className="text-sm font-mono-data font-semibold text-cyan-300">
                      {currentChapter.humanGuidance.telemetryReadout.o2Pressure}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono-data text-slate-400 uppercase">Suit Battery State</div>
                    <div className="text-sm font-mono-data font-semibold text-amber-300">
                      {currentChapter.humanGuidance.telemetryReadout.suitBattery}
                    </div>
                  </div>
                </div>

                {/* Hazards & Safety Protocols */}
                <div className="p-3 bg-red-950/15 border border-red-900/30 rounded space-y-1">
                  <div className="text-[11px] font-mono-data text-red-400 uppercase flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Crew Safety & Hazard Warning
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentChapter.humanGuidance.hazardsAndSafety}
                  </p>
                </div>

                {/* ISRU In-Situ Resource Opportunity */}
                <div className="p-3 bg-cyan-950/20 border border-cyan-900/30 rounded space-y-1">
                  <div className="text-[11px] font-mono-data text-cyan-400 uppercase flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    In-Situ Resource Utilization (ISRU)
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentChapter.humanGuidance.isruOpportunity}
                  </p>
                </div>
              </div>
            )}

            {/* Expedition Traverse Jump Bar */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <div className="text-[10px] font-mono-data text-slate-500 uppercase flex items-center justify-between">
                <span>EXPEDITION CHAPTER NAVIGATION</span>
                <span>{currentChapterIndexClamped + 1}/{totalChapters}</span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {JOURNEY_CHAPTERS.map((ch, idx) => (
                  <button
                    key={ch.id}
                    onClick={() => handleSelectChapter(idx)}
                    className={`h-7 rounded text-[11px] font-mono-data border transition-all flex items-center justify-center cursor-pointer ${
                      idx === currentChapterIndexClamped
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                        : idx < currentChapterIndexClamped
                        ? 'bg-slate-800/80 text-emerald-400 border-slate-700'
                        : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300 hover:bg-slate-800'
                    }`}
                    title={`Sol ${ch.sol}: ${ch.title}`}
                  >
                    Sol {ch.sol}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentChapterIndexClamped === 0}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 rounded text-xs font-mono-data border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PREVIOUS</span>
              </button>

              <button
                onClick={handleNext}
                disabled={currentChapterIndexClamped === totalChapters - 1}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 rounded text-xs font-mono-data border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="hidden sm:inline">NEXT SECTOR</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onReplayDescent}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded text-xs font-mono-data border border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">REPLAY DESCENT (0-8S)</span>
              </button>

              <button
                onClick={onOpenMap}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono-data rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>OPEN FULL MAP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
