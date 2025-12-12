/**
 * Deep Ocean Performance Test
 *
 * Runs automated performance analysis on the deep ocean background.
 * Usage: node scripts/deep-ocean-perf-test.cjs
 *
 * Requires: Dev server running on localhost:5173 or 5174
 */

const { chromium } = require('playwright');

const TEST_DURATION_MS = 15000; // 15 seconds of data collection
const SAMPLE_INTERVAL_MS = 200; // Collect metrics every 200ms for more granularity

async function runPerformanceTest() {
  console.log('🌊 Deep Ocean Performance Test\n');
  console.log('Starting browser...');

  const browser = await chromium.launch({ headless: false }); // headless: false to see it
  const context = await browser.newContext();
  const page = await context.newPage();

  // Try common dev ports
  let connected = false;
  for (const port of [5173, 5174, 5175]) {
    try {
      await page.goto(`http://localhost:${port}`, { timeout: 5000 });
      connected = true;
      console.log(`Connected to localhost:${port}`);
      break;
    } catch {
      continue;
    }
  }

  if (!connected) {
    console.error('❌ Could not connect to dev server. Run "npm run dev" first.');
    await browser.close();
    process.exit(1);
  }

  // Wait for app to load
  await page.waitForTimeout(3000);

  // Navigate to settings and switch to Deep Ocean theme
  console.log('Switching to Deep Ocean background...');

  try {
    // Click settings
    await page.click('button:has-text("Settings")');
    await page.waitForTimeout(500);

    // Click Theme tab
    await page.click('button:has-text("Theme")');
    await page.waitForTimeout(500);

    // Find and click Deep Ocean option
    await page.click('text=Deep Ocean');
    await page.waitForTimeout(1000);

    // Go back to main app
    await page.click('button:has-text("Back")');
    await page.waitForTimeout(500);
  } catch (e) {
    console.log('Note: Could not auto-switch theme. Please manually select Deep Ocean background.');
  }

  // Enable performance monitoring and inject frame jank detector
  console.log('Enabling performance monitor...');
  await page.evaluate(() => {
    if (typeof window.enableDeepOceanPerf === 'function') {
      window.enableDeepOceanPerf();
    } else {
      console.warn('Performance monitor not found');
    }

    // Inject frame-level jank detection
    window.__frameJanks = [];
    window.__lastFrameTime = performance.now();
    window.__frameCount = 0;

    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = function(callback) {
      return originalRAF.call(window, function(timestamp) {
        const now = performance.now();
        const delta = now - window.__lastFrameTime;
        window.__lastFrameTime = now;
        window.__frameCount++;

        // Detect jank: frame took > 20ms (less than 50fps)
        if (delta > 20 && window.__frameCount > 10) {
          window.__frameJanks.push({
            frame: window.__frameCount,
            delta: delta,
            timestamp: now
          });
        }

        callback(timestamp);
      });
    };
  });

  // Wait for monitor to initialize
  await page.waitForTimeout(1000);

  // Collect metrics over time
  console.log(`\nCollecting metrics for ${TEST_DURATION_MS / 1000} seconds...\n`);

  const samples = [];
  const startTime = Date.now();

  while (Date.now() - startTime < TEST_DURATION_MS) {
    const metrics = await page.evaluate(() => {
      if (typeof window.getDeepOceanMetrics === 'function') {
        return window.getDeepOceanMetrics();
      }
      return null;
    });

    if (metrics && metrics.fps > 0) {
      samples.push({
        timestamp: Date.now() - startTime,
        ...metrics
      });

      process.stdout.write(`\rFPS: ${metrics.fps} | Frame: ${metrics.frameTime.toFixed(2)}ms | Update: ${metrics.updateTime.toFixed(2)}ms | Render: ${metrics.renderTime.toFixed(2)}ms | Fish: ${metrics.fishCount}`);
    }

    await page.waitForTimeout(SAMPLE_INTERVAL_MS);
  }

  console.log('\n\n📊 Results:\n');

  if (samples.length === 0) {
    console.log('❌ No metrics collected. Make sure Deep Ocean background is active.');
    await browser.close();
    process.exit(1);
  }

  // Calculate statistics
  const stats = {
    fps: calculateStats(samples.map(s => s.fps)),
    frameTime: calculateStats(samples.map(s => s.frameTime)),
    updateTime: calculateStats(samples.map(s => s.updateTime)),
    renderTime: calculateStats(samples.map(s => s.renderTime)),
    fishCount: calculateStats(samples.map(s => s.fishCount)),
    jellyfishCount: calculateStats(samples.map(s => s.jellyfishCount)),
    bubbleCount: calculateStats(samples.map(s => s.bubbleCount)),
  };

  // Print results
  console.log('┌─────────────────┬─────────┬─────────┬─────────┬─────────┐');
  console.log('│ Metric          │   Min   │   Avg   │   Max   │  StdDev │');
  console.log('├─────────────────┼─────────┼─────────┼─────────┼─────────┤');
  console.log(`│ FPS             │ ${pad(stats.fps.min)} │ ${pad(stats.fps.avg)} │ ${pad(stats.fps.max)} │ ${pad(stats.fps.stdDev)} │`);
  console.log(`│ Frame Time (ms) │ ${pad(stats.frameTime.min)} │ ${pad(stats.frameTime.avg)} │ ${pad(stats.frameTime.max)} │ ${pad(stats.frameTime.stdDev)} │`);
  console.log(`│ Update Time(ms) │ ${pad(stats.updateTime.min)} │ ${pad(stats.updateTime.avg)} │ ${pad(stats.updateTime.max)} │ ${pad(stats.updateTime.stdDev)} │`);
  console.log(`│ Render Time(ms) │ ${pad(stats.renderTime.min)} │ ${pad(stats.renderTime.avg)} │ ${pad(stats.renderTime.max)} │ ${pad(stats.renderTime.stdDev)} │`);
  console.log('└─────────────────┴─────────┴─────────┴─────────┴─────────┘');

  console.log(`\nEntity counts: ${stats.fishCount.avg.toFixed(0)} fish, ${stats.jellyfishCount.avg.toFixed(0)} jellyfish, ${stats.bubbleCount.avg.toFixed(0)} bubbles`);
  console.log(`Samples collected: ${samples.length}`);

  // Performance assessment
  console.log('\n🔍 Assessment:\n');

  const issues = [];

  if (stats.fps.avg < 55) {
    issues.push(`⚠️  Low average FPS (${stats.fps.avg.toFixed(1)}). Target: 60`);
  }
  if (stats.fps.min < 30) {
    issues.push(`🔴 FPS drops below 30 (min: ${stats.fps.min}). Causes visible jank.`);
  }
  if (stats.frameTime.max > 33) {
    issues.push(`⚠️  Frame time spikes (max: ${stats.frameTime.max.toFixed(1)}ms). Target: <16.67ms`);
  }
  if (stats.frameTime.stdDev > 5) {
    issues.push(`⚠️  High frame time variance (stdDev: ${stats.frameTime.stdDev.toFixed(2)}ms). Causes perceived jank.`);
  }
  if (stats.updateTime.avg > 5) {
    issues.push(`⚠️  Update logic taking too long (avg: ${stats.updateTime.avg.toFixed(2)}ms). Consider optimizing physics/animation.`);
  }
  if (stats.renderTime.avg > 10) {
    issues.push(`⚠️  Render taking too long (avg: ${stats.renderTime.avg.toFixed(2)}ms). Consider reducing draw calls.`);
  }

  if (issues.length === 0) {
    console.log('✅ Performance looks good! No major issues detected.');
  } else {
    issues.forEach(issue => console.log(issue));
  }

  // Breakdown analysis
  console.log('\n📈 Time Budget Breakdown (target: 16.67ms per frame):');
  const totalTime = stats.updateTime.avg + stats.renderTime.avg;
  const updatePct = (stats.updateTime.avg / 16.67 * 100).toFixed(1);
  const renderPct = (stats.renderTime.avg / 16.67 * 100).toFixed(1);
  const remainingPct = Math.max(0, ((16.67 - totalTime) / 16.67 * 100)).toFixed(1);

  console.log(`  Update: ${stats.updateTime.avg.toFixed(2)}ms (${updatePct}% of budget)`);
  console.log(`  Render: ${stats.renderTime.avg.toFixed(2)}ms (${renderPct}% of budget)`);
  console.log(`  Remaining: ${Math.max(0, 16.67 - totalTime).toFixed(2)}ms (${remainingPct}% headroom)`);

  // Get frame-level jank data
  const jankData = await page.evaluate(() => {
    return {
      janks: window.__frameJanks || [],
      totalFrames: window.__frameCount || 0
    };
  });

  console.log('\n🎯 Frame-Level Jank Analysis:');
  console.log(`  Total frames: ${jankData.totalFrames}`);
  console.log(`  Jank events (>20ms): ${jankData.janks.length}`);

  if (jankData.janks.length > 0) {
    const jankDeltas = jankData.janks.map(j => j.delta);
    const avgJank = jankDeltas.reduce((a, b) => a + b, 0) / jankDeltas.length;
    const maxJank = Math.max(...jankDeltas);
    const jankRate = (jankData.janks.length / jankData.totalFrames * 100).toFixed(2);

    console.log(`  Jank rate: ${jankRate}% of frames`);
    console.log(`  Avg jank duration: ${avgJank.toFixed(1)}ms`);
    console.log(`  Worst jank: ${maxJank.toFixed(1)}ms`);

    if (jankData.janks.length <= 10) {
      console.log('\n  Individual janks:');
      jankData.janks.forEach(j => {
        console.log(`    Frame ${j.frame}: ${j.delta.toFixed(1)}ms`);
      });
    } else {
      console.log('\n  Worst 10 janks:');
      jankData.janks
        .sort((a, b) => b.delta - a.delta)
        .slice(0, 10)
        .forEach(j => {
          console.log(`    Frame ${j.frame}: ${j.delta.toFixed(1)}ms`);
        });
    }
  } else {
    console.log('  ✅ No frame janks detected!');
  }

  await browser.close();
  console.log('\n✅ Test complete.');
}

function calculateStats(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg,
    stdDev: Math.sqrt(variance),
  };
}

function pad(num, width = 7) {
  return num.toFixed(2).padStart(width);
}

runPerformanceTest().catch(console.error);
