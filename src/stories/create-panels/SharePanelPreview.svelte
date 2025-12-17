<script lang="ts">
  import ActionsSection from "./ActionsSection.svelte";
  import ContentTypeSelector from "./ContentTypeSelector.svelte";
  import ImageOptionsPanel from "./ImageOptionsPanel.svelte";
  import type {
    ActionConfig,
    ContentType,
    ContentTypeConfig,
    ImageOptions,
    ToggleOptionKey,
  } from "./sharePanelTypes";

  let selectedTypes = $state<ContentType[]>(["image"]);
  let imageOptionsExpanded = $state(false);

  let imageOptions = $state<ImageOptions>({
    addWord: true,
    addBeatNumbers: false,
    addUserInfo: false,
    addDifficultyLevel: true,
    includeStartPosition: true,
    format: "PNG",
    quality: 1.0,
  });

  const contentTypes: ContentTypeConfig[] = [
    {
      type: "video",
      icon: "fa-solid fa-video",
      label: "Video",
      description: "Recorded performance",
      color: "#ef4444",
      disabled: true,
      comingSoon: true,
    },
    {
      type: "animation",
      icon: "fa-solid fa-film",
      label: "Animation",
      description: "Animated GIF/WebP",
      color: "#8b5cf6",
      disabled: false,
    },
    {
      type: "image",
      icon: "fa-solid fa-image",
      label: "Image",
      description: "Static sequence image",
      color: "#3b82f6",
      disabled: false,
    },
  ];

  const primaryActions: ActionConfig[] = [
    { icon: "fa-solid fa-download", label: "Download", variant: "primary" },
    {
      icon: "fa-solid fa-share-nodes",
      label: "Share via Device",
      variant: "secondary",
    },
  ];

  const socialActions: ActionConfig[] = [
    {
      icon: "fab fa-instagram",
      label: "Post to Instagram",
      variant: "instagram",
    },
    {
      icon: "fab fa-facebook",
      label: "Post to Facebook",
      variant: "facebook",
      disabled: true,
      comingSoon: true,
    },
  ];

  function toggleContentType(type: ContentType) {
    const disabled = contentTypes.find((ct) => ct.type === type)?.disabled;
    if (disabled) return;

    selectedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
  }

  function toggleImageOption(key: ToggleOptionKey) {
    imageOptions[key] = !imageOptions[key];
  }

  function setImageFormat(format: ImageOptions["format"]) {
    imageOptions.format = format;
  }

  function setImageQuality(value: number) {
    imageOptions.quality = value;
  }
</script>

<div class="panel-preview">
  <div class="panel-header">
    <h2>Image Share</h2>
    <button class="close-btn" aria-label="Close image share panel">
      <i class="fas fa-times"></i>
    </button>
  </div>

  <div class="share-preview-body">
    <ContentTypeSelector
      {contentTypes}
      {selectedTypes}
      on:toggleType={(event) => toggleContentType(event.detail)}
    />

    {#if selectedTypes.includes("image")}
      <ImageOptionsPanel
        expanded={imageOptionsExpanded}
        options={imageOptions}
        on:toggleExpanded={() => (imageOptionsExpanded = !imageOptionsExpanded)}
        on:toggleOption={(event) => toggleImageOption(event.detail)}
        on:setFormat={(event) => setImageFormat(event.detail)}
        on:setQuality={(event) => setImageQuality(event.detail)}
      />
    {/if}

    <ActionsSection {primaryActions} {socialActions} />
  </div>
</div>

<style>
  .panel-preview {
    width: 100%;
    max-width: 640px;
    margin: 0 auto;
    padding: 28px;
    background: linear-gradient(
      135deg,
      rgba(20, 25, 35, 0.98) 0%,
      rgba(15, 20, 30, 0.96) 50%,
      rgba(12, 16, 25, 0.98) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.6),
      0 8px 24px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
  }

  .panel-preview::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    opacity: 0.6;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    position: relative;
  }

  .panel-header::after {
    content: "";
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(59, 130, 246, 0.3) 50%,
      transparent 100%
    );
    opacity: 0.5;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    background: linear-gradient(
      135deg,
      #ffffff 0%,
      rgba(255, 255, 255, 0.85) 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }

  .close-btn {
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      rgba(100, 100, 120, 0.85),
      rgba(70, 70, 90, 0.85)
    );
    color: white;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .close-btn:hover {
    background: linear-gradient(
      135deg,
      rgba(120, 120, 140, 0.95),
      rgba(90, 90, 110, 0.95)
    );
    transform: scale(1.08) rotate(90deg);
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .close-btn:active {
    transform: scale(0.95) rotate(90deg);
  }

  .share-preview-body {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  :global(.coming-soon-badge) {
    padding: 4px 10px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.18),
      rgba(255, 255, 255, 0.12)
    );
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  @media (prefers-reduced-motion: reduce) {
    :global(*),
    :global(*::before),
    :global(*::after) {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }

    :global(.type-button:hover),
    :global(.action-btn:hover),
    :global(.options-toggle:hover),
    .close-btn:hover {
      transform: none !important;
    }
  }
</style>
