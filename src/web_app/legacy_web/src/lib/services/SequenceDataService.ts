/**
 * Sequence Data Service for Legacy Web Application
 * 
 * Provides functionality for managing sequence data, beats, and pictographs.
 */

import type { PictographData } from '$lib/types/PictographData';

/**
 * Represents a beat in a sequence
 */
export interface SequenceBeat {
	id: string;
	number: number;
	pictographData: PictographData;
	metadata?: {
		letter?: string;
		startPos?: string;
		endPos?: string;
		timing?: string;
		direction?: string;
	};
}

/**
 * Represents a complete sequence
 */
export interface SequenceData {
	id: string;
	name: string;
	beats: SequenceBeat[];
	length: number;
	createdAt: Date;
	lastModified: Date;
	metadata?: {
		author?: string;
		level?: number;
		propType?: string;
		gridMode?: string;
		tags?: string[];
	};
}

/**
 * Service for managing sequence data operations
 */
class SequenceDataService {
	private sequences: Map<string, SequenceData> = new Map();
	private currentSequence: SequenceData | null = null;
	private idCounter = 0;

	/**
	 * Create a new empty sequence
	 */
	createNewSequence(name: string): SequenceData {
		const sequence: SequenceData = {
			id: `seq_${this.idCounter++}`,
			name,
			beats: [],
			length: 16,
			createdAt: new Date(),
			lastModified: new Date(),
			metadata: {
				author: 'user',
				level: 1,
				propType: 'staff',
				gridMode: 'diamond',
				tags: []
			}
		};

		this.sequences.set(sequence.id, sequence);
		return sequence;
	}

	/**
	 * Get all sequences
	 */
	getAllSequences(): SequenceData[] {
		return Array.from(this.sequences.values());
	}

	/**
	 * Get sequence by ID
	 */
	getSequenceById(id: string): SequenceData | null {
		return this.sequences.get(id) || null;
	}

	/**
	 * Save sequence
	 */
	saveSequence(sequence: SequenceData): boolean {
		try {
			sequence.lastModified = new Date();
			this.sequences.set(sequence.id, sequence);
			return true;
		} catch (error) {
			console.error('Error saving sequence:', error);
			return false;
		}
	}

	/**
	 * Delete sequence
	 */
	deleteSequence(id: string): boolean {
		return this.sequences.delete(id);
	}

	/**
	 * Get current sequence
	 */
	getCurrentSequence(): SequenceData | null {
		return this.currentSequence;
	}

	/**
	 * Set current sequence
	 */
	setCurrentSequence(sequence: SequenceData | null): void {
		this.currentSequence = sequence;
	}

	/**
	 * Add beat to sequence
	 */
	addBeatToSequence(sequenceId: string, pictographData: PictographData): SequenceBeat | null {
		const sequence = this.sequences.get(sequenceId);
		if (!sequence) return null;

		const beat: SequenceBeat = {
			id: `beat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			number: sequence.beats.length + 1,
			pictographData,
			metadata: {
				letter: pictographData.letter || undefined,
				startPos: pictographData.startPos?.toString() || undefined,
				endPos: pictographData.endPos?.toString() || undefined,
				timing: pictographData.timing || undefined,
				direction: pictographData.direction || undefined
			}
		};

		sequence.beats.push(beat);
		sequence.lastModified = new Date();
		
		return beat;
	}

	/**
	 * Remove beat from sequence
	 */
	removeBeatFromSequence(sequenceId: string, beatId: string): boolean {
		const sequence = this.sequences.get(sequenceId);
		if (!sequence) return false;

		const beatIndex = sequence.beats.findIndex(beat => beat.id === beatId);
		if (beatIndex === -1) return false;

		sequence.beats.splice(beatIndex, 1);
		
		// Renumber remaining beats
		sequence.beats.forEach((beat, index) => {
			beat.number = index + 1;
		});

		sequence.lastModified = new Date();
		return true;
	}

	/**
	 * Update beat in sequence
	 */
	updateBeatInSequence(sequenceId: string, beatId: string, pictographData: PictographData): boolean {
		const sequence = this.sequences.get(sequenceId);
		if (!sequence) return false;

		const beat = sequence.beats.find(b => b.id === beatId);
		if (!beat) return false;

		beat.pictographData = pictographData;
		beat.metadata = {
			letter: pictographData.letter || undefined,
			startPos: pictographData.startPos?.toString() || undefined,
			endPos: pictographData.endPos?.toString() || undefined,
			timing: pictographData.timing || undefined,
			direction: pictographData.direction || undefined
		};

		sequence.lastModified = new Date();
		return true;
	}

	/**
	 * Get beats from sequence
	 */
	getBeatsFromSequence(sequenceId: string): SequenceBeat[] {
		const sequence = this.sequences.get(sequenceId);
		return sequence ? sequence.beats : [];
	}

	/**
	 * Clear all sequences (for testing)
	 */
	clearAllSequences(): void {
		this.sequences.clear();
		this.currentSequence = null;
		this.idCounter = 0;
	}

	/**
	 * Load sequences from storage (placeholder for future implementation)
	 */
	async loadSequencesFromStorage(): Promise<SequenceData[]> {
		// In a real implementation, this would load from localStorage, IndexedDB, or server
		try {
			const stored = localStorage.getItem('tka_sequences');
			if (stored) {
				const sequences: SequenceData[] = JSON.parse(stored);
				sequences.forEach(seq => {
					// Convert date strings back to Date objects
					seq.createdAt = new Date(seq.createdAt);
					seq.lastModified = new Date(seq.lastModified);
					this.sequences.set(seq.id, seq);
				});
				return sequences;
			}
		} catch (error) {
			console.error('Error loading sequences from storage:', error);
		}
		return [];
	}

	/**
	 * Save sequences to storage (placeholder for future implementation)
	 */
	async saveSequencesToStorage(): Promise<boolean> {
		// In a real implementation, this would save to localStorage, IndexedDB, or server
		try {
			const sequences = Array.from(this.sequences.values());
			localStorage.setItem('tka_sequences', JSON.stringify(sequences));
			return true;
		} catch (error) {
			console.error('Error saving sequences to storage:', error);
			return false;
		}
	}

	/**
	 * Convert sequence to legacy format (for compatibility)
	 */
	convertToLegacyFormat(sequence: SequenceData): any[] {
		return sequence.beats.map(beat => ({
			letter: beat.metadata?.letter || beat.pictographData.letter,
			start_pos: beat.metadata?.startPos || beat.pictographData.startPos,
			end_pos: beat.metadata?.endPos || beat.pictographData.endPos,
			timing: beat.metadata?.timing || beat.pictographData.timing,
			direction: beat.metadata?.direction || beat.pictographData.direction,
			red_attributes: beat.pictographData.redMotionData,
			blue_attributes: beat.pictographData.blueMotionData,
			grid_mode: beat.pictographData.gridMode
		}));
	}
}

// Export singleton instance
const sequenceDataService = new SequenceDataService();
export default sequenceDataService;

// Export the class for testing
export { SequenceDataService };
