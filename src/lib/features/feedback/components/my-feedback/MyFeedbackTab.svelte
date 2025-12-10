<!-- MyFeedbackTab - Tester's personal feedback dashboard -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { createMyFeedbackState } from "../../state/my-feedback-state.svelte";
  import { useUserPreview } from "$lib/shared/debug/context/user-preview-context";
  import MyFeedbackList from "./MyFeedbackList.svelte";
  import MyFeedbackDetail from "./MyFeedbackDetail.svelte";

  const state = createMyFeedbackState();
  const preview = useUserPreview();

  // Track preview user to reload when it changes
  let lastPreviewUserId: string | null = null;

  // Load on mount (not in $effect to avoid loops)
  onMount(() => {
    state.loadMyFeedback(true);
    lastPreviewUserId = preview.profile?.uid ?? null;
  });

  // Reload when preview user changes
  $effect(() => {
    const currentPreviewUserId = preview.isActive
      ? preview.profile?.uid ?? null
      : null;

    if (currentPreviewUserId !== lastPreviewUserId) {
      lastPreviewUserId = currentPreviewUserId;
      state.cleanup();
      state.loadMyFeedback(true);
    }
  });

  onDestroy(() => {
    state.cleanup();
  });

  // Show preview indicator
  const isPreviewMode = $derived(preview.isActive);
  const previewUserName = $derived(
    preview.profile?.displayName ||
    preview.profile?.email ||
    "User"
  );
</script>

<div class="my-feedback-tab">
  <div class="tab-layout">
    <!-- Header with pending count -->
    <header class="tab-header" class:preview-mode={isPreviewMode}>
      {#if isPreviewMode}
        <div class="preview-banner">
          <i class="fas fa-eye"></i>
          <span>Viewing feedback for: <strong>{previewUserName}</strong></span>
        </div>
      {/if}
      <div class="header-content">
        <div class="header-icon">
          <i class="fas fa-list-check"></i>
        </div>
        <div class="header-text">
          <h1>{isPreviewMode ? `${previewUserName}'s Feedback` : "My Feedback"}</h1>
          <p>{isPreviewMode ? "Viewing this user's submitted feedback" : "View your submissions and their resolution status"}</p>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <div class="tab-content">
      {#if state.isLoading && state.items.length === 0}
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Loading your feedback...</span>
        </div>
      {:else if state.error}
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <span>{state.error}</span>
          <button onclick={() => state.loadMyFeedback(true)}>Retry</button>
        </div>
      {:else if state.items.length === 0}
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <h2>No feedback yet</h2>
          <p>
            You haven't submitted any feedback. Head to the Submit tab to share
            your thoughts!
          </p>
        </div>
      {:else}
        <div class="feedback-layout">
          <MyFeedbackList
            items={state.items}
            selectedItem={state.selectedItem}
            onSelect={(item) => state.selectItem(item)}
            hasMore={state.hasMore}
            isLoading={state.isLoading}
            onLoadMore={() => state.loadMyFeedback()}
          />

          {#if state.selectedItem}
            <MyFeedbackDetail
              item={state.selectedItem}
              onClose={() => state.selectItem(null)}
              onUpdate={state.updateItem}
            />
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .my-feedback-tab {
    container-type: size;
    container-name: my-feedback;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .tab-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  /* Header */
  .tab-header {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: clamp(12px, 3cqi, 20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  .tab-header.preview-mode {
    background: rgba(59, 130, 246, 0.05);
    border-bottom-color: rgba(59, 130, 246, 0.2);
  }

  .preview-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.25);
    border-radius: 8px;
    font-size: 0.8125rem;
    color: #60a5fa;
  }

  .preview-banner i {
    font-size: 12px;
  }

  .preview-banner strong {
    color: #93c5fd;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(59, 130, 246, 0.15);
    border-radius: 10px;
    color: #3b82f6;
    font-size: 16px;
  }

  .header-text h1 {
    margin: 0;
    font-size: clamp(1rem, 2.5cqi, 1.25rem);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .header-text p {
    margin: 0;
    font-size: clamp(0.75rem, 1.8cqi, 0.875rem);
    color: rgba(255, 255, 255, 0.5);
  }

  /* Content area */
  .tab-content {
    flex: 1;
    overflow: hidden;
  }

  .feedback-layout {
    display: flex;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  /* States */
  .loading-state,
  .error-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 12px;
    padding: 32px;
    text-align: center;
  }

  .loading-state i {
    font-size: 24px;
    color: #3b82f6;
  }

  .loading-state span {
    color: rgba(255, 255, 255, 0.6);
  }

  .error-state i {
    font-size: 32px;
    color: #ef4444;
  }

  .error-state span {
    color: rgba(255, 255, 255, 0.7);
  }

  .error-state button {
    padding: 8px 16px;
    background: rgba(59, 130, 246, 0.2);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    color: #3b82f6;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .error-state button:hover {
    background: rgba(59, 130, 246, 0.3);
  }

  .empty-state i {
    font-size: 52px;
    color: rgba(255, 255, 255, 0.2);
  }

  .empty-state h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  .empty-state p {
    margin: 0;
    max-width: 300px;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.5;
  }

  /* Responsive: Mobile shows list, desktop shows split view */
  @container my-feedback (max-width: 600px) {
    .tab-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
