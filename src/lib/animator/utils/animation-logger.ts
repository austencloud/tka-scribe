/**
 * Animation Logger Utility
 * 
 * Provides comprehensive logging for animation comparison between systems.
 * Logs detailed animation properties at every frame for direct comparison.
 */

export interface AnimationLogEntry {
  timestamp: number;
  system: 'STANDALONE' | 'BROWSE';
  beat: number;
  frameNumber: number;
  
  // Blue prop state
  blue: {
    centerPathAngle: number;
    staffRotationAngle: number;
    x: number;
    y: number;
  };
  
  // Red prop state
  red: {
    centerPathAngle: number;
    staffRotationAngle: number;
    x: number;
    y: number;
  };
  
  // Animation timing
  timing: {
    deltaTime: number;
    speed: number;
    isPlaying: boolean;
  };
  
  // Step information
  step?: {
    stepIndex: number;
    arrayIndex: number;
    t: number; // interpolation factor
    motionTypes: {
      blue?: string;
      red?: string;
    };
  };
}

export interface AnimationComparisonData {
  sequenceWord: string;
  totalBeats: number;
  standaloneEntries: AnimationLogEntry[];
  browseEntries: AnimationLogEntry[];
  startTime: number;
  endTime: number;
}

/**
 * Animation Logger Class
 * Manages logging for animation comparison
 */
export class AnimationLogger {
  private entries: AnimationLogEntry[] = [];
  private frameCounter = 0;
  private startTime = 0;
  private isLogging = false;
  private system: 'STANDALONE' | 'BROWSE';
  
  constructor(system: 'STANDALONE' | 'BROWSE') {
    this.system = system;
  }
  
  /**
   * Start logging session
   */
  startLogging(): void {
    this.entries = [];
    this.frameCounter = 0;
    this.startTime = performance.now();
    this.isLogging = true;
    console.log(`🎬 ${this.system}: Animation logging started`);
  }
  
  /**
   * Stop logging session
   */
  stopLogging(): void {
    this.isLogging = false;
    console.log(`🏁 ${this.system}: Animation logging stopped - ${this.entries.length} entries recorded`);
  }
  
  /**
   * Log animation frame data
   */
  logFrame(data: {
    beat: number;
    blueProp: { centerPathAngle: number; staffRotationAngle: number; x: number; y: number };
    redProp: { centerPathAngle: number; staffRotationAngle: number; x: number; y: number };
    timing: { deltaTime: number; speed: number; isPlaying: boolean };
    step?: {
      stepIndex: number;
      arrayIndex: number;
      t: number;
      motionTypes: { blue?: string; red?: string };
    };
  }): void {
    if (!this.isLogging) return;
    
    const entry: AnimationLogEntry = {
      timestamp: performance.now() - this.startTime,
      system: this.system,
      beat: data.beat,
      frameNumber: this.frameCounter++,
      
      blue: {
        centerPathAngle: data.blueProp.centerPathAngle,
        staffRotationAngle: data.blueProp.staffRotationAngle,
        x: data.blueProp.x,
        y: data.blueProp.y,
      },
      
      red: {
        centerPathAngle: data.redProp.centerPathAngle,
        staffRotationAngle: data.redProp.staffRotationAngle,
        x: data.redProp.x,
        y: data.redProp.y,
      },
      
      timing: {
        deltaTime: data.timing.deltaTime,
        speed: data.timing.speed,
        isPlaying: data.timing.isPlaying,
      },
      
      step: data.step,
    };
    
    this.entries.push(entry);
    
    // Optional: Log to console for real-time monitoring
    if (this.frameCounter % 60 === 0) { // Log every 60 frames to avoid spam
      console.log(`📊 ${this.system}: Frame ${this.frameCounter}, Beat ${data.beat.toFixed(3)}, Blue angle: ${data.blueProp.centerPathAngle.toFixed(3)}, Red angle: ${data.redProp.centerPathAngle.toFixed(3)}`);
    }
  }
  
  /**
   * Get all logged entries
   */
  getEntries(): AnimationLogEntry[] {
    return [...this.entries];
  }
  
  /**
   * Clear logged entries
   */
  clearEntries(): void {
    this.entries = [];
    this.frameCounter = 0;
  }
  
  /**
   * Export entries as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify({
      system: this.system,
      totalFrames: this.entries.length,
      startTime: this.startTime,
      endTime: performance.now(),
      entries: this.entries,
    }, null, 2);
  }
  
  /**
   * Export entries as CSV
   */
  exportAsCSV(): string {
    if (this.entries.length === 0) return '';
    
    const headers = [
      'timestamp', 'system', 'beat', 'frameNumber',
      'blue_centerPathAngle', 'blue_staffRotationAngle', 'blue_x', 'blue_y',
      'red_centerPathAngle', 'red_staffRotationAngle', 'red_x', 'red_y',
      'deltaTime', 'speed', 'isPlaying',
      'stepIndex', 'arrayIndex', 't', 'blue_motionType', 'red_motionType'
    ];
    
    const rows = this.entries.map(entry => [
      entry.timestamp,
      entry.system,
      entry.beat,
      entry.frameNumber,
      entry.blue.centerPathAngle,
      entry.blue.staffRotationAngle,
      entry.blue.x,
      entry.blue.y,
      entry.red.centerPathAngle,
      entry.red.staffRotationAngle,
      entry.red.x,
      entry.red.y,
      entry.timing.deltaTime,
      entry.timing.speed,
      entry.timing.isPlaying,
      entry.step?.stepIndex || '',
      entry.step?.arrayIndex || '',
      entry.step?.t || '',
      entry.step?.motionTypes.blue || '',
      entry.step?.motionTypes.red || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

/**
 * Animation Comparison Utility
 * Compares logged data from both systems
 */
export class AnimationComparison {
  /**
   * Compare two sets of animation entries
   */
  static compare(
    standaloneEntries: AnimationLogEntry[],
    browseEntries: AnimationLogEntry[]
  ): {
    differences: Array<{
      beat: number;
      property: string;
      standaloneValue: number;
      browseValue: number;
      difference: number;
    }>;
    summary: {
      totalFramesCompared: number;
      maxDifference: number;
      averageDifference: number;
      significantDifferences: number; // differences > 0.01
    };
  } {
    const differences: Array<{
      beat: number;
      property: string;
      standaloneValue: number;
      browseValue: number;
      difference: number;
    }> = [];
    
    // Find matching frames by beat (approximately)
    const tolerance = 0.01; // Beat tolerance for matching frames
    let totalDifference = 0;
    let comparisonCount = 0;
    let maxDifference = 0;
    let significantDifferences = 0;
    
    for (const standaloneEntry of standaloneEntries) {
      // Find corresponding browse entry
      const browseEntry = browseEntries.find(
        entry => Math.abs(entry.beat - standaloneEntry.beat) < tolerance
      );
      
      if (!browseEntry) continue;
      
      // Compare all numeric properties
      const comparisons = [
        { prop: 'blue_centerPathAngle', standalone: standaloneEntry.blue.centerPathAngle, browse: browseEntry.blue.centerPathAngle },
        { prop: 'blue_staffRotationAngle', standalone: standaloneEntry.blue.staffRotationAngle, browse: browseEntry.blue.staffRotationAngle },
        { prop: 'blue_x', standalone: standaloneEntry.blue.x, browse: browseEntry.blue.x },
        { prop: 'blue_y', standalone: standaloneEntry.blue.y, browse: browseEntry.blue.y },
        { prop: 'red_centerPathAngle', standalone: standaloneEntry.red.centerPathAngle, browse: browseEntry.red.centerPathAngle },
        { prop: 'red_staffRotationAngle', standalone: standaloneEntry.red.staffRotationAngle, browse: browseEntry.red.staffRotationAngle },
        { prop: 'red_x', standalone: standaloneEntry.red.x, browse: browseEntry.red.x },
        { prop: 'red_y', standalone: standaloneEntry.red.y, browse: browseEntry.red.y },
      ];
      
      for (const comp of comparisons) {
        const diff = Math.abs(comp.standalone - comp.browse);
        totalDifference += diff;
        comparisonCount++;
        
        if (diff > maxDifference) {
          maxDifference = diff;
        }
        
        if (diff > 0.01) {
          significantDifferences++;
          differences.push({
            beat: standaloneEntry.beat,
            property: comp.prop,
            standaloneValue: comp.standalone,
            browseValue: comp.browse,
            difference: diff,
          });
        }
      }
    }
    
    return {
      differences,
      summary: {
        totalFramesCompared: comparisonCount / 8, // 8 properties per frame
        maxDifference,
        averageDifference: comparisonCount > 0 ? totalDifference / comparisonCount : 0,
        significantDifferences,
      },
    };
  }
}

// Global logger instances for easy access
export const standaloneLogger = new AnimationLogger('STANDALONE');
export const browseLogger = new AnimationLogger('BROWSE');
