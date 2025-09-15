<!--
SimpleNavigationSidebar - Desktop-style Navigation

Provides simple navigation matching desktop functionality:
- Single header based on sort method
- Simple buttons for each section
- Scroll-to-section navigation (not filtering)

Matches the desktop Python app navigation pattern exactly.
-->
<script lang="ts">
  import { GallerySortMethod } from "../../shared/domain";

  // ✅ PURE RUNES: Props using modern Svelte 5 runes
  const {
    currentSortMethod = "ALPHABETICAL",
    availableSections = [],
    onSectionClick = () => {},
  } = $props<{
    currentSortMethod?: GallerySortMethod;
    availableSections?: string[];
    onSectionClick?: (section: string) => void;
  }>();

  // Get header text based on sort method
  function getHeaderText(sortMethod: GallerySortMethod): string {
    switch (sortMethod) {
      case GallerySortMethod.ALPHABETICAL:
        return "Letter";
      case GallerySortMethod.difficultyLevel:
        return "Level";
      case GallerySortMethod.sequenceLength:
        return "Length";
      case GallerySortMethod.dateAdded:
        return "Date Added";
      default:
        return "Navigation";
    }
  }

  // Handle section button click
  function handleSectionClick(section: string) {
    onSectionClick(section);
  }

  // Get display text for section button - remove counts and extract clean text
  function getSectionDisplayText(section: string, sortMethod: GallerySortMethod): string {
    // Remove count information like "(15 sequences)" from the section title
    let cleanText = section.replace(/\s*\(\d+\s+sequences?\)$/, '');

    if (sortMethod === "difficultyLevel" && cleanText.startsWith("Level ")) {
      return cleanText.replace("Level ", "");
    }

    
    // For alphabetical sorting, extract just the letter (remove emoji prefixes if any)
    if (sortMethod === GallerySortMethod.ALPHABETICAL) {
      // Remove any emoji prefixes and extract the letter
      const match = cleanText.match(/([A-Z])/);
      return match ? match[1] : cleanText;
    }

    // For other sort methods, remove emoji prefixes but keep the main text
    if (sortMethod === GallerySortMethod.difficultyLevel) {
      cleanText = cleanText.replace(/^[🟢🟡🔴⚪]\s*/, '');
    } else if (sortMethod === GallerySortMethod.AUTHOR) {
      cleanText = cleanText.replace(/^👤\s*/, '');
    } else if (sortMethod === GallerySortMethod.dateAdded) {
      cleanText = cleanText.replace(/^📅\s*/, '');
    }

    return cleanText;
  }
</script>

<div class="simple-navigation-sidebar">
  <!-- Header -->
  <div class="nav-header">
    <h3 class="header-text">{getHeaderText(currentSortMethod)}</h3>
    <div class="header-line"></div>
  </div>

  <!-- Navigation Buttons -->
  <div class="nav-buttons">
    {#each availableSections as section (section)}
      <button
        class="nav-button"
        onclick={() => handleSectionClick(section)}
        type="button"
      >
        {getSectionDisplayText(section, currentSortMethod)}
      </button>
    {/each}
  </div>

  <!-- Spacer to push content to top -->
  <div class="nav-spacer"></div>
</div>

<style>
  .simple-navigation-sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: clamp(0.75rem, 2vw, 1.25rem);
    background: rgba(0, 0, 0, 0.1);
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    width: clamp(80px, 10vw, 160px);
    flex-shrink: 0;
    overflow: hidden;
  }

  .nav-header {
    margin-bottom: 1rem;
  }

  .header-text {
    color: white;
    font-size: clamp(0.8rem, 2.2vw, 1.1rem);
    font-weight: bold;
    text-align: center;
    margin: 0 0 clamp(0.25rem, 1vw, 0.5rem) 0;
    padding: clamp(0.25rem, 1vw, 0.5rem);
  }

  .header-line {
    height: 1px;
    background-color: white;
    margin: 0;
  }

  .nav-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
  }

  .nav-button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: clamp(0.75rem, 2vw, 1rem) clamp(0.5rem, 1.5vw, 0.75rem);
    border-radius: 6px;
    cursor: pointer;
    font-size: clamp(1.1rem, 2.5vw, 1.4rem);
    font-weight: 600;
    transition: all 0.2s ease;
    text-align: center;
    min-height: clamp(48px, 8vw, 56px);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  .nav-button:active {
    transform: translateY(0);
    background: rgba(255, 255, 255, 0.3);
  }

  .nav-spacer {
    flex-shrink: 0;
    height: 1rem;
  }

  /* Custom scrollbar for nav-buttons */
  .nav-buttons::-webkit-scrollbar {
    width: 4px;
  }

  .nav-buttons::-webkit-scrollbar-track {
    background: transparent;
  }

  .nav-buttons::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }

  .nav-buttons::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .simple-navigation-sidebar {
      width: clamp(70px, 15vw, 120px);
      padding: clamp(0.5rem, 2vw, 1rem);
    }

    .header-text {
      font-size: clamp(0.8rem, 3vw, 1rem);
    }

    .nav-button {
      padding: clamp(0.6rem, 2vw, 0.8rem) clamp(0.4rem, 1.5vw, 0.6rem);
      font-size: clamp(1rem, 3.5vw, 1.2rem);
      min-height: clamp(44px, 10vw, 52px);
    }
  }
</style>
