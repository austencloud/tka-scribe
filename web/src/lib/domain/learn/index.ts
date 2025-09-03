/**
 * Learn Domain Exports
 *
 * All types, models, and enums related to learning functionality.
 */

// Models
export * from "./models";

// Types
export * from "./types";

// Additional commonly needed types for learn services
export interface ILessonRepository {
  findById(id: string): Promise<unknown>;
  findAll(): Promise<unknown[]>;
  save(lesson: unknown): Promise<void>;
  initialize(): Promise<void>;
  getLettersForLesson(lessonId: string): Promise<unknown[]>;
  getAllLessonTypes(): Promise<string[]>;
}

export interface ILetterMappingRepository {
  findByLetter(letter: string): Promise<unknown>;
  findAll(): Promise<unknown[]>;
  save(mapping: unknown): Promise<void>;
  initialize(): Promise<void>;
  getLetterRows(): Promise<unknown[]>;
  getAllLetters(): Promise<unknown[]>;
  getLettersByCategory(category: string): Promise<unknown[]>;
  isValidLetter(letter: string): boolean;
}

export interface LetterIdentificationResult {
  letter: string;
  confidence: number;
  alternatives: { letter: string; confidence: number }[];
}
