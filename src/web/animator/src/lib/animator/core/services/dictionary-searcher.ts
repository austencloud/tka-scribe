/**
 * Dictionary searcher for filtering and searching items
 */

import type { DictionaryItem } from '../../types/core.js';

export class DictionarySearcher {
	/**
	 * Search dictionary items
	 */
	searchItems(items: DictionaryItem[], query: string, category?: string): DictionaryItem[] {
		let filteredItems = items;

		// Filter by category
		if (category && category !== 'All') {
			filteredItems = this.filterByCategory(filteredItems, category);
		}

		// Filter by search query
		if (query.trim()) {
			filteredItems = this.filterByQuery(filteredItems, query);
		}

		return filteredItems;
	}

	/**
	 * Filter items by category
	 */
	private filterByCategory(items: DictionaryItem[], category: string): DictionaryItem[] {
		return items.filter((item) => {
			if (category.startsWith('Level ')) {
				return item.metadata.level?.toString() === category.replace('Level ', '');
			}
			if (category.includes('steps')) {
				const stepCount = item.sequenceData.length - 1;
				if (category.includes('≤5')) {return stepCount <= 5;}
				if (category.includes('6-10')) {return stepCount >= 6 && stepCount <= 10;}
				if (category.includes('>10')) {return stepCount > 10;}
			}
			return item.metadata.prop_type === category || item.metadata.grid_mode === category;
		});
	}

	/**
	 * Filter items by search query
	 */
	private filterByQuery(items: DictionaryItem[], query: string): DictionaryItem[] {
		const lowerQuery = query.toLowerCase();
		return items.filter(
			(item) =>
				item.name.toLowerCase().includes(lowerQuery) ||
				item.metadata.word?.toLowerCase().includes(lowerQuery) ||
				item.metadata.author?.toLowerCase().includes(lowerQuery)
		);
	}

	/**
	 * Get a specific dictionary item by ID
	 */
	findItemById(items: DictionaryItem[], id: string): DictionaryItem | null {
		return items.find((item) => item.id === id) || null;
	}
}
