import { ServiceContainer } from "./ServiceContainer";
import { SERVICE_TOKENS } from "./ServiceTokens";
import { BackgroundFactory } from "$legacyLib/components/Backgrounds/core/BackgroundFactory";
import type { BackgroundSystemFactory } from "$legacyLib/core/services/BackgroundSystem";

// Import the injectable services to trigger registration
// import "$legacyLib/services/InjectableErrorHandlingService";
// import "$legacyLib/services/BackgroundServiceImpl";
// import "$legacyLib/services/IdGeneratorImpl";
// import "$legacyLib/services/InjectableLoggerService";
// import "$legacyLib/services/HapticFeedbackService";

export function registerServices(container: ServiceContainer): void {
  // Register background factory as a static class implementing BackgroundSystemFactory
  container.register<BackgroundSystemFactory>(
    SERVICE_TOKENS.BACKGROUND_FACTORY,
    BackgroundFactory
  );

  // More service registrations will go here
}
