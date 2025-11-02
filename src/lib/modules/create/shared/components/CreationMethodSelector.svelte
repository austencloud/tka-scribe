<!--
  CreationMethodSelector.svelte

  Full-screen overlay that presents creation method options to new users.
  Shows 2x2 grid of method cards with option to remember choice.
  Only appears when user has no sequence and hasn't selected a preferred method.
-->
<script lang="ts">
  import type { BuildModeId } from "$shared";
  import { fade, scale } from "svelte/transition";
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
    onMethodSelected
  }: {
    onMethodSelected: (method: BuildModeId, remember: boolean) => void;
  } = $props();

  function selectMethod(method: BuildModeId) {
    onMethodSelected(method, rememberChoice);
  }
</script>

<div
  class="selector-overlay"
  in:fade={{ duration: 300 }}
  out:fade={{ duration: 200 }}
>
  <div
    class="selector-content"
    in:scale={{ duration: 400, delay: 150, easing: quintOut, start: 0.9 }}
  >
    <h2>How would you like to create?</h2>

    <div class="method-grid">
      {#each methods as method, i}
        <button
          class="method-card"
          style="--accent-color: {method.color}"
          onclick={() => selectMethod(method.id)}
          in:scale={{
            duration: 300,
            delay: 300 + (i * 50),
            easing: quintOut,
            start: 0.8
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

    <label
      class="remember-checkbox"
      in:fade={{ duration: 300, delay: 600 }}
    >
      <input type="checkbox" bind:checked={rememberChoice} />
      <span>Remember my choice and skip this next time</span>
    </label>

    <p
      class="hint"
      in:fade={{ duration: 300, delay: 700 }}
    >
      You can always switch methods using the tabs below
      <i class="fas fa-arrow-down"></i>
    </p>
  </div>
</div>

<style>
  .selector-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg,
      rgba(26, 26, 46, 0.98) 0%,
      rgba(22, 33, 62, 0.98) 100%
    );
    backdrop-filter: blur(10px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .selector-content {
    max-width: 700px;
    width: 100%;
  }

  h2 {
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 2.5rem;
    color: #ffffff;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .method-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 1.25rem;
    margin-bottom: 2rem;
  }

  .method-card {
    aspect-ratio: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    position: relative;
    overflow: hidden;
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

  .method-card:hover {
    border-color: var(--accent-color);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  .method-card:hover::before {
    opacity: 0.1;
  }

  .method-card:active {
    transform: translateY(-2px);
  }

  .icon-wrapper {
    font-size: 3rem;
    color: var(--accent-color);
    margin-bottom: 1rem;
    filter: drop-shadow(0 4px 12px var(--accent-color));
    position: relative;
    z-index: 1;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #ffffff;
    position: relative;
    z-index: 1;
  }

  p {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.4;
    position: relative;
    z-index: 1;
  }

  .remember-checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
    transition: color 0.2s ease;
  }

  .remember-checkbox:hover {
    color: #ffffff;
  }

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #3b82f6;
  }

  .hint {
    text-align: center;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .hint i {
    animation: bounce 2s infinite;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(4px);
    }
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .selector-overlay {
      padding: 1rem;
    }

    h2 {
      font-size: 1.5rem;
      margin-bottom: 2rem;
    }

    .method-grid {
      gap: 1rem;
    }

    .method-card {
      padding: 1rem;
    }

    .icon-wrapper {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
    }

    h3 {
      font-size: 1.1rem;
    }

    p {
      font-size: 0.8rem;
    }

    .remember-checkbox {
      font-size: 0.875rem;
    }

    .hint {
      font-size: 0.75rem;
    }
  }

  /* Extra small screens - stack cards vertically */
  @media (max-width: 480px) {
    .method-grid {
      grid-template-columns: 1fr;
      grid-template-rows: auto;
      gap: 0.75rem;
    }

    .method-card {
      aspect-ratio: auto;
      padding: 1.25rem;
    }
  }
</style>
