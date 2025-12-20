/**
 * Authentication & User Service Type Identifiers
 */

export const AuthTypes = {
  IAuthService: Symbol.for("IAuthService"),
  IProfilePictureService: Symbol.for("IProfilePictureService"),
  IUserDocumentService: Symbol.for("IUserDocumentService"),
  IUserService: Symbol.for("IUserService"),
} as const;
