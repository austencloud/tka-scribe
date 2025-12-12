/**
 * Custom error thrown when multi-factor authentication is required during sign-in.
 * Contains the resolver needed to complete the MFA challenge.
 */

import type { MultiFactorResolver } from "firebase/auth";

export class MFARequiredError extends Error {
  public readonly resolver: MultiFactorResolver;

  constructor(resolver: MultiFactorResolver) {
    super("Multi-factor authentication required");
    this.name = "MFARequiredError";
    this.resolver = resolver;
  }
}
