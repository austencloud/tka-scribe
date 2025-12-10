import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { FeedbackSortingService } from "../../../features/feedback/services/implementations/FeedbackSortingService";
import { FeedbackEditingService } from "../../../features/feedback/services/implementations/FeedbackEditingService";
import { FeedbackSubtaskService } from "../../../features/feedback/services/implementations/FeedbackSubtaskService";
import { FeedbackFormattingService } from "../../../features/feedback/services/implementations/FeedbackFormattingService";
import type { IFeedbackEditingService } from "../../../features/feedback/services/contracts/IFeedbackEditingService";
import type { IFeedbackSubtaskService } from "../../../features/feedback/services/contracts/IFeedbackSubtaskService";
import type { IFeedbackFormattingService } from "../../../features/feedback/services/contracts/IFeedbackFormattingService";
import { TYPES } from "../types";

export const feedbackModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === FEEDBACK SERVICES ===
    options
      .bind(TYPES.IFeedbackSortingService)
      .to(FeedbackSortingService)
      .inSingletonScope();

    // Feedback Editing Service (snapshot-based change tracking)
    options
      .bind<IFeedbackEditingService>(TYPES.IFeedbackEditingService)
      .to(FeedbackEditingService)
      .inSingletonScope();

    // Feedback Subtask Service (prerequisite tracking and management)
    options
      .bind<IFeedbackSubtaskService>(TYPES.IFeedbackSubtaskService)
      .to(FeedbackSubtaskService)
      .inSingletonScope();

    // Feedback Formatting Service (date/time/label formatting)
    options
      .bind<IFeedbackFormattingService>(TYPES.IFeedbackFormattingService)
      .to(FeedbackFormattingService)
      .inSingletonScope();
  }
);
