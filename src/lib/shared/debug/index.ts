// Components
export { default as RoleSwitcherDebugPanel } from "./components/RoleSwitcherDebugPanel.svelte";

// State
export {
  userPreviewState,
  loadUserPreview,
  clearUserPreview,
  refreshPreviewSection,
  getEffectiveUserId,
  getEffectiveDisplayName,
  getEffectivePhotoURL,
  type PreviewUserProfile,
  type PreviewGamification,
  type PreviewSequence,
  type PreviewCollection,
  type PreviewAchievement,
  type PreviewNotification,
  type UserPreviewData,
} from "./state/user-preview-state.svelte";

// Context
export {
  initUserPreviewContext,
  useUserPreview,
  type UserPreviewContext,
} from "./context/user-preview-context";
