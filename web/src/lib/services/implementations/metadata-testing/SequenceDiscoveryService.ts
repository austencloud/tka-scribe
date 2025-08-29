/**
 * Sequence Discovery Service
 *
 * Responsible for discovering available sequences from various sources.
 * Handles API calls, file system checks, and known sequence lists.
 */

import type { ThumbnailFile } from "$lib/domain/metadata-testing/types";

export interface ISequenceDiscoveryService {
  discoverSequences(): Promise<ThumbnailFile[]>;
  validateSequenceFile(filePath: string): Promise<boolean>;
}

export class SequenceDiscoveryService implements ISequenceDiscoveryService {
  private readonly knownSequences = [
    "ABC",
    "A",
    "CAKE",
    "ALPHA",
    "EPSILON",
    "ETA",
    "MU",
    "B",
    "C",
    "DJ",
    "DJII",
    "DKIIEJII",
    "EJ",
    "EK",
    "FJ",
    "FL",
    "FLII",
    "G",
    "H",
    "I",
    "JD",
    "JGG",
    "KE",
    "LF",
    "MOON",
    "MP",
    "NQ",
    "OR",
    "OT",
    "PQV",
    "QT",
    "RT",
    "S",
    "T",
    "U",
    "V",
    "POSSUM",
    "OPOSSUM",
    "OPPOSSUM",
  ];

  async discoverSequences(): Promise<ThumbnailFile[]> {
    console.log("🔍 Starting sequence discovery...");

    // Try API first
    const apiSequences = await this.discoverFromAPI();
    if (apiSequences.length > 0) {
      console.log(`✅ Found ${apiSequences.length} sequences from API`);
      return apiSequences;
    }

    // Fallback to manual discovery
    console.log("📡 API not available, using manual discovery...");
    const manualSequences = await this.discoverFromKnownList();
    console.log(`🎯 Found ${manualSequences.length} sequences manually`);

    return manualSequences;
  }

  async validateSequenceFile(filePath: string): Promise<boolean> {
    try {
      const response = await fetch(filePath, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async discoverFromAPI(): Promise<ThumbnailFile[]> {
    try {
      const response = await fetch("/api/sequences");
      if (!response.ok) return [];

      const data = await response.json();
      if (!data.success || !Array.isArray(data.sequences)) return [];

      // Filter out test sequences
      return data.sequences.filter((seq: ThumbnailFile) =>
        this.isValidSequence(seq.word)
      );
    } catch (error) {
      console.log("API discovery failed:", error);
      return [];
    }
  }

  private async discoverFromKnownList(): Promise<ThumbnailFile[]> {
    const validSequences = this.knownSequences.filter(this.isValidSequence);
    const thumbnails: ThumbnailFile[] = [];

    for (const sequenceName of validSequences) {
      const filePath = `/dictionary/${sequenceName}/${sequenceName}_ver1.png`;

      if (await this.validateSequenceFile(filePath)) {
        thumbnails.push({
          name: `${sequenceName}_ver1.png`,
          path: filePath,
          word: sequenceName,
        });
        console.log(`✅ Found: ${sequenceName}`);
      } else {
        console.log(`❌ Not found: ${sequenceName}`);
      }
    }

    // Sort alphabetically
    return thumbnails.sort((a, b) => a.word.localeCompare(b.word));
  }

  private isValidSequence(word: string): boolean {
    return !word.includes("_") && word !== "A_A" && word.length > 0;
  }
}
