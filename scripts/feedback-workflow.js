#!/usr/bin/env node

/**
 * Feedback Workflow
 *
 * Triggers the Claude Code feedback collection and release flow.
 *
 * This script:
 * 1. Collects completed feedback from Firestore
 * 2. Generates changelog from feedback items
 * 3. Runs the release script with feedback data
 *
 * Usage:
 *   node scripts/feedback-workflow.js
 *
 * Or use AI assistant command: /fb
 * Or use VSCode task: "💬 Feedback Release Flow"
 * Or use npm: npm run feedback:flow
 */

import { execSync } from "child_process";

console.log("\n💬 Starting Feedback Release Flow\n");
console.log("This will run the Claude Code feedback workflow...\n");

try {
  // Run the release script in preview mode first
  console.log("📋 Step 1: Checking completed feedback...\n");
  execSync("node scripts/release.js --preview", { stdio: "inherit" });

  console.log("\n✅ Feedback workflow preview complete!\n");
  console.log("💡 Next steps:\n");
  console.log("   1. Review the changelog preview above");
  console.log("   2. If it looks good, run: node scripts/release.js --confirm");
  console.log('   3. Or in AI chat: "confirm the release"\n');
} catch (error) {
  console.error("❌ Error running feedback workflow:", error.message);
  console.log("\n💡 Troubleshooting:\n");
  console.log("   • Make sure you have completed feedback items in Firestore");
  console.log("   • Check that serviceAccountKey.json is present");
  console.log("   • Verify Firebase connection\n");
  process.exit(1);
}
