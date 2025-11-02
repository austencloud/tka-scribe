/**
 * Create Module Service Interface
 *
 * Interface for orchestrating complex business workflows for the Create module.
 * Coordinates multiple microservices and manages cross-cutting concerns.
 */

import type { PictographData } from "$shared";

export interface ICreateModuleService {
  /**
   * Orchestrates the complete start position selection workflow
   */
  selectStartPosition(position: PictographData): Promise<void>;

  /**
   * Orchestrates the complete option selection workflow
   */
  selectOption(option: PictographData): Promise<void>;

  /**
   * Initializes the Create module and sets up component coordination
   */
  initialize(): Promise<void>;

  /**
   * Get the current active tab
   */
  getCurrentTab(): string;

  /**
   * Switch to a different tab
   */
  switchToTab(tabId: string): Promise<void>;

  /**
   * Get the state for a specific tab
   */
  getTabState(tabId: string): unknown;

  /**
   * Update the state for a specific tab
   */
  updateTabState(tabId: string, state: unknown): void;
}
