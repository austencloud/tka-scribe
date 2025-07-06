/**
 * Dictionary loader for scanning and loading sequence files
 */

import type { DictionaryItem } from '../../types/core.js';
import { DictionaryItemFactory } from './dictionary-item-factory.js';

export class DictionaryLoader {
	private itemFactory = new DictionaryItemFactory();

	/**
	 * Scan the dictionary directory for PNG files
	 */
	async scanDictionaryFiles(): Promise<DictionaryItem[]> {
		const items: DictionaryItem[] = [];

		try {
			// In a browser environment, we need to use a different approach
			// For now, we'll use a predefined list of known sequences
			const knownSequences = await this.getKnownSequences();

			for (const sequenceInfo of knownSequences) {
				try {
					const item = await this.itemFactory.createDictionaryItem(sequenceInfo);
					if (item) {
						items.push(item);
					}
				} catch (error) {
					console.warn(`Failed to process ${sequenceInfo.name}:`, error);
				}
			}
		} catch (error) {
			console.error('Failed to scan dictionary files:', error);
		}

		return items.sort((a, b) => a.name.localeCompare(b.name));
	}

	/**
	 * Get a list of known sequences from the dictionary
	 * This dynamically scans the dictionary directory structure to find all available sequences
	 */
	private async getKnownSequences(): Promise<Array<{ name: string; versions: string[] }>> {
		try {
			console.log('DictionaryLoader: Starting to scan for sequences...');
			
			// Try multiple possible paths for import.meta.glob
			let modules: Record<string, () => Promise<any>> = {};
			
			// Path 1: Absolute path from project root
			try {
				modules = import.meta.glob('/src/lib/animator/dictionary/**/*.png', {
					query: '?url',
					import: 'default'
				});
				console.log('DictionaryLoader: Path 1 (/src/lib/animator/dictionary/**/*.png) found:', Object.keys(modules).length, 'modules');
			} catch (e) {
				console.log('DictionaryLoader: Path 1 failed:', e);
			}
			
			// Path 2: Relative to current file
			if (Object.keys(modules).length === 0) {
				try {
					modules = import.meta.glob('../../dictionary/**/*.png', {
						query: '?url',
						import: 'default'
					});
					console.log('DictionaryLoader: Path 2 (../../dictionary/**/*.png) found:', Object.keys(modules).length, 'modules');
				} catch (e) {
					console.log('DictionaryLoader: Path 2 failed:', e);
				}
			}
			
			// Path 3: Different absolute path
			if (Object.keys(modules).length === 0) {
				try {
					modules = import.meta.glob('./dictionary/**/*.png', {
						query: '?url',
						import: 'default'
					});
					console.log('DictionaryLoader: Path 3 (./dictionary/**/*.png) found:', Object.keys(modules).length, 'modules');
				} catch (e) {
					console.log('DictionaryLoader: Path 3 failed:', e);
				}
			}
			
			console.log('DictionaryLoader: Found modules:', modules);
			console.log('DictionaryLoader: Module paths:', Object.keys(modules));

			const sequenceMap = new Map<string, string[]>();

			// Process each discovered PNG file
			for (const path in modules) {
				console.log('DictionaryLoader: Processing path:', path);
				
				// Extract sequence name and version from path
				// Path format: /src/lib/animator/dictionary/SEQUENCE_NAME/SEQUENCE_NAME_verX.png
				const pathParts = path.split('/');
				const fileName = pathParts[pathParts.length - 1]; // e.g., "ABC_ver1.png"
				const folderName = pathParts[pathParts.length - 2]; // e.g., "ABC"

				// Skip __init__.py files and non-PNG files
				if (!fileName.endsWith('.png') || fileName === '__init__.py') {
					continue;
				}

				// Use folder name as sequence name (this handles complex names with special characters)
				const sequenceName = folderName;

				// Add to sequence map
				if (!sequenceMap.has(sequenceName)) {
					sequenceMap.set(sequenceName, []);
				}
				sequenceMap.get(sequenceName)!.push(fileName);
			}

			// Convert map to array format and sort versions
			const sequences = Array.from(sequenceMap.entries()).map(([name, versions]) => ({
				name,
				versions: versions.sort() // Sort versions naturally
			}));

			console.log('DictionaryLoader: Final sequences found:', sequences);

			// Return all sequences sorted alphabetically by name
			return sequences.sort((a, b) => a.name.localeCompare(b.name));
		} catch (error) {
			console.error('DictionaryLoader: Failed to dynamically load sequences:', error);

			// Return empty array - let the UI handle the empty state
			return [];
		}
	}

	/**
	 * Extract categories from dictionary items
	 */
	extractCategories(items: DictionaryItem[]): string[] {
		const categories = new Set<string>();

		items.forEach((item) => {
			// Extract categories based on sequence properties
			if (item.metadata.level) {
				categories.add(`Level ${item.metadata.level}`);
			}
			if (item.metadata.prop_type) {
				categories.add(item.metadata.prop_type);
			}
			if (item.metadata.grid_mode) {
				categories.add(item.metadata.grid_mode);
			}

			// Add length-based categories
			const stepCount = item.sequenceData.length - 2; // Subtract metadata and start position
			if (stepCount <= 5) {
				categories.add('Short (≤5 steps)');
			} else if (stepCount <= 10) {
				categories.add('Medium (6-10 steps)');
			} else {
				categories.add('Long (>10 steps)');
			}
		});

		return Array.from(categories).sort();
	}
}
