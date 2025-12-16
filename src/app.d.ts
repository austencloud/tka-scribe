// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

/// <reference types="@sveltejs/kit" />
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.svelte-kit/ambient.d.ts" />

declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }

  /** App version injected from package.json at build time */
  const __APP_VERSION__: string;
}

export {};
