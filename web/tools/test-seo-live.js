#!/usr/bin/env node

/**
 * Live SEO System Test
 * Tests the actual running dev server to demonstrate SEO functionality
 */

// import { get } from "http";

// Auto-detect running dev server port
async function findDevServerPort() {
  const commonPorts = [5173, 5174, 5175, 5176, 5177];

  console.log("🔍 Checking for running dev server...");

  for (const port of commonPorts) {
    try {
      console.log(`   Trying port ${port}...`);
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
      console.log(`   ❌ Port ${port}: ${error.message.substring(0, 50)}...`);
    }
  }

  // Check if we can at least see the process is running
  console.log("\n🔍 Manual verification steps:");
  console.log("1. Check if dev server is running: npm run dev");
  console.log(
    "2. If running, try opening http://localhost:5173 in your browser"
  );
  console.log("3. This might be a Windows/WSL networking issue");

  throw new Error(
    `❌ No dev server found on common ports: ${commonPorts.join(", ")}`
  );
}

let baseUrl = ""; // Will be set by findDevServerPort()

// Common search engine user agents
const userAgents = {
  googlebot:
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  bingbot:
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
  facebookBot:
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  twitterBot: "Twitterbot/1.0",
  regularUser:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
};

async function testEndpoint(path, userAgent, botName) {
  try {
    console.log(`\n🔍 Testing ${path} as ${botName}:`);
    console.log(`   User-Agent: ${userAgent.substring(0, 60)}...`);

    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        "User-Agent": userAgent,
      },
    });

    if (!response.ok) {
      console.log(`   ❌ Status: ${response.status} ${response.statusText}`);
      return;
    }

    const content = await response.text();
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   📄 Content-Type: ${response.headers.get("content-type")}`);
    console.log(`   📏 Content Length: ${content.length} chars`);

    // Check for key SEO elements
    if (content.includes("<title>")) {
      const titleMatch = content.match(/<title>(.*?)<\/title>/);
      if (titleMatch) {
        console.log(`   🏷️  Title: "${titleMatch[1]}"`);
      }
    }

    if (content.includes('<meta name="description"')) {
      const descMatch = content.match(
        /<meta name="description" content="(.*?)"/
      );
      if (descMatch) {
        console.log(`   📝 Description: "${descMatch[1].substring(0, 80)}..."`);
      }
    }

    // Check for structured data
    if (content.includes('"@type"')) {
      console.log(`   🏗️  Structured data detected`);
    }

    // Check for bot-specific redirects
    if (content.includes("window.location.href") || content.includes("tab-")) {
      console.log(`   🔄 User redirect detected`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function testSEOSystem() {
  console.log("🚀 Testing SEO System Live (auto-detecting server port)");
  console.log("=".repeat(60));

  // Auto-detect the running dev server
  try {
    baseUrl = await findDevServerPort();
  } catch (error) {
    console.log(error.message);
    console.log("Make sure the dev server is running with: npm run dev");
    return;
  }

  // Test core SEO endpoints
  console.log("\n📋 TESTING CORE SEO ENDPOINTS");
  await testEndpoint("/sitemap.xml", userAgents.googlebot, "Googlebot");
  await testEndpoint("/robots.txt", userAgents.googlebot, "Googlebot");

  // Test SEO pages with different bots
  console.log("\n🤖 TESTING BOT BEHAVIOR");
  const testPages = ["/about", "/learn", "/practice"];

  for (const page of testPages) {
    await testEndpoint(page, userAgents.googlebot, "Googlebot");
    await testEndpoint(page, userAgents.bingbot, "Bingbot");
    await testEndpoint(page, userAgents.facebookBot, "Facebook Bot");
  }

  // Test user behavior
  console.log("\n👤 TESTING USER BEHAVIOR");
  for (const page of testPages) {
    await testEndpoint(page, userAgents.regularUser, "Regular User");
  }

  console.log("\n✅ SEO System Test Complete!");
  console.log("\nKey Observations:");
  console.log("- Bots should see server-rendered pages with full SEO metadata");
  console.log("- Users should be redirected to SPA with tab navigation");
  console.log(
    "- sitemap.xml and robots.txt should be accessible to all crawlers"
  );
}

// Run the test
testSEOSystem();
