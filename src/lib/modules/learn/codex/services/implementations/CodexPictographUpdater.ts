import type { PictographData } from "$shared";
import type { CodexTransformationOperation } from "$shared";

import type { ICodexPictographUpdater } from "../contracts/ICodexPictographUpdater";

export class CodexPictographUpdater implements ICodexPictographUpdater {
  rotateAllPictographs(pictographs: PictographData[]): PictographData[] {
    console.log("🔄 Applying rotation to", pictographs.length, "pictographs");

    return [...pictographs];
  }

  mirrorAllPictographs(pictographs: PictographData[]): PictographData[] {
    console.log("🪞 Applying mirror to", pictographs.length, "pictographs");

    return [...pictographs];
  }

  colorSwapAllPictographs(pictographs: PictographData[]): PictographData[] {
    console.log(
      "⚫⚪ Applying color swap to",
      pictographs.length,
      "pictographs"
    );

    return [...pictographs];
  }

  async applyOperation(
    pictographs: PictographData[],
    operation: CodexTransformationOperation
  ): Promise<PictographData[]> {
    switch (operation) {
      case "rotate":
        return this.rotateAllPictographs(pictographs);
      case "mirror":
        return this.mirrorAllPictographs(pictographs);
      case "colorSwap":
        return this.colorSwapAllPictographs(pictographs);
      default:
        console.warn(`Unknown operation: ${operation}`);
        return [...pictographs];
    }
  }
}
