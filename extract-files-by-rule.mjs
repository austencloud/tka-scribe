import fs from "fs";

const eslintOutput = JSON.parse(
  fs.readFileSync("filtered-nullish-conditions.json", "utf-8")
);

// Group by rule
const filesByRule = {
  "prefer-nullish-coalescing": [],
  "no-unnecessary-condition": [],
};

eslintOutput.forEach((file) => {
  file.messages.forEach((msg) => {
    const rule = msg.ruleId.replace("@typescript-eslint/", "");
    if (filesByRule[rule]) {
      filesByRule[rule].push({
        filePath: file.filePath,
        line: msg.line,
        column: msg.column,
        message: msg.message,
      });
    }
  });
});

// Write separate files for each rule
Object.entries(filesByRule).forEach(([rule, errors]) => {
  const filename = `errors-${rule}.json`;
  fs.writeFileSync(filename, JSON.stringify(errors, null, 2));
  console.log(`Wrote ${errors.length} ${rule} errors to ${filename}`);
});
