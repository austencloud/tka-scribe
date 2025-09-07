/**
 * Spotlight State
 * 
 * Reactive state management for spotlight module using Svelte 5 runes.
 */

import type { SequenceData } from "$shared";
import type { IGalleryThumbnailService } from "../../gallery/services/contracts";
import type { 
  SpotlightDisplayState,
  SpotlightImageState,
  SpotlightNavigationState,
  SpotlightViewState
} from "../domain/models";
import { 
  createDefaultDisplayState,
  createDefaultImageState,
  createDefaultNavigationState
} from "../domain/models";
import { SPOTLIGHT_CONSTANTS } from "../domain/constants";

export class SpotlightState {
  // Private reactive state
  #displayState = $state<SpotlightDisplayState>(createDefaultDisplayState());
  #imageState = $state<SpotlightImageState>(createDefaultImageState());
  #navigationState = $state<SpotlightNavigationState>(createDefaultNavigationState());
  #currentSequence = $state<SequenceData | null>(null);
  #thumbnailService = $state<IGalleryThumbnailService | null>(null);

  // Public reactive getters
  get isVisible() { return this.#displayState.isVisible; }
  get isClosing() { return this.#displayState.isClosing; }
  get isContentVisible() { return this.#displayState.isContentVisible; }
  get currentVariationIndex() { return this.#displayState.currentVariationIndex; }
  
  get isImageLoading() { return this.#imageState.isLoading; }
  get imageError() { return this.#imageState.hasError; }
  
  get hasMultipleVariations() { return this.#navigationState.hasMultipleVariations; }
  get canGoPrev() { return this.#navigationState.canGoPrev; }
  get canGoNext() { return this.#navigationState.canGoNext; }
  get totalVariations() { return this.#navigationState.totalVariations; }
  
  get currentSequence() { return this.#currentSequence; }

  // Derived state
  get currentVariation() {
    if (!this.#currentSequence?.thumbnails || this.#currentSequence.thumbnails.length === 0) {
      return null;
    }
    return this.#currentSequence.thumbnails[this.#displayState.currentVariationIndex] || 
           this.#currentSequence.thumbnails[0];
  }

  get currentImageUrl() {
    if (!this.currentVariation || !this.#thumbnailService || !this.#currentSequence) {
      return "";
    }
    return this.getThumbnailUrl(this.currentVariation);
  }

  get variationInfo() {
    if (!this.#currentSequence) return null;
    
    return {
      current: this.#displayState.currentVariationIndex + 1,
      total: this.#navigationState.totalVariations,
      canGoPrev: this.#navigationState.canGoPrev,
      canGoNext: this.#navigationState.canGoNext
    };
  }

  // State management methods
  initializeSpotlight(
    sequence: SequenceData, 
    thumbnailService: IGalleryThumbnailService,
    show: boolean
  ): void {
    this.#currentSequence = sequence;
    this.#thumbnailService = thumbnailService;
    
    // Reset display state
    this.#displayState.currentVariationIndex = 0;
    this.#displayState.isContentVisible = false;
    
    // Reset image state
    this.#imageState.isLoading = true;
    this.#imageState.hasError = false;
    this.#imageState.loadStartTime = performance.now();
    
    // Calculate navigation state
    this.updateNavigationState();
    
    if (show) {
      this.show();
    }
  }

  show(): void {
    this.#displayState.isVisible = true;
    this.#displayState.isClosing = false;
    this.#displayState.isContentVisible = false;
  }

  close(): void {
    this.#displayState.isClosing = true;
  }

  hide(): void {
    this.#displayState.isVisible = false;
    this.#displayState.isClosing = false;
    this.#currentSequence = null;
    this.#thumbnailService = null;
  }

  goToPreviousVariation(): void {
    if (this.#navigationState.canGoPrev) {
      this.#displayState.currentVariationIndex--;
      this.resetImageState();
      this.updateNavigationState();
    }
  }

  goToNextVariation(): void {
    if (this.#navigationState.canGoNext) {
      this.#displayState.currentVariationIndex++;
      this.resetImageState();
      this.updateNavigationState();
    }
  }

  goToVariation(index: number): void {
    if (index >= 0 && index < this.#navigationState.totalVariations) {
      this.#displayState.currentVariationIndex = index;
      this.resetImageState();
      this.updateNavigationState();
    }
  }

  onImageLoaded(): void {
    const loadEndTime = performance.now();
    const loadDuration = loadEndTime - this.#imageState.loadStartTime;
    
    console.log(
      `🖼️ [TIMING] Image loaded at ${loadEndTime.toFixed(2)}ms, triggering content fade-in (duration: ${loadDuration.toFixed(2)}ms)`
    );
    
    this.#imageState.isLoading = false;
    this.#imageState.hasError = false;
    this.#displayState.isContentVisible = true;
  }

  onImageError(): void {
    this.#imageState.isLoading = false;
    this.#imageState.hasError = true;
  }

  // Private helper methods
  private resetImageState(): void {
    this.#displayState.isContentVisible = false;
    this.#imageState.isLoading = true;
    this.#imageState.hasError = false;
    this.#imageState.loadStartTime = performance.now();
  }

  private updateNavigationState(): void {
    const totalVariations = this.#currentSequence?.thumbnails?.length || 0;
    const currentIndex = this.#displayState.currentVariationIndex;
    
    this.#navigationState = {
      hasMultipleVariations: totalVariations > 1,
      totalVariations,
      canGoPrev: currentIndex > 0,
      canGoNext: currentIndex < totalVariations - 1
    };
  }

  private getThumbnailUrl(thumbnailPath: string): string {
    if (!this.#thumbnailService || !this.#currentSequence) return "";

    try {
      if (thumbnailPath.startsWith("http://") || thumbnailPath.startsWith("https://")) {
        return thumbnailPath;
      }
      return this.#thumbnailService.getThumbnailUrl(this.#currentSequence.id, thumbnailPath);
    } catch (error) {
      console.error("Error getting thumbnail URL:", error);
      return "";
    }
  }

  // State export for service integration
  getCurrentState(): SpotlightViewState {
    return {
      display: { ...this.#displayState },
      image: { ...this.#imageState },
      navigation: { ...this.#navigationState }
    };
  }
}
