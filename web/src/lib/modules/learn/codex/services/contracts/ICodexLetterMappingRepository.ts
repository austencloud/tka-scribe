import type {
  CodexLetterMapping,
  CodexLetterRow,
} from "$lib/modules/learn/codex/domain";

export interface ICodexLetterMappingRepo {
  initialize(): Promise<void>;

  getLetterMapping(letter: string): CodexLetterMapping | null;

  getLetterRows(): CodexLetterRow[];

  getAllLetters(): string[];

  isValidLetter(letter: string): boolean;
}
