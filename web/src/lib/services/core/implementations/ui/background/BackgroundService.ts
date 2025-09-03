import type { BackgroundSystem, BackgroundType, QualityLevel } from "$domain";
import type { IBackgroundService } from "$services";
import { injectable } from "inversify";
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
}
