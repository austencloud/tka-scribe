<!--
  Gallery Design Exploration Test Page

  Interactive playground to explore different approaches for:
  - Filter panel designs (2026 solid color aesthetic)
  - Scrollbar styles
  - Library/Gallery scope toggles
  - Sort controls
  - Navigation patterns
-->
<script lang="ts">
  // Active exploration states
  let activeSection = $state<'filters' | 'scrollbars' | 'scope' | 'sort' | 'search'>('filters');

  // Filter panel variant state
  let activeFilterVariant = $state<'accordion' | 'tabs' | 'chips' | 'visual' | 'minimal'>('accordion');

  // Scrollbar variant state
  let activeScrollbarVariant = $state<'thin' | 'hidden' | 'gradient' | 'chunky' | 'ios'>('thin');

  // Scope toggle variant state
  let activeScopeVariant = $state<'pill' | 'tabs' | 'dropdown' | 'segmented'>('pill');
  let selectedScope = $state<'community' | 'library'>('community');

  // Sort control variant state
  let activeSortVariant = $state<'chips' | 'dropdown' | 'buttons' | 'wheel'>('chips');
  let selectedSort = $state('alphabetical');

  // Demo filter states for interactivity
  let selectedDifficulty = $state<number | null>(null);
  let selectedLetter = $state<string | null>(null);
  let expandedSections = $state<Set<string>>(new Set(['difficulty']));
  let activeTab = $state('difficulty');
  let selectedChips = $state<string[]>([]);

  // Demo data
  const difficultyLevels = [
    { level: 1, label: 'Beginner', color: '#22c55e', count: 142 },
    { level: 2, label: 'Easy', color: '#84cc16', count: 89 },
    { level: 3, label: 'Medium', color: '#eab308', count: 156 },
    { level: 4, label: 'Hard', color: '#f97316', count: 67 },
    { level: 5, label: 'Expert', color: '#ef4444', count: 23 },
  ];

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const positions = ['Alpha', 'Beta', 'Gamma', 'Extended'];
  const lengths = [2, 4, 6, 8, 10, 12, 16];

  const sortOptions = [
    { id: 'alphabetical', label: 'A-Z', icon: 'fa-font' },
    { id: 'newest', label: 'Newest', icon: 'fa-clock' },
    { id: 'difficulty', label: 'Difficulty', icon: 'fa-signal' },
    { id: 'length', label: 'Length', icon: 'fa-ruler' },
    { id: 'popular', label: 'Popular', icon: 'fa-fire' },
  ];

  // Helper functions
  function toggleSection(section: string) {
    const newSet = new Set(expandedSections);
    if (newSet.has(section)) {
      newSet.delete(section);
    } else {
      newSet.add(section);
    }
    expandedSections = newSet;
  }

  function toggleChip(chip: string) {
    if (selectedChips.includes(chip)) {
      selectedChips = selectedChips.filter(c => c !== chip);
    } else {
      selectedChips = [...selectedChips, chip];
    }
  }
</script>

<div class="test-page">
  <header class="page-header">
    <h1>Gallery Design Exploration</h1>
    <p>Interactive comparison of different UI patterns for the gallery. Click around to test interactions.</p>
  </header>

  <!-- Section Navigation -->
  <nav class="section-nav">
    <button
      class="section-btn"
      class:active={activeSection === 'filters'}
      onclick={() => activeSection = 'filters'}
    >
      <i class="fas fa-filter"></i>
      Filter Panels
    </button>
    <button
      class="section-btn"
      class:active={activeSection === 'scrollbars'}
      onclick={() => activeSection = 'scrollbars'}
    >
      <i class="fas fa-arrows-alt-v"></i>
      Scrollbars
    </button>
    <button
      class="section-btn"
      class:active={activeSection === 'scope'}
      onclick={() => activeSection = 'scope'}
    >
      <i class="fas fa-toggle-on"></i>
      Scope Toggle
    </button>
    <button
      class="section-btn"
      class:active={activeSection === 'sort'}
      onclick={() => activeSection = 'sort'}
    >
      <i class="fas fa-sort"></i>
      Sort Controls
    </button>
    <button
      class="section-btn"
      class:active={activeSection === 'search'}
      onclick={() => activeSection = 'search'}
    >
      <i class="fas fa-search"></i>
      Search Bar
    </button>
  </nav>

  <!-- ==================== FILTER PANELS SECTION ==================== -->
  {#if activeSection === 'filters'}
    <section class="exploration-section">
      <div class="section-header">
        <h2>Filter Panel Designs</h2>
        <p>Exploring different ways to organize and present filter options. Click each variant to see it in action.</p>
      </div>

      <!-- Variant Selector -->
      <div class="variant-selector">
        <button class:active={activeFilterVariant === 'accordion'} onclick={() => activeFilterVariant = 'accordion'}>
          Accordion
        </button>
        <button class:active={activeFilterVariant === 'tabs'} onclick={() => activeFilterVariant = 'tabs'}>
          Tabs
        </button>
        <button class:active={activeFilterVariant === 'chips'} onclick={() => activeFilterVariant = 'chips'}>
          Smart Chips
        </button>
        <button class:active={activeFilterVariant === 'visual'} onclick={() => activeFilterVariant = 'visual'}>
          Visual Grid
        </button>
        <button class:active={activeFilterVariant === 'minimal'} onclick={() => activeFilterVariant = 'minimal'}>
          Minimal
        </button>
      </div>

      <div class="demo-container">
        <!-- VARIANT 1: Accordion Style -->
        {#if activeFilterVariant === 'accordion'}
          <div class="filter-demo accordion-style">
            <div class="demo-label">Accordion - Collapsible Sections</div>
            <div class="filter-panel-demo">
              <!-- Difficulty Section -->
              <div class="accordion-section" class:expanded={expandedSections.has('difficulty')}>
                <button class="accordion-header" onclick={() => toggleSection('difficulty')}>
                  <span class="section-title">
                    <i class="fas fa-signal"></i>
                    Difficulty
                  </span>
                  <span class="section-meta">
                    {#if selectedDifficulty}
                      <span class="active-badge">{difficultyLevels[selectedDifficulty - 1]?.label}</span>
                    {/if}
                    <i class="fas fa-chevron-down chevron"></i>
                  </span>
                </button>
                {#if expandedSections.has('difficulty')}
                  <div class="accordion-content">
                    <div class="difficulty-buttons">
                      {#each difficultyLevels as diff}
                        <button
                          class="difficulty-btn"
                          class:selected={selectedDifficulty === diff.level}
                          style="--level-color: {diff.color}"
                          onclick={() => selectedDifficulty = selectedDifficulty === diff.level ? null : diff.level}
                        >
                          <span class="level-indicator"></span>
                          <span class="level-label">{diff.label}</span>
                          <span class="level-count">{diff.count}</span>
                        </button>
                      {/each}
                    </div>
                  </div>
                {/if}
              </div>

              <!-- Starting Letter Section -->
              <div class="accordion-section" class:expanded={expandedSections.has('letter')}>
                <button class="accordion-header" onclick={() => toggleSection('letter')}>
                  <span class="section-title">
                    <i class="fas fa-font"></i>
                    Starting Letter
                  </span>
                  <span class="section-meta">
                    {#if selectedLetter}
                      <span class="active-badge">{selectedLetter}</span>
                    {/if}
                    <i class="fas fa-chevron-down chevron"></i>
                  </span>
                </button>
                {#if expandedSections.has('letter')}
                  <div class="accordion-content">
                    <div class="letter-grid-accordion">
                      {#each letters as letter}
                        <button
                          class="letter-btn"
                          class:selected={selectedLetter === letter}
                          onclick={() => selectedLetter = selectedLetter === letter ? null : letter}
                        >
                          {letter}
                        </button>
                      {/each}
                    </div>
                  </div>
                {/if}
              </div>

              <!-- Position Section -->
              <div class="accordion-section" class:expanded={expandedSections.has('position')}>
                <button class="accordion-header" onclick={() => toggleSection('position')}>
                  <span class="section-title">
                    <i class="fas fa-crosshairs"></i>
                    Starting Position
                  </span>
                  <i class="fas fa-chevron-down chevron"></i>
                </button>
                {#if expandedSections.has('position')}
                  <div class="accordion-content">
                    <div class="position-buttons">
                      {#each positions as pos}
                        <button class="position-btn">{pos}</button>
                      {/each}
                    </div>
                  </div>
                {/if}
              </div>

              <!-- Length Section -->
              <div class="accordion-section" class:expanded={expandedSections.has('length')}>
                <button class="accordion-header" onclick={() => toggleSection('length')}>
                  <span class="section-title">
                    <i class="fas fa-ruler-horizontal"></i>
                    Sequence Length
                  </span>
                  <i class="fas fa-chevron-down chevron"></i>
                </button>
                {#if expandedSections.has('length')}
                  <div class="accordion-content">
                    <div class="length-slider-container">
                      <div class="length-chips">
                        {#each lengths as len}
                          <button class="length-chip">{len}</button>
                        {/each}
                      </div>
                    </div>
                  </div>
                {/if}
              </div>
            </div>
            <div class="pros-cons">
              <div class="pros">
                <strong>Pros:</strong> Clean, organized, shows active filters, familiar pattern
              </div>
              <div class="cons">
                <strong>Cons:</strong> Requires clicks to expand, can feel slow
              </div>
            </div>
          </div>
        {/if}

        <!-- VARIANT 2: Tabs Style -->
        {#if activeFilterVariant === 'tabs'}
          <div class="filter-demo tabs-style">
            <div class="demo-label">Tabs - Category-Based</div>
            <div class="filter-panel-demo">
              <div class="filter-tabs">
                <button
                  class="filter-tab"
                  class:active={activeTab === 'difficulty'}
                  onclick={() => activeTab = 'difficulty'}
                >
                  <i class="fas fa-signal"></i>
                  <span>Difficulty</span>
                </button>
                <button
                  class="filter-tab"
                  class:active={activeTab === 'letter'}
                  onclick={() => activeTab = 'letter'}
                >
                  <i class="fas fa-font"></i>
                  <span>Letter</span>
                </button>
                <button
                  class="filter-tab"
                  class:active={activeTab === 'position'}
                  onclick={() => activeTab = 'position'}
                >
                  <i class="fas fa-crosshairs"></i>
                  <span>Position</span>
                </button>
                <button
                  class="filter-tab"
                  class:active={activeTab === 'length'}
                  onclick={() => activeTab = 'length'}
                >
                  <i class="fas fa-ruler"></i>
                  <span>Length</span>
                </button>
              </div>

              <div class="tab-content">
                {#if activeTab === 'difficulty'}
                  <div class="difficulty-cards">
                    {#each difficultyLevels as diff}
                      <button
                        class="difficulty-card"
                        class:selected={selectedDifficulty === diff.level}
                        style="--level-color: {diff.color}"
                        onclick={() => selectedDifficulty = selectedDifficulty === diff.level ? null : diff.level}
                      >
                        <div class="card-level">{diff.level}</div>
                        <div class="card-label">{diff.label}</div>
                        <div class="card-count">{diff.count} sequences</div>
                      </button>
                    {/each}
                  </div>
                {:else if activeTab === 'letter'}
                  <div class="letter-grid-tabs">
                    {#each letters as letter}
                      <button
                        class="letter-btn-tab"
                        class:selected={selectedLetter === letter}
                        onclick={() => selectedLetter = selectedLetter === letter ? null : letter}
                      >
                        {letter}
                      </button>
                    {/each}
                  </div>
                {:else if activeTab === 'position'}
                  <div class="position-cards">
                    {#each positions as pos}
                      <button class="position-card">
                        <div class="pos-icon">
                          <i class="fas fa-bullseye"></i>
                        </div>
                        <span>{pos}</span>
                      </button>
                    {/each}
                  </div>
                {:else if activeTab === 'length'}
                  <div class="length-visual">
                    {#each lengths as len}
                      <button class="length-bar-btn">
                        <div class="bar-visual" style="--bar-width: {(len / 16) * 100}%"></div>
                        <span class="bar-label">{len} beats</span>
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
            <div class="pros-cons">
              <div class="pros">
                <strong>Pros:</strong> More visual, dedicated space per category, modern feel
              </div>
              <div class="cons">
                <strong>Cons:</strong> Can only see one category at a time
              </div>
            </div>
          </div>
        {/if}

        <!-- VARIANT 3: Smart Chips Style -->
        {#if activeFilterVariant === 'chips'}
          <div class="filter-demo chips-style">
            <div class="demo-label">Smart Chips - Quick Selection</div>
            <div class="filter-panel-demo">
              <div class="chips-container">
                <div class="chip-category">
                  <span class="category-label">Quick Filters</span>
                  <div class="chip-row">
                    <button
                      class="smart-chip"
                      class:selected={selectedChips.includes('favorites')}
                      onclick={() => toggleChip('favorites')}
                    >
                      <i class="fas fa-heart"></i>
                      Favorites
                    </button>
                    <button
                      class="smart-chip"
                      class:selected={selectedChips.includes('recent')}
                      onclick={() => toggleChip('recent')}
                    >
                      <i class="fas fa-clock"></i>
                      Recent
                    </button>
                    <button
                      class="smart-chip"
                      class:selected={selectedChips.includes('popular')}
                      onclick={() => toggleChip('popular')}
                    >
                      <i class="fas fa-fire"></i>
                      Popular
                    </button>
                  </div>
                </div>

                <div class="chip-category">
                  <span class="category-label">Difficulty</span>
                  <div class="chip-row">
                    {#each difficultyLevels as diff}
                      <button
                        class="smart-chip difficulty-chip"
                        class:selected={selectedDifficulty === diff.level}
                        style="--chip-color: {diff.color}"
                        onclick={() => selectedDifficulty = selectedDifficulty === diff.level ? null : diff.level}
                      >
                        {diff.label}
                      </button>
                    {/each}
                  </div>
                </div>

                <div class="chip-category">
                  <span class="category-label">Length</span>
                  <div class="chip-row">
                    {#each lengths as len}
                      <button
                        class="smart-chip"
                        class:selected={selectedChips.includes(`len-${len}`)}
                        onclick={() => toggleChip(`len-${len}`)}
                      >
                        {len} beats
                      </button>
                    {/each}
                  </div>
                </div>

                <div class="chip-category">
                  <span class="category-label">Starting Letter</span>
                  <div class="chip-row letter-chips">
                    {#each letters.slice(0, 13) as letter}
                      <button
                        class="smart-chip letter-chip"
                        class:selected={selectedLetter === letter}
                        onclick={() => selectedLetter = selectedLetter === letter ? null : letter}
                      >
                        {letter}
                      </button>
                    {/each}
                  </div>
                  <div class="chip-row letter-chips">
                    {#each letters.slice(13) as letter}
                      <button
                        class="smart-chip letter-chip"
                        class:selected={selectedLetter === letter}
                        onclick={() => selectedLetter = selectedLetter === letter ? null : letter}
                      >
                        {letter}
                      </button>
                    {/each}
                  </div>
                </div>
              </div>

              {#if selectedChips.length > 0 || selectedDifficulty || selectedLetter}
                <div class="active-filters-bar">
                  <span class="active-label">Active:</span>
                  {#if selectedDifficulty}
                    <button type="button" class="active-chip" onclick={() => selectedDifficulty = null}>
                      {difficultyLevels[selectedDifficulty - 1]?.label}
                      <i class="fas fa-times"></i>
                    </button>
                  {/if}
                  {#if selectedLetter}
                    <button type="button" class="active-chip" onclick={() => selectedLetter = null}>
                      Letter: {selectedLetter}
                      <i class="fas fa-times"></i>
                    </button>
                  {/if}
                  {#each selectedChips as chip}
                    <button type="button" class="active-chip" onclick={() => toggleChip(chip)}>
                      {chip}
                      <i class="fas fa-times"></i>
                    </button>
                  {/each}
                  <button class="clear-all" onclick={() => { selectedChips = []; selectedDifficulty = null; selectedLetter = null; }}>
                    Clear All
                  </button>
                </div>
              {/if}
            </div>
            <div class="pros-cons">
              <div class="pros">
                <strong>Pros:</strong> Everything visible at once, fast selection, shows active filters
              </div>
              <div class="cons">
                <strong>Cons:</strong> Can feel overwhelming with many options
              </div>
            </div>
          </div>
        {/if}

        <!-- VARIANT 4: Visual Grid Style -->
        {#if activeFilterVariant === 'visual'}
          <div class="filter-demo visual-style">
            <div class="demo-label">Visual Grid - Icon-Heavy</div>
            <div class="filter-panel-demo">
              <div class="visual-filter-grid">
                <button class="visual-filter-card">
                  <div class="vf-icon">
                    <i class="fas fa-heart"></i>
                  </div>
                  <span class="vf-label">Favorites</span>
                  <span class="vf-count">24</span>
                </button>

                <button class="visual-filter-card">
                  <div class="vf-icon">
                    <i class="fas fa-clock"></i>
                  </div>
                  <span class="vf-label">Recent</span>
                  <span class="vf-count">12</span>
                </button>

                <button class="visual-filter-card">
                  <div class="vf-icon difficulty-icon" style="--level-color: #22c55e">
                    <span>1</span>
                  </div>
                  <span class="vf-label">Beginner</span>
                  <span class="vf-count">142</span>
                </button>

                <button class="visual-filter-card">
                  <div class="vf-icon difficulty-icon" style="--level-color: #eab308">
                    <span>3</span>
                  </div>
                  <span class="vf-label">Medium</span>
                  <span class="vf-count">156</span>
                </button>

                <button class="visual-filter-card">
                  <div class="vf-icon difficulty-icon" style="--level-color: #ef4444">
                    <span>5</span>
                  </div>
                  <span class="vf-label">Expert</span>
                  <span class="vf-count">23</span>
                </button>

                <button class="visual-filter-card">
                  <div class="vf-icon">
                    <i class="fas fa-font"></i>
                  </div>
                  <span class="vf-label">By Letter</span>
                  <span class="vf-count">A-Z</span>
                </button>

                <button class="visual-filter-card">
                  <div class="vf-icon">
                    <i class="fas fa-ruler-horizontal"></i>
                  </div>
                  <span class="vf-label">By Length</span>
                  <span class="vf-count">2-16</span>
                </button>

                <button class="visual-filter-card">
                  <div class="vf-icon">
                    <i class="fas fa-crosshairs"></i>
                  </div>
                  <span class="vf-label">Position</span>
                  <span class="vf-count">4 types</span>
                </button>
              </div>
            </div>
            <div class="pros-cons">
              <div class="pros">
                <strong>Pros:</strong> Very visual, easy to scan, touch-friendly
              </div>
              <div class="cons">
                <strong>Cons:</strong> Less precise, needs drill-down for detailed filters
              </div>
            </div>
          </div>
        {/if}

        <!-- VARIANT 5: Minimal Style -->
        {#if activeFilterVariant === 'minimal'}
          <div class="filter-demo minimal-style">
            <div class="demo-label">Minimal - Clean & Simple</div>
            <div class="filter-panel-demo">
              <div class="minimal-filters">
                <div class="minimal-section">
                  <div class="minimal-row">
                    <span class="minimal-label">Difficulty</span>
                    <div class="minimal-options">
                      {#each difficultyLevels as diff}
                        <button
                          class="minimal-option"
                          class:selected={selectedDifficulty === diff.level}
                          onclick={() => selectedDifficulty = selectedDifficulty === diff.level ? null : diff.level}
                        >
                          {diff.level}
                        </button>
                      {/each}
                    </div>
                  </div>

                  <div class="minimal-row">
                    <span class="minimal-label">Length</span>
                    <div class="minimal-options">
                      {#each lengths as len}
                        <button class="minimal-option">{len}</button>
                      {/each}
                    </div>
                  </div>

                  <div class="minimal-row">
                    <span class="minimal-label">Position</span>
                    <select class="minimal-select">
                      <option>Any</option>
                      {#each positions as pos}
                        <option>{pos}</option>
                      {/each}
                    </select>
                  </div>

                  <div class="minimal-divider"></div>

                  <div class="minimal-row">
                    <span class="minimal-label">Letter</span>
                    <div class="minimal-letter-input">
                      <input type="text" maxlength="1" placeholder="A-Z" class="letter-input" />
                      <span class="input-hint">Type a letter</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="pros-cons">
              <div class="pros">
                <strong>Pros:</strong> Very clean, focused, no visual clutter
              </div>
              <div class="cons">
                <strong>Cons:</strong> Less discoverable, harder for new users
              </div>
            </div>
          </div>
        {/if}
      </div>
    </section>
  {/if}

  <!-- ==================== SCROLLBARS SECTION ==================== -->
  {#if activeSection === 'scrollbars'}
    <section class="exploration-section">
      <div class="section-header">
        <h2>Scrollbar Styles</h2>
        <p>Different scrollbar treatments. The content in each box is scrollable - try scrolling to see the effect.</p>
      </div>

      <div class="variant-selector">
        <button class:active={activeScrollbarVariant === 'thin'} onclick={() => activeScrollbarVariant = 'thin'}>
          Thin
        </button>
        <button class:active={activeScrollbarVariant === 'hidden'} onclick={() => activeScrollbarVariant = 'hidden'}>
          Hidden (iOS)
        </button>
        <button class:active={activeScrollbarVariant === 'gradient'} onclick={() => activeScrollbarVariant = 'gradient'}>
          Gradient
        </button>
        <button class:active={activeScrollbarVariant === 'chunky'} onclick={() => activeScrollbarVariant = 'chunky'}>
          Chunky
        </button>
        <button class:active={activeScrollbarVariant === 'ios'} onclick={() => activeScrollbarVariant = 'ios'}>
          iOS Style
        </button>
      </div>

      <div class="scrollbar-demos">
        <div class="scroll-demo-container">
          <div class="demo-label">{activeScrollbarVariant.charAt(0).toUpperCase() + activeScrollbarVariant.slice(1)} Scrollbar</div>
          <div class="scroll-content scrollbar-{activeScrollbarVariant}">
            {#each Array(30) as _, i}
              <div class="scroll-item">
                <div class="item-thumb"></div>
                <div class="item-info">
                  <div class="item-title">Sequence {i + 1}</div>
                  <div class="item-meta">8 beats • Level 2</div>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <div class="scrollbar-code">
          <div class="demo-label">CSS for this style</div>
          <pre class="code-block">
{#if activeScrollbarVariant === 'thin'}
{`.scroll-content::-webkit-scrollbar {
  width: 6px;
}
.scroll-content::-webkit-scrollbar-track {
  background: transparent;
}
.scroll-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
.scroll-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}`}
{:else if activeScrollbarVariant === 'hidden'}
{`.scroll-content {
  scrollbar-width: none;
}
.scroll-content::-webkit-scrollbar {
  display: none;
}
/* Use scroll shadows for feedback */`}
{:else if activeScrollbarVariant === 'gradient'}
{`.scroll-content::-webkit-scrollbar {
  width: 8px;
}
.scroll-content::-webkit-scrollbar-track {
  background: linear-gradient(
    to bottom,
    rgba(139, 92, 246, 0.1),
    rgba(59, 130, 246, 0.1)
  );
  border-radius: 4px;
}
.scroll-content::-webkit-scrollbar-thumb {
  background: linear-gradient(
    to bottom,
    #8b5cf6,
    #3b82f6
  );
  border-radius: 4px;
}`}
{:else if activeScrollbarVariant === 'chunky'}
{`.scroll-content::-webkit-scrollbar {
  width: 12px;
}
.scroll-content::-webkit-scrollbar-track {
  background: #1a1a2e;
  border-radius: 6px;
}
.scroll-content::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 6px;
  border: 2px solid #1a1a2e;
}
.scroll-content::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}`}
{:else if activeScrollbarVariant === 'ios'}
{`.scroll-content::-webkit-scrollbar {
  width: 7px;
}
.scroll-content::-webkit-scrollbar-track {
  background: transparent;
}
.scroll-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
}`}
{/if}
          </pre>
        </div>
      </div>
    </section>
  {/if}

  <!-- ==================== SCOPE TOGGLE SECTION ==================== -->
  {#if activeSection === 'scope'}
    <section class="exploration-section">
      <div class="section-header">
        <h2>Library / Community Scope Toggle</h2>
        <p>Different ways to switch between viewing community sequences and your personal library.</p>
      </div>

      <div class="variant-selector">
        <button class:active={activeScopeVariant === 'pill'} onclick={() => activeScopeVariant = 'pill'}>
          Pill Toggle
        </button>
        <button class:active={activeScopeVariant === 'segmented'} onclick={() => activeScopeVariant = 'segmented'}>
          Segmented
        </button>
        <button class:active={activeScopeVariant === 'tabs'} onclick={() => activeScopeVariant = 'tabs'}>
          Underline Tabs
        </button>
        <button class:active={activeScopeVariant === 'dropdown'} onclick={() => activeScopeVariant = 'dropdown'}>
          Dropdown
        </button>
      </div>

      <div class="scope-demos">
        <!-- Pill Toggle -->
        {#if activeScopeVariant === 'pill'}
          <div class="scope-demo">
            <div class="demo-label">Pill Toggle - iOS Style</div>
            <div class="scope-container">
              <div class="pill-toggle">
                <div
                  class="pill-slider"
                  style="transform: translateX({selectedScope === 'library' ? '100%' : '0'})"
                ></div>
                <button
                  class="pill-option"
                  class:active={selectedScope === 'community'}
                  onclick={() => selectedScope = 'community'}
                >
                  <i class="fas fa-globe"></i>
                  Community
                </button>
                <button
                  class="pill-option"
                  class:active={selectedScope === 'library'}
                  onclick={() => selectedScope = 'library'}
                >
                  <i class="fas fa-bookmark"></i>
                  My Library
                </button>
              </div>
            </div>
            <div class="scope-preview">
              <div class="preview-label">
                {selectedScope === 'community' ? 'Showing 477 community sequences' : 'Showing 24 saved sequences'}
              </div>
            </div>
          </div>
        {/if}

        <!-- Segmented Control -->
        {#if activeScopeVariant === 'segmented'}
          <div class="scope-demo">
            <div class="demo-label">Segmented Control - macOS Style</div>
            <div class="scope-container">
              <div class="segmented-control">
                <button
                  class="segment"
                  class:active={selectedScope === 'community'}
                  onclick={() => selectedScope = 'community'}
                >
                  Community
                </button>
                <button
                  class="segment"
                  class:active={selectedScope === 'library'}
                  onclick={() => selectedScope = 'library'}
                >
                  My Library
                </button>
              </div>
            </div>
            <div class="scope-preview">
              <div class="preview-label">
                {selectedScope === 'community' ? 'Showing 477 community sequences' : 'Showing 24 saved sequences'}
              </div>
            </div>
          </div>
        {/if}

        <!-- Underline Tabs -->
        {#if activeScopeVariant === 'tabs'}
          <div class="scope-demo">
            <div class="demo-label">Underline Tabs - Web Style</div>
            <div class="scope-container">
              <div class="underline-tabs">
                <button
                  class="underline-tab"
                  class:active={selectedScope === 'community'}
                  onclick={() => selectedScope = 'community'}
                >
                  <i class="fas fa-globe"></i>
                  Community
                  <span class="tab-count">477</span>
                </button>
                <button
                  class="underline-tab"
                  class:active={selectedScope === 'library'}
                  onclick={() => selectedScope = 'library'}
                >
                  <i class="fas fa-bookmark"></i>
                  My Library
                  <span class="tab-count">24</span>
                </button>
              </div>
            </div>
            <div class="scope-preview">
              <div class="preview-label">
                {selectedScope === 'community' ? 'Showing 477 community sequences' : 'Showing 24 saved sequences'}
              </div>
            </div>
          </div>
        {/if}

        <!-- Dropdown -->
        {#if activeScopeVariant === 'dropdown'}
          <div class="scope-demo">
            <div class="demo-label">Dropdown - Compact</div>
            <div class="scope-container">
              <div class="scope-dropdown">
                <select bind:value={selectedScope} class="scope-select">
                  <option value="community">Community (477)</option>
                  <option value="library">My Library (24)</option>
                </select>
                <i class="fas fa-chevron-down dropdown-icon"></i>
              </div>
            </div>
            <div class="scope-preview">
              <div class="preview-label">
                {selectedScope === 'community' ? 'Showing 477 community sequences' : 'Showing 24 saved sequences'}
              </div>
            </div>
          </div>
        {/if}
      </div>
    </section>
  {/if}

  <!-- ==================== SORT CONTROLS SECTION ==================== -->
  {#if activeSection === 'sort'}
    <section class="exploration-section">
      <div class="section-header">
        <h2>Sort Control Designs</h2>
        <p>Different ways to let users sort the gallery content.</p>
      </div>

      <div class="variant-selector">
        <button class:active={activeSortVariant === 'chips'} onclick={() => activeSortVariant = 'chips'}>
          Chips
        </button>
        <button class:active={activeSortVariant === 'dropdown'} onclick={() => activeSortVariant = 'dropdown'}>
          Dropdown
        </button>
        <button class:active={activeSortVariant === 'buttons'} onclick={() => activeSortVariant = 'buttons'}>
          Icon Buttons
        </button>
        <button class:active={activeSortVariant === 'wheel'} onclick={() => activeSortVariant = 'wheel'}>
          Horizontal Scroll
        </button>
      </div>

      <div class="sort-demos">
        <!-- Chips -->
        {#if activeSortVariant === 'chips'}
          <div class="sort-demo">
            <div class="demo-label">Sort Chips - Quick Access</div>
            <div class="sort-container">
              <div class="sort-chips">
                {#each sortOptions as opt}
                  <button
                    class="sort-chip"
                    class:active={selectedSort === opt.id}
                    onclick={() => selectedSort = opt.id}
                  >
                    <i class="fas {opt.icon}"></i>
                    {opt.label}
                  </button>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        <!-- Dropdown -->
        {#if activeSortVariant === 'dropdown'}
          <div class="sort-demo">
            <div class="demo-label">Dropdown - Compact</div>
            <div class="sort-container">
              <div class="sort-dropdown-container">
                <span class="sort-label">Sort by:</span>
                <select bind:value={selectedSort} class="sort-dropdown">
                  {#each sortOptions as opt}
                    <option value={opt.id}>{opt.label}</option>
                  {/each}
                </select>
                <button class="sort-direction-btn" aria-label="Toggle sort direction">
                  <i class="fas fa-arrow-up"></i>
                </button>
              </div>
            </div>
          </div>
        {/if}

        <!-- Icon Buttons -->
        {#if activeSortVariant === 'buttons'}
          <div class="sort-demo">
            <div class="demo-label">Icon Buttons - Minimal</div>
            <div class="sort-container">
              <div class="sort-icon-buttons">
                {#each sortOptions as opt}
                  <button
                    class="sort-icon-btn"
                    class:active={selectedSort === opt.id}
                    onclick={() => selectedSort = opt.id}
                    title={opt.label}
                    aria-label="Sort by {opt.label}"
                  >
                    <i class="fas {opt.icon}"></i>
                  </button>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        <!-- Horizontal Scroll -->
        {#if activeSortVariant === 'wheel'}
          <div class="sort-demo">
            <div class="demo-label">Horizontal Scroll - Mobile-Friendly</div>
            <div class="sort-container">
              <div class="sort-wheel">
                {#each sortOptions as opt}
                  <button
                    class="sort-wheel-item"
                    class:active={selectedSort === opt.id}
                    onclick={() => selectedSort = opt.id}
                  >
                    <div class="wheel-icon">
                      <i class="fas {opt.icon}"></i>
                    </div>
                    <span class="wheel-label">{opt.label}</span>
                  </button>
                {/each}
              </div>
            </div>
          </div>
        {/if}
      </div>
    </section>
  {/if}

  <!-- ==================== SEARCH SECTION ==================== -->
  {#if activeSection === 'search'}
    <section class="exploration-section">
      <div class="section-header">
        <h2>Search Bar Designs</h2>
        <p>Different approaches to search functionality - keeping it simple for non-technical users.</p>
      </div>

      <div class="search-demos">
        <div class="search-demo">
          <div class="demo-label">Simple Search - Clean & Obvious</div>
          <div class="search-container">
            <div class="simple-search">
              <i class="fas fa-search search-icon"></i>
              <input type="text" placeholder="Search sequences..." class="search-input" />
            </div>
          </div>
        </div>

        <div class="search-demo">
          <div class="demo-label">Search with Suggestions</div>
          <div class="search-container">
            <div class="search-with-suggestions">
              <div class="search-input-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input type="text" placeholder="Search sequences..." class="search-input" value="beg" />
                <button class="clear-search" aria-label="Clear search">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="suggestions-dropdown">
                <div class="suggestion-item">
                  <i class="fas fa-search"></i>
                  <span><strong>beg</strong>inner sequences</span>
                </div>
                <div class="suggestion-item">
                  <i class="fas fa-tag"></i>
                  <span>Tag: <strong>beg</strong>inner</span>
                </div>
                <div class="suggestion-item">
                  <i class="fas fa-font"></i>
                  <span>Starts with: <strong>B</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="search-demo">
          <div class="demo-label">Search + Quick Filters Combined</div>
          <div class="search-container">
            <div class="combined-search">
              <div class="search-row">
                <i class="fas fa-search search-icon"></i>
                <input type="text" placeholder="Search..." class="search-input-small" />
              </div>
              <div class="quick-filter-row">
                <button class="quick-filter active">All</button>
                <button class="quick-filter">Favorites</button>
                <button class="quick-filter">Easy</button>
                <button class="quick-filter">Recent</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  {/if}
</div>

<style>
  /* ==================== BASE STYLES ==================== */
  .test-page {
    min-height: 100vh;
    background: #0a0a0f;
    color: #fff;
    padding: 24px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .page-header {
    text-align: center;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .page-header h1 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 8px 0;
    background: linear-gradient(135deg, #fff, #888);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .page-header p {
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  /* Section Navigation */
  .section-nav {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-bottom: 32px;
    flex-wrap: wrap;
  }

  .section-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: #1a1a24;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .section-btn:hover {
    background: #252532;
    color: #fff;
  }

  .section-btn.active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: #fff;
  }

  /* Exploration Section */
  .exploration-section {
    max-width: 1200px;
    margin: 0 auto;
  }

  .section-header {
    margin-bottom: 24px;
  }

  .section-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 8px 0;
  }

  .section-header p {
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  /* Variant Selector */
  .variant-selector {
    display: flex;
    gap: 6px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .variant-selector button {
    padding: 10px 18px;
    background: #1a1a24;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .variant-selector button:hover {
    background: #252532;
    border-color: rgba(255, 255, 255, 0.25);
  }

  .variant-selector button.active {
    background: #8b5cf6;
    border-color: #8b5cf6;
    color: #fff;
  }

  /* Demo Container */
  .demo-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .filter-demo {
    background: #12121a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
  }

  .demo-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 16px;
  }

  .filter-panel-demo {
    background: #1a1a24;
    border-radius: 12px;
    padding: 16px;
    min-height: 300px;
  }

  .pros-cons {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    gap: 24px;
    font-size: 13px;
  }

  .pros {
    color: #22c55e;
  }

  .cons {
    color: #f59e0b;
  }

  /* ==================== ACCORDION STYLES ==================== */
  .accordion-section {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .accordion-section:last-child {
    border-bottom: none;
  }

  .accordion-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 16px;
    background: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .accordion-header:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
  }

  .section-title i {
    width: 20px;
    color: rgba(255, 255, 255, 0.5);
  }

  .section-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .active-badge {
    background: #3b82f6;
    padding: 4px 10px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 500;
  }

  .chevron {
    transition: transform 0.2s ease;
    color: rgba(255, 255, 255, 0.4);
  }

  .accordion-section.expanded .chevron {
    transform: rotate(180deg);
  }

  .accordion-content {
    padding: 0 16px 16px 16px;
  }

  .difficulty-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .difficulty-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #252532;
    border: 1px solid transparent;
    border-radius: 10px;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .difficulty-btn:hover {
    background: #2d2d3d;
  }

  .difficulty-btn.selected {
    background: color-mix(in srgb, var(--level-color) 20%, transparent);
    border-color: var(--level-color);
  }

  .level-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--level-color);
  }

  .level-label {
    flex: 1;
    text-align: left;
    font-weight: 500;
  }

  .level-count {
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
  }

  .letter-grid-accordion {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
  }

  .letter-btn {
    padding: 10px;
    background: #252532;
    border: 1px solid transparent;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .letter-btn:hover {
    background: #2d2d3d;
  }

  .letter-btn.selected {
    background: #3b82f6;
    color: #fff;
  }

  .position-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .position-btn {
    padding: 14px;
    background: #252532;
    border: 1px solid transparent;
    border-radius: 10px;
    color: #fff;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .position-btn:hover {
    background: #2d2d3d;
  }

  .length-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .length-chip {
    padding: 10px 18px;
    background: #252532;
    border: 1px solid transparent;
    border-radius: 100px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .length-chip:hover {
    background: #2d2d3d;
  }

  /* ==================== TABS STYLES ==================== */
  .filter-tabs {
    display: flex;
    gap: 4px;
    padding: 4px;
    background: #252532;
    border-radius: 12px;
    margin-bottom: 20px;
  }

  .filter-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-tab:hover {
    color: rgba(255, 255, 255, 0.9);
  }

  .filter-tab.active {
    background: #3b82f6;
    color: #fff;
  }

  .tab-content {
    min-height: 200px;
  }

  .difficulty-cards {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
  }

  .difficulty-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px 12px;
    background: #252532;
    border: 2px solid transparent;
    border-radius: 12px;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .difficulty-card:hover {
    transform: translateY(-2px);
    background: #2d2d3d;
  }

  .difficulty-card.selected {
    border-color: var(--level-color);
    background: color-mix(in srgb, var(--level-color) 15%, #252532);
  }

  .card-level {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--level-color);
    border-radius: 50%;
    font-size: 20px;
    font-weight: 700;
  }

  .card-label {
    font-weight: 600;
    font-size: 14px;
  }

  .card-count {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .letter-grid-tabs {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 8px;
  }

  .letter-btn-tab {
    padding: 14px 8px;
    background: #252532;
    border: 2px solid transparent;
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .letter-btn-tab:hover {
    background: #2d2d3d;
    transform: scale(1.05);
  }

  .letter-btn-tab.selected {
    background: #3b82f6;
    border-color: #3b82f6;
    color: #fff;
  }

  .position-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .position-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 24px;
    background: #252532;
    border: 2px solid transparent;
    border-radius: 12px;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .position-card:hover {
    background: #2d2d3d;
    transform: translateY(-2px);
  }

  .pos-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(139, 92, 246, 0.2);
    border-radius: 12px;
    color: #8b5cf6;
    font-size: 20px;
  }

  .length-visual {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .length-bar-btn {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    background: #252532;
    border: none;
    border-radius: 10px;
    color: #fff;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .length-bar-btn:hover {
    background: #2d2d3d;
  }

  .bar-visual {
    height: 8px;
    width: var(--bar-width);
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    border-radius: 4px;
    min-width: 20px;
  }

  .bar-label {
    font-weight: 500;
    white-space: nowrap;
  }

  /* ==================== CHIPS STYLES ==================== */
  .chips-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .chip-category {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .category-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.5);
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .chip-row.letter-chips {
    gap: 6px;
  }

  .smart-chip {
    padding: 10px 16px;
    background: #252532;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .smart-chip:hover {
    background: #2d2d3d;
    border-color: rgba(255, 255, 255, 0.2);
  }

  .smart-chip.selected {
    background: #3b82f6;
    border-color: #3b82f6;
    color: #fff;
  }

  .smart-chip.difficulty-chip.selected {
    background: var(--chip-color);
    border-color: var(--chip-color);
  }

  .smart-chip.letter-chip {
    padding: 8px 12px;
    min-width: 36px;
    justify-content: center;
  }

  .active-filters-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: #252532;
    border-radius: 10px;
    margin-top: 16px;
    flex-wrap: wrap;
  }

  .active-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
  }

  .active-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: #3b82f6;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
  }

  .active-chip i {
    font-size: 10px;
    opacity: 0.8;
  }

  .clear-all {
    margin-left: auto;
    padding: 6px 12px;
    background: rgba(239, 68, 68, 0.2);
    border: none;
    border-radius: 6px;
    color: #ef4444;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
  }

  /* ==================== VISUAL GRID STYLES ==================== */
  .visual-filter-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .visual-filter-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 20px 16px;
    background: #252532;
    border: 2px solid transparent;
    border-radius: 16px;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .visual-filter-card:hover {
    background: #2d2d3d;
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .vf-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59, 130, 246, 0.2);
    border-radius: 14px;
    color: #3b82f6;
    font-size: 20px;
  }

  .vf-icon.difficulty-icon {
    background: color-mix(in srgb, var(--level-color) 20%, transparent);
    color: var(--level-color);
    font-size: 18px;
    font-weight: 700;
  }

  .vf-label {
    font-weight: 600;
    font-size: 14px;
  }

  .vf-count {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  /* ==================== MINIMAL STYLES ==================== */
  .minimal-filters {
    padding: 8px;
  }

  .minimal-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .minimal-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .minimal-label {
    width: 80px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }

  .minimal-options {
    display: flex;
    gap: 6px;
  }

  .minimal-option {
    padding: 8px 14px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .minimal-option:hover {
    border-color: rgba(255, 255, 255, 0.3);
    color: #fff;
  }

  .minimal-option.selected {
    background: #fff;
    border-color: #fff;
    color: #000;
  }

  .minimal-select {
    flex: 1;
    padding: 10px 14px;
    background: #252532;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: #fff;
    font-size: 13px;
  }

  .minimal-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 8px 0;
  }

  .minimal-letter-input {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .letter-input {
    width: 48px;
    padding: 10px;
    background: #252532;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    text-align: center;
    text-transform: uppercase;
  }

  .input-hint {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
  }

  /* ==================== SCROLLBAR SECTION ==================== */
  .scrollbar-demos {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .scroll-demo-container {
    background: #12121a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
  }

  .scroll-content {
    height: 400px;
    overflow-y: auto;
    background: #1a1a24;
    border-radius: 12px;
    padding: 12px;
  }

  .scroll-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #252532;
    border-radius: 10px;
    margin-bottom: 8px;
  }

  .item-thumb {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border-radius: 8px;
  }

  .item-info {
    flex: 1;
  }

  .item-title {
    font-weight: 500;
    margin-bottom: 4px;
  }

  .item-meta {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  /* Scrollbar Variants */
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .scrollbar-hidden {
    scrollbar-width: none;
  }
  .scrollbar-hidden::-webkit-scrollbar {
    display: none;
  }

  .scrollbar-gradient::-webkit-scrollbar {
    width: 8px;
  }
  .scrollbar-gradient::-webkit-scrollbar-track {
    background: linear-gradient(to bottom, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
    border-radius: 4px;
  }
  .scrollbar-gradient::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #8b5cf6, #3b82f6);
    border-radius: 4px;
  }

  .scrollbar-chunky::-webkit-scrollbar {
    width: 12px;
  }
  .scrollbar-chunky::-webkit-scrollbar-track {
    background: #1a1a2e;
    border-radius: 6px;
  }
  .scrollbar-chunky::-webkit-scrollbar-thumb {
    background: #374151;
    border-radius: 6px;
    border: 2px solid #1a1a2e;
  }
  .scrollbar-chunky::-webkit-scrollbar-thumb:hover {
    background: #4b5563;
  }

  .scrollbar-ios::-webkit-scrollbar {
    width: 7px;
  }
  .scrollbar-ios::-webkit-scrollbar-track {
    background: transparent;
  }
  .scrollbar-ios::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.4);
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  .scrollbar-code {
    background: #12121a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
  }

  .code-block {
    background: #0d0d12;
    padding: 16px;
    border-radius: 8px;
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 12px;
    line-height: 1.6;
    color: #a5b4fc;
    overflow-x: auto;
    white-space: pre;
  }

  /* ==================== SCOPE SECTION ==================== */
  .scope-demos {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .scope-demo {
    background: #12121a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
  }

  .scope-container {
    display: flex;
    justify-content: center;
    padding: 24px;
    background: #1a1a24;
    border-radius: 12px;
  }

  .scope-preview {
    text-align: center;
    margin-top: 16px;
  }

  .preview-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
  }

  /* Pill Toggle */
  .pill-toggle {
    position: relative;
    display: flex;
    background: #252532;
    border-radius: 12px;
    padding: 4px;
  }

  .pill-slider {
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc(50% - 4px);
    height: calc(100% - 8px);
    background: #3b82f6;
    border-radius: 8px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .pill-option {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .pill-option.active {
    color: #fff;
  }

  /* Segmented Control */
  .segmented-control {
    display: flex;
    background: #252532;
    border-radius: 8px;
    padding: 2px;
  }

  .segment {
    padding: 10px 24px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  .segment.active {
    background: #fff;
    color: #000;
  }

  /* Underline Tabs */
  .underline-tabs {
    display: flex;
    gap: 32px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .underline-tab {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 4px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: -1px;
  }

  .underline-tab:hover {
    color: rgba(255, 255, 255, 0.9);
  }

  .underline-tab.active {
    color: #fff;
    border-bottom-color: #3b82f6;
  }

  .tab-count {
    padding: 2px 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    font-size: 12px;
  }

  .underline-tab.active .tab-count {
    background: rgba(59, 130, 246, 0.2);
    color: #3b82f6;
  }

  /* Dropdown */
  .scope-dropdown {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .scope-select {
    appearance: none;
    padding: 12px 40px 12px 16px;
    background: #252532;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }

  .dropdown-icon {
    position: absolute;
    right: 14px;
    pointer-events: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
  }

  /* ==================== SORT SECTION ==================== */
  .sort-demos {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .sort-demo {
    background: #12121a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
  }

  .sort-container {
    padding: 24px;
    background: #1a1a24;
    border-radius: 12px;
  }

  .sort-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .sort-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: #252532;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .sort-chip:hover {
    background: #2d2d3d;
  }

  .sort-chip.active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: #fff;
  }

  .sort-dropdown-container {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .sort-label {
    color: rgba(255, 255, 255, 0.6);
    font-size: 13px;
  }

  .sort-dropdown {
    padding: 10px 16px;
    background: #252532;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: #fff;
    font-size: 13px;
  }

  .sort-direction-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #252532;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
  }

  .sort-icon-buttons {
    display: flex;
    gap: 8px;
  }

  .sort-icon-btn {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #252532;
    border: 1px solid transparent;
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 16px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .sort-icon-btn:hover {
    background: #2d2d3d;
    color: #fff;
  }

  .sort-icon-btn.active {
    background: #3b82f6;
    color: #fff;
  }

  .sort-wheel {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 8px 0;
    scrollbar-width: none;
  }

  .sort-wheel::-webkit-scrollbar {
    display: none;
  }

  .sort-wheel-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 20px;
    background: #252532;
    border: 2px solid transparent;
    border-radius: 16px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .sort-wheel-item:hover {
    background: #2d2d3d;
    transform: translateY(-2px);
  }

  .sort-wheel-item.active {
    background: color-mix(in srgb, #3b82f6 20%, #252532);
    border-color: #3b82f6;
    color: #fff;
  }

  .wheel-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59, 130, 246, 0.15);
    border-radius: 10px;
    color: #3b82f6;
    font-size: 16px;
  }

  .sort-wheel-item.active .wheel-icon {
    background: #3b82f6;
    color: #fff;
  }

  .wheel-label {
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
  }

  /* ==================== SEARCH SECTION ==================== */
  .search-demos {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .search-demo {
    background: #12121a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
  }

  .search-container {
    padding: 24px;
    background: #1a1a24;
    border-radius: 12px;
  }

  .simple-search {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    background: #252532;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    max-width: 400px;
  }

  .search-icon {
    color: rgba(255, 255, 255, 0.4);
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 14px;
    outline: none;
  }

  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .search-with-suggestions {
    max-width: 400px;
  }

  .search-input-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    background: #252532;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px 12px 0 0;
    border-bottom: none;
  }

  .clear-search {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    font-size: 10px;
  }

  .suggestions-dropdown {
    background: #252532;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0 0 12px 12px;
    padding: 8px;
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
    cursor: pointer;
  }

  .suggestion-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .suggestion-item i {
    color: rgba(255, 255, 255, 0.4);
    width: 16px;
  }

  .combined-search {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 500px;
  }

  .search-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #252532;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
  }

  .search-input-small {
    flex: 1;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 14px;
    outline: none;
  }

  .quick-filter-row {
    display: flex;
    gap: 8px;
  }

  .quick-filter {
    padding: 8px 16px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 100px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .quick-filter:hover {
    border-color: rgba(255, 255, 255, 0.3);
    color: #fff;
  }

  .quick-filter.active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: #fff;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .scrollbar-demos {
      grid-template-columns: 1fr;
    }

    .difficulty-cards {
      grid-template-columns: repeat(3, 1fr);
    }

    .letter-grid-tabs {
      grid-template-columns: repeat(6, 1fr);
    }

    .position-cards {
      grid-template-columns: repeat(2, 1fr);
    }

    .visual-filter-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
