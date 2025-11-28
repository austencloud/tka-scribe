/**
 * User Management Utilities
 *
 * Helper functions for user management components
 */

import type { UserRole } from "$shared/auth/domain/models/UserRole";
import { ROLE_DISPLAY } from "$shared/auth/domain/models/UserRole";

/**
 * Get role badge color
 */
export function getRoleColor(role: UserRole): string {
  return ROLE_DISPLAY[role].color;
}

/**
 * Get role icon
 */
export function getRoleIcon(role: UserRole): string {
  return ROLE_DISPLAY[role].icon;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | null): string {
  if (!date) return "Unknown";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
