/**
 * Letter Generator Factory
 *
 * Creates appropriate letter generators for each letter.
 * Handles registration and instantiation of all letter generators.
 */

import type { BaseLetterGenerator } from "../core/BaseLetterGenerator";
import type {
  ILetterGenerator,
  ILetterGeneratorFactory,
} from "../../../interfaces/generation-interfaces";
import { Type1Generator } from "./Type1/Type1Generator";

type LetterGeneratorConstructor = new (
  letter: string,
  patternService: import("../../../interfaces/generation-interfaces").IPositionPatternService,
  positionCalculator: import("../../../interfaces/generation-interfaces").IDirectionCalculator,
  validator: import("../../../interfaces/generation-interfaces").IPictographValidatorService
) => BaseLetterGenerator;

export class LetterGeneratorFactory implements ILetterGeneratorFactory {
  private readonly generatorClasses = new Map<
    string,
    LetterGeneratorConstructor
  >();

  constructor(
    private readonly patternService: import("../../../interfaces/generation-interfaces").IPositionPatternService,
    private readonly positionCalculator: import("../../../interfaces/generation-interfaces").IDirectionCalculator,
    private readonly validator: import("../../../interfaces/generation-interfaces").IPictographValidatorService
  ) {
    this.registerGenerators();
  }

  createGenerator(letter: string): ILetterGenerator | null {
    const GeneratorClass = this.generatorClasses.get(letter.toUpperCase());
    if (!GeneratorClass) {
      return null;
    }

    return new GeneratorClass(
      letter.toUpperCase(),
      this.patternService,
      this.positionCalculator,
      this.validator
    );
  }

  getSupportedLetters(): string[] {
    return Array.from(this.generatorClasses.keys()).sort();
  }

  private registerGenerators(): void {
    // Register all Type 1 letters (A-V) with the unified Type1Generator
    const type1Letters = Type1Generator.getSupportedLetters();
    for (const letter of type1Letters) {
      this.generatorClasses.set(letter, Type1Generator);
    }

    // TODO: Add Type 2 generators
    // Type 2 - Gamma to Alpha letters (W, X)
    // Type 2 - Gamma to Beta letters (Y, Z)

    // TODO: Add Greek letters and dash variants
  }
}
