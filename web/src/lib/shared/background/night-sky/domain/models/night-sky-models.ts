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
}

export interface Moon {
  x: number;
  y: number;
  radius: number;
  color: string;
  driftX?: number;
  driftY?: number;
  illumination?: {
    fraction: number;
    phaseValue: number;
    angle: number;
  };
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