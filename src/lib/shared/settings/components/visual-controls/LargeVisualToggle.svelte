<script lang="ts">
  import { spring } from "svelte/motion";
  import type { Snippet } from "svelte";

  interface Props {
    enabled: boolean;
    label: string;
    description?: string;
    helperText?: string;
    size?: "standard" | "large";
    preview?: Snippet<[{ enabled: boolean }]>;
    disabled?: boolean;
    onChange?: (enabled: boolean) => void;
    onToggle?: () => void;
  }

  let {
    enabled = $bindable(),
    label,
    description,
    helperText,
    size = "large",
    preview,
    disabled = false,
    onChange,
    onToggle,
  }: Props = $props();

  // Spring animation for smooth thumb movement
  const thumbPosition = spring(enabled ? 1 : 0, {
    stiffness: 0.3,
    damping: 0.4,
  });

  // Update spring when enabled changes
  $effect(() => {
    thumbPosition.set(enabled ? 1 : 0);
  });

  // Calculate thumb translation based on size
  const thumbTranslate = $derived(
    size === "large"
      ? $thumbPosition * 30 // 68px - 36px - 2px padding
      : $thumbPosition * 22 // 51px - 27px - 2px padding
  );

  function handleToggle() {
    if (disabled) return;
    enabled = !enabled;
    onChange?.(enabled);
    onToggle?.();
  }
</script>

<div class="visual-toggle" class:has-preview={!!preview}>
  <!-- Optional preview slot (left side) -->
  {#if preview}
    <div class="toggle-preview">
      {@render preview({ enabled })}
    </div>
  {/if}

  <!-- Control section (right side or full width if no preview) -->
  <div class="toggle-control">
    <div class="toggle-text">
      <label for="toggle-{label}" class="toggle-label" class:disabled>
        {label}
      </label>
      {#if description}
        <p class="toggle-description">{description}</p>
      {/if}
      {#if helperText}
        <p class="toggle-helper-text">{helperText}</p>
      {/if}
    </div>

    <button
      id="toggle-{label}"
      class="visual-setting-toggle"
      class:on={enabled}
      class:large={size === "large"}
      class:standard={size === "standard"}
      class:disabled
      {disabled}
      onclick={handleToggle}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
    >
      <span class="toggle-track">
        <span
          class="toggle-thumb"
          style="transform: translateX({thumbTranslate}px)"
        ></span>
      </span>
    </button>
  </div>
</div>

<style>
  .visual-toggle {
    container-type: inline-size;
    container-name: visual-toggle;
    display: flex;
    gap: 24px;
    align-items: center;
    padding: 16px;
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke);
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .visual-toggle:hover {
    background: var(--theme-card-hover-bg);
    border-color: var(--theme-stroke-strong);
  }

  /* Preview section (if provided) */
  .toggle-preview {
    flex: 0 0 120px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    overflow: hidden;
  }

  /* Control section */
  .toggle-control {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .toggle-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .toggle-label {
    font-size: 15px;
    font-weight: 600;
    color: var(--theme-text);
    cursor: pointer;
    margin: 0;
    letter-spacing: -0.3px;
  }

  .toggle-description {
    font-size: 13px;
    font-weight: 400;
    color: var(--theme-text-dim);
    margin: 0;
    line-height: 1.4;
  }

  .toggle-helper-text {
    font-size: 13px;
    font-weight: 400;
    color: color-mix(in srgb, var(--theme-text-dim) 70%, transparent);
    margin: 0;
    line-height: 1.4;
    font-style: italic;
  }

  .toggle-label.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Toggle switch - container query aware with 50px minimum */
  .visual-setting-toggle {
    flex-shrink: 0;
    position: relative;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: transparent;
    /* Container query aware sizing with 50px min touch target */
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .visual-setting-toggle:disabled,
  .visual-setting-toggle.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .visual-setting-toggle:disabled .toggle-track,
  .visual-setting-toggle.disabled .toggle-track {
    background: rgba(120, 120, 128, 0.2);
  }

  /* Large size - responsive with container queries */
  .visual-setting-toggle.large .toggle-track {
    width: clamp(50px, 10cqi, 68px);
    height: clamp(28px, 6cqi, 40px);
  }

  /* Standard size - responsive with container queries */
  .visual-setting-toggle.standard .toggle-track {
    width: clamp(50px, 8cqi, 51px);
    height: clamp(28px, 5cqi, 31px);
  }

  .toggle-track {
    display: block;
    border-radius: 9999px;
    background: rgba(120, 120, 128, 0.32);
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .visual-setting-toggle.on .toggle-track {
    background: linear-gradient(
      135deg,
      var(--theme-accent),
      var(--theme-accent-strong)
    );
    box-shadow:
      0 4px 20px color-mix(in srgb, var(--theme-accent) 40%, transparent),
      inset 0 1px 2px rgba(255, 255, 255, 0.2);
  }

  .toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
  }

  /* Large thumb - responsive */
  .visual-setting-toggle.large .toggle-thumb {
    width: clamp(24px, 5cqi, 36px);
    height: clamp(24px, 5cqi, 36px);
  }

  /* Standard thumb - responsive */
  .visual-setting-toggle.standard .toggle-thumb {
    width: clamp(24px, 4cqi, 27px);
    height: clamp(24px, 4cqi, 27px);
  }

  .visual-setting-toggle.on .toggle-thumb {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  /* Hover effects */
  .visual-setting-toggle:hover .toggle-track {
    background: rgba(120, 120, 128, 0.4);
  }

  .visual-setting-toggle.on:hover .toggle-track {
    background: linear-gradient(135deg, #7c7ff3, #9d6cf8);
  }

  /* Focus state */
  .visual-setting-toggle:focus-visible {
    outline: 2px solid var(--theme-accent);
    outline-offset: 4px;
    border-radius: 9999px;
  }

  /* Active (pressed) state */
  .visual-setting-toggle:active .toggle-thumb {
    transform: translateX(calc(var(--thumb-translate, 0px))) scale(0.95);
  }

  /* Container query based adjustments */
  @container visual-toggle (max-width: 300px) {
    .toggle-control {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .visual-setting-toggle {
      align-self: flex-end;
    }
  }

  @container visual-toggle (max-width: 200px) {
    .visual-setting-toggle.large .toggle-track,
    .visual-setting-toggle.standard .toggle-track {
      width: var(--min-touch-target);
      height: 28px;
    }

    .visual-setting-toggle.large .toggle-thumb,
    .visual-setting-toggle.standard .toggle-thumb {
      width: 24px;
      height: 24px;
    }
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .visual-toggle {
      flex-direction: column;
      align-items: stretch;
    }

    .visual-toggle.has-preview {
      flex-direction: column;
    }

    .toggle-preview {
      flex: 0 0 auto;
      width: 100%;
      height: 100px;
    }

    .toggle-control {
      flex-direction: row;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .visual-setting-toggle,
    .toggle-track,
    .toggle-thumb {
      transition: none;
    }
  }
</style>
