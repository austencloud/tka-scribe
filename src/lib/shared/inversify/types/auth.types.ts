/**
 * Authentication & User Service Type Identifiers
 */

export const AuthTypes = {
  IAuthenticator: Symbol.for("IAuthenticator"),
  IProfilePictureManager: Symbol.for("IProfilePictureManager"),
  IUserDocumentManager: Symbol.for("IUserDocumentManager"),
  IUserRepository: Symbol.for("IUserRepository"),
  ISubscriptionManager: Symbol.for("ISubscriptionManager"),
} as const;
