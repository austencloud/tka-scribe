import { injectable } from "inversify";

import { CAPComponent, CAPType } from "$shared";

import type { ICAPTypeService } from "../contracts/ICAPTypeService";

/**
 * Service implementing CAP type parsing and generation algorithms
 *
 * Extracted from CAPCard.svelte (lines 70-123, 172-185) to separate pure
 * algorithmic logic from UI concerns. This service contains the complex
 * conditional logic for mapping between component sets and CAP type enums.
 */
@injectable()
export class CAPTypeService implements ICAPTypeService {
  /**
   * Parse CAP type to extract components
   * EXACT ORIGINAL LOGIC from CAPCard.svelte lines 70-79
   */
  parseComponents(capType: CAPType): Set<CAPComponent> {
    const components = new Set<CAPComponent>();

    // Guard against undefined/null capType
    if (!capType) {
      return components;
    }

    if (capType.includes("rotated")) components.add(CAPComponent.ROTATED);
    if (capType.includes("mirrored")) components.add(CAPComponent.MIRRORED);
    if (capType.includes("swapped")) components.add(CAPComponent.SWAPPED);
    if (capType.includes("complementary"))
      components.add(CAPComponent.COMPLEMENTARY);

    return components;
  }

  /**
   * Check if a CAP type combination is implemented
   */
  isImplemented(components: Set<CAPComponent>): boolean {
    if (components.size === 0) return true;

    const sorted = Array.from(components).sort();

    // DEBUG: Log the components being checked
    console.log("🔍 CAPTypeService.isImplemented:", {
      components: Array.from(components),
      sorted,
      count: sorted.length,
    });

    // All single components are implemented
    if (sorted.length === 1) return true;

    // Two components
    if (sorted.length === 2) {
      // All 2-component combinations are now implemented (including MIRRORED_ROTATED)
      return true;
    }

    // Three components
    if (sorted.length === 3) {
      const componentSet = new Set(sorted);
      const hasMirrored = componentSet.has(CAPComponent.MIRRORED);
      const hasComplementary = componentSet.has(CAPComponent.COMPLEMENTARY);
      const hasRotated = componentSet.has(CAPComponent.ROTATED);

      console.log("🔍 Three component check:", {
        componentSet: Array.from(componentSet),
        hasMirrored,
        hasComplementary,
        hasRotated,
        MIRRORED: CAPComponent.MIRRORED,
        COMPLEMENTARY: CAPComponent.COMPLEMENTARY,
        ROTATED: CAPComponent.ROTATED,
      });

      // Only Mirrored + Complementary + Rotated is implemented
      if (hasMirrored && hasComplementary && hasRotated) {
        console.log("✅ MIRRORED_COMPLEMENTARY_ROTATED is implemented!");
        return true;
      }
      console.log("❌ This 3-component combination is not implemented");
      return false; // Other 3-component combinations not yet implemented
    }

    // Four components
    if (sorted.length === 4) {
      const componentSet = new Set(sorted);
      const hasMirrored = componentSet.has(CAPComponent.MIRRORED);
      const hasComplementary = componentSet.has(CAPComponent.COMPLEMENTARY);
      const hasRotated = componentSet.has(CAPComponent.ROTATED);
      const hasSwapped = componentSet.has(CAPComponent.SWAPPED);

      console.log("🔍 Four component check:", {
        componentSet: Array.from(componentSet),
        hasMirrored,
        hasComplementary,
        hasRotated,
        hasSwapped,
      });

      // Only Mirrored + Complementary + Rotated + Swapped is implemented
      if (hasMirrored && hasComplementary && hasRotated && hasSwapped) {
        console.log(
          "✅ MIRRORED_ROTATED_COMPLEMENTARY_SWAPPED is implemented!"
        );
        return true;
      }
      console.log("❌ This 4-component combination is not implemented");
      return false;
    }

    return false;
  }

  /**
   * Generate CAP type from selected components
   * EXACT ORIGINAL LOGIC from CAPCard.svelte lines 82-123
   */
  generateCAPType(components: Set<CAPComponent>): CAPType {
    if (components.size === 0) return CAPType.STRICT_ROTATED;

    const sorted = Array.from(components).sort();

    // Single components (strict)
    if (sorted.length === 1) {
      switch (sorted[0]) {
        case CAPComponent.ROTATED:
          return CAPType.STRICT_ROTATED;
        case CAPComponent.MIRRORED:
          return CAPType.STRICT_MIRRORED;
        case CAPComponent.SWAPPED:
          return CAPType.STRICT_SWAPPED;
        case CAPComponent.COMPLEMENTARY:
          return CAPType.STRICT_COMPLEMENTARY;
      }
    }

    // Two components
    if (sorted.length === 2) {
      const [first, second] = sorted;
      if (
        first === CAPComponent.COMPLEMENTARY &&
        second === CAPComponent.MIRRORED
      )
        return CAPType.MIRRORED_COMPLEMENTARY;
      if (
        first === CAPComponent.COMPLEMENTARY &&
        second === CAPComponent.ROTATED
      )
        return CAPType.ROTATED_COMPLEMENTARY;
      if (
        first === CAPComponent.COMPLEMENTARY &&
        second === CAPComponent.SWAPPED
      )
        return CAPType.SWAPPED_COMPLEMENTARY;
      if (first === CAPComponent.MIRRORED && second === CAPComponent.ROTATED)
        return CAPType.MIRRORED_ROTATED;
      if (first === CAPComponent.MIRRORED && second === CAPComponent.SWAPPED)
        return CAPType.MIRRORED_SWAPPED;
      if (first === CAPComponent.ROTATED && second === CAPComponent.SWAPPED)
        return CAPType.ROTATED_SWAPPED;
    }

    // Three components
    if (sorted.length === 3) {
      const componentSet = new Set(sorted);
      // Only Mirrored + Complementary + Rotated is implemented
      if (
        componentSet.has(CAPComponent.MIRRORED) &&
        componentSet.has(CAPComponent.COMPLEMENTARY) &&
        componentSet.has(CAPComponent.ROTATED)
      ) {
        return CAPType.MIRRORED_COMPLEMENTARY_ROTATED;
      }
    }

    // Four components
    if (sorted.length === 4) {
      const componentSet = new Set(sorted);
      // Only Mirrored + Complementary + Rotated + Swapped is implemented
      if (
        componentSet.has(CAPComponent.MIRRORED) &&
        componentSet.has(CAPComponent.COMPLEMENTARY) &&
        componentSet.has(CAPComponent.ROTATED) &&
        componentSet.has(CAPComponent.SWAPPED)
      ) {
        return CAPType.MIRRORED_ROTATED_COMPLEMENTARY_SWAPPED;
      }
    }

    // Fallback for unimplemented combinations
    return CAPType.STRICT_ROTATED;
  }

  /**
   * Format CAP type for display in UI
   * EXACT ORIGINAL LOGIC from CAPCard.svelte lines 172-185
   */
  formatForDisplay(capType: CAPType): string {
    const readable = capType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l: string) => l.toUpperCase());

    if (readable.length > 20) {
      const parts = readable.split(" ");
      if (parts.length > 2) {
        return `${parts[0]} + ${parts.length - 1} more`;
      }
    }

    return readable;
  }
}
