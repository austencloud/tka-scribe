/**
 * AISettingsService
 *
 * Manages AI analysis settings and API key storage.
 * Settings stored in Firebase with localStorage caching.
 */

import { injectable } from "inversify";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { firestore } from "$lib/shared/auth/firebase";
import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
import type { IAISettingsService } from "../contracts/IAISettingsService";
import type { ProviderConnectionTest } from "../contracts/IAIProviderService";
import type { AIAnalysisSettings, AIApiKeyStorage } from "../../domain/models/ai-settings-models";
import { DEFAULT_AI_SETTINGS } from "../../domain/models/ai-settings-models";
import type { AIProviderType } from "../../domain/models/analysis-models";
import { OllamaProvider } from "./OllamaProvider";
import { ClaudeProvider } from "./ClaudeProvider";
import { OpenAIProvider } from "./OpenAIProvider";

const SETTINGS_COLLECTION = "users";
const SETTINGS_DOC = "settings";
const AI_SETTINGS_DOC = "aiAnalysis";
const API_KEYS_DOC = "aiApiKeys";
const LOCAL_STORAGE_KEY = "tka-ai-settings-cache";

@injectable()
export class AISettingsService implements IAISettingsService {
  private cachedSettings: AIAnalysisSettings | null = null;
  private cachedApiKeys: Map<string, string> = new Map();

  /**
   * Get the Firebase path for settings
   */
  private getSettingsPath(): string | null {
    const user = authStore.user;
    if (!user) return null;
    return `${SETTINGS_COLLECTION}/${user.uid}/${SETTINGS_DOC}`;
  }

  /**
   * Load from localStorage cache
   */
  private loadFromCache(): AIAnalysisSettings | null {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignore cache errors
    }
    return null;
  }

  /**
   * Save to localStorage cache
   */
  private saveToCache(settings: AIAnalysisSettings): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore cache errors
    }
  }

  async getSettings(): Promise<AIAnalysisSettings> {
    // Return cached if available
    if (this.cachedSettings) {
      return this.cachedSettings;
    }

    // Try localStorage first
    const cached = this.loadFromCache();
    if (cached) {
      this.cachedSettings = cached;
    }

    // Load from Firebase
    const path = this.getSettingsPath();
    if (!path) {
      return this.cachedSettings || DEFAULT_AI_SETTINGS;
    }

    try {
      const docRef = doc(firestore, path, AI_SETTINGS_DOC);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<AIAnalysisSettings>;
        // Merge with defaults to ensure all fields exist
        this.cachedSettings = {
          ...DEFAULT_AI_SETTINGS,
          ...data,
          ollama: { ...DEFAULT_AI_SETTINGS.ollama, ...data.ollama },
          claude: { ...DEFAULT_AI_SETTINGS.claude, ...data.claude },
          openai: { ...DEFAULT_AI_SETTINGS.openai, ...data.openai },
        };
        this.saveToCache(this.cachedSettings);
        return this.cachedSettings;
      }
    } catch (error) {
      console.error("Failed to load AI settings:", error);
    }

    return this.cachedSettings || DEFAULT_AI_SETTINGS;
  }

  async saveSettings(settings: Partial<AIAnalysisSettings>): Promise<void> {
    const path = this.getSettingsPath();
    if (!path) {
      throw new Error("User not authenticated");
    }

    // Merge with current settings
    const current = await this.getSettings();
    const updated: AIAnalysisSettings = {
      ...current,
      ...settings,
      ollama: settings.ollama
        ? { ...current.ollama, ...settings.ollama }
        : current.ollama,
      claude: settings.claude
        ? { ...current.claude, ...settings.claude }
        : current.claude,
      openai: settings.openai
        ? { ...current.openai, ...settings.openai }
        : current.openai,
    };

    try {
      const docRef = doc(firestore, path, AI_SETTINGS_DOC);
      await setDoc(docRef, updated, { merge: true });

      // Update cache
      this.cachedSettings = updated;
      this.saveToCache(updated);
    } catch (error) {
      console.error("Failed to save AI settings:", error);
      throw error;
    }
  }

  async getApiKey(provider: "claude" | "openai"): Promise<string | null> {
    // Check memory cache first
    const cached = this.cachedApiKeys.get(provider);
    if (cached) {
      return cached;
    }

    const path = this.getSettingsPath();
    if (!path) {
      return null;
    }

    try {
      const docRef = doc(firestore, path, API_KEYS_DOC);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as AIApiKeyStorage;
        const key =
          provider === "claude" ? data.claudeApiKey : data.openaiApiKey;

        if (key) {
          // Simple decode (not true encryption - for production use a proper solution)
          const decoded = this.decodeKey(key);
          this.cachedApiKeys.set(provider, decoded);
          return decoded;
        }
      }
    } catch (error) {
      console.error("Failed to load API key:", error);
    }

    return null;
  }

  async saveApiKey(provider: "claude" | "openai", key: string): Promise<void> {
    const path = this.getSettingsPath();
    if (!path) {
      throw new Error("User not authenticated");
    }

    try {
      const docRef = doc(firestore, path, API_KEYS_DOC);

      // Simple encode (not true encryption - for production use a proper solution)
      const encoded = this.encodeKey(key);

      const updateData: Partial<AIApiKeyStorage> = {
        lastUpdated: new Date(),
      };

      if (provider === "claude") {
        updateData.claudeApiKey = encoded;
      } else {
        updateData.openaiApiKey = encoded;
      }

      await setDoc(docRef, updateData, { merge: true });

      // Update cache
      this.cachedApiKeys.set(provider, key);
    } catch (error) {
      console.error("Failed to save API key:", error);
      throw error;
    }
  }

  async deleteApiKey(provider: "claude" | "openai"): Promise<void> {
    const path = this.getSettingsPath();
    if (!path) {
      throw new Error("User not authenticated");
    }

    try {
      const docRef = doc(firestore, path, API_KEYS_DOC);

      const updateData: Partial<AIApiKeyStorage> = {
        lastUpdated: new Date(),
      };

      if (provider === "claude") {
        updateData.claudeApiKey = "";
      } else {
        updateData.openaiApiKey = "";
      }

      await setDoc(docRef, updateData, { merge: true });

      // Clear cache
      this.cachedApiKeys.delete(provider);
    } catch (error) {
      console.error("Failed to delete API key:", error);
      throw error;
    }
  }

  async hasApiKey(provider: "claude" | "openai"): Promise<boolean> {
    const key = await this.getApiKey(provider);
    return key !== null && key.length > 0;
  }

  async testCurrentProvider(): Promise<ProviderConnectionTest> {
    const settings = await this.getSettings();
    return this.testProvider(settings.defaultProvider);
  }

  /**
   * Get list of installed Ollama models
   * Fetches directly from the Ollama API
   */
  async getInstalledOllamaModels(): Promise<{ id: string; name: string; size: string; parameterSize?: string }[]> {
    const settings = await this.getSettings();
    const ollamaProvider = new OllamaProvider();
    ollamaProvider.setConfig(settings.ollama);
    return ollamaProvider.getInstalledModels();
  }

  async testProvider(provider: AIProviderType): Promise<ProviderConnectionTest> {
    const settings = await this.getSettings();

    switch (provider) {
      case "ollama": {
        const ollamaProvider = new OllamaProvider();
        ollamaProvider.setConfig(settings.ollama);
        return ollamaProvider.testConnection();
      }

      case "claude": {
        const claudeProvider = new ClaudeProvider();
        claudeProvider.setConfig(settings.claude);
        const apiKey = await this.getApiKey("claude");
        if (!apiKey) {
          return { success: false, message: "API key not configured" };
        }
        claudeProvider.setApiKey(apiKey);
        return claudeProvider.testConnection();
      }

      case "openai": {
        const openaiProvider = new OpenAIProvider();
        openaiProvider.setConfig(settings.openai);
        const apiKey = await this.getApiKey("openai");
        if (!apiKey) {
          return { success: false, message: "API key not configured" };
        }
        openaiProvider.setApiKey(apiKey);
        return openaiProvider.testConnection();
      }

      default:
        return { success: false, message: `Unknown provider: ${provider}` };
    }
  }

  onSettingsChange(callback: (settings: AIAnalysisSettings) => void): () => void {
    const path = this.getSettingsPath();
    if (!path) {
      return () => {};
    }

    const docRef = doc(firestore, path, AI_SETTINGS_DOC);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<AIAnalysisSettings>;
          const settings: AIAnalysisSettings = {
            ...DEFAULT_AI_SETTINGS,
            ...data,
            ollama: { ...DEFAULT_AI_SETTINGS.ollama, ...data.ollama },
            claude: { ...DEFAULT_AI_SETTINGS.claude, ...data.claude },
            openai: { ...DEFAULT_AI_SETTINGS.openai, ...data.openai },
          };
          this.cachedSettings = settings;
          this.saveToCache(settings);
          callback(settings);
        }
      },
      (error) => {
        console.error("Settings listener error:", error);
      }
    );

    return unsubscribe;
  }

  /**
   * Simple encoding for API keys (NOT real encryption)
   * For production, use a proper encryption library
   */
  private encodeKey(key: string): string {
    return btoa(key);
  }

  /**
   * Simple decoding for API keys
   */
  private decodeKey(encoded: string): string {
    try {
      return atob(encoded);
    } catch {
      return "";
    }
  }
}

/**
 * Singleton instance for non-DI usage
 */
let _instance: AISettingsService | null = null;

export function getAISettingsService(): AISettingsService {
  if (!_instance) {
    _instance = new AISettingsService();
  }
  return _instance;
}
