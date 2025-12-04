/**
 * IAISettingsService
 *
 * Contract for AI settings management.
 * Handles configuration storage and API key management.
 */

import type { AIAnalysisSettings } from "../../domain/models/ai-settings-models";
import type { AIProviderType } from "../../domain/models/analysis-models";
import type { ProviderConnectionTest } from "./IAIProviderService";

export interface IAISettingsService {
  /**
   * Load AI settings for the current admin user
   */
  getSettings(): Promise<AIAnalysisSettings>;

  /**
   * Save AI settings
   * Partial update - only provided fields are updated
   *
   * @param settings - Settings to update
   */
  saveSettings(settings: Partial<AIAnalysisSettings>): Promise<void>;

  /**
   * Get decrypted API key for a provider
   *
   * @param provider - The provider type
   * @returns Decrypted API key or null if not set
   */
  getApiKey(provider: "claude" | "openai"): Promise<string | null>;

  /**
   * Save encrypted API key for a provider
   *
   * @param provider - The provider type
   * @param key - The API key to encrypt and store
   */
  saveApiKey(provider: "claude" | "openai", key: string): Promise<void>;

  /**
   * Delete API key for a provider
   *
   * @param provider - The provider type
   */
  deleteApiKey(provider: "claude" | "openai"): Promise<void>;

  /**
   * Check if API key is configured for a provider
   *
   * @param provider - The provider type
   * @returns Whether a key is stored
   */
  hasApiKey(provider: "claude" | "openai"): Promise<boolean>;

  /**
   * Test connection with the currently configured provider
   */
  testCurrentProvider(): Promise<ProviderConnectionTest>;

  /**
   * Test connection with a specific provider
   *
   * @param provider - The provider to test
   */
  testProvider(provider: AIProviderType): Promise<ProviderConnectionTest>;

  /**
   * Subscribe to settings changes
   *
   * @param callback - Called when settings change
   * @returns Unsubscribe function
   */
  onSettingsChange(callback: (settings: AIAnalysisSettings) => void): () => void;
}
