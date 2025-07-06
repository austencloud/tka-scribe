import type { DictionaryItem } from '../../types/core.js';
import { extractSequenceFromPNG } from '../../utils/file/png-parser.js';

export class DictionaryItemFactory {
	async createDictionaryItem(sequenceInfo: {
		name: string;
		versions: string[];
	}): Promise<DictionaryItem | null> {
		try {
			const primaryVersion = sequenceInfo.versions[0];
			const filePath = `/api/dictionary/${sequenceInfo.name}/${primaryVersion}`;

			const response = await fetch(filePath);
			if (!response.ok) {
				console.warn(`Could not fetch ${filePath}`);
				return null;
			}

			const blob = await response.blob();
			const file = new File([blob], primaryVersion, { type: 'image/png' });

			const extractResult = await extractSequenceFromPNG(file);
			if (!extractResult.success || !extractResult.data) {
				// Failed to extract metadata from file
				return null;
			}

			const metadata = extractResult.data[0] || {};

			return {
				id: sequenceInfo.name,
				name: sequenceInfo.name,
				filePath,
				metadata,
				sequenceData: extractResult.data,
				thumbnailUrl: filePath,
				versions: sequenceInfo.versions
			};
		} catch {
			// Failed to create dictionary item
			return null;
		}
	}
}
