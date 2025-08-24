/**
 * Mock implementations for Codex services
 *
 * Used for testing to provide predictable data without external dependencies.
 */

import type {
  LessonConfiguration,
  LetterCategory,
  LetterMapping,
  LetterRow,
} from "$lib/domain/codex/types";
import type { ILessonRepository } from "$lib/repositories/LessonRepository";
import type { ILetterMappingRepository } from "$lib/repositories/LetterMappingRepository";

/**
 * Mock Letter Mapping Repository for testing
 */
export class MockLetterMappingRepository implements ILetterMappingRepository {
  private mockLetters: Record<string, LetterMapping> = {
    A: {
      startPosition: "alpha1",
      endPosition: "alpha3",
      blueMotionType: "pro",
      redMotionType: "pro",
      blueHandPath: "clockwise",
      redHandPath: "clockwise",
    },
    B: {
      startPosition: "alpha2",
      endPosition: "alpha4",
      blueMotionType: "pro",
      redMotionType: "pro",
      blueHandPath: "clockwise",
      redHandPath: "clockwise",
    },
    C: {
      startPosition: "alpha3",
      endPosition: "alpha5",
      blueMotionType: "pro",
      redMotionType: "pro",
      blueHandPath: "clockwise",
      redHandPath: "clockwise",
    },
    Σ: {
      startPosition: "alpha4",
      endPosition: "alpha6",
      blueMotionType: "shift",
      redMotionType: "shift",
      blueHandPath: "clockwise",
      redHandPath: "clockwise",
    },
    Δ: {
      startPosition: "alpha5",
      endPosition: "alpha7",
      blueMotionType: "shift",
      redMotionType: "shift",
      blueHandPath: "clockwise",
      redHandPath: "clockwise",
    },
    Φ: {
      startPosition: "alpha1",
      endPosition: "alpha1",
      blueMotionType: "dash",
      redMotionType: "dash",
      blueHandPath: "static",
      redHandPath: "static",
    },
    α: {
      startPosition: "alpha1",
      endPosition: "alpha1",
      blueMotionType: "static",
      redMotionType: "static",
      blueHandPath: "static",
      redHandPath: "static",
    },
    β: {
      startPosition: "alpha2",
      endPosition: "alpha2",
      blueMotionType: "static",
      redMotionType: "static",
      blueHandPath: "static",
      redHandPath: "static",
    },
  };

  private mockRows: LetterRow[] = [
    {
      letters: ["A", "B", "C"],
      category: "basic",
    },
    {
      letters: ["Σ", "Δ"],
      category: "greek",
    },
    {
      letters: ["Φ"],
      category: "dash",
    },
    {
      letters: ["α", "β"],
      category: "static",
    },
  ];

  async initialize(): Promise<void> {
    // Mock initialization - no-op
  }

  getLetterMapping(letter: string): LetterMapping | null {
    return this.mockLetters[letter] || null;
  }

  getLettersByCategory(category: LetterCategory): string[] {
    const row = this.mockRows.find((r) => r.category === category);
    return row ? [...row.letters] : [];
  }

  getLetterRows(): LetterRow[] {
    return [...this.mockRows];
  }

  getAllLetters(): string[] {
    return Object.keys(this.mockLetters);
  }

  isValidLetter(letter: string): boolean {
    return letter in this.mockLetters;
  }
}

/**
 * Mock Lesson Repository for testing
 */
export class MockLessonRepository implements ILessonRepository {
  private mockLessons: Record<string, LessonConfiguration> = {
    basic_pro_anti: {
      name: "Basic Pro/Anti",
      description: "Basic letters with pro and anti motions",
      categories: ["basic"],
      excludeLetters: [],
      includeLetters: [],
    },
    all_letters: {
      name: "All Letters",
      description: "All available letters",
      categories: ["basic", "dash", "static"],
      excludeLetters: [],
      includeLetters: [],
    },
    beginner: {
      name: "Beginner",
      description: "Beginner-friendly letters",
      categories: [],
      excludeLetters: [],
      includeLetters: ["A", "B", "C", "G", "H", "I", "M", "N", "O"],
    },
  };

  constructor(private letterMappingRepo: ILetterMappingRepository) {}

  async initialize(): Promise<void> {
    // Mock initialization - no-op
  }

  getLessonConfiguration(lessonType: string): LessonConfiguration | null {
    return this.mockLessons[lessonType] || null;
  }

  getAllLessonTypes(): string[] {
    return Object.keys(this.mockLessons);
  }

  getLettersForLesson(lessonType: string): string[] {
    const lesson = this.mockLessons[lessonType];
    if (!lesson) return [];

    // If specific letters are included, return those
    if (lesson.includeLetters && lesson.includeLetters.length > 0) {
      return [...lesson.includeLetters];
    }

    // Otherwise, get letters by categories
    let letters: string[] = [];
    for (const category of lesson.categories) {
      letters.push(...this.letterMappingRepo.getLettersByCategory(category));
    }

    // Remove excluded letters
    if (lesson.excludeLetters && lesson.excludeLetters.length > 0) {
      letters = letters.filter(
        (letter) => !lesson.excludeLetters!.includes(letter)
      );
    }

    return letters;
  }

  getLessonCategories(lessonType: string): LetterCategory[] {
    const lesson = this.mockLessons[lessonType];
    return lesson ? [...lesson.categories] : [];
  }
}
