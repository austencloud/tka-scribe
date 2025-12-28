import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { FeedbackSorter } from "../../../features/feedback/services/implementations/FeedbackSorter";
import { FeedbackEditor } from "../../../features/feedback/services/implementations/FeedbackEditor";
import { FeedbackSubtaskManager } from "../../../features/feedback/services/implementations/FeedbackSubtaskManager";
import { FeedbackFormatter } from "../../../features/feedback/services/implementations/FeedbackFormatter";
import { VoiceTranscriptCoordinator } from "../../../features/feedback/services/implementations/VoiceTranscriptCoordinator";
import { FormDraftPersister } from "../../../features/feedback/services/implementations/FormDraftPersister.svelte";
import { FeedbackTypeResolver } from "../../../features/feedback/services/implementations/FeedbackTypeResolver";
import type { IFeedbackEditor } from "../../../features/feedback/services/contracts/IFeedbackEditor";
import type { IFeedbackSubtaskManager } from "../../../features/feedback/services/contracts/IFeedbackSubtaskManager";
import type { IFeedbackFormatter } from "../../../features/feedback/services/contracts/IFeedbackFormatter";
import type { IVoiceTranscriptCoordinator } from "../../../features/feedback/services/contracts/IVoiceTranscriptCoordinator";
import type { IFormDraftPersister } from "../../../features/feedback/services/contracts/IFormDraftPersister";
import type { IFeedbackTypeResolver } from "../../../features/feedback/services/contracts/IFeedbackTypeResolver";
import { TYPES } from "../types";

export const feedbackModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === FEEDBACK SERVICES ===
    options
      .bind(TYPES.IFeedbackSorter)
      .to(FeedbackSorter)
      .inSingletonScope();

    // Feedback Editor (snapshot-based change tracking)
    options
      .bind<IFeedbackEditor>(TYPES.IFeedbackEditor)
      .to(FeedbackEditor)
      .inSingletonScope();

    // Feedback Subtask Manager (prerequisite tracking and management)
    options
      .bind<IFeedbackSubtaskManager>(TYPES.IFeedbackSubtaskManager)
      .to(FeedbackSubtaskManager)
      .inSingletonScope();

    // Feedback Formatter (date/time/label formatting)
    options
      .bind<IFeedbackFormatter>(TYPES.IFeedbackFormatter)
      .to(FeedbackFormatter)
      .inSingletonScope();

    // Voice Transcript Coordinator (voice input deduplication)
    options
      .bind<IVoiceTranscriptCoordinator>(TYPES.IVoiceTranscriptCoordinator)
      .to(VoiceTranscriptCoordinator)
      .inSingletonScope();

    // Form Draft Persister (auto-save with debouncing)
    options
      .bind<IFormDraftPersister>(TYPES.IFormDraftPersister)
      .to(FormDraftPersister)
      .inSingletonScope();

    // Feedback Type Resolver (type-specific config)
    options
      .bind<IFeedbackTypeResolver>(TYPES.IFeedbackTypeResolver)
      .to(FeedbackTypeResolver)
      .inSingletonScope();
  }
);
