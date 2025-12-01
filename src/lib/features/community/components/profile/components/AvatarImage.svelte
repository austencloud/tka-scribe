<script lang="ts">
  /**
   * AvatarImage
   * Robust avatar rendering with built-in placeholder fallback.
   * Avoids per-consumer error tracking; guarantees a visible avatar.
   */

  const PLACEHOLDER =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="60" fill="url(#g)"/><g clip-path="url(#c)"><circle cx="60" cy="52" r="24" fill="rgba(255,255,255,0.85)"/><path d="M22 104c4.6-22 22-32 38-32s33.4 10 38 32" stroke="rgba(255,255,255,0.85)" stroke-width="12" stroke-linecap="round"/></g><defs><linearGradient id="g" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse"><stop stop-color="%238B5CF6"/><stop offset="1" stop-color="%234F46E5"/></linearGradient><clipPath id="c"><rect x="12" y="20" width="96" height="88" rx="44"/></clipPath></defs></svg>`
    );

  let {
    src,
    alt = "User avatar",
    size = 64,
    rounded = true,
    className = "",
  }: {
    src?: string | null;
    alt?: string;
    size?: number;
    rounded?: boolean;
    className?: string;
  } = $props();

  let loadFailed = $state(false);

  const resolvedSrc = $derived(src && !loadFailed ? src : PLACEHOLDER);

  function handleError() {
    loadFailed = true;
  }
</script>

<img
  class={`avatar-image ${rounded ? "rounded" : ""} ${className}`.trim()}
  src={resolvedSrc}
  alt={alt}
  width={size}
  height={size}
  loading="lazy"
  style={`--avatar-size:${size}px;`}
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
  onerror={handleError}
/>

<style>
  .avatar-image {
    display: block;
    width: var(--avatar-size, 64px);
    height: var(--avatar-size, 64px);
    object-fit: cover;
    background: rgba(255, 255, 255, 0.04);
    border: 2px solid rgba(255, 255, 255, 0.1);
  }

  .rounded {
    border-radius: 50%;
  }
</style>
