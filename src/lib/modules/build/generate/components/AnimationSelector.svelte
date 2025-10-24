<script lang="ts">
  // Animation selector for testing different beat animations

  let {
    currentAnimation = $bindable("springPop"),
    isSequential = $bindable(false)
  } = $props();

  const animations = [
    { id: "gentleBloom", name: "Gentle Bloom", emoji: "🌸" },
    { id: "softCascade", name: "Soft Cascade", emoji: "🎴" },
    { id: "springPop", name: "Spring Pop", emoji: "🎯" },
    { id: "microFade", name: "Micro Fade", emoji: "⚡" },
    { id: "glassBlur", name: "Glass Blur", emoji: "🪟" }
  ];

  function selectAnimation(id: string) {
    currentAnimation = id;
    // Dispatch event to update BeatCell animation
    window.dispatchEvent(new CustomEvent('animation-change', { detail: { animation: id } }));
    console.log(`🎨 Animation changed to: ${id}`);
  }

  function toggleSequential() {
    isSequential = !isSequential;
    // Dispatch event to update animation mode
    window.dispatchEvent(new CustomEvent('animation-mode-change', {
      detail: { isSequential }
    }));
    console.log(`🎬 Animation mode changed to: ${isSequential ? 'Sequential' : 'All at Once'}`);
  }
</script>

<div class="animation-selector">
  <div class="selector-header">
    <span class="label">🎬 Animation Style:</span>
    <span class="current">{animations.find(a => a.id === currentAnimation)?.name}</span>
  </div>
  <div class="animation-buttons">
    {#each animations as anim}
      <button
        class="anim-btn"
        class:active={currentAnimation === anim.id}
        onclick={() => selectAnimation(anim.id)}
      >
        <span class="emoji">{anim.emoji}</span>
        <span class="name">{anim.name}</span>
      </button>
    {/each}
  </div>

  <!-- Animation Mode Toggle -->
  <div class="mode-toggle-container">
    <span class="mode-label">Animation Mode</span>
    <div class="mode-toggle">
      <div class="mode-option" class:active={!isSequential}>
        <span class="mode-emoji">⚡</span>
        <span class="mode-name">All at Once</span>
      </div>
      <button
        class="toggle-switch"
        class:sequential={isSequential}
        onclick={toggleSequential}
        aria-label="Toggle between All at Once and Sequential animation"
      >
        <div class="toggle-slider"></div>
      </button>
      <div class="mode-option" class:active={isSequential}>
        <span class="mode-emoji">🎴</span>
        <span class="mode-name">Sequential</span>
      </div>
    </div>
  </div>
</div>

<style>
  .animation-selector {
    padding: 12px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    margin-top: 16px;
  }

  .selector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .label {
    font-weight: 600;
    color: var(--text-primary, #333);
  }

  .current {
    color: var(--primary, #007acc);
    font-weight: 500;
  }

  .animation-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .anim-btn {
    flex: 1;
    min-width: 100px;
    padding: 8px 12px;
    background: white;
    border: 2px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .anim-btn:hover {
    border-color: var(--primary, #007acc);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .anim-btn.active {
    background: var(--primary, #007acc);
    border-color: var(--primary, #007acc);
    color: white;
  }

  .emoji {
    font-size: 20px;
  }

  .name {
    font-size: 11px;
    font-weight: 500;
    text-align: center;
  }

  .anim-btn.active .name {
    color: white;
  }

  /* Animation Mode Toggle */
  .mode-toggle-container {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  .mode-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #333);
    margin-bottom: 8px;
  }

  .mode-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .mode-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    opacity: 0.4;
    transition: opacity 0.2s ease;
  }

  .mode-option.active {
    opacity: 1;
  }

  .mode-emoji {
    font-size: 20px;
  }

  .mode-name {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-primary, #333);
  }

  .toggle-switch {
    position: relative;
    width: 60px;
    height: 30px;
    background: #ddd;
    border: none;
    border-radius: 15px;
    cursor: pointer;
    transition: background 0.3s ease;
    padding: 0;
  }

  .toggle-switch:hover {
    background: #ccc;
  }

  .toggle-switch.sequential {
    background: var(--primary, #007acc);
  }

  .toggle-slider {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    transition: transform 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .toggle-switch.sequential .toggle-slider {
    transform: translateX(30px);
  }
</style>
