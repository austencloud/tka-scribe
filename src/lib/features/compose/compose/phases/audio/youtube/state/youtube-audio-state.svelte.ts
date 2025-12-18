/**
 * YouTube Audio State
 *
 * Svelte 5 runes-based state management for YouTube audio feature.
 */

import type { YouTubeVideo } from "../domain/models/YouTubeVideo";
import type { YouTubeAudioTrackLocal } from "../domain/models/YouTubeAudioTrack";
import type { ExtractionProgress } from "../services/contracts/IYouTubeAudioService";

/**
 * Active tab in the YouTube panel
 */
export type YouTubeTab = "search" | "library";

/**
 * YouTube audio state
 */
interface YouTubeAudioState {
  /** Whether the YouTube panel is open */
  isOpen: boolean;

  /** Active tab */
  activeTab: YouTubeTab;

  /** Current search query */
  searchQuery: string;

  /** Search results */
  searchResults: YouTubeVideo[];

  /** Whether search is loading */
  isSearching: boolean;

  /** Search error message */
  searchError: string | null;

  /** Next page token for pagination */
  nextPageToken: string | null;

  /** User's saved library */
  library: YouTubeAudioTrackLocal[];

  /** Whether library is loading */
  isLibraryLoading: boolean;

  /** Currently extracting video (if any) */
  extractingVideo: YouTubeVideo | null;

  /** Extraction progress */
  extractionProgress: ExtractionProgress | null;

  /** Selected video for preview */
  selectedVideo: YouTubeVideo | null;
}

/**
 * Create initial state
 */
function createInitialState(): YouTubeAudioState {
  return {
    isOpen: false,
    activeTab: "search",
    searchQuery: "",
    searchResults: [],
    isSearching: false,
    searchError: null,
    nextPageToken: null,
    library: [],
    isLibraryLoading: false,
    extractingVideo: null,
    extractionProgress: null,
    selectedVideo: null,
  };
}

// Reactive state using Svelte 5 runes
let state = $state<YouTubeAudioState>(createInitialState());

/**
 * YouTube Audio State API
 */
export const youtubeAudioState = {
  // Getters (derived)
  get isOpen() {
    return state.isOpen;
  },
  get activeTab() {
    return state.activeTab;
  },
  get searchQuery() {
    return state.searchQuery;
  },
  get searchResults() {
    return state.searchResults;
  },
  get isSearching() {
    return state.isSearching;
  },
  get searchError() {
    return state.searchError;
  },
  get nextPageToken() {
    return state.nextPageToken;
  },
  get library() {
    return state.library;
  },
  get isLibraryLoading() {
    return state.isLibraryLoading;
  },
  get extractingVideo() {
    return state.extractingVideo;
  },
  get extractionProgress() {
    return state.extractionProgress;
  },
  get selectedVideo() {
    return state.selectedVideo;
  },
  get isExtracting() {
    return state.extractingVideo !== null;
  },
  get hasSearchResults() {
    return state.searchResults.length > 0;
  },
  get hasLibraryItems() {
    return state.library.length > 0;
  },

  // Actions
  open() {
    state.isOpen = true;
  },

  close() {
    state.isOpen = false;
    state.selectedVideo = null;
  },

  toggle() {
    state.isOpen = !state.isOpen;
    if (!state.isOpen) {
      state.selectedVideo = null;
    }
  },

  setActiveTab(tab: YouTubeTab) {
    state.activeTab = tab;
    state.selectedVideo = null;
  },

  setSearchQuery(query: string) {
    state.searchQuery = query;
  },

  startSearch() {
    state.isSearching = true;
    state.searchError = null;
  },

  setSearchResults(results: YouTubeVideo[], nextPageToken: string | null = null) {
    state.searchResults = results;
    state.nextPageToken = nextPageToken;
    state.isSearching = false;
    state.searchError = null;
  },

  appendSearchResults(results: YouTubeVideo[], nextPageToken: string | null = null) {
    state.searchResults = [...state.searchResults, ...results];
    state.nextPageToken = nextPageToken;
    state.isSearching = false;
  },

  setSearchError(error: string) {
    state.searchError = error;
    state.isSearching = false;
  },

  clearSearch() {
    state.searchQuery = "";
    state.searchResults = [];
    state.searchError = null;
    state.nextPageToken = null;
  },

  startLibraryLoad() {
    state.isLibraryLoading = true;
  },

  setLibrary(library: YouTubeAudioTrackLocal[]) {
    state.library = library;
    state.isLibraryLoading = false;
  },

  addToLibrary(track: YouTubeAudioTrackLocal) {
    // Add to front, remove duplicates
    state.library = [track, ...state.library.filter((t) => t.videoId !== track.videoId)];
  },

  removeFromLibrary(videoId: string) {
    state.library = state.library.filter((t) => t.videoId !== videoId);
  },

  updateTrackAvailability(videoId: string, isLocallyAvailable: boolean) {
    const track = state.library.find((t) => t.videoId === videoId);
    if (track) {
      track.isLocallyAvailable = isLocallyAvailable;
    }
  },

  startExtraction(video: YouTubeVideo) {
    state.extractingVideo = video;
    state.extractionProgress = {
      stage: "queued",
      progress: 0,
      message: "Starting...",
    };
  },

  updateExtractionProgress(progress: ExtractionProgress) {
    state.extractionProgress = progress;
  },

  finishExtraction() {
    state.extractingVideo = null;
    state.extractionProgress = null;
  },

  selectVideo(video: YouTubeVideo | null) {
    state.selectedVideo = video;
  },

  reset() {
    state = createInitialState();
  },
};

/**
 * Get reactive state (for components that need raw $state access)
 */
export function getYouTubeAudioState() {
  return state;
}
