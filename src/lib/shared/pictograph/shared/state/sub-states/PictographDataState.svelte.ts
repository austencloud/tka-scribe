/**
 * Pictograph Data State
 *
 * Manages data transformation and component requirements.
 * Independent sub-state with no dependencies on arrow/prop states.
 */

import type { IComponentManagementService } from "../../../../application/services/contracts/IComponentManagementService";
import type { IDataTransformationService } from "../../../../application/services/contracts/IDataTransformationService";
import { MotionColor } from "../../domain/enums/pictograph-enums";
import type { MotionData } from "../../domain/models/MotionData";
import type { PictographData } from "../../domain/models/PictographData";

export interface PictographDataState {
  readonly effectivePictographData: PictographData | null;
  readonly hasValidData: boolean;
  readonly displayLetter: string | null;
  readonly motionsToRender: Array<{
    color: MotionColor;
    motionData: MotionData;
  }>;
  readonly requiredComponents: string[];
  readonly pictographData: PictographData | null;
  updatePictographData(newData: PictographData | null): void;
}

export function createPictographDataState(
  initialPictographData: PictographData | null,
  dataTransformationService: IDataTransformationService,
  componentManagementService: IComponentManagementService
): PictographDataState {
  // Input data state
  let pictographData = $state<PictographData | null>(initialPictographData);

  // Derived data transformation state
  const dataState = $derived.by(() => {
    return dataTransformationService.transformPictographData(pictographData);
  });

  // Derived component requirements
  const requiredComponents = $derived.by(() => {
    return componentManagementService.getRequiredComponents(pictographData);
  });

  function updatePictographData(newData: PictographData | null): void {
    pictographData = newData;
  }

  return {
    get effectivePictographData() {
      return dataState.effectivePictographData;
    },
    get hasValidData() {
      return dataState.hasValidData;
    },
    get displayLetter() {
      return "displayLetter" in dataState ? dataState.displayLetter : null;
    },
    get motionsToRender() {
      return "motionsToRender" in dataState ? dataState.motionsToRender : [];
    },
    get requiredComponents() {
      return requiredComponents;
    },
    get pictographData() {
      return pictographData;
    },
    updatePictographData,
  };
}
