/**
 * Mock Inversify Module for Storybook
 *
 * This module replaces the real inversify module in Storybook,
 * providing mock implementations of all services.
 */

import { mockServices } from "./mock-di-container";

// Re-export everything from real inversify that we need
export { Container, inject, injectable } from "inversify";

// Export TYPES - we'll import the real ones
export { TYPES } from "../src/lib/shared/inversify/types";

// Mock resolve function
export function resolve<T>(serviceIdentifier: symbol): T {
  const serviceName = serviceIdentifier.toString();

  // Extract service name from symbol
  const match = serviceName.match(/Symbol\((.+?)\)/);
  const extractedName = match ? match[1] : serviceName;

  console.log(`[Storybook Mock] Resolving: ${extractedName}`);

  // Find matching service
  for (const [key, service] of Object.entries(mockServices)) {
    if (extractedName.includes(key)) {
      console.log(`[Storybook Mock] Found mock service: ${key}`);
      return service as T;
    }
  }

  console.warn(`[Storybook Mock] No mock found for service: ${extractedName}`);
  // Return an empty object instead of throwing
  return {} as T;
}

// Mock other utility functions
export function resolveHMRSafe<T>(serviceIdentifier: symbol): T | null {
  try {
    return resolve<T>(serviceIdentifier);
  } catch {
    return null;
  }
}

export function tryResolve<T>(serviceIdentifier: symbol): T | null {
  try {
    return resolve<T>(serviceIdentifier);
  } catch {
    return null;
  }
}

export async function ensureContainerInitialized(): Promise<void> {
  // No-op for Storybook
  console.log("[Storybook Mock] Container already initialized (mock)");
}

export function isContainerReady(): boolean {
  return true;
}

export function resetContainer(): void {
  // No-op for Storybook
}

export const getContainer = async () => {
  return null;
};

export const resolveSyncUnsafe = resolve;
export const resolveAsync = resolve;
