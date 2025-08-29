#!/usr/bin/env node

/**
 * Interface Implementation Checker
 *
 * Systematically checks that all service implementations properly implement their interfaces.
 * Ensures 1:1 interface-to-implementation mapping is enforced in code.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const implementationsDir = path.join(
  __dirname,
  "src/lib/services/implementations"
);

async function checkInterfaceImplementations() {
  console.log("🔍 Checking interface implementations...\n");

  const issues = [];
  const serviceFiles = await getAllServiceFiles(implementationsDir);

  for (const file of serviceFiles) {
    const content = fs.readFileSync(file, "utf8");
    const relativePath = path.relative(__dirname, file);

    // Skip non-service files
    if (!file.includes("Service.ts") && !file.includes("service.ts")) {
      continue;
    }

    const analysis = analyzeServiceFile(content, relativePath);
    if (analysis.issues.length > 0) {
      issues.push(...analysis.issues);
    }

    // Log findings
    if (analysis.hasInterface) {
      console.log(`✅ ${relativePath}: implements ${analysis.interfaceName}`);
    } else if (analysis.isService) {
      console.log(
        `❌ ${relativePath}: Service class missing interface implementation`
      );
      issues.push({
        file: relativePath,
        issue: "Service class does not implement interface",
        suggestion: `Add "implements I${analysis.className}" to class declaration`,
      });
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`- Total service files checked: ${serviceFiles.length}`);
  console.log(`- Issues found: ${issues.length}`);

  if (issues.length > 0) {
    console.log("\n🚨 Issues found:");
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.file}`);
      console.log(`   Issue: ${issue.issue}`);
      if (issue.suggestion) {
        console.log(`   Suggestion: ${issue.suggestion}`);
      }
      console.log("");
    });
  } else {
    console.log("\n🎉 All service implementations properly use interfaces!");
  }

  return issues.length === 0;
}

function analyzeServiceFile(content, filePath) {
  const issues = [];
  let hasInterface = false;
  let interfaceName = "";
  let className = "";
  let isService = false;

  // Check if it's a service class
  const serviceClassMatch = content.match(/export class (\w*Service\w*)/);
  if (serviceClassMatch) {
    isService = true;
    className = serviceClassMatch[1];
  }

  // Check for interface implementation
  const implementsMatch = content.match(
    /export class \w+\s+implements\s+(\w+)/
  );
  if (implementsMatch) {
    hasInterface = true;
    interfaceName = implementsMatch[1];
  }

  // Check for @injectable decorator
  const hasInjectable = content.includes("@injectable()");

  if (isService && !hasInjectable) {
    issues.push({
      file: filePath,
      issue: "Service class missing @injectable() decorator",
      suggestion: "Add @injectable() decorator above class declaration",
    });
  }

  return {
    hasInterface,
    interfaceName,
    className,
    isService,
    issues,
  };
}

async function getAllServiceFiles(dir) {
  const files = [];

  async function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await traverse(fullPath);
      } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
        files.push(fullPath);
      }
    }
  }

  await traverse(dir);
  return files;
}

// Run the check
checkInterfaceImplementations()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Error checking interfaces:", error);
    process.exit(1);
  });
