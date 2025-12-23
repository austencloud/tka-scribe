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
    <i class="fa-solid fa-info-circle"></i>
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
    <label class="field-label">Label</label>
    <input
      type="text"
      class="text-input"
      placeholder="Optional clip label"
      value={clip.label ?? ""}
      onchange={(e) => onUpdateLabel((e.target as HTMLInputElement).value)}
    />
  </div>
</section>

<style>
  @import "./inspector-styles.css";

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
