/**
 * Metadata Tester State Management
 * 
 * Manages the state for the metadata testing interface including:
 * - Available thumbnail files
 * - Selected sequence/thumbnail
 * - Extracted metadata
 * - Loading states
 * - Error handling
 */

import { PngMetadataExtractor } from '$lib/utils/png-metadata-extractor';

export interface ThumbnailFile {
	name: string;
	path: string;
	word: string;
}

export interface MetadataTesterState {
	// Thumbnail management
	thumbnails: ThumbnailFile[];
	selectedThumbnail: ThumbnailFile | null;
	
	// Metadata extraction
	extractedMetadata: any | null;
	rawMetadata: string | null;
	
	// UI state
	isLoadingThumbnails: boolean;
	isExtractingMetadata: boolean;
	
	// Error handling
	error: string | null;
	
	// Analysis data
	metadataStats: {
		totalBeats: number;
		hasAuthor: boolean;
		hasLevel: boolean;
		hasStartPosition: boolean;
		authorName: string | null;
		level: number | null;
		sequenceLength: number;
	} | null;
}

export function createMetadataTesterState() {
	let state = $state<MetadataTesterState>({
		thumbnails: [],
		selectedThumbnail: null,
		extractedMetadata: null,
		rawMetadata: null,
		isLoadingThumbnails: false,
		isExtractingMetadata: false,
		error: null,
		metadataStats: null
	});

	// Load available thumbnails on initialization
	async function loadThumbnails() {
		state.isLoadingThumbnails = true;
		state.error = null;

		try {
			// Use the API to get available sequences
			const response = await fetch('/api/sequences');
			const data = await response.json();

			if (data.success && Array.isArray(data.sequences)) {
				state.thumbnails = data.sequences;
				console.log(`Loaded ${data.sequences.length} sequence thumbnails from API`);
			} else {
				throw new Error(data.error || 'Invalid API response');
			}
		} catch (error) {
			// Fallback to manual discovery if API fails
			console.warn('API failed, falling back to manual discovery:', error);
			
			try {
				const thumbnails: ThumbnailFile[] = [];

				// Get a comprehensive list of known sequences from the dictionary directory
				const commonSequences = [
					'ABC', 'A', 'CAKE', 'ALPHA', 'EPSILON', 'ETA', 'MU',
					'B', 'C', 'DJ', 'DJII', 'DKIIEJII', 'EJ', 'EK', 'FJ', 'FL', 'FLII',
					'G', 'H', 'I', 'JD', 'JGG', 'KE', 'LF', 'MOON', 'MP', 'NQ', 'OR', 'OT',
					'PQV', 'QT', 'RT', 'S', 'T', 'U', 'V', 'POSSUM', 'OPOSSUM'
				];

				// Check which sequences actually have PNG files
				for (const sequenceName of commonSequences) {
					const filePath = `/dictionary/${sequenceName}/${sequenceName}_ver1.png`;
					
					try {
						const response = await fetch(filePath, { method: 'HEAD' });
						if (response.ok) {
							thumbnails.push({
								name: `${sequenceName}_ver1.png`,
								path: filePath,
								word: sequenceName
							});
						}
					} catch {
						// File doesn't exist, skip
						console.debug(`File not found: ${filePath}`);
					}
				}

				// Also check the static thumbnails directory
				const thumbnailFiles = [
					{ name: 'ABC_ABC_ver1.png', path: '/thumbnails/ABC_ABC_ver1.png', word: 'ABC_ABC' },
					{ name: 'A_A_ver1.png', path: '/thumbnails/A_A_ver1.png', word: 'A_A' },
					{ name: 'CAKE_CAKE_ver1.png', path: '/thumbnails/CAKE_CAKE_ver1.png', word: 'CAKE_CAKE' }
				];

				for (const file of thumbnailFiles) {
					try {
						const response = await fetch(file.path, { method: 'HEAD' });
						if (response.ok) {
							thumbnails.push(file);
						}
					} catch {
						// File doesn't exist, skip
					}
				}

				// Sort thumbnails by word name for better organization
				thumbnails.sort((a, b) => a.word.localeCompare(b.word));

				state.thumbnails = thumbnails;
				console.log(`Loaded ${thumbnails.length} sequence thumbnails via fallback`);
			} catch (fallbackError) {
				state.error = `Failed to load thumbnails: ${fallbackError}`;
				console.error('Error loading thumbnails (fallback also failed):', fallbackError);
			}
		} finally {
			state.isLoadingThumbnails = false;
		}
	}

	// Extract metadata from selected thumbnail
	async function extractMetadata(thumbnail: ThumbnailFile) {
		state.isExtractingMetadata = true;
		state.error = null;
		state.selectedThumbnail = thumbnail;

		try {
			const metadata = await PngMetadataExtractor.extractMetadata(thumbnail.path);
			state.extractedMetadata = metadata;
			state.rawMetadata = JSON.stringify(metadata, null, 2);
			
			// Analyze the metadata
			analyzeMetadata(metadata);
		} catch (error) {
			state.error = `Failed to extract metadata: ${error}`;
			state.extractedMetadata = null;
			state.rawMetadata = null;
			state.metadataStats = null;
			console.error('Error extracting metadata:', error);
		} finally {
			state.isExtractingMetadata = false;
		}
	}

	// Analyze extracted metadata for useful information
	function analyzeMetadata(metadata: any) {
		if (!metadata || !Array.isArray(metadata)) {
			state.metadataStats = null;
			return;
		}

		// Filter out start position entries and count actual beats
		const realBeats = metadata.filter((step: any) => 
			step.letter && !step.sequence_start_position
		);

		// Extract author information
		const firstStep = metadata[0] || {};
		const hasAuthor = !!firstStep.author;
		const authorName = firstStep.author || null;

		// Extract level information
		const hasLevel = !!firstStep.level;
		const level = firstStep.level || null;

		// Check for start position
		const hasStartPosition = metadata.some((step: any) => step.sequence_start_position);

		state.metadataStats = {
			totalBeats: realBeats.length,
			hasAuthor,
			hasLevel,
			hasStartPosition,
			authorName,
			level,
			sequenceLength: metadata.length
		};
	}

	// Clear current selection and metadata
	function clearSelection() {
		state.selectedThumbnail = null;
		state.extractedMetadata = null;
		state.rawMetadata = null;
		state.metadataStats = null;
		state.error = null;
	}

	// Initialize by loading thumbnails
	loadThumbnails();

	return {
		get state() { return state; },
		loadThumbnails,
		extractMetadata,
		clearSelection,
		analyzeMetadata
	};
}
