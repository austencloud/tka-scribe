<!--
  Isolated Test for Circular Dependency Issue
  
  This test replicates the exact reactive patterns from the word-card-state
  and page-layout-state to identify the source of the infinite loop.
  
  We'll build this up incrementally to find the exact trigger.
-->
<script lang="ts">
  // === STEP 1: Basic State (No Reactivity) ===
  console.log("🧪 Test: Starting circular dependency test");

  // Simulate word card state
  let layoutMode = $state<"grid" | "list" | "printable">("grid");
  let currentPage = $state(1);
  let itemsPerPage = $state(12);

  // Simulate page layout state
  let pages = $state<any[]>([]);
  let totalPages = $state(0);
  let isLoading = $state(false);
  let cachedSequences = $state<any[]>([]);

  // Simulate sequences
  let sequences = $state([
    { id: 1, name: "Test Sequence 1", beats: 4 },
    { id: 2, name: "Test Sequence 2", beats: 6 },
    { id: 3, name: "Test Sequence 3", beats: 8 },
  ]);

  // === STEP 2: Basic Functions (No Reactivity) ===
  function createPages(sequenceList: any[]) {
    console.log("📄 createPages called with", sequenceList.length, "sequences");
    isLoading = true;

    // Simulate page creation
    cachedSequences = [...sequenceList];
    const newPages = [];
    for (let i = 0; i < sequenceList.length; i += 2) {
      newPages.push({
        id: Math.floor(i / 2) + 1,
        sequences: sequenceList.slice(i, i + 2),
      });
    }

    pages = newPages;
    totalPages = newPages.length;
    isLoading = false;

    console.log("✅ createPages completed:", newPages.length, "pages");
  }

  function switchToPageView() {
    console.log("🔄 switchToPageView called");
    layoutMode = "printable";
    createPages(sequences);
    console.log("✅ switchToPageView completed");
  }

  // === STEP 3: Test Button Handler ===
  function handlePagesClick() {
    console.log("🖱️ Pages button clicked");
    try {
      switchToPageView();
    } catch (error) {
      console.error("❌ Error in handlePagesClick:", error);
    }
  }

  // === STEP 4: Add Reactive Patterns One by One ===
  // We'll add these incrementally to find the trigger

  // Test 1: Basic derived (should be safe)
  const filteredSequences = $derived(() => {
    console.log("🔍 filteredSequences derived called");
    return sequences.filter((s) => s.beats <= 8);
  });

  // Test 2: Current page sequences (potential trigger)
  const currentPageSequences = $derived(() => {
    console.log("📄 currentPageSequences derived called");
    if (layoutMode === "printable") {
      // This might be the trigger - reading pages reactively
      const currentPageData = pages[currentPage - 1];
      return currentPageData?.sequences || [];
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSequences().slice(startIndex, endIndex);
  });

  // Test 3: Total pages calculation (potential trigger)
  const calculatedTotalPages = $derived(() => {
    console.log("🔢 calculatedTotalPages derived called");
    if (layoutMode === "printable") {
      // This might be the trigger - reading totalPages reactively
      return totalPages;
    }
    return Math.ceil(filteredSequences.length / itemsPerPage);
  });

  // Test 4: Progress message (potential trigger)
  const progressMessage = $derived(() => {
    console.log("💬 progressMessage derived called");
    if (isLoading) {
      return "Creating printable pages...";
    }

    if (layoutMode === "printable" && totalPages > 0) {
      // This might be the trigger - reading totalPages reactively
      return `${totalPages} printable page${totalPages === 1 ? "" : "s"} created`;
    }

    return `Displaying ${filteredSequences().length} sequences`;
  });

  // === STEP 5: Effects (Major Potential Triggers) ===
  // We'll add these one by one to test

  // Effect 1: Watch layout mode changes
  $effect(() => {
    console.log("⚡ Layout mode effect triggered:", layoutMode);
    // This effect just logs - should be safe
  });

  // Effect 2: Watch pages changes
  $effect(() => {
    console.log("⚡ Pages effect triggered:", pages.length, "pages");
    // This effect just logs - should be safe
  });

  // Effect 3: Auto-update pages (COMMENTED OUT TO TEST)
  // $effect(() => {
  //   console.log("⚡ Auto-update effect triggered");
  //   const filtered = filteredSequences();
  //   const mode = layoutMode;
  //
  //   if (mode === "printable" && filtered.length > 0) {
  //     console.log("🔄 Auto-update triggering createPages");
  //     createPages(filtered);
  //   }
  // });

  // === STEP 6: Test Results Display ===
  let testResults = $state<string[]>([]);

  function addTestResult(message: string) {
    testResults = [
      ...testResults,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ];
  }

  // Monitor for infinite loops (simplified to avoid self-triggering)
  let derivedCallCount = $state(0);

  function incrementCallCount() {
    derivedCallCount++;
    if (derivedCallCount > 50) {
      console.warn(
        "⚠️ High number of derived calls detected:",
        derivedCallCount
      );
    }
  }
</script>

<div class="test-container">
  <h1>🧪 Circular Dependency Test</h1>

  <div class="test-controls">
    <h2>Test Controls</h2>
    <button onclick={handlePagesClick} class="pages-button">
      🖨️ Test Pages Button
    </button>

    <div class="state-display">
      <p><strong>Layout Mode:</strong> {layoutMode}</p>
      <p><strong>Total Pages:</strong> {calculatedTotalPages}</p>
      <p>
        <strong>Current Page Sequences:</strong>
        {currentPageSequences.length}
      </p>
      <p><strong>Progress:</strong> {progressMessage}</p>
      <p><strong>Is Loading:</strong> {isLoading}</p>
    </div>
  </div>

  <div class="test-results">
    <h2>Test Results</h2>
    <div class="results-log">
      {#each testResults as result}
        <div class="result-item">{result}</div>
      {/each}
    </div>
  </div>

  <div class="debug-info">
    <h2>Debug Info</h2>
    <p><strong>Derived Call Count:</strong> {derivedCallCount}</p>
    <p><strong>Sequences:</strong> {sequences.length}</p>
    <p><strong>Filtered Sequences:</strong> {filteredSequences.length}</p>
    <p><strong>Pages:</strong> {pages.length}</p>
    <p><strong>Cached Sequences:</strong> {cachedSequences.length}</p>
  </div>
</div>

<style>
  .test-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
  }

  .test-controls {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .pages-button {
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    margin-bottom: 15px;
  }

  .pages-button:hover {
    background: #0056b3;
  }

  .state-display {
    background: white;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ddd;
  }

  .test-results {
    background: #fff3cd;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #ffeaa7;
  }

  .results-log {
    max-height: 200px;
    overflow-y: auto;
    background: white;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ddd;
  }

  .result-item {
    padding: 2px 0;
    border-bottom: 1px solid #eee;
    font-family: monospace;
    font-size: 12px;
  }

  .debug-info {
    background: #e7f3ff;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #b3d9ff;
  }

  h1,
  h2 {
    color: #333;
  }

  p {
    margin: 5px 0;
  }
</style>
