#!/usr/bin/env node

/**
 * Quick SEO System Validation Script
 *
 * Run with: node tools/validate-seo.js
 *
 * Tests the core SEO functionality without needing full test suite
 */

// Auto-detect running dev server port
async function findDevServerPort() {
  const commonPorts = [5173, 5174, 5175, 5176, 5177];

  for (const port of commonPorts) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`http://localhost:${port}`, {
        method: "HEAD",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(`✅ Found dev server running on port ${port}`);
        return `http://localhost:${port}`;
      }
    } catch (error) {
      // Port not available, continue checking
    }
  }

  throw new Error(
    `❌ No dev server found on common ports: ${commonPorts.join(", ")}`
  );
}

let BASE_URL = ""; // Will be set by findDevServerPort()
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

async function testEndpoint(url, userAgent = null, expectedContent = null) {
  try {
    const headers = {};
    if (userAgent) {
      headers["User-Agent"] = userAgent;
    }

    const response = await fetch(url, { headers });
    const text = await response.text();

    if (expectedContent && !text.includes(expectedContent)) {
      throw new Error(`Expected content "${expectedContent}" not found`);
    }

    return { success: true, response: text, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function validateSEOSystem() {
  log(
    "blue",
    "🔍 Validating SEO Hybrid System (auto-detecting server port)...\n"
  );

  // Auto-detect the running dev server
  try {
    BASE_URL = await findDevServerPort();
  } catch (error) {
    log("red", error.message);
    log("yellow", "Make sure the dev server is running with: npm run dev");
    return;
  }

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
      test: () => testEndpoint(`${BASE_URL}/about`, "Googlebot/2.1", "TKA"),
    },
    {
      name: "Features Page for Bingbot",
      test: () => testEndpoint(`${BASE_URL}/features`, "bingbot/2.0", "TKA"),
    },
    {
      name: "Browse Page for Facebook",
      test: () =>
        testEndpoint(`${BASE_URL}/browse`, "facebookexternalhit/1.1", "TKA"),
    },
    {
      name: "Main App Accessibility",
      test: () => testEndpoint(`${BASE_URL}/`, null, "TKA"),
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test.test();

    if (result.success) {
      log("green", `✅ ${test.name} (Status: ${result.status})`);
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
    log("yellow", "1. Test user redirects in browser manually");
    log("yellow", "2. Test with real search engine tools when deployed");
    log("yellow", "3. Verify meta tags after build/deploy");
  } else {
    log("red", "\n⚠️  Some tests failed. Check your dev server is running.");
    log("yellow", "Make sure to run: npm run dev");
  }
}

// Run the validation
validateSEOSystem();
