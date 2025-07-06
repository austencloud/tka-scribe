/**
 * Dictionary cache for managing index state and loading
 */

import type { DictionaryIndex } from '../../types/core.js';
import { DictionaryLoader } from './dictionary-loader.js';

export class DictionaryCache {
	private index: DictionaryIndex | null = null;
	private isLoading = false;
	private loader = new DictionaryLoader();

	/**
	 * Get the dictionary index, loading it if necessary
	 */
	async getIndex(): Promise<DictionaryIndex> {
		if (this.index) {
			return this.index;
		}

		if (this.isLoading) {
			// Wait for existing load to complete
			while (this.isLoading) {
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
			return this.index!;
		}

		return this.loadIndex();
	}

	/**
	 * Load the dictionary index from the file system
	 */
	async loadIndex(): Promise<DictionaryIndex> {
		this.isLoading = true;

		try {
			const items = await this.loader.scanDictionaryFiles();
			const categories = this.loader.extractCategories(items);

			this.index = {
				items,
				categories,
				totalCount: items.length,
				lastUpdated: new Date()
			};

			return this.index;
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Refresh the dictionary index
	 */
	async refresh(): Promise<DictionaryIndex> {
		this.index = null;
		return this.loadIndex();
	}

	/**
	 * Clear the cache
	 */
	clear(): void {
		this.index = null;
	}

	/**
	 * Check if the cache is currently loading
	 */
	get loading(): boolean {
		return this.isLoading;
	}

	/**
	 * Check if the cache has data
	 */
	get hasData(): boolean {
		return this.index !== null;
	}
}
