/**
 * Firebase Cloud Functions Entry Point
 *
 * Exports all Cloud Functions for the TKA Scribe application.
 */

// YouTube audio extraction
export { extractAudio as youtubeExtractAudio } from "./youtube/extract-audio";
