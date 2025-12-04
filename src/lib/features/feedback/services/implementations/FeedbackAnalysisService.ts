/**
 * FeedbackAnalysisService
 *
 * Orchestrates the AI-powered feedback analysis workflow.
 * Manages analysis storage, clarifying questions, and provider coordination.
 */

import { injectable, inject } from "inversify";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "$lib/shared/auth/firebase";
import type { IFeedbackAnalysisService } from "../contracts/IFeedbackAnalysisService";
import type { IAIProviderService, AnalysisResponse } from "../contracts/IAIProviderService";
import type {
  FeedbackAnalysis,
  ClarifyingQuestion,
  ClaudeCodePrompt,
  AnalysisStatus,
  AnalysisResult,
  AnalysisError,
  AnalysisErrorCode,
} from "../../domain/models/analysis-models";
import type { FeedbackItem } from "../../domain/models/feedback-models";
import { feedbackService } from "./FeedbackService";
import { AISettingsService, getAISettingsService } from "./AISettingsService";
import { OllamaProvider } from "./OllamaProvider";
import { ClaudeProvider } from "./ClaudeProvider";
import { OpenAIProvider } from "./OpenAIProvider";

const FEEDBACK_COLLECTION = "feedback";
const ANALYSIS_SUBCOLLECTION = "analysis";
const CURRENT_ANALYSIS_DOC = "current";

@injectable()
export class FeedbackAnalysisService implements IFeedbackAnalysisService {
  private settingsService: AISettingsService;

  constructor() {
    this.settingsService = getAISettingsService();
  }

  /**
   * Get the appropriate AI provider based on settings
   */
  private async getProvider(): Promise<IAIProviderService> {
    const settings = await this.settingsService.getSettings();

    switch (settings.defaultProvider) {
      case "ollama": {
        const provider = new OllamaProvider();
        provider.setConfig(settings.ollama);
        return provider;
      }

      case "claude": {
        const provider = new ClaudeProvider();
        provider.setConfig(settings.claude);
        const apiKey = await this.settingsService.getApiKey("claude");
        if (apiKey) {
          provider.setApiKey(apiKey);
        }
        return provider;
      }

      case "openai": {
        const provider = new OpenAIProvider();
        provider.setConfig(settings.openai);
        const apiKey = await this.settingsService.getApiKey("openai");
        if (apiKey) {
          provider.setApiKey(apiKey);
        }
        return provider;
      }

      default:
        throw new Error(`Unknown provider: ${settings.defaultProvider}`);
    }
  }

  /**
   * Get the Firebase document reference for an analysis
   */
  private getAnalysisDocRef(feedbackId: string) {
    return doc(
      firestore,
      FEEDBACK_COLLECTION,
      feedbackId,
      ANALYSIS_SUBCOLLECTION,
      CURRENT_ANALYSIS_DOC
    );
  }

  async analyzeFeedback(feedbackId: string): Promise<FeedbackAnalysis> {
    // Get the feedback item
    const feedback = await feedbackService.getFeedback(feedbackId);
    if (!feedback) {
      throw new Error(`Feedback not found: ${feedbackId}`);
    }

    // Check for existing analysis
    const existing = await this.getAnalysis(feedbackId);
    const settings = await this.settingsService.getSettings();

    // Create or update analysis record
    const analysis: FeedbackAnalysis = {
      id: existing?.id || `analysis-${Date.now()}`,
      feedbackId,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
      provider: settings.defaultProvider,
      modelId: this.getModelId(settings),
      status: "analyzing",
      clarifyingQuestions: existing?.clarifyingQuestions || [],
      questionRound: (existing?.questionRound || 0) + 1,
      maxRounds: settings.maxClarificationRounds,
      claudeCodePrompts: existing?.claudeCodePrompts || [],
    };

    // Save initial state
    await this.saveAnalysis(feedbackId, analysis);

    try {
      // Get provider and run analysis
      const provider = await this.getProvider();

      // Include previous answered questions for refinement
      const answeredQuestions = analysis.clarifyingQuestions.filter((q) => q.answer);

      const response = await provider.analyzeFeedback(
        feedback,
        answeredQuestions.length > 0 ? answeredQuestions : undefined,
        {
          maxClarificationRounds: settings.maxClarificationRounds,
          includeCodeContext: settings.generateClaudeCodePrompts,
        }
      );

      // Update analysis with results
      analysis.result = response.result;
      analysis.rawResponse = response.rawResponse;
      analysis.tokenUsage = response.tokenUsage;

      // Add new questions (don't duplicate existing ones)
      if (response.questions && response.questions.length > 0) {
        const existingQuestionIds = new Set(
          analysis.clarifyingQuestions.map((q) => q.id)
        );
        const newQuestions = response.questions.filter(
          (q) => !existingQuestionIds.has(q.id)
        );
        analysis.clarifyingQuestions = [
          ...analysis.clarifyingQuestions,
          ...newQuestions,
        ];
      }

      // Determine status
      const unansweredRequired = analysis.clarifyingQuestions.filter(
        (q) => q.isRequired && !q.answer
      );

      if (unansweredRequired.length > 0) {
        analysis.status = "needs_clarification";
      } else {
        analysis.status = "completed";
      }

      analysis.updatedAt = new Date();
      await this.saveAnalysis(feedbackId, analysis);

      return analysis;
    } catch (error) {
      // Handle analysis failure
      analysis.status = "failed";
      analysis.error = {
        code: this.getErrorCode(error),
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
        retryable: this.isRetryable(error),
      };
      analysis.updatedAt = new Date();

      await this.saveAnalysis(feedbackId, analysis);
      throw error;
    }
  }

  async getAnalysis(feedbackId: string): Promise<FeedbackAnalysis | null> {
    try {
      const docRef = this.getAnalysisDocRef(feedbackId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return this.mapDocToAnalysis(docSnap.data());
    } catch (error) {
      console.error("Failed to get analysis:", error);
      return null;
    }
  }

  async submitAnswer(
    feedbackId: string,
    questionId: string,
    answer: string,
    answeredBy: "admin" | "user"
  ): Promise<FeedbackAnalysis> {
    const analysis = await this.getAnalysis(feedbackId);
    if (!analysis) {
      throw new Error("No analysis found for this feedback");
    }

    // Find and update the question
    const questionIndex = analysis.clarifyingQuestions.findIndex(
      (q) => q.id === questionId
    );

    if (questionIndex === -1) {
      throw new Error("Question not found");
    }

    const existingQuestion = analysis.clarifyingQuestions[questionIndex];
    if (!existingQuestion) {
      throw new Error("Question not found at index");
    }

    analysis.clarifyingQuestions[questionIndex] = {
      ...existingQuestion,
      answer,
      answeredBy,
      answeredAt: new Date(),
      passedToUser: false,
    };

    analysis.updatedAt = new Date();

    // Check if we should re-analyze
    const unansweredRequired = analysis.clarifyingQuestions.filter(
      (q) => q.isRequired && !q.answer
    );

    if (unansweredRequired.length === 0) {
      // All required questions answered - re-analyze
      await this.saveAnalysis(feedbackId, analysis);
      return this.reanalyzeWithAnswers(feedbackId);
    }

    // Still have unanswered questions
    await this.saveAnalysis(feedbackId, analysis);
    return analysis;
  }

  async passQuestionToUser(feedbackId: string, questionId: string): Promise<void> {
    const analysis = await this.getAnalysis(feedbackId);
    if (!analysis) {
      throw new Error("No analysis found for this feedback");
    }

    const questionIndex = analysis.clarifyingQuestions.findIndex(
      (q) => q.id === questionId
    );

    if (questionIndex === -1) {
      throw new Error("Question not found");
    }

    const question = analysis.clarifyingQuestions[questionIndex];
    if (!question) {
      throw new Error("Question not found at index");
    }

    question.passedToUser = true;
    analysis.status = "awaiting_user";
    analysis.updatedAt = new Date();

    await this.saveAnalysis(feedbackId, analysis);

    // TODO: Send notification to user (future enhancement)
  }

  async reanalyzeWithAnswers(feedbackId: string): Promise<FeedbackAnalysis> {
    const settings = await this.settingsService.getSettings();
    const existing = await this.getAnalysis(feedbackId);

    if (!existing) {
      return this.analyzeFeedback(feedbackId);
    }

    // Check if we've exceeded max rounds
    if (existing.questionRound >= existing.maxRounds) {
      existing.status = "completed";
      existing.updatedAt = new Date();
      await this.saveAnalysis(feedbackId, existing);
      return existing;
    }

    // Run new analysis with existing answers
    return this.analyzeFeedback(feedbackId);
  }

  async analyzeFeedbackWithClarification(
    feedbackId: string,
    clarification: string
  ): Promise<FeedbackAnalysis> {
    // Get the feedback item
    const feedback = await feedbackService.getFeedback(feedbackId);
    if (!feedback) {
      throw new Error(`Feedback not found: ${feedbackId}`);
    }

    // Get existing analysis
    const existing = await this.getAnalysis(feedbackId);
    const settings = await this.settingsService.getSettings();

    // Create clarification as a virtual question/answer pair
    const clarificationQuestion: ClarifyingQuestion = {
      id: `clarification-${Date.now()}`,
      question: "Admin provided a clarification:",
      isRequired: false,
      category: "context",
      answer: clarification,
      answeredBy: "admin",
      answeredAt: new Date(),
    };

    // Create or update analysis record
    const analysis: FeedbackAnalysis = {
      id: existing?.id || `analysis-${Date.now()}`,
      feedbackId,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
      provider: settings.defaultProvider,
      modelId: this.getModelId(settings),
      status: "analyzing",
      clarifyingQuestions: [
        ...(existing?.clarifyingQuestions || []),
        clarificationQuestion,
      ],
      questionRound: (existing?.questionRound || 0) + 1,
      maxRounds: settings.maxClarificationRounds,
      claudeCodePrompts: existing?.claudeCodePrompts || [],
    };

    // Save initial state
    await this.saveAnalysis(feedbackId, analysis);

    try {
      // Get provider and run analysis
      const provider = await this.getProvider();

      // Include all answered questions including the new clarification
      const answeredQuestions = analysis.clarifyingQuestions.filter((q) => q.answer);

      const response = await provider.analyzeFeedback(
        feedback,
        answeredQuestions,
        {
          maxClarificationRounds: settings.maxClarificationRounds,
          includeCodeContext: settings.generateClaudeCodePrompts,
        }
      );

      // Update analysis with results
      analysis.result = response.result;
      analysis.rawResponse = response.rawResponse;
      analysis.tokenUsage = response.tokenUsage;

      // Add new questions (don't duplicate existing ones)
      if (response.questions && response.questions.length > 0) {
        const existingQuestionIds = new Set(
          analysis.clarifyingQuestions.map((q) => q.id)
        );
        const newQuestions = response.questions.filter(
          (q) => !existingQuestionIds.has(q.id)
        );
        analysis.clarifyingQuestions = [
          ...analysis.clarifyingQuestions,
          ...newQuestions,
        ];
      }

      // Determine status
      const unansweredRequired = analysis.clarifyingQuestions.filter(
        (q) => q.isRequired && !q.answer
      );

      if (unansweredRequired.length > 0) {
        analysis.status = "needs_clarification";
      } else {
        analysis.status = "completed";
      }

      analysis.updatedAt = new Date();
      await this.saveAnalysis(feedbackId, analysis);

      return analysis;
    } catch (error) {
      // Handle analysis failure
      analysis.status = "failed";
      analysis.error = {
        code: this.getErrorCode(error),
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
        retryable: this.isRetryable(error),
      };
      analysis.updatedAt = new Date();

      await this.saveAnalysis(feedbackId, analysis);
      throw error;
    }
  }

  async generateClaudeCodePrompt(feedbackId: string): Promise<ClaudeCodePrompt> {
    const analysis = await this.getAnalysis(feedbackId);
    if (!analysis || !analysis.result) {
      throw new Error("No completed analysis found");
    }

    const feedback = await feedbackService.getFeedback(feedbackId);
    if (!feedback) {
      throw new Error("Feedback not found");
    }

    const provider = await this.getProvider();
    const promptText = await provider.generateClaudeCodePrompt(
      feedback,
      analysis.result
    );

    const prompt: ClaudeCodePrompt = {
      id: `prompt-${Date.now()}`,
      generatedAt: new Date(),
      prompt: promptText,
      suggestedFiles: analysis.result.affectedAreas || [],
      investigationGoals: analysis.result.suggestedActions || [],
      copied: false,
    };

    // Add to analysis
    analysis.claudeCodePrompts.push(prompt);
    analysis.updatedAt = new Date();
    await this.saveAnalysis(feedbackId, analysis);

    return prompt;
  }

  async markPromptCopied(feedbackId: string, promptId: string): Promise<void> {
    const analysis = await this.getAnalysis(feedbackId);
    if (!analysis) return;

    const promptIndex = analysis.claudeCodePrompts.findIndex(
      (p) => p.id === promptId
    );

    if (promptIndex !== -1) {
      const prompt = analysis.claudeCodePrompts[promptIndex];
      if (prompt) {
        prompt.copied = true;
        prompt.copiedAt = new Date();
        analysis.updatedAt = new Date();
        await this.saveAnalysis(feedbackId, analysis);
      }
    }
  }

  async deleteAnalysis(feedbackId: string): Promise<void> {
    try {
      const docRef = this.getAnalysisDocRef(feedbackId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Failed to delete analysis:", error);
      throw error;
    }
  }

  onAnalysisChange(
    feedbackId: string,
    callback: (analysis: FeedbackAnalysis | null) => void
  ): () => void {
    const docRef = this.getAnalysisDocRef(feedbackId);

    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback(this.mapDocToAnalysis(docSnap.data()));
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error("Analysis listener error:", error);
        callback(null);
      }
    );
  }

  /**
   * Save analysis to Firebase
   */
  private async saveAnalysis(
    feedbackId: string,
    analysis: FeedbackAnalysis
  ): Promise<void> {
    const docRef = this.getAnalysisDocRef(feedbackId);

    // Convert to Firebase-safe format
    const data = {
      ...analysis,
      createdAt: analysis.createdAt,
      updatedAt: serverTimestamp(),
      clarifyingQuestions: analysis.clarifyingQuestions.map((q) => ({
        ...q,
        answeredAt: q.answeredAt || null,
      })),
      claudeCodePrompts: analysis.claudeCodePrompts.map((p) => ({
        ...p,
        generatedAt: p.generatedAt,
        copiedAt: p.copiedAt || null,
      })),
      error: analysis.error
        ? {
            ...analysis.error,
            timestamp: analysis.error.timestamp,
          }
        : null,
    };

    await setDoc(docRef, data);
  }

  /**
   * Map Firebase document to FeedbackAnalysis
   */
  private mapDocToAnalysis(data: Record<string, unknown>): FeedbackAnalysis {
    return {
      id: data["id"] as string,
      feedbackId: data["feedbackId"] as string,
      createdAt: this.toDate(data["createdAt"]),
      updatedAt: this.toDate(data["updatedAt"]),
      provider: data["provider"] as FeedbackAnalysis["provider"],
      modelId: data["modelId"] as string,
      status: data["status"] as AnalysisStatus,
      result: data["result"] as AnalysisResult | undefined,
      rawResponse: data["rawResponse"] as string | undefined,
      clarifyingQuestions: ((data["clarifyingQuestions"] as unknown[]) || []).map(
        (q: unknown) => ({
          ...(q as ClarifyingQuestion),
          answeredAt: this.toDateOrUndefined((q as Record<string, unknown>)["answeredAt"]),
        })
      ),
      questionRound: (data["questionRound"] as number) || 0,
      maxRounds: (data["maxRounds"] as number) || 3,
      claudeCodePrompts: ((data["claudeCodePrompts"] as unknown[]) || []).map(
        (p: unknown) => ({
          ...(p as ClaudeCodePrompt),
          generatedAt: this.toDate((p as Record<string, unknown>)["generatedAt"]),
          copiedAt: this.toDateOrUndefined((p as Record<string, unknown>)["copiedAt"]),
        })
      ),
      error: data["error"]
        ? this.mapToAnalysisError(data["error"] as Record<string, unknown>)
        : undefined,
      tokenUsage: data["tokenUsage"] as FeedbackAnalysis["tokenUsage"],
    };
  }

  /**
   * Convert Firebase Timestamp or Date to Date
   */
  private toDate(value: unknown): Date {
    if (value instanceof Timestamp) {
      return value.toDate();
    }
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === "string" || typeof value === "number") {
      return new Date(value);
    }
    return new Date();
  }

  /**
   * Convert to Date or undefined
   */
  private toDateOrUndefined(value: unknown): Date | undefined {
    if (!value) return undefined;
    return this.toDate(value);
  }

  /**
   * Map raw data to AnalysisError
   */
  private mapToAnalysisError(data: Record<string, unknown>): AnalysisError {
    return {
      code: (data["code"] as AnalysisErrorCode) || "UNKNOWN",
      message: (data["message"] as string) || "Unknown error",
      timestamp: this.toDate(data["timestamp"]),
      retryable: (data["retryable"] as boolean) ?? false,
      details: data["details"] as string | undefined,
    };
  }

  /**
   * Get model ID from settings
   */
  private getModelId(settings: Awaited<ReturnType<AISettingsService["getSettings"]>>): string {
    switch (settings.defaultProvider) {
      case "ollama":
        return settings.ollama.modelId;
      case "claude":
        return settings.claude.modelId;
      case "openai":
        return settings.openai.modelId;
      default:
        return "unknown";
    }
  }

  /**
   * Get error code from error
   */
  private getErrorCode(error: unknown): AnalysisErrorCode {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes("api key")) return "INVALID_API_KEY";
      if (message.includes("rate limit") || message.includes("429")) return "RATE_LIMITED";
      if (message.includes("timeout")) return "TIMEOUT";
      if (message.includes("context") || message.includes("token")) return "CONTEXT_TOO_LONG";
      if (message.includes("parse") || message.includes("json")) return "PARSE_ERROR";
      if (message.includes("connect") || message.includes("network")) return "PROVIDER_UNAVAILABLE";
    }
    return "UNKNOWN";
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(error: unknown): boolean {
    const code = this.getErrorCode(error);
    return ["PROVIDER_UNAVAILABLE", "RATE_LIMITED", "TIMEOUT"].includes(code);
  }
}

/**
 * Singleton instance for non-DI usage
 */
let _instance: FeedbackAnalysisService | null = null;

export function getFeedbackAnalysisService(): FeedbackAnalysisService {
  if (!_instance) {
    _instance = new FeedbackAnalysisService();
  }
  return _instance;
}
