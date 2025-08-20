/**
 * CSV Movement Loader Service - Loads movement data from CSV files
 *
 * Simple service for loading movement data from CSV files.
 * Can be enhanced with actual CSV loading functionality as needed.
 */

import type { MovementData } from "$lib/domain/MovementData";

export interface ICSVMovementLoaderService {
  getMovementsForLetter(letter: string): MovementData[];
  getAvailableLetters(): string[];
  getMovementCounts(): Record<string, number>;
  clearCache(): void;
}

export class CSVMovementLoaderService implements ICSVMovementLoaderService {
  private readonly movementCache = new Map<string, MovementData[]>();
  private readonly availableLetters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];

  constructor() {
    // Initialize with empty cache
  }

  /**
   * Get movements for a specific letter
   */
  getMovementsForLetter(letter: string): MovementData[] {
    if (this.movementCache.has(letter)) {
      return this.movementCache.get(letter) || [];
    }

    // TODO: Implement actual CSV loading
    // For now, return empty array
    const movements: MovementData[] = [];
    this.movementCache.set(letter, movements);
    return movements;
  }

  /**
   * Get all available letters
   */
  getAvailableLetters(): string[] {
    return [...this.availableLetters];
  }

  /**
   * Get movement counts for each letter
   */
  getMovementCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const letter of this.availableLetters) {
      counts[letter] = this.getMovementsForLetter(letter).length;
    }
    return counts;
  }

  /**
   * Clear the movement cache
   */
  clearCache(): void {
    this.movementCache.clear();
  }
}
