/**
 * Comprehensive Render Debug System
 *
 * Captures all rendering metrics to diagnose clipping issues
 */

export interface RenderMetrics {
  // SVG Generation
  svgViewBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  svgBBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  svgSize: {
    width: number;
    height: number;
  };

  // Canvas Creation
  canvasSize: {
    width: number;
    height: number;
  };
  beatSize: number;

  // Layout
  layout: {
    columns: number;
    rows: number;
    totalBeats: number;
  };

  // Clipping Detection
  isClipped: boolean;
  clippingAmount: {
    right: number;
    bottom: number;
  };

  // Timestamp
  timestamp: string;
  beatId: string;
}

export class RenderDebugger {
  private static metrics: Map<string, RenderMetrics> = new Map();
  private static enabled = true;

  static captureMetrics(beatId: string, metrics: RenderMetrics): void {
    if (!this.enabled) return;

    this.metrics.set(beatId, metrics);

    // Log to console with clear formatting
    console.group(`🔍 RENDER METRICS: ${beatId}`);
    console.log("📦 SVG ViewBox:", metrics.svgViewBox);
    console.log("📐 SVG BBox (actual content):", metrics.svgBBox);
    console.log("🖼️ SVG Size:", metrics.svgSize);
    console.log("🎨 Canvas Size:", metrics.canvasSize);
    console.log("📏 Beat Size:", metrics.beatSize);
    console.log("📊 Layout:", metrics.layout);

    if (metrics.isClipped) {
      console.error("❌ CLIPPING DETECTED!", {
        rightClip: metrics.clippingAmount.right,
        bottomClip: metrics.clippingAmount.bottom,
      });
    } else {
      console.log("✅ No clipping detected");
    }

    console.groupEnd();
  }

  static getMetrics(beatId: string): RenderMetrics | undefined {
    return this.metrics.get(beatId);
  }

  static getAllMetrics(): RenderMetrics[] {
    return Array.from(this.metrics.values());
  }

  static clearMetrics(): void {
    this.metrics.clear();
  }

  static generateReport(): string {
    const allMetrics = this.getAllMetrics();

    if (allMetrics.length === 0) {
      return "No render metrics captured";
    }

    const clippedBeats = allMetrics.filter((m) => m.isClipped);

    let report = "=== RENDER DIAGNOSTIC REPORT ===\n\n";
    report += `Total Beats Rendered: ${allMetrics.length}\n`;
    report += `Beats With Clipping: ${clippedBeats.length}\n\n`;

    if (clippedBeats.length > 0) {
      report += "🚨 CLIPPING ISSUES DETECTED:\n\n";
      clippedBeats.forEach((m) => {
        report += `Beat: ${m.beatId}\n`;
        report += `  ViewBox: ${m.svgViewBox.width}x${m.svgViewBox.height}\n`;
        report += `  Actual Content: ${m.svgBBox.width}x${m.svgBBox.height}\n`;
        report += `  Canvas: ${m.canvasSize.width}x${m.canvasSize.height}\n`;
        report += `  Right Clip: ${m.clippingAmount.right}px\n`;
        report += `  Bottom Clip: ${m.clippingAmount.bottom}px\n\n`;
      });
    } else {
      report += "✅ No clipping detected in any beats\n";
    }

    // Add metrics table
    report += "\n=== DETAILED METRICS ===\n\n";
    allMetrics.forEach((m) => {
      report += `${m.beatId}:\n`;
      report += `  ViewBox: ${m.svgViewBox.width}x${m.svgViewBox.height}\n`;
      report += `  BBox: ${m.svgBBox.width}x${m.svgBBox.height} (at ${m.svgBBox.x},${m.svgBBox.y})\n`;
      report += `  Canvas: ${m.canvasSize.width}x${m.canvasSize.height}\n`;
      report += `  Beat Size: ${m.beatSize}px\n\n`;
    });

    return report;
  }

  static setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// Make available globally for browser console access
if (typeof window !== "undefined") {
  interface WindowWithDebug extends Window {
    __TKA_RENDER_DEBUG__?: typeof RenderDebugger;
  }
  (window as WindowWithDebug).__TKA_RENDER_DEBUG__ = RenderDebugger;
}
