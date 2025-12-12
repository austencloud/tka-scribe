import type { IPersistenceService } from "../../persistence/services/contracts/IPersistenceService";
import { ensureContainerInitialized, getContainerInstance } from "../../inversify/di";
import { TYPES } from "../../inversify/types";
import type { ISettingsState } from "../../settings/services/contracts/ISettingsState";

// Make isInitialized reactive so components using getSettings() will re-evaluate
let isInitialized = $state(false);
let settingsService: ISettingsState | null = null;
let persistenceService: IPersistenceService | null = null;

export async function initializeAppServices(): Promise<void> {
  if (isInitialized) return;

  await ensureContainerInitialized();
  const container = await getContainerInstance();
  settingsService = container.get<ISettingsState>(TYPES.ISettingsState);
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
    const container = await getContainerInstance();
    settingsService = container.get<ISettingsState>(TYPES.ISettingsState);
  }
  if (!settingsService) {
    throw new Error("Settings service is null after resolution");
  }
  return settingsService;
}

export async function getPersistenceService(): Promise<IPersistenceService> {
  if (!persistenceService) {
    const container = await getContainerInstance();
    persistenceService = container.get<IPersistenceService>(TYPES.IPersistenceService);
  }
  if (!persistenceService) {
    throw new Error("Persistence service is null after resolution");
  }
  return persistenceService;
}

export function areServicesInitialized(): boolean {
  return isInitialized;
}
