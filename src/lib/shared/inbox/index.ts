/**
 * Inbox module - public exports
 */

// Components
export { default as InboxButton } from "./components/InboxButton.svelte";
export { default as InboxDrawer } from "./components/InboxDrawer.svelte";

// State
export { inboxState, type InboxTab, type InboxView } from "./state/inbox-state.svelte";
