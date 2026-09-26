import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { soundManager } from '../services/soundManager';
import { Crosshair, Compass } from 'lucide-react';

export interface MarsVisualizerProps {
  currentTime: number; // 0.0 to 8.0s
  isPlaying: boolean;
  onTimeUpdate?: (t: number) => void;
  isCinematic169: boolean;
  freeCameraMode: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  stage: 'observing' | 'searching' | 'zooming' | 'arrived';
  onMarsClick?: () => void;
}

export interface MarsLandmark {
  id: string;
  name: string;
  category: string;
  badge: string;
  coordsText: string;
  elevation: string;
  description: string;
  latDeg: number;
  lonDeg: number;
  isPrimary?: boolean;
}

// Authentic NASA Mars planetary landmarks
export const MARS_LANDMARKS: MarsLandmark[] = [
  {
    id: 'jezero',
    name: 'JEZERO CRATER',
    category: 'PRIMARY LANDING SITE · MARS 2020',
    badge: 'PERSEVERANCE & INGENUITY',
    coordsText: '18.444° N, 77.451° E',
    elevation: '-2,540 M (CRATER FLOOR)',
    description: '45-km impact crater featuring an ancient river delta fan rich in lacustrine clays.',
    latDeg: 18.44,
    lonDeg: 77.50,
    isPrimary: true,
  },
  {
    id: 'olympus',
    name: 'OLYMPUS MONS',
    category: 'SHIELD VOLCANO',
    badge: 'HIGHEST PEAK (21.9 KM)',
    coordsText: '18.65° N, 226.20° E',
    elevation: '+21,287 M',
    description: 'Largest volcano in the solar system, covering an area the size of France.',
    latDeg: 18.65,
    lonDeg: 226.20,
  },
  {
    id: 'marineris',
    name: 'VALLES MARINERIS',
    category: 'TECTONIC RIFT CANYON',
    badge: '4,000 KM GRAND CANYON',
    coordsText: '14.00° S, 300.80° E',
    elevation: '-7,000 M DEPTH',
    description: 'Colossal tectonic fissure system stretching across one-fifth of Mars circumference.',
    latDeg: -14.00,
    lonDeg: 300.80,
  },
  {
    id: 'gale',
    name: 'GALE CRATER',
    category: 'MSL EXPLORATION SITE',
    badge: 'CURIOSITY ROVER (2012)',
    coordsText: '5.37° S, 137.44° E',
    elevation: '-4,450 M',
    description: '154-km impact crater hosting Mount Sharp (Aeolis Mons) central sedimentary peak.',
    latDeg: -5.37,
    lonDeg: 137.44,
  },
  {
    id: 'polar_north',
    name: 'PLANUM BOREUM',
    category: 'NORTH POLAR ICE CAP',
    badge: 'WATER & CO₂ ICE SPIRAL',
    coordsText: '84.00° N, 0.00° E',
    elevation: '-2,000 M TO +1,000 M',
    description: 'Perennial water ice and seasonal dry ice cap carved by spiral chasm troughs.',
    latDeg: 84.00,
    lonDeg: 0.00,
  },
];

// Convert Martian lat/lon to 3D coordinates on sphere
function getMarsCoordinates(latDeg: number, lonDeg: number, radius = 5.0): THREE.Vector3 {
  const lat = latDeg * (Math.PI / 180);
  const lon = lonDeg * (Math.PI / 180);
  return new THREE.Vector3(
    radius * Math.cos(lat) * Math.sin(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.cos(lon)
  );
}

// Circular feathered alpha mask texture for the Jezero crater patch
function createFeatheredAlphaTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const center = size / 2;
  const grad = ctx.createRadialGradient(center, center, center * 0.40, center, center, center * 0.96);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.92)');
  grad.addColorStop(0.85, 'rgba(255, 255, 255, 0.35)');
  grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

// Anti-aliased Gaussian-falloff star texture
function createGaussianStarTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.15, 'rgba(255, 255, 255, 0.9)');
  grad.addColorStop(0.4, 'rgba(240, 246, 255, 0.35)');
  grad.addColorStop(0.8, 'rgba(215, 230, 255, 0.06)');
  grad.addColorStop(1.0, 'rgba(200, 220, 255, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 32, 32);

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

// Solar corona & diffraction spike
function createSolarCoronaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.08, 'rgba(255, 252, 240, 0.98)');
  grad.addColorStop(0.20, 'rgba(255, 236, 195, 0.55)');
  grad.addColorStop(0.45, 'rgba(255, 205, 140, 0.15)');
  grad.addColorStop(0.75, 'rgba(255, 180, 110, 0.03)');
  grad.addColorStop(1.0, 'rgba(255, 160, 90, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = 'rgba(255, 248, 230, 0.28)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(128, 16);
  ctx.lineTo(128, 240);
  ctx.moveTo(16, 128);
  ctx.lineTo(240, 128);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

// Irregular asteroid geometry for Phobos and Deimos
function createIrregularMoonGeometry(baseRadius: number, elongationRatio: number, seed: number): THREE.BufferGeometry {
  const geo = new THREE.DodecahedronGeometry(baseRadius, 3);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    // Oblong potato shape + crater indentations
    const elongation = 1.0 + (x > 0 ? 0.3 : -0.15) * elongationRatio;
    const craterNoise = Math.sin(x * 16 + seed) * 0.08 + Math.cos(y * 14 + z * 10) * 0.06;
    const factor = elongation * (1.0 + craterNoise);

    pos.setXYZ(i, x * factor * 1.3, y * factor * 0.9, z * factor * 1.0);
  }
  geo.computeVertexNormals();
  return geo;
}

interface ProjectedMarkerItem {
  landmark: MarsLandmark;
  screenX: number;
  screenY: number;
  visible: boolean;
  isFacing: boolean;
  distance: number;
}

interface ProjectedMoonItem {
  name: string;
  distanceKm: string;
  screenX: number;
  screenY: number;
  visible: boolean;
}

export const MarsVisualizer: React.FC<MarsVisualizerProps> = ({
  currentTime,
  isPlaying,
  isCinematic169,
  freeCameraMode,
  onCanvasReady,
  stage,
  onMarsClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const marsMeshRef = useRef<THREE.Mesh | null>(null);
  const marsMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const atmosphereRef = useRef<THREE.Mesh | null>(null);
  const atmosphereMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const surfaceHazeMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const jezeroPatchRef = useRef<THREE.Group | null>(null);
  const targetingGroupRef = useRef<THREE.Group | null>(null);
  const phobosGroupRef = useRef<THREE.Mesh | null>(null);
  const deimosGroupRef = useRef<THREE.Mesh | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Interaction refs
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseVecRef = useRef(new THREE.Vector2(-999, -999));
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const userRotation = useRef({ x: 0, y: 0 });
  const userZoom = useRef(1.0);

  // States
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [projectedMarkers, setProjectedMarkers] = useState<ProjectedMarkerItem[]>([]);
  const [projectedMoons, setProjectedMoons] = useState<ProjectedMoonItem[]>([]);
  const [showLandmarks, setShowLandmarks] = useState(false); // Clean initial space view
  const [hoveredLandmark, setHoveredLandmark] = useState<MarsLandmark | null>(null);
  const [isMarsHovered, setIsMarsHovered] = useState(false);
  const [mouseScreenPos, setMouseScreenPos] = useState({ x: 0, y: 0 });
  const [marsHighlightPulse, setMarsHighlightPulse] = useState(0.0);

  // Jezero Crater coordinates
  const MARS_RADIUS = 5.0;
  const JEZERO_LAT = 18.44 * (Math.PI / 180);
  const JEZERO_LON = 77.50 * (Math.PI / 180);

  const jezeroPosition = new THREE.Vector3(
    MARS_RADIUS * Math.cos(JEZERO_LAT) * Math.sin(JEZERO_LON),
    MARS_RADIUS * Math.sin(JEZERO_LAT),
    MARS_RADIUS * Math.cos(JEZERO_LAT) * Math.cos(JEZERO_LON)
  );
  const jezeroNormal = jezeroPosition.clone().normalize();

  // Project landmarks to 2D screen
  const updateLandmarkProjections = useCallback(() => {
    const camera = cameraRef.current;
    const mars = marsMeshRef.current;
    const container = containerRef.current;
    if (!camera || !mars || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const marsCenter = mars.getWorldPosition(new THREE.Vector3());

    // Landmarks
    const updated: ProjectedMarkerItem[] = MARS_LANDMARKS.map((landmark) => {
      const localPos = getMarsCoordinates(landmark.latDeg, landmark.lonDeg, MARS_RADIUS);
      const worldPos = localPos.clone().applyMatrix4(mars.matrixWorld);

      const surfaceNormal = worldPos.clone().sub(marsCenter).normalize();
      const camToSurface = camera.position.clone().sub(worldPos).normalize();
      const isFacing = surfaceNormal.dot(camToSurface) > 0.05;

      const projected = worldPos.clone().project(camera);
      const inView =
        projected.z < 1.0 &&
        projected.x >= -1.15 &&
        projected.x <= 1.15 &&
        projected.y >= -1.15 &&
        projected.y <= 1.15;

      const screenX = (projected.x * 0.5 + 0.5) * width;
      const screenY = (-projected.y * 0.5 + 0.5) * height;
      const distance = camera.position.distanceTo(worldPos);

      return {
        landmark,
        screenX,
        screenY,
        visible: isFacing && inView,
        isFacing,
        distance,
      };
    });

    setProjectedMarkers(updated);

    // Moons
    const moons: ProjectedMoonItem[] = [];
    if (phobosGroupRef.current) {
      const phobosWorld = phobosGroupRef.current.getWorldPosition(new THREE.Vector3());
      const proj = phobosWorld.clone().project(camera);
      if (proj.z < 1.0 && proj.x >= -1.1 && proj.x <= 1.1 && proj.y >= -1.1 && proj.y <= 1.1) {
        moons.push({
          name: 'PHOBOS',
          distanceKm: '9,376 KM ORBIT',
          screenX: (proj.x * 0.5 + 0.5) * width,
          screenY: (-proj.y * 0.5 + 0.5) * height,
          visible: true,
        });
      }
    }
    if (deimosGroupRef.current) {
      const deimosWorld = deimosGroupRef.current.getWorldPosition(new THREE.Vector3());
      const proj = deimosWorld.clone().project(camera);
      if (proj.z < 1.0 && proj.x >= -1.1 && proj.x <= 1.1 && proj.y >= -1.1 && proj.y <= 1.1) {
        moons.push({
          name: 'DEIMOS',
          distanceKm: '23,463 KM ORBIT',
          screenX: (proj.x * 0.5 + 0.5) * width,
          screenY: (-proj.y * 0.5 + 0.5) * height,
          visible: true,
        });
      }
    }
    setProjectedMoons(moons);
  }, [MARS_RADIUS]);

  // Three.js Scene Setup
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010204);
    sceneRef.current = scene;

    // 2. Camera: 32-degree perspective for realistic spacecraft telescope framing
    // Mars occupies 55–65% of screen at distance ~16.2
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 1500);
    cameraRef.current = camera;

    // Initial camera position at oblique angle to Mars
    camera.position.set(7.8, 3.2, 13.6);
    camera.lookAt(0, 0.1, 0);

    // 3. Renderer with ACES Filmic tone mapping
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    if (onCanvasReady && canvasRef.current) {
      onCanvasReady(canvasRef.current);
    }

    // 4. Realistic Lighting: Harsh directional solar irradiance in deep space vacuum
    // Oblique sunlight creating authentic day/night terminator line
    const sunDirection = new THREE.Vector3(24, 8, 16).normalize();
    const sunLight = new THREE.DirectionalLight(0xfff5ea, 3.8);
    sunLight.position.copy(sunDirection.clone().multiplyScalar(50));
    scene.add(sunLight);

    // Deep space minimal starlight fill: pitch-black shadows on dark side
    const ambientLight = new THREE.AmbientLight(0x040810, 0.022);
    scene.add(ambientLight);

    // Distant Sun disc with corona in deep space
    const sunCoronaTexture = createSolarCoronaTexture();
    const sunMaterial = new THREE.SpriteMaterial({
      map: sunCoronaTexture,
      blending: THREE.AdditiveBlending,
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    const sunSprite = new THREE.Sprite(sunMaterial);
    sunSprite.position.copy(sunDirection.clone().multiplyScalar(420));
    sunSprite.scale.set(44, 44, 1);
    scene.add(sunSprite);

    // 5. Sparse, Realistic Multi-Spectral Starfield
    const starTex = createGaussianStarTexture();
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3600; // Sparse, realistic starry background
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 280 + Math.random() * 260;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      const spectralRoll = Math.random();
      if (spectralRoll < 0.10) {
        starColors[i * 3] = 0.72;
        starColors[i * 3 + 1] = 0.85;
        starColors[i * 3 + 2] = 1.0;
      } else if (spectralRoll < 0.70) {
        const b = 0.88 + Math.random() * 0.12;
        starColors[i * 3] = b;
        starColors[i * 3 + 1] = b;
        starColors[i * 3 + 2] = b;
      } else if (spectralRoll < 0.88) {
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.94;
        starColors[i * 3 + 2] = 0.82;
      } else {
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.72;
        starColors[i * 3 + 2] = 0.52;
      }
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 2.0,
      map: starTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      sizeAttenuation: true,
    });
    scene.add(new THREE.Points(starGeometry, starMaterial));

    // 6. NASA Calibrated Mars Planetary Textures & Shaders
    const textureLoader = new THREE.TextureLoader();
   const marsColorTexturePath = '/src/assets/images/mars_nasa_truecolor_1790278196036.jpg';
  const marsBumpTexturePath = '/src/assets/images/mars_elevation_bump_1790271817556.jpg';
  const jezeroHiRISEPath = '/src/assets/images/jezero_crater_hirise_1790278218988.jpg';

    textureLoader.load(marsColorTexturePath, (marsTexture) => {
      marsTexture.wrapS = THREE.RepeatWrapping;
      marsTexture.wrapT = THREE.ClampToEdgeWrapping;
      marsTexture.colorSpace = THREE.SRGBColorSpace;

      textureLoader.load(marsBumpTexturePath, (bumpTexture) => {
        bumpTexture.wrapS = THREE.RepeatWrapping;
        bumpTexture.wrapT = THREE.ClampToEdgeWrapping;

        const marsGeometry = new THREE.SphereGeometry(MARS_RADIUS, 256, 256);
        const marsMaterial = new THREE.MeshStandardMaterial({
          map: marsTexture,
          bumpMap: bumpTexture,
          bumpScale: 0.018,
          roughness: 0.88,
          metalness: 0.02,
        });
        marsMaterialRef.current = marsMaterial;

        // Polar ice cap albedo enhancement + retro-reflection
        marsMaterial.onBeforeCompile = (shader) => {
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <dithering_fragment>',
            `
            #include <dithering_fragment>
            vec3 vNormalW = normalize(vNormal);
            float polarLat = abs(vNormalW.y);
            if (polarLat > 0.80) {
              float polarFactor = smoothstep(0.80, 0.94, polarLat);
              gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.92, 0.95, 1.0), polarFactor * 0.58);
            }
            `
          );
        };

        const marsMesh = new THREE.Mesh(marsGeometry, marsMaterial);
        marsMesh.rotation.z = -0.44; // Real axial tilt 25.19°
        marsMesh.rotation.y = 0.22;
        scene.add(marsMesh);
        marsMeshRef.current = marsMesh;

        // 7. Atmospheric Scattering Shaders
        // A. Outer Rayleigh Atmospheric Limb Shell (thin halo)
        const atmosphereGeometry = new THREE.SphereGeometry(MARS_RADIUS * 1.015, 128, 128);
        const atmosphereMaterial = new THREE.ShaderMaterial({
          vertexShader: `
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(mat3(modelMatrix) * normal);
              vec4 worldPos = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPos.xyz;
              gl_Position = projectionMatrix * viewMatrix * worldPos;
            }
          `,
          fragmentShader: `
            precision highp float;
            uniform vec3 uCameraPosition;
            uniform vec3 uSunDirection;
            uniform float uPlanetRadius;
            uniform float uAtmosphereRadius;
            uniform float uDescentProgress;
            varying vec3 vWorldPosition;
            varying vec3 vNormal;

            void main() {
              vec3 rayOrigin = uCameraPosition;
              vec3 rayDir = normalize(vWorldPosition - rayOrigin);

              float b = dot(rayOrigin, rayDir);
              float c = dot(rayOrigin, rayOrigin);
              float c_atmos = c - uAtmosphereRadius * uAtmosphereRadius;
              float d_atmos = b * b - c_atmos;

              if (d_atmos < 0.0) discard;

              float t_atmos_near = max(-b - sqrt(d_atmos), 0.0);
              float t_atmos_far = -b + sqrt(d_atmos);

              float c_planet = c - uPlanetRadius * uPlanetRadius;
              float d_planet = b * b - c_planet;
              bool hitsPlanet = false;
              float t_planet = 1e6;

              if (d_planet >= 0.0) {
                float t0 = -b - sqrt(d_planet);
                if (t0 > 0.0) {
                  hitsPlanet = true;
                  t_planet = t0;
                }
              }

              float t_start = t_atmos_near;
              float t_end = hitsPlanet ? t_planet : t_atmos_far;
              if (t_end <= t_start) discard;

              float t_closest = -b;
              vec3 p_closest = rayOrigin + rayDir * clamp(t_closest, t_start, t_end);
              float dist_closest = length(p_closest);
              float altitude = max(dist_closest - uPlanetRadius, 0.0);
              float atmosThickness = uAtmosphereRadius - uPlanetRadius;
              float altNorm = clamp(altitude / atmosThickness, 0.0, 1.0);

              float density = exp(-altNorm * 11.5);
              float pathLength = (t_end - t_start);
              float grazingFactor = 1.0 + pathLength * 2.2;
              float opticalDepth = density * grazingFactor;

              vec3 normClosest = normalize(p_closest);
              float sunDot = dot(normClosest, uSunDirection);
              float terminatorShadow = smoothstep(-0.16, 0.12, sunDot);

              float cosTheta = dot(rayDir, uSunDirection);
              float phaseRayleigh = 0.75 * (1.0 + cosTheta * cosTheta);
              float g = 0.58;
              float phaseMie = (1.0 - g * g) / pow(max(1.0 + g * g - 2.0 * g * cosTheta, 0.001), 1.5);

              vec3 rayleighColor = vec3(0.38, 0.74, 1.0);
              vec3 dustColor = vec3(0.92, 0.46, 0.20);
              vec3 twilightAmber = vec3(0.98, 0.54, 0.16);
              vec3 baseAtmosphereColor = mix(dustColor, rayleighColor, pow(altNorm, 0.35));

              float twilightFactor = (1.0 - abs(sunDot)) * smoothstep(-0.12, 0.22, sunDot);
              vec3 finalColor = mix(baseAtmosphereColor, twilightAmber, twilightFactor * 0.48);

              float intensity = (opticalDepth * phaseRayleigh * 0.82 + opticalDepth * phaseMie * 0.18) * terminatorShadow * 1.95;
              intensity *= mix(1.0, 0.35, clamp(uDescentProgress, 0.0, 1.0));

              float alpha = clamp(intensity * 1.5, 0.0, 0.95);
              gl_FragColor = vec4(finalColor * intensity, alpha);
            }
          `,
          uniforms: {
            uCameraPosition: { value: new THREE.Vector3() },
            uSunDirection: { value: sunDirection },
            uPlanetRadius: { value: MARS_RADIUS },
            uAtmosphereRadius: { value: MARS_RADIUS * 1.015 },
            uDescentProgress: { value: 0.0 },
          },
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false,
        });

        const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        scene.add(atmosphereMesh);
        atmosphereRef.current = atmosphereMesh;
        atmosphereMatRef.current = atmosphereMaterial;

        // B. Inner Surface Atmospheric Haze Shell
        const surfaceHazeGeometry = new THREE.SphereGeometry(MARS_RADIUS * 1.006, 96, 96);
        const surfaceHazeMaterial = new THREE.ShaderMaterial({
          vertexShader: `
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            void main() {
              vNormal = normalize(mat3(modelMatrix) * normal);
              vec4 worldPos = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPos.xyz;
              gl_Position = projectionMatrix * viewMatrix * worldPos;
            }
          `,
          fragmentShader: `
            precision highp float;
            uniform vec3 uCameraPosition;
            uniform vec3 uSunDirection;
            uniform float uDescentProgress;
            varying vec3 vNormal;
            varying vec3 vWorldPosition;

            void main() {
              vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
              vec3 normal = normalize(vNormal);

              float NdotV = max(dot(normal, viewDir), 0.0);
              float grazing = pow(1.0 - NdotV, 3.2);

              float NdotL = dot(normal, uSunDirection);
              float sunIllumination = smoothstep(-0.15, 0.25, NdotL);

              float cosTheta = dot(-viewDir, uSunDirection);
              float phase = 0.75 * (1.0 + cosTheta * cosTheta);

              vec3 rayleighBlue = vec3(0.40, 0.72, 1.0);
              vec3 dustAmber = vec3(0.90, 0.46, 0.22);
              vec3 hazeColor = mix(dustAmber, rayleighBlue, grazing * 0.75);

              float haze = grazing * sunIllumination * phase * 0.82;
              float forwardScatter = pow(max(dot(viewDir, uSunDirection), 0.0), 4.0) * 0.15 * sunIllumination;
              haze += forwardScatter;
              haze *= mix(1.0, 0.35, clamp(uDescentProgress, 0.0, 1.0));

              gl_FragColor = vec4(hazeColor * haze, clamp(haze * 1.2, 0.0, 0.85));
            }
          `,
          uniforms: {
            uCameraPosition: { value: new THREE.Vector3() },
            uSunDirection: { value: sunDirection },
            uDescentProgress: { value: 0.0 },
          },
          blending: THREE.AdditiveBlending,
          side: THREE.FrontSide,
          transparent: true,
          depthWrite: false,
        });

        const surfaceHazeMesh = new THREE.Mesh(surfaceHazeGeometry, surfaceHazeMaterial);
        scene.add(surfaceHazeMesh);
        surfaceHazeMatRef.current = surfaceHazeMaterial;

        // 8. Mars Moons: PHOBOS and DEIMOS (Small, irregular, dark rocky bodies in distant orbits)
        // A. PHOBOS (inner satellite: ~9,376 km orbit, highly irregular)
        const phobosOrbitGroup = new THREE.Group();
        phobosOrbitGroup.rotation.z = -0.42; // Inclined near Mars equator
        phobosOrbitGroup.rotation.x = 0.18;

        const phobosGeo = createIrregularMoonGeometry(0.11, 1.0, 42);
        const phobosMat = new THREE.MeshStandardMaterial({
          color: 0x6e6760,
          roughness: 0.95,
          metalness: 0.03,
        });
        const phobosMesh = new THREE.Mesh(phobosGeo, phobosMat);
        phobosMesh.position.set(13.8, 0.5, 3.2); // ~2.8 Mars radii
        phobosOrbitGroup.add(phobosMesh);
        scene.add(phobosOrbitGroup);
        phobosGroupRef.current = phobosMesh;

        // B. DEIMOS (outer satellite: ~23,463 km orbit, tiny irregular rocky body)
        const deimosOrbitGroup = new THREE.Group();
        deimosOrbitGroup.rotation.z = -0.38;
        deimosOrbitGroup.rotation.y = 0.45;

        const deimosGeo = createIrregularMoonGeometry(0.065, 0.8, 128);
        const deimosMat = new THREE.MeshStandardMaterial({
          color: 0x5c5752,
          roughness: 0.98,
          metalness: 0.02,
        });
        const deimosMesh = new THREE.Mesh(deimosGeo, deimosMat);
        deimosMesh.position.set(-22.4, 2.8, -8.5); // ~4.6 Mars radii
        deimosOrbitGroup.add(deimosMesh);
        scene.add(deimosOrbitGroup);
        deimosGroupRef.current = deimosMesh;

        // 9. Jezero Crater NASA HiRISE Detailed Patch (Feathered seamlessly)
        textureLoader.load(jezeroHiRISEPath, (jezeroTexture) => {
          jezeroTexture.colorSpace = THREE.SRGBColorSpace;

          const patchGroup = new THREE.Group();
          const patchGeo = new THREE.PlaneGeometry(0.82, 0.82, 64, 64);

          const posAttr = patchGeo.attributes.position;
          for (let i = 0; i < posAttr.count; i++) {
            const vx = posAttr.getX(i);
            const vy = posAttr.getY(i);
            const dist = Math.sqrt(vx * vx + vy * vy);

            let z = 0;
            if (dist < 0.38) {
              z += Math.sin((dist / 0.38) * Math.PI) * -0.016;
            }
            if (vx < -0.05 && Math.abs(vy) < 0.18) {
              z += 0.006 * (1.0 - (vx + 0.35) / 0.3);
            }
            posAttr.setZ(i, z);
          }
          patchGeo.computeVertexNormals();

          const alphaMaskTexture = createFeatheredAlphaTexture(512);

          const patchMat = new THREE.MeshStandardMaterial({
            map: jezeroTexture,
            alphaMap: alphaMaskTexture,
            roughness: 0.92,
            metalness: 0.02,
            transparent: true,
            opacity: 0.98,
            polygonOffset: true,
            polygonOffsetFactor: -2,
            polygonOffsetUnits: -2,
          });

          const patchMesh = new THREE.Mesh(patchGeo, patchMat);
          patchGroup.add(patchMesh);

          patchGroup.position.copy(jezeroPosition);
          patchGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), jezeroNormal);

          marsMesh.add(patchGroup);
          jezeroPatchRef.current = patchGroup;

          // 10. Precision Optical Targeting Reticle
          const targetGroup = new THREE.Group();
          const circleRadius = 0.16;
          const circleSegments = 64;
          const circlePoints = [];
          for (let i = 0; i <= circleSegments; i++) {
            const theta = (i / circleSegments) * Math.PI * 2;
            circlePoints.push(
              new THREE.Vector3(Math.cos(theta) * circleRadius, Math.sin(theta) * circleRadius, 0.005)
            );
          }
          const circleGeo = new THREE.BufferGeometry().setFromPoints(circlePoints);
          const circleMat = new THREE.LineBasicMaterial({
            color: 0x00d4ff,
            transparent: true,
            opacity: 0.0,
            linewidth: 1.5,
          });
          const targetCircle = new THREE.Line(circleGeo, circleMat);
          targetGroup.add(targetCircle);

          const crosshairMat = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.0,
            linewidth: 1.5,
          });

          const ticLength = 0.035;
          const ticGap = 0.05;
          const ticsPoints = [
            new THREE.Vector3(0, ticGap, 0.005),
            new THREE.Vector3(0, ticGap + ticLength, 0.005),
            new THREE.Vector3(0, -ticGap, 0.005),
            new THREE.Vector3(0, -ticGap - ticLength, 0.005),
            new THREE.Vector3(-ticGap, 0, 0.005),
            new THREE.Vector3(-ticGap - ticLength, 0, 0.005),
            new THREE.Vector3(ticGap, 0, 0.005),
            new THREE.Vector3(ticGap + ticLength, 0, 0.005),
          ];
          const crosshairGeo = new THREE.BufferGeometry().setFromPoints(ticsPoints);
          const crosshair = new THREE.LineSegments(crosshairGeo, crosshairMat);
          targetGroup.add(crosshair);

          targetGroup.position.copy(
            jezeroPosition.clone().add(jezeroNormal.clone().multiplyScalar(0.015))
          );
          targetGroup.quaternion.copy(patchGroup.quaternion);

          marsMesh.add(targetGroup);
          targetingGroupRef.current = targetGroup;

          setAssetsLoaded(true);
        });
      });
    });

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      updateLandmarkProjections();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      renderer.dispose();
    };
  }, [updateLandmarkProjections]);

  // Main Render & Animation Loop
  useEffect(() => {
    let lastTime = performance.now();

    const renderLoop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const camera = cameraRef.current;
      const scene = sceneRef.current;
      const renderer = rendererRef.current;
      const mars = marsMeshRef.current;
      const targetGroup = targetingGroupRef.current;
      const phobos = phobosGroupRef.current;
      const deimos = deimosGroupRef.current;

      if (!camera || !scene || !renderer) {
        animationFrameId.current = requestAnimationFrame(renderLoop);
        return;
      }

      // 1. Planetary & Moon Kinematics
      if (mars) {
        if (stage === 'observing') {
          // Slow, majestic, physically believable rotation (0.015 rad/s)
          mars.rotation.y += delta * 0.016;
        } else if (stage === 'searching') {
          // Pauses or slows down significantly when user clicks Mars
          mars.rotation.y += delta * 0.005;
        } else {
          // In zoom descent
          mars.rotation.y = 0.22 + 2.0 * 0.012 + Math.min(currentTime, 4.0) * 0.004;
        }
      }

      // Moons subtle orbital movement
      if (phobos) {
        phobos.rotation.y += delta * 0.02;
        const pParent = phobos.parent;
        if (pParent) {
          pParent.rotation.y += delta * 0.012; // Phobos fast orbit
        }
      }
      if (deimos) {
        deimos.rotation.y += delta * 0.008;
        const dParent = deimos.parent;
        if (dParent) {
          dParent.rotation.y += delta * 0.004; // Deimos slower distant orbit
        }
      }

      // Mars click highlight pulse decay
      if (marsHighlightPulse > 0) {
        setMarsHighlightPulse((prev) => Math.max(0, prev - delta * 2.2));
      }
      if (marsMaterialRef.current) {
        if (marsHighlightPulse > 0.01) {
          marsMaterialRef.current.emissive.setRGB(
            marsHighlightPulse * 0.18,
            marsHighlightPulse * 0.24,
            marsHighlightPulse * 0.32
          );
        } else if (isMarsHovered && stage === 'observing') {
          marsMaterialRef.current.emissive.setRGB(0.04, 0.08, 0.12);
        } else {
          marsMaterialRef.current.emissive.setRGB(0, 0, 0);
        }
      }

      // 2. Camera Positioning & Choreography
      if (!freeCameraMode) {
        let camPos = new THREE.Vector3();
        let lookAtTarget = new THREE.Vector3(0, 0.12, 0);

        if (stage === 'observing') {
          // STAGE 1: Spacecraft observation perspective
          // Mars occupies roughly 55-65% of screen, viewed from oblique angle
          const baseDist = 16.2;
          // Very subtle craft micro-drift floating movement
          const driftX = Math.sin(now * 0.0003) * 0.18;
          const driftY = Math.cos(now * 0.00025) * 0.12;
          const orbitAngle = 0.44 + driftX * 0.05;

          camPos.set(
            Math.sin(orbitAngle) * baseDist + driftX,
            3.2 + driftY,
            Math.cos(orbitAngle) * baseDist
          );
          lookAtTarget.set(0, 0.12, 0);
          renderer.toneMappingExposure = 1.05;
        } else if (stage === 'searching') {
          // STAGE 2: Bring camera slightly closer, Mars stays prominent in background
          const baseDist = 14.8;
          const driftX = Math.sin(now * 0.0002) * 0.10;
          const driftY = Math.cos(now * 0.0002) * 0.08;
          const orbitAngle = 0.42 + driftX * 0.04;

          camPos.set(
            Math.sin(orbitAngle) * baseDist,
            2.8 + driftY,
            Math.cos(orbitAngle) * baseDist
          );
          lookAtTarget.set(0, 0.10, 0);
          renderer.toneMappingExposure = 1.08;
        } else {
          // CONTINUOUS CINEMATIC ZOOM TO JEZERO CRATER
          // Continuous descent plunge from space to Jezero Crater floor
          renderer.toneMappingExposure = 1.08;
          let camDistance = 15.4;

          if (currentTime < 2.0) {
            const t = currentTime / 2.0;
            const easeT = Math.sin((t * Math.PI) / 2);
            camDistance = 15.4 - easeT * 1.5;
            const orbitAngle = 0.42 + easeT * 0.06;
            camPos.set(
              Math.sin(orbitAngle) * camDistance,
              2.8 - easeT * 0.4,
              Math.cos(orbitAngle) * camDistance
            );
            lookAtTarget.set(0, 0.12, 0);
          } else if (currentTime >= 2.0 && currentTime < 4.0) {
            const t = (currentTime - 2.0) / 2.0;
            const ease = Math.pow(t, 2.2);
            camDistance = 13.9 * (1 - ease) + 5.85 * ease;

            const jezeroWorldPos = new THREE.Vector3();
            if (jezeroPatchRef.current) {
              jezeroPatchRef.current.getWorldPosition(jezeroWorldPos);
            } else {
              jezeroWorldPos.copy(jezeroPosition);
            }
            const jezeroWorldNormal = jezeroWorldPos.clone().normalize();

            const startVec = new THREE.Vector3(Math.sin(0.48) * 13.9, 2.4, Math.cos(0.48) * 13.9).normalize();
            const endVec = jezeroWorldNormal.clone();
            const currentDir = new THREE.Vector3().lerpVectors(startVec, endVec, Math.min(ease * 1.15, 1.0)).normalize();
            camPos = currentDir.multiplyScalar(camDistance);
            camPos.y += (1 - ease) * 1.0 + 0.12;

            lookAtTarget.lerpVectors(new THREE.Vector3(0, 0.12, 0), jezeroWorldPos, ease);
          } else if (currentTime >= 4.0 && currentTime < 6.0) {
            const t = (currentTime - 4.0) / 2.0;
            const ease = 1 - Math.pow(1 - t, 2.5);
            camDistance = 5.85 - ease * 0.57;

            const jezeroWorldPos = new THREE.Vector3();
            if (jezeroPatchRef.current) {
              jezeroPatchRef.current.getWorldPosition(jezeroWorldPos);
            } else {
              jezeroWorldPos.copy(jezeroPosition);
            }
            const jezeroWorldNormal = jezeroWorldPos.clone().normalize();
            const offsetDirection = new THREE.Vector3(0.2, 0.4, 0.8).normalize();

            camPos = jezeroWorldPos.clone().add(jezeroWorldNormal.clone().multiplyScalar(camDistance - MARS_RADIUS));
            camPos.add(offsetDirection.multiplyScalar(0.35 * (1 - ease * 0.5)));
            lookAtTarget.copy(jezeroWorldPos);
          } else {
            const t = (currentTime - 6.0) / 2.0;
            camDistance = 5.28 - t * 0.05;

            const jezeroWorldPos = new THREE.Vector3();
            if (jezeroPatchRef.current) {
              jezeroPatchRef.current.getWorldPosition(jezeroWorldPos);
            } else {
              jezeroWorldPos.copy(jezeroPosition);
            }
            const jezeroWorldNormal = jezeroWorldPos.clone().normalize();
            const offsetDirection = new THREE.Vector3(0.1, 0.3, 0.6).normalize();

            camPos = jezeroWorldPos.clone().add(jezeroWorldNormal.clone().multiplyScalar(camDistance - MARS_RADIUS));
            camPos.add(offsetDirection.multiplyScalar(0.16));
            lookAtTarget.copy(jezeroWorldPos);
          }
        }

        camera.position.copy(camPos);
        camera.lookAt(lookAtTarget);
      } else {
        // Free Camera Mode
        const distance = 16.0 * userZoom.current;
        const rotY = userRotation.current.x;
        const rotX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, userRotation.current.y));

        camera.position.set(
          distance * Math.sin(rotY) * Math.cos(rotX),
          distance * Math.sin(rotX),
          distance * Math.cos(rotY) * Math.cos(rotX)
        );
        camera.lookAt(0, 0, 0);
      }

      // Reticle Visibility in 3D Scene
      if (targetGroup) {
        if (stage === 'observing' || stage === 'searching' || currentTime < 3.8) {
          targetGroup.visible = false;
        } else if (currentTime >= 3.8 && currentTime < 6.0) {
          targetGroup.visible = true;
          const alpha = Math.min((currentTime - 3.8) / 0.8, 0.85);
          targetGroup.children.forEach((child) => {
            if (child instanceof THREE.Line || child instanceof THREE.LineSegments) {
              (child.material as THREE.LineBasicMaterial).opacity = alpha;
            }
          });
          const scale = 1.0 + Math.sin(currentTime * 5) * 0.05;
          targetGroup.scale.set(scale, scale, scale);
        } else {
          targetGroup.visible = true;
          const lockPulse = 1.0 + Math.sin((currentTime - 6.0) * 12) * 0.08;
          targetGroup.scale.set(lockPulse, lockPulse, lockPulse);
          targetGroup.children.forEach((child) => {
            if (child instanceof THREE.Line || child instanceof THREE.LineSegments) {
              (child.material as THREE.LineBasicMaterial).opacity = 0.95;
              (child.material as THREE.LineBasicMaterial).color.setHex(0x38bdf8);
            }
          });
        }
      }

      // Update atmosphere uniforms
      const sunDir = new THREE.Vector3(24, 8, 16).normalize();
      const descentProgress = stage === 'zooming' || stage === 'arrived' ? Math.max(0, Math.min(1, (currentTime - 2.0) / 4.0)) : 0.0;

      if (atmosphereMatRef.current) {
        atmosphereMatRef.current.uniforms.uCameraPosition.value.copy(camera.position);
        atmosphereMatRef.current.uniforms.uSunDirection.value.copy(sunDir);
        atmosphereMatRef.current.uniforms.uDescentProgress.value = descentProgress;
      }
      if (surfaceHazeMatRef.current) {
        surfaceHazeMatRef.current.uniforms.uCameraPosition.value.copy(camera.position);
        surfaceHazeMatRef.current.uniforms.uSunDirection.value.copy(sunDir);
        surfaceHazeMatRef.current.uniforms.uDescentProgress.value = descentProgress;
      }

      renderer.render(scene, camera);
      updateLandmarkProjections();

      animationFrameId.current = requestAnimationFrame(renderLoop);
    };

    animationFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [stage, currentTime, freeCameraMode, isMarsHovered, marsHighlightPulse, updateLandmarkProjections]);

  // Pointer move handler for Mars hover detection & cursor follower
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current || !marsMeshRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mouseVecRef.current.set(x, y);

    setMouseScreenPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    if (stage === 'observing') {
      raycasterRef.current.setFromCamera(mouseVecRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObject(marsMeshRef.current, false);
      const isHovering = intersects.length > 0;
      if (isHovering !== isMarsHovered) {
        setIsMarsHovered(isHovering);
        if (isHovering) {
          soundManager.playHoverBlip();
        }
      }
    }

    if (freeCameraMode && isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;
      userRotation.current.x += deltaX * 0.005;
      userRotation.current.y += deltaY * 0.005;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  // Canvas click handler for Mars click detection
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stage === 'observing') {
      if (!containerRef.current || !cameraRef.current || !marsMeshRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseVecRef.current.set(x, y);

      raycasterRef.current.setFromCamera(mouseVecRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObject(marsMeshRef.current, false);

      if (intersects.length > 0) {
        // Mars was clicked!
        soundManager.playMarsClickSound();
        setMarsHighlightPulse(1.0);
        setIsMarsHovered(false);
        onMarsClick?.();
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (freeCameraMode) {
      isDraggingRef.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!freeCameraMode) return;
    e.preventDefault();
    userZoom.current = Math.max(0.35, Math.min(2.5, userZoom.current + e.deltaY * 0.001));
  };

  const jezeroMarker = projectedMarkers.find((m) => m.landmark.isPrimary);
  const secondaryLandmarks = projectedMarkers.filter((m) => !m.landmark.isPrimary);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className={`relative w-full h-full select-none overflow-hidden bg-black ${
        freeCameraMode
          ? 'cursor-grab active:cursor-grabbing'
          : stage === 'observing' && isMarsHovered
          ? 'cursor-crosshair'
          : 'cursor-default'
      }`}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full block transition-opacity duration-1000 ${
          assetsLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* MINIMAL INITIAL UI (STAGE 1 — DISCREET CORNER LABEL ONLY) */}
      {assetsLoaded && stage === 'observing' && (
        <div className="absolute top-6 left-6 pointer-events-none z-20 animate-fadeIn">
          <div className="flex flex-col gap-0.5 opacity-80">
            <div className="text-xs font-bold font-tech tracking-[0.25em] text-slate-200 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              THE SOL EXPLORERS
            </div>
            <div className="text-[10px] font-mono-data tracking-wider text-cyan-400/90 uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              MARS MISSION NAVIGATOR
            </div>
            <div className="text-[9px] font-mono-data text-slate-500 tracking-tight mt-0.5">
              ORBITAL OBSERVATION PLATFORM // 1.524 AU
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE MARS HOVER RETICLE / LABEL */}
      {stage === 'observing' && isMarsHovered && (
        <div
          className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-12 transition-transform duration-75 ease-out"
          style={{ left: `${mouseScreenPos.x}px`, top: `${mouseScreenPos.y}px` }}
        >
          <div className="bg-slate-950/90 border border-cyan-400/70 shadow-[0_0_20px_rgba(34,211,238,0.4)] px-3 py-1.5 rounded-md flex items-center gap-2.5 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-tech font-bold tracking-[0.22em] text-cyan-300 uppercase">
              EXPLORE MARS
            </span>
            <span className="text-[9px] font-mono-data text-slate-400 border-l border-slate-700 pl-2">
              CLICK PLANET
            </span>
          </div>
        </div>
      )}

      {/* MARS MOONS LABELS (PHOBOS & DEIMOS - WHEN SHOWING LANDMARKS) */}
      {assetsLoaded && showLandmarks && stage === 'observing' && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {projectedMoons.map((moon) => (
            <div
              key={moon.name}
              className="absolute pointer-events-none transition-all duration-150"
              style={{
                left: `${moon.screenX + 10}px`,
                top: `${moon.screenY - 10}px`,
              }}
            >
              <div className="flex items-center gap-1.5 bg-black/60 border border-slate-700/60 px-2 py-0.5 rounded text-[9px] font-mono-data text-slate-400 backdrop-blur-xs">
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="font-semibold text-slate-200">{moon.name}</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">{moon.distanceKm}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NEAT SVG LEADER LINES LAYER (DURING DESCENT / LANDMARKS TOGGLE) */}
      {assetsLoaded && (showLandmarks || stage === 'zooming' || stage === 'arrived') && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
          <defs>
            <linearGradient id="cyanLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="dimLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Jezero Crater Leader Line in Orbit & Early Zoom */}
          {jezeroMarker && jezeroMarker.visible && (stage === 'zooming' || stage === 'arrived') && currentTime < 3.2 && (
            <g className="transition-opacity duration-300">
              <circle cx={jezeroMarker.screenX} cy={jezeroMarker.screenY} r={3} fill="#22d3ee" className="animate-pulse" />
              <circle
                cx={jezeroMarker.screenX}
                cy={jezeroMarker.screenY}
                r={10}
                stroke="#22d3ee"
                strokeWidth={1}
                strokeDasharray="2,2"
                fill="none"
                opacity={0.65}
              />
              <path
                d={`M ${jezeroMarker.screenX} ${jezeroMarker.screenY} L ${jezeroMarker.screenX + 38} ${
                  jezeroMarker.screenY - 32
                } L ${jezeroMarker.screenX + 92} ${jezeroMarker.screenY - 32}`}
                stroke="url(#cyanLineGrad)"
                strokeWidth={1.4}
                fill="none"
              />
            </g>
          )}

          {/* Secondary Landmarks Leader Lines */}
          {showLandmarks &&
            secondaryLandmarks.map((m) => {
              if (!m.visible) return null;
              return (
                <g key={`line-${m.landmark.id}`}>
                  <circle cx={m.screenX} cy={m.screenY} r={2.5} fill="#cbd5e1" opacity={0.8} />
                  <circle
                    cx={m.screenX}
                    cy={m.screenY}
                    r={6}
                    stroke="#94a3b8"
                    strokeWidth={0.8}
                    fill="none"
                    opacity={0.4}
                  />
                  <path
                    d={`M ${m.screenX} ${m.screenY} L ${m.screenX + 18} ${m.screenY - 14} L ${
                      m.screenX + 44
                    } ${m.screenY - 14}`}
                    stroke="url(#dimLineGrad)"
                    strokeWidth={1}
                    fill="none"
                  />
                </g>
              );
            })}
        </svg>
      )}

      {/* HTML LOCATION NAME OVERLAYS */}
      {assetsLoaded && showLandmarks && stage === 'observing' && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {projectedMarkers.map((m) => {
            if (!m.visible) return null;
            const isHovered = hoveredLandmark?.id === m.landmark.id;

            return (
              <div
                key={m.landmark.id}
                className="absolute pointer-events-auto cursor-pointer group"
                style={{
                  left: `${m.screenX + 40}px`,
                  top: `${m.screenY - 24}px`,
                }}
                onMouseEnter={() => setHoveredLandmark(m.landmark)}
                onMouseLeave={() => setHoveredLandmark(null)}
              >
                <div
                  className={`px-2 py-1 rounded transition-all duration-150 backdrop-blur-sm ${
                    isHovered
                      ? 'bg-slate-900/95 border border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                      : 'bg-black/60 border border-slate-700/60 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-slate-400 group-hover:bg-cyan-400" />
                    <span className="text-[10px] font-tech tracking-wider uppercase font-semibold text-slate-200 group-hover:text-white">
                      {m.landmark.name}
                    </span>
                  </div>

                  <div className="text-[9px] font-mono-data text-slate-400 group-hover:text-cyan-300">
                    {m.landmark.badge}
                  </div>

                  {isHovered && (
                    <div className="mt-1 pt-1 border-t border-slate-800 text-[9px] font-mono-data text-slate-300 max-w-[200px]">
                      <div>{m.landmark.coordsText}</div>
                      <div className="text-slate-400">{m.landmark.elevation}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Discreet Landmark Markers Toggle Button (Top Right of Stage) */}
      {assetsLoaded && stage === 'observing' && (
        <div className="absolute top-5 right-6 z-20 pointer-events-auto">
          <button
            onClick={() => setShowLandmarks(!showLandmarks)}
            className={`px-2.5 py-1 text-[10px] font-mono-data rounded border transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-md ${
              showLandmarks
                ? 'bg-slate-900/80 text-cyan-300 border-cyan-500/40 hover:bg-slate-800'
                : 'bg-slate-950/70 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
            title="Toggle Planetary Landmarks & Satellites"
          >
            <Crosshair className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">LANDMARK LABELS:</span>
            <span className="font-semibold">{showLandmarks ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      )}

      {/* Loading state indicator */}
      {!assetsLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20">
          <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-cyan-400 animate-spin mb-3" />
          <div className="text-xs font-mono-data tracking-widest text-slate-400 uppercase">
            Loading NASA Calibrated Planetary Imagery...
          </div>
        </div>
      )}
    </div>
  );
};
