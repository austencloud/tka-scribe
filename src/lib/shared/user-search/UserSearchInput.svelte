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
  }

  let {
    selectedUserId = "",
    selectedUserDisplay = "",
    onSelect,
    placeholder = "Search by name or email...",
    disabled = false,
  }: Props = $props();

  let searchQuery = $state("");
  let searchResults = $state<UserResult[]>([]);
  let isSearching = $state(false);
  let showResults = $state(false);
  let searchTimeout: number | null = null;

  // Pre-fill if we have a selected user
  $effect(() => {
    if (selectedUserDisplay && !searchQuery) {
      searchQuery = selectedUserDisplay;
    }
  });

  async function searchUsers(queryText: string): Promise<UserResult[]> {
    const q = queryText.trim();
    if (!q || q.length < 2 || !browser) return [];

    try {
      // Use the preview-users API which does case-insensitive matching
      const res = await fetch(`/api/preview-users?q=${encodeURIComponent(q)}&limit=10`);

      if (!res.ok) {
        console.error("User search failed:", res.status);
        return [];
      }

      const data = await res.json() as Array<{
        id: string;
        displayName?: string;
        email?: string;
        photoURL?: string;
      }>;

      return data.map((user) => ({
        uid: user.id,
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || undefined,
      }));
    } catch (error) {
      console.error("Failed to search users:", error);
      return [];
    }
  }

  async function handleSearchInput() {
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

  function handleFocus() {
    if (searchResults.length > 0) {
      showResults = true;
    }
  }

  function handleBlur() {
    // Delay to allow click events on results to fire
    setTimeout(() => {
      showResults = false;
    }, 200);
  }

  function clearSelection() {
    searchQuery = "";
    searchResults = [];
    showResults = false;
  }
</script>

<div class="user-search">
  <div class="search-input-wrapper">
    <i class="fas fa-search search-icon"></i>
    <input
      type="text"
      class="search-input"
      bind:value={searchQuery}
      oninput={handleSearchInput}
      onfocus={handleFocus}
      onblur={handleBlur}
      {placeholder}
      {disabled}
      autocomplete="off"
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
    <div class="search-results">
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
    <div class="search-results">
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
    right: 12px;
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
    transition: all 0.15s ease;
  }

  .clear-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .search-input {
    width: 100%;
    min-height: 48px;
    padding: 0 48px;
    background: linear-gradient(135deg, #2d2d3a 0%, #25252f 100%);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 15px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .search-input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
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
    background: linear-gradient(135deg, #2d2d3a 0%, #25252f 100%);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    overflow: hidden;
    z-index: 100;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    max-height: 320px;
    overflow-y: auto;
  }

  .result-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
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
    background: rgba(99, 102, 241, 0.15);
  }

  .result-item.selected {
    background: rgba(99, 102, 241, 0.2);
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
    color: #6366f1;
  }

  .result-item.selected .result-check {
    opacity: 1;
    color: #6366f1;
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
