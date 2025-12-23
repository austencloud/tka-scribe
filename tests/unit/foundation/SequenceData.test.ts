/**
 * SequenceData Tests
 *
 * Focused tests for createSequenceData behavior.
 */

import { describe, expect, it } from "vitest";
import { createSequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

describe("createSequenceData", () => {
  it("should include video fields when provided", () => {
    const result = createSequenceData({
      name: "Test",
      performanceVideoUrl: "https://example.com/video.mp4",
      performanceVideoPath: "users/123/recordings/seq/123.mp4",
      animatedSequenceUrl: "https://example.com/anim.webp",
      animatedSequencePath: "users/123/animations/seq/sequence.webp",
      animationFormat: "webp",
    });

    expect(result.performanceVideoUrl).toBe("https://example.com/video.mp4");
    expect(result.performanceVideoPath).toBe(
      "users/123/recordings/seq/123.mp4"
    );
    expect(result.animatedSequenceUrl).toBe("https://example.com/anim.webp");
    expect(result.animatedSequencePath).toBe(
      "users/123/animations/seq/sequence.webp"
    );
    expect(result.animationFormat).toBe("webp");
  });

  it("should not include video fields when not provided", () => {
    const result = createSequenceData({ name: "Test" });

    expect("performanceVideoUrl" in result).toBe(false);
    expect("animatedSequenceUrl" in result).toBe(false);
  });
});
