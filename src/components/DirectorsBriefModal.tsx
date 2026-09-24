import React, { useState } from 'react';
import { X, Copy, Check, FileText } from 'lucide-react';

interface DirectorsBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DirectorsBriefModal: React.FC<DirectorsBriefModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const briefText = `PROJECT: The Sol Explorers (NASA Space Apps Challenge)
COMPLETE STORY FLOW: ORBITAL TARGETING → START THE JOURNEY → GUIDED MISSION EXPEDITION

ACT 1: THE 8-SECOND CINEMATIC DESCENT (PROLOGUE)
0–2s: Deep Space Orbit Establishing Shot
- Photorealistic rotating Mars globe in deep space, subtle background stars
- Natural directional solar lighting with authentic day/night terminator
- Atmospheric Rayleigh limb haze (reddish-amber transitioning to pale twilight blue)

2–4s: Controlled Navigation Zoom / Logarithmic Descent
- Rapid smooth push plunging from orbital altitude (6,840 km) down through the upper atmosphere
- Focused trajectory aligning towards Syrtis Major Quadrangle (MC-13)

4–6s: Jezero Crater Morphology Deceleration
- Reveal of Jezero Crater (18.44° N, 77.50° E)
- Ancient western river delta fan (Neretva Vallis breach) and crater rim
- Minimal HUD typography:
  JEZERO CRATER
  LAT: 18.44° N
  LON: 77.50° E
  TARGET AREA: ACQUIRED

6–8s: Target Lock & "START THE JOURNEY"
- Target marker locks onto Jezero Crater with circular scan reticle
- Confirmation readout:
  MISSION AREA
  SELECTED
- Interactive "START THE JOURNEY" guidance prompt emerges to initialize the full expedition.

ACT 2: GUIDED EXPEDITION (FOR HUMANS & MACHINES)
The system guides operators through the 6 pivotal chapters of Jezero exploration:
1. Sol 0: Touchdown & Systems Calibration (Octavia E. Butler Landing Site)
2. Sol 180: Traversing Séítah Dunes & Ancient Igneous Bedrock (Slip compensation & olivine sampling)
3. Sol 340: Kodiak Butte Scarp & Lake Strata (Stratigraphic proof of ancient open paleolake)
4. Sol 410: Neretva Delta Front (Rotary core sampling for organic biosignatures)
5. Sol 653: Three Forks Sample Depot (First interplanetary sample cache for Earth return)
6. Sol 750+: Belva Crater Rim & Outer Frontier (Ascending the crater walls towards Nili Fossae)

DUAL PERSPECTIVE GUIDANCE MODES:
- Autonomous Machine / Rover AI: AutoNav telemetry, wheel slip limits, sensor telemetry (SuperCam/SHERLOC/PIXL/RIMFAX), UHF orbiter downlink.
- Human Astronaut EVA: Crew bio-telemetry, EVA stopwatch, radiation exposure, suit O2 pressure, MOXIE atmospheric oxygen extraction & safety setbacks.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(briefText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-tech tracking-wider uppercase">
              Director's Brief & Presentation Cue Sheet
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono-data text-slate-300">
          <div className="p-3 bg-slate-950 rounded border border-slate-800 leading-relaxed whitespace-pre-line">
            {briefText}
          </div>

          <div className="p-3 bg-cyan-950/20 border border-cyan-900/40 rounded text-slate-300 space-y-1">
            <div className="text-cyan-400 font-semibold uppercase text-[11px]">
              Live Presentation Tips:
            </div>
            <p className="text-[11px] leading-relaxed">
              Use the "16:9 Frame" toggle or Fullscreen mode when projecting on slide decks. You can also click "Export 8s Clip" in the bottom control bar to download a pristine 60FPS video file directly into your video editing software.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] font-mono-data text-slate-500">
            THE SOL EXPLORERS · NASA SPACE APPS
          </span>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-mono-data border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY SPECIFICATION'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
