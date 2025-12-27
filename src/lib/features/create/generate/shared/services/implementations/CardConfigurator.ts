import { CAPType } from "../../../circular/domain/models/circular-models";
import type { UIGenerationConfig } from "../../../state/generate-config.svelte";
import { DifficultyLevel } from "../../domain/models/generate-models";
import type {
  CardDescriptor,
  CardHandlers,
  ICardConfigurationService,
} from "../contracts/ICardConfigurationService";

/**
 * Implementation of ICardConfigurationService
 * Builds card descriptor arrays with conditional rendering and responsive grid layouts
 */
export class CardConfigurationService implements ICardConfigurationService {
  /**
   * Build card descriptors array for rendering
   * Extracted from CardBasedSettingsContainer to separate business logic from presentation
   */
  buildCardDescriptors(
    config: UIGenerationConfig,
    currentLevel: DifficultyLevel,
    isFreeformMode: boolean,
    handlers: CardHandlers,
    headerFontSize: string,
    allowedIntensityValues: number[],
    isGenerating: boolean = false
  ): CardDescriptor[] {
    const cardList: CardDescriptor[] = [];
    let cardIndex = 0;

    // Determine layout based on level
    const isBeginnerLevel = currentLevel === DifficultyLevel.BEGINNER;
    const shouldShowTurnIntensity = currentLevel !== DifficultyLevel.BEGINNER;

    // Row 1: Always visible cards (Level, Length, Generation Mode)
    // These cards are STABLE and never resize
    cardList.push({
      id: "level",
      props: {
        currentLevel,
        onLevelChange: handlers.handleLevelChange,
        cardIndex: cardIndex++,
        headerFontSize,
      },
      gridColumnSpan: 2, // Always 2 cols - stable
    });

    cardList.push({
      id: "length",
      props: {
        currentLength: config.length,
        onLengthChange: handlers.handleLengthChange,
        color: "#3b82f6",
        cardIndex: cardIndex++,
        headerFontSize,
      },
      gridColumnSpan: 2, // Always 2 cols - stable
    });

    cardList.push({
      id: "generation-mode",
      props: {
        currentMode: config.mode,
        onModeChange: handlers.handleGenerationModeChange,
        color: "#8b5cf6",
        cardIndex: cardIndex++,
        headerFontSize,
      },
      gridColumnSpan: 2, // Always 2 cols - LOCKED TOP-RIGHT
    });

    // Row 2: Grid Mode and Prop Continuity
    // Expand to 3 cols each in Beginner mode (any type - Freeform or Circular)
    cardList.push({
      id: "grid-mode",
      props: {
        currentMode: config.gridMode,
        onModeChange: handlers.handleGridModeChange,
        color: "#10b981",
        cardIndex: cardIndex++,
        headerFontSize,
      },
      gridColumnSpan: isBeginnerLevel ? 3 : 2, // Expands in any Beginner mode
    });

    cardList.push({
      id: "prop-continuity",
      props: {
        currentContinuity: config.propContinuity,
        onContinuityChange: handlers.handlePropContinuityChange,
        color: "#06b6d4",
        cardIndex: cardIndex++,
        headerFontSize,
      },
      gridColumnSpan: isBeginnerLevel ? 3 : 2, // Expands in any Beginner mode
    });

    // Conditional: Turn Intensity (only when level !== BEGINNER)
    // Fills the last spot in Row 2 alongside Grid and PropCont
    if (shouldShowTurnIntensity) {
      cardList.push({
        id: "turn-intensity",
        props: {
          currentIntensity: config.turnIntensity,
          allowedValues: allowedIntensityValues,
          onIntensityChange: handlers.handleTurnIntensityChange,
          cardIndex: cardIndex++,
          headerFontSize,
        },
        gridColumnSpan: 2, // Always 2 columns (1/3 of row)
      });
    }

    // Row 3: Circular mode only cards (Slice Size + CAP Type)
    // Determine if slice size selection is needed
    // CAP types that include ROTATION support slice size choice (halved or quartered)
    // CAP types without rotation only support halved mode
    const capTypeAllowsSliceChoice =
      config.capType === CAPType.STRICT_ROTATED ||
      config.capType === CAPType.ROTATED_INVERTED ||
      config.capType === CAPType.ROTATED_SWAPPED ||
      config.capType === CAPType.MIRRORED_ROTATED ||
      config.capType === CAPType.MIRRORED_INVERTED_ROTATED ||
      config.capType === CAPType.MIRRORED_ROTATED_INVERTED_SWAPPED;

    // Conditional: Slice Size (only in Circular mode AND when CAP type allows choice)
    if (!isFreeformMode && capTypeAllowsSliceChoice) {
      cardList.push({
        id: "slice-size",
        props: {
          currentSliceSize: config.sliceSize,
          onSliceSizeChange: handlers.handleSliceSizeChange,
          color: "#ec4899",
          cardIndex: cardIndex++,
          headerFontSize,
        },
        gridColumnSpan: 2,
      });
    }

    // Customize Options Card - for advanced constraints
    // In circular mode: Add to row 3 with CAP/SliceSize
    // In freeform mode: Add to final row with Generate button
    const hasCustomizeCard =
      handlers.handleCustomizeChange && handlers.customizeOptions;

    // Conditional: CAP Type (only in Circular mode)
    // Row 3 layout depends on whether slice size and customize are shown:
    // - SliceSize (2) + CAP (2) + Customize (2) = 6 cols
    // - CAP (4) + Customize (2) = 6 cols
    // - SliceSize (2) + CAP (4) = 6 cols (no customize)
    // - CAP (6) = full row (no customize, no slice size)
    if (!isFreeformMode) {
      // Determine CAP column span based on what else is in row 3
      let capColumnSpan: number;
      if (capTypeAllowsSliceChoice && hasCustomizeCard) {
        capColumnSpan = 2; // SliceSize(2) + CAP(2) + Customize(2)
      } else if (capTypeAllowsSliceChoice) {
        capColumnSpan = 4; // SliceSize(2) + CAP(4)
      } else if (hasCustomizeCard) {
        capColumnSpan = 4; // CAP(4) + Customize(2)
      } else {
        capColumnSpan = 6; // CAP(6) full row
      }

      cardList.push({
        id: "cap-type",
        props: {
          currentCAPType: config.capType,
          onCAPTypeChange: handlers.handleCAPTypeChange,
          shadowColor: "30deg 75% 55%", // Orange shadow
          cardIndex: cardIndex++,
          headerFontSize,
        },
        gridColumnSpan: capColumnSpan,
      });

      // Add Customize card in row 3 for circular mode
      if (hasCustomizeCard) {
        cardList.push({
          id: "customize",
          props: {
            currentOptions: handlers.customizeOptions,
            onOptionsChange: handlers.handleCustomizeChange,
            isFreeformMode: false, // Circular mode - hide end position selector
            cardIndex: cardIndex++,
            headerFontSize,
            positionsResetTrigger: handlers.positionsResetTrigger,
            gridMode: handlers.currentGridMode,
          },
          gridColumnSpan: 2, // Always 2 cols in circular mode row 3
        });
      }
    }

    // In freeform mode: Customize shares row with Generate button
    if (isFreeformMode && hasCustomizeCard) {
      cardList.push({
        id: "customize",
        props: {
          currentOptions: handlers.customizeOptions,
          onOptionsChange: handlers.handleCustomizeChange,
          isFreeformMode: true, // Freeform mode - show end position selector
          cardIndex: cardIndex++,
          headerFontSize,
          positionsResetTrigger: handlers.positionsResetTrigger,
          gridMode: handlers.currentGridMode,
        },
        gridColumnSpan: 2, // 2 cols - shares row with Generate button (4 cols)
      });
    }

    // Generate Button Card - always at the end
    // In freeform mode with Customize: 4 cols (shares row with Customize)
    // Otherwise: 6 cols (full width)
    if (handlers.handleGenerateClick) {
      const generateColumnSpan = isFreeformMode && hasCustomizeCard ? 4 : 6;
      cardList.push({
        id: "generate-button",
        props: {
          isGenerating,
          onGenerateClicked: handlers.handleGenerateClick,
          config, // Pass the config so the button can convert it to GenerationOptions
          customizeOptions: handlers.customizeOptions, // Pass customize options for generation
        },
        gridColumnSpan: generateColumnSpan,
      });
    }

    return cardList;
  }
}
