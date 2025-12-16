// Snowfall-specific Models

export interface Snowflake {
  x: number;
  y: number;
  speed: number;
  size: number;
  sway: number;
  opacity: number;
  shape: Path2D;
  color: string;
}

export interface ShootingStar {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  speed: number;
  tail: Array<{
    x: number;
    y: number;
    size: number;
    color: string;
  }>;
  prevX: number;
  prevY: number;
  tailLength: number;
  opacity: number;
  offScreen: boolean;
  color: string;
  twinkle: boolean;
}

export interface ShootingStarState {
  star: ShootingStar | null;
  timer: number;
  interval: number;
}

export interface SantaState {
  x: number;
  y: number;
  speed: number;
  active: boolean;
  direction: number;
  opacity: number;
  imageLoaded?: boolean;
}