import { browser } from "$app/environment";
import type { ModuleId } from "$shared";
import { getPersistenceService } from "../services.svelte";
import {
  getActiveModule,
  getActiveModuleOrDefault,
  setActiveModule,
  setIsTransitioning,
} from "./ui-state.svelte";

const LOCAL_STORAGE_KEY = "tka-active-module-cache";
const TRANSITION_RESET_DELAY = 300;

export function getInitialModuleFromCache(): ModuleId {
  if (!browser) {
    return "build";
  }

  try {
    const savedModuleData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedModuleData) {
      const parsed = JSON.parse(savedModuleData);
      if (parsed && typeof parsed.moduleId === "string") {
        return parsed.moduleId as ModuleId;
      }
    }
  } catch (error) {
    console.warn("⚠️ Failed to pre-load saved module from cache:", error);
  }

  return "build";
}

export async function switchModule(module: ModuleId): Promise<void> {
  if (getActiveModule() === module) {
    return;
  }

  setIsTransitioning(true);
  setActiveModule(module);

  try {
    const persistence = getPersistenceService();
    await persistence.saveActiveTab(module);

    if (browser) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ moduleId: module }));
    }
  } catch (error) {
    console.warn("⚠️ switchModule: Failed to save module to persistence:", error);
  }

  setTimeout(() => {
    setIsTransitioning(false);
  }, TRANSITION_RESET_DELAY);
}

export function isModuleActive(module: string): boolean {
  return getActiveModule() === module;
}

export async function initializeModulePersistence(): Promise<void> {
  try {
    const persistence = getPersistenceService();
    await persistence.initialize();

    const savedModule = await persistence.getActiveTab();
    if (savedModule) {
      setActiveModule(savedModule);
      if (browser) {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({ moduleId: savedModule })
        );
      }
    } else {
      const defaultModule = getActiveModuleOrDefault();
      setActiveModule(defaultModule);
      await persistence.saveActiveTab(defaultModule);
      if (browser) {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({ moduleId: defaultModule })
        );
      }
    }
  } catch (error) {
    console.warn("⚠️ Failed to initialize module persistence:", error);
  }
}
