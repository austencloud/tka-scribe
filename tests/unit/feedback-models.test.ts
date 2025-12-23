import { describe, expect, it } from "vitest";
import {
  isFeedbackStatus,
  isFeedbackType,
} from "$lib/features/feedback/domain/models/feedback-models";

describe("feedback-models guards", () => {
  it("accepts valid feedback types", () => {
    expect(isFeedbackType("bug")).toBe(true);
    expect(isFeedbackType("feature")).toBe(true);
    expect(isFeedbackType("general")).toBe(true);
  });

  it("rejects invalid feedback types", () => {
    expect(isFeedbackType("Bug")).toBe(false);
    expect(isFeedbackType("")).toBe(false);
    expect(isFeedbackType(undefined)).toBe(false);
    expect(isFeedbackType(null)).toBe(false);
    expect(isFeedbackType("bug_report")).toBe(false);
  });

  it("accepts valid feedback statuses", () => {
    expect(isFeedbackStatus("new")).toBe(true);
    expect(isFeedbackStatus("in-progress")).toBe(true);
    expect(isFeedbackStatus("in-review")).toBe(true);
    expect(isFeedbackStatus("completed")).toBe(true);
    expect(isFeedbackStatus("archived")).toBe(true);
  });

  it("rejects invalid feedback statuses", () => {
    expect(isFeedbackStatus("done")).toBe(false);
    expect(isFeedbackStatus("in_review")).toBe(false);
    expect(isFeedbackStatus("")).toBe(false);
    expect(isFeedbackStatus(undefined)).toBe(false);
    expect(isFeedbackStatus(null)).toBe(false);
  });
});
