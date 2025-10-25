import { injectable } from "inversify";
import { CAP_TYPE_LABELS } from "$build/generate/circular";
import type { GenerationPreset } from "../../../../state/preset.svelte";

export interface IPresetFormatterService {
  getConfigSummary(preset: GenerationPreset): string;
  getLevelBackgroundColor(level: number): string;
  getLevelBorderColor(level: number): string;
  getPresetIcon(preset: GenerationPreset): string;
  getLevelLabel(level: number): string;
}

@injectable()
export class PresetFormatterService implements IPresetFormatterService {
  getConfigSummary(preset: GenerationPreset): string {
    const { config } = preset;

    // Capitalize first letter of gridMode and mode to match CAP type labels
    const gridMode =
      config.gridMode.charAt(0).toUpperCase() + config.gridMode.slice(1);
    const mode = config.mode.charAt(0).toUpperCase() + config.mode.slice(1);

    const parts = [
      `${config.length} beats`,
      gridMode,
      mode,
      CAP_TYPE_LABELS[config.capType] || config.capType,
    ];

    if (config.turnIntensity > 0) {
      parts.push(
        `${config.turnIntensity}x turn${config.turnIntensity !== 1 ? "s" : ""}`
      );
    }

    return parts.join(" • ");
  }

  getLevelBackgroundColor(level: number): string {
    switch (level) {
      case 1:
        // Beginner: Light blue
        return "rgba(186, 230, 253, 0.15)";
      case 2:
        // Intermediate: Silver gray
        return "rgba(148, 163, 184, 0.15)";
      case 3:
        // Advanced: Gold
        return "rgba(250, 204, 21, 0.15)";
      default:
        return "rgba(255, 255, 255, 0.05)";
    }
  }

  getLevelBorderColor(level: number): string {
    switch (level) {
      case 1:
        // Beginner: Light blue
        return "rgba(56, 189, 248, 0.3)";
      case 2:
        // Intermediate: Silver gray
        return "rgba(100, 116, 139, 0.3)";
      case 3:
        // Advanced: Gold
        return "rgba(234, 179, 8, 0.3)";
      default:
        return "rgba(255, 255, 255, 0.1)";
    }
  }

  getPresetIcon(preset: GenerationPreset): string {
    return preset.icon || "⚙️";
  }

  getLevelLabel(level: number): string {
    switch (level) {
      case 1:
        return "Beginner";
      case 2:
        return "Intermediate";
      case 3:
        return "Advanced";
      default:
        return `Level ${level}`;
    }
  }
}
