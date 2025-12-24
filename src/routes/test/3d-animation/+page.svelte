<script lang="ts">
  /**
   * 3D Animation Test Page
   *
   * Sandboxed development environment for the 3D animation system.
   * Responsive layout with tabbed prop configuration.
   */

  import { onDestroy } from "svelte";
  import Scene3D from "$lib/shared/3d-animation/components/Scene3D.svelte";
  import Prop3D from "$lib/shared/3d-animation/components/Prop3D.svelte";
  import PropConfigCard from "$lib/shared/3d-animation/components/controls/PropConfigCard.svelte";
  import { Plane, PLANE_LABELS, PLANE_COLORS } from "$lib/shared/3d-animation/domain/enums/Plane";
  import { createAnimation3DState } from "$lib/shared/3d-animation/state/animation-3d-state.svelte";

  // Animation state
  const animState = createAnimation3DState();

  // UI state
  let visiblePlanes = $state(new Set([Plane.WALL, Plane.WHEEL, Plane.FLOOR]));
  let showGrid = $state(true);
  let showLabels = $state(true);
  let cameraPreset = $state<"front" | "top" | "side" | "perspective">("perspective");
  let activeTab = $state<"blue" | "red">("blue");
  let panelOpen = $state(true);

  function togglePlane(plane: Plane) {
    const newSet = new Set(visiblePlanes);
    if (newSet.has(plane)) {
      newSet.delete(plane);
    } else {
      newSet.add(plane);
    }
    visiblePlanes = newSet;
  }

  const allPlanes = [Plane.WALL, Plane.WHEEL, Plane.FLOOR];

  // Camera options
  const cameraOptions: Array<{ value: typeof cameraPreset; label: string }> = [
    { value: "perspective", label: "3D" },
    { value: "front", label: "Wall" },
    { value: "top", label: "Floor" },
    { value: "side", label: "Wheel" },
  ];

  // Speed control
  const speeds = [0.25, 0.5, 1, 2];
  let speedIndex = $state(2);
  $effect(() => {
    animState.speed = speeds[speedIndex];
  });

  onDestroy(() => animState.destroy());

  const progressPercent = $derived(Math.round(animState.progress * 100));
</script>

<svelte:head>
  <title>3D Animation Test | TKA Scribe</title>
</svelte:head>

<div class="layout">
  <!-- Scene Area -->
  <main class="scene-area">
    <Scene3D {visiblePlanes} {showGrid} {showLabels} {cameraPreset}>
      {#if animState.showBlue}
        <Prop3D propState={animState.bluePropState} color="blue" />
      {/if}
      {#if animState.showRed}
        <Prop3D propState={animState.redPropState} color="red" />
      {/if}
    </Scene3D>

    <!-- Overlay Controls -->
    <div class="scene-controls">
      <!-- Top row: Camera + Speed -->
      <div class="top-controls">
        <div class="control-group">
          {#each cameraOptions as opt}
            <button
              class="ctrl-btn"
              class:active={cameraPreset === opt.value}
              onclick={() => (cameraPreset = opt.value)}
            >
              {opt.label}
            </button>
          {/each}
        </div>

        <div class="control-group">
          {#each speeds as spd, i}
            <button
              class="ctrl-btn"
              class:active={speedIndex === i}
              onclick={() => (speedIndex = i)}
            >
              {spd === 0.25 ? "¼" : spd === 0.5 ? "½" : spd}×
            </button>
          {/each}
        </div>
      </div>

      <!-- Bottom: Playback -->
      <div class="playback-controls">
        <button class="play-btn" onclick={() => animState.reset()}>
          <i class="fas fa-undo"></i>
        </button>

        <button class="play-btn primary" onclick={() => animState.togglePlay()}>
          <i class="fas" class:fa-pause={animState.isPlaying} class:fa-play={!animState.isPlaying}></i>
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={animState.progress}
          oninput={(e) => animState.setProgress(parseFloat(e.currentTarget.value))}
          class="progress-slider"
        />

        <span class="progress-label">{progressPercent}%</span>

        <button
          class="play-btn"
          class:active={animState.loop}
          onclick={() => (animState.loop = !animState.loop)}
        >
          <i class="fas fa-sync"></i>
        </button>

        <button
          class="play-btn toggle-panel"
          onclick={() => (panelOpen = !panelOpen)}
        >
          <i class="fas" class:fa-chevron-right={panelOpen} class:fa-chevron-left={!panelOpen}></i>
        </button>
      </div>
    </div>
  </main>

  <!-- Side Panel -->
  <aside class="side-panel" class:collapsed={!panelOpen}>
    <!-- Prop Tabs -->
    <div class="prop-tabs">
      <button
        class="prop-tab blue"
        class:active={activeTab === "blue"}
        onclick={() => (activeTab = "blue")}
      >
        <span class="dot"></span>
        Blue
        <span
          class="vis-btn"
          role="button"
          tabindex="0"
          onclick={(e) => { e.stopPropagation(); animState.showBlue = !animState.showBlue; }}
          onkeydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); animState.showBlue = !animState.showBlue; } }}
        >
          <i class="fas" class:fa-eye={animState.showBlue} class:fa-eye-slash={!animState.showBlue}></i>
        </span>
      </button>

      <button
        class="prop-tab red"
        class:active={activeTab === "red"}
        onclick={() => (activeTab = "red")}
      >
        <span class="dot"></span>
        Red
        <span
          class="vis-btn"
          role="button"
          tabindex="0"
          onclick={(e) => { e.stopPropagation(); animState.showRed = !animState.showRed; }}
          onkeydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); animState.showRed = !animState.showRed; } }}
        >
          <i class="fas" class:fa-eye={animState.showRed} class:fa-eye-slash={!animState.showRed}></i>
        </span>
      </button>
    </div>

    <!-- Active Config -->
    <div class="config-scroll">
      {#if activeTab === "blue"}
        <PropConfigCard
          color="blue"
          config={animState.blueConfig}
          visible={animState.showBlue}
          onConfigChange={(c) => (animState.blueConfig = c)}
          onVisibilityChange={(v) => (animState.showBlue = v)}
        />
      {:else}
        <PropConfigCard
          color="red"
          config={animState.redConfig}
          visible={animState.showRed}
          onConfigChange={(c) => (animState.redConfig = c)}
          onVisibilityChange={(v) => (animState.showRed = v)}
        />
      {/if}

      <!-- Grid Planes -->
      <section class="planes-section">
        <h3>Planes</h3>
        <div class="plane-btns">
          {#each allPlanes as plane}
            <button
              class="plane-btn"
              class:active={visiblePlanes.has(plane)}
              style="--color: {PLANE_COLORS[plane]}"
              onclick={() => togglePlane(plane)}
            >
              <span class="indicator"></span>
              {PLANE_LABELS[plane]}
            </button>
          {/each}
        </div>
      </section>
    </div>
  </aside>
</div>

<style>
  .layout {
    display: flex;
    height: 100vh;
    height: 100dvh;
    background: #0a0a12;
    color: white;
    font-family: system-ui, -apple-system, sans-serif;
    overflow: hidden;
  }

  /* Scene Area */
  .scene-area {
    flex: 1;
    position: relative;
    min-width: 300px;
  }

  .scene-controls {
    position: absolute;
    inset: 0;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1rem;
  }

  .scene-controls > * {
    pointer-events: auto;
  }

  /* Top Controls */
  .top-controls {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .control-group {
    display: flex;
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 4px;
    backdrop-filter: blur(8px);
  }

  .ctrl-btn {
    min-width: 48px;
    min-height: 48px;
    padding: 0 0.75rem;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .ctrl-btn:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }

  .ctrl-btn.active {
    color: white;
    background: rgba(139, 92, 246, 0.5);
  }

  /* Playback Controls */
  .playback-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 0.5rem;
    backdrop-filter: blur(8px);
    align-self: center;
    max-width: 100%;
  }

  .play-btn {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .play-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  .play-btn.primary {
    width: 56px;
    height: 56px;
    background: #8b5cf6;
    color: white;
    border-radius: 50%;
  }

  .play-btn.primary:hover {
    background: #7c3aed;
  }

  .play-btn.active {
    background: rgba(139, 92, 246, 0.4);
    color: #a78bfa;
  }

  .progress-slider {
    flex: 1;
    min-width: 80px;
    max-width: 200px;
    height: 48px;
    accent-color: #8b5cf6;
  }

  .progress-label {
    min-width: 3rem;
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
    opacity: 0.6;
    text-align: center;
  }

  .toggle-panel {
    display: none;
  }

  /* Side Panel */
  .side-panel {
    width: 420px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.02);
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    transition: width 0.3s ease, opacity 0.3s ease;
  }

  .side-panel.collapsed {
    width: 0;
    opacity: 0;
    overflow: hidden;
  }

  /* Prop Tabs */
  .prop-tabs {
    display: flex;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .prop-tab {
    flex: 1;
    min-height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    position: relative;
  }

  .prop-tab::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 1rem;
    right: 1rem;
    height: 3px;
    background: transparent;
    border-radius: 3px 3px 0 0;
    transition: background 0.15s;
  }

  .prop-tab.blue.active::after {
    background: #3b82f6;
  }

  .prop-tab.red.active::after {
    background: #ef4444;
  }

  .prop-tab.active {
    color: white;
    background: rgba(255, 255, 255, 0.03);
  }

  .prop-tab .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .prop-tab.blue .dot {
    background: #3b82f6;
  }

  .prop-tab.red .dot {
    background: #ef4444;
  }

  .vis-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.06);
    border: none;
    border-radius: 8px;
    color: inherit;
    cursor: pointer;
    margin-left: 0.25rem;
  }

  .vis-btn:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  /* Config Scroll */
  .config-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Planes Section */
  .planes-section {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .planes-section h3 {
    margin: 0 0 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.5;
  }

  .plane-btns {
    display: flex;
    gap: 0.5rem;
  }

  .plane-btn {
    flex: 1;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .plane-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.8);
  }

  .plane-btn.active {
    background: rgba(255, 255, 255, 0.06);
    border-color: var(--color);
    color: white;
  }

  .plane-btn .indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color);
    opacity: 0.4;
    transition: opacity 0.15s;
  }

  .plane-btn.active .indicator {
    opacity: 1;
  }

  /* Responsive: Tablet */
  @media (max-width: 1024px) {
    .side-panel {
      width: 380px;
    }

    .toggle-panel {
      display: flex;
    }
  }

  @media (max-width: 800px) {
    .side-panel {
      width: 360px;
    }
  }

  /* Responsive: Mobile */
  @media (max-width: 600px) {
    .layout {
      flex-direction: column;
    }

    .scene-area {
      flex: 1;
      min-height: 50vh;
    }

    .side-panel {
      width: 100%;
      max-height: 50vh;
      border-left: none;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .side-panel.collapsed {
      max-height: 0;
      width: 100%;
    }

    .top-controls {
      gap: 0.25rem;
    }

    .control-group {
      padding: 2px;
    }

    .ctrl-btn {
      min-width: 44px;
      padding: 0 0.5rem;
      font-size: 0.75rem;
    }

    .playback-controls {
      padding: 0.35rem;
      gap: 0.35rem;
    }

    .play-btn {
      width: 44px;
      height: 44px;
    }

    .play-btn.primary {
      width: 52px;
      height: 52px;
    }

    .progress-label {
      display: none;
    }

    .toggle-panel {
      display: flex;
    }

    .toggle-panel i {
      transform: rotate(90deg);
    }

    .side-panel.collapsed .toggle-panel i {
      transform: rotate(-90deg);
    }
  }
</style>
