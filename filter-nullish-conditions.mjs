import fs from "fs";

const eslintOutput = JSON.parse(
  fs.readFileSync("eslint-nullish-output.json", "utf-8")
);

const targetRules = [
  "@typescript-eslint/prefer-nullish-coalescing",
  "@typescript-eslint/no-unnecessary-condition",
];

const filtered = eslintOutput
  .map((file) => ({
    ...file,
    messages: file.messages.filter((msg) => targetRules.includes(msg.ruleId)),
  }))
  .filter((file) => file.messages.length > 0);

console.log(JSON.stringify(filtered, null, 2));
console.error(
  `\nTotal files with errors: ${filtered.length}`
);
console.error(
  `Total errors: ${filtered.reduce((acc, f) => acc + f.messages.length, 0)}`
);

const errorsByRule = {};
filtered.forEach((file) => {
  file.messages.forEach((msg) => {
    errorsByRule[msg.ruleId] = (errorsByRule[msg.ruleId] || 0) + 1;
  });
});

console.error("\nErrors by rule:");
Object.entries(errorsByRule).forEach(([rule, count]) => {
  console.error(`  ${rule}: ${count}`);
});
