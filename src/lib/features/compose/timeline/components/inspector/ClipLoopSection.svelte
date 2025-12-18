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
      <label class="field-label">Loop Count (0 = infinite)</label>
      <input
        type="number"
        class="number-input wide"
        min="0"
        max="100"
        value={loopCount}
        onchange={(e) => onUpdateLoopCount(parseInt((e.target as HTMLInputElement).value))}
      />
    </div>
  {/if}
</section>

<style>
  @import './inspector-styles.css';
</style>
