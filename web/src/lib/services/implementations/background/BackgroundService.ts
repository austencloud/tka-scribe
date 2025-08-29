import type {
  BackgroundSystem,
  BackgroundType,
  PerformanceMetrics,
  QualityLevel,
} from "$lib/domain/background/BackgroundTypes";
import { detectAppropriateQuality } from "$lib/domain/background/configs/config";
import { injectable } from "inversify";
import type { IBackgroundService } from "../../interfaces/background/IBackgroundService";
import { BackgroundFactory } from "./BackgroundFactory";

@injectable()
export class BackgroundService implements IBackgroundService {
  async createSystem(
    type: BackgroundType,
    quality: QualityLevel
  ): Promise<BackgroundSystem> {
    return BackgroundFactory.createBackgroundSystem({
      type,
      initialQuality: quality,
    });
  }

  getSupportedTypes(): BackgroundType[] {
    return BackgroundFactory.getSupportedBackgroundTypes();
  }

  detectOptimalQuality(): QualityLevel {
    return detectAppropriateQuality();
  }

  getSystemMetrics(system: BackgroundSystem): PerformanceMetrics | null {
    if (system.getMetrics) {
      return system.getMetrics();
    }
    return null;
  }
}
