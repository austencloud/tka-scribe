/**
 * VoiceCommandHandler - Voice Recognition Implementation
 *
 * Uses Web Speech API for voice command detection.
 * Primarily for Step-by-Step mode advancement.
 */

import { injectable } from "inversify";
import type { IVoiceCommandHandler } from "../contracts/IVoiceCommandHandler";

@injectable()
export class VoiceCommandHandler implements IVoiceCommandHandler {
  private recognition: any = null;
  private listening = false;
  private currentKeyword = "";
  private currentCallback: (() => void) | null = null;

  constructor() {
    // Check for browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition(): void {
    if (!this.recognition) return;

    // Configure recognition
    this.recognition.continuous = true; // Keep listening
    this.recognition.interimResults = false; // Only final results
    this.recognition.lang = "en-US";
    this.recognition.maxAlternatives = 1;

    // Handle results
    this.recognition.onresult = (event: any) => {
      const lastResultIndex = event.results.length - 1;
      const transcript = event.results[lastResultIndex][0].transcript
        .trim()
        .toLowerCase();

      console.log("[VoiceCommandHandler] Heard:", transcript);

      // Check if transcript contains the keyword
      if (
        this.currentKeyword &&
        transcript.includes(this.currentKeyword.toLowerCase())
      ) {
        console.log("[VoiceCommandHandler] Keyword detected!");
        this.currentCallback?.();
      }
    };

    // Handle errors
    this.recognition.onerror = (event: any) => {
      console.error("[VoiceCommandHandler] Error:", event.error);

      // Auto-restart on certain errors
      if (event.error === "no-speech" || event.error === "audio-capture") {
        this.restart();
      }
    };

    // Auto-restart when recognition ends
    this.recognition.onend = () => {
      if (this.listening) {
        console.log("[VoiceCommandHandler] Recognition ended, restarting...");
        this.restart();
      }
    };
  }

  private restart(): void {
    if (!this.recognition || !this.listening) return;

    try {
      this.recognition.start();
    } catch (error) {
      // Recognition might already be starting
      console.warn("[VoiceCommandHandler] Restart failed:", error);
    }
  }

  startListening(keyword: string, callback: () => void): void {
    if (!this.isSupported()) {
      console.warn("[VoiceCommandHandler] Speech recognition not supported");
      return;
    }

    if (this.listening) {
      this.stopListening();
    }

    this.currentKeyword = keyword;
    this.currentCallback = callback;
    this.listening = true;

    try {
      this.recognition.start();
      console.log(`[VoiceCommandHandler] Listening for "${keyword}"`);
    } catch (error) {
      console.error("[VoiceCommandHandler] Failed to start:", error);
      this.listening = false;
    }
  }

  stopListening(): void {
    if (!this.recognition || !this.listening) return;

    this.listening = false;
    this.currentKeyword = "";
    this.currentCallback = null;

    try {
      this.recognition.stop();
      console.log("[VoiceCommandHandler] Stopped listening");
    } catch (error) {
      console.warn("[VoiceCommandHandler] Stop failed:", error);
    }
  }

  isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  isListening(): boolean {
    return this.listening;
  }
}
