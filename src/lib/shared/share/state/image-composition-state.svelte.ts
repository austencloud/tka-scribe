/**
 * Image Composition State Manager
 *
 * Manages persistent settings for what elements appear in exported/shared images.
 * Uses localStorage for persistence across sessions.
 */

import { browser } from "$app/environment";

const STORAGE_KEY = "tka-image-composition-settings";

export interface ImageCompositionSettings {
  addWord: boolean;
  addBeatNumbers: boolean;
  addDifficultyLevel: boolean;
  includeStartPosition: boolean;
  addUserInfo: boolean;
}

const DEFAULT_SETTINGS: ImageCompositionSettings = {
  addWord: true,
  addBeatNumbers: true,
  addDifficultyLevel: false,
  includeStartPosition: true,
  addUserInfo: false,
};

type Observer = () => void;

class ImageCompositionStateManager {
  private settings = $state<ImageCompositionSettings>({ ...DEFAULT_SETTINGS });
  private observers = new Set<Observer>();

  constructor() {
    if (browser) {
      this.loadFromStorage();
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings = { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {
      console.warn("Failed to load image composition settings from storage");
    }
  }

  private saveToStorage(): void {
    if (!browser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      console.warn("Failed to save image composition settings to storage");
    }
  }

  private notifyObservers(): void {
    this.observers.forEach((observer) => observer());
  }

  // Getters
  get addWord(): boolean {
    return this.settings.addWord;
  }

  get addBeatNumbers(): boolean {
    return this.settings.addBeatNumbers;
  }

  get addDifficultyLevel(): boolean {
    return this.settings.addDifficultyLevel;
  }

  get includeStartPosition(): boolean {
    return this.settings.includeStartPosition;
  }

  get addUserInfo(): boolean {
    return this.settings.addUserInfo;
  }

  // Get all settings (for passing to share service)
  getSettings(): ImageCompositionSettings {
    return { ...this.settings };
  }

  // Setters
  setAddWord(value: boolean): void {
    this.settings.addWord = value;
    this.saveToStorage();
    this.notifyObservers();
  }

  setAddBeatNumbers(value: boolean): void {
    this.settings.addBeatNumbers = value;
    this.saveToStorage();
    this.notifyObservers();
  }

  setAddDifficultyLevel(value: boolean): void {
    this.settings.addDifficultyLevel = value;
    this.saveToStorage();
    this.notifyObservers();
  }

  setIncludeStartPosition(value: boolean): void {
    this.settings.includeStartPosition = value;
    this.saveToStorage();
    this.notifyObservers();
  }

  setAddUserInfo(value: boolean): void {
    this.settings.addUserInfo = value;
    this.saveToStorage();
    this.notifyObservers();
  }

  // Toggle helpers
  toggle(key: keyof ImageCompositionSettings): void {
    this.settings[key] = !this.settings[key];
    this.saveToStorage();
    this.notifyObservers();
  }

  // Observer pattern for reactivity
  registerObserver(observer: Observer): void {
    this.observers.add(observer);
  }

  unregisterObserver(observer: Observer): void {
    this.observers.delete(observer);
  }
}

// Singleton instance
let instance: ImageCompositionStateManager | null = null;

export function getImageCompositionManager(): ImageCompositionStateManager {
  if (!instance) {
    instance = new ImageCompositionStateManager();
  }
  return instance;
}
