/**
 * Sequence Domain Service - Pure Business Logic
 * 
 * This service contains all the domain logic for sequences without any
 * external dependencies. It implements the business rules and validations
 * that were established in the desktop application.
 */

import type { SequenceData, BeatData } from '@tka/schemas';
import type {
	ISequenceDomainService,
	SequenceCreateRequest,
	ValidationResult,
} from '../interfaces';

export class SequenceDomainService implements ISequenceDomainService {
	
	/**
	 * Validate a sequence creation request
	 */
	validateCreateRequest(request: SequenceCreateRequest): ValidationResult {
		const errors: string[] = [];

		// Validate name
		if (!request.name || request.name.trim().length === 0) {
			errors.push('Sequence name is required');
		}

		if (request.name && request.name.length > 100) {
			errors.push('Sequence name must be less than 100 characters');
		}

		// Validate length
		if (!request.length || request.length < 1 || request.length > 64) {
			errors.push('Sequence length must be between 1 and 64');
		}

		// Validate grid mode
		if (request.gridMode && !['diamond', 'box'].includes(request.gridMode)) {
			errors.push('Grid mode must be either "diamond" or "box"');
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}

	/**
	 * Create a new sequence from a request
	 */
	createSequence(request: SequenceCreateRequest): SequenceData {
		// Validate first
		const validation = this.validateCreateRequest(request);
		if (!validation.isValid) {
			throw new Error(`Invalid sequence request: ${validation.errors.join(', ')}`);
		}

		// Create beats array
		const beats: BeatData[] = [];
		for (let i = 1; i <= request.length; i++) {
			beats.push(this.createEmptyBeat(i));
		}

		// Create sequence
		const sequence: SequenceData = {
			id: this.generateId(),
			name: request.name.trim(),
			beats,
			version: '2.0',
			length: request.length,
			tags: [],
		};

		return sequence;
	}

	/**
	 * Update a beat in a sequence
	 */
	updateBeat(sequence: SequenceData, beatIndex: number, beatData: BeatData): SequenceData {
		if (beatIndex < 0 || beatIndex >= sequence.beats.length) {
			throw new Error(`Beat index ${beatIndex} is out of range`);
		}

		const newBeats = [...sequence.beats];
		newBeats[beatIndex] = { ...beatData };

		return {
			...sequence,
			beats: newBeats,
			updatedAt: new Date().toISOString(),
		};
	}

	/**
	 * Calculate the word representation of a sequence
	 * TODO: Port the word calculation logic from desktop
	 */
	calculateSequenceWord(sequence: SequenceData): string {
		// Placeholder implementation - this will be ported from desktop
		const letters = sequence.beats
			.map((beat) => beat.letter || '?')
			.join('');

		return letters || 'UNKNOWN';
	}

	/**
	 * Create an empty beat with the given beat number
	 */
	private createEmptyBeat(beatNumber: number): BeatData {
		return {
			beatNumber,
			letter: null,
			duration: 1.0,
			blueMotion: null,
			redMotion: null,
			blueReversal: false,
			redReversal: false,
			filled: false,
			tags: [],
			metadata: null,
		};
	}

	/**
	 * Generate a unique ID for sequences
	 */
	private generateId(): string {
		return `seq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}
