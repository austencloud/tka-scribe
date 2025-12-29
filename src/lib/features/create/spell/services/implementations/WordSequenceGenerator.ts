/**
 * Word Sequence Generator Implementation
 *
 * Converts typed words into valid TKA sequences with bridge letters.
 */

import { inject, injectable } from "inversify";
import { Letter } from "$lib/shared/foundation/domain/models/Letter";
import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";
import { TYPES } from "$lib/shared/inversify/types";
import type { ILetterQueryHandler } from "$lib/shared/foundation/services/contracts/data/data-contracts";
import type { IBeatConverter } from "$lib/features/create/generate/shared/services/contracts/IBeatConverter";
import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { IWordSequenceGenerator } from "../contracts/IWordSequenceGenerator";
import type { ILetterTransitionGraph } from "../contracts/ILetterTransitionGraph";
import type {
  SpellGenerationOptions,
  SpellResult,
  LetterSource,
} from "../../domain/models/spell-models";
import {
  GREEK_LETTER_ALIASES,
  MAX_WORD_LENGTH,
} from "../../domain/constants/spell-constants";
import { DifficultyLevel } from "$lib/features/create/generate/shared/domain/models/generate-models";
import { SPELL_TYPES } from "./spell-types";

@injectable()
export class WordSequenceGenerator implements IWordSequenceGenerator {
  constructor(
    @inject(SPELL_TYPES.ILetterTransitionGraph)
    private transitionGraph: ILetterTransitionGraph,
    @inject(TYPES.ILetterQueryHandler)
    private letterQueryHandler: ILetterQueryHandler,
    @inject(TYPES.IBeatConverter)
    private beatConverter: IBeatConverter
  ) {}

  async generateFromWord(options: SpellGenerationOptions): Promise<SpellResult> {
    // Validate word
    const validation = this.validateWord(options.word);
    if (!validation.valid) {
      return this.createErrorResult(options.word, validation.error || "Invalid word");
    }

    // Parse word into letters
    const parseResult = this.parseWord(options.word);
    if (!parseResult) {
      return this.createErrorResult(options.word, "Failed to parse word");
    }

    const { letters } = parseResult;

    // Ensure transition graph is initialized
    if (!this.transitionGraph.isInitialized()) {
      await this.transitionGraph.initialize();
    }

    try {
      // Build expanded letter sequence with bridge letters
      const { expandedLetters, letterSources } = this.buildExpandedSequence(
        letters,
        options.preferences.maxBridgeLetters
      );

      if (expandedLetters.length === 0) {
        return this.createErrorResult(options.word, "No letters to generate");
      }

      const firstLetter = expandedLetters[0]!;

      // Get start position for first letter
      const gridMode = GridMode.DIAMOND; // Default for now
      const startPosition = await this.selectStartPosition(
        firstLetter,
        gridMode
      );

      if (!startPosition) {
        return this.createErrorResult(
          options.word,
          `Could not find start position for letter ${firstLetter}`
        );
      }

      // Generate beats for each letter
      const beats = await this.generateBeats(
        expandedLetters,
        startPosition,
        gridMode
      );

      if (beats.length === 0) {
        return this.createErrorResult(
          options.word,
          "Failed to generate beats for sequence"
        );
      }

      // Build sequence data
      const sequence = this.buildSequenceData(
        options.word,
        startPosition,
        beats,
        gridMode
      );

      // Build expanded word string
      const expandedWord = expandedLetters.join("");

      return {
        sequence,
        originalWord: options.word,
        expandedWord,
        letterSources,
        success: true,
      };
    } catch (error) {
      return this.createErrorResult(
        options.word,
        `Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  parseWord(word: string): { letters: Letter[]; error?: string } | null {
    const letters: Letter[] = [];
    let i = 0;

    while (i < word.length) {
      // Try to match Greek letter aliases (longest match first)
      let matched = false;

      // Sort aliases by length descending to match longest first
      const sortedAliases = [...GREEK_LETTER_ALIASES].sort(
        (a, b) => b.alias.length - a.alias.length
      );

      for (const { alias, letter } of sortedAliases) {
        const remaining = word.slice(i).toLowerCase();
        if (remaining.startsWith(alias.toLowerCase())) {
          letters.push(letter);
          i += alias.length;
          matched = true;
          break;
        }
      }

      if (!matched) {
        // Try single character match
        const char = word.charAt(i);
        if (!char) {
          i++;
          continue;
        }
        const upperChar = char.toUpperCase();

        // Check if it's a direct Letter enum value
        const letterValues = Object.values(Letter) as string[];
        if (letterValues.includes(upperChar)) {
          letters.push(upperChar as Letter);
          i++;
        } else if (letterValues.includes(char)) {
          // Greek symbols like Σ, Δ, etc.
          letters.push(char as Letter);
          i++;
        } else {
          // Skip spaces and unknown characters for now
          if (char === " " || char === "-") {
            i++;
          } else {
            return { letters: [], error: `Unknown character: ${char}` };
          }
        }
      }
    }

    return { letters };
  }

  validateWord(word: string): { valid: boolean; error?: string } {
    if (!word || word.trim().length === 0) {
      return { valid: false, error: "Word cannot be empty" };
    }

    if (word.length > MAX_WORD_LENGTH * 3) {
      // Allow for Greek aliases which are longer
      return {
        valid: false,
        error: `Word is too long (max ${MAX_WORD_LENGTH} letters)`,
      };
    }

    const parseResult = this.parseWord(word);
    if (!parseResult || parseResult.error) {
      return { valid: false, error: parseResult?.error || "Invalid characters" };
    }

    if (parseResult.letters.length === 0) {
      return { valid: false, error: "No valid letters found" };
    }

    if (parseResult.letters.length > MAX_WORD_LENGTH) {
      return {
        valid: false,
        error: `Word has too many letters (max ${MAX_WORD_LENGTH}, got ${parseResult.letters.length})`,
      };
    }

    return { valid: true };
  }

  /**
   * Build the expanded letter sequence with bridge letters inserted
   */
  private buildExpandedSequence(
    originalLetters: Letter[],
    maxBridgeLetters: number
  ): { expandedLetters: Letter[]; letterSources: LetterSource[] } {
    const expandedLetters: Letter[] = [];
    const letterSources: LetterSource[] = [];

    for (let i = 0; i < originalLetters.length; i++) {
      const letter = originalLetters[i];
      if (!letter) continue;

      if (i === 0) {
        // First letter - just add it
        expandedLetters.push(letter);
        letterSources.push({
          letter,
          isOriginal: true,
          beatIndex: expandedLetters.length,
        });
      } else {
        // Check if we need bridge letters
        const prevLetter = expandedLetters[expandedLetters.length - 1];
        if (!prevLetter) continue;

        const bridgeLetters = this.transitionGraph.findBridgeLetters(
          prevLetter,
          letter
        );

        // Add bridge letters (up to max)
        const bridgesToAdd = bridgeLetters.slice(0, maxBridgeLetters);
        for (const bridge of bridgesToAdd) {
          expandedLetters.push(bridge);
          letterSources.push({
            letter: bridge,
            isOriginal: false,
            beatIndex: expandedLetters.length,
          });
        }

        // Add the original letter
        expandedLetters.push(letter);
        letterSources.push({
          letter,
          isOriginal: true,
          beatIndex: expandedLetters.length,
        });
      }
    }

    return { expandedLetters, letterSources };
  }

  /**
   * Select a start position that works for the first letter
   */
  private async selectStartPosition(
    firstLetter: Letter,
    gridMode: GridMode
  ): Promise<PictographData | null> {
    const startGroup = this.transitionGraph.getStartPositionGroup(firstLetter);
    if (!startGroup) return null;

    // Get all pictograph variations
    const allPictographs =
      await this.letterQueryHandler.getAllPictographVariations(gridMode);

    // Find a static start position that ends at the required group
    // Start positions are pictographs where startPosition === endPosition
    const startPositions = allPictographs.filter((p) => {
      const endPos = this.getEndPosition(p);
      const endGroup = this.positionToGroup(endPos);
      return endGroup === startGroup && this.isStartPositionPictograph(p);
    });

    if (startPositions.length > 0) {
      // Return random start position
      const randomIndex = Math.floor(Math.random() * startPositions.length);
      return startPositions[randomIndex] ?? null;
    }

    // Fallback: return any pictograph that ends at the right group
    const fallback = allPictographs.find((p) => {
      const endPos = this.getEndPosition(p);
      return this.positionToGroup(endPos) === startGroup;
    });

    return fallback ?? null;
  }

  /**
   * Generate beats for the expanded letter sequence
   */
  private async generateBeats(
    letters: Letter[],
    startPosition: PictographData,
    gridMode: GridMode
  ): Promise<BeatData[]> {
    const beats: BeatData[] = [];
    let lastPictograph = startPosition;

    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i];
      if (!letter) continue;

      // Get pictograph for this letter
      const pictograph = await this.findPictographForLetter(
        letter,
        lastPictograph,
        gridMode
      );

      if (!pictograph) {
        console.warn(`Could not find pictograph for letter ${letter}`);
        continue;
      }

      // Convert to beat
      const beat = this.beatConverter.convertToBeat(pictograph, i + 1, gridMode);
      beats.push(beat);
      lastPictograph = pictograph;
    }

    return beats;
  }

  /**
   * Find a pictograph for a letter that can follow the last pictograph
   */
  private async findPictographForLetter(
    letter: Letter,
    lastPictograph: PictographData,
    gridMode: GridMode
  ): Promise<PictographData | null> {
    // Get the pictograph for this letter
    const pictograph = await this.letterQueryHandler.getPictographByLetter(
      letter,
      gridMode
    );

    if (pictograph) {
      return pictograph;
    }

    // Fallback: search all variations
    const allPictographs =
      await this.letterQueryHandler.getAllPictographVariations(gridMode);
    const matching = allPictographs.find((p) => p.letter === letter);

    return matching || null;
  }

  /**
   * Build the final SequenceData object
   */
  private buildSequenceData(
    name: string,
    startPosition: PictographData,
    beats: BeatData[],
    gridMode: GridMode
  ): SequenceData {
    const startPositionData = this.beatConverter.convertToStartPosition(
      startPosition,
      gridMode
    );

    return {
      id: crypto.randomUUID(),
      name,
      word: beats.map((b) => b.letter || "").join(""),
      beats,
      startingPositionBeat: startPositionData,
      gridMode,
      propType: PropType.STAFF,
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      isCircular: false,
      isFavorite: false,
      thumbnails: [],
      tags: ["generated", "spell"],
      metadata: {
        createdAt: new Date().toISOString(),
        source: "spell",
      },
    };
  }

  private createErrorResult(word: string, error: string): SpellResult {
    return {
      sequence: null as unknown as SequenceData,
      originalWord: word,
      expandedWord: "",
      letterSources: [],
      success: false,
      error,
    };
  }

  private getEndPosition(pictograph: PictographData): string {
    return pictograph.endPosition || "";
  }

  private positionToGroup(position: string): string | null {
    if (!position) return null;
    if (position.startsWith("alpha")) return "alpha";
    if (position.startsWith("beta")) return "beta";
    if (position.startsWith("gamma")) return "gamma";
    return null;
  }

  private isStartPositionPictograph(pictograph: PictographData): boolean {
    return pictograph.startPosition === pictograph.endPosition;
  }
}
