// Night Sky Background Models

export interface ParallaxLayer {
  stars: Star[];
  driftX: number;
  driftY: number;
}

export interface Star {
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
  currentOpacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  isTwinkling: boolean;
  color: string;
  isSparkle: boolean; // True for 5-pointed star shape with glow, false for circular
}

export interface MoonIllumination {
  /** Fraction of moon illuminated (0-1) */
  fraction: number;
  /** Position in lunar cycle (0 = new moon, 0.5 = full moon, 1 = new moon) */
  phaseValue: number;
  /** Angle of the bright limb */
  angle: number;
  /** Parallactic angle - rotation based on observer's latitude */
  parallacticAngle: number;
  /** Whether moon is waxing (true) or waning (false) */
  isWaxing: boolean;
  /** Earthshine intensity (0-1) - visible during crescent phases */
  earthshineIntensity: number;
}

export interface Moon {
  x: number;
  y: number;
  radius: number;
  color: string;
  driftX?: number;
  driftY?: number;
  illumination?: MoonIllumination;
  /** User's latitude for orientation calculation */
  observerLatitude?: number;
}

export interface Spaceship {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  active: boolean;
  direction: number;
  opacity: number;
  image?: HTMLImageElement;
  imageLoaded?: boolean;
}

export interface EasterEggState<T> {
  element: T | null;
  timer: number;
  interval: number;
}

export interface ParallaxConfig {
  far: {
    density: number;
    drift: number;
    sizeMultiplier: number;
    opacityMultiplier: number;
    sparkleChance: number;
  };
  mid: {
    density: number;
    drift: number;
    sizeMultiplier: number;
    opacityMultiplier: number;
    sparkleChance: number;
  };
  near: {
    density: number;
    drift: number;
    sizeMultiplier: number;
    opacityMultiplier: number;
    sparkleChance: number;
  };
}

// Night Sky Configuration Models

export interface StarConfig {
  minSize: number;
  maxSize: number;
  colors: string[];
  baseOpacityMin: number;
  baseOpacityMax: number;
  minTwinkleSpeed: number;
  maxTwinkleSpeed: number;
  twinkleChance: number;
}
