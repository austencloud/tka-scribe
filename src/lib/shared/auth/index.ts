/**
 * Authentication Module
 *
 * Central export point for all authentication-related functionality
 *
 * Usage in Svelte 5 components:
 * ```svelte
 * <script lang="ts">
 *   import { authStore } from "$shared/auth";
 *
 *   // Access reactive state directly - no $ prefix needed
 *   {#if authStore.isAuthenticated}
 *     <p>Hello {authStore.user?.displayName}</p>
 *   {/if}
 * </script>
 * ```
 */

export { auth, app, storage, firestore } from "./firebase";
export { authStore } from "./stores/authStore.svelte";
export * from "./domain";
export * from "./services";
export * from "./utils/clearFirebaseCache";
export * from "./utils/nuclearCacheClear";
