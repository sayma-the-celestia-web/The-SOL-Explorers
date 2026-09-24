import React from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Download, Video, Camera, Compass } from 'lucide-react';

interface TimelineControlsProps {
  currentTime: number; // 0.0 to 8.0
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onReset: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isCinematic169: boolean;
  onToggleCinematic169: () => void;
  isRecording: boolean;
  onStartRecording: () => void;
  freeCameraMode: boolean;
  onToggleFreeCamera: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  currentTime,
  isPlaying,
  onTogglePlay,
  onSeek,
  onReset,
  playbackSpeed,
  onChangeSpeed,
  isMuted,
  onToggleMute,
  isCinematic169,
  onToggleCinematic169,
  isRecording,
  onStartRecording,
  freeCameraMode,
  onToggleFreeCamera,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const totalDuration = 8.0;
  const progressPercent = (currentTime / totalDuration) * 100;

  // Timeline keyframe phases
  const keyframes = [
    { time: 0.0, label: '0s Space Orbit' },
    { time: 2.0, label: '2s Descent' },
    { time: 4.0, label: '4s Jezero Crater' },
    { time: 6.0, label: '6s Target Lock' },
    { time: 8.0, label: '8s Map App' },
  ];

  return (
    <div className="bg-[#090d14]/95 border-t border-slate-800 backdrop-blur-md px-4 py-3 z-30 select-none">
      {/* 1. Timeline Progress & Scrubber Track */}
      <div className="relative mb-2.5">
        {/* Scrubber slider input */}
        <div className="relative h-6 flex items-center group">
          {/* Background rail */}
          <div className="absolute inset-x-0 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            {/* Active progress fill */}
            <div
              className="h-full bg-cyan-400 transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Keyframe tick marks */}
          {keyframes.map((kf) => {
            const leftPct = (kf.time / totalDuration) * 100;
            const isPassed = currentTime >= kf.time;
            return (
              <button
                key={kf.time}
                onClick={() => onSeek(kf.time)}
                style={{ left: `${leftPct}%` }}
                className={`absolute -top-1 -translate-x-1/2 flex flex-col items-center group/kf focus:outline-none cursor-pointer z-10`}
                title={`Jump to ${kf.label}`}
              >
                <div
                  className={`w-2 h-3.5 rounded-xs border transition-colors ${
                    isPassed
                      ? 'bg-cyan-300 border-cyan-400'
                      : 'bg-slate-700 border-slate-600 group-hover/kf:border-cyan-400'
                  }`}
                />
              </button>
            );
          })}

          {/* Scrub Range Input (invisible on top for drag interaction) */}
          <input
            type="range"
            min="0"
            max="8"
            step="0.05"
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
        </div>

        {/* Phase keyframe labels below scrubber */}
        <div className="flex justify-between text-[10px] font-mono-data text-slate-500 px-1 mt-0.5">
          <span>0.00s DEEP SPACE</span>
          <span className="hidden sm:inline">2.00s DESCENT PUSH</span>
          <span>4.00s JEZERO ACQUIRE</span>
          <span className="hidden sm:inline">6.00s TARGET LOCK</span>
          <span>8.00s MAP APP</span>
        </div>
      </div>

      {/* 2. Controls Toolbar Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Primary Playback controls */}
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            className={`p-2 rounded font-mono-data text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold'
            }`}
            title={isPlaying ? 'Pause' : 'Play 8s Shot'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span className="text-xs">{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          {/* Replay */}
          <button
            onClick={onReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors cursor-pointer"
            title="Replay from start (0.00s)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Timecode display */}
          <div className="bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded text-xs font-mono-data text-slate-300 flex items-center gap-1.5">
            <span className="text-cyan-300 font-semibold">{currentTime.toFixed(2)}s</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-500">8.00s</span>
          </div>

          {/* Speed switcher */}
          <div className="hidden sm:flex items-center bg-slate-900 p-0.5 rounded border border-slate-800">
            {[0.5, 1.0, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-2 py-1 text-[11px] font-mono-data rounded transition-colors ${
                  playbackSpeed === s
                    ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Center: Camera Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFreeCamera}
            className={`px-2.5 py-1.5 text-xs font-mono-data rounded border transition-colors flex items-center gap-1.5 ${
              freeCameraMode
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle between cinematic trajectory and manual camera drag/zoom"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{freeCameraMode ? 'Manual Orbit' : 'Cinematic Shot'}</span>
          </button>

          {/* 16:9 Presentation Letterbox */}
          <button
            onClick={onToggleCinematic169}
            className={`px-2.5 py-1.5 text-xs font-mono-data rounded border transition-colors flex items-center gap-1.5 ${
              isCinematic169
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle 16:9 Widescreen Presentation Letterbox"
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden md:inline">16:9 Frame</span>
          </button>
        </div>

        {/* Right: Sound, Video Recording & Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Mute/Unmute */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded border transition-colors ${
              isMuted
                ? 'bg-slate-900 border-slate-800 text-slate-500'
                : 'bg-slate-800 border-slate-700 text-cyan-400 hover:text-cyan-300'
            }`}
            title={isMuted ? 'Unmute telemetry audio' : 'Mute audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Record 8s Video Button */}
          <button
            onClick={onStartRecording}
            disabled={isRecording}
            className={`px-3 py-1.5 text-xs font-mono-data rounded border transition-all flex items-center gap-1.5 cursor-pointer ${
              isRecording
                ? 'bg-red-500/20 border-red-500 text-red-300 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 hover:text-white'
            }`}
            title="Record and download the 8-second 60FPS video clip for your presentation slide deck"
          >
            {isRecording ? (
              <>
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                <span>RECORDING 8S...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">EXPORT 8S CLIP</span>
              </>
            )}
          </button>

          {/* Fullscreen */}
          <button
            onClick={onToggleFullscreen}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded border border-slate-800 transition-colors"
            title="Toggle fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
