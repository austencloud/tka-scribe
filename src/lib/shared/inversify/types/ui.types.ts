/**
 * UI Service Type Identifiers
 *
 * Navigation, mobile, keyboard shortcuts, and viewport services.
 */

export const UITypes = {
  // Foundation
  IFileDownloadService: Symbol.for("IFileDownloadService"),
  IStorageService: Symbol.for("IStorageService"),
  ISeoService: Symbol.for("ISeoService"),
  ISvgImageService: Symbol.for("ISvgImageService"),

  // Mobile
  IMobileFullscreenService: Symbol.for("IMobileFullscreenService"),
  IPlatformDetectionService: Symbol.for("IPlatformDetectionService"),
  IGestureService: Symbol.for("IGestureService"),
  IPWAEngagementService: Symbol.for("IPWAEngagementService"),
  IPWAInstallDismissalService: Symbol.for("IPWAInstallDismissalService"),

  // Navigation
  IViewportService: Symbol.for("IViewportService"),
  IModuleSelectionService: Symbol.for("IModuleSelectionService"),
  IKeyboardNavigationService: Symbol.for("IKeyboardNavigationService"),
  ISheetRouterService: Symbol.for("ISheetRouterService"),
  ISequenceEncoderService: Symbol.for("ISequenceEncoderService"),
  ISequenceViewerService: Symbol.for("ISequenceViewerService"),
  IURLSyncService: Symbol.for("IURLSyncService"),
  IDeepLinkService: Symbol.for("IDeepLinkService"),
  ILetterDeriverService: Symbol.for("ILetterDeriverService"),
  IPositionDeriverService: Symbol.for("IPositionDeriverService"),
  INavigationPersistenceService: Symbol.for("INavigationPersistenceService"),
  INavigationValidationService: Symbol.for("INavigationValidationService"),
  INavigationService: Symbol.for("INavigationService"),

  // Keyboard Shortcuts
  IKeyboardShortcutService: Symbol.for("IKeyboardShortcutService"),
  IShortcutRegistryService: Symbol.for("IShortcutRegistryService"),
  IShortcutRegistry: Symbol.for("IShortcutRegistry"),
  ICommandPaletteService: Symbol.for("ICommandPaletteService"),
  IShortcutCustomizationService: Symbol.for("IShortcutCustomizationService"),
} as const;
