import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import FeedbackReplyPanel from "$lib/features/feedback/components/my-feedback/FeedbackReplyPanel.svelte";
import type { FeedbackItem } from "$lib/features/feedback/domain/models/feedback-models";

describe("FeedbackReplyPanel Component", () => {
  const mockFeedbackItem: FeedbackItem = {
    id: "feedback-1",
    userId: "user-1",
    title: "Test Feedback",
    description: "Test feedback description",
    type: "bug",
    status: "feedback-needs-info",
    createdAt: new Date(),
    updatedAt: new Date(),
    imageUrls: [],
  };

  const mockOnSubmit = vi.fn(() => Promise.resolve());

  describe("Rendering", () => {
    it("should render reply panel for feedback-needs-info status", () => {
      render(FeedbackReplyPanel, {
        props: {
          item: mockFeedbackItem,
          onSubmit: mockOnSubmit,
        },
      });

      expect(screen.getByText(/share more details/i)).toBeTruthy();
      expect(screen.getByText(/team needs more information/i)).toBeTruthy();
    });

    it("should render reply panel for feedback-response status", () => {
      const responseItem = {
        ...mockFeedbackItem,
        status: "feedback-response" as any,
      };

      render(FeedbackReplyPanel, {
        props: {
          item: responseItem,
          onSubmit: mockOnSubmit,
        },
      });

      expect(screen.getByText(/admin response/i)).toBeTruthy();
      expect(screen.queryByText(/team sent a response/i)).toBeTruthy();
    });

    it("should have textarea for reply input", () => {
      render(FeedbackReplyPanel, {
        props: {
          item: mockFeedbackItem,
          onSubmit: mockOnSubmit,
        },
      });

      const textarea = screen.getByRole("textbox", { name: /your reply/i });
      expect(textarea).toBeTruthy();
    });

    it("should show character count requirement", () => {
      render(FeedbackReplyPanel, {
        props: {
          item: mockFeedbackItem,
          onSubmit: mockOnSubmit,
        },
      });

      // Should show "X more needed" when empty
      expect(screen.getByText(/more needed/i)).toBeTruthy();
    });
  });

  describe("Input Validation", () => {
    it("should require minimum 5 characters", async () => {
      render(FeedbackReplyPanel, {
        props: {
          item: mockFeedbackItem,
          onSubmit: mockOnSubmit,
        },
      });

      const submitButton = screen.getByRole("button", { name: /send reply/i });
      expect(submitButton).toBeDisabled();

      const textarea = screen.getByRole("textbox", { name: /your reply/i });
      await userEvent.type(textarea, "test");

      // Still disabled with 4 characters
      expect(submitButton).toBeDisabled();

      await userEvent.type(textarea, " ");

      // Should be enabled with 5 characters
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it("should update character counter", async () => {
      render(FeedbackReplyPanel, {
        props: {
          item: mockFeedbackItem,
          onSubmit: mockOnSubmit,
        },
      });

      expect(screen.getByText(/5 more needed/i)).toBeTruthy();

      const textarea = screen.getByRole("textbox", { name: /your reply/i });
      await userEvent.type(textarea, "test");

      expect(screen.getByText(/1 more needed/i)).toBeTruthy();

      await userEvent.type(textarea, " ");

      // Should show checkmark when valid
      await waitFor(() => {
        expect(screen.queryByText(/fa-check/i)).toBeTruthy();
      });
    });

    it("should disable submit button when loading", async () => {
      render(FeedbackReplyPanel, {
        props: {
          item: mockFeedbackItem,
          onSubmit: mockOnSubmit,
          isLoading: true,
        },
      });

      const submitButton = screen.getByRole("button", { name: /sending/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Reply Submission", () => {
    it("should call onSubmit with reply text", async () => {
      render(FeedbackReplyPanel, {
        props: {
          item: mockFeedbackItem,
          onSubmit: mockOnSubmit,
        },
      });

      const textarea = screen.getByRole("textbox", { name: /your reply/i });
      const replyText = "This is my reply to the feedback request";

      await userEvent.type(textarea, replyText);

      const submitButton = screen.getByRole("button", { name: /send reply/i });
      await userEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(replyText);
    });

    it("should trim whitespace before submitting", async () => {
      render(FeedbackReplyPanel, {
        props: {
          item: mockFeedbackItem,
          onSubmit: mockOnSubmit,
        },
      });

      const textarea = screen.getByRole("textbox", { name: /your reply/i });
      const replyText = "  This is my reply  ";

      await userEvent.type(textarea, replyText);

      const submitButton = screen.getByRole("button", { name: /send reply/i });
      await userEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith("This is my reply");
    });

    it("should show success message after submission", async () => {
      render(FeedbackReplyPanel, {
        props: {
          item: mockFeedbackItem,
          onSubmit: mockOnSubmit,
        },
      });

      const textarea = screen.getByRole("textbox", { name: /your reply/i });
      await userEvent.type(textarea, "Valid reply text");

      const submitButton = screen.getByRole("button", { name: /send reply/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/reply sent successfully/i)).toBeTruthy();
      });
    });

    it("should clear textarea after successful submission", async () => {
      render(FeedbackReplyPanel, {
        props: {
          item: mockFeedbackItem,
          onSubmit: mockOnSubmit,
        },
      });

      const textarea = screen.getByRole("textbox", {
        name: /your reply/i,
      }) as HTMLTextAreaElement;

      await userEvent.type(textarea, "Valid reply text");

      const submitButton = screen.getByRole("button", { name: /send reply/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(textarea.value).toBe("");
      });
    });

    it("should handle submission errors", async () => {
      const errorMessage = "Failed to save reply";
      const errorOnSubmit = vi.fn(() =>
        Promise.reject(new Error(errorMessage))
      );

      render(FeedbackReplyPanel, {
        props: {
          item: mockFeedbackItem,
          onSubmit: errorOnSubmit,
        },
      });

      const textarea = screen.getByRole("textbox", { name: /your reply/i });
      await userEvent.type(textarea, "Valid reply text");

      const submitButton = screen.getByRole("button", { name: /send reply/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeTruthy();
      });
    });
  });

  describe("Clear Action", () => {
    it("should have clear button when text is entered", async () => {
      render(FeedbackReplyPanel, {
        props: {
          item: mockFeedbackItem,
          onSubmit: mockOnSubmit,
        },
      });

      const textarea = screen.getByRole("textbox", { name: /your reply/i });
      const clearButton = screen.getByRole("button", { name: /clear/i });

      // Clear button should be disabled when empty
      expect(clearButton).toBeDisabled();

      await userEvent.type(textarea, "test");

      // Clear button should be enabled when text exists
      await waitFor(() => {
        expect(clearButton).not.toBeDisabled();
      });
    });

    it("should clear textarea when clear button clicked", async () => {
      render(FeedbackReplyPanel, {
        props: {
          item: mockFeedbackItem,
          onSubmit: mockOnSubmit,
        },
      });

      const textarea = screen.getByRole("textbox", {
        name: /your reply/i,
      }) as HTMLTextAreaElement;

      await userEvent.type(textarea, "Some reply text");
      expect(textarea.value).toBe("Some reply text");

      const clearButton = screen.getByRole("button", { name: /clear/i });
      await userEvent.click(clearButton);

      expect(textarea.value).toBe("");
    });
  });

  describe("Accessibility", () => {
    it("should have proper labels for all inputs", () => {
      render(FeedbackReplyPanel, {
        props: {
          item: mockFeedbackItem,
          onSubmit: mockOnSubmit,
        },
      });

      expect(screen.getByLabelText(/your reply/i)).toBeTruthy();
    });

    it("should have semantic button text", () => {
      render(FeedbackReplyPanel, {
        props: {
          item: mockFeedbackItem,
          onSubmit: mockOnSubmit,
        },
      });

      expect(screen.getByRole("button", { name: /send reply/i })).toBeTruthy();
      expect(screen.getByRole("button", { name: /clear/i })).toBeTruthy();
    });

    it("should have appropriate aria labels", () => {
      render(FeedbackReplyPanel, {
        props: {
          item: mockFeedbackItem,
          onSubmit: mockOnSubmit,
        },
      });

      const textarea = screen.getByRole("textbox", { name: /your reply/i });
      expect(textarea).toHaveAttribute("id", "reply-textarea");
    });
  });
});
