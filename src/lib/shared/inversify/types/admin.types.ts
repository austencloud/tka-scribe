/**
 * Admin Service Type Identifiers
 *
 * Services for administration, analytics, and system monitoring.
 */

export const AdminTypes = {
  // System
  ISystemStateManager: Symbol.for("ISystemStateManager"),
  IAuditLogger: Symbol.for("IAuditLogger"),
  IAdminChallengeManager: Symbol.for("IAdminChallengeManager"),

  // Analytics
  IAnalyticsDataProvider: Symbol.for("IAnalyticsDataProvider"),
  IActivityLogger: Symbol.for("IActivityLogger"),
  ISessionTracker: Symbol.for("ISessionTracker"),

  // Announcements
  IAnnouncementManager: Symbol.for("IAnnouncementManager"),

  // User Activity
  IUserActivityTracker: Symbol.for("IUserActivityTracker"),

  // Presence
  IPresenceTracker: Symbol.for("IPresenceTracker"),
} as const;
