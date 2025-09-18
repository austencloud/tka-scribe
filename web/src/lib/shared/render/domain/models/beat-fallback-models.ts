
// Simple interfaces for fallback rendering
export interface EmptyBeatOptions {
  showPlaceholder?: boolean;
  placeholderText?: string;
}

export interface ErrorBeatOptions {
  showError?: boolean;
  errorMessage?: string;
  size?: { width: number; height: number };
}

export interface FallbackRenderOptions {
  showErrorMessage?: boolean;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
}

export interface FallbackRenderResult {
  success: boolean;
  canvas?: HTMLCanvasElement;
  error?: string;
}