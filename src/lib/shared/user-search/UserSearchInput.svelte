<!--
  UserSearchInput - Shared user search with autocomplete

  Reusable component for searching users by name or email.
  Used in announcements, admin preview, and anywhere user selection is needed.
  Uses the preview-users API for case-insensitive search.
-->
<script lang="ts">
  import { browser } from "$app/environment";

  interface UserResult {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
  }

  interface Props {
    selectedUserId?: string;
    selectedUserDisplay?: string;
    onSelect: (user: UserResult) => void;
    placeholder?: string;
    disabled?: boolean;
    useFixedPosition?: boolean; // Use position:fixed for overflow container contexts
    inlineResults?: boolean; // Show results inline instead of dropdown
    excludeUserIds?: string[]; // User IDs to exclude from search results
  }

  let {
    selectedUserId = "",
    selectedUserDisplay = "",
    onSelect,
    placeholder = "Search by name or email...",
    disabled = false,
    useFixedPosition = false,
    inlineResults = false,
    excludeUserIds = [],
  }: Props = $props();

  let inputElement: HTMLInputElement | undefined = $state();
  let dropdownStyle = $state("");

  let searchQuery = $state("");
  let searchResults = $state<UserResult[]>([]);
  let isSearching = $state(false);
  let showResults = $state(false);
  let searchTimeout: number | null = null;
  let wasCleared = $state(false); // Track if user intentionally cleared

  // Pre-fill if we have a selected user (but not if user cleared it)
  $effect(() => {
    if (selectedUserDisplay && !searchQuery && !wasCleared) {
      searchQuery = selectedUserDisplay;
    }
  });

  // Debug effect to track rendering state
  $effect(() => {
    console.log("[UserSearch] Render state:", { showResults, resultsCount: searchResults.length, inlineResults });
  });

  async function searchUsers(queryText: string): Promise<UserResult[]> {
    const q = queryText.trim();
    console.log("[UserSearch] Searching for:", q);
    if (!q || q.length < 2 || !browser) {
      console.log("[UserSearch] Query too short or not in browser");
      return [];
    }

    try {
      // Use the preview-users API which does case-insensitive matching
      const url = `/api/preview-users?q=${encodeURIComponent(q)}&limit=10`;
      console.log("[UserSearch] Fetching:", url);
      const res = await fetch(url);

      if (!res.ok) {
        console.error("[UserSearch] API failed:", res.status, await res.text());
        return [];
      }

      const data = await res.json() as Array<{
        id: string;
        displayName?: string;
        email?: string;
        photoURL?: string;
      }>;

      console.log("[UserSearch] Got results:", data.length, data);

      return data
        .map((user) => ({
          uid: user.id,
          displayName: user.displayName || "",
          email: user.email || "",
          photoURL: user.photoURL || undefined,
        }))
        .filter((user) => !excludeUserIds.includes(user.uid));
    } catch (error) {
      console.error("[UserSearch] Failed to search users:", error);
      return [];
    }
  }

  async function handleSearchInput() {
    // Reset cleared flag when user types
    if (wasCleared && searchQuery) {
      wasCleared = false;
    }

    const q = searchQuery.trim();

    if (!q || q.length < 2) {
      searchResults = [];
      showResults = false;
      return;
    }

    // Debounce search
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = window.setTimeout(async () => {
      isSearching = true;
      try {
        searchResults = await searchUsers(q);
        showResults = true;
        console.log("[UserSearch] Setting showResults=true, results:", searchResults.length, "inlineResults:", inlineResults);
        if (!inlineResults) {
          updateDropdownPosition();
          console.log("[UserSearch] dropdownStyle:", dropdownStyle);
        }
      } catch (error) {
        console.error("Failed to search users:", error);
        searchResults = [];
      } finally {
        isSearching = false;
      }
    }, 300);
  }

  function handleSelectUser(user: UserResult) {
    searchQuery = user.displayName || user.email;
    showResults = false;
    searchResults = [];
    onSelect(user);
  }

  function updateDropdownPosition() {
    if (!useFixedPosition || !inputElement) {
      dropdownStyle = "";
      return;
    }
    const rect = inputElement.getBoundingClientRect();
    dropdownStyle = `position: fixed; top: ${rect.bottom + 8}px; left: ${rect.left}px; width: ${rect.width}px;`;
  }

  function handleFocus() {
    if (searchResults.length > 0) {
      showResults = true;
      if (!inlineResults) {
        updateDropdownPosition();
      }
    }
  }

  function handleBlur() {
    // Delay to allow click events on results to fire
    // In inline mode, don't auto-hide on blur
    if (inlineResults) {
      console.log("[UserSearch] Blur ignored in inline mode");
      return;
    }
    console.log("[UserSearch] Blur - hiding results in 200ms");
    setTimeout(() => {
      showResults = false;
    }, 200);
  }

  function clearSelection() {
    wasCleared = true;
    searchQuery = "";
    searchResults = [];
    showResults = false;
  }
</script>

<div class="user-search">
  <div class="search-input-wrapper">
    <i class="fas fa-search search-icon"></i>
    <input
      type="search"
      class="search-input"
      name="user-search-query"
      bind:this={inputElement}
      bind:value={searchQuery}
      oninput={handleSearchInput}
      onfocus={handleFocus}
      onblur={handleBlur}
      {placeholder}
      {disabled}
      autocomplete="off"
      data-1p-ignore
      data-lpignore="true"
      data-form-type="other"
    />
    {#if isSearching}
      <i class="fas fa-spinner fa-spin loading-icon"></i>
    {:else if searchQuery && !disabled}
      <button
        type="button"
        class="clear-btn"
        onclick={clearSelection}
        aria-label="Clear search"
      >
        <i class="fas fa-times"></i>
      </button>
    {/if}
  </div>

  {#if showResults && searchResults.length > 0}
    <div class="search-results" class:fixed-position={useFixedPosition} class:inline={inlineResults} style={inlineResults ? "" : dropdownStyle}>
      {#each searchResults as user (user.uid)}
        <button
          type="button"
          class="result-item"
          class:selected={user.uid === selectedUserId}
          onclick={() => handleSelectUser(user)}
        >
          {#if user.photoURL}
            <img src={user.photoURL} alt="" class="result-avatar" />
          {:else}
            <div class="result-avatar-placeholder">
              <i class="fas fa-user"></i>
            </div>
          {/if}
          <div class="result-info">
            <span class="result-name">{user.displayName || "No name"}</span>
            <span class="result-email">{user.email}</span>
          </div>
          <i class="fas fa-check result-check"></i>
        </button>
      {/each}
    </div>
  {/if}

  {#if showResults && searchResults.length === 0 && searchQuery.length >= 2 && !isSearching}
    <div class="search-results" class:fixed-position={useFixedPosition} class:inline={inlineResults} style={inlineResults ? "" : dropdownStyle}>
      <div class="no-results">
        <i class="fas fa-user-slash"></i>
        No users found
      </div>
    </div>
  {/if}
</div>

<style>
  .user-search {
    position: relative;
    width: 100%;
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 16px;
    color: rgba(255, 255, 255, 0.4);
    font-size: 14px;
    pointer-events: none;
  }

  .loading-icon {
    position: absolute;
    right: 16px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
  }

  .clear-btn {
    position: absolute;
    right: 0;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.15s ease;
    z-index: 2;
  }

  .clear-btn::before {
    content: '';
    position: absolute;
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transition: all 0.15s ease;
  }

  .clear-btn:hover::before {
    background: rgba(255, 255, 255, 0.2);
  }

  .clear-btn:hover {
    color: white;
  }

  .clear-btn i {
    position: relative;
    z-index: 1;
  }

  .search-input {
    width: 100%;
    min-height: 52px;
    padding: 0 52px;
    background: var(--theme-card-bg, linear-gradient(135deg, #2d2d3a 0%, #25252f 100%));
    border: 2px solid var(--theme-stroke, rgba(255, 255, 255, 0.15));
    border-radius: 12px;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    font-size: 15px;
    transition: all 0.2s ease;
    box-shadow: var(--theme-shadow, 0 2px 8px rgba(0, 0, 0, 0.3));
  }

  .search-input:focus {
    outline: none;
    border-color: var(--theme-accent, #6366f1);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-accent) 20%, transparent);
  }

  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .search-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Search Results */
  .search-results {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    background: var(--theme-panel-bg, linear-gradient(135deg, #2d2d3a 0%, #25252f 100%));
    border: 2px solid var(--theme-stroke, rgba(255, 255, 255, 0.15));
    border-radius: 12px;
    overflow: hidden;
    z-index: 100;
    box-shadow: var(--theme-shadow, 0 8px 24px rgba(0, 0, 0, 0.5));
    max-height: 320px;
    overflow-y: auto;
  }

  .search-results.fixed-position {
    z-index: 10000; /* Higher z-index for fixed positioning */
  }

  .search-results.inline {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    margin-top: 12px;
  }

  .result-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 52px;
    padding: 10px 16px;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
  }

  .result-item:last-child {
    border-bottom: none;
  }

  .result-item:hover {
    background: color-mix(in srgb, var(--theme-accent) 15%, transparent);
  }

  .result-item.selected {
    background: color-mix(in srgb, var(--theme-accent) 20%, transparent);
  }

  .result-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .result-avatar-placeholder {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.5);
    flex-shrink: 0;
  }

  .result-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .result-name {
    color: rgba(255, 255, 255, 0.95);
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .result-email {
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .result-check {
    color: rgba(255, 255, 255, 0.3);
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.15s ease;
    flex-shrink: 0;
  }

  .result-item:hover .result-check {
    opacity: 1;
    color: var(--theme-accent, #6366f1);
  }

  .result-item.selected .result-check {
    opacity: 1;
    color: var(--theme-accent, #6366f1);
  }

  .no-results {
    padding: 32px 16px;
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .no-results i {
    font-size: 32px;
    opacity: 0.5;
  }

  /* Scrollbar */
  .search-results::-webkit-scrollbar {
    width: 8px;
  }

  .search-results::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }

  .search-results::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }

  .search-results::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
</style>
