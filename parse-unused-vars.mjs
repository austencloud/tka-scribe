import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

try {
  const { stdout } = await execAsync("npx eslint .", {
    maxBuffer: 10 * 1024 * 1024,
    cwd: process.cwd(),
  });
  console.log("No eslint errors found!");
} catch (error) {
  // ESLint returns exit code 1 when there are errors, which is expected
  const output = error.stdout || "";
  const lines = output.split("\n");

  let currentFile = "";
  const unusedVarsErrors = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is a file path (contains full path with src)
    if (line.match(/^[A-Z]:\\.*\\src\\/i) || line.match(/^\/.*\/src\//)) {
      // Extract just the src/... part
      const srcMatch = line.match(/(src[\\/].+)$/);
      if (srcMatch) {
        currentFile = srcMatch[1].replace(/\\/g, "/");
      }
    }
    // Check if line contains unused-vars error
    else if (
      line.includes("no-unused-vars") ||
      line.includes("@typescript-eslint/no-unused-vars")
    ) {
      const match = line.match(
        /^\s+(\d+):(\d+)\s+(error|warning)\s+(.+?)\s+(?:no-unused-vars|@typescript-eslint\/no-unused-vars)/
      );
      if (match && currentFile) {
        unusedVarsErrors.push({
          file: currentFile,
          line: match[1],
          column: match[2],
          severity: match[3],
          message: match[4].trim(),
        });
      }
    }
  }

  console.log(
    `\n✅ Found ${unusedVarsErrors.length} unused variable errors:\n`
  );

  // Group by file
  const byFile = {};
  for (const error of unusedVarsErrors) {
    if (!byFile[error.file]) {
      byFile[error.file] = [];
    }
    byFile[error.file].push(error);
  }

  // Print grouped by file
  for (const [file, errors] of Object.entries(byFile)) {
    console.log(`\n📁 ${file} (${errors.length} errors):`);
    for (const error of errors) {
      console.log(`  Line ${error.line}:${error.column} - ${error.message}`);
    }
  }
}
