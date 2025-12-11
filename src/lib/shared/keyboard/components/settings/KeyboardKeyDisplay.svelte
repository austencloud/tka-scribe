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
    gap: 3px;
  }

  .separator {
    color: rgba(255, 255, 255, 0.3);
    font-size: 0.7em;
    margin: 0 1px;
    font-weight: 500;
  }

  /* 2026 Realistic keyboard key styling */
  .kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    padding: 0 9px;

    /* Enhanced 3D keycap effect */
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.14) 0%,
      rgba(255, 255, 255, 0.06) 50%,
      rgba(255, 255, 255, 0.04) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-bottom: 3px solid rgba(0, 0, 0, 0.35);
    border-radius: 7px;

    /* Text styling - modern mono */
    font-family: ui-monospace, "SF Mono", "Menlo", "Monaco", "Cascadia Code", monospace;
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.92);
    text-transform: uppercase;
    letter-spacing: 0.4px;
    white-space: nowrap;

    /* Enhanced depth effect */
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.25),
      0 1px 2px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      inset 0 -1px 0 rgba(0, 0, 0, 0.1);

    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Modifier keys - violet accent */
  .kbd.modifier {
    background: linear-gradient(
      180deg,
      rgba(139, 92, 246, 0.25) 0%,
      rgba(139, 92, 246, 0.15) 50%,
      rgba(139, 92, 246, 0.1) 100%
    );
    border-color: rgba(139, 92, 246, 0.35);
    border-bottom-color: rgba(109, 62, 216, 0.5);
    color: rgba(196, 181, 253, 1);
    box-shadow:
      0 2px 4px rgba(139, 92, 246, 0.2),
      0 1px 2px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  }

  /* Wide keys (Space, Enter, etc.) */
  .kbd.wide {
    min-width: 56px;
    padding: 0 14px;
    letter-spacing: 0.6px;
  }

  /* Pressable key hover/active states */
  .kbd.pressable {
    cursor: pointer;
  }

  .kbd.pressable:hover {
    transform: translateY(-2px);
    box-shadow:
      0 6px 12px rgba(0, 0, 0, 0.3),
      0 2px 4px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .kbd.pressable:active {
    transform: translateY(1px);
    border-bottom-width: 1px;
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.2),
      inset 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .kbd.modifier.pressable:hover {
    box-shadow:
      0 6px 16px rgba(139, 92, 246, 0.35),
      0 2px 4px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  /* Size variants */
  .key-combo.small .kbd {
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    font-size: 9px;
    border-radius: 5px;
    border-bottom-width: 2px;
    font-weight: 600;
  }

  .key-combo.small .separator {
    font-size: 0.6em;
  }

  .key-combo.small .kbd.wide {
    min-width: 42px;
    padding: 0 9px;
  }

  .key-combo.large .kbd {
    min-width: 38px;
    height: 38px;
    padding: 0 14px;
    font-size: 14px;
    border-radius: 9px;
    border-bottom-width: 4px;
  }

  .key-combo.large .kbd.wide {
    min-width: 76px;
    padding: 0 18px;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .kbd {
      transition: none;
    }

    .kbd.pressable:hover,
    .kbd.pressable:active {
      transform: none;
    }
  }
</style>
