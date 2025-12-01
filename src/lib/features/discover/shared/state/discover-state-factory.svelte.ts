/**
 * Simple Explore State
 *
 * Essential gallery functionality without over-engineering.
 * Load sequences → Filter sequences → Display grid + Spotlight
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import { resolve } from "$lib/shared/inversify";
import { TYPES } from "$lib/shared/inversify/types";
import type { ExploreFilterType } from "$lib/shared/persistence/domain";
import type {
  IDiscoverFilterService,
  IDiscoverLoader,
  IDiscoverSortService,
} from "../../gallery/display";
import type {
  ExploreNavigationConfig,
  ExploreNavigationItem,
  INavigationService,
} from "../../gallery/navigation";
import { ExploreSortMethod } from "../domain/enums/discover-enums";
import type {
  SectionConfig,
  SequenceSection,
} from "../domain/models/discover-models";
import type { ExploreFilterValue } from "../domain/types/discover-types";
import type { ISectionService } from "../services/contracts/ISectionService";

export function createExploreState() {
  // Services - Use specialized services directly instead of orchestration layer
  const loaderService = resolve<IDiscoverLoader>(TYPES.IDiscoverLoader);
  const filterService = resolve<IDiscoverFilterService>(
    TYPES.IDiscoverFilterService
  );
  const sortService = resolve<IDiscoverSortService>(TYPES.IDiscoverSortService);
  const navigationService = resolve<INavigationService>(
    TYPES.INavigationService
  );
  const sectionService = resolve<ISectionService>(TYPES.ISectionService);

  // State
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let displayedSequences = $state<SequenceData[]>([]);
  let allSequences = $state<SequenceData[]>([]);
  let selectedSequence = $state<SequenceData | null>(null);
  let navigationSections = $state<ExploreNavigationConfig[]>([]);
  let sequenceSections = $state<SequenceSection[]>([]);
  let currentSortMethod = $state<ExploreSortMethod>(
    ExploreSortMethod.ALPHABETICAL
  );
  let sortDirection = $state<"asc" | "desc">("asc");
  const showSections = $state<boolean>(true);
  let currentFilter = $state<{ type: string; value: ExploreFilterValue }>({
    type: "all",
    value: null,
  });
  let filteredSequences = $state<SequenceData[]>([]);
  let isFilterModalOpen = $state<boolean>(false);

  // Animation modal state
  let isAnimationModalOpen = $state<boolean>(false);
  let sequenceToAnimate = $state<SequenceData | null>(null);

  // Computed: Available sections for simple navigation
  const availableNavigationSections = $derived(
    sequenceSections.map((section) => section.title)
  );

  // Computed: Available sequence lengths for filtering
  const availableSequenceLengths = $derived.by(() => {
    const lengths = new Set<number>();
    allSequences.forEach((seq) => {
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
      const sequences = await loaderService.loadSequenceMetadata();
      allSequences = sequences;
      displayedSequences = sequences;
      const sections = navigationService.generateNavigationSections(
        sequences,
        []
      );
      navigationSections = sections;
      applyFilterAndSort();
      await generateSequenceSections();
    } catch (err) {
      console.error("❌ ExploreState: Failed to load sequences:", err);
      error = err instanceof Error ? err.message : "Failed to load sequences";
    } finally {
      isLoading = false;
    }
  }

  // Filter sequences by navigation item
  function setActiveGalleryNavigationItem(
    sectionId: string,
    itemId: string
  ): void {
    const section = navigationSections.find((s) => s.id === sectionId);
    if (!section) return;

    const item = section.items.find(
      (i: ExploreNavigationItem) => i.id === itemId
    );
    if (!item) return;

    // Update active state
    navigationSections = navigationSections.map((s) => ({
      ...s,
      items: s.items.map((i: ExploreNavigationItem) => ({
        ...i,
        isActive: s.id === sectionId && i.id === itemId,
      })),
    }));

    // Filter sequences
    const filtered = navigationService.getSequencesForNavigationItem(
      item,
      section.type,
      allSequences
    );
    displayedSequences = filtered;
  }

  // Simple methods
  function selectSequence(sequence: SequenceData): void {
    selectedSequence = sequence;
  }

  async function toggleFavorite(_sequenceId: string): Promise<void> {
    // TODO: Implement when favorites service is ready
  }

  function clearError(): void {
    error = null;
  }

  // Apply filtering and sorting to sequences
  function applyFilterAndSort(): void {
    try {
      // console.log("🔍 Applying filter:", $state.snapshot(currentFilter));

      // Apply filtering
      let filtered = allSequences;
      if (currentFilter.type !== "all") {
        filtered = filterService.applyFilter(
          allSequences,
          currentFilter.type as ExploreFilterType,
          currentFilter.value
        );
      }

      // Apply sorting
      // console.log(
      //   "📊 Applying sort:",
      //   $state.snapshot(currentSortMethod),
      //   $state.snapshot(sortDirection)
      // );
      const sorted = sortService.sortSequences(filtered, currentSortMethod);

      // TODO: Apply sort direction (galleryService.sortSequences doesn't handle direction yet)
      if (sortDirection === "desc") {
        sorted.reverse();
      }

      filteredSequences = sorted;
      displayedSequences = sorted;
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
        case ExploreSortMethod.ALPHABETICAL:
          groupBy = "letter";
          break;
        case ExploreSortMethod.DIFFICULTY_LEVEL:
          groupBy = "difficulty";
          break;
        case ExploreSortMethod.SEQUENCE_LENGTH:
          groupBy = "length";
          break;
        case ExploreSortMethod.DATE_ADDED:
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

      const sections = await sectionService.organizeSections(
        filteredSequences,
        config
      );
      sequenceSections = sections;
      // console.log(
      //   `✅ Generated ${sections.length} sequence sections (grouped by ${groupBy})`
      // );
    } catch (err) {
      console.error("❌ Failed to generate sequence sections:", err);
    }
  }

  // Handle filter changes
  async function handleFilterChange(
    type: string,
    value?: ExploreFilterValue
  ): Promise<void> {
    currentFilter = { type, value: value || null };
    await applyFilterAndSort();
    await generateSequenceSections();
  }

  // Handle sort changes
  async function handleSortChange(
    method: ExploreSortMethod,
    direction: "asc" | "desc"
  ): Promise<void> {
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
    sequenceSections = sectionService.toggleSectionExpansion(
      sectionId,
      sequenceSections
    );
  }

  // Navigation section expansion
  function toggleNavigationSection(sectionId: string): void {
    navigationSections = navigationService.toggleSectionExpansion(
      sectionId,
      navigationSections
    );
  }

  // Scroll to section (for simple navigation)
  function scrollToSection(sectionTitle: string): void {
    const sectionElement = document.querySelector(
      `[data-section="${sectionTitle}"]`
    );

    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Stub methods for compatibility
  function backToFilters(): void {
    /* Not needed */
  }

  // Animation modal functions
  function openAnimationModal(sequence: SequenceData): void {
    sequenceToAnimate = sequence;
    isAnimationModalOpen = true;
  }

  function closeAnimationModal(): void {
    isAnimationModalOpen = false;
    // Keep sequenceToAnimate briefly for smooth transition
    setTimeout(() => {
      sequenceToAnimate = null;
    }, 300);
  }

  return {
    // State
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    get displayedSequences() {
      return displayedSequences;
    },
    get allSequences() {
      return allSequences;
    },
    get selectedSequence() {
      return selectedSequence;
    },
    get navigationSections() {
      return navigationSections;
    },
    get sequenceSections() {
      return sequenceSections;
    },
    get showSections() {
      return showSections;
    },
    get currentSortMethod() {
      return currentSortMethod;
    },
    get sortDirection() {
      return sortDirection;
    },
    get currentFilter() {
      return currentFilter;
    },
    get filteredSequences() {
      return filteredSequences;
    },
    get isFilterModalOpen() {
      return isFilterModalOpen;
    },
    get availableNavigationSections() {
      return availableNavigationSections;
    },
    get availableSequenceLengths() {
      return availableSequenceLengths;
    },
    get isAnimationModalOpen() {
      return isAnimationModalOpen;
    },
    get sequenceToAnimate() {
      return sequenceToAnimate;
    },

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
    openAnimationModal,
    closeAnimationModal,

    // Compatibility stubs
    backToFilters,
    toggleNavigationSection,
  };
}
