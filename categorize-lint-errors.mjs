import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";

const execAsync = promisify(exec);

try {
  // Run ESLint and capture output
  console.log("Running ESLint...");
  const { stdout, stderr } = await execAsync("npx eslint . --format json", {
    maxBuffer: 10 * 1024 * 1024,
    cwd: process.cwd(),
  });

  const results = JSON.parse(stdout);

  // Categorize errors
  const categories = {
    unusedVars: [],
    unsafeAny: [],
    importSort: [],
    a11y: [],
    errorHandling: [],
    preferNullish: [],
    unnecessaryCondition: [],
    other: [],
  };

  for (const file of results) {
    for (const msg of file.messages) {
      const entry = {
        file: file.filePath.replace(/.*src\\/, "src/").replace(/\\/g, "/"),
        line: msg.line,
        rule: msg.ruleId,
        message: msg.message,
        severity: msg.severity,
      };

      if (
        msg.ruleId?.includes("unused-vars") ||
        msg.ruleId?.includes("no-unused-vars")
      ) {
        categories.unusedVars.push(entry);
      } else if (
        msg.ruleId?.includes("unsafe") ||
        msg.ruleId?.includes("no-explicit-any")
      ) {
        categories.unsafeAny.push(entry);
      } else if (msg.ruleId?.includes("import")) {
        categories.importSort.push(entry);
      } else if (msg.ruleId?.includes("a11y")) {
        categories.a11y.push(entry);
      } else if (
        msg.ruleId?.includes("error") ||
        msg.ruleId?.includes("throw")
      ) {
        categories.errorHandling.push(entry);
      } else if (msg.ruleId?.includes("nullish")) {
        categories.preferNullish.push(entry);
      } else if (msg.ruleId?.includes("unnecessary")) {
        categories.unnecessaryCondition.push(entry);
      } else {
        categories.other.push(entry);
      }
    }
  }

  // Write categorized output
  await fs.writeFile(
    "lint-categories.json",
    JSON.stringify(categories, null, 2)
  );

  // Print summary
  console.log("\n=== LINT ERROR SUMMARY ===");
  console.log(`Unused variables: ${categories.unusedVars.length}`);
  console.log(`Unsafe any/type issues: ${categories.unsafeAny.length}`);
  console.log(`Import sorting: ${categories.importSort.length}`);
  console.log(`Accessibility (a11y): ${categories.a11y.length}`);
  console.log(`Error handling: ${categories.errorHandling.length}`);
  console.log(`Prefer nullish coalescing: ${categories.preferNullish.length}`);
  console.log(
    `Unnecessary conditions: ${categories.unnecessaryCondition.length}`
  );
  console.log(`Other: ${categories.other.length}`);
  console.log(`\nTotal: ${Object.values(categories).flat().length}`);
  console.log("\nCategorized output saved to lint-categories.json");
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
