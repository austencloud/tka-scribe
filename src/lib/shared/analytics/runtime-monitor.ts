/**
 * Runtime Performance Monitor - A+ Performance Utility
 *
 * 🚀 PERFORMANCE: Real-time monitoring of FPS, long tasks, and jank.
 * Uses PerformanceObserver to detect performance issues as they happen.
 *
 * Usage:
 *   import { runtimeMonitor } from '$lib/shared/analytics/runtime-monitor';
 *   runtimeMonitor.start();
 */

interface LongTaskEntry {
  name: string;
  duration: number;
  startTime: number;
  attribution: string;
}

interface LayoutShiftEntry {
  value: number;
  hadRecentInput: boolean;
  sources: string[];
}

interface MonitorStats {
  fps: number;
  avgFps: number;
  longTasks: LongTaskEntry[];
  layoutShifts: LayoutShiftEntry[];
  cumulativeLayoutShift: number;
}

class RuntimeMonitor {
  private isRunning = false;
  private frameCount = 0;
  private lastFrameTime = 0;
  private fpsHistory: number[] = [];
  private longTasks: LongTaskEntry[] = [];
  private layoutShifts: LayoutShiftEntry[] = [];
  private cumulativeLayoutShift = 0;
  private rafId: number | null = null;
  private observers: PerformanceObserver[] = [];
  private statsCallback: ((stats: MonitorStats) => void) | null = null;

  /**
   * Start monitoring performance
   */
  start(options?: { onStats?: (stats: MonitorStats) => void }): void {
    if (typeof window === "undefined") return;
    if (this.isRunning) return;

    // Only in development
    if (
      !window.location.hostname.includes("localhost") &&
      !window.location.hostname.includes("127.0.0.1")
    ) {
      return;
    }

    this.isRunning = true;
    this.statsCallback = options?.onStats ?? null;

    console.log("🎬 [Runtime Monitor] Started");

    // Start FPS tracking
    this.startFPSTracking();

    // Observe long tasks (>50ms)
    this.observeLongTasks();

    // Observe layout shifts
    this.observeLayoutShifts();
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.isRunning = false;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.observers.forEach((obs) => obs.disconnect());
    this.observers = [];

    console.log("🎬 [Runtime Monitor] Stopped");
    this.report();
  }

  /**
   * Track FPS using requestAnimationFrame
   */
  private startFPSTracking(): void {
    this.lastFrameTime = performance.now();
    this.frameCount = 0;

    const measureFPS = (timestamp: number) => {
      if (!this.isRunning) return;

      this.frameCount++;

      const elapsed = timestamp - this.lastFrameTime;

      // Calculate FPS every second
      if (elapsed >= 1000) {
        const fps = Math.round((this.frameCount * 1000) / elapsed);
        this.fpsHistory.push(fps);

        // Keep last 60 samples
        if (this.fpsHistory.length > 60) {
          this.fpsHistory.shift();
        }

        // Warn on low FPS
        if (fps < 30) {
          console.warn(`🎬 [Runtime Monitor] Low FPS: ${fps}`);
        }

        this.frameCount = 0;
        this.lastFrameTime = timestamp;

        // Call stats callback if provided
        if (this.statsCallback) {
          this.statsCallback(this.getStats());
        }
      }

      this.rafId = requestAnimationFrame(measureFPS);
    };

    this.rafId = requestAnimationFrame(measureFPS);
  }

  /**
   * Observe long tasks (>50ms blocking main thread)
   */
  private observeLongTasks(): void {
    if (!("PerformanceObserver" in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const taskEntry: LongTaskEntry = {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
            attribution:
              (entry as { attribution?: { name: string }[] }).attribution?.[0]?.name ?? "unknown",
          };

          this.longTasks.push(taskEntry);

          // Keep last 50 entries
          if (this.longTasks.length > 50) {
            this.longTasks.shift();
          }

          // Warn on very long tasks (>100ms)
          if (entry.duration > 100) {
            console.warn(
              `🎬 [Runtime Monitor] Long task: ${entry.duration.toFixed(1)}ms`,
              taskEntry.attribution
            );
          }
        }
      });

      observer.observe({ entryTypes: ["longtask"] });
      this.observers.push(observer);
    } catch {
      // Long task observation not supported
    }
  }

  /**
   * Observe layout shifts for CLS tracking
   */
  private observeLayoutShifts(): void {
    if (!("PerformanceObserver" in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shiftEntry = entry as PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
            sources?: { node?: Element }[];
          };

          // Only count unexpected shifts (no recent user input)
          if (!shiftEntry.hadRecentInput) {
            this.cumulativeLayoutShift += shiftEntry.value;

            const layoutShift: LayoutShiftEntry = {
              value: shiftEntry.value,
              hadRecentInput: shiftEntry.hadRecentInput,
              sources:
                shiftEntry.sources?.map((s) => s.node?.nodeName ?? "unknown").slice(0, 3) ?? [],
            };

            this.layoutShifts.push(layoutShift);

            // Warn on significant shifts
            if (shiftEntry.value > 0.1) {
              console.warn(
                `🎬 [Runtime Monitor] Layout shift: ${shiftEntry.value.toFixed(4)}`,
                layoutShift.sources
              );
            }
          }
        }
      });

      observer.observe({ type: "layout-shift", buffered: true });
      this.observers.push(observer);
    } catch {
      // Layout shift observation not supported
    }
  }

  /**
   * Get current stats
   */
  getStats(): MonitorStats {
    const currentFps = this.fpsHistory[this.fpsHistory.length - 1] ?? 0;
    const avgFps =
      this.fpsHistory.length > 0
        ? Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length)
        : 0;

    return {
      fps: currentFps,
      avgFps,
      longTasks: [...this.longTasks],
      layoutShifts: [...this.layoutShifts],
      cumulativeLayoutShift: this.cumulativeLayoutShift,
    };
  }

  /**
   * Generate a performance report
   */
  report(): void {
    const stats = this.getStats();

    console.group("🎬 [Runtime Monitor] Report");
    console.log(`📊 Average FPS: ${stats.avgFps}`);
    console.log(`📊 Long Tasks (>50ms): ${stats.longTasks.length}`);
    console.log(`📊 CLS: ${stats.cumulativeLayoutShift.toFixed(4)}`);

    // FPS quality assessment
    if (stats.avgFps >= 55) {
      console.log("✅ FPS: Excellent (55+ avg)");
    } else if (stats.avgFps >= 45) {
      console.log("⚠️ FPS: Good (45-55 avg)");
    } else {
      console.warn("❌ FPS: Poor (<45 avg)");
    }

    // CLS assessment
    if (stats.cumulativeLayoutShift <= 0.1) {
      console.log("✅ CLS: Good (≤0.1)");
    } else if (stats.cumulativeLayoutShift <= 0.25) {
      console.warn("⚠️ CLS: Needs Improvement (0.1-0.25)");
    } else {
      console.warn("❌ CLS: Poor (>0.25)");
    }

    // Long tasks summary
    if (stats.longTasks.length > 0) {
      const avgDuration =
        stats.longTasks.reduce((a, t) => a + t.duration, 0) / stats.longTasks.length;
      console.log(`📊 Avg Long Task Duration: ${avgDuration.toFixed(1)}ms`);
    }

    console.groupEnd();
  }

  /**
   * Clear all collected data
   */
  clear(): void {
    this.fpsHistory = [];
    this.longTasks = [];
    this.layoutShifts = [];
    this.cumulativeLayoutShift = 0;
    console.log("🎬 [Runtime Monitor] Data cleared");
  }
}

// Singleton instance
export const runtimeMonitor = new RuntimeMonitor();

// Expose to window for debugging
if (typeof window !== "undefined") {
  (window as unknown as { runtimeMonitor: RuntimeMonitor }).runtimeMonitor = runtimeMonitor;
}
