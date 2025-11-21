import fs from "fs";

const data = fs.readFileSync("eslint-unused-vars-only.json", "utf8");
const results = JSON.parse(data);

const errors = [];

results.forEach((file) => {
  file.messages.forEach((msg) => {
    if (
      msg.ruleId &&
      (msg.ruleId.includes("no-unused-vars") ||
        msg.ruleId.includes("unused-vars"))
    ) {
      errors.push({
        file: file.filePath,
        line: msg.line,
        column: msg.column,
        message: msg.message,
        ruleId: msg.ruleId,
      });
    }
  });
});

console.log(`Total unused variable errors: ${errors.length}\n`);
console.log("Files with errors:");
const fileGroups = {};
errors.forEach((err) => {
  const file = err.file.replace(/\\/g, "/").split("/").slice(-5).join("/");
  if (!fileGroups[file]) fileGroups[file] = [];
  fileGroups[file].push(err);
});

Object.keys(fileGroups)
  .sort()
  .forEach((file) => {
    console.log(`\n${file} (${fileGroups[file].length} errors):`);
    fileGroups[file].forEach((err) => {
      console.log(`  Line ${err.line}: ${err.message}`);
    });
  });

fs.writeFileSync(
  "unused-vars-summary.json",
  JSON.stringify(fileGroups, null, 2)
);
