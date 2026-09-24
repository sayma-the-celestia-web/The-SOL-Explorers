export interface MissionWaypoint {
  id: string;
  name: string;
  type: 'landing_site' | 'delta_fan' | 'crater' | 'dune_field' | 'sample_depot' | 'delta_front';
  lat: number;
  lon: number;
  elevation: string;
  description: string;
  sol: number;
  significance: string;
  coordinates: [number, number]; // [x, y] in map percentage
}

export type MapLayer = 'ortho' | 'elevation' | 'minerals' | 'thermal';

export type GuidePerspective = 'machine' | 'human';

export interface JourneyChapter {
  id: string;
  sol: number;
  waypointId: string;
  title: string;
  subtitle: string;
  coordinates: string;
  elevation: string;
  image: string;
  mapPercent: [number, number]; // [x, y] in percentage
  durationSec: number;
  humanGuidance: {
    evaObjective: string;
    hazardsAndSafety: string;
    sampleProtocol: string;
    isruOpportunity: string;
    telemetryReadout: {
      evaTimer: string;
      radiationDose: string;
      o2Pressure: string;
      suitBattery: string;
    };
  };
  machineGuidance: {
    navMode: string;
    driveTelemetry: string;
    activeSensors: string[];
    sciencePayload: string;
    telemetryReadout: {
      slipRatio: string;
      inclineGrade: string;
      powerGeneration: string;
      downlinkUHF: string;
    };
  };
  narrativeScript: string;
}

export interface TelemetryState {
  time: number; // 0.00 to 8.00s
  altitudeKm: number;
  velocityKmS: number;
  fov: number;
  phase: 'orbit' | 'descent' | 'approach' | 'lock' | 'map_transition';
}
