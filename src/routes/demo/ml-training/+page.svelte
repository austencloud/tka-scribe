<script lang="ts">
  // Pure mock data for visual review only.
  const captureState = {
    status: "recording" as "ready" | "recording" | "paused" | "backpressure",
    time: "03:12",
    frames: 936,
    fps: 15,
    resolution: "1280×720",
    prop: "club",
    queueDepth: 18,
    queueMax: 120,
    error: "",
  };

  const sessions = [
    { name: "Club Spins Day 1", frames: 1240, prop: "club", time: "1h ago" },
    { name: "Fan Patterns A", frames: 820, prop: "fan", time: "Yesterday" },
    { name: "Buugeng Slowmo", frames: 640, prop: "buugeng", time: "2d ago" },
  ];

  const storageUsage = {
    usedMb: 280,
    freeMb: 320,
  };
</script>

<svelte:head>
  <title>ML Training Mock | TKA Scribe</title>
</svelte:head>

<div class="mock-shell">
  <div class="mock-grid">
    <!-- Capture Pane -->
    <section class="capture-pane">
      <div class="capture-card">
        <div class="video-wrapper">
          <div class="video-overlay top-bar">
            <div class="chip status {captureState.status}">
              <span class="dot"></span>
              {captureState.status === "recording"
                ? "Recording"
                : captureState.status === "paused"
                  ? "Paused"
                  : captureState.status === "backpressure"
                    ? "Catching up"
                    : "Ready"}
            </div>
            <div class="mini-stats">
              <span class="pill">FPS {captureState.fps}</span>
              <span class="pill">{captureState.resolution}</span>
              <span class="pill">{captureState.prop}</span>
            </div>
            <div class="queue">
              <span>Saving… {captureState.queueDepth}</span>
              <div class="queue-bar">
                <div
                  class="queue-fill"
                  style={`width: ${Math.min(
                    100,
                    (captureState.queueDepth / captureState.queueMax) * 100
                  ).toFixed(0)}%;`}
                ></div>
              </div>
            </div>
          </div>

          <div class="video-frame">
            <div class="video-placeholder">
              <span>Live camera preview</span>
            </div>
            {#if captureState.status === "recording"}
              <div class="rec-badge">
                <span class="dot"></span>
                REC
              </div>
            {/if}
          </div>

          <div class="stats-bar">
            <div class="stat">
              <span class="value">{captureState.time}</span>
              <span class="label">Time</span>
            </div>
            <div class="stat">
              <span class="value">{captureState.frames}</span>
              <span class="label">Frames</span>
            </div>
            <div class="stat">
              <span class="value">{captureState.fps}</span>
              <span class="label">FPS</span>
            </div>
          </div>
        </div>

        <div class="controls">
          <button class="ghost" aria-label="Settings">
            <i class="fa fa-cog"></i>
          </button>
          <div class="main-buttons">
            <button class="record" aria-label="Record"
              ><i class="fa fa-circle"></i></button
            >
            <button class="action pause" aria-label="Pause"
              ><i class="fa fa-pause"></i></button
            >
            <button class="action snapshot" aria-label="Take snapshot"
              ><i class="fa fa-camera"></i></button
            >
            <button class="action stop" aria-label="Stop"
              ><i class="fa fa-stop"></i></button
            >
          </div>
          <div class="prop-tag">Club</div>
        </div>
      </div>
    </section>

    <!-- Side Rail -->
    <aside class="side-rail">
      <div class="card">
        <div class="card-header">
          <h3>Session Settings</h3>
          <button class="ghost sm" aria-label="Test camera">Test</button>
        </div>
        <div class="field">
          <label for="session-name">Session Name</label>
          <input
            id="session-name"
            type="text"
            placeholder="Club Capture"
            value="Club Capture"
          />
        </div>
        <div class="field-row">
          <div class="field">
            <label for="prop-select">Prop</label>
            <select id="prop-select">
              <option>Club</option>
              <option>Fan</option>
              <option>Buugeng</option>
            </select>
          </div>
          <div class="field">
            <label for="fps-select">FPS</label>
            <select id="fps-select">
              <option>10</option>
              <option selected>15</option>
              <option>30</option>
            </select>
          </div>
        </div>
        <p class="hint">Stop recording to change settings.</p>
      </div>

      <div class="card">
        <h3>Capture Health</h3>
        <div class="health-row">
          <span class="badge ok">OK</span>
          <span class="text-muted">No errors</span>
        </div>
        <div class="meter-label">
          <span>Queue</span>
          <span>{captureState.queueDepth}/{captureState.queueMax}</span>
        </div>
        <div class="meter">
          <div
            class="fill"
            style={`width: ${Math.min(
              100,
              (captureState.queueDepth / captureState.queueMax) * 100
            ).toFixed(0)}%;`}
          ></div>
        </div>
        <div class="meter-label">
          <span>Storage</span>
          <span
            >{storageUsage.usedMb} MB / ~{storageUsage.usedMb +
              storageUsage.freeMb} MB</span
          >
        </div>
        <div class="meter storage">
          <div
            class="fill"
            style={`width: ${Math.min(
              100,
              (storageUsage.usedMb /
                (storageUsage.usedMb + storageUsage.freeMb || 1)) *
                100
            ).toFixed(0)}%;`}
          ></div>
        </div>
        <button class="ghost full">Manage storage</button>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Recent Sessions</h3>
          <button class="ghost sm">View all</button>
        </div>
        <div class="session-list">
          {#each sessions as session}
            <div class="session-row">
              <div>
                <div class="name">{session.name}</div>
                <div class="meta">
                  {session.frames} frames • {session.prop} • {session.time}
                </div>
              </div>
              <div class="row-actions">
                <button class="text-btn">Open</button>
                <button class="text-btn">Export</button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </aside>
  </div>
</div>

<style>
  :global(body) {
    background: #0f1118;
  }

  .mock-shell {
    min-height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 24px;
    box-sizing: border-box;
  }

  .mock-grid {
    width: 100%;
    max-width: 1400px;
    display: grid;
    grid-template-columns: 1.6fr 1fr;
    gap: 20px;
  }

  .capture-card,
  .card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    padding: 16px;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
    color: rgba(255, 255, 255, 0.95);
  }

  .video-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .video-frame {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    background: #000;
    aspect-ratio: 1 / 1;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
  }

  .video-placeholder {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.95rem;
    letter-spacing: 0.02em;
    background:
      radial-gradient(
        circle at 20% 20%,
        color-mix(in srgb, var(--theme-accent, #6366f1) 10%, transparent),
        transparent 45%
      ),
      radial-gradient(
        circle at 80% 30%,
        color-mix(in srgb, var(--theme-accent, #3b82f6) 15%, transparent),
        transparent 40%
      ),
      #05060b;
  }

  .video-overlay.top-bar {
    position: absolute;
    top: 12px;
    left: 12px;
    right: 12px;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.9rem;
    color: #93c5fd;
    background: color-mix(in srgb, var(--theme-accent, #3b82f6) 18%, transparent);
  }
  .chip.recording {
    background: #ef4444;
    color: #fff;
  }
  .chip.paused {
    background: #f59e0b;
    color: #1f1302;
  }
  .chip.backpressure {
    background: rgba(245, 158, 11, 0.25);
    color: #fbbf24;
  }

  .chip .dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: currentColor;
    box-shadow: 0 0 12px currentColor;
  }

  .mini-stats {
    display: flex;
    gap: 6px;
    justify-content: flex-start;
    flex-wrap: wrap;
    color: rgba(255, 255, 255, 0.8);
  }

  .pill {
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    font-size: 0.85rem;
  }

  .queue {
    justify-self: end;
    display: grid;
    gap: 6px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.85rem;
  }

  .queue-bar {
    width: 120px;
    height: 6px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    overflow: hidden;
  }

  .queue-fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e, #f59e0b, #ef4444);
    transition: width 0.3s ease;
  }

  .rec-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #ef4444;
    color: #fff;
    font-weight: 700;
    border-radius: 12px;
    animation: pulse 1s ease-in-out infinite;
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.5);
  }

  .rec-badge .dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #fff;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(0.98);
      opacity: 0.7;
    }
  }

  .stats-bar {
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
  }

  .stat {
    text-align: center;
  }
  .stat .value {
    font-size: 1.2rem;
    font-weight: 700;
    font-family: "JetBrains Mono", monospace;
  }
  .stat .label {
    font-size: 0.8rem;
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .controls {
    margin-top: 12px;
    display: grid;
    grid-template-columns: 50px 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: linear-gradient(
      180deg,
      rgba(26, 26, 46, 0.95),
      rgba(15, 15, 30, 0.98)
    );
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .main-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .ghost {
    width: 52px;
    height: 52px;
    display: grid;
    place-items: center;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .ghost.sm {
    width: 40px;
    height: 36px;
    font-size: 0.8rem;
  }
  .ghost.full {
    width: 100%;
    height: auto;
    padding: 10px 12px;
    border-radius: 10px;
  }

  .ghost:hover {
    background: rgba(255, 255, 255, 0.14);
    transform: translateY(-1px);
  }

  .main-buttons button {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: none;
    color: #fff;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
  }

  .main-buttons .record {
    width: 72px;
    height: 72px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
  }
  .main-buttons .pause {
    background: linear-gradient(135deg, #f59e0b, #d97706);
  }
  .main-buttons .snapshot {
    background: linear-gradient(135deg, var(--theme-accent, #3b82f6), var(--theme-accent-strong, #2563eb));
  }
  .main-buttons .stop {
    background: linear-gradient(135deg, #6b7280, #4b5563);
  }
  .main-buttons button:hover {
    transform: translateY(-2px);
  }
  .main-buttons button:active {
    transform: scale(0.97);
  }

  .prop-tag {
    justify-self: end;
    padding: 8px 12px;
    background: color-mix(in srgb, var(--theme-accent, #6366f1) 18%, transparent);
    border-radius: 12px;
    color: #a5b4fc;
    text-transform: capitalize;
    font-weight: 600;
  }

  .side-rail {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 10px;
  }

  .field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  label {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.75);
  }
  input,
  select {
    width: 100%;
    padding: 12px 14px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 12px;
    color: #fff;
    font-size: 0.95rem;
  }
  input:focus,
  select:focus {
    outline: 2px solid color-mix(in srgb, var(--theme-accent, #6366f1) 70%, transparent);
  }

  .hint {
    margin: 6px 0 0;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .health-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .badge {
    padding: 4px 10px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 0.85rem;
  }
  .badge.ok {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
  }
  .text-muted {
    color: rgba(255, 255, 255, 0.65);
    font-size: 0.9rem;
  }

  .meter-label {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.75);
    margin-top: 10px;
  }

  .meter {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    overflow: hidden;
    margin-top: 6px;
  }

  .meter .fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e, #f59e0b, #ef4444);
  }

  .meter.storage .fill {
    background: linear-gradient(90deg, #22c55e, #eab308, #ef4444);
  }

  .session-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .session-row {
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }

  .session-row .name {
    font-weight: 700;
  }
  .session-row .meta {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.65);
  }

  .row-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .text-btn {
    background: none;
    border: none;
    color: #93c5fd;
    cursor: pointer;
    font-weight: 600;
    padding: 4px 0;
  }

  @media (max-width: 1024px) {
    .mock-grid {
      grid-template-columns: 1fr;
    }
    .side-rail {
      grid-row: 2;
    }
  }

  @media (max-width: 640px) {
    .mock-shell {
      padding: 12px;
    }
    .controls {
      grid-template-columns: 40px 1fr 1fr;
    }
    .main-buttons {
      gap: 10px;
    }
    .main-buttons .record {
      width: 64px;
      height: 64px;
    }
    .main-buttons button {
      width: 52px;
      height: 52px;
    }
    .video-overlay.top-bar {
      grid-template-columns: 1fr;
      row-gap: 8px;
    }
    .queue {
      justify-self: start;
    }
  }
</style>
