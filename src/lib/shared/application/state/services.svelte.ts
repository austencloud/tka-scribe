import type { IPersistenceService } from "../../persistence/services/contracts/IPersistenceService";
import { ensureContainerInitialized, resolve } from "../../inversify/di";
import { TYPES } from "../../inversify/types";
import type { ISettingsState } from "../../settings/services/contracts/ISettingsState";

// Make isInitialized reactive so components using getSettings() will re-evaluate
let isInitialized = $state(false);
let settingsService: ISettingsState | null = null;
let persistenceService: IPersistenceService | null = null;

export async function initializeAppServices(): Promise<void> {
  if (isInitialized) return;

  await ensureContainerInitialized();
  settingsService = await resolve(TYPES.ISettingsState);
  isInitialized = true;
}

export function clearAppServicesCache(): void {
  isInitialized = false;
  settingsService = null;
  persistenceService = null;
}

export function getSettingsServiceSync(): ISettingsState {
  if (!settingsService) {
    throw new Error(
      "Settings service not initialized. Call initializeAppServices first."
    );
  }
  return settingsService;
}

export async function getSettingsService(): Promise<ISettingsState> {
  if (!settingsService) {
    const resolved = resolve<ISettingsState>(TYPES.ISettingsState);
    if (!resolved) {
      throw new Error("Failed to resolve ISettingsState");
    }
    settingsService = resolved;
  }
  if (!settingsService) {
    throw new Error("Settings service is null after resolution");
  }
  return settingsService;
}

export function getPersistenceService(): IPersistenceService {
  if (!persistenceService) {
    const resolved = resolve<IPersistenceService>(TYPES.IPersistenceService);
    if (!resolved) {
      throw new Error("Failed to resolve IPersistenceService");
    }
    persistenceService = resolved;
  }
  if (!persistenceService) {
    throw new Error("Persistence service is null after resolution");
  }
  return persistenceService;
}

export function areServicesInitialized(): boolean {
  return isInitialized;
}
