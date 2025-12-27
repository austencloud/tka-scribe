/**
 * UI Service Type Identifiers
 *
 * Navigation, mobile, keyboard shortcuts, and viewport services.
 */

export const UITypes = {
  // Foundation
  IFileDownloader: Symbol.for("IFileDownloader"),
  IStorageManager: Symbol.for("IStorageManager"),
  ISeoManager: Symbol.for("ISeoManager"),
  ISvgImageConverter: Symbol.for("ISvgImageConverter"),

  // Mobile
  IMobileFullscreenManager: Symbol.for("IMobileFullscreenManager"),
  IPlatformDetector: Symbol.for("IPlatformDetector"),
  IGestureHandler: Symbol.for("IGestureHandler"),
  IPWAEngagementTracker: Symbol.for("IPWAEngagementTracker"),
  IPWAInstallDismissalManager: Symbol.for("IPWAInstallDismissalManager"),

  // Navigation
  IViewportManager: Symbol.for("IViewportManager"),
  IModuleSelector: Symbol.for("IModuleSelector"),
  IKeyboardNavigator: Symbol.for("IKeyboardNavigator"),
  ISheetRouter: Symbol.for("ISheetRouter"),
  ISequenceEncoder: Symbol.for("ISequenceEncoder"),
  ISequenceViewer: Symbol.for("ISequenceViewer"),
  IURLSyncer: Symbol.for("IURLSyncer"),
  IDeepLinker: Symbol.for("IDeepLinker"),
  ILetterDeriver: Symbol.for("ILetterDeriver"),
  IPositionDeriver: Symbol.for("IPositionDeriver"),
  INavigationPersister: Symbol.for("INavigationPersister"),
  INavigationValidator: Symbol.for("INavigationValidator"),
  INavigator: Symbol.for("INavigator"),

  // Keyboard Shortcuts
  IKeyboardShortcutManager: Symbol.for("IKeyboardShortcutManager"),
  IShortcutRegistry: Symbol.for("IShortcutRegistry"),
  ICommandPalette: Symbol.for("ICommandPalette"),
  IShortcutCustomizer: Symbol.for("IShortcutCustomizer"),
} as const;
