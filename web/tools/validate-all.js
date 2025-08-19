#!/usr/bin/env node

/**
 * TKA Web App - Comprehensive Validation Script
 *
 * This script runs all type checks, linting, tests, and validations
 * to ensure the codebase is in perfect condition.
 *
 * Usage:
 *   node tools/validate-all.js
 *   npm run validate:all
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// ANSI color codes for better output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Validation steps configuration
const validationSteps = [
  {
    name: "Type Checking",
    description: "Running Svelte type checking and TypeScript validation",
    command: "npm",
    args: ["run", "check"],
    icon: "🔍",
  },
  {
    name: "Code Linting",
    description: "Running Prettier and ESLint checks",
    command: "npm",
    args: ["run", "lint"],
    icon: "✨",
  },
  {
    name: "Unit Tests",
    description: "Running Vitest unit tests",
    command: "npm",
    args: ["run", "test", "--run"],
    icon: "🧪",
  },
  {
    name: "Architecture Validation",
    description: "Validating project architecture and patterns",
    command: "npm",
    args: ["run", "arch:validate"],
    icon: "🏗️",
    optional: true,
  },
  {
    name: "SEO Validation",
    description: "Validating SEO configuration and metadata",
    command: "npm",
    args: ["run", "validate:seo"],
    icon: "🔍",
  },
  {
    name: "SEO Integration Tests",
    description: "Running Playwright SEO integration tests",
    command: "npm",
    args: ["run", "test:seo"],
    icon: "🎭",
  },
];

/**
 * Executes a command and returns a promise
 */
function runCommand(command, args, cwd = projectRoot) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      cwd,
      stdio: "pipe",
      shell: true,
    });

    let stdout = "";
    let stderr = "";

    process.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("close", (code) => {
      resolve({
        code,
        stdout,
        stderr,
        success: code === 0,
      });
    });

    process.on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Prints a formatted header
 */
function printHeader() {
  console.log(`${colors.cyan}${colors.bright}`);
  console.log(
    "╔══════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║                    TKA Web App Validator                     ║"
  );
  console.log(
    "║              Comprehensive Quality Assurance                ║"
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════╝"
  );
  console.log(`${colors.reset}\n`);
}

/**
 * Prints step information
 */
function printStep(step, index, total) {
  console.log(
    `${colors.blue}${colors.bright}[${index + 1}/${total}] ${step.icon} ${step.name}${colors.reset}`
  );
  console.log(`${colors.yellow}${step.description}${colors.reset}`);
  console.log(
    `${colors.magenta}Running: ${step.command} ${step.args.join(" ")}${colors.reset}\n`
  );
}

/**
 * Prints step result
 */
function printResult(step, result, duration) {
  const status = result.success
    ? `${colors.green}✅ PASSED${colors.reset}`
    : `${colors.red}❌ FAILED${colors.reset}`;

  console.log(`${status} ${step.name} (${duration}ms)\n`);

  if (!result.success) {
    console.log(`${colors.red}${colors.bright}Error Output:${colors.reset}`);
    console.log(
      `${colors.red}${result.stderr || result.stdout}${colors.reset}\n`
    );
  }
}

/**
 * Prints final summary
 */
function printSummary(results, totalDuration) {
  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => r.success === false).length;
  const requiredFailed = results.filter(
    (r) => r.success === false && !r.optional
  ).length;
  const optionalFailed = results.filter(
    (r) => r.success === false && r.optional
  ).length;
  const total = results.length;

  console.log(`${colors.cyan}${colors.bright}`);
  console.log(
    "╔══════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║                      VALIDATION SUMMARY                     ║"
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════╝"
  );
  console.log(`${colors.reset}`);

  console.log(
    `${colors.bright}Total Duration: ${totalDuration}ms${colors.reset}`
  );
  console.log(`${colors.green}✅ Passed: ${passed}/${total}${colors.reset}`);

  if (failed > 0) {
    if (requiredFailed > 0) {
      console.log(
        `${colors.red}❌ Required Failed: ${requiredFailed}/${total}${colors.reset}`
      );
    }
    if (optionalFailed > 0) {
      console.log(
        `${colors.yellow}⚠️  Optional Failed: ${optionalFailed}/${total}${colors.reset}`
      );
    }

    console.log(`\n${colors.red}${colors.bright}Failed Steps:${colors.reset}`);

    results.forEach((result, index) => {
      if (!result.success) {
        const prefix = result.optional
          ? `${colors.yellow}⚠️ `
          : `${colors.red}❌`;
        const suffix = result.optional
          ? ` (optional)${colors.reset}`
          : `${colors.reset}`;
        console.log(`${prefix}  • ${validationSteps[index].name}${suffix}`);
      }
    });
  }

  console.log();

  if (failed === 0) {
    console.log(
      `${colors.green}${colors.bright}🎉 ALL VALIDATIONS PASSED! 🎉${colors.reset}`
    );
    console.log(
      `${colors.green}Your codebase is in perfect condition!${colors.reset}\n`
    );
  } else if (requiredFailed === 0) {
    console.log(
      `${colors.green}${colors.bright}✅ REQUIRED VALIDATIONS PASSED! ✅${colors.reset}`
    );
    console.log(
      `${colors.yellow}Some optional validations failed, but your codebase is ready!${colors.reset}\n`
    );
  } else {
    console.log(
      `${colors.red}${colors.bright}💥 VALIDATION FAILURES DETECTED 💥${colors.reset}`
    );
    console.log(
      `${colors.red}Please fix the required issues above before proceeding.${colors.reset}\n`
    );
  }
}

/**
 * Main validation function
 */
async function runValidation() {
  printHeader();

  const startTime = Date.now();
  const results = [];

  for (let i = 0; i < validationSteps.length; i++) {
    const step = validationSteps[i];
    printStep(step, i, validationSteps.length);

    const stepStartTime = Date.now();

    try {
      const result = await runCommand(step.command, step.args);
      const duration = Date.now() - stepStartTime;

      results.push(result);
      printResult(step, result, duration);

      // If a step fails, we continue but track the failure
      if (!result.success) {
        if (step.optional) {
          console.log(
            `${colors.yellow}⚠️  Optional step failed, continuing...${colors.reset}\n`
          );
        } else {
          console.log(
            `${colors.yellow}Continuing with remaining validations...${colors.reset}\n`
          );
        }
      }
    } catch (error) {
      const duration = Date.now() - stepStartTime;
      const result = {
        success: false,
        error: error.message,
        optional: step.optional,
      };

      results.push(result);
      printResult(step, result, duration);

      if (step.optional) {
        console.log(
          `${colors.yellow}⚠️  Optional step failed, continuing...${colors.reset}\n`
        );
      } else {
        console.log(
          `${colors.yellow}Continuing with remaining validations...${colors.reset}\n`
        );
      }
    }
  }

  const totalDuration = Date.now() - startTime;
  printSummary(results, totalDuration);

  // Exit with error code if any non-optional validations failed
  const hasFailures = results.some((r) => !r.success && !r.optional);
  process.exit(hasFailures ? 1 : 0);
}

// Run the validation
runValidation().catch((error) => {
  console.error(
    `${colors.red}${colors.bright}Fatal Error:${colors.reset}`,
    error
  );
  process.exit(1);
});
