// Deep Ocean Background Models

export interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  sway: number;
  opacity: number;
  swayOffset: number;
  startY: number;
}

export interface MarineLife {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  speed: number;
  opacity: number;
  type: "fish" | "jellyfish" | "seaweed";
  animationPhase: number;
  color: string;
}

export interface OceanParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface DeepOceanState {
  bubbles: Bubble[];
  marineLife: MarineLife[];
  particles: OceanParticle[];
  currentGradient: {
    top: string;
    bottom: string;
  };
  lightRays: Array<{
    x: number;
    opacity: number;
    width: number;
    angle: number;
  }>;
}
