<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import type { ImageOptions, ToggleOptionKey } from "./sharePanelTypes";

  export let options: ImageOptions;
  export let expanded = false;

  const dispatch = createEventDispatcher<{
    toggleExpanded: void;
    toggleOption: ToggleOptionKey;
    setFormat: ImageOptions["format"];
    setQuality: number;
  }>();

  const toggleOptions: { key: ToggleOptionKey; label: string }[] = [
    { key: "addWord", label: "Word Label" },
    { key: "addBeatNumbers", label: "Beat Numbers" },
    { key: "addDifficultyLevel", label: "Difficulty Level" },
    { key: "includeStartPosition", label: "Start Position" },
    { key: "addUserInfo", label: "User Info" },
  ];

  const formats = ["PNG", "JPEG", "WebP"] as const;

  function handleQualityInput(event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value);
    dispatch("setQuality", value);
  }
</script>

<section class="options-section">
  <button class="options-toggle" onclick={() => dispatch("toggleExpanded")}>
    <span>Image Options</span>
    <i class={`fas fa-chevron-${expanded ? "up" : "down"}`}></i>
  </button>

  {#if expanded}
    <div class="options-content">
      <div class="options-group">
        <h4>Include in Image</h4>
        <div class="toggle-options">
          {#each toggleOptions as option}
            <label class="toggle-option">
              <input
                type="checkbox"
                checked={options[option.key]}
                onchange={() => dispatch("toggleOption", option.key)}
              />
              <span class="image-option-toggle"></span>
              <span class="toggle-label">{option.label}</span>
            </label>
          {/each}
        </div>
      </div>

      <div class="options-group">
        <h4>Image Format</h4>
        <div class="format-buttons">
          {#each formats as format}
            <button
              class="format-btn"
              class:active={options.format === format}
              onclick={() => dispatch("setFormat", format)}
            >
              {format}
            </button>
          {/each}
        </div>
      </div>

      {#if options.format !== "PNG"}
        <div class="options-group">
          <h4>
            Quality
            <span class="quality-value"
              >{Math.round(options.quality * 100)}%</span
            >
          </h4>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.05"
            value={options.quality}
            oninput={handleQualityInput}
            class="quality-slider"
          />
        </div>
      {/if}
    </div>
  {/if}
</section>

<style>
  .options-section {
    animation: fadeIn 0.4s ease-out backwards;
    animation-delay: 0.1s;
  }

  .options-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.06),
      rgba(255, 255, 255, 0.03)
    );
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    border-radius: 14px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .options-toggle:hover {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.05)
    );
    border-color: rgba(255, 255, 255, 0.22);
    transform: translateY(-1px);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .options-toggle i {
    font-size: 14px;
    opacity: 0.7;
    transition: transform 0.3s ease;
  }

  .options-content {
    margin-top: 14px;
    padding: 20px 22px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.04),
      rgba(255, 255, 255, 0.02)
    );
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
    animation: slideDown 0.3s ease-out;
  }

  .options-group {
    margin-bottom: 24px;
  }

  .options-group:last-child {
    margin-bottom: 0;
  }

  .options-group h4 {
    margin: 0 0 14px 0;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .quality-value {
    font-size: 12px;
    color: rgba(59, 130, 246, 0.9);
    font-weight: 700;
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.15),
      rgba(59, 130, 246, 0.08)
    );
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid rgba(59, 130, 246, 0.25);
  }

  .toggle-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .toggle-option {
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
    padding: 12px 16px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.03),
      rgba(255, 255, 255, 0.01)
    );
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    transition: all 0.2s ease;
  }

  .toggle-option:hover {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.06),
      rgba(255, 255, 255, 0.03)
    );
    border-color: rgba(255, 255, 255, 0.12);
  }

  .toggle-option input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .image-option-toggle {
    position: relative;
    width: var(--min-touch-target);
    height: 28px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
  }

  .image-option-toggle::before {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 22px;
    height: 22px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.2),
      0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .toggle-option input[type="checkbox"]:checked + .image-option-toggle {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-color: #3b82f6;
    box-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
  }

  .toggle-option input[type="checkbox"]:checked + .image-option-toggle::before {
    transform: translateX(20px);
  }

  .toggle-label {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }

  .format-buttons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .format-btn {
    padding: 12px 20px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.04)
    );
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .format-btn:hover {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.12),
      rgba(255, 255, 255, 0.06)
    );
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }

  .format-btn.active {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-color: #3b82f6;
    color: white;
    box-shadow:
      0 4px 12px rgba(59, 130, 246, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .format-btn.active:hover {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    transform: translateY(-2px);
    box-shadow:
      0 6px 16px rgba(59, 130, 246, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
  }

  .quality-slider {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
  }

  .quality-slider::-webkit-slider-track {
    width: 100%;
    height: 6px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.12),
      rgba(255, 255, 255, 0.08)
    );
    border-radius: 3px;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .quality-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-radius: 50%;
    cursor: pointer;
    box-shadow:
      0 2px 8px rgba(59, 130, 246, 0.4),
      0 0 12px rgba(59, 130, 246, 0.3);
    border: 2px solid white;
    transition: all 0.2s ease;
  }

  .quality-slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    box-shadow:
      0 4px 12px rgba(59, 130, 246, 0.5),
      0 0 16px rgba(59, 130, 246, 0.4);
  }

  .quality-slider::-moz-range-track {
    width: 100%;
    height: 6px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.12),
      rgba(255, 255, 255, 0.08)
    );
    border-radius: 3px;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .quality-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-radius: 50%;
    cursor: pointer;
    box-shadow:
      0 2px 8px rgba(59, 130, 246, 0.4),
      0 0 12px rgba(59, 130, 246, 0.3);
    border: 2px solid white;
    transition: all 0.2s ease;
  }

  .quality-slider::-moz-range-thumb:hover {
    transform: scale(1.15);
    box-shadow:
      0 4px 12px rgba(59, 130, 246, 0.5),
      0 0 16px rgba(59, 130, 246, 0.4);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
