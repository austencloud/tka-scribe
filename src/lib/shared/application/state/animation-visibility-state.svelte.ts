/**
 * Animation Visibility State
 * 
 * Global state for tracking animation panel visibility across the app.
 * Used to coordinate UI hiding (button panel, navigation tabs) when animation is active.
 * 
 * This is a lightweight global state that allows components in different parts of the tree
 * (CreateModule and MainInterface) to coordinate without prop drilling.
 */

/**
 * Global state for animation panel visibility
 */
let isAnimationPanelOpen = $state(false);

/**
 * Global state for side-by-side layout mode
 */
let isSideBySideLayout = $state(false);

/**
 * Set animation panel open state
 */
export function setAnimationPanelOpen(open: boolean): void {
  isAnimationPanelOpen = open;
}

/**
 * Set side-by-side layout state
 */
export function setSideBySideLayout(sideBySide: boolean): void {
  isSideBySideLayout = sideBySide;
}

/**
 * Get whether animation panel is open
 */
export function getIsAnimationPanelOpen(): boolean {
  return isAnimationPanelOpen;
}

/**
 * Get whether layout is side-by-side
 */
export function getIsSideBySideLayout(): boolean {
  return isSideBySideLayout;
}

/**
 * Derived state: should hide UI elements (animation open in side-by-side layout)
 */
export function shouldHideUIForAnimation(): boolean {
  return isAnimationPanelOpen && isSideBySideLayout;
}

