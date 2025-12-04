/**
 * Feedback Manage State
 *
 * State management for the feedback management tab (admin view).
 */

import type {
  FeedbackItem,
  FeedbackFilterOptions,
  FeedbackStatus,
  FeedbackType,
  FeedbackPriority,
} from "../domain/models/feedback-models";
import type {
  FeedbackAnalysis,
  ClaudeCodePrompt,
} from "../domain/models/analysis-models";
import { feedbackService } from "../services/implementations/FeedbackService";
import { getFeedbackAnalysisService } from "../services/implementations/FeedbackAnalysisService";
import { getAISettingsService } from "../services/implementations/AISettingsService";

const PAGE_SIZE = 20;

/**
 * Creates feedback manage state
 */
export function createFeedbackManageState() {
  // List state
  let items = $state<FeedbackItem[]>([]);
  let isLoading = $state(false);
  let hasMore = $state(true);
  let lastDocId = $state<string | null>(null);
  let error = $state<string | null>(null);

  // Filter state
  let filters = $state<FeedbackFilterOptions>({
    type: "all",
    status: "all",
    priority: "all",
  });

  // Search query
  let searchQuery = $state("");

  // Selected item for detail view
  let selectedItem = $state<FeedbackItem | null>(null);

  // Analysis state
  let currentAnalysis = $state<FeedbackAnalysis | null>(null);
  let isAnalyzing = $state(false);
  let analysisError = $state<string | null>(null);
  let analysisUnsubscribe: (() => void) | null = null;

  // Title generation state
  let isGeneratingTitle = $state(false);

  // Filtered items based on search query
  const filteredItems = $derived(
    searchQuery.trim()
      ? items.filter(
          (item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.userDisplayName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : items
  );

  // Actions
  async function loadFeedback(reset = false) {
    if (isLoading) return;
    if (!reset && !hasMore) return;

    isLoading = true;
    error = null;

    try {
      const result = await feedbackService.loadFeedback(
        filters,
        PAGE_SIZE,
        reset ? undefined : lastDocId ?? undefined
      );

      if (reset) {
        items = result.items;
      } else {
        items = [...items, ...result.items];
      }

      lastDocId = result.lastDocId;
      hasMore = result.hasMore;
    } catch (err) {
      console.error("Failed to load feedback:", err);
      error = "Failed to load feedback";
    } finally {
      isLoading = false;
    }
  }

  function setFilter<K extends keyof FeedbackFilterOptions>(
    key: K,
    value: FeedbackFilterOptions[K]
  ) {
    filters = { ...filters, [key]: value };
    // Reset and reload when filter changes
    items = [];
    lastDocId = null;
    hasMore = true;
    void loadFeedback(true);
  }

  function selectItem(item: FeedbackItem | null) {
    selectedItem = item;
  }

  async function updateStatus(feedbackId: string, status: FeedbackStatus) {
    try {
      await feedbackService.updateStatus(feedbackId, status);
      // Update local state
      items = items.map((item) =>
        item.id === feedbackId ? { ...item, status, updatedAt: new Date() } : item
      );
      if (selectedItem?.id === feedbackId) {
        selectedItem = { ...selectedItem, status, updatedAt: new Date() };
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      throw err;
    }
  }

  async function updateAdminNotes(feedbackId: string, notes: string) {
    try {
      await feedbackService.updateAdminNotes(feedbackId, notes);
      // Update local state
      items = items.map((item) =>
        item.id === feedbackId
          ? { ...item, adminNotes: notes, updatedAt: new Date() }
          : item
      );
      if (selectedItem?.id === feedbackId) {
        selectedItem = { ...selectedItem, adminNotes: notes, updatedAt: new Date() };
      }
    } catch (err) {
      console.error("Failed to update admin notes:", err);
      throw err;
    }
  }

  async function deleteFeedback(feedbackId: string) {
    try {
      await feedbackService.deleteFeedback(feedbackId);
      // Remove from local state
      items = items.filter((item) => item.id !== feedbackId);
      if (selectedItem?.id === feedbackId) {
        selectedItem = null;
      }
    } catch (err) {
      console.error("Failed to delete feedback:", err);
      throw err;
    }
  }

  /**
   * Update editable feedback fields
   */
  async function updateFeedback(
    feedbackId: string,
    updates: Partial<{
      type: FeedbackType;
      title: string;
      description: string;
      priority: FeedbackPriority | undefined;
      reportedModule: string;
      reportedTab: string;
    }>
  ) {
    try {
      await feedbackService.updateFeedback(feedbackId, updates);
      // Update local state
      const updateWithTimestamp = { ...updates, updatedAt: new Date() };
      items = items.map((item) =>
        item.id === feedbackId ? { ...item, ...updateWithTimestamp } : item
      );
      if (selectedItem?.id === feedbackId) {
        selectedItem = { ...selectedItem, ...updateWithTimestamp };
      }
    } catch (err) {
      console.error("Failed to update feedback:", err);
      throw err;
    }
  }

  function loadMore() {
    if (!isLoading && hasMore) {
      void loadFeedback(false);
    }
  }

  /**
   * Refresh a single item (reload from server)
   */
  async function refreshItem(feedbackId: string) {
    try {
      const updated = await feedbackService.getFeedback(feedbackId);
      if (updated) {
        items = items.map((item) =>
          item.id === feedbackId ? updated : item
        );
        if (selectedItem?.id === feedbackId) {
          selectedItem = updated;
        }
      }
    } catch (err) {
      console.error("Failed to refresh item:", err);
    }
  }

  function setSearchQuery(query: string) {
    searchQuery = query;
  }

  // Analysis methods
  async function loadAnalysis(feedbackId: string) {
    // Clean up previous subscription
    if (analysisUnsubscribe) {
      analysisUnsubscribe();
      analysisUnsubscribe = null;
    }

    currentAnalysis = null;
    analysisError = null;

    try {
      const analysisService = getFeedbackAnalysisService();

      // Load initial analysis
      currentAnalysis = await analysisService.getAnalysis(feedbackId);

      // Subscribe to changes
      analysisUnsubscribe = analysisService.onAnalysisChange(feedbackId, (analysis) => {
        currentAnalysis = analysis;
      });
    } catch (err) {
      console.error("Failed to load analysis:", err);
      analysisError = "Failed to load analysis";
    }
  }

  async function triggerAnalysis(feedbackId: string) {
    if (isAnalyzing) return;

    isAnalyzing = true;
    analysisError = null;

    try {
      const analysisService = getFeedbackAnalysisService();
      currentAnalysis = await analysisService.analyzeFeedback(feedbackId);
    } catch (err) {
      console.error("Failed to analyze feedback:", err);
      analysisError = err instanceof Error ? err.message : "Analysis failed";
    } finally {
      isAnalyzing = false;
    }
  }

  async function submitQuestionAnswer(
    feedbackId: string,
    questionId: string,
    answer: string
  ) {
    try {
      const analysisService = getFeedbackAnalysisService();
      currentAnalysis = await analysisService.submitAnswer(
        feedbackId,
        questionId,
        answer,
        "admin"
      );
    } catch (err) {
      console.error("Failed to submit answer:", err);
      throw err;
    }
  }

  async function passQuestionToUser(feedbackId: string, questionId: string) {
    try {
      const analysisService = getFeedbackAnalysisService();
      await analysisService.passQuestionToUser(feedbackId, questionId);
      // Analysis will update via subscription
    } catch (err) {
      console.error("Failed to pass question to user:", err);
      throw err;
    }
  }

  async function generateClaudeCodePrompt(feedbackId: string): Promise<ClaudeCodePrompt> {
    try {
      const analysisService = getFeedbackAnalysisService();
      return await analysisService.generateClaudeCodePrompt(feedbackId);
    } catch (err) {
      console.error("Failed to generate Claude Code prompt:", err);
      throw err;
    }
  }

  async function markPromptCopied(feedbackId: string, promptId: string) {
    try {
      const analysisService = getFeedbackAnalysisService();
      await analysisService.markPromptCopied(feedbackId, promptId);
    } catch (err) {
      console.error("Failed to mark prompt as copied:", err);
    }
  }

  async function clarifyAnalysis(feedbackId: string, clarification: string) {
    if (isAnalyzing) return;

    isAnalyzing = true;
    analysisError = null;

    try {
      const analysisService = getFeedbackAnalysisService();
      currentAnalysis = await analysisService.analyzeFeedbackWithClarification(
        feedbackId,
        clarification
      );
    } catch (err) {
      console.error("Failed to clarify analysis:", err);
      analysisError = err instanceof Error ? err.message : "Clarification failed";
    } finally {
      isAnalyzing = false;
    }
  }

  function clearAnalysis() {
    if (analysisUnsubscribe) {
      analysisUnsubscribe();
      analysisUnsubscribe = null;
    }
    currentAnalysis = null;
    analysisError = null;
    isAnalyzing = false;
  }

  async function generateTitle(feedbackId: string, description: string): Promise<string | null> {
    if (isGeneratingTitle) return null;

    isGeneratingTitle = true;

    try {
      const settingsService = getAISettingsService();
      const settings = await settingsService.getSettings();

      if (!settings.enabled) {
        throw new Error("AI is not enabled in settings");
      }

      // Use Ollama for quick local title generation
      const response = await fetch(`${settings.ollama.baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: settings.ollama.modelId,
          prompt: `Generate a concise title (max 60 characters) for this feedback. Return ONLY the title text, nothing else.\n\nFeedback:\n${description}`,
          stream: false,
          options: {
            temperature: 0.3,
            num_ctx: 1024,
          },
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
      }

      const data = await response.json();
      let title = data.response?.trim() || "";

      // Clean up the title - remove quotes, extra whitespace
      title = title.replace(/^["']|["']$/g, "").trim();

      // Truncate if too long
      if (title.length > 80) {
        const lastSpace = title.substring(0, 77).lastIndexOf(" ");
        title = title.substring(0, lastSpace > 40 ? lastSpace : 77) + "...";
      }

      if (title) {
        // Save the generated title
        await feedbackService.updateFeedback(feedbackId, { title });

        // Update local state
        items = items.map((item) =>
          item.id === feedbackId ? { ...item, title, updatedAt: new Date() } : item
        );
        if (selectedItem?.id === feedbackId) {
          selectedItem = { ...selectedItem, title, updatedAt: new Date() };
        }
      }

      return title;
    } catch (err) {
      console.error("Failed to generate title:", err);
      throw err;
    } finally {
      isGeneratingTitle = false;
    }
  }

  return {
    // State
    get items() {
      return filteredItems;
    },
    get searchQuery() {
      return searchQuery;
    },
    get isLoading() {
      return isLoading;
    },
    get hasMore() {
      return hasMore;
    },
    get error() {
      return error;
    },
    get filters() {
      return filters;
    },
    get selectedItem() {
      return selectedItem;
    },

    // Analysis state
    get currentAnalysis() {
      return currentAnalysis;
    },
    get isAnalyzing() {
      return isAnalyzing;
    },
    get analysisError() {
      return analysisError;
    },
    get isGeneratingTitle() {
      return isGeneratingTitle;
    },

    // Actions
    loadFeedback,
    setFilter,
    setSearchQuery,
    selectItem,
    updateStatus,
    updateAdminNotes,
    updateFeedback,
    deleteFeedback,
    loadMore,
    refreshItem,

    // Analysis actions
    loadAnalysis,
    triggerAnalysis,
    clarifyAnalysis,
    submitQuestionAnswer,
    passQuestionToUser,
    generateClaudeCodePrompt,
    markPromptCopied,
    clearAnalysis,

    // Title generation
    generateTitle,
  };
}

export type FeedbackManageState = ReturnType<typeof createFeedbackManageState>;
