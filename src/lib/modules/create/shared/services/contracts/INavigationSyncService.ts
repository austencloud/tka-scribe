/**
 * Create Tab Navigation Sync Service Contract
 *
 * Handles bidirectional synchronization between global navigation state and CreateTab state.
 * Manages tab switching within CreateTab's tool panel (Construct, Gestural, and Generate).
 * Includes tab accessibility validation and navigation guard logic for construction workflow.
 *
 * Note: "animate" and "share" are now separate panels (not tabs within the tool panel).
 * "record" has not been reintegrated yet.
 *
 * Domain: Create Module - Navigation within Sequence Construction Interface
 * Extracted from CreateTab.svelte monolith to follow DI architecture.
 */

export type BuildSection = "construct" | "gestural" | "generate";

export interface INavigationSyncService {
  /**
   * Sync navigation state changes to build tab state
   * @param buildTabState Build tab state object
   * @param navigationState Navigation state object
   */
  syncNavigationToBuildTab(buildTabState: any, navigationState: any): void;

  /**
   * Sync build tab state changes back to navigation state
   * @param buildTabState Build tab state object
   * @param navigationState Navigation state object
   */
  syncBuildTabToNavigation(buildTabState: any, navigationState: any): void;

  /**
   * Validate if a tab is accessible based on sequence state
   * @param mode Target sub-mode
   * @param canAccessEditTab Whether edit/export tabs are accessible
   * @returns Whether navigation to the tab should be allowed
   */
  validateTabAccess(mode: BuildSection, canAccessEditTab: boolean): boolean;

  /**
   * Get the fallback tab when access is denied
   */
  getFallbackTab(): BuildSection;
}
