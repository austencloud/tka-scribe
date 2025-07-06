/**
 * Dictionary service for managing the sequence catalog
 */

import type { DictionaryItem, DictionaryIndex } from '../../types/core.js';
import { DictionaryCache } from './dictionary-cache.js';
import { DictionarySearcher } from './dictionary-searcher.js';

export class DictionaryService {
	private static instance: DictionaryService;
	private cache = new DictionaryCache();
	private searcher = new DictionarySearcher();

	private constructor() {}

	static getInstance(): DictionaryService {
		if (!DictionaryService.instance) {
			DictionaryService.instance = new DictionaryService();
		}
		return DictionaryService.instance;
	}

	/**
	 * Get the dictionary index, loading it if necessary
	 */
	async getIndex(): Promise<DictionaryIndex> {
		return this.cache.getIndex();
	}

	/**
	 * Get a specific dictionary item by ID
	 */
	async getItem(id: string): Promise<DictionaryItem | null> {
		const index = await this.getIndex();
		return this.searcher.findItemById(index.items, id);
	}

	/**
	 * Search dictionary items
	 */
	async searchItems(query: string, category?: string): Promise<DictionaryItem[]> {
		const index = await this.getIndex();
		return this.searcher.searchItems(index.items, query, category);
	}

	/**
	 * Refresh the dictionary index
	 */
	async refresh(): Promise<DictionaryIndex> {
		return this.cache.refresh();
	}

	/**
	 * Check if the service is currently loading
	 */
	get isLoading(): boolean {
		return this.cache.loading;
	}
}
