/**
 * Mock Configuration Repository for Testing
 *
 * Provides in-memory implementations of repositories for testing
 * without requiring actual JSON file fetching.
 */

import type { ILetterMappingRepository } from "$lib/repositories/LetterMappingRepository";
import type { ILessonRepository } from "$lib/repositories/LessonRepository";
import type {
  CodexConfiguration,
  LetterMapping,
  LetterCategory,
  LetterRow,
  LessonConfiguration,
} from "$lib/domain/codex/types";

// Mock data that matches our JSON files
const MOCK_LETTER_MAPPINGS: CodexConfiguration = {
  letters: {
    A: {
      startPos: "alpha1",
      endPos: "alpha3",
      blueMotion: "pro",
      redMotion: "pro",
    },
    B: {
      startPos: "alpha1",
      endPos: "alpha3",
      blueMotion: "anti",
      redMotion: "anti",
    },
    C: {
      startPos: "alpha1",
      endPos: "alpha3",
      blueMotion: "anti",
      redMotion: "pro",
    },
    G: {
      startPos: "beta3",
      endPos: "beta5",
      blueMotion: "pro",
      redMotion: "pro",
    },
    H: {
      startPos: "beta3",
      endPos: "beta5",
      blueMotion: "anti",
      redMotion: "anti",
    },
    I: {
      startPos: "beta3",
      endPos: "beta5",
      blueMotion: "anti",
      redMotion: "pro",
    },
    M: {
      startPos: "gamma11",
      endPos: "gamma1",
      blueMotion: "pro",
      redMotion: "pro",
    },
    N: {
      startPos: "gamma11",
      endPos: "gamma1",
      blueMotion: "anti",
      redMotion: "anti",
    },
    O: {
      startPos: "gamma11",
      endPos: "gamma1",
      blueMotion: "anti",
      redMotion: "pro",
    },
    Σ: {
      startPos: "alpha3",
      endPos: "gamma13",
      blueMotion: "static",
      redMotion: "pro",
    },
    Δ: {
      startPos: "alpha3",
      endPos: "gamma13",
      blueMotion: "static",
      redMotion: "anti",
    },
    Φ: {
      startPos: "beta7",
      endPos: "alpha3",
      blueMotion: "static",
      redMotion: "dash",
    },
    α: {
      startPos: "alpha3",
      endPos: "alpha3",
      blueMotion: "static",
      redMotion: "static",
    },
    β: {
      startPos: "beta5",
      endPos: "beta5",
      blueMotion: "static",
      redMotion: "static",
    },
  },
  rows: [
    { index: 0, category: "basic", letters: ["A", "B", "C"] },
    { index: 1, category: "basic", letters: ["G", "H", "I"] },
    { index: 2, category: "basic", letters: ["M", "N", "O"] },
    { index: 3, category: "greek", letters: ["Σ", "Δ"] },
    { index: 4, category: "special", letters: ["Φ"] },
    { index: 5, category: "static", letters: ["α", "β"] },
  ],
  categories: {
    basic: ["A", "B", "C", "G", "H", "I", "M", "N", "O"],
    extended: [],
    greek: ["Σ", "Δ"],
    dash: [],
    special: ["Φ"],
    dual_dash: [],
    static: ["α", "β"],
  },
};

const MOCK_LESSON_CONFIGURATIONS: LessonConfiguration[] = [
  {
    type: "basic_pro_anti",
    name: "Basic Pro & Anti",
    description: "Learn the fundamental pro and anti motions",
    includedCategories: ["basic"],
  },
  {
    type: "beginner",
    name: "Beginner Set",
    description: "Easy letters for beginners",
    includedCategories: [],
    includedLetters: ["A", "B", "C", "G", "H", "I", "M", "N", "O"],
  },
  {
    type: "all_letters",
    name: "Complete Codex",
    description: "Practice with all available letters",
    includedCategories: ["basic", "greek", "special", "static"],
  },
];

export class MockLetterMappingRepository implements ILetterMappingRepository {
  private initialized = false;

  async initialize(): Promise<void> {
    this.initialized = true;
    console.log("✅ Mock letter mapping repository initialized");
  }

  getLetterMapping(letter: string): LetterMapping | null {
    this.ensureInitialized();
    return MOCK_LETTER_MAPPINGS.letters[letter] || null;
  }

  getAllLetterMappings(): Record<string, LetterMapping> {
    this.ensureInitialized();
    return { ...MOCK_LETTER_MAPPINGS.letters };
  }

  getLettersByCategory(category: LetterCategory): string[] {
    this.ensureInitialized();
    return [...(MOCK_LETTER_MAPPINGS.categories[category] || [])];
  }

  getLetterRows(): LetterRow[] {
    this.ensureInitialized();
    return [...MOCK_LETTER_MAPPINGS.rows];
  }

  getAllLetters(): string[] {
    this.ensureInitialized();
    return Object.keys(MOCK_LETTER_MAPPINGS.letters);
  }

  isValidLetter(letter: string): boolean {
    this.ensureInitialized();
    return letter in MOCK_LETTER_MAPPINGS.letters;
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        "Mock letter mapping repository not initialized. Call initialize() first."
      );
    }
  }
}

export class MockLessonRepository implements ILessonRepository {
  private configurations: Map<string, LessonConfiguration> = new Map();
  private initialized = false;

  constructor(private letterMappingRepository: ILetterMappingRepository) {}

  async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.letterMappingRepository.initialize();

    MOCK_LESSON_CONFIGURATIONS.forEach((config) => {
      this.configurations.set(config.type, config);
    });

    this.initialized = true;
    console.log("✅ Mock lesson repository initialized");
  }

  getLessonConfiguration(lessonType: string): LessonConfiguration | null {
    this.ensureInitialized();
    return this.configurations.get(lessonType) || null;
  }

  getAllLessonTypes(): string[] {
    this.ensureInitialized();
    return Array.from(this.configurations.keys());
  }

  getLettersForLesson(lessonType: string): string[] {
    this.ensureInitialized();

    const config = this.configurations.get(lessonType);
    if (!config) {
      console.warn(`Unknown lesson type: ${lessonType}`);
      return [];
    }

    let letters: string[] = [];

    // Include letters from categories
    if (config.includedCategories) {
      for (const category of config.includedCategories) {
        const categoryLetters =
          this.letterMappingRepository.getLettersByCategory(category);
        letters.push(...categoryLetters);
      }
    }

    // Include specific letters
    if (config.includedLetters) {
      letters.push(...config.includedLetters);
    }

    // Remove duplicates
    letters = [...new Set(letters)];

    // Exclude specific letters
    if (config.excludedLetters) {
      letters = letters.filter(
        (letter) => !config.excludedLetters?.includes(letter)
      );
    }

    // Validate that all letters exist in mapping
    return letters.filter((letter) =>
      this.letterMappingRepository.isValidLetter(letter)
    );
  }

  getLessonCategories(lessonType: string): LetterCategory[] {
    this.ensureInitialized();

    const config = this.configurations.get(lessonType);
    return config?.includedCategories || [];
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        "Mock lesson repository not initialized. Call initialize() first."
      );
    }
  }
}
