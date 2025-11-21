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

export { app, auth, firestore,storage } from "./firebase";
export * from "./services";
export { authStore } from "./stores/authStore.svelte";
export * from "./utils/clearFirebaseCache";
export * from "./utils/nuclearCacheClear";
