<!-- SettingsButton - Settings Button Component -->
<script lang="ts">
  import NavButton from "./NavButton.svelte";
  import { setSettingsPortalOrigin } from "../../../navigation-coordinator/navigation-coordinator.svelte";

  let {
    active = false,
    onClick = () => {},
    onLongPress = undefined,
    longPressMs = 500,
  } = $props<{
    active?: boolean;
    onClick?: () => void;
    onLongPress?: () => void;
    longPressMs?: number;
  }>();

  let longPressTimer: ReturnType<typeof setTimeout> | null = null;
  let suppressNextClick = false;

  function handleClick(event: MouseEvent) {
    // Capture click position for portal animation origin
    // Use the click coordinates directly - most accurate
    setSettingsPortalOrigin(event.clientX, event.clientY);
    onClick();
  }

  function startLongPress(event: PointerEvent) {
    if (!onLongPress) return;
    if (event.pointerType === "mouse") return; // only treat touch/pen as long press
    clearLongPress();
    longPressTimer = setTimeout(() => {
      suppressNextClick = true;
      onLongPress?.();
    }, longPressMs);
  }

  function clearLongPress() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  function handlePointerUp() {
    clearLongPress();
  }

  function handleWrapperClick(event: MouseEvent) {
    if (suppressNextClick) {
      suppressNextClick = false;
      return;
    }
    handleClick(event);
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="settings-button-wrapper"
  onclick={handleWrapperClick}
  onpointerdown={startLongPress}
  onpointerup={handlePointerUp}
  onpointerleave={clearLongPress}
  onpointercancel={clearLongPress}
  onkeydown={(e) =>
    e.key === "Enter" && handleClick(e as unknown as MouseEvent)}
  role="button"
  tabindex="0"
>
  <NavButton
    icon="<i class='fas fa-cog'></i>"
    label="Settings"
    type="special"
    color="rgba(255, 255, 255, 1)"
    gradient="rgba(255, 255, 255, 1)"
    ariaLabel="Settings"
    {active}
  />
</div>

<style>
  .settings-button-wrapper {
    display: contents;
  }
</style>
