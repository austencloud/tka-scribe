/**
 * Sequence Restoration Tester - Svelte Store
 *
 * This provides a reactive testing interface for validating sequence restoration.
 * Can be used in the browser dev console or integrated into the UI.
 */

import type { SequenceData } from "$shared";

import type { SequenceTestResult } from "./sequence-restoration-test";
import {
  formatMultipleTestResults,
  formatTestResult,
  testMultipleSequences,
  testSequenceRestoration,
  testURLRestoration,
} from "./sequence-restoration-test";
import {
  decodeSequenceWithCompression,
  encodeSequenceWithCompression,
  parseDeepLink,
} from "./sequence-url-encoder";

/**
 * Test state for tracking test progress
 */
class SequenceRestorationTester {
  currentTest = $state<SequenceTestResult | null>(null);
  testResults = $state<SequenceTestResult[]>([]);
  isRunning = $state(false);
  progress = $state({
    current: 0,
    total: 0,
    percentage: 0,
  });

  /**
   * Test a single sequence
   */
  testSingleSequence(sequence: SequenceData): SequenceTestResult {
    this.isRunning = true;
    this.currentTest = null;

    try {
      const result = testSequenceRestoration(sequence);
      this.currentTest = result;
      this.testResults.push(result);

      console.log(formatTestResult(result));

      return result;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Test a URL directly
   */
  testURL(url: string, originalSequence: SequenceData): SequenceTestResult {
    this.isRunning = true;
    this.currentTest = null;

    try {
      const result = testURLRestoration(url, originalSequence);
      this.currentTest = result;
      this.testResults.push(result);

      console.log(formatTestResult(result));

      return result;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Test the current sequence in the app
   */
  async testCurrentSequence(
    getCurrentSequenceFn: () => SequenceData | null
  ): Promise<SequenceTestResult | null> {
    const sequence = getCurrentSequenceFn();
    if (!sequence) {
      console.error("❌ No current sequence found");
      return null;
    }

    return this.testSingleSequence(sequence);
  }

  /**
   * Test multiple sequences
   */
  async testMultiple(sequences: SequenceData[]): Promise<void> {
    this.isRunning = true;
    this.testResults = [];
    this.progress = {
      current: 0,
      total: sequences.length,
      percentage: 0,
    };

    try {
      for (let i = 0; i < sequences.length; i++) {
        const sequence = sequences[i]!;
        const result = testSequenceRestoration(sequence);

        this.testResults.push(result);
        this.currentTest = result;
        this.progress.current = i + 1;
        this.progress.percentage = ((i + 1) / sequences.length) * 100;

        // Small delay to prevent UI blocking
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Generate summary report
      const summary = testMultipleSequences(sequences);
      const report = formatMultipleTestResults(summary);

      console.log(report);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Generate test sequences with various configurations
   */
  generateTestSequences(_count: number = 25): SequenceData[] {
    // This is a placeholder - in reality, we'd need access to the
    // motion query handler to generate valid sequences
    console.warn("⚠️ generateTestSequences not fully implemented");
    console.warn("Please provide sequences manually or use the generator");
    return [];
  }

  /**
   * Clear all test results
   */
  clearResults(): void {
    this.testResults = [];
    this.currentTest = null;
    this.progress = {
      current: 0,
      total: 0,
      percentage: 0,
    };
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const total = this.testResults.length;
    const passed = this.testResults.filter((r) => r.matches).length;
    const failed = this.testResults.filter((r) => !r.matches).length;
    const successRate = total > 0 ? (passed / total) * 100 : 0;

    return {
      total,
      passed,
      failed,
      successRate,
    };
  }

  /**
   * Export results as JSON
   */
  exportResults(): string {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: this.getSummary(),
        results: this.testResults,
      },
      null,
      2
    );
  }
}

/**
 * Global instance for easy access
 */
export const sequenceRestorationTester = new SequenceRestorationTester();

/**
 * Make available in browser console for debugging
 */
if (typeof window !== "undefined") {
  (window as any).__sequenceRestorationTester = sequenceRestorationTester;
  (window as any).__testSequenceRestoration = testSequenceRestoration;
  (window as any).__parseDeepLink = parseDeepLink;
  (window as any).__encodeSequence = encodeSequenceWithCompression;
  (window as any).__decodeSequence = decodeSequenceWithCompression;

  console.log("✅ Sequence Restoration Tester loaded!");
  console.log("Available in console:");
  console.log("  - window.__sequenceRestorationTester");
  console.log("  - window.__testSequenceRestoration(sequence)");
  console.log("  - window.__parseDeepLink(url)");
  console.log("  - window.__encodeSequence(sequence)");
  console.log("  - window.__decodeSequence(encoded)");
}
