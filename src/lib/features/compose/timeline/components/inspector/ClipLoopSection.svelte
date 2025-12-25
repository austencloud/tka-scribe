<script lang="ts">
  /**
   * ClipLoopSection - Loop toggle and count controls
   */

  interface Props {
    loop: boolean;
    loopCount: number;
    onUpdateLoop: (enabled: boolean) => void;
    onUpdateLoopCount: (count: number) => void;
  }

  let { loop, loopCount, onUpdateLoop, onUpdateLoopCount }: Props = $props();
</script>

<section class="section">
  <div class="section-header">
    <i class="fa-solid fa-repeat"></i>
    <span>Loop</span>
  </div>

  <label class="toggle-row">
    <span>Enable Looping</span>
    <input
      type="checkbox"
      checked={loop}
      onchange={(e) => onUpdateLoop((e.target as HTMLInputElement).checked)}
    />
  </label>

  {#if loop}
    <div class="field">
      <label class="field-label" for="loop-count">Loop Count (0 = infinite)</label>
      <input
        id="loop-count"
        type="number"
        class="number-input wide"
        min="0"
        max="100"
        value={loopCount}
        onchange={(e) =>
          onUpdateLoopCount(parseInt((e.target as HTMLInputElement).value))}
      />
    </div>
  {/if}
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

  .number-input {
    width: 60px;
    padding: 6px 8px;
    background: var(--theme-input-bg, rgba(0, 0, 0, 0.3));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 4px;
    font-size: 11px;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    text-align: center;
  }

  .field-label {
    display: block;
    margin-bottom: 6px;
    font-size: 11px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .number-input.wide {
    width: 100%;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border-radius: 6px;
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text, rgba(255, 255, 255, 0.85));
    cursor: pointer;
    margin-bottom: 12px;
  }

  .toggle-row input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: var(--theme-accent, #4a9eff);
  }
</style>
