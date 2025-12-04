/**
 * Feedback AI Module - InversifyJS DI Container Configuration
 *
 * Registers all AI-powered feedback analysis services with the dependency injection container.
 * These services are used for AI-assisted feedback interpretation and clarification.
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";
import type { IFeedbackAnalysisService } from "../../../features/feedback/services/contracts/IFeedbackAnalysisService";
import type { IAISettingsService } from "../../../features/feedback/services/contracts/IAISettingsService";
import type { IAIProviderService } from "../../../features/feedback/services/contracts/IAIProviderService";
import { FeedbackAnalysisService } from "../../../features/feedback/services/implementations/FeedbackAnalysisService";
import { AISettingsService } from "../../../features/feedback/services/implementations/AISettingsService";
import { OllamaProvider } from "../../../features/feedback/services/implementations/OllamaProvider";
import { ClaudeProvider } from "../../../features/feedback/services/implementations/ClaudeProvider";
import { OpenAIProvider } from "../../../features/feedback/services/implementations/OpenAIProvider";

export const feedbackAiModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // Feedback Analysis Service - orchestrates AI analysis workflow
    options
      .bind<IFeedbackAnalysisService>(TYPES.IFeedbackAnalysisService)
      .to(FeedbackAnalysisService)
      .inSingletonScope();

    // AI Settings Service - manages provider configuration and API keys
    options
      .bind<IAISettingsService>(TYPES.IAISettingsService)
      .to(AISettingsService)
      .inSingletonScope();

    // Ollama Provider - local AI model support
    options
      .bind<IAIProviderService>(TYPES.IOllamaProvider)
      .to(OllamaProvider)
      .inTransientScope();

    // Claude Provider - Anthropic API support
    options
      .bind<IAIProviderService>(TYPES.IClaudeProvider)
      .to(ClaudeProvider)
      .inTransientScope();

    // OpenAI Provider - OpenAI API support
    options
      .bind<IAIProviderService>(TYPES.IOpenAIProvider)
      .to(OpenAIProvider)
      .inTransientScope();
  }
);
