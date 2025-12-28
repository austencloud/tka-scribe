/**
 * Coordinates voice input transcription, handling deduplication and text merging.
 *
 * Solves the problem of mobile browsers re-emitting entire transcripts including
 * previously finalized segments, which would cause text duplication.
 */
export interface IVoiceTranscriptCoordinator {
  /**
   * Process a final voice transcript, deduplicating against previously committed text.
   *
   * @param transcript - The complete transcript from the voice recognition API
   * @param currentText - The current text in the form field
   * @returns The updated text with new voice content appended (if any)
   */
  processFinalTranscript(transcript: string, currentText: string): string;

  /**
   * Get the current interim (streaming) transcript for display preview.
   */
  getInterimText(): string;

  /**
   * Update the interim transcript during live voice streaming.
   *
   * @param transcript - The current interim transcript
   */
  updateInterimText(transcript: string): void;

  /**
   * Clear all voice tracking state when recording ends.
   */
  reset(): void;
}
