#!/usr/bin/env node

/**
 * Quick SEO System Validation Script
 *
 * Run with: node tools/validate-seo.js
 *
 * Tests the core SEO functionality without needing full test suite
 */

import { execSync } from "child_process";

const BASE_URL = "http://localhost:5173";
// const PRODUCTION_URL = "https://thekineticalphabet.com";
const COLORS = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

function log(color, message) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function testEndpoint(url, userAgent = null, expectedContent = null) {
  try {
    const curlCommand = userAgent
      ? `curl -s -H "User-Agent: ${userAgent}" "${url}"`
      : `curl -s "${url}"`;

    const response = execSync(curlCommand, { encoding: "utf8" });

    if (expectedContent && !response.includes(expectedContent)) {
      throw new Error(`Expected content "${expectedContent}" not found`);
    }

    return { success: true, response };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function validateSEOSystem() {
  log("blue", "🔍 Validating SEO Hybrid System...\n");

  const tests = [
    {
      name: "Sitemap Accessibility",
      test: () => testEndpoint(`${BASE_URL}/sitemap.xml`, null, "<urlset"),
    },
    {
      name: "Robots.txt Accessibility",
      test: () => testEndpoint(`${BASE_URL}/robots.txt`, null, "User-agent"),
    },
    {
      name: "About Page for Googlebot",
      test: () =>
        testEndpoint(`${BASE_URL}/about`, "Googlebot/2.1", "About TKA"),
    },
    {
      name: "Features Page for Bingbot",
      test: () =>
        testEndpoint(`${BASE_URL}/features`, "bingbot/2.0", "Features"),
    },
    {
      name: "Browse Page for Facebook",
      test: () =>
        testEndpoint(`${BASE_URL}/browse`, "facebookexternalhit/1.1", "Browse"),
    },
    {
      name: "Main App Accessibility",
      test: () => testEndpoint(`${BASE_URL}/`, null, "TKA"),
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = test.test();

    if (result.success) {
      log("green", `✅ ${test.name}`);
      passed++;
    } else {
      log("red", `❌ ${test.name}: ${result.error}`);
      failed++;
    }
  }

  log("blue", "\n📊 Test Results:");
  log("green", `✅ Passed: ${passed}`);
  if (failed > 0) {
    log("red", `❌ Failed: ${failed}`);
  }

  if (failed === 0) {
    log("green", "\n🎉 All SEO system tests passed!");
    log("yellow", "\n📝 Next steps:");
    log("yellow", "1. Run manual tests from MANUAL_TESTING_CHECKLIST.md");
    log("yellow", "2. Test with real search engine tools");
    log("yellow", "3. Update domain in sitemap and robots.txt");
  } else {
    log("red", "\n⚠️  Some tests failed. Check your dev server is running.");
    log("yellow", "Make sure to run: npm run dev");
  }
}

// Check if dev server is likely running
try {
  execSync(`curl -s ${BASE_URL} > /dev/null`);
  validateSEOSystem();
} catch (error) {
  log("red", "❌ Cannot reach dev server.");
  log("yellow", "Please start the dev server first: npm run dev");
  log("yellow", "Then run this script again.");
}
