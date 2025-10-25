/**
 * CAPExplanationTextGenerator - Generates explanation text for CAP transformations
 */

import { injectable } from "inversify";
import { CAP_COMPONENTS, type CAPComponent } from "../../domain";
import type { ICAPExplanationTextGenerator } from "../contracts/ICAPExplanationTextGenerator";

/**
 * Service for generating user-friendly explanation text for CAP transformations
 */
@injectable()
export class CAPExplanationTextGenerator implements ICAPExplanationTextGenerator {
  /**
   * Generate explanation text based on selected components
   */
  public generateExplanationText(selectedComponents: Set<CAPComponent>): string {
    const selected = Array.from(selectedComponents);

    if (selected.length === 0) {
      return "Select one or more CAP types to transform your sequence. You can combine multiple transformations for complex variations.";
    }

    if (selected.length === 1) {
      const comp = CAP_COMPONENTS.find(c => c.component === selected[0]);
      return `Your sequence will be ${comp?.label.toLowerCase()}: ${comp?.description}`;
    }

    const labels = selected
      .map(c => CAP_COMPONENTS.find(comp => comp.component === c)?.label)
      .join(" + ");
    return `Your sequence will combine ${labels}: This creates a complex transformation by applying all selected operations in sequence.`;
  }
}
