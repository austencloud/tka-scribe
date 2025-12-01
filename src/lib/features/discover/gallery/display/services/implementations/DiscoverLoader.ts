/**
 * Explore Loader Service
 *
 * Orchestrates loading of gallery sequences from the sequence index.
 * Handles validation, metadata extraction, and data normalization.
 */

import type { GridPositionGroup } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import { createSequenceData } from "$lib/shared/foundation/domain/models";
import { TYPES } from "$lib/shared/inversify/types";
import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";
import { inject, injectable } from "inversify";
import type { IDiscoverLoader } from "../contracts/IDiscoverLoader";
import type { IDiscoverMetadataExtractor } from "../contracts/IDiscoverMetadataExtractor";
import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
// Constants for validation
const MAX_WORD_LENGTH = 200;
const SEQUENCE_INDEX_URL = "/sequence-index.json";

interface RawSequenceData {
  word?: string;
  name?: string;
  id?: string;
  thumbnails?: unknown;
  isFavorite?: unknown;
  isCircular?: unknown;
  tags?: unknown;
  metadata?: unknown;
  author?: string;
  gridMode?: unknown;
  difficultyLevel?: unknown;
  sequenceLength?: unknown;
  level?: unknown;
  dateAdded?: unknown;
  propType?: unknown;
  startingPosition?: unknown;
  fullMetadata?: unknown; // Bundled metadata from build script
  metadataBundled?: boolean; // Flag indicating metadata is pre-bundled
}

@injectable()
export class DiscoverLoader implements IDiscoverLoader {
  // Cache for processed sequences - prevents re-fetching 4.7MB file
  private cachedSequences: SequenceData[] | null = null;
  private isLoading = false;
  private loadPromise: Promise<SequenceData[]> | null = null;

  constructor(
    @inject(TYPES.IDiscoverMetadataExtractor)
    private metadataExtractor: IDiscoverMetadataExtractor
  ) {}

  async loadSequenceMetadata(): Promise<SequenceData[]> {
    // Return cached data if available
    if (this.cachedSequences) {
      return this.cachedSequences;
    }

    // If already loading, wait for that request to complete (prevents duplicate fetches)
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    // Start loading
    this.isLoading = true;
    this.loadPromise = this.doLoadSequenceMetadata();

    try {
      const sequences = await this.loadPromise;
      this.cachedSequences = sequences;
      return sequences;
    } finally {
      this.isLoading = false;
      this.loadPromise = null;
    }
  }

  private async doLoadSequenceMetadata(): Promise<SequenceData[]> {
    try {
      const rawSequences = await this.fetchSequenceIndex();
      const validSequences = await this.processRawSequences(rawSequences);
      return validSequences;
    } catch (error) {
      console.error("❌ Failed to load sequence metadata:", error);
      throw error;
    }
  }

  /**
   * Lazy-load full sequence data including beats (only called when user opens a sequence)
   * This prevents the N+1 query problem during initial gallery load
   *
   * OPTIMIZATION: If metadata was bundled via build script, use it directly.
   * Otherwise, fetch from .meta.json file (fallback for development).
   */
  async loadFullSequenceData(
    sequenceName: string
  ): Promise<SequenceData | null> {
    try {
      // Check if we have bundled metadata in the sequence index cache
      // This would be populated if you run: npm run bundle:metadata
      const cachedSequence = this.sequenceCache.get(sequenceName);

      if (cachedSequence?.fullMetadata) {
        console.log(`⚡ Using bundled metadata for ${sequenceName}`);
        return this.createSequenceFromBundledMetadata(cachedSequence);
      }

      // Fallback: Fetch metadata from .meta.json file (slower, but works in development)
      console.log(`🔄 Fetching metadata for ${sequenceName} from .meta.json`);
      const thumbnailPath = `/gallery/${sequenceName}/${sequenceName}.webp`;
      const metadata = await this.metadataExtractor.extractMetadata(
        sequenceName,
        thumbnailPath
      );

      const gridMode = metadata.gridMode || GridMode.BOX;
      const dateAdded = metadata.dateAdded || new Date();
      const difficultyLevel = metadata.difficultyLevel || "beginner";
      const calculatedLevel = this.difficultyStringToLevel(difficultyLevel);

      return createSequenceData({
        id: sequenceName,
        name: this.cleanSequenceName(sequenceName),
        word: sequenceName,
        beats: metadata.beats,
        thumbnails: [thumbnailPath],
        isFavorite: false,
        isCircular: metadata.isCircular || false,
        tags: ["flow", "practice"],
        metadata: { source: "tka_dictionary" },
        author: metadata.author || "Unknown",
        gridMode,
        difficultyLevel,
        sequenceLength: metadata.sequenceLength,
        level: calculatedLevel,
        dateAdded,
        propType: metadata.propType || PropType.STAFF,
        startingPositionGroup: (metadata.startingPosition ||
          "alpha") as GridPositionGroup,
      });
    } catch (error) {
      console.error(
        `❌ Failed to load full sequence data for ${sequenceName}:`,
        error
      );
      return null;
    }
  }

  /**
   * Cache to store raw sequences for quick lookup during lazy loading
   */
  private sequenceCache = new Map<string, RawSequenceData>();

  /**
   * Create SequenceData from bundled metadata (instant, no HTTP request!)
   */
  private createSequenceFromBundledMetadata(
    rawSeq: RawSequenceData
  ): SequenceData | null {
    try {
      const fullMetadata = rawSeq.fullMetadata as Record<string, unknown>;
      const sequence = (fullMetadata.sequence || []) as unknown[];

      // Parse beats from bundled metadata
      const beats = this.parseBundledBeats(sequence);

      const word = rawSeq.word ?? rawSeq.id ?? "";
      const gridMode = this.parseGridMode(rawSeq.gridMode) ?? GridMode.BOX;
      const dateAdded = this.parseDate(rawSeq.dateAdded) ?? new Date();
      const difficultyLevel = this.parseDifficulty(rawSeq.difficultyLevel);
      const calculatedLevel = this.difficultyStringToLevel(difficultyLevel);

      return createSequenceData({
        id: word,
        name: this.cleanSequenceName(String(rawSeq.name ?? word)),
        word,
        beats,
        thumbnails: this.parseThumbnails(rawSeq.thumbnails),
        isFavorite: Boolean(rawSeq.isFavorite),
        isCircular: Boolean(rawSeq.isCircular),
        tags: this.parseTags(rawSeq.tags),
        metadata: this.parseMetadata(rawSeq.metadata),
        author: String(rawSeq.author ?? "Unknown"),
        gridMode,
        difficultyLevel,
        sequenceLength: beats.length,
        level: calculatedLevel,
        dateAdded,
        propType: (rawSeq.propType || "Staff") as PropType,
        startingPositionGroup: (rawSeq.startingPosition ||
          "alpha") as GridPositionGroup,
      });
    } catch (error) {
      console.error(`❌ Failed to parse bundled metadata:`, error);
      return null;
    }
  }

  /**
   * Parse beats from bundled metadata (simplified version)
   * Full parsing is handled by DiscoverMetadataExtractor when needed
   */
  private parseBundledBeats(sequence: unknown[]): BeatData[] {
    // Handle two different metadata formats:
    // Format 1: Has explicit 'beat' field (newer format)
    // Format 2: No 'beat' field, just 'letter' field (older format)

    const beatObjects = sequence.filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
    );

    const beatNumberItems = beatObjects.filter(
      (item): item is Record<string, number> & { beat: number } =>
        typeof item.beat === "number"
    );

    if (beatNumberItems.length > 0) {
      // Format 1: Filter out the start position (beat 0) - only return beats >= 1
      return beatNumberItems
        .filter((item) => item.beat >= 1)
        .map((item) => item as unknown as BeatData);
    } else {
      // Format 2: Count items with 'letter' field
      // Exclude: sequence metadata (has 'word' field) and start position (has 'sequence_start_position')
      const letterItems = beatObjects.filter(
        (item) =>
          Boolean(item.letter) &&
          !("word" in item) &&
          !("sequence_start_position" in item)
      );
      return letterItems as unknown as BeatData[];
    }
  }

  // ============================================================================
  // Data Loading
  // ============================================================================

  private async fetchSequenceIndex(): Promise<RawSequenceData[]> {
    // Allow browser caching - the in-memory cache handles session persistence
    // Browser cache helps when user refreshes the page
    const response = await fetch(SEQUENCE_INDEX_URL);

    if (!response.ok) {
      throw new Error(`Failed to load sequence index: ${response.status}`);
    }

    const data = await response.json();
    return data.sequences || [];
  }

  // ============================================================================
  // Data Processing
  // ============================================================================

  private async processRawSequences(
    rawSequences: RawSequenceData[]
  ): Promise<SequenceData[]> {
    const sequences: SequenceData[] = [];

    for (const rawSeq of rawSequences) {
      const word = this.extractWord(rawSeq);

      if (!this.isValidWord(word)) {
        console.warn(`🚫 Skipping invalid sequence: ${word}`);
        continue;
      }

      // Cache the raw sequence for later lazy loading
      this.sequenceCache.set(word, rawSeq);

      try {
        const sequence = await this.createSequenceFromRaw(rawSeq, word);
        sequences.push(sequence);
      } catch (error) {
        const shouldLog = !this.isRoutineError(error);
        if (shouldLog) {
          console.warn(`⚠️ Failed to process ${word}:`, error);
        }

        // Use fallback sequence creation
        const fallbackSequence = this.createFallbackSequence(rawSeq, word);
        sequences.push(fallbackSequence);
      }
    }

    return sequences;
  }

  // ============================================================================
  // Sequence Creation
  // ============================================================================

  private async createSequenceFromRaw(
    rawSeq: RawSequenceData,
    word: string
  ): Promise<SequenceData> {
    // ⚡ PERFORMANCE FIX: Skip expensive metadata extraction during initial load
    // The sequence-index.json already has all the data we need for the gallery view
    // Full beat data will be loaded lazily when user clicks on a sequence

    const gridMode = this.parseGridMode(rawSeq.gridMode) ?? GridMode.BOX;
    const dateAdded = this.parseDate(rawSeq.dateAdded) ?? new Date();

    // Get difficulty from sequence-index.json (no need to extract from .meta.json)
    const difficultyLevel = this.parseDifficulty(rawSeq.difficultyLevel);

    // Calculate numeric level from difficulty string
    const calculatedLevel = this.difficultyStringToLevel(difficultyLevel);

    return createSequenceData({
      id: word,
      name: this.cleanSequenceName(
        String(rawSeq.name ?? word ?? "Unnamed Sequence")
      ),
      word,
      beats: [], // Empty - will be loaded lazily via loadFullSequenceData()
      thumbnails: this.parseThumbnails(rawSeq.thumbnails),
      isFavorite: Boolean(rawSeq.isFavorite),
      isCircular: Boolean(rawSeq.isCircular),
      tags: this.parseTags(rawSeq.tags),
      metadata: this.parseMetadata(rawSeq.metadata),
      author: String(rawSeq.author ?? "Unknown"),
      gridMode,
      difficultyLevel,
      sequenceLength: this.parseSequenceLength(rawSeq.sequenceLength),
      level: calculatedLevel,
      dateAdded,
      propType: (rawSeq.propType || "Staff") as PropType,
      startingPositionGroup: (rawSeq.startingPosition ||
        "alpha") as GridPositionGroup,
    });
  }

  private createFallbackSequence(
    rawSeq: RawSequenceData,
    word: string
  ): SequenceData {
    const gridMode = this.parseGridMode(rawSeq.gridMode) ?? GridMode.BOX;
    const dateAdded = this.parseDate(rawSeq.dateAdded) ?? new Date();

    // Get difficulty and calculate numeric level
    const difficultyLevel = this.parseDifficulty(rawSeq.difficultyLevel);
    const calculatedLevel = this.difficultyStringToLevel(difficultyLevel);

    return createSequenceData({
      id: word,
      name: this.cleanSequenceName(
        String(rawSeq.name ?? word ?? "Unnamed Sequence")
      ),
      word,
      beats: [],
      thumbnails: this.parseThumbnails(rawSeq.thumbnails),
      isFavorite: Boolean(rawSeq.isFavorite),
      isCircular: Boolean(rawSeq.isCircular),
      tags: this.parseTags(rawSeq.tags),
      metadata: this.parseMetadata(rawSeq.metadata),
      author: String(rawSeq.author ?? "Unknown"),
      gridMode,
      difficultyLevel,
      sequenceLength: this.parseSequenceLength(rawSeq.sequenceLength),
      level: calculatedLevel, // Use calculated level instead of old stored value
      dateAdded,
      propType: (rawSeq.propType || "Staff") as PropType,
      startingPositionGroup: (rawSeq.startingPosition ||
        "alpha") as GridPositionGroup,
    });
  }

  // ============================================================================
  // Validation
  // ============================================================================

  private extractWord(rawSeq: RawSequenceData): string {
    return rawSeq.word ?? rawSeq.name ?? rawSeq.id ?? "";
  }

  private isValidWord(word: string): boolean {
    return (
      word.length > 0 &&
      word.length <= MAX_WORD_LENGTH &&
      !word.toLowerCase().includes("test")
    );
  }

  private isRoutineError(error: unknown): boolean {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return errorMessage.includes("No valid version found");
  }

  // ============================================================================
  // Data Parsing Helpers
  // ============================================================================

  private parseThumbnails(value: unknown): string[] {
    return Array.isArray(value) ? (value as string[]) : [];
  }

  private parseTags(value: unknown): string[] {
    return Array.isArray(value) ? (value as string[]) : ["flow", "practice"];
  }

  private parseMetadata(value: unknown): Record<string, unknown> {
    return typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : { source: "tka_dictionary" };
  }

  private parseGridMode(value: unknown): GridMode | null {
    if (!value) return null;

    if (typeof value === "string") {
      const normalized = value.toLowerCase();
      if (normalized === "gridmode.diamond" || normalized === "diamond") {
        return GridMode.DIAMOND;
      }
      if (normalized === "gridmode.box" || normalized === "box") {
        return GridMode.BOX;
      }
    }

    return value as GridMode;
  }

  private parseDifficulty(value: unknown): string {
    return typeof value === "string" ? value : "beginner";
  }

  private parseSequenceLength(value: unknown): number {
    return typeof value === "number" ? value : 0;
  }

  /**
   * Convert difficulty string to numeric level for SequenceCard styling
   * This ensures the card uses the NEW calculated difficulty, not old stored values
   */
  private difficultyStringToLevel(difficulty: string): number {
    const normalized = difficulty.toLowerCase();
    switch (normalized) {
      case "beginner":
        return 1;
      case "intermediate":
        return 2;
      case "advanced":
        return 3;
      case "mythic":
        return 4;
      case "legendary":
        return 5;
      default:
        return 1; // Default to beginner
    }
  }

  private parseDate(value: unknown): Date | null {
    if (!value) return null;

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === "string") {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }

    return null;
  }

  /**
   * Remove " Sequence" suffix from sequence names
   */
  private cleanSequenceName(name: string): string {
    return name.replace(/\s+Sequence$/i, "");
  }
}
