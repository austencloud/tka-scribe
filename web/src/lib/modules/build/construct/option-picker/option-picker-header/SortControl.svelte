<script lang="ts">
  import { onDestroy } from "svelte";
  import type { SortModeDetail, SortOption } from "./sort-types";
  import SortByButton from "./SortButton.svelte";
  import SortByDropdown from "./SortByDropdown.svelte";
  import { viewOptions } from "./sortOptions";

  // --- Props ---
  const props = $props<{
    initialSortMethod?: string;
    compact?: boolean;
    onViewChange?: (detail: SortModeDetail) => void;
  }>();

  // --- State ---
  let isOpen = $state(false);
  // Initialize with the current sort method
  let selectedSortOption = $state<SortOption>(
    viewOptions.find(
      (opt) => opt.value === props.initialSortMethod
    ) ||
      viewOptions.find((opt) => opt.value === "all") ||
      viewOptions[0]
  );
  let buttonElement = $state<HTMLButtonElement | null>(null);
  let isCompact = $state(false);

  // Update compact mode based on props and window size
  $effect(() => {
    // Force compact mode on mobile devices
    const isMobile = window.innerWidth <= 640;
    isCompact = props.compact || isMobile || false;

    // Add resize listener to update compact mode when window size changes
    const handleResize = () => {
      const isMobile = window.innerWidth <= 640;
      isCompact = props.compact || isMobile || false;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  // --- Lifecycle ---
  $effect(() => {
    // Add click outside listener
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });

  onDestroy(() => {
    document.removeEventListener("click", handleClickOutside);
  });

  // --- Dropdown Management ---
  function toggleDropdown() {
    isOpen = !isOpen;

    // Add haptic feedback on mobile devices
    if (isOpen && "vibrate" in window.navigator) {
      try {
        window.navigator.vibrate(50);
      } catch (e) {
        // Ignore errors if vibration is not supported
      }
    }
  }

  function closeDropdown() {
    isOpen = false;
  }

  function handleClickOutside(event: MouseEvent) {
    if (
      isOpen &&
      buttonElement &&
      !buttonElement.contains(event.target as Node)
    ) {
      closeDropdown();
    }
  }

  // --- Option Selection ---
  function handleViewSelect(option: SortOption) {
    // Set the selected view option first
    selectedSortOption = option;
    console.log("Selected view option:", option.label, option.value);

    // Add haptic feedback on mobile devices
    if ("vibrate" in window.navigator) {
      try {
        window.navigator.vibrate(50);
      } catch (e) {
        // Ignore errors if vibration is not supported
      }
    }

    // Create the event detail
    const detail: SortModeDetail =
      option.value === "all"
        ? { mode: "all" }
        : { mode: "group", method: option.value };

    // Call the callback if provided
    if (props.onViewChange) {
      props.onViewChange(detail);
    }

    closeDropdown();
  }

  // --- Keyboard Navigation ---
  function handleKeydown(event: KeyboardEvent) {
    if (!isOpen) return;

    const currentIndex = viewOptions.findIndex(
      (opt) => opt.value === selectedSortOption.value
    );
    let newIndex = currentIndex;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        newIndex = (currentIndex + 1) % viewOptions.length;
        break;
      case "ArrowUp":
        event.preventDefault();
        newIndex = currentIndex === 0 ? viewOptions.length - 1 : currentIndex - 1;
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        handleViewSelect(selectedSortOption);
        return;
      case "Escape":
        event.preventDefault();
        closeDropdown();
        return;
      default:
        // Handle letter key navigation
        const key = event.key.toLowerCase();
        const matchingOption = viewOptions.find((opt) =>
          opt.label.toLowerCase().startsWith(key)
        );
        if (matchingOption) {
          event.preventDefault();
          newIndex = viewOptions.findIndex(
            (opt) => opt.value === matchingOption.value
          );
        }
        break;
    }

    if (newIndex !== currentIndex) {
      selectedSortOption = viewOptions[newIndex];
    }
  }
</script>

<div class="view-control" class:compact={isCompact}>
  <SortByButton
    selectedViewOption={selectedSortOption}
    {isOpen}
    onClick={toggleDropdown}
    compact={isCompact}
    onButtonRef={(element) => (buttonElement = element)}
  />

  <SortByDropdown
    {isOpen}
    selectedSortOption={selectedSortOption}
    sortOptions={viewOptions}
    onSelect={handleViewSelect}
    onKeydown={handleKeydown}
  />
</div>

<style>
  .view-control {
    display: inline-block;
    position: relative;
    font-size: 1.1rem;
    z-index: 10;
    transition: all 0.3s ease;
  }

  .view-control.compact {
    font-size: 1rem;
    min-width: 36px;
    max-width: 36px;
  }
</style>
