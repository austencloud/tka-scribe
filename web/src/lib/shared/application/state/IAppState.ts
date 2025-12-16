import type { Theme } from "./app-state-enums";

// Temporary interface definitions
export interface IAppState {
  isFullScreen: boolean;
  theme: Theme;
  toggleFullScreen(): void;
  setTheme(theme: Theme): void;
}
