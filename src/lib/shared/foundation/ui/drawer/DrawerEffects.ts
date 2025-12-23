export interface DrawerEffectsOptions {
  scaleBackground: boolean;
  preventScroll: boolean;
  isAnimatedOpen: boolean;
}

export class DrawerEffects {
  private originalBodyOverflow: string | null = null;
  private originalBodyPaddingRight: string | null = null;
  private options: DrawerEffectsOptions;

  constructor(options: DrawerEffectsOptions) {
    this.options = options;
  }

  apply() {
    if (this.options.scaleBackground) {
      this.applyScaleBackground();
    }
    if (this.options.preventScroll) {
      this.applyScrollLock();
    }
  }

  cleanup() {
    if (this.options.scaleBackground) {
      this.cleanupScaleBackground();
    }
    if (this.options.preventScroll) {
      this.cleanupScrollLock();
    }
  }

  update(options: Partial<DrawerEffectsOptions>) {
    const changed =
      options.isAnimatedOpen !== this.options.isAnimatedOpen ||
      options.preventScroll !== this.options.preventScroll ||
      options.scaleBackground !== this.options.scaleBackground;

    if (changed) {
      this.cleanup();
      this.options = { ...this.options, ...options };
      this.apply();
    }
  }

  private applyScaleBackground() {
    if (this.options.isAnimatedOpen) {
      document.body.style.setProperty("--drawer-bg-scale", "0.96");
      document.body.style.setProperty("--drawer-bg-border-radius", "8px");
      document.body.classList.add("drawer-scale-bg-active");
    }
  }

  private cleanupScaleBackground() {
    document.body.style.removeProperty("--drawer-bg-scale");
    document.body.style.removeProperty("--drawer-bg-border-radius");
    document.body.classList.remove("drawer-scale-bg-active");
  }

  private applyScrollLock() {
    if (this.options.isAnimatedOpen) {
      this.originalBodyOverflow = document.body.style.overflow;
      this.originalBodyPaddingRight = document.body.style.paddingRight;

      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }
  }

  private cleanupScrollLock() {
    if (this.originalBodyOverflow !== null) {
      document.body.style.overflow = this.originalBodyOverflow;
    }
    if (this.originalBodyPaddingRight !== null) {
      document.body.style.paddingRight = this.originalBodyPaddingRight;
    }
  }
}
