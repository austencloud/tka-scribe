/**
 * TKA Image Export Service
 *
 * Alias for ImageExportService to maintain compatibility.
 */

import type { SequenceData } from "$shared";
import { injectable } from "inversify";
import type { SequenceExportOptions } from "../../domain/models";
import { ImageExportService } from "./ImageExportService";

@injectable()
export class TKAImageExportService extends ImageExportService {
  async batchExport(sequences: SequenceData[], options: SequenceExportOptions): Promise<HTMLCanvasElement[]> {
    const results: HTMLCanvasElement[] = [];

    for (const sequence of sequences) {
      try {
        const blob = await this.exportSequenceImage(sequence, options);
        // Convert blob back to canvas for compatibility
        const canvas = await this.blobToCanvas(blob);
        results.push(canvas);
      } catch (error) {
        console.error(`Failed to export sequence ${sequence.id}:`, error);
        // Create error canvas
        const errorCanvas = document.createElement('canvas');
        errorCanvas.width = 400;
        errorCanvas.height = 300;
        const ctx = errorCanvas.getContext('2d')!;
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 400, 300);
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Export Error', 200, 150);
        results.push(errorCanvas);
      }
    }

    return results;
  }

  private async blobToCanvas(blob: Blob): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }
}
