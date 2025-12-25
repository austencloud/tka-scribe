/**
 * Release Notes Drawer State
 *
 * Simple state for opening the release notes drawer from anywhere in the app.
 */

import type { AppVersion } from "$lib/features/feedback/domain/models/version-models";

class ReleaseNotesDrawerState {
  isOpen = $state(false);
  version = $state<AppVersion | null>(null);
  isLoading = $state(false);
  error = $state<string | null>(null);

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  setVersion(version: AppVersion | null) {
    this.version = version;
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }
}

export const releaseNotesDrawerState = new ReleaseNotesDrawerState();
