import { readFileSync, writeFileSync } from "fs";

const data = JSON.parse(readFileSync("eslint-output.json", "utf-8"));

const targetRules = [
  "@typescript-eslint/no-unsafe-assignment",
  "@typescript-eslint/no-unsafe-member-access",
  "@typescript-eslint/no-unsafe-argument",
  "@typescript-eslint/no-unsafe-call",
  "@typescript-eslint/no-explicit-any",
];

const results = [];

data.forEach((file) => {
  const relevantMessages = file.messages.filter((msg) =>
    targetRules.includes(msg.ruleId)
  );

  if (relevantMessages.length > 0) {
    results.push({
      file: file.filePath,
      messages: relevantMessages.map((msg) => ({
        line: msg.line,
        column: msg.column,
        rule: msg.ruleId,
        message: msg.message,
      })),
    });
  }
});

// Sort by rule type
const byRule = {};
targetRules.forEach((rule) => {
  byRule[rule] = [];
});

results.forEach((result) => {
  result.messages.forEach((msg) => {
    byRule[msg.rule].push({
      file: result.file,
      line: msg.line,
      column: msg.column,
      message: msg.message,
    });
  });
});

// Output summary
console.log("TypeScript Type Safety Issues:\n");
targetRules.forEach((rule) => {
  const count = byRule[rule].length;
  if (count > 0) {
    console.log(`${rule}: ${count} issues`);
  }
});

console.log(
  `\nTotal: ${results.reduce((sum, r) => sum + r.messages.length, 0)} issues\n`
);

// Write detailed output
writeFileSync(
  "typescript-safety-detailed.json",
  JSON.stringify(byRule, null, 2)
);
console.log("Detailed output written to typescript-safety-detailed.json");

// Show first 20 issues for each rule
targetRules.forEach((rule) => {
  if (byRule[rule].length > 0) {
    console.log(`\n\n=== ${rule} ===`);
    byRule[rule].slice(0, 20).forEach((issue) => {
      const fileName = issue.file.split("\\").pop();
      console.log(
        `${fileName}:${issue.line}:${issue.column} - ${issue.message}`
      );
    });
    if (byRule[rule].length > 20) {
      console.log(`... and ${byRule[rule].length - 20} more`);
    }
  }
});
