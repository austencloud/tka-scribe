/**
 * Sequence Export Service
 *
 * Handles sequence export operations like JSON export and dictionary addition.
 * Pure business logic for exporting sequence data in various formats.
 */

import type { SequenceData } from "$shared";
import { injectable } from "inversify";
import type { ISequenceExportService } from "../contracts";

@injectable()
export class SequenceExportService implements ISequenceExportService {
  /**
   * Export sequence as JSON string
   */
  exportAsJson(sequence: SequenceData): string {
    try {
      // Create a clean copy for export
      const exportData = this.prepareForExport(sequence);
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("Failed to export sequence as JSON:", error);
      throw new Error(
        `Failed to export sequence: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Copy sequence JSON to clipboard
   */
  async copyJsonToClipboard(sequence: SequenceData): Promise<void> {
    try {
      const jsonString = this.exportAsJson(sequence);
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(jsonString);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = jsonString;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      
      console.log("Sequence JSON copied to clipboard");
    } catch (error) {
      console.error("Failed to copy JSON to clipboard:", error);
      throw new Error(
        `Failed to copy to clipboard: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Add sequence to dictionary/library
   */
  async addToDictionary(sequence: SequenceData): Promise<void> {
    try {
      // TODO: Implement dictionary addition logic
      // This would typically involve:
      // 1. Validating the sequence
      // 2. Adding to a dictionary/library service
      // 3. Persisting the dictionary entry
      console.log("Adding sequence to dictionary:", sequence.name);
      console.warn("addToDictionary not yet implemented");
    } catch (error) {
      console.error("Failed to add sequence to dictionary:", error);
      throw new Error(
        `Failed to add to dictionary: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Export sequence for fullscreen display
   */
  async exportToFullscreen(sequence: SequenceData): Promise<void> {
    try {
      // TODO: Implement fullscreen export logic
      // This would typically involve:
      // 1. Opening a fullscreen view
      // 2. Rendering the sequence in fullscreen mode
      // 3. Handling fullscreen controls
      console.log("Exporting sequence to fullscreen:", sequence.name);
      console.warn("exportToFullscreen not yet implemented");
    } catch (error) {
      console.error("Failed to export to fullscreen:", error);
      throw new Error(
        `Failed to export to fullscreen: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Prepare sequence data for export with validation
   */
  prepareForExport(sequence: SequenceData): SequenceData {
    // Create a clean copy without any internal state or temporary data
    const cleanSequence: SequenceData = {
      id: sequence.id,
      name: sequence.name,
      word: sequence.word || "",
      beats: sequence.beats.map(beat => ({
        id: beat.id,
        beatNumber: beat.beatNumber,
        duration: beat.duration,
        blueReversal: beat.blueReversal,
        redReversal: beat.redReversal,
        isBlank: beat.isBlank,
        pictographData: beat.pictographData,
      })),
      thumbnails: sequence.thumbnails || [],
      isFavorite: sequence.isFavorite || false,
      isCircular: sequence.isCircular || false,
      tags: sequence.tags || [],
      metadata: sequence.metadata || {},
      startingPositionBeat: sequence.startingPositionBeat,
      startPosition: sequence.startPosition,
    };

    return cleanSequence;
  }
}
