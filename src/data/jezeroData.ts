import { MissionWaypoint, JourneyChapter } from '../types';

export const JEZERO_WAYPOINTS: MissionWaypoint[] = [
  {
    id: 'landing-site',
    name: 'Octavia E. Butler Landing Site',
    type: 'landing_site',
    lat: 18.4447,
    lon: 77.4508,
    elevation: '-2,572 m',
    sol: 0,
    description: 'Touchdown point of the Mars 2020 Perseverance rover and Ingenuity helicopter inside Jezero Crater on February 18, 2021.',
    significance: 'Flat, smooth basaltic floor terrain chosen to minimize hazards during Sky Crane descent.',
    coordinates: [48, 54]
  },
  {
    id: 'western-delta',
    name: 'Western Delta Fan (Neretva Delta)',
    type: 'delta_fan',
    lat: 18.4380,
    lon: 77.4050,
    elevation: '-2,520 m',
    sol: 410,
    description: 'Prominent fan-shaped deposit of ancient river sediments laid down where Neretva Vallis emptied into a paleolake ~3.7 billion years ago.',
    significance: 'Highest priority zone for biosignature detection; rich in fine-grained clays and carbonates that preserve organic molecules.',
    coordinates: [32, 48]
  },
  {
    id: 'three-forks',
    name: 'Three Forks Sample Depot',
    type: 'sample_depot',
    lat: 18.4320,
    lon: 77.4320,
    elevation: '-2,560 m',
    sol: 653,
    description: 'Flat zone at the base of the delta where 10 backup titanium sample tubes were deposited for future Mars Sample Return retrieval.',
    significance: 'First sample depot established on another world, securing igneous and sedimentary cores.',
    coordinates: [40, 52]
  },
  {
    id: 'kodiak-butte',
    name: 'Kodiak Butte (Delta Scarp)',
    type: 'delta_front',
    lat: 18.4110,
    lon: 77.3910,
    elevation: '-2,490 m',
    sol: 340,
    description: 'Isolated erosional remnant south of the main delta showing distinct dipping bottomsets, foresets, and horizontal topsets.',
    significance: 'Definitive geological proof that Jezero held an active open-basin lake fed by persistent flowing water.',
    coordinates: [26, 68]
  },
  {
    id: 'seitah-dunes',
    name: 'Séítah Formation & Dune Field',
    type: 'dune_field',
    lat: 18.4280,
    lon: 77.4420,
    elevation: '-2,590 m',
    sol: 180,
    description: 'Rugged terrain of dark basaltic sand ripples and fractured bedrock containing heavy olivine crystals.',
    significance: 'Ancient cumulate igneous rock formed by magma chamber cooling or ancient volcanic flow interaction with water.',
    coordinates: [45, 62]
  },
  {
    id: 'belva-crater',
    name: 'Belva Impact Crater',
    type: 'crater',
    lat: 18.4890,
    lon: 77.3820,
    elevation: '-2,470 m',
    sol: 750,
    description: 'Large 0.9-km secondary impact crater cutting into the delta sediments, exposing deep cross-sectional layers in its inner walls.',
    significance: 'Natural 3D geological exposure revealing steep faulting and hydrodynamic flood surges in the late delta stage.',
    coordinates: [30, 24]
  }
];

export const MISSION_METRICS = {
  missionName: 'The Sol Explorers: Mars Jezero Campaign',
  targetCoordinates: '18.4447° N, 77.4508° E',
  craterDiameter: '45.0 km',
  depth: '1,050 m',
  atmospherePressure: '612 Pa (0.006 atm)',
  surfaceTemp: '-63° C (-81° F)',
  geologicalEpoch: 'Noachian to Early Hesperian (~3.7 - 3.5 Ga)',
  primaryScienceGoal: 'Astrobiology investigation, biosignature assessment, & sample caching for Earth return'
};

export const JOURNEY_CHAPTERS: JourneyChapter[] = [
  {
    id: 'ch-1-touchdown',
    sol: 0,
    waypointId: 'landing-site',
    title: 'Touchdown & Systems Calibration',
    subtitle: 'Octavia E. Butler Landing Site · Jezero Crater Floor',
    coordinates: '18.4447° N, 77.4508° E',
    elevation: '-2,572 m',
    image: '/src/assets/images/jezero_crater_ortho_1790269015798.jpg',
    mapPercent: [48, 54],
    durationSec: 10,
    narrativeScript: 'Descent stage retro-rockets cutoff verified. Sky Crane bridle severed cleanly. Touchdown confirmed inside the smooth basaltic floor of Jezero Crater. All planetary navigation systems and environmental sensors are now active.',
    humanGuidance: {
      evaObjective: 'Egress from lander habitat module; verify life support seals in -63°C ambient atmosphere; calibrate primary communications relay.',
      hazardsAndSafety: 'Inspect landing site for retro-rocket trenching; confirm regolith stability within 150m radius before heavy EVA equipment transit.',
      sampleProtocol: 'Collect baseline regolith blank sample to monitor terrestrial contamination signatures.',
      isruOpportunity: 'MOXIE atmospheric oxygen extraction initiated: pulling CO2 at 612 Pa to generate breathable O2.',
      telemetryReadout: {
        evaTimer: '00:45:00',
        radiationDose: '0.24 mSv/day',
        o2Pressure: '28.2 kPa',
        suitBattery: '98% Nominal'
      }
    },
    machineGuidance: {
      navMode: 'TERRAIN RELATIVE NAVIGATION (TRN)',
      driveTelemetry: 'Wheel drive actuators calibrated; steering azimuth 285°; zero wheel slip on flat basalt bedrock.',
      activeSensors: ['Hazcam Stereoscopic', 'Navcam Mast 3D', 'MEDA Weather Mast', 'RIMFAX Radar Ground-Penetrating'],
      sciencePayload: 'Deploy mast sensors; initiate Mastcam-Z 360° color panorama; activate RIMFAX sub-surface radar.',
      telemetryReadout: {
        slipRatio: '0.02 (Optimal)',
        inclineGrade: '0.4°',
        powerGeneration: '112 W (MMRTG)',
        downlinkUHF: '2.0 Mbps (MRO Relay)'
      }
    }
  },
  {
    id: 'ch-2-seitah',
    sol: 180,
    waypointId: 'seitah-dunes',
    title: 'Traversing the Dune Field of Séítah',
    subtitle: 'Séítah Formation · Ancient Igneous Olivine Cumulates',
    coordinates: '18.4280° N, 77.4420° E',
    elevation: '-2,590 m',
    image: '/src/assets/images/jezero_guided_traverse_1790269713489.jpg',
    mapPercent: [45, 62],
    durationSec: 11,
    narrativeScript: 'Entering the rugged sand ripple fields of Séítah. The terrain transitions into fractured crystalline bedrock rich in olivine and pyroxene crystals, representing the ancient igneous roots of Jezero Crater floor.',
    humanGuidance: {
      evaObjective: 'Traverse across basaltic ripple corridors; collect hand-specimen cores of heavy olivine cumulate rock.',
      hazardsAndSafety: 'High slip advisory on 20° dune crest slopes; avoid traversing across deep soft sand pockets that risk entrapment.',
      sampleProtocol: 'Abrade surface weathering rind; store paired igneous cores into hermetic nitrogen-purged sample canisters.',
      isruOpportunity: 'Assess olivine rock density for potential mineral carbonation and habitat radiation shielding mass.',
      telemetryReadout: {
        evaTimer: '02:15:30',
        radiationDose: '0.27 mSv/day',
        o2Pressure: '27.9 kPa',
        suitBattery: '84% Nominal'
      }
    },
    machineGuidance: {
      navMode: 'AUTONAV CLOSED-LOOP SLIP COMPENSATION',
      driveTelemetry: 'Tractive force redistributed across 6 independent rocker-bogie wheels; maximum wheel slip capped at 18%.',
      activeSensors: ['SuperCam Laser LIBS', 'SHERLOC Deep-UV', 'Visual Odometry Stereo'],
      sciencePayload: 'Fire SuperCam pulsed laser at target "Dourbes"; collect Raman acoustic spectra of olivine crystalline structure.',
      telemetryReadout: {
        slipRatio: '0.14 (Compensating)',
        inclineGrade: '7.8°',
        powerGeneration: '108 W',
        downlinkUHF: '1.8 Mbps (Odyssey Relay)'
      }
    }
  },
  {
    id: 'ch-3-kodiak',
    sol: 340,
    waypointId: 'kodiak-butte',
    title: 'The Kodiak Butte Scarp & Lake Strata',
    subtitle: 'Isolated Delta Scarp · Definitive Paleolake Evidence',
    coordinates: '18.4110° N, 77.3910° E',
    elevation: '-2,490 m',
    image: '/src/assets/images/jezero_delta_surface_1790269027984.jpg',
    mapPercent: [26, 68],
    durationSec: 12,
    narrativeScript: 'Rising 60 meters above the crater plain, Kodiak Butte stands as an erosional remnant of the ancient delta. Clear horizontal topset beds and steeply dipping foreset strata prove beyond doubt that sustained liquid water once filled this basin.',
    humanGuidance: {
      evaObjective: 'Perform stratigraphic survey of exposed sandstone and conglomerate layers; identify ancient river flow velocity markers.',
      hazardsAndSafety: 'Loose rockfall hazard below the 60m vertical scarp face; maintain minimum 15m setback from overhangs.',
      sampleProtocol: 'Sample delta bottomset siltstone containing fine grain sizes most capable of preserving fossil microbial textures.',
      isruOpportunity: 'Clay-rich minerals at scarp base retain 2-3% bound structural water, suitable for thermal dehydroxylation.',
      telemetryReadout: {
        evaTimer: '03:40:15',
        radiationDose: '0.26 mSv/day',
        o2Pressure: '27.5 kPa',
        suitBattery: '69% Nominal'
      }
    },
    machineGuidance: {
      navMode: 'STEREOSCOPIC HIGH-ZOOM RECONNAISSANCE',
      driveTelemetry: 'Hold stationary position on stable bedrock apron; calibrate Mastcam-Z dual 110mm telephoto optics.',
      activeSensors: ['Mastcam-Z Stereo Zoom', 'PIXL X-Ray Fluorescence', 'RIMFAX Radar'],
      sciencePayload: 'Sub-millimeter resolution geological mapping of foreset dip angles (22° WNW); radar sounding down to 10m depth.',
      telemetryReadout: {
        slipRatio: '0.01 (Anchored)',
        inclineGrade: '1.2°',
        powerGeneration: '114 W',
        downlinkUHF: '2.4 Mbps (TGO Relay)'
      }
    }
  },
  {
    id: 'ch-4-delta-front',
    sol: 410,
    waypointId: 'western-delta',
    title: 'Neretva Delta Front & Biosignature Coring',
    subtitle: 'Western River Fan · Primary Astrobiology Target',
    coordinates: '18.4380° N, 77.4050° E',
    elevation: '-2,520 m',
    image: '/src/assets/images/jezero_guided_traverse_1790269713489.jpg',
    mapPercent: [32, 48],
    durationSec: 12,
    narrativeScript: 'Reaching the mouth of the Neretva Vallis delta. Sediments washed in from hundreds of kilometers of Martian highlands created this mudstone formation, the highest-priority target in the search for ancient Martian biosignatures.',
    humanGuidance: {
      evaObjective: 'Extract high-priority core sample from "Wildcat Ridge"; scan fine-grained clay matrix with field fluorescence microscopy.',
      hazardsAndSafety: 'Steep terrace gradients; secure safety tethers when working on elevated sedimentary benches.',
      sampleProtocol: 'Hermetically seal titanium sample tube with ultra-clean sapphire end-plug; verify zero seal leakage.',
      isruOpportunity: 'Abundant magnesium smectite clays provide excellent feed material for sintered construction regolith bricks.',
      telemetryReadout: {
        evaTimer: '04:55:00',
        radiationDose: '0.25 mSv/day',
        o2Pressure: '27.1 kPa',
        suitBattery: '54% Nominal'
      }
    },
    machineGuidance: {
      navMode: 'PRECISION ROTARY-PERCUSSIVE CORING',
      driveTelemetry: 'Robotic arm 5-DOF turret deployed; 27mm hollow coring bit engaged into sedimentary target.',
      activeSensors: ['SHERLOC Deep-UV Laser', 'PIXL Micro-XRF', 'WATSON Close-Up Imager'],
      sciencePayload: 'SHERLOC detects aromatic organic compound signatures in sulfate-filled veins; core length 6.2 cm successfully captured.',
      telemetryReadout: {
        slipRatio: '0.00 (Turret Locked)',
        inclineGrade: '3.4°',
        powerGeneration: '109 W',
        downlinkUHF: '2.1 Mbps (MAVEN Relay)'
      }
    }
  },
  {
    id: 'ch-5-sample-depot',
    sol: 653,
    waypointId: 'three-forks',
    title: 'Establishing Three Forks Sample Depot',
    subtitle: 'Three Forks Basin · First Interplanetary Sample Cache',
    coordinates: '18.4320° N, 77.4320° E',
    elevation: '-2,560 m',
    image: '/src/assets/images/jezero_crater_ortho_1790269015798.jpg',
    mapPercent: [40, 52],
    durationSec: 11,
    narrativeScript: 'On the flat, smooth floor of Three Forks, a milestone for humanity is realized: 10 pristine titanium sample tubes are deposited onto the surface in a structured zigzag pattern, ready for future Mars Sample Return retrieval.',
    humanGuidance: {
      evaObjective: 'Survey depot layout; verify all 10 sample drop markers with areocentric GPS geodetic coordinates; plant mission telemetry transponder.',
      hazardsAndSafety: 'Maintain minimum 2m clearance from cached tubes to prevent accidental contact or rover wheel disturbance.',
      sampleProtocol: 'Log sample tube IDs (Igneous cores, Delta mudstones, Atmospheric witness blanks) into the interplanetary sample archive.',
      isruOpportunity: 'Depot site serves as prospective future landing ellipse for Mars Ascent Vehicle (MAV) and human landing craft.',
      telemetryReadout: {
        evaTimer: '06:10:00',
        radiationDose: '0.24 mSv/day',
        o2Pressure: '26.8 kPa',
        suitBattery: '41% Nominal'
      }
    },
    machineGuidance: {
      navMode: 'SAMPLE RETRIEVAL LANDER LANDMARK MAPPING',
      driveTelemetry: 'Precision drop maneuver verified via Belly Hazcam; each tube placed within 5 to 15m of designated drop point.',
      activeSensors: ['Navcam 3D Mapping', 'Sample Handling Arm', 'Drop Verification Cam'],
      sciencePayload: 'Confirm sample tube orientation; photograph serial numbers; verify solar glint confirmation on tube collars.',
      telemetryReadout: {
        slipRatio: '0.01',
        inclineGrade: '0.6°',
        powerGeneration: '111 W',
        downlinkUHF: '2.5 Mbps (Direct DSN)'
      }
    }
  },
  {
    id: 'ch-6-belva-rim',
    sol: 750,
    waypointId: 'belva-crater',
    title: 'Ascending the Crater Rim & Frontier Horizon',
    subtitle: 'Belva Impact Crater · Scaling the Martian Horizon',
    coordinates: '18.4890° N, 77.3820° E',
    elevation: '-2,470 m',
    image: '/src/assets/images/jezero_delta_surface_1790269027984.jpg',
    mapPercent: [30, 24],
    durationSec: 12,
    narrativeScript: 'Reaching the elevated rim of Belva Crater. Standing high above Jezero paleolake basin, the entire 45-kilometer arena of exploration lies below. The path ahead leads up the northern crater wall and outward to the uncharted plains of Nili Fossae.',
    humanGuidance: {
      evaObjective: 'Summit the outer crater rim ridge; survey geological fault lines exposed in Belva inner walls; establish the horizon navigation beacon.',
      hazardsAndSafety: 'High winds and dust devil vortexes on exposed ridges; verify suit pressure regulation against sudden atmospheric gusts.',
      sampleProtocol: 'Collect impact melt breccia from crater ejecta blanket to date the secondary impact event.',
      isruOpportunity: 'Elevated line-of-sight provides optical and microwave comms coverage over the entire Jezero basin for future permanent habitat outposts.',
      telemetryReadout: {
        evaTimer: '07:25:00',
        radiationDose: '0.23 mSv/day',
        o2Pressure: '26.4 kPa',
        suitBattery: '32% (Return Buffer OK)'
      }
    },
    machineGuidance: {
      navMode: 'LONG-RANGE AUTONOMOUS HORIZON TRANSVERSE',
      driveTelemetry: 'Scaling 14° rocky incline; AI visual path planner calculating next 250m traverse segment autonomously.',
      activeSensors: ['SuperCam Long Range RMI', 'RIMFAX Sounder', 'High-Gain Antenna (HGA)'],
      sciencePayload: 'Transmit high-resolution 360° summit gigapixel mosaic; log 45 km traverse victory for autonomous exploration.',
      telemetryReadout: {
        slipRatio: '0.08',
        inclineGrade: '13.8°',
        powerGeneration: '115 W',
        downlinkUHF: '2.6 Mbps (Deep Space Network)'
      }
    }
  }
];

