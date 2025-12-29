/**
 * Write Tab Type Definitions
 *
 * TypeScript interfaces and types that match the desktop Write tab implementation
 * for consistent data structures across the application.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

/**
 * Represents act data for the write tab.
 * Uses the core SequenceData domain model for consistency across the application.
 */
export interface ActData {
  id: string;
  name: string;
  description: string;
  sequences: SequenceData[];
  musicFile?: {
    name: string;
    path: string;
    duration?: number;
  };
  metadata: {
    created: Date;
    modified: Date;
    author?: string;
    version?: string;
  };
  filePath?: string; // Path to saved act file
}

/**
 * Represents act thumbnail information for the browser.
 */
export interface ActThumbnailInfo {
  id: string;
  name: string;
  description: string;
  filePath: string;
  sequenceCount: number;
  hasMusic: boolean;
  thumbnail?: string;
  lastModified: Date;
}

/**
 * Music player state.
 */
export interface MusicPlayerState {
  isLoaded: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  filename?: string;
}

/**
 * Write tab view states.
 */
export enum WriteView {
  MAIN = "main", // Main editing view
  BROWSER = "browser", // Act browser view (for mobile)
}

/**
 * Write tab state management.
 */
export interface WriteState {
  currentView: WriteView;
  currentAct: ActData | null;
  availableActs: ActThumbnailInfo[];
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  musicPlayer: MusicPlayerState;
  error: string | null;
}

/**
 * Act creation/editing operations.
 */
export interface ActOperations {
  createNewAct: () => ActData;
  saveAct: (act: ActData) => Promise<boolean>;
  saveActAs: (act: ActData, filePath: string) => Promise<boolean>;
  loadAct: (filePath: string) => Promise<ActData | null>;
  deleteAct: (filePath: string) => Promise<boolean>;
}

/**
 * Music player operations.
 */
export interface MusicPlayerOperations {
  loadMusic: (filePath: string) => Promise<boolean>;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (position: number) => void;
  setVolume: (volume: number) => void;
}

/**
 * Sequence operations within acts.
 */
export interface SequenceOperations {
  addSequence: (actId: string, sequence: SequenceData) => void;
  removeSequence: (actId: string, sequenceId: string) => void;
  moveSequence: (
    actId: string,
    sequenceId: string,
    newPosition: number
  ) => void;
  updateSequence: (
    actId: string,
    sequenceId: string,
    updates: Partial<SequenceData>
  ) => void;
}

/**
 * Default empty act data.
 */
export function createEmptyAct(): ActData {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    name: "Untitled Act",
    description: "",
    sequences: [],
    metadata: {
      created: now,
      modified: now,
      version: "1.0",
    },
  };
}

/**
 * Default music player state.
 */
export function createDefaultMusicPlayerState(): MusicPlayerState {
  return {
    isLoaded: false,
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
  };
}

/**
 * Format time in MM:SS format.
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Get file extension from filename.
 */
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

/**
 * Check if file is a supported music format.
 */
export function isSupportedMusicFormat(filename: string): boolean {
  const supportedFormats = ["mp3", "wav", "ogg", "m4a", "aac"];
  return supportedFormats.includes(getFileExtension(filename));
}

/**
 * Check if file is a supported act format.
 */
export function isSupportedActFormat(filename: string): boolean {
  const supportedFormats = ["json", "act"]; // Assuming acts are saved as JSON
  return supportedFormats.includes(getFileExtension(filename));
}

/**
 * Generate thumbnail placeholder for sequence.
 */
export function generateSequenceThumbnail(sequence: SequenceData): string {
  // Return a placeholder or generate based on sequence data
  const svg = `
        <svg width="100" height="70" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="70" fill="rgba(255,255,255,0.1)" rx="4"/>
            <text x="50" y="35" text-anchor="middle" fill="white" font-family="Arial" font-size="24">🎭</text>
            <text x="50" y="55" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="Arial" font-size="10">${sequence.beats.length} beats</text>
        </svg>
    `;

  // Use encodeURIComponent instead of btoa to handle Unicode characters
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

