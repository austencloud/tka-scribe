<script lang="ts">
  /**
   * AvatarCustomizer Panel
   *
   * UI for customizing the 3D figure's appearance:
   * - Body type toggle (masculine/feminine)
   * - Skin tone selection (preset colors)
   */

  import type { BodyType } from "../../services/contracts/IAvatarCustomizer";

  interface Props {
    bodyType: BodyType;
    skinTone: string;
    onBodyTypeChange: (type: BodyType) => void;
    onSkinToneChange: (color: string) => void;
  }

  let { bodyType, skinTone, onBodyTypeChange, onSkinToneChange }: Props = $props();

  // Skin tone presets - diverse range
  const SKIN_TONES = [
    { name: "Fair", color: "#ffe0bd" },
    { name: "Light", color: "#f5d0b5" },
    { name: "Medium Light", color: "#d4a574" },
    { name: "Medium", color: "#c68642" },
    { name: "Medium Dark", color: "#8d5524" },
    { name: "Dark", color: "#5c3317" },
  ];
</script>

<div class="avatar-customizer">
  <h4 class="section-title">Avatar</h4>

  <!-- Body Type Toggle -->
  <div class="control-group">
    <span class="control-label">Body Type</span>
    <div class="toggle-group" role="group" aria-label="Body type">
      <button
        class="toggle-btn"
        class:active={bodyType === "masculine"}
        onclick={() => onBodyTypeChange("masculine")}
        aria-pressed={bodyType === "masculine"}
      >
        <i class="fas fa-mars"></i>
        <span>Masculine</span>
      </button>
      <button
        class="toggle-btn"
        class:active={bodyType === "feminine"}
        onclick={() => onBodyTypeChange("feminine")}
        aria-pressed={bodyType === "feminine"}
      >
        <i class="fas fa-venus"></i>
        <span>Feminine</span>
      </button>
    </div>
  </div>

  <!-- Skin Tone Selector -->
  <div class="control-group">
    <span class="control-label">Skin Tone</span>
    <div class="skin-tone-grid" role="group" aria-label="Skin tone">
      {#each SKIN_TONES as tone}
        <button
          class="skin-swatch"
          class:active={skinTone === tone.color}
          style:background-color={tone.color}
          onclick={() => onSkinToneChange(tone.color)}
          aria-label={tone.name}
          title={tone.name}
        >
          {#if skinTone === tone.color}
            <i class="fas fa-check"></i>
          {/if}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .avatar-customizer {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .section-title {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.5);
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .control-label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .toggle-group {
    display: flex;
    gap: 0.5rem;
  }

  .toggle-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.6rem 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .toggle-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
  }

  .toggle-btn.active {
    background: rgba(100, 180, 255, 0.2);
    border-color: rgba(100, 180, 255, 0.4);
    color: #64b5f6;
  }

  .toggle-btn i {
    font-size: 0.9rem;
  }

  .skin-tone-grid {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .skin-swatch {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .skin-swatch:hover {
    transform: scale(1.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .skin-swatch.active {
    border-color: #64b5f6;
    box-shadow: 0 0 0 2px rgba(100, 180, 255, 0.3);
  }

  .skin-swatch i {
    color: rgba(0, 0, 0, 0.5);
    font-size: 0.8rem;
    text-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
  }
</style>
