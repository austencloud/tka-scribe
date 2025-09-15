/**
 * Sequence Export Service
 *
 * High-level service for exporting sequences with various options.
 */

import type { ExportResult, SequenceData } from "$shared";
import { TYPES } from "$shared";
import { inject, injectable } from "inversify";
import type { ISequenceExportService } from "../../../workbench";
import type { SequenceExportOptions } from "../../domain/models";
import type { IImageExportService } from "../contracts";
import type { IExportOptionsValidator } from "./ExportOptionsValidator";
import type { IFilenameGeneratorService } from "./FilenameGeneratorService";



@injectable()
export class SequenceExportService implements ISequenceExportService {
  constructor(
    @inject(TYPES.ITKAImageExportService) private imageExportService: IImageExportService,
    @inject(TYPES.IFilenameGeneratorService) private filenameGenerator: IFilenameGeneratorService,
    @inject(TYPES.IExportOptionsValidator) private optionsValidator: IExportOptionsValidator
  ) {}

  async exportSequence(sequence: SequenceData, options: SequenceExportOptions): Promise<ExportResult> {
    try {
      // Validate options
      const validation = this.validateExportOptions(options);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Invalid export options: ${validation.errors.join(', ')}`,
          warnings: validation.warnings
        };
      }

      // Generate canvas
      const canvas = await this.imageExportService.exportSequence(sequence, options);

      // Convert to blob
      const blob = await this.canvasToBlob(canvas, options);

      // Generate filename
      const filename = this.filenameGenerator.generateFilename(sequence, options);

      return {
        success: true,
        canvas,
        blob,
        filename,
        warnings: validation.warnings
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown export error'
      };
    }
  }

  async exportSequenceAsBlob(sequence: SequenceData, options: SequenceExportOptions): Promise<Blob> {
    const canvas = await this.imageExportService.exportSequence(sequence, options);
    return this.canvasToBlob(canvas, options);
  }

  async exportSequenceAsDataUrl(sequence: SequenceData, options: SequenceExportOptions): Promise<string> {
    const canvas = await this.imageExportService.exportSequence(sequence, options);
    return canvas.toDataURL(`image/${options.format.toLowerCase()}`, options.quality);
  }

  validateExportOptions(options: SequenceExportOptions): { isValid: boolean; errors: string[]; warnings: string[] } {
    return this.optionsValidator.validateOptions(options);
  }

  private async canvasToBlob(canvas: HTMLCanvasElement, options: SequenceExportOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        `image/${options.format.toLowerCase()}`,
        options.quality
      );
    });
  }
}
