<!--
  KeyboardKeyDisplay.svelte

  Realistic 3D keyboard key visualization with platform-aware symbols.
  Displays a key combo as individual keycaps with depth and styling.
-->
<script lang="ts">
  import { keyboardShortcutState } from "../../state/keyboard-shortcut-state.svelte";
  import {
    parseKeyCombo,
    formatKeyForDisplay,
  } from "../../utils/key-combo-utils";
  import type { KeyModifier, ParsedKeyCombo } from "../../domain/types/keyboard-types";

  let {
    keyCombo = "",
    parsed = undefined as ParsedKeyCombo | undefined,
    size = "default" as "small" | "default" | "large",
    pressable = false,
  }: {
    keyCombo?: string;
    parsed?: ParsedKeyCombo;
    size?: "small" | "default" | "large";
    pressable?: boolean;
  } = $props();

  const isMac = keyboardShortcutState.isMac;

  // Parse the key combo if not provided as parsed
  const resolvedParsed = $derived(parsed ?? parseKeyCombo(keyCombo));

  // Order modifiers consistently
  const modifierOrder: KeyModifier[] = ["ctrl", "alt", "shift", "meta"];
  const sortedModifiers = $derived(
    [...resolvedParsed.modifiers].sort(
      (a, b) => modifierOrder.indexOf(a) - modifierOrder.indexOf(b)
    )
  );

  // Format modifier for display
  function formatModifier(mod: KeyModifier): string {
    if (isMac) {
      switch (mod) {
        case "ctrl":
          return "⌃";
        case "alt":
          return "⌥";
        case "shift":
          return "⇧";
        case "meta":
          return "⌘";
        default:
          return mod;
      }
    } else {
      switch (mod) {
        case "ctrl":
          return "Ctrl";
        case "alt":
          return "Alt";
        case "shift":
          return "Shift";
        case "meta":
          return "Win";
        default:
          return mod;
      }
    }
  }

  // Check if key is a wide key
  function isWideKey(key: string): boolean {
    return ["Space", "Enter", "Tab", "Backspace", "Delete"].includes(key);
  }
</script>

<div class="key-combo" class:small={size === "small"} class:large={size === "large"}>
  {#each sortedModifiers as mod, i}
    <kbd class="kbd modifier" class:pressable>{formatModifier(mod)}</kbd>
    {#if !isMac}
      <span class="separator">+</span>
    {/if}
  {/each}
  {#if resolvedParsed.key}
    <kbd
      class="kbd main-key"
      class:wide={isWideKey(resolvedParsed.key)}
      class:pressable
    >
      {formatKeyForDisplay(resolvedParsed.key, isMac)}
    </kbd>
  {/if}
</div>

<style>
  .key-combo {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }

  .separator {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.75em;
    margin: 0 1px;
  }

  /* Realistic keyboard key styling */
  .kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    padding: 0 8px;

    /* 3D keycap effect */
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.12) 0%,
      rgba(255, 255, 255, 0.05) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-bottom: 3px solid rgba(0, 0, 0, 0.3);
    border-radius: 6px;

    /* Text styling */
    font-family: "SF Mono", "Menlo", "Monaco", "Consolas", monospace;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    white-space: nowrap;

    /* Subtle shadow for depth */
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);

    transition: all 100ms ease;
  }

  /* Modifier keys - accent color */
  .kbd.modifier {
    background: linear-gradient(
      180deg,
      rgba(99, 102, 241, 0.2) 0%,
      rgba(99, 102, 241, 0.1) 100%
    );
    border-color: rgba(99, 102, 241, 0.3);
    color: rgba(167, 139, 250, 1);
  }

  /* Wide keys (Space, Enter, etc.) */
  .kbd.wide {
    min-width: 52px;
    padding: 0 12px;
  }

  /* Pressable key hover/active states */
  .kbd.pressable {
    cursor: pointer;
  }

  .kbd.pressable:hover {
    transform: translateY(-1px);
    box-shadow:
      0 3px 6px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .kbd.pressable:active {
    transform: translateY(1px);
    border-bottom-width: 1px;
    box-shadow:
      0 0 2px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(0, 0, 0, 0.1);
  }

  /* Size variants */
  .key-combo.small .kbd {
    min-width: 22px;
    height: 22px;
    padding: 0 5px;
    font-size: 10px;
    border-radius: 4px;
    border-bottom-width: 2px;
  }

  .key-combo.small .kbd.wide {
    min-width: 40px;
    padding: 0 8px;
  }

  .key-combo.large .kbd {
    min-width: 36px;
    height: 36px;
    padding: 0 12px;
    font-size: 14px;
    border-radius: 8px;
    border-bottom-width: 4px;
  }

  .key-combo.large .kbd.wide {
    min-width: 72px;
    padding: 0 16px;
  }
</style>
