<!-- SnowfallTuningControls.svelte - fun sliders for the snowfall background -->
<script lang="ts">
  import {
    SNOWFALL_TUNING_DEFAULTS,
    type SnowfallTuning,
  } from "../../../../background/shared/domain/constants/BackgroundConfigs";

  type ControlKey = keyof SnowfallTuning;

  const { value, onChange } = $props<{
    value: SnowfallTuning;
    onChange: (value: SnowfallTuning) => void;
  }>();

  const controls: Array<{
    key: ControlKey;
    label: string;
    min: number;
    max: number;
    step?: number;
    hint: string;
    accent: string;
  }> = [
    {
      key: "speed",
      label: "Fall speed",
      min: 20,
      max: 200,
      step: 5,
      hint: "Floaty drift → fast blizzard",
      accent: "#60a5fa",
    },
    {
      key: "density",
      label: "Flake count",
      min: 0,
      max: 200,
      step: 5,
      hint: "Sparse → white-out",
      accent: "#a855f7",
    },
    {
      key: "size",
      label: "Flake size",
      min: 50,
      max: 200,
      step: 5,
      hint: "Tiny powder → chunky flakes",
      accent: "#34d399",
    },
    {
      key: "wind",
      label: "Wind + sway",
      min: 0,
      max: 200,
      step: 5,
      hint: "Still air → gusty drift",
      accent: "#f97316",
    },
    {
      key: "sparkle",
      label: "Sparkle",
      min: 0,
      max: 200,
      step: 5,
      hint: "Matte → shimmering crystals",
      accent: "#facc15",
    },
  ];

  const getValue = (key: ControlKey) =>
    value?.[key] ?? SNOWFALL_TUNING_DEFAULTS[key];

  function handleChange(key: ControlKey, raw: number) {
    const meta = controls.find((c) => c.key === key);
    const min = meta?.min ?? 0;
    const max = meta?.max ?? 200;
    const nextValue = Math.min(max, Math.max(min, Math.round(raw)));

    onChange({
      ...value,
      [key]: nextValue,
    });
  }

  function reset() {
    onChange({ ...SNOWFALL_TUNING_DEFAULTS });
  }
</script>

<div class="snowfall-lab">
  <div class="lab-header">
    <div class="lab-copy">
      <p class="eyebrow">Snowfall Lab</p>
      <h4>Dial in your storm</h4>
      <p class="subtext">
        Speed up flakes, pile on density, add sparkle, or chill it all the way down.
      </p>
    </div>

    <button class="reset-btn" onclick={reset} aria-label="Reset snowfall tweaks">
      Reset
    </button>
  </div>

  <div class="controls-grid">
    {#each controls as control}
      <div class="control-card">
        <div class="control-header">
          <div>
            <p class="control-label">{control.label}</p>
            <p class="control-hint">{control.hint}</p>
          </div>
          <span class="value-chip">{getValue(control.key)}%</span>
        </div>

        <input
          type="range"
          min={control.min}
          max={control.max}
          step={control.step ?? 1}
          value={getValue(control.key)}
          style={`--accent:${control.accent};`}
          aria-label={`${control.label} (${getValue(control.key)}%)`}
          oninput={(event) =>
            handleChange(control.key, Number((event.currentTarget as HTMLInputElement).value))}
        />

        <div class="scale">
          <span>{control.min}%</span>
          <span>{control.max}%</span>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .snowfall-lab {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 12px 14px;
    border-radius: 14px;
    background: radial-gradient(
        circle at 20% 20%,
        rgba(96, 165, 250, 0.12),
        transparent 30%
      ),
      radial-gradient(
        circle at 80% 0%,
        rgba(148, 163, 184, 0.12),
        transparent 28%
      ),
      rgba(14, 19, 30, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow:
      0 10px 40px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
  }

  .lab-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .lab-copy {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .eyebrow {
    margin: 0;
    font-size: 11px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.6);
  }

  .subtext {
    margin: 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 13px;
    max-width: 620px;
  }

  .reset-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.16);
    color: #e5e7eb;
    border-radius: 10px;
    padding: 10px 14px;
    cursor: pointer;
    font-weight: 600;
    font-size: 12px;
    transition: all 0.2s ease;
  }

  .reset-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.26);
  }

  .reset-btn:active {
    transform: translateY(1px);
  }

  .controls-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
    width: 100%;
  }

  .control-card {
    padding: 12px 12px 8px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .control-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
  }

  .control-label {
    margin: 0;
    font-weight: 700;
    font-size: 13px;
    color: #f8fafc;
  }

  .control-hint {
    margin: 2px 0 0;
    color: rgba(255, 255, 255, 0.65);
    font-size: 12px;
  }

  .value-chip {
    min-width: 58px;
    text-align: right;
    font-weight: 700;
    font-size: 12px;
    color: #e0e7ff;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(99, 102, 241, 0.16);
    border: 1px solid rgba(99, 102, 241, 0.3);
  }

  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      var(--accent, #6366f1),
      rgba(255, 255, 255, 0.12)
    );
    outline: none;
    margin: 6px 0;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #0ea5e9;
    border: 2px solid #e0f2fe;
    box-shadow: 0 6px 14px rgba(14, 165, 233, 0.35);
    cursor: pointer;
  }

  input[type="range"]::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #0ea5e9;
    border: 2px solid #e0f2fe;
    box-shadow: 0 6px 14px rgba(14, 165, 233, 0.35);
    cursor: pointer;
  }

  .scale {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
  }

  @media (max-width: 640px) {
    .snowfall-lab {
      padding: 10px 12px;
    }

    .controls-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .reset-btn,
    .control-card,
    .snowfall-lab {
      transition: none;
    }
  }
</style>
