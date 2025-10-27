
/**
 * Deletes a beat from the sequence.
 * If the first beat is deleted, resets sequence.
 */
export function deleteBeat(beatNumber: number) {
	beatsStore.update((beats) => {
		if (beats.length === 0) return beats;

		const updatedBeats = beats.filter((beat) => beat.beatNumber !== beatNumber);

		// Renumber beats
		updatedBeats.forEach((beat, index) => {
			beat.beatNumber = index + 1;
		});

		return updatedBeats;
	});
}
