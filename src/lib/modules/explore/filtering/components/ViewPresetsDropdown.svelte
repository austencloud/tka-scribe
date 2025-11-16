<!--
ViewPresetsDropdown - Quick View Presets
Provides preset filter options for quick access:
- All Sequences
- Favorites
- Recent
- Easy/Medium/Hard difficulty levels

Responsive behavior:
- Desktop: Dropdown menu
- Mobile: Bottom sheet modal
-->
<script lang="ts">
  import type { IHapticFeedbackService, IDeviceDetector } from "$shared";
  import { resolve, TYPES, Drawer } from "$shared";
  import { onMount } from "svelte";
  import type { ExploreFilter } from "$shared/persistence/domain/types/FilteringTypes";
  import type { ResponsiveSettings } from "$shared/device/domain/models/device-models";

  let hapticService: IHapticFeedbackService;
  let deviceDetector: IDeviceDetector | null = null;
  let responsiveSettings = $state<ResponsiveSettings | null>(null);

  // Determine if we should use mobile pattern
  const isMobile = $derived(responsiveSettings?.isMobile || false);

  // ✅ PURE RUNES: Props
  const { currentFilter, onFilterChange = () => {} } = $props<{
    currentFilter: ExploreFilter;
    onFilterChange?: (filter: Partial<ExploreFilter>) => void;
  }>();

  // Dropdown state
  let isOpen = $state<boolean>(false);
  let dropdownRef = $state<HTMLDivElement | null>(null);

  // Preset definitions
  const presets = [
    { id: "all", label: "All Sequences", icon: "fa-th", filter: {} },
    {
      id: "favorites",
      label: "Favorites",
      icon: "fa-heart",
      filter: { showFavoritesOnly: true },
    },
    {
      id: "recent",
      label: "Recent",
      icon: "fa-clock",
      filter: { sortBy: "dateAdded" as const },
    },
    {
      id: "easy",
      label: "Easy",
      icon: "fa-circle",
      iconColor: "#4ade80",
      filter: { difficultyLevels: [1] },
    },
    {
      id: "medium",
      label: "Medium",
      icon: "fa-circle",
      iconColor: "#fbbf24",
      filter: { difficultyLevels: [2] },
    },
    {
      id: "hard",
      label: "Hard",
      icon: "fa-circle",
      iconColor: "#ef4444",
      filter: { difficultyLevels: [3] },
    },
  ];

  // Get current preset based on active filters
  const currentPreset = $derived.by(() => {
    if (currentFilter.showFavoritesOnly) return presets[1];
    if (currentFilter.sortBy === "dateAdded") return presets[2];
    if (
      currentFilter.difficultyLevels?.length === 1 &&
      currentFilter.difficultyLevels[0] === 1
    )
      return presets[3];
    if (
      currentFilter.difficultyLevels?.length === 1 &&
      currentFilter.difficultyLevels[0] === 2
    )
      return presets[4];
    if (
      currentFilter.difficultyLevels?.length === 1 &&
      currentFilter.difficultyLevels[0] === 3
    )
      return presets[5];
    return presets[0]; // All
  });

  // Handle preset selection
  function handlePresetClick(preset: (typeof presets)[0]) {
    hapticService?.trigger("selection");
    onFilterChange(preset.filter);
    closeDropdown();
  }

  // Toggle dropdown
  function toggleDropdown() {
    hapticService?.trigger("selection");
    isOpen = !isOpen;
  }

  // Close dropdown
  function closeDropdown() {
    isOpen = false;
  }

  // Handle click outside
  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      closeDropdown();
    }
  }

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    // Initialize DeviceDetector
    let cleanup: (() => void) | undefined;
    try {
      deviceDetector = resolve<IDeviceDetector>(TYPES.IDeviceDetector);
      responsiveSettings = deviceDetector.getResponsiveSettings();

      cleanup = deviceDetector.onCapabilitiesChanged(() => {
        responsiveSettings = deviceDetector!.getResponsiveSettings();
      });
    } catch (error) {
      console.warn(
        "ViewPresetsDropdown: Failed to resolve DeviceDetector",
        error
      );
    }

    // Add click outside listener (desktop only)
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      cleanup?.();
    };
  });
</script>

<div class="view-presets-dropdown" bind:this={dropdownRef}>
  <!-- Dropdown Toggle Button -->
  <button
    class="dropdown-toggle"
    class:active={isOpen}
    onclick={toggleDropdown}
    type="button"
    aria-label="View presets"
    aria-expanded={isOpen}
  >
    <i
      class="fas {currentPreset.icon}"
      style={currentPreset.iconColor ? `color: ${currentPreset.iconColor}` : ""}
    ></i>
    <span class="toggle-label">{currentPreset.label}</span>
    <i class="fas fa-chevron-{isOpen ? 'up' : 'down'} chevron-icon"></i>
  </button>

  <!-- Desktop: Dropdown Menu -->
  {#if isOpen && !isMobile}
    <div class="dropdown-menu">
      <div class="menu-header">Quick Views</div>
      <div class="menu-items">
        {#each presets as preset (preset.id)}
          <button
            class="menu-item"
            class:active={currentPreset.id === preset.id}
            onclick={() => handlePresetClick(preset)}
            type="button"
          >
            <i
              class="fas {preset.icon}"
              style={preset.iconColor ? `color: ${preset.iconColor}` : ""}
            ></i>
            <span>{preset.label}</span>
            {#if currentPreset.id === preset.id}
              <i class="fas fa-check check-icon"></i>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<!-- Mobile: Drawer Sheet -->
{#if isMobile}
  <Drawer bind:isOpen placement="bottom" ariaLabel="Quick Views">
    <div class="mobile-menu-items">
      {#each presets as preset (preset.id)}
        <button
          class="mobile-menu-item"
          class:active={currentPreset.id === preset.id}
          onclick={() => handlePresetClick(preset)}
          type="button"
        >
          <i
            class="fas {preset.icon}"
            style={preset.iconColor ? `color: ${preset.iconColor}` : ""}
          ></i>
          <span>{preset.label}</span>
          {#if currentPreset.id === preset.id}
            <i class="fas fa-check check-icon"></i>
          {/if}
        </button>
      {/each}
    </div>
  </Drawer>
{/if}

<style>
  .view-presets-dropdown {
    position: relative;
  }

  /* Dropdown Toggle Button */
  .dropdown-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .dropdown-toggle:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
  }

  .dropdown-toggle.active {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .toggle-label {
    font-size: 0.95rem;
  }

  .chevron-icon {
    font-size: 0.75rem;
    opacity: 0.7;
    transition: transform 0.2s ease;
  }

  /* Dropdown Menu */
  .dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    min-width: 200px;
    background: rgba(10, 10, 15, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    z-index: 10000;
    overflow: hidden;
    animation: slideDown 0.2s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .menu-header {
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .menu-items {
    padding: 8px;
  }

  .menu-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .menu-item:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .menu-item.active {
    background: rgba(255, 255, 255, 0.12);
  }

  .menu-item i:first-child {
    width: 18px;
    text-align: center;
    flex-shrink: 0;
  }

  .menu-item span {
    flex: 1;
  }

  .check-icon {
    color: rgba(74, 222, 128, 0.9);
    font-size: 0.875rem;
    flex-shrink: 0;
  }

  /* Mobile responsiveness */
  @media (max-width: 480px) {
    .dropdown-toggle {
      padding: 8px 12px;
      font-size: 0.875rem;
    }

    .toggle-label {
      font-size: 0.875rem;
    }

    .dropdown-menu {
      min-width: 180px;
    }

    .menu-item {
      padding: 8px 10px;
      font-size: 0.875rem;
    }
  }

  /* Mobile Bottom Sheet Styles */
  .mobile-menu-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .mobile-menu-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .mobile-menu-item:active {
    background: rgba(255, 255, 255, 0.12);
    transform: scale(0.98);
  }

  .mobile-menu-item.active {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.3);
    font-weight: 600;
  }

  .mobile-menu-item i:first-child {
    width: 24px;
    text-align: center;
    flex-shrink: 0;
    font-size: 1.2rem;
  }

  .mobile-menu-item span {
    flex: 1;
  }

  .mobile-menu-item .check-icon {
    color: rgba(74, 222, 128, 0.9);
    font-size: 1rem;
    flex-shrink: 0;
  }
</style>
