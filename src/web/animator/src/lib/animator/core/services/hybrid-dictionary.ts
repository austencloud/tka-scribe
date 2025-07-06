/**
 * Hybrid Dictionary Service - combines original PNG loading with hardcoded fallbacks
 */

import type { DictionaryItem, DictionaryIndex } from '../../types/core.js';
import { DictionaryService } from './dictionary-service.js';
import { HardcodedDictionaryService } from './hardcoded-dictionary.js';

export class HybridDictionaryService {
	private static instance: HybridDictionaryService;
	private originalService = DictionaryService.getInstance();
	private fallbackService = HardcodedDictionaryService.getInstance();

	private constructor() {}

	static getInstance(): HybridDictionaryService {
		if (!HybridDictionaryService.instance) {
			HybridDictionaryService.instance = new HybridDictionaryService();
		}
		return HybridDictionaryService.instance;
	}

	/**
	 * Get the dictionary index, trying original first, then fallback
	 */
	async getIndex(): Promise<DictionaryIndex> {
		try {
			console.log('HybridDictionaryService: Trying original dictionary service...');
			const originalIndex = await this.originalService.getIndex();
			
			if (originalIndex.items.length > 0) {
				console.log('HybridDictionaryService: Original dictionary loaded successfully with', originalIndex.items.length, 'items');
				return originalIndex;
			} else {
				console.log('HybridDictionaryService: Original dictionary is empty, using fallback...');
				const fallbackIndex = await this.fallbackService.getIndex();
				console.log('HybridDictionaryService: Fallback dictionary loaded with', fallbackIndex.items.length, 'items');
				return {
					...fallbackIndex,
					categories: [...fallbackIndex.categories, 'Fallback Sequences']
				};
			}
		} catch (error) {
			console.warn('HybridDictionaryService: Original dictionary failed, using fallback:', error);
			const fallbackIndex = await this.fallbackService.getIndex();
			console.log('HybridDictionaryService: Fallback dictionary loaded with', fallbackIndex.items.length, 'items');
			return {
				...fallbackIndex,
				categories: [...fallbackIndex.categories, 'Fallback Sequences']
			};
		}
	}

	/**
	 * Search dictionary items
	 */
	async searchItems(query: string, category?: string): Promise<DictionaryItem[]> {
		try {
			const originalResults = await this.originalService.searchItems(query, category);
			if (originalResults.length > 0) {
				return originalResults;
			}
		} catch (error) {
			console.warn('HybridDictionaryService: Original search failed:', error);
		}

		// Fallback to hardcoded sequences
		return this.fallbackService.searchItems(query, category);
	}

	/**
	 * Get a specific dictionary item by ID
	 */
	async getItem(id: string): Promise<DictionaryItem | null> {
		try {
			const originalItem = await this.originalService.getItem(id);
			if (originalItem) {
				return originalItem;
			}
		} catch (error) {
			console.warn('HybridDictionaryService: Original getItem failed:', error);
		}

		// Try hardcoded sequences
		const fallbackIndex = await this.fallbackService.getIndex();
		return fallbackIndex.items.find(item => item.id === id) || null;
	}

	/**
	 * Refresh the dictionary index
	 */
	async refresh(): Promise<DictionaryIndex> {
		try {
			return await this.originalService.refresh();
		} catch (error) {
			console.warn('HybridDictionaryService: Original refresh failed, using fallback:', error);
			return this.fallbackService.getIndex();
		}
	}

	/**
	 * Check if the service is currently loading
	 */
	get isLoading(): boolean {
		return this.originalService.isLoading;
	}
}
