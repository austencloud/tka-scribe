import { injectable } from "inversify";
import type {
  IAnimatedImageTranscoder,
  WebpTranscodeOptions,
} from "../contracts/IAnimatedImageTranscoder";

type WebPEncoderApi = {
  encodeGifImageData: (
    buffer: Uint8Array,
    length: number,
    losslessFlag: number
  ) => Uint8Array;
  api?: Record<string, unknown>;
};

@injectable()
export class AnimatedImageTranscoder implements IAnimatedImageTranscoder {
  private encoderReadyPromise: Promise<void> | null = null;
  private WebPEncoder: WebPEncoderApi | null = null;

  async convertGifToWebp(
    blob: Blob,
    options: WebpTranscodeOptions = {}
  ): Promise<Blob> {
    if (typeof window === "undefined") {
      throw new Error("WebP transcoding is only available in the browser");
    }

    // Dynamically import webp-encoder only in browser context to avoid SSR issues
    if (!this.WebPEncoder) {
      const module = await import("webp-encoder");
      this.WebPEncoder = module.default as unknown as WebPEncoderApi;
    }

    await this.ensureEncoderReady();

    const gifBuffer = new Uint8Array(await blob.arrayBuffer());
    const losslessFlag = options.lossless ? 1 : 0;
    const encodedBuffer = this.WebPEncoder.encodeGifImageData(
      gifBuffer,
      gifBuffer.length,
      losslessFlag
    );

    return new Blob([encodedBuffer.buffer as ArrayBuffer], {
      type: "image/webp",
    });
  }

  private ensureEncoderReady(): Promise<void> {
    if (this.encoderReadyPromise) {
      return this.encoderReadyPromise;
    }

    this.encoderReadyPromise = new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 200; // ~3s

      const schedule = (fn: () => void) => {
        if (
          typeof window !== "undefined" &&
          typeof window.requestAnimationFrame === "function"
        ) {
          window.requestAnimationFrame(fn);
        } else {
          setTimeout(fn, 16);
        }
      };

      const check = () => {
        attempts += 1;

        if (this.hasEncoderApi()) {
          resolve();
          return;
        }

        if (attempts > maxAttempts) {
          reject(new Error("WebP encoder runtime failed to initialize"));
          return;
        }

        schedule(check);
      };

      check();
    });

    return this.encoderReadyPromise;
  }

  private hasEncoderApi(): boolean {
    if (!this.WebPEncoder) {
      return false;
    }
    const api = this.WebPEncoder.api;
    return Boolean(
      api &&
        typeof api["allocateMemory"] === "function" &&
        typeof api["encodeGif"] === "function"
    );
  }
}
