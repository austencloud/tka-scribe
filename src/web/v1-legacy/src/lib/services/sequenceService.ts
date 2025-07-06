// src/lib/services/sequenceService.ts
import { browser } from '$app/environment';
import type { SequenceData, SequenceVariation } from '$lib/stores/browseTab/browseTabStore';

// Mock data for development
const MOCK_SEQUENCES: SequenceData[] = [
	{
		id: '1',
		word: 'Alpha',
		variations: [
			{
				id: '1-1',
				thumbnailPath: '/images/sequences/alpha-1.png',
				metadata: {
					level: 1,
					author: 'John Doe',
					dateAdded: '2023-01-15',
					gridMode: 'diamond',
					startingPosition: 'home',
					isFavorite: true,
					length: 4,
					tags: ['beginner', 'tutorial']
				}
			},
			{
				id: '1-2',
				thumbnailPath: '/images/sequences/alpha-2.png',
				metadata: {
					level: 1,
					author: 'John Doe',
					dateAdded: '2023-01-16',
					gridMode: 'diamond',
					startingPosition: 'home',
					isFavorite: false,
					length: 4,
					tags: ['beginner', 'tutorial']
				}
			}
		],
		metadata: {
			level: 1,
			author: 'John Doe',
			dateAdded: '2023-01-15',
			gridMode: 'diamond',
			startingPosition: 'home',
			length: 4,
			tags: ['beginner', 'tutorial']
		}
	},
	{
		id: '2',
		word: 'Beta',
		variations: [
			{
				id: '2-1',
				thumbnailPath: '/images/sequences/beta-1.png',
				metadata: {
					level: 2,
					author: 'Jane Smith',
					dateAdded: '2023-02-10',
					gridMode: 'box',
					startingPosition: 'extended',
					isFavorite: false,
					length: 6,
					tags: ['intermediate']
				}
			}
		],
		metadata: {
			level: 2,
			author: 'Jane Smith',
			dateAdded: '2023-02-10',
			gridMode: 'box',
			startingPosition: 'extended',
			length: 6,
			tags: ['intermediate']
		}
	},
	{
		id: '3',
		word: 'Gamma',
		variations: [
			{
				id: '3-1',
				thumbnailPath: '/images/sequences/gamma-1.png',
				metadata: {
					level: 3,
					author: 'Alex Johnson',
					dateAdded: '2023-03-05',
					gridMode: 'diamond',
					startingPosition: 'split',
					isFavorite: true,
					length: 8,
					tags: ['advanced', 'complex']
				}
			},
			{
				id: '3-2',
				thumbnailPath: '/images/sequences/gamma-2.png',
				metadata: {
					level: 3,
					author: 'Alex Johnson',
					dateAdded: '2023-03-06',
					gridMode: 'diamond',
					startingPosition: 'split',
					isFavorite: false,
					length: 8,
					tags: ['advanced', 'complex']
				}
			},
			{
				id: '3-3',
				thumbnailPath: '/images/sequences/gamma-3.png',
				metadata: {
					level: 3,
					author: 'Alex Johnson',
					dateAdded: '2023-03-07',
					gridMode: 'diamond',
					startingPosition: 'split',
					isFavorite: false,
					length: 8,
					tags: ['advanced', 'complex']
				}
			}
		],
		metadata: {
			level: 3,
			author: 'Alex Johnson',
			dateAdded: '2023-03-05',
			gridMode: 'diamond',
			startingPosition: 'split',
			length: 8,
			tags: ['advanced', 'complex']
		}
	},
	{
		id: '4',
		word: 'Delta',
		variations: [
			{
				id: '4-1',
				thumbnailPath: '/images/sequences/delta-1.png',
				metadata: {
					level: 4,
					author: 'Sarah Williams',
					dateAdded: '2023-04-20',
					gridMode: 'box',
					startingPosition: 'home',
					isFavorite: false,
					length: 10,
					tags: ['expert', 'performance']
				}
			}
		],
		metadata: {
			level: 4,
			author: 'Sarah Williams',
			dateAdded: '2023-04-20',
			gridMode: 'box',
			startingPosition: 'home',
			length: 10,
			tags: ['expert', 'performance']
		}
	},
	{
		id: '5',
		word: 'Epsilon',
		variations: [
			{
				id: '5-1',
				thumbnailPath: '/images/sequences/epsilon-1.png',
				metadata: {
					level: 5,
					author: 'Michael Brown',
					dateAdded: '2023-05-15',
					gridMode: 'diamond',
					startingPosition: 'extended',
					isFavorite: true,
					length: 12,
					tags: ['master', 'showcase']
				}
			},
			{
				id: '5-2',
				thumbnailPath: '/images/sequences/epsilon-2.png',
				metadata: {
					level: 5,
					author: 'Michael Brown',
					dateAdded: '2023-05-16',
					gridMode: 'diamond',
					startingPosition: 'extended',
					isFavorite: false,
					length: 12,
					tags: ['master', 'showcase']
				}
			}
		],
		metadata: {
			level: 5,
			author: 'Michael Brown',
			dateAdded: '2023-05-15',
			gridMode: 'diamond',
			startingPosition: 'extended',
			length: 12,
			tags: ['master', 'showcase']
		}
	}
];

/**
 * Fetch all sequences from the API
 * @returns Promise resolving to an array of sequence data
 */
export async function fetchSequences(): Promise<SequenceData[]> {
	if (!browser) return [];

	// In a real implementation, this would fetch from an API endpoint
	// For now, we'll use mock data with a simulated delay
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(MOCK_SEQUENCES);
		}, 500);
	});
}

/**
 * Update the favorite status of a sequence variation
 * @param sequenceId The ID of the sequence
 * @param variationId The ID of the variation
 * @param isFavorite Whether the variation should be marked as favorite
 * @returns Promise resolving when the update is complete
 */
export async function updateFavoriteStatus(
	sequenceId: string,
	variationId: string,
	isFavorite: boolean
): Promise<void> {
	if (!browser) return;

	// In a real implementation, this would call an API endpoint
	// For now, we'll simulate a delay
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			// Simulate success (90% of the time)
			if (Math.random() > 0.1) {
				resolve();
			} else {
				// Simulate occasional failure
				reject(new Error('Failed to update favorite status'));
			}
		}, 300);
	});
}

/**
 * Delete a sequence variation
 * @param sequenceId The ID of the sequence
 * @param variationId The ID of the variation to delete
 * @returns Promise resolving when the deletion is complete
 */
export async function deleteVariationApi(sequenceId: string, variationId: string): Promise<void> {
	if (!browser) return;

	// In a real implementation, this would call an API endpoint
	// For now, we'll simulate a delay
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			// Simulate success (90% of the time)
			if (Math.random() > 0.1) {
				resolve();
			} else {
				// Simulate occasional failure
				reject(new Error('Failed to delete variation'));
			}
		}, 500);
	});
}

/**
 * Delete an entire sequence
 * @param sequenceId The ID of the sequence to delete
 * @returns Promise resolving when the deletion is complete
 */
export async function deleteSequenceApi(sequenceId: string): Promise<void> {
	if (!browser) return;

	// In a real implementation, this would call an API endpoint
	// For now, we'll simulate a delay
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			// Simulate success (90% of the time)
			if (Math.random() > 0.1) {
				resolve();
			} else {
				// Simulate occasional failure
				reject(new Error('Failed to delete sequence'));
			}
		}, 700);
	});
}


