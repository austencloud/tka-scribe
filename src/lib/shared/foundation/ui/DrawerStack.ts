/**
 * DrawerStack - Manages z-index stacking for nested drawers
 *
 * When multiple drawers are open simultaneously, this ensures proper
 * z-index ordering so newer drawers appear on top of older ones.
 *
 * Usage is automatic - the Drawer component registers/unregisters
 * itself when opening/closing.
 */

// Global drawer stack - tracks open drawer IDs in order
const drawerStack: string[] = [];

// Base z-index for drawers
const BASE_Z_INDEX = 50;

// Z-index increment per drawer level
const Z_INDEX_INCREMENT = 10;

/**
 * Generate a unique ID for a drawer instance
 */
export function generateDrawerId(): string {
  return `drawer-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Register a drawer as open and get its z-index
 * @returns The z-index to use for this drawer
 */
export function registerDrawer(id: string): number {
  // Remove if already exists (shouldn't happen, but be safe)
  const existingIndex = drawerStack.indexOf(id);
  if (existingIndex !== -1) {
    drawerStack.splice(existingIndex, 1);
  }

  // Add to top of stack
  drawerStack.push(id);

  // Return z-index based on position
  return BASE_Z_INDEX + (drawerStack.length - 1) * Z_INDEX_INCREMENT;
}

/**
 * Unregister a drawer when it closes
 */
export function unregisterDrawer(id: string): void {
  const index = drawerStack.indexOf(id);
  if (index !== -1) {
    drawerStack.splice(index, 1);
  }
}

/**
 * Check if a drawer is the topmost drawer
 */
export function isTopDrawer(id: string): boolean {
  return drawerStack.length > 0 && drawerStack[drawerStack.length - 1] === id;
}

/**
 * Get the current drawer stack depth
 */
export function getStackDepth(): number {
  return drawerStack.length;
}

/**
 * Get z-index for a specific drawer
 */
export function getDrawerZIndex(id: string): number {
  const index = drawerStack.indexOf(id);
  if (index === -1) {
    return BASE_Z_INDEX;
  }
  return BASE_Z_INDEX + index * Z_INDEX_INCREMENT;
}

/**
 * Check if any drawer is currently open
 */
export function hasOpenDrawers(): boolean {
  return drawerStack.length > 0;
}
