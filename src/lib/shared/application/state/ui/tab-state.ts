import { browser } from "$app/environment";
import type { TabId } from "$shared";
import { getPersistenceService } from "../services.svelte";
import {
  getActiveTab,
  getActiveTabOrDefault,
  setActiveTab,
  setIsTransitioning,
} from "./ui-state.svelte";

const LOCAL_STORAGE_KEY = "tka-active-tab-cache";
const TRANSITION_RESET_DELAY = 300;

export function getInitialTabFromCache(): TabId {
  if (!browser) {
    return "construct";
  }

  try {
    const savedTabData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedTabData) {
      const parsed = JSON.parse(savedTabData);
      if (parsed && typeof parsed.tabId === "string") {
        return parsed.tabId as TabId;
      }
    }
  } catch (error) {
    console.warn("?? Failed to pre-load saved tab from cache:", error);
  }

  return "construct";
}

export async function switchTab(tab: TabId): Promise<void> {
  if (getActiveTab() === tab) {
    return;
  }

  setIsTransitioning(true);
  setActiveTab(tab);

  try {
    const persistence = getPersistenceService();
    await persistence.saveActiveTab(tab);

    if (browser) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ tabId: tab }));
    }
  } catch (error) {
    console.warn("?? switchTab: Failed to save tab to persistence:", error);
  }

  setTimeout(() => {
    setIsTransitioning(false);
  }, TRANSITION_RESET_DELAY);
}

export function isTabActive(tab: string): boolean {
  return getActiveTab() === tab;
}

export async function initializeTabPersistence(): Promise<void> {
  try {
    const persistence = getPersistenceService();
    await persistence.initialize();

    const savedTab = await persistence.getActiveTab();
    if (savedTab) {
      setActiveTab(savedTab);
      if (browser) {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({ tabId: savedTab })
        );
      }
    } else {
      const defaultTab = getActiveTabOrDefault();
      setActiveTab(defaultTab);
      await persistence.saveActiveTab(defaultTab);
      if (browser) {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({ tabId: defaultTab })
        );
      }
    }
  } catch (error) {
    console.warn("?? Failed to initialize tab persistence:", error);
  }
}
