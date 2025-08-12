<script lang="ts">
  import { onMount } from 'svelte';
  import { convertWebAppToStandalone } from '$lib/animator/utils/data-converter';
  import StandaloneAnimator from '$lib/animator/components/StandaloneAnimator.svelte';

  let standaloneFrame: HTMLIFrameElement;
  let testData: any = null;
  let convertedData: any = null;
  let comparisonResults: any[] = [];
  let currentBeat = 1;
  let totalBeats = 0;

  // Test sequence data - identical to what we use in the standalone
  const testSequence = {
    id: "test_comparison",
    name: "Test Comparison Sequence",
    beats: [
      {
        id: "beat1",
        beat_number: 1,
        duration: 1,
        pictograph_data: {
          id: "pic1",
          letter: "T",
          end_pos: "alpha",
          start_pos: "alpha"
        },
        motions: {
          blue: {
            id: "blue1",
            start_loc: "s",
            end_loc: "e",
            start_ori: "in",
            end_ori: "out",
            prop_rot_dir: "cw",
            turns: 1,
            motion_type: "anti"
          },
          red: {
            id: "red1", 
            start_loc: "n",
            end_loc: "w",
            start_ori: "out",
            end_ori: "in",
            prop_rot_dir: "ccw",
            turns: 2,
            motion_type: "linear"
          }
        }
      },
      {
        id: "beat2",
        beat_number: 2,
        duration: 1,
        pictograph_data: {
          id: "pic2",
          letter: "E",
          end_pos: "beta",
          start_pos: "alpha"
        },
        motions: {
          blue: {
            id: "blue2",
            start_loc: "e",
            end_loc: "n",
            start_ori: "out",
            end_ori: "in",
            prop_rot_dir: "cw",
            turns: 0,
            motion_type: "linear"
          },
          red: {
            id: "red2",
            start_loc: "w", 
            end_loc: "s",
            start_ori: "in",
            end_ori: "out",
            prop_rot_dir: "ccw",
            turns: 1,
            motion_type: "anti"
          }
        }
      },
      {
        id: "beat3",
        beat_number: 3,
        duration: 1,
        pictograph_data: {
          id: "pic3",
          letter: "S",
          end_pos: "gamma",
          start_pos: "beta"
        },
        motions: {
          blue: {
            id: "blue3",
            start_loc: "n",
            end_loc: "w",
            start_ori: "in",
            end_ori: "out",
            prop_rot_dir: "ccw",
            turns: 3,
            motion_type: "anti"
          },
          red: {
            id: "red3",
            start_loc: "s",
            end_loc: "e", 
            start_ori: "out",
            end_ori: "in",
            prop_rot_dir: "cw",
            turns: 1,
            motion_type: "linear"
          }
        }
      },
      {
        id: "beat4",
        beat_number: 4,
        duration: 1,
        pictograph_data: {
          id: "pic4",
          letter: "T",
          end_pos: "alpha",
          start_pos: "gamma"
        },
        motions: {
          blue: {
            id: "blue4",
            start_loc: "w",
            end_loc: "s",
            start_ori: "out",
            end_ori: "in",
            prop_rot_dir: "cw",
            turns: 2,
            motion_type: "linear"
          },
          red: {
            id: "red4",
            start_loc: "e",
            end_loc: "n",
            start_ori: "in", 
            end_ori: "out",
            prop_rot_dir: "ccw",
            turns: 4,
            motion_type: "anti"
          }
        }
      }
    ]
  };

  onMount(() => {
    // Convert test data for the browse tab animator
    convertedData = convertWebAppToStandalone(testSequence);
    totalBeats = testSequence.beats.length;
    
    console.log('🧪 Test Comparison Data:');
    console.log('Original sequence:', testSequence);
    console.log('Converted data:', convertedData);
    
    // Load the standalone animator in iframe
    loadStandaloneAnimator();
  });

  function loadStandaloneAnimator() {
    if (standaloneFrame) {
      // Create the standalone animator HTML with our test data
      const standaloneHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Standalone Test</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            #animation-container { width: 600px; height: 400px; border: 1px solid #ccc; margin: 20px 0; }
            .controls { margin: 10px 0; }
            button { margin: 5px; padding: 10px; }
            .info { background: #f0f0f0; padding: 10px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <h3>Standalone Animator</h3>
          <div id="animation-container"></div>
          <div class="controls">
            <button onclick="playAnimation()">▶️ Play</button>
            <button onclick="pauseAnimation()">⏸️ Pause</button>
            <button onclick="resetAnimation()">⏹️ Reset</button>
            <button onclick="stepForward()">⏭️ Step</button>
            <button onclick="stepBackward()">⏮️ Back</button>
          </div>
          <div class="info">
            <div>Beat: <span id="current-beat">1</span> of <span id="total-beats">4</span></div>
            <div>Speed: <span id="speed">1.0x</span></div>
          </div>
          <div class="info">
            <h4>Current Frame Data:</h4>
            <pre id="frame-data"></pre>
          </div>
          
          <script>
            // Test data - identical to browse tab
            const testData = ${JSON.stringify(convertedData, null, 2)};
            
            let engine = null;
            let currentBeat = 1;
            let isPlaying = false;
            let animationSpeed = 1.0;
            
            // Initialize the animation engine (simplified version)
            function initEngine() {
              console.log('🎬 Initializing standalone engine with test data:', testData);
              
              // This would be the actual standalone engine initialization
              // For now, we'll simulate the key calculations
              engine = {
                data: testData,
                currentStep: 0,
                totalSteps: testData.length,
                currentBeat: 1,
                isPlaying: false
              };
              
              updateDisplay();
            }
            
            function playAnimation() {
              isPlaying = true;
              engine.isPlaying = true;
              console.log('▶️ Playing animation');
              // Simulate animation loop
              animateStep();
            }
            
            function pauseAnimation() {
              isPlaying = false;
              engine.isPlaying = false;
              console.log('⏸️ Paused animation');
            }
            
            function resetAnimation() {
              isPlaying = false;
              engine.isPlaying = false;
              engine.currentStep = 0;
              currentBeat = 1;
              engine.currentBeat = 1;
              console.log('⏹️ Reset animation');
              updateDisplay();
            }
            
            function stepForward() {
              if (engine.currentStep < engine.totalSteps - 1) {
                engine.currentStep++;
                updateBeat();
                updateDisplay();
                logFrameData();
              }
            }
            
            function stepBackward() {
              if (engine.currentStep > 0) {
                engine.currentStep--;
                updateBeat();
                updateDisplay();
                logFrameData();
              }
            }
            
            function updateBeat() {
              // Calculate current beat based on step
              const stepsPerBeat = Math.ceil(engine.totalSteps / 4);
              currentBeat = Math.min(4, Math.floor(engine.currentStep / stepsPerBeat) + 1);
              engine.currentBeat = currentBeat;
            }
            
            function animateStep() {
              if (!isPlaying) return;
              
              if (engine.currentStep < engine.totalSteps - 1) {
                engine.currentStep++;
                updateBeat();
                updateDisplay();
                logFrameData();
                
                // Continue animation
                setTimeout(() => animateStep(), 100 / animationSpeed);
              } else {
                // Animation complete
                isPlaying = false;
                engine.isPlaying = false;
                console.log('🏁 Animation complete');
              }
            }
            
            function updateDisplay() {
              document.getElementById('current-beat').textContent = currentBeat;
              document.getElementById('total-beats').textContent = '4';
              document.getElementById('speed').textContent = animationSpeed + 'x';
            }
            
            function logFrameData() {
              const currentStep = engine.data[engine.currentStep];
              const frameData = {
                step: engine.currentStep,
                beat: currentBeat,
                stepData: currentStep
              };
              
              document.getElementById('frame-data').textContent = JSON.stringify(frameData, null, 2);
              
              // Send data to parent window for comparison
              window.parent.postMessage({
                type: 'standalone-frame-data',
                data: frameData
              }, '*');
              
              console.log('📊 Standalone Frame Data:', frameData);
            }
            
            // Initialize when page loads
            window.onload = function() {
              initEngine();
              logFrameData();
            };
          </script>
        </body>
        </html>
      `;
      
      const blob = new Blob([standaloneHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      standaloneFrame.src = url;
    }
  }

  // Listen for messages from standalone iframe
  function handleMessage(event: MessageEvent) {
    if (event.data.type === 'standalone-frame-data') {
      const standaloneData = event.data.data;
      
      // Get corresponding data from browse tab animator
      const browseTabData = getBrowseTabFrameData();
      
      // Compare the data
      const comparison = compareFrameData(standaloneData, browseTabData);
      comparisonResults = [...comparisonResults, comparison];
      
      console.log('🔍 Frame Comparison:', comparison);
    }
  }

  function getBrowseTabFrameData() {
    // This would extract current frame data from the browse tab animator
    // For now, return placeholder data
    return {
      step: currentBeat - 1,
      beat: currentBeat,
      stepData: convertedData[currentBeat - 1] || null
    };
  }

  function compareFrameData(standaloneData: any, browseTabData: any) {
    return {
      timestamp: Date.now(),
      standalone: standaloneData,
      browseTab: browseTabData,
      differences: findDifferences(standaloneData, browseTabData)
    };
  }

  function findDifferences(data1: any, data2: any) {
    const differences: string[] = [];
    
    if (data1.step !== data2.step) {
      differences.push(`Step mismatch: ${data1.step} vs ${data2.step}`);
    }
    
    if (data1.beat !== data2.beat) {
      differences.push(`Beat mismatch: ${data1.beat} vs ${data2.beat}`);
    }
    
    // Add more detailed comparisons here
    
    return differences;
  }

  function clearComparison() {
    comparisonResults = [];
  }

  function exportComparison() {
    const dataStr = JSON.stringify(comparisonResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'animation-comparison.json';
    link.click();
    
    URL.revokeObjectURL(url);
  }

  // Set up message listener
  onMount(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  });
</script>

<svelte:head>
  <title>Animation Algorithm Comparison Test</title>
</svelte:head>

<div class="comparison-container">
  <h1>🧪 Animation Algorithm Comparison Test</h1>
  
  <div class="test-info">
    <h3>Test Purpose</h3>
    <p>Compare the standalone animator with the browse tab version using identical test data to identify algorithmic discrepancies.</p>
  </div>

  <div class="animators-container">
    <!-- Standalone Animator -->
    <div class="animator-panel">
      <h3>📱 Standalone Animator</h3>
      <iframe 
        bind:this={standaloneFrame}
        title="Standalone Animator"
        width="100%" 
        height="600"
        style="border: 1px solid #ccc;"
      ></iframe>
    </div>

    <!-- Browse Tab Animator -->
    <div class="animator-panel">
      <h3>🌐 Browse Tab Animator</h3>
      {#if convertedData}
        <StandaloneAnimator 
          sequenceData={convertedData}
          sequenceName="Test Comparison Sequence"
          author="Test System"
        />
      {:else}
        <div class="loading">Loading animator...</div>
      {/if}
    </div>
  </div>

  <!-- Comparison Controls -->
  <div class="comparison-controls">
    <h3>🔍 Comparison Controls</h3>
    <button on:click={clearComparison}>Clear Results</button>
    <button on:click={exportComparison}>Export Comparison</button>
    <div class="results-count">
      Results: {comparisonResults.length} frames compared
    </div>
  </div>

  <!-- Comparison Results -->
  <div class="comparison-results">
    <h3>📊 Comparison Results</h3>
    {#if comparisonResults.length === 0}
      <p>No comparison data yet. Play both animations to start comparing.</p>
    {:else}
      <div class="results-list">
        {#each comparisonResults.slice(-10) as result, index}
          <div class="result-item" class:has-differences={result.differences.length > 0}>
            <div class="result-header">
              <strong>Frame {result.standalone.step}</strong>
              <span class="timestamp">{new Date(result.timestamp).toLocaleTimeString()}</span>
            </div>
            
            {#if result.differences.length > 0}
              <div class="differences">
                <strong>⚠️ Differences Found:</strong>
                <ul>
                  {#each result.differences as diff}
                    <li>{diff}</li>
                  {/each}
                </ul>
              </div>
            {:else}
              <div class="no-differences">✅ No differences detected</div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Test Data Display -->
  <div class="test-data">
    <h3>📋 Test Data</h3>
    <details>
      <summary>View Test Sequence Data</summary>
      <pre>{JSON.stringify(testSequence, null, 2)}</pre>
    </details>
    
    <details>
      <summary>View Converted Data</summary>
      <pre>{JSON.stringify(convertedData, null, 2)}</pre>
    </details>
  </div>
</div>

<style>
  .comparison-container {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .test-info {
    background: #f0f8ff;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .animators-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
  }

  .animator-panel {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    background: white;
  }

  .animator-panel h3 {
    margin-top: 0;
    color: #333;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
    color: #666;
    font-style: italic;
  }

  .comparison-controls {
    background: #f9f9f9;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .comparison-controls button {
    margin-right: 10px;
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
  }

  .comparison-controls button:hover {
    background: #f0f0f0;
  }

  .results-count {
    margin-top: 10px;
    font-weight: bold;
    color: #666;
  }

  .comparison-results {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
  }

  .results-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .result-item {
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 10px;
    margin-bottom: 10px;
    background: #fafafa;
  }

  .result-item.has-differences {
    border-color: #ff6b6b;
    background: #fff5f5;
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .timestamp {
    font-size: 0.9em;
    color: #666;
  }

  .differences {
    color: #d63031;
  }

  .differences ul {
    margin: 5px 0;
    padding-left: 20px;
  }

  .no-differences {
    color: #00b894;
    font-weight: bold;
  }

  .test-data {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 15px;
  }

  .test-data details {
    margin-bottom: 15px;
  }

  .test-data summary {
    cursor: pointer;
    font-weight: bold;
    padding: 5px 0;
  }

  .test-data pre {
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 10px;
    overflow-x: auto;
    font-size: 0.9em;
  }

  @media (max-width: 1200px) {
    .animators-container {
      grid-template-columns: 1fr;
    }
  }
</style>
