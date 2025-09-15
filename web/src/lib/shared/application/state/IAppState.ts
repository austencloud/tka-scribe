
import type { AppTheme } from "./app-state-enums";

// Temporary interface definitions
export interface IAppState {
  isFullScreen: boolean;
  theme: AppTheme;
  toggleFullScreen(): void;
  setTheme(theme: AppTheme): void;
}
