/**
 * OptionPickerLayoutManager - Minimal layout calculations
 *
 * Just the calculateLayout function that's actually used in OptionPicker.svelte
 */

export class OptionPickerLayoutManager {
	// Calculate responsive layout (from the current OptionPicker.svelte)
	static calculateLayout(containerWidth: number): { optionsPerRow: number; optionSize: number } {
		// Adjusted to match legacy 144px pictograph size
		const baseSize = 144; // Match legacy size
		const minSize = 100;
		const maxSize = 200;

		const optionsPerRow = Math.max(1, Math.floor(containerWidth / (baseSize + 20)));
		let optionSize = Math.min(
			maxSize,
			Math.max(minSize, (containerWidth - optionsPerRow * 20) / optionsPerRow)
		);

		// Ensure we get close to 144px for legacy compatibility
		if (optionSize < 144 && optionSize > 120) {
			optionSize = 144;
		}

		return { optionsPerRow, optionSize };
	}
}
