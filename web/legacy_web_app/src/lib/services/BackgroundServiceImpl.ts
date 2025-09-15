/**
 * Background Service Implementation
 */

import { Injectable } from "$legacyLib/core/di/ServiceDecorator";
import { SERVICE_TOKENS } from "$legacyLib/core/di/ServiceTokens";
import { BackgroundFactory } from "$legacyLib/components/Backgrounds/core/BackgroundFactory";
import type { BackgroundService } from "$legacyLib/core/services/BackgroundSystem";
import type { BackgroundSystem } from "$legacyLib/components/Backgrounds/types/types";

@Injectable(SERVICE_TOKENS.BACKGROUND_SERVICE)
export class BackgroundServiceImpl implements BackgroundService {
  private currentBackground: BackgroundSystem | null = null;
  private currentType: string = "snowfall";

  getCurrentBackground(): BackgroundSystem | null {
    return this.currentBackground;
  }

  setBackgroundType(type: string): void {
    this.currentType = type;
    this.currentBackground = BackgroundFactory.createBackgroundSystem({
      type: type as any,
      initialQuality: "medium"
    });
  }

  initialize(): void {
    this.setBackgroundType(this.currentType);
  }

  cleanup(): void {
    if (this.currentBackground?.cleanup) {
      this.currentBackground.cleanup();
    }
    this.currentBackground = null;
  }
}