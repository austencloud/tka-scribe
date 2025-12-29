/**
 * Gallery Generator State
 *
 * Centralized state management for the gallery generator feature.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { RenderedImage, FailedSequence } from "../domain/gallery-models";

class GalleryGeneratorState {
  // Core data
  sequences = $state<SequenceData[]>([]);
  renderedImages = $state<RenderedImage[]>([]);
  failedSequences = $state<FailedSequence[]>([]);

  // UI state
  isLoading = $state(true);
  isRendering = $state(false);
  isCancelled = $state(false);
  error = $state<string | null>(null);
  lightMode = $state(false);
  viewingImage = $state<{ name: string; url: string } | null>(null);

  // Blob storage (in-memory only, lost on refresh)
  pendingBlobs = new Map<string, Blob>();

  // Derived state
  get renderedNames(): Set<string> {
    return new Set(this.renderedImages.map((r) => r.name));
  }

  get pendingSequences(): SequenceData[] {
    return this.sequences.filter(
      (s) => !this.renderedNames.has(s.word || s.name)
    );
  }

  get previewCount(): number {
    return this.renderedImages.filter((r) => !r.written).length;
  }

  get hasResults(): boolean {
    return this.renderedImages.length > 0 || this.failedSequences.length > 0;
  }

  // Actions
  setSequences(sequences: SequenceData[]) {
    this.sequences = sequences;
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setRendering(rendering: boolean) {
    this.isRendering = rendering;
  }

  setCancelled(cancelled: boolean) {
    this.isCancelled = cancelled;
  }

  setError(error: string | null) {
    this.error = error;
  }

  setLightMode(light: boolean) {
    this.lightMode = light;
  }

  setViewingImage(image: { name: string; url: string } | null) {
    this.viewingImage = image;
  }

  addRenderedImage(image: RenderedImage, blob: Blob) {
    this.pendingBlobs.set(image.name, blob);
    this.renderedImages = [...this.renderedImages, image];
  }

  markAsWritten(name: string) {
    const idx = this.renderedImages.findIndex((r) => r.name === name);
    const existing = this.renderedImages[idx];
    if (idx >= 0 && existing) {
      this.renderedImages[idx] = {
        name: existing.name,
        imageUrl: existing.imageUrl,
        written: true,
      };
      this.renderedImages = [...this.renderedImages];
    }
  }

  addFailedSequence(failed: FailedSequence) {
    this.failedSequences = [...this.failedSequences, failed];
  }

  getBlob(name: string): Blob | undefined {
    return this.pendingBlobs.get(name);
  }

  clearResults() {
    // Revoke blob URLs to free memory
    for (const img of this.renderedImages) {
      if (img.imageUrl) {
        URL.revokeObjectURL(img.imageUrl);
      }
    }
    this.pendingBlobs.clear();
    this.renderedImages = [];
    this.failedSequences = [];
    this.error = null;
  }

  reset() {
    this.clearResults();
    this.sequences = [];
    this.isLoading = true;
    this.isRendering = false;
    this.isCancelled = false;
  }
}

// Singleton instance
export const galleryGeneratorState = new GalleryGeneratorState();
