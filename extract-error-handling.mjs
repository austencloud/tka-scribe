import fs from "fs";

const data = JSON.parse(fs.readFileSync("error-handling-lint.json", "utf8"));

const errorHandlingRules = [
  "@typescript-eslint/only-throw-error",
  "@typescript-eslint/prefer-promise-reject-errors",
  "no-empty",
];

const errorsByRule = {};

data.forEach((file) => {
  if (file.messages && file.messages.length > 0) {
    file.messages.forEach((msg) => {
      if (errorHandlingRules.includes(msg.ruleId)) {
        if (!errorsByRule[msg.ruleId]) {
          errorsByRule[msg.ruleId] = [];
        }
        errorsByRule[msg.ruleId].push({
          file: file.filePath,
          line: msg.line,
          column: msg.column,
          message: msg.message,
        });
      }
    });
  }
});

console.log("\n=== ERROR HANDLING ISSUES ===\n");

errorHandlingRules.forEach((rule) => {
  const errors = errorsByRule[rule] || [];
  console.log(`\n${rule}: ${errors.length} issues`);

  if (errors.length > 0) {
    errors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err.file}:${err.line}:${err.column}`);
      console.log(`     ${err.message}`);
    });
  }
});

console.log(
  `\n\nTotal error handling issues: ${Object.values(errorsByRule).reduce((sum, arr) => sum + arr.length, 0)}`
);

// Save to file for reference
fs.writeFileSync(
  "error-handling-issues.json",
  JSON.stringify(errorsByRule, null, 2)
);
console.log("\nDetailed results saved to error-handling-issues.json");
