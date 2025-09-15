// src/lib/components/Backgrounds/systems/SantaSystem.ts
import { SantaConfig, SeasonalConfig } from "../config";
import type { Dimensions, SantaState } from "../types/types";

export const createSantaSystem = () => {
  const config = SantaConfig;
  let imageLoaded = true; // No image assets; drawing procedurally

  const preloadImages = (): Promise<void> => Promise.resolve();

  const getRandomInterval = (): number => {
    return (
      Math.floor(
        Math.random() * (config.santa.maxInterval - config.santa.minInterval + 1)
      ) + config.santa.minInterval
    );
  };

  const getRandomSpeed = (): number => {
    return config.santa.speed;
  };

  const calculateSize = (width: number): number => {
    return config.santa.size;
  };

  const initialState: SantaState = {
    x: -100,
    y: 0,
    speed: 0,
    active: false,
    direction: 1,
    opacity: 1, // Default opacity for Santa
  };

  const update = (
    state: SantaState,
    { width, height }: Dimensions,
    isDecember: boolean
  ): SantaState => {
    const isSeasonalEnabled = SeasonalConfig.december.enableSanta && isDecember;

    if (!state.active && isSeasonalEnabled) {
      if (Math.random() < (config.santa.spawnChance ?? 0.01)) {
        const direction = Math.random() > 0.5 ? 1 : -1;
        const startX =
          direction > 0 ? -calculateSize(width) : width + calculateSize(width);
        const bandTop = height * 0.15;
        const bandHeight = height * 0.5;
        const randomY = bandTop + Math.random() * bandHeight;

        return {
          x: startX,
          y: randomY,
          speed: getRandomSpeed(),
          active: true,
          direction: direction,
          opacity: 1,
        };
      }
      return state;
    } else if (state.active) {
      const newX = state.x + state.speed * width * state.direction * 0.001;

      if (
        (state.direction > 0 && newX > width + calculateSize(width)) ||
        (state.direction < 0 && newX < -calculateSize(width))
      ) {
        return {
          ...initialState,
        };
      }

      // Optional vertical bobbing
      const bob = config.santa.verticalBobbing;
      const newY = bob
        ? state.y + Math.sin(Date.now() * bob.frequency) * bob.amplitude * 0.02
        : state.y;

      return {
        ...state,
        x: newX,
        y: newY,
      };
    }

    return state;
  };

  const draw = (
    state: SantaState,
    ctx: CanvasRenderingContext2D,
    { width }: Dimensions
  ): void => {
    if (!state.active || !ctx) return;

    const santaSize = calculateSize(width);

    ctx.save();
    ctx.globalAlpha = state.opacity;

    // Draw sleigh (simple rounded rect)
    const sleighWidth = santaSize * 0.6;
    const sleighHeight = santaSize * 0.3;
    const sleighX = state.x - sleighWidth / 2;
    const sleighY = state.y - sleighHeight / 2;

    ctx.fillStyle = "#c0392b"; // red sleigh
    ctx.fillRect(sleighX, sleighY, sleighWidth, sleighHeight);

    // Sleigh runner
    ctx.strokeStyle = "#8e44ad";
    ctx.lineWidth = Math.max(1, sleighHeight * 0.1);
    ctx.beginPath();
    ctx.moveTo(sleighX, sleighY + sleighHeight);
    ctx.lineTo(sleighX + sleighWidth, sleighY + sleighHeight);
    ctx.stroke();

    // Draw reindeer as circles in front of sleigh
    const herd = config.santa.reindeer;
    const count = herd?.count ?? 4;
    const spacing = herd?.spacing ?? (santaSize * 0.4);
    const startX = state.direction > 0 ? sleighX - spacing : sleighX + sleighWidth + spacing;
    const dirMult = state.direction > 0 ? -1 : 1;

    ctx.fillStyle = "#d2b48c"; // tan reindeers
    for (let i = 0; i < count; i++) {
      const rx = startX + dirMult * (i * spacing);
      const ry = state.y - sleighHeight * 0.1 * (i % 2 === 0 ? 1 : -1);
      ctx.beginPath();
      ctx.arc(rx, ry, santaSize * 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Harness line
      ctx.strokeStyle = "#7f8c8d";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(sleighX + (state.direction > 0 ? 0 : sleighWidth), sleighY + sleighHeight / 2);
      ctx.stroke();
    }

    // Optional sleigh trail
    if (config.santa.sleigh?.enabled) {
      ctx.globalAlpha = (config.santa.sleigh.opacity ?? 0.7) * state.opacity;
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sleighX, sleighY + sleighHeight);
      ctx.lineTo(sleighX - dirMult * (config.santa.sleigh.length ?? 40), sleighY + sleighHeight);
      ctx.stroke();
      ctx.globalAlpha = state.opacity;
    }

    ctx.restore();
  };

  return {
    preloadImages,
    initialState,
    update,
    draw,
  };
};
