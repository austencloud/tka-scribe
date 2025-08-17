/**
 * Codex Service Migration Helper
 *
 * Provides utilities to help migrate from the old monolithic service
 * to the new clean implementation.
 */

import type { PictographData } from "$lib/domain/PictographData";
import { CodexService as OldCodexService } from "./CodexService";
import { CodexService as NewCodexService } from "./CodexService.clean";

export class CodexServiceMigrationHelper {
  private oldService: OldCodexService;
  private newService: NewCodexService;

  constructor() {
    this.oldService = new OldCodexService();
    this.newService = new NewCodexService();
  }

  /**
   * Compare results between old and new services to ensure compatibility
   */
  async validateMigration(): Promise<{
    success: boolean;
    issues: string[];
    summary: {
      oldPictographCount: number;
      newPictographCount: number;
      matchingPictographs: number;
      missingInNew: string[];
      extraInNew: string[];
    };
  }> {
    console.log("🔍 Starting migration validation...");

    const issues: string[] = [];

    try {
      // Load pictographs from both services
      const [oldPictographs, newPictographs] = await Promise.all([
        this.oldService.loadAllPictographs(),
        this.newService.loadAllPictographs(),
      ]);

      // Create maps for easy comparison
      const oldMap = new Map<string, PictographData>();
      const newMap = new Map<string, PictographData>();

      oldPictographs.forEach((p) => {
        if (p.letter) oldMap.set(p.letter, p);
      });

      newPictographs.forEach((p) => {
        if (p.letter) newMap.set(p.letter, p);
      });

      // Find differences
      const missingInNew: string[] = [];
      const extraInNew: string[] = [];
      let matchingPictographs = 0;

      // Check what's in old but not in new
      for (const letter of oldMap.keys()) {
        if (newMap.has(letter)) {
          matchingPictographs++;
        } else {
          missingInNew.push(letter);
          issues.push(
            `Letter '${letter}' found in old service but missing in new service`
          );
        }
      }

      // Check what's in new but not in old
      for (const letter of newMap.keys()) {
        if (!oldMap.has(letter)) {
          extraInNew.push(letter);
          issues.push(
            `Letter '${letter}' found in new service but missing in old service`
          );
        }
      }

      // Test specific methods
      await this.validateSpecificMethods(issues);

      const success = issues.length === 0;

      console.log(
        success
          ? "✅ Migration validation passed!"
          : "❌ Migration validation found issues"
      );

      return {
        success,
        issues,
        summary: {
          oldPictographCount: oldPictographs.length,
          newPictographCount: newPictographs.length,
          matchingPictographs,
          missingInNew,
          extraInNew,
        },
      };
    } catch (error) {
      const errorMessage = `Migration validation failed: ${error}`;
      console.error("❌", errorMessage);
      return {
        success: false,
        issues: [errorMessage],
        summary: {
          oldPictographCount: 0,
          newPictographCount: 0,
          matchingPictographs: 0,
          missingInNew: [],
          extraInNew: [],
        },
      };
    }
  }

  /**
   * Test specific methods between old and new services
   */
  private async validateSpecificMethods(issues: string[]): Promise<void> {
    try {
      // Test getLettersByRow
      const oldRows = this.oldService.getLettersByRow();
      const newRows = this.newService.getLettersByRow();

      if (JSON.stringify(oldRows) !== JSON.stringify(newRows)) {
        issues.push(
          "getLettersByRow() results differ between old and new services"
        );
      }

      // Test searchPictographs with a common letter
      const [oldSearch, newSearch] = await Promise.all([
        this.oldService.searchPictographs("A"),
        this.newService.searchPictographs("A"),
      ]);

      if (oldSearch.length !== newSearch.length) {
        issues.push(
          `searchPictographs('A') returned different counts: old=${oldSearch.length}, new=${newSearch.length}`
        );
      }

      // Test getPictographByLetter
      const [oldA, newA] = await Promise.all([
        this.oldService.getPictographByLetter("A"),
        this.newService.getPictographByLetter("A"),
      ]);

      if (!!oldA !== !!newA) {
        issues.push(
          "getPictographByLetter('A') availability differs between services"
        );
      }
    } catch (error) {
      issues.push(`Error during specific method validation: ${error}`);
    }
  }

  /**
   * Generate a migration report
   */
  async generateMigrationReport(): Promise<string> {
    const validation = await this.validateMigration();

    let report = "# Codex Service Migration Report\n\n";

    if (validation.success) {
      report += "## ✅ Migration Status: SUCCESS\n\n";
      report +=
        "The new clean CodexService implementation is ready to replace the old monolithic version.\n\n";
    } else {
      report += "## ❌ Migration Status: ISSUES FOUND\n\n";
      report +=
        "The following issues need to be addressed before migration:\n\n";

      validation.issues.forEach((issue, index) => {
        report += `${index + 1}. ${issue}\n`;
      });
      report += "\n";
    }

    report += "## Summary\n\n";
    report += `- Old service pictographs: ${validation.summary.oldPictographCount}\n`;
    report += `- New service pictographs: ${validation.summary.newPictographCount}\n`;
    report += `- Matching pictographs: ${validation.summary.matchingPictographs}\n`;

    if (validation.summary.missingInNew.length > 0) {
      report += `- Missing in new service: ${validation.summary.missingInNew.join(", ")}\n`;
    }

    if (validation.summary.extraInNew.length > 0) {
      report += `- Extra in new service: ${validation.summary.extraInNew.join(", ")}\n`;
    }

    report += "\n## Architecture Changes\n\n";
    report += "The new implementation features:\n";
    report += "- ✅ Separated configuration data from business logic\n";
    report += "- ✅ Clean repository pattern for data access\n";
    report += "- ✅ Dependency injection for better testability\n";
    report += "- ✅ Single responsibility principle\n";
    report += "- ✅ No hardcoded mappings in service code\n";
    report += "- ✅ Extensible lesson system\n";
    report += "- ✅ Type-safe configuration loading\n\n";

    return report;
  }
}
