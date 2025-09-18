/**
 * Simple Gallery State
 *
 * Essential gallery functionality without over-engineering.
 * Load sequences → Filter sequences → Display grid + Spotlight
 */

import type { SequenceData } from "$shared";
import { resolve, TYPES } from "$shared";
import type { IGalleryService } from "../../display";
import type { GalleryNavigationConfig, GalleryNavigationItem, INavigationService } from "../../navigation";
import { GallerySortMethod } from "../domain/enums/gallery-enums";
import type { SectionConfig, SequenceSection } from "../domain/models/gallery-models";
import type { GalleryFilterValue } from "../domain/types/gallery-types";
import type { ISectionService } from "../services/contracts/ISectionService";

export function createGalleryState() {
  // Services
  const galleryService = resolve(TYPES.IGalleryService) as IGalleryService;
  const navigationService = resolve(TYPES.INavigationService) as INavigationService;
  const sectionService = resolve(TYPES.ISectionService) as ISectionService;

  // State
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let displayedSequences = $state<SequenceData[]>([]);
  let allSequences = $state<SequenceData[]>([]);
  let selectedSequence = $state<SequenceData | null>(null);
  let navigationSections = $state<GalleryNavigationConfig[]>([]);
  let sequenceSections = $state<SequenceSection[]>([]);
  let currentSortMethod = $state<GallerySortMethod>(GallerySortMethod.ALPHABETICAL);
  let sortDirection = $state<"asc" | "desc">("asc");
  const showSections = $state<boolean>(true);
  let currentFilter = $state<{ type: string; value: GalleryFilterValue }>({ type: "all", value: null });
  let filteredSequences = $state<SequenceData[]>([]);
  let isFilterModalOpen = $state<boolean>(false);

  // Computed: Available sections for simple navigation
  const availableNavigationSections = $derived(() => {
    return sequenceSections.map(section => section.title);
  });

  // Computed: Available sequence lengths for filtering
  const availableSequenceLengths = $derived(() => {
    const lengths = new Set<number>();
    allSequences.forEach(seq => {
      // Calculate correct sequence length: beats.length - 2
      // Subtract 2 for metadata beat and start position beat
      const length = seq.beats.length - 2;
      if (length > 0) {
        lengths.add(length);
      }
    });
    return Array.from(lengths).sort((a, b) => a - b);
  });

  // Load all sequences and generate navigation
  async function loadAllSequences(): Promise<void> {
    try {
      isLoading = true;
      error = null;

      console.log("🔄 GalleryState: Loading sequences...");
      const sequences = await galleryService.loadSequenceMetadata();
      allSequences = sequences;
      displayedSequences = sequences;

      console.log("🔄 GalleryState: Generating navigation sections...");
      const sections = await navigationService.generateNavigationSections(sequences, []);
      navigationSections = sections;

      console.log("🔄 GalleryState: Applying initial filtering and sorting...");
      await applyFilterAndSort();

      console.log("🔄 GalleryState: Generating sequence sections...");
      await generateSequenceSections();

      console.log(`✅ GalleryState: Loaded ${sequences.length} sequences and ${sections.length} navigation sections`);
    } catch (err) {
      console.error("❌ GalleryState: Failed to load sequences:", err);
      error = err instanceof Error ? err.message : "Failed to load sequences";
    } finally {
      isLoading = false;
    }
  }

  // Filter sequences by navigation item
  async function setActiveGalleryNavigationItem(sectionId: string, itemId: string): Promise<void> {
    console.log("🎯 GalleryState: Set active navigation item:", sectionId, itemId);

    const section = navigationSections.find(s => s.id === sectionId);
    if (!section) return;

    const item = section.items.find((i: GalleryNavigationItem) => i.id === itemId);
    if (!item) return;

    // Update active state
    navigationSections = navigationSections.map(s => ({
      ...s,
      items: s.items.map((i: GalleryNavigationItem) => ({
        ...i,
        isActive: s.id === sectionId && i.id === itemId
      }))
    }));

    // Filter sequences
    console.log("🔍 Filtering sequences by navigation item:", item.value, section.type);
    const filtered = navigationService.getSequencesForNavigationItem(item, section.type, allSequences);
    console.log(`✅ Filtered ${filtered.length} sequences from ${allSequences.length} total`);
    displayedSequences = filtered;
  }

  // Simple methods
  function selectSequence(sequence: SequenceData): void {
    selectedSequence = sequence;
    console.log("✅ GalleryState: Sequence selected:", sequence.id);
  }

  async function toggleFavorite(sequenceId: string): Promise<void> {
    console.log("⭐ GalleryState: Toggling favorite for:", sequenceId);
    // TODO: Implement when favorites service is ready
  }

  function clearError(): void {
    error = null;
  }

// Apply filtering and sorting to sequences
async function applyFilterAndSort(): Promise<void> {
  try {
    console.log("🔍 Applying filter:", $state.snapshot(currentFilter));

    // Apply filtering
    let filtered = allSequences;
    if (currentFilter.type !== "all") {
      filtered = await galleryService.applyFilter(allSequences, currentFilter.type as any, currentFilter.value);
    }

    // Apply sorting
    console.log("📊 Applying sort:", $state.snapshot(currentSortMethod), $state.snapshot(sortDirection));
    const sorted = await galleryService.sortSequences(filtered, currentSortMethod);

    // TODO: Apply sort direction (galleryService.sortSequences doesn't handle direction yet)
    if (sortDirection === "desc") {
      sorted.reverse();
    }

    filteredSequences = sorted;
    displayedSequences = sorted;

    console.log(`✅ Filter and sort applied: ${filtered.length} → ${sorted.length} sequences`);
  } catch (err) {
    console.error("❌ Failed to apply filter and sort:", err);
  }
}

  // Generate sequence sections based on current sort method
  async function generateSequenceSections(): Promise<void> {
    try {
      // Map sort method to groupBy strategy
      let groupBy: SectionConfig["groupBy"];
      switch (currentSortMethod) {
        case GallerySortMethod.ALPHABETICAL:
          groupBy = "letter";
          break;
        case GallerySortMethod.difficultyLevel:
          groupBy = "difficulty";
          break;
        case GallerySortMethod.sequenceLength:
          groupBy = "length";
          break;
        case GallerySortMethod.dateAdded:
          groupBy = "date";
          break;
        default:
          groupBy = "letter";
      }

      const config: SectionConfig = {
        groupBy,
        sortMethod: currentSortMethod,
        showEmptySections: false,
        expandedSections: new Set<string>(), // All sections always visible now
      };

      const sections = await sectionService.organizeSections(filteredSequences, config);
      sequenceSections = sections;
      console.log(`✅ Generated ${sections.length} sequence sections (grouped by ${groupBy})`);
    } catch (err) {
      console.error("❌ Failed to generate sequence sections:", err);
    }
  }

  // Handle filter changes
  async function handleFilterChange(type: string, value?: GalleryFilterValue): Promise<void> {
    console.log("🔍 Filter changed:", type, value);
    currentFilter = { type, value: value || null };
    await applyFilterAndSort();
    await generateSequenceSections();
  }

  // Handle sort changes
  async function handleSortChange(method: GallerySortMethod, direction: "asc" | "desc"): Promise<void> {
    console.log("📊 Sort changed:", method, direction);
    currentSortMethod = method;
    sortDirection = direction;
    await applyFilterAndSort();
    await generateSequenceSections();
  }

  // Handle filter modal
  function openFilterModal(): void {
    isFilterModalOpen = true;
  }

  function closeFilterModal(): void {
    isFilterModalOpen = false;
  }

  // Toggle sequence section expansion
  function toggleSequenceSection(sectionId: string): void {
    console.log("🔄 GalleryState: Toggle sequence section:", sectionId);
    sequenceSections = sectionService.toggleSectionExpansion(sectionId, sequenceSections);
  }

  // Navigation section expansion
  function toggleNavigationSection(sectionId: string): void {
    console.log("🔄 GalleryState: Toggle navigation section:", sectionId);
    navigationSections = navigationService.toggleSectionExpansion(sectionId, navigationSections);
  }

  // Scroll to section (for simple navigation)
  function scrollToSection(sectionTitle: string): void {
    console.log("📍 GalleryState: Scroll to section:", sectionTitle);
    // This will be handled by the SequenceDisplayPanel component
    // We just need to trigger a custom event or use a callback
    const sectionElement = document.querySelector(`[data-section="${sectionTitle}"]`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Stub methods for compatibility
  function backToFilters(): void { /* Not needed */ }

  return {
    // State
    get isLoading() { return isLoading; },
    get error() { return error; },
    get displayedSequences() { return displayedSequences; },
    get allSequences() { return allSequences; },
    get selectedSequence() { return selectedSequence; },
    get navigationSections() { return navigationSections; },
    get sequenceSections() { return sequenceSections; },
    get showSections() { return showSections; },
    get currentSortMethod() { return currentSortMethod; },
    get sortDirection() { return sortDirection; },
    get currentFilter() { return currentFilter; },
    get filteredSequences() { return filteredSequences; },
    get isFilterModalOpen() { return isFilterModalOpen; },
    get availableNavigationSections() { return availableNavigationSections; },
    get availableSequenceLengths() { return availableSequenceLengths; },

    // Methods
    loadAllSequences,
    selectSequence,
    toggleFavorite,
    clearError,
    setActiveGalleryNavigationItem,
    generateSequenceSections,
    toggleSequenceSection,
    handleFilterChange,
    handleSortChange,
    openFilterModal,
    closeFilterModal,
    scrollToSection,

    // Compatibility stubs
    backToFilters,
    toggleNavigationSection,
  };
}