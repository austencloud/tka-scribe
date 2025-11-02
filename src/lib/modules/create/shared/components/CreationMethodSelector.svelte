<!--
  CreationMethodSelector.svelte

  Slide-up sheet that presents creation method options to new users.
  Uses the standard BottomSheet pattern for consistency with the rest of the app.
-->
<script lang="ts">
  import { BottomSheet } from "$shared";
  import type { BuildModeId } from "$shared";
  import { scale } from "svelte/transition";
  import { quintOut } from "svelte/easing";

  type CreationMethod = {
    id: BuildModeId;
    label: string;
    icon: string;
    description: string;
    color: string;
  };

  const methods: CreationMethod[] = [
    {
      id: 'construct',
      label: 'Construct',
      icon: 'fas fa-hammer',
      description: 'Build step-by-step with full pictographs',
      color: '#3b82f6'
    },
    {
      id: 'one-handed',
      label: 'One-Handed',
      icon: 'fas fa-hand-paper',
      description: 'Select red motions, then blue motions',
      color: '#a855f7'
    },
    {
      id: 'gestural',
      label: 'HandPath',
      icon: 'fas fa-hand-pointer',
      description: 'Swipe hand paths on touchscreen',
      color: '#10b981'
    },
    {
      id: 'generate',
      label: 'Generate',
      icon: 'fas fa-bolt',
      description: 'Auto-create from patterns',
      color: '#f59e0b'
    }
  ];

  let rememberChoice = $state(false);

  let {
    isOpen = false,
    onMethodSelected
  }: {
    isOpen: boolean;
    onMethodSelected: (method: BuildModeId, remember: boolean) => void;
  } = $props();

  function selectMethod(method: BuildModeId) {
    onMethodSelected(method, rememberChoice);
  }
</script>

<BottomSheet
  {isOpen}
  closeOnBackdrop={false}
  closeOnEscape={false}
  showHandle={true}
  ariaLabel="Choose creation method"
>
  <div class="creation-method-selector">
    <h2>How would you like to create?</h2>
    <p class="subtitle">Choose your preferred method to get started</p>

    <div class="method-grid">
      {#each methods as method, i}
        <button
          class="method-card"
          style="--accent-color: {method.color}"
          onclick={() => selectMethod(method.id)}
          in:scale={{
            duration: 300,
            delay: i * 50,
            easing: quintOut,
            start: 0.9
          }}
        >
          <div class="icon-wrapper">
            <i class={method.icon}></i>
          </div>
          <h3>{method.label}</h3>
          <p>{method.description}</p>
        </button>
      {/each}
    </div>

    <label class="remember-checkbox">
      <input type="checkbox" bind:checked={rememberChoice} />
      <span>Remember my choice and skip this next time</span>
    </label>

    <p class="hint">
      <i class="fas fa-info-circle"></i>
      You can always switch methods using the tabs below
    </p>
  </div>
</BottomSheet>

<style>
  /* Enable container queries for intrinsic sizing */
  .creation-method-selector {
    container-type: inline-size;
    container-name: selector;
    padding: clamp(1rem, 3cqi, 2rem);
    padding-bottom: max(clamp(1rem, 3cqi, 2rem), env(safe-area-inset-bottom));
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  h2 {
    font-size: clamp(1.25rem, 4cqi + 0.5rem, 2rem);
    font-weight: 700;
    text-align: center;
    margin-bottom: clamp(0.25rem, 1cqi, 0.75rem);
    color: #ffffff;
    flex-shrink: 0;
  }

  .subtitle {
    text-align: center;
    font-size: clamp(0.8rem, 2cqi + 0.4rem, 1rem);
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: clamp(1rem, 3cqi, 2rem);
    flex-shrink: 0;
  }

  .method-grid {
    display: grid;
    /* Auto-fit: let the grid decide how many columns based on available space */
    grid-template-columns: repeat(auto-fit, minmax(min(140px, 100%), 1fr));
    gap: clamp(0.75rem, 2cqi, 1.5rem);
    margin-bottom: clamp(1rem, 2cqi, 1.5rem);
    flex: 1;
    align-content: start;
  }

  .method-card {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: clamp(8px, 2cqi, 16px);
    padding: clamp(0.75rem, 3cqi, 1.75rem) clamp(0.5rem, 2cqi, 1.25rem);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    position: relative;
    overflow: hidden;
    /* Maintain square aspect ratio when possible */
    aspect-ratio: 1;
    /* But allow content to determine height if needed */
    min-height: fit-content;
  }

  .method-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg,
      var(--accent-color) 0%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .method-card:hover,
  .method-card:focus-visible {
    border-color: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .method-card:hover::before,
  .method-card:focus-visible::before {
    opacity: 0.15;
  }

  .method-card:active {
    transform: translateY(0);
  }

  .icon-wrapper {
    font-size: clamp(2rem, 6cqi, 3.5rem);
    color: var(--accent-color);
    margin-bottom: clamp(0.5rem, 1.5cqi, 1rem);
    filter: drop-shadow(0 2px 8px var(--accent-color));
    position: relative;
    z-index: 1;
    flex-shrink: 0;
  }

  h3 {
    font-size: clamp(0.95rem, 2.5cqi + 0.3rem, 1.25rem);
    font-weight: 600;
    margin-bottom: clamp(0.125rem, 0.5cqi, 0.375rem);
    color: #ffffff;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
  }

  p {
    font-size: clamp(0.7rem, 1.8cqi + 0.2rem, 0.9rem);
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.3;
    position: relative;
    z-index: 1;
    flex-shrink: 1;
  }

  .remember-checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(0.5rem, 1.5cqi, 0.75rem);
    margin-bottom: clamp(0.75rem, 2cqi, 1.25rem);
    cursor: pointer;
    color: rgba(255, 255, 255, 0.9);
    font-size: clamp(0.8rem, 2cqi + 0.3rem, 0.95rem);
    transition: color 0.2s ease;
    padding: clamp(0.375rem, 1cqi, 0.625rem);
    flex-shrink: 0;
  }

  .remember-checkbox:hover {
    color: #ffffff;
  }

  input[type="checkbox"] {
    width: clamp(16px, 4cqi, 20px);
    height: clamp(16px, 4cqi, 20px);
    cursor: pointer;
    accent-color: #3b82f6;
    flex-shrink: 0;
  }

  .hint {
    text-align: center;
    font-size: clamp(0.7rem, 1.8cqi + 0.2rem, 0.875rem);
    color: rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(0.375rem, 1cqi, 0.625rem);
    padding: clamp(0.5rem, 1.5cqi, 0.875rem);
    background: rgba(255, 255, 255, 0.03);
    border-radius: clamp(6px, 1.5cqi, 10px);
    flex-shrink: 0;
  }

  .hint i {
    font-size: 1em;
    flex-shrink: 0;
  }

  /* Container query: when very narrow (single column), adjust aspect ratio */
  @container selector (max-width: 320px) {
    .method-grid {
      grid-template-columns: 1fr;
    }

    .method-card {
      aspect-ratio: auto;
      min-height: auto;
    }
  }

  /* Container query: when wide enough for 2 columns but constrained height */
  @container selector (min-width: 321px) and (max-width: 480px) {
    .method-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Container query: when very wide, cap at 4 columns max */
  @container selector (min-width: 640px) {
    .method-grid {
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
    }
  }
</style>
