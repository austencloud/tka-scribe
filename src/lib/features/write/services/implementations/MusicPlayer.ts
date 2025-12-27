/**
 * MusicPlayer - Implementation for music playback in Write tab
 */
import { injectable } from "inversify";
import type { IMusicPlayer } from "../contracts/IMusicPlayer";

@injectable()
export class MusicPlayer implements IMusicPlayer {
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private initialized = false;

  constructor() {
    console.log("🎵 MusicPlayer initialized");
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log("🎵 MusicPlayer: Initializing audio context...");

    try {
      // Initialize Web Audio API context
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.audioContext = new AudioContextClass();

      // Resume audio context if suspended (required for user interaction)
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.initialized = true;
      console.log("✅ MusicPlayer initialized with audio context");
    } catch (error) {
      console.error(
        "❌ MusicPlayer: Failed to initialize audio context:",
        error
      );
      // Fallback to basic HTML audio without Web Audio API
      this.initialized = true;
      console.log("⚠️ MusicPlayer: Fallback to basic HTML audio");
    }
  }

  cleanup(): void {
    console.log("🎵 MusicPlayer: Cleaning up...");

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.removeEventListener(
        "loadedmetadata",
        this.handleLoadedMetadata
      );
      this.currentAudio.removeEventListener(
        "timeupdate",
        this.handleTimeUpdate
      );
      this.currentAudio.removeEventListener("ended", this.handleEnded);
      this.currentAudio.removeEventListener("error", this.handleError);
      this.currentAudio = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      void this.audioContext.close();
      this.audioContext = null;
    }

    this.initialized = false;
  }

  async play(track: string): Promise<void> {
    await this.ensureInitialized();

    console.log("🎵 MusicPlayer: Playing track:", track);

    try {
      // Stop current audio if playing
      if (this.currentAudio) {
        this.currentAudio.pause();
      }

      // Create new audio element
      this.currentAudio = new Audio(track);
      this.setupAudioEventListeners();

      // Start playback
      await this.currentAudio.play();
      console.log("✅ MusicPlayer: Track started playing");
    } catch (error) {
      console.error("❌ MusicPlayer: Failed to play track:", error);
      throw new Error(`Failed to play track: ${track}`);
    }
  }

  async pause(): Promise<void> {
    if (!this.currentAudio) {
      console.warn("🎵 MusicPlayer: No audio to pause");
      return;
    }

    this.currentAudio.pause();
    console.log("⏸️ MusicPlayer: Playback paused");
  }

  async stop(): Promise<void> {
    if (!this.currentAudio) {
      console.warn("🎵 MusicPlayer: No audio to stop");
      return;
    }

    this.currentAudio.pause();
    this.currentAudio.currentTime = 0;
    console.log("⏹️ MusicPlayer: Playback stopped");
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private setupAudioEventListeners(): void {
    if (!this.currentAudio) return;

    this.currentAudio.addEventListener(
      "loadedmetadata",
      this.handleLoadedMetadata
    );
    this.currentAudio.addEventListener("timeupdate", this.handleTimeUpdate);
    this.currentAudio.addEventListener("ended", this.handleEnded);
    this.currentAudio.addEventListener("error", this.handleError);
  }

  private handleLoadedMetadata = (): void => {
    if (this.currentAudio) {
      console.log(
        "🎵 MusicPlayer: Audio metadata loaded, duration:",
        this.currentAudio.duration
      );
    }
  };

  private handleTimeUpdate = (): void => {
    if (this.currentAudio) {
      // Could emit events here for UI updates
      // console.log("🎵 Time update:", this.currentAudio.currentTime);
    }
  };

  private handleEnded = (): void => {
    console.log("🎵 MusicPlayer: Track playback ended");
  };

  private handleError = (event: Event): void => {
    console.error("❌ MusicPlayer: Audio error:", event);
  };
}
