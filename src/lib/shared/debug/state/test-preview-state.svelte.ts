/**
 * Test Preview State
 * Read-only preview of another user's notifications (dev/debug only).
 * Uses a server-side preview API; never marks notifications as read.
 */
import { browser } from "$app/environment";

type PreviewNotification = {
  id: string;
  type: string;
  title?: string;
  feedbackTitle?: string;
  message?: string;
  actionUrl?: string;
  feedbackId?: string;
  read?: boolean;
  createdAt?: string;
};

export const testPreviewState = $state({
  isActive: false,
  isLoading: false,
  error: "" as string | null,
  userId: "" as string,
  userLabel: "" as string,
  notifications: [] as PreviewNotification[],
  searchLoading: false,
  searchError: "" as string | null,
  suggestions: [] as { id: string; displayName?: string; email?: string }[],
});

export async function loadPreviewNotifications(userId: string, userLabel?: string) {
  if (!browser) return;
  testPreviewState.isLoading = true;
  testPreviewState.error = null;

  try {
    const res = await fetch(`/api/preview-notifications?userId=${encodeURIComponent(userId)}&limit=20`);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed: ${res.status}`);
    }
    const data = (await res.json()) as PreviewNotification[];
    testPreviewState.notifications = data;
    testPreviewState.userId = userId;
    testPreviewState.userLabel = userLabel || userId;
    testPreviewState.isActive = true;
  } catch (err: any) {
    testPreviewState.error = err?.message || "Failed to load preview notifications";
    testPreviewState.isActive = false;
    testPreviewState.notifications = [];
  } finally {
    testPreviewState.isLoading = false;
  }
}

export function clearPreview() {
  testPreviewState.isActive = false;
  testPreviewState.notifications = [];
  testPreviewState.userId = "";
  testPreviewState.userLabel = "";
  testPreviewState.error = null;
}

export async function searchPreviewUsers(query: string) {
  if (!browser || !query.trim()) {
    testPreviewState.suggestions = [];
    return;
  }

  testPreviewState.searchLoading = true;
  testPreviewState.searchError = null;
  try {
    const res = await fetch(
      `/api/preview-users?q=${encodeURIComponent(query.trim())}&limit=8`
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed: ${res.status}`);
    }
    const data = (await res.json()) as {
      id: string;
      displayName?: string;
      email?: string;
    }[];
    testPreviewState.suggestions = data;
  } catch (err: any) {
    testPreviewState.searchError =
      err?.message || "Failed to search users (preview)";
    testPreviewState.suggestions = [];
  } finally {
    testPreviewState.searchLoading = false;
  }
}
