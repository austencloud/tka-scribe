/**
 * File service for handling sequence data import/export operations
 */

import type { SequenceData } from '../../types/core.js';
import { extractSequenceFromPNG } from '../../utils/file/png-parser.js';
import {
	validateFileType,
	validateSequenceData
} from '../../utils/validation/sequence-validator.js';

export interface FileImportResult {
	success: boolean;
	data?: SequenceData;
	error?: string;
}

export interface FileExportResult {
	success: boolean;
	error?: string;
}

/**
 * Service class for handling file operations
 */
export class FileService {
	/**
	 * Import sequence data from a PNG file
	 */
	async importFromPNG(file: File): Promise<FileImportResult> {
		// Validate file type
		const fileValidation = validateFileType(file);
		if (!fileValidation.isValid) {
			return {
				success: false,
				error: fileValidation.error
			};
		}

		try {
			// Extract sequence data from PNG
			const extractResult = await extractSequenceFromPNG(file);

			if (!extractResult.success) {
				return {
					success: false,
					error: extractResult.error || 'Failed to extract sequence data from PNG'
				};
			}

			// Validate extracted data
			const dataValidation = validateSequenceData(extractResult.data);
			if (!dataValidation.isValid) {
				return {
					success: false,
					error: `Invalid sequence data: ${dataValidation.error}`
				};
			}

			return {
				success: true,
				data: extractResult.data
			};
		} catch (error) {
			return {
				success: false,
				error: `Error processing PNG file: ${error instanceof Error ? error.message : String(error)}`
			};
		}
	}

	/**
	 * Import sequence data from JSON string
	 */
	importFromJSON(jsonString: string): FileImportResult {
		if (!jsonString.trim()) {
			return {
				success: false,
				error: 'Please enter sequence data'
			};
		}

		try {
			const parsed = JSON.parse(jsonString);

			// Validate parsed data
			const validation = validateSequenceData(parsed);
			if (!validation.isValid) {
				return {
					success: false,
					error: validation.error
				};
			}

			return {
				success: true,
				data: parsed as SequenceData
			};
		} catch (error) {
			return {
				success: false,
				error: `Parse error: ${error instanceof Error ? error.message : String(error)}`
			};
		}
	}

	/**
	 * Export sequence data as JSON string
	 */
	exportToJSON(data: SequenceData, pretty = true): string {
		return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
	}

	/**
	 * Download sequence data as JSON file
	 */
	downloadAsJSON(data: SequenceData, filename = 'sequence.json'): FileExportResult {
		try {
			const jsonString = this.exportToJSON(data);
			const blob = new Blob([jsonString], { type: 'application/json' });
			const url = URL.createObjectURL(blob);

			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			URL.revokeObjectURL(url);

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: `Export failed: ${error instanceof Error ? error.message : String(error)}`
			};
		}
	}

	/**
	 * Create a detailed error message for missing PNG metadata
	 */
	createNoMetadataErrorMessage(fileName: string): string {
		return `No sequence metadata found in "${fileName}".

Expected: PNG files created by the Python pictograph tools with embedded sequence metadata.

The PNG file should contain a "metadata" text chunk with JSON data in this format:
{
  "sequence": [
    { "word": "...", "author": "...", ... },  // metadata
    { "beat": 1, "blue_attributes": {...}, "red_attributes": {...} },  // steps
    ...
  ]
}

To create compatible PNG files:
• Use the Python pictograph application to generate sequences
• Export sequences as PNG images (they automatically embed the metadata)
• Or manually add metadata to PNG files using the Python MetaDataExtractor class`;
	}

	/**
	 * Get supported file types for import
	 */
	getSupportedImportTypes(): string[] {
		return ['.png', '.json'];
	}

	/**
	 * Get supported file types for export
	 */
	getSupportedExportTypes(): string[] {
		return ['.json'];
	}

	/**
	 * Check if a file type is supported for import
	 */
	isImportTypeSupported(file: File): boolean {
		const extension = '.' + file.name.split('.').pop()?.toLowerCase();
		return this.getSupportedImportTypes().includes(extension);
	}
}
