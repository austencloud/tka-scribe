<!--
  MirrorAxisSelector.svelte

  Axis selector for choosing vertical or horizontal mirror.
-->
<script lang="ts">
  type MirrorAxis = "vertical" | "horizontal";

  let {
    axis = $bindable<MirrorAxis>("vertical"),
  }: {
    axis: MirrorAxis;
  } = $props();

  const axisOptions = [
    {
      id: "vertical" as const,
      icon: "fa-arrows-left-right",
      label: "Vertical",
      description: "Mirror left to right",
    },
    {
      id: "horizontal" as const,
      icon: "fa-arrows-up-down",
      label: "Horizontal",
      description: "Mirror top to bottom",
    },
  ];
</script>

<div class="axis-selector">
  <span class="axis-label">Mirror Axis:</span>
  <div class="axis-options">
    {#each axisOptions as option}
      <button
        class="axis-btn"
        class:active={axis === option.id}
        onclick={() => axis = option.id}
        title={option.description}
      >
        <i class="fas {option.icon}"></i>
        <span>{option.label}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .axis-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 0.75rem 1.25rem;
    background: rgba(0, 0, 0, 0.15);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
  }

  .axis-label {
    font-size: 0.9rem;
    opacity: 0.7;
  }

  .axis-options {
    display: flex;
    gap: 0.5rem;
  }

  .axis-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 48px;
    padding: 0.5rem 1.25rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .axis-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .axis-btn.active {
    background: rgba(6, 182, 212, 0.2);
    border-color: rgba(6, 182, 212, 0.5);
    color: #22d3ee;
  }

  @media (max-width: 480px) {
    .axis-selector {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>
