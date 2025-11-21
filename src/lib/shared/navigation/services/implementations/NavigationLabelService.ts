/**
 * Navigation Label Service Implementation
 *
 * Handles label formatting and abbreviation for navigation components.
 * Provides compact labels for responsive navigation layouts.
 */

import { injectable } from "inversify";

import type { INavigationLabelService } from "../contracts/INavigationLabelService";

@injectable()
export class NavigationLabelService implements INavigationLabelService {
  private readonly abbreviations: Record<string, string> = {
    Construct: "Construct",
    Generate: "Generate",
    Settings: "Settings",
    Menu: "Menu",
  };

  getCompactLabel(fullLabel: string): string {
    return this.abbreviations[fullLabel] || fullLabel;
  }

  getFullLabel(label: string): string {
    return label;
  }
}
