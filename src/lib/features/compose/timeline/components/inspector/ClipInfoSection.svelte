<script lang="ts">
  /**
   * ClipInfoSection - Displays clip metadata and label input
   */

  import type { TimelineClip } from "../../domain/timeline-types";

  interface Props {
    clip: TimelineClip;
    effectiveDuration: number;
    onUpdateLabel: (label: string) => void;
  }

  let { clip, effectiveDuration, onUpdateLabel }: Props = $props();

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins}:${secs.padStart(5, "0")}`;
  }
</script>

<section class="section">
  <div class="section-header">
    <i class="fa-solid fa-info-circle" aria-hidden="true"></i>
    <span>Info</span>
  </div>

  <div class="info-row">
    <span class="info-label">Sequence</span>
    <span class="info-value">{clip.sequence.name || "Unnamed"}</span>
  </div>

  <div class="info-row">
    <span class="info-label">Beats</span>
    <span class="info-value">{clip.sequence.beats.length}</span>
  </div>

  <div class="info-row">
    <span class="info-label">Duration</span>
    <span class="info-value">{formatTime(clip.duration)}</span>
  </div>

  <div class="info-row">
    <span class="info-label">Effective</span>
    <span class="info-value">{formatTime(effectiveDuration)}</span>
  </div>

  <div class="field">
    <label class="field-label" for="clip-label">Label</label>
    <input
      id="clip-label"
      type="text"
      class="text-input"
      placeholder="Optional clip label"
      value={clip.label ?? ""}
      onchange={(e) => onUpdateLabel((e.target as HTMLInputElement).value)}
    />
  </div>
</section>

<style>
  .section {
    margin-bottom: 20px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 8px;
    margin-bottom: 12px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    font-size: var(--font-size-compact, 12px);
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.85));
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .section-header i {
    font-size: 12px;
    opacity: 0.6;
  }

  .field {
    margin-bottom: 12px;
  }

  .field-label {
    display: block;
    margin-bottom: 6px;
    font-size: 12px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .text-input {
    width: 100%;
    padding: 8px 10px;
    background: var(--theme-input-bg, rgba(0, 0, 0, 0.3));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 6px;
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .text-input:focus {
    outline: none;
    border-color: var(--theme-accent, #4a9eff);
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: var(--font-size-compact, 12px);
  }

  .info-label {
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
  }

  .info-value {
    color: var(--theme-text, rgba(255, 255, 255, 0.85));
    font-weight: 500;
  }
</style>
