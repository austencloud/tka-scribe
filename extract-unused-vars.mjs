import fs from "fs/promises";

const data = await fs.readFile("eslint-output.json", "utf8");
const results = JSON.parse(data);

const unusedVars = [];

for (const file of results) {
  for (const msg of file.messages) {
    if (
      msg.ruleId?.includes("no-unused-vars") ||
      msg.ruleId === "@typescript-eslint/no-unused-vars"
    ) {
      unusedVars.push({
        file: file.filePath.replace(/.*src\\/, "src/").replace(/\\/g, "/"),
        line: msg.line,
        column: msg.column,
        message: msg.message,
        severity: msg.severity,
      });
    }
  }
}

console.log(`Found ${unusedVars.length} unused variable errors`);
await fs.writeFile(
  "unused-vars-errors.json",
  JSON.stringify(unusedVars, null, 2)
);
console.log("Saved to unused-vars-errors.json");
