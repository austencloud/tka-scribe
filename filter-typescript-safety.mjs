import { spawn } from "child_process";

const targetRules = [
  "no-unsafe-assignment",
  "no-unsafe-member-access",
  "no-unsafe-argument",
  "no-unsafe-call",
  "no-explicit-any",
];

const child = spawn("npm", ["run", "lint"], { shell: true });
let output = "";

child.stdout.on("data", (data) => {
  output += data.toString();
});

child.stderr.on("data", (data) => {
  output += data.toString();
});

child.on("close", () => {
  const lines = output.split("\n");
  const filteredLines = lines.filter((line) =>
    targetRules.some((rule) => line.includes(rule))
  );

  console.log(filteredLines.join("\n"));
  console.log(`\n\nTotal TypeScript safety errors: ${filteredLines.length}`);
});
