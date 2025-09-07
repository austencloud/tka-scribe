import { cubicOut } from "svelte/easing";

interface FoldTransitionParams {
  duration?: number;
  direction?: "fold-in" | "fold-out";
  axis?: "x" | "y";
  easing?: (t: number) => number;
}

export function foldTransition(
  node: Element,
  params: FoldTransitionParams = {}
) {
  const {
    duration = 600,
    direction = "fold-in",
    axis = "y",
    easing = cubicOut,
  } = params;

  const isFoldIn = direction === "fold-in";
  const isYAxis = axis === "y";

  return {
    duration,
    easing,
    css: (t: number) => {
      const progress = isFoldIn ? t : 1 - t;
      const angle = (1 - progress) * 90;
      const opacity = Math.max(0, progress - 0.1);
      const scale = 0.9 + progress * 0.1;

      const transform = isYAxis
        ? `rotateX(${angle}deg) scale(${scale})`
        : `rotateY(${angle}deg) scale(${scale})`;

      const transformOrigin = isYAxis ? "center top" : "left center";

      return `
        transform: ${transform};
        transform-origin: ${transformOrigin};
        opacity: ${opacity};
        backface-visibility: hidden;
        perspective: 1000px;
      `;
    },
  };
}

export function slideTransition(
  node: Element,
  params: { direction?: string; duration?: number; delay?: number } = {}
) {
  const { direction = "up", duration = 400, delay = 0 } = params;

  const getTransform = () => {
    switch (direction) {
      case "up":
        return "translateY(100%)";
      case "down":
        return "translateY(-100%)";
      case "left":
        return "translateX(100%)";
      case "right":
        return "translateX(-100%)";
      default:
        return "translateY(100%)";
    }
  };

  return {
    duration,
    delay,
    easing: cubicOut,
    css: (t: number) => {
      const opacity = t;
      const transform = `${getTransform()} scale(${0.9 + t * 0.1})`;

      return `
        transform: ${t === 1 ? "none" : transform};
        opacity: ${opacity};
      `;
    },
  };
}
