declare module 'canvas-confetti' {
  interface Options {
    particleCount?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    gravity?: number;
    scalar?: number;
    drift?: number;
    ticks?: number;
    shapes?: string[];
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }
  function confetti(options?: Options): Promise<null> | null;
  export = confetti;
}
