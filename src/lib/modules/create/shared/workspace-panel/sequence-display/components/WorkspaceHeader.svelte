<!--
  WorkspaceHeader.svelte

  Header component for the workspace panel containing:
  - Word label (center/left)
  - Settings button (top-right)

  This component provides a balanced top bar for the workspace,
  utilizing the space where the word label is displayed.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared/application/services/contracts";
  import type { SequenceData } from "$shared/foundation/domain/models/SequenceData";
  import { showSettingsDialog } from "$shared/application/state/app-state.svelte";
  import { resolve, TYPES } from "$shared/inversify";
  import WordLabel from "./WordLabel.svelte";

  let {
    word = "",
    isMultiSelectMode = false,
    sequence = null,
    headerText = null,
  } = $props<{
    word?: string;
    isMultiSelectMode?: boolean;
    sequence?: SequenceData | null;
    headerText?: string | null;
  }>();

  // Check if header text is contextual (not a sequence word)
  const createHeaderMatches = [
    "Choose Creation Mode",
    "Choose Starting Position",
    "Guided Builder",
    "Configure Your Settings",
  ];
  const createHeaderPrefixes = ["Blue Hand -", "Red Hand -"];
  const createHeaderFragments = ["Drawing", "Sequence Complete"];

  const isContextualHeader = $derived.by(() => {
    if (!headerText) return false;
    const normalized = headerText.trim();
    if (!normalized) return false;

    if (createHeaderMatches.some((phrase) => normalized === phrase)) {
      return true;
    }

    if (createHeaderPrefixes.some((prefix) => normalized.startsWith(prefix))) {
      return true;
    }

    return createHeaderFragments.some((fragment) =>
      normalized.includes(fragment)
    );
  });

  // Resolve services
  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  function handleSettingsClick() {
    hapticService?.trigger("selection");
    showSettingsDialog();
  }
</script>

{#if !isMultiSelectMode}
  <div class="workspace-header">
    <div class="header-content">
      <!-- Contextual header or Word Label -->
      <div class="word-label-wrapper">
        {#if isContextualHeader}
          <div class="contextual-header">{headerText}</div>
        {:else}
          <WordLabel {word} {sequence} />
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .workspace-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 48px;
    z-index: 10;
    pointer-events: none; /* Allow clicks to pass through to word label */
  }

  .header-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
  }

  .word-label-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .contextual-header {
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    text-align: center;
    padding: 8px 16px;
  }

  /* 🎯 LANDSCAPE MOBILE */
  @media (min-aspect-ratio: 17/10) and (max-height: 500px) {
    .workspace-header {
      min-height: 36px;
    }
  }
</style>
