<!--
Sort & Jump Sheet - Mobile Bottom Sheet Version

Touch-friendly interface for changing sort method and jumping to sections
-->
<script lang="ts">
  import type { NavigationSection } from "$lib/modules/discover/shared/domain/types/discover-types";
  import { ExploreSortMethod } from "$shared";

  let {
    currentSortMethod,
    availableSections,
    onSortMethodChange,
    onSectionClick,
  } = $props<{
    currentSortMethod: ExploreSortMethod;
    availableSections: NavigationSection[];
    onSortMethodChange: (method: ExploreSortMethod) => void;
    onSectionClick: (sectionId: string) => void;
  }>();

  const sortOptions = [
    {
      id: "alphabetical",
      label: "Alphabetical",
      icon: "fa-sort-alpha-down",
      description: "A to Z",
    },
    {
      id: "difficulty",
      label: "Difficulty",
      icon: "fa-signal",
      description: "Easy to Hard",
    },
    {
      id: "length",
      label: "Length",
      icon: "fa-ruler",
      description: "Shortest to Longest",
    },
    {
      id: "recent",
      label: "Recently Added",
      icon: "fa-clock",
      description: "Newest First",
    },
  ];
</script>

<div class="sort-jump-sheet">
  <!-- Sort Methods Section -->
  <div class="section">
    <div class="section-header">
      <i class="fas fa-sort"></i>
      <h3>Sort By</h3>
    </div>
    <div class="sort-options">
      {#each sortOptions as option}
        <button
          class="option-button"
          class:active={currentSortMethod === option.id}
          onclick={() => onSortMethodChange(option.id)}
          type="button"
        >
          <div class="option-icon">
            <i class="fas {option.icon}"></i>
          </div>
          <div class="option-content">
            <div class="option-label">{option.label}</div>
            <div class="option-description">{option.description}</div>
          </div>
          {#if currentSortMethod === option.id}
            <div class="check-icon">
              <i class="fas fa-check"></i>
            </div>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <!-- Quick Jump Section -->
  {#if availableSections && availableSections.length > 0}
    <div class="section">
      <div class="section-header">
        <i class="fas fa-rocket"></i>
        <h3>Quick Jump</h3>
      </div>
      <div class="jump-sections">
        {#each availableSections as section}
          <button
            class="jump-button"
            onclick={() => {
              onSectionClick(section.id);
            }}
            type="button"
          >
            <span class="jump-label">{section.label}</span>
            <span class="jump-count">{section.count}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .sort-jump-sheet {
    display: flex;
    flex-direction: column;
    gap: 32px;
    padding: 8px 0;
  }

  /* Section */
  .section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0 4px;
  }

  .section-header h3 {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
  }

  /* Sort Options */
  .sort-options {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .option-button {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .option-button:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .option-button.active {
    background: rgba(103, 126, 234, 0.15);
    border-color: rgba(103, 126, 234, 0.4);
  }

  .option-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    font-size: 18px;
    color: rgba(255, 255, 255, 0.8);
    flex-shrink: 0;
  }

  .option-button.active .option-icon {
    background: rgba(103, 126, 234, 0.3);
    color: #667eea;
  }

  .option-content {
    flex: 1;
    min-width: 0;
  }

  .option-label {
    font-size: 15px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 2px;
  }

  .option-description {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .check-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: #667eea;
    font-size: 16px;
    flex-shrink: 0;
  }

  /* Jump Sections */
  .jump-sections {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 8px;
  }

  .jump-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 16px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .jump-button:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .jump-button:active {
    transform: translateY(0);
  }

  .jump-label {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    text-align: center;
  }

  .jump-count {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    padding: 2px 8px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 10px;
  }

  /* Touch feedback */
  .option-button:active {
    transform: scale(0.98);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .option-button,
    .jump-button {
      transition: none;
    }

    .jump-button:hover {
      transform: none;
    }
  }
</style>
