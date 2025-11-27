<script lang="ts">
  /**
   * PanelAvatar - User avatar with fallback
   *
   * Displays user avatar image with placeholder fallback.
   */

  type AvatarSize = "sm" | "md" | "lg";

  interface Props {
    /** Image source URL */
    src?: string | null;
    /** Alt text for the image */
    alt: string;
    /** Avatar size */
    size?: AvatarSize;
  }

  let { src, alt, size = "md" }: Props = $props();

  let imageError = $state(false);

  const sizeMap: Record<AvatarSize, number> = {
    sm: 40,
    md: 80,
    lg: 120,
  };

  const dimension = $derived(sizeMap[size]);

  function handleImageError() {
    imageError = true;
  }
</script>

<div
  class="panel-avatar"
  style:width="{dimension}px"
  style:height="{dimension}px"
>
  {#if src && !imageError}
    <img
      {src}
      {alt}
      class="panel-avatar__img"
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
      onerror={handleImageError}
    />
  {:else}
    <div class="panel-avatar__placeholder">
      <i
        class="fas fa-user"
        style:font-size="{dimension * 0.4}px"
        aria-hidden="true"
      ></i>
    </div>
  {/if}
</div>

<style>
  .panel-avatar {
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
  }

  .panel-avatar__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .panel-avatar__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
  }

  .panel-avatar__placeholder i {
    color: rgba(255, 255, 255, 0.4);
  }
</style>
