/**
 * Role Switcher State
 *
 * Shared state for the role switcher debug panel.
 * Allows the keyboard shortcut system to control the panel visibility.
 *
 * Domain: Debug Tools - Role Switching
 */

let _isOpen = $state(false);

/**
 * Role switcher panel state
 */
export const roleSwitcherState = {
  /** Whether the role switcher panel is open */
  get isOpen() {
    return _isOpen;
  },

  /** Toggle the panel open/closed */
  toggle() {
    const wasOpen = _isOpen;
    _isOpen = !_isOpen;
    console.log(`[roleSwitcherState] toggle: ${wasOpen} → ${_isOpen}`);
  },

  /** Open the panel */
  open() {
    _isOpen = true;
    console.log(`[roleSwitcherState] open: true`);
  },

  /** Close the panel */
  close() {
    _isOpen = false;
    console.log(`[roleSwitcherState] close: false`);
  },
};
