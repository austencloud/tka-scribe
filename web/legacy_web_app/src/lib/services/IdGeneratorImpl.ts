/**
 * ID Generator Implementation
 */

import { Injectable } from "$legacyLib/core/di/ServiceDecorator";
import { SERVICE_TOKENS } from "$legacyLib/core/di/ServiceTokens";
import { browser } from "$app/environment";
import type { IdGenerator } from "$legacyLib/core/services/IdGenerator";
import { IdGeneratorFormat } from "$legacyLib/core/services/IdGenerator";

@Injectable(SERVICE_TOKENS.ID_GENERATOR)
export class IdGeneratorImpl implements IdGenerator {
  generate(format: IdGeneratorFormat = IdGeneratorFormat.UUID): string {
    switch (format) {
      case IdGeneratorFormat.UUID:
        return this.generateUUID();
      case IdGeneratorFormat.SHORT:
        return this.generateShort();
      case IdGeneratorFormat.TIMESTAMP:
        return this.generateTimestamp();
      default:
        return this.generateUUID();
    }
  }

  generateWithPrefix(prefix: string, format: IdGeneratorFormat = IdGeneratorFormat.UUID): string {
    return `${prefix}_${this.generate(format)}`;
  }

  isValid(id: string): boolean {
    if (!id || typeof id !== 'string') return false;
    
    // Basic validation - non-empty string
    return id.trim().length > 0;
  }

  private generateUUID(): string {
    if (browser && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback UUID generation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private generateShort(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  private generateTimestamp(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
  }
}