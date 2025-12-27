import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { FeedbackSorter } from "../../../features/feedback/services/implementations/FeedbackSorter";
import { FeedbackEditor } from "../../../features/feedback/services/implementations/FeedbackEditor";
import { FeedbackSubtaskManager } from "../../../features/feedback/services/implementations/FeedbackSubtaskManager";
import { FeedbackFormatter } from "../../../features/feedback/services/implementations/FeedbackFormatter";
import type { IFeedbackEditor } from "../../../features/feedback/services/contracts/IFeedbackEditor";
import type { IFeedbackSubtaskManager } from "../../../features/feedback/services/contracts/IFeedbackSubtaskManager";
import type { IFeedbackFormatter } from "../../../features/feedback/services/contracts/IFeedbackFormatter";
import { TYPES } from "../types";

export const feedbackModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === FEEDBACK SERVICES ===
    options
      .bind(TYPES.IFeedbackSortingService)
      .to(FeedbackSorter)
      .inSingletonScope();

    // Feedback Editor (snapshot-based change tracking)
    options
      .bind<IFeedbackEditor>(TYPES.IFeedbackEditingService)
      .to(FeedbackEditor)
      .inSingletonScope();

    // Feedback Subtask Manager (prerequisite tracking and management)
    options
      .bind<IFeedbackSubtaskManager>(TYPES.IFeedbackSubtaskService)
      .to(FeedbackSubtaskManager)
      .inSingletonScope();

    // Feedback Formatter (date/time/label formatting)
    options
      .bind<IFeedbackFormatter>(TYPES.IFeedbackFormattingService)
      .to(FeedbackFormatter)
      .inSingletonScope();
  }
);
