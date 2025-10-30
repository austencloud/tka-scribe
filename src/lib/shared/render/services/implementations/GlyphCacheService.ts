/**
 * Glyph Cache Service
 *
 * Pre-loads and caches all letter SVG glyphs to eliminate network requests
 * during sequence preview rendering. This dramatically improves performance
 * by converting external <image> references to inline data URLs.
 */

import { injectable } from 'inversify';
import { getLetterImagePath } from '$shared/pictograph/tka-glyph/utils';
import { Letter } from '$shared';

export interface IGlyphCacheService {
  /**
   * Initialize the cache by preloading all glyphs
   */
  initialize(): Promise<void>;

  /**
   * Get a cached glyph as a data URL
   * @param letter The letter to get
   * @returns Base64 data URL or null if not cached
   */
  getGlyphDataUrl(letter: string): string | null;

  /**
   * Check if the cache is ready
   */
  isReady(): boolean;

  /**
   * Get cache statistics
   */
  getStats(): { total: number; loaded: number; failed: number };
}

@injectable()
export class GlyphCacheService implements IGlyphCacheService {
  private cache = new Map<string, string>();
  private ready = false;
  private loadedCount = 0;
  private failedCount = 0;

  // All possible TKA letters across all types
  private readonly LETTERS_TO_CACHE: Letter[] = [
    // Latin letters (Type1, Type2)
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    // Common motion letters
    'Δ', 'X-', 'Γ', 'Σ', 'Ω', 'Φ',
    // Greek letters
    'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ',
    'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω',
  ] as Letter[];

  async initialize(): Promise<void> {
    if (this.ready) {
      console.log('✅ GlyphCache: Already initialized');
      return;
    }

    console.log(`🔄 GlyphCache: Preloading ${this.LETTERS_TO_CACHE.length} glyphs...`);
    const startTime = performance.now();

    // Load all glyphs in parallel (max 10 at a time to avoid overwhelming the browser)
    const BATCH_SIZE = 10;
    for (let i = 0; i < this.LETTERS_TO_CACHE.length; i += BATCH_SIZE) {
      const batch = this.LETTERS_TO_CACHE.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(letter => this.loadGlyph(letter)));
    }

    this.ready = true;
    const duration = performance.now() - startTime;

    console.log(`✅ GlyphCache: Initialized in ${duration.toFixed(0)}ms`);
    console.log(`   Loaded: ${this.loadedCount}, Failed: ${this.failedCount}`);
  }

  private async loadGlyph(letter: Letter): Promise<void> {
    try {
      const path = getLetterImagePath(letter);
      const response = await fetch(path);

      if (!response.ok) {
        // Some letters might not exist in all types - that's OK
        this.failedCount++;
        return;
      }

      const svgContent = await response.text();

      // Convert to base64 data URL for inline embedding
      const dataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;

      // Cache both the original path and the letter as keys
      this.cache.set(letter, dataUrl);
      this.cache.set(path, dataUrl);
      this.loadedCount++;
    } catch (error) {
      console.warn(`Failed to load glyph "${letter}":`, error);
      this.failedCount++;
    }
  }

  getGlyphDataUrl(letter: string): string | null {
    return this.cache.get(letter) || null;
  }

  isReady(): boolean {
    return this.ready;
  }

  getStats() {
    return {
      total: this.LETTERS_TO_CACHE.length,
      loaded: this.loadedCount,
      failed: this.failedCount,
    };
  }
}
