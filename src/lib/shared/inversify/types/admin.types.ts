/**
 * Admin Service Type Identifiers
 *
 * Services for administration, analytics, and system monitoring.
 */

export const AdminTypes = {
  // System
  ISystemStateService: Symbol.for("ISystemStateService"),
  IAuditLogService: Symbol.for("IAuditLogService"),
  IAdminChallengeService: Symbol.for("IAdminChallengeService"),

  // Analytics
  IAnalyticsDataService: Symbol.for("IAnalyticsDataService"),
  IActivityLogService: Symbol.for("IActivityLogService"),
  ISessionTrackingService: Symbol.for("ISessionTrackingService"),

  // Announcements
  IAnnouncementService: Symbol.for("IAnnouncementService"),

  // User Activity
  IUserActivityService: Symbol.for("IUserActivityService"),

  // Presence
  IPresenceService: Symbol.for("IPresenceService"),
} as const;
