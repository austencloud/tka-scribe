# Keyboard Shortcuts System

A comprehensive, accessible keyboard shortcut system for TKA Studio built with Svelte 5, InversifyJS, and following WCAG 2.1 guidelines.

## 🎯 Features

- **Global keyboard shortcuts** for navigation and common actions
- **Context-aware shortcuts** that adapt to the current module
- **Command Palette** (Cmd/Ctrl+K) for fuzzy search and quick access
- **Shortcuts Help Dialog** (Cmd/Ctrl+/) showing all available shortcuts
- **Accessibility compliant** (WCAG 2.1.4 - single-key shortcuts configurable)
- **Cross-platform support** (Mac, Windows, Linux)
- **Service-based architecture** with dependency injection
- **Extensible** - easy to add new shortcuts

## 📋 Architecture

### Directory Structure

```
src/lib/shared/keyboard/
├── domain/
│   ├── models/
│   │   ├── Shortcut.ts              # Shortcut domain model
│   │   └── KeyboardEvent.ts         # Normalized keyboard event
│   └── types/
│       └── keyboard-types.ts        # Type definitions
├── services/
│   ├── contracts/
│   │   ├── IKeyboardShortcutService.ts
│   │   ├── IShortcutRegistryService.ts
│   │   └── ICommandPaletteService.ts
│   └── implementations/
│       ├── KeyboardShortcutService.ts
│       ├── ShortcutRegistryService.ts
│       └── CommandPaletteService.ts
├── state/
│   ├── keyboard-shortcut-state.svelte.ts  # Global state
│   └── command-palette-state.svelte.ts    # Palette state
├── components/
│   ├── CommandPalette.svelte              # Command palette UI
│   └── ShortcutsHelp.svelte               # Help dialog UI
├── coordinators/
│   └── KeyboardShortcutCoordinator.svelte # Initialization
└── utils/
    ├── register-global-shortcuts.ts       # Global shortcuts
    ├── register-commands.ts               # Command registration
    └── register-create-shortcuts.ts       # CREATE module shortcuts
```

### Service Layer

The keyboard shortcut system uses **InversifyJS** for dependency injection:

- **KeyboardShortcutService**: Main service for registering and handling shortcuts
- **ShortcutRegistryService**: Registry for storing and querying shortcuts
- **CommandPaletteService**: Manages command palette commands and search

### State Management

Uses **Svelte 5 runes** for reactive state:

- **keyboardShortcutState**: Global shortcut settings and context
- **commandPaletteState**: Command palette UI state

## 🚀 Current Shortcuts

### Global Shortcuts (Available Everywhere)

| Shortcut | Action | Description |
|----------|--------|-------------|
| `?` | Show Keyboard Shortcuts | Display all available shortcuts (Gmail-style) |
| `Esc` | Close Modal/Panel | Close the current overlay |
| `1` | Switch to CREATE | Navigate to CREATE module |
| `2` | Switch to EXPLORE | Navigate to EXPLORE module |
| `3` | Switch to LEARN | Navigate to LEARN module |
| `4` | Switch to COLLECT | Navigate to COLLECT module |
| `5` | Switch to ANIMATE | Navigate to ANIMATE module |

**Note**: Single-key shortcuts (?, 1-5) only work when not typing in an input field. This follows the Gmail/Notion pattern and avoids conflicts with browser shortcuts.

### CREATE Module Shortcuts

**Animation Control**
| Shortcut | Action | Status |
|----------|--------|--------|
| `Space` | Play/Pause Animation | ⏳ Needs integration |

**Beat Grid Navigation**
| Shortcut | Action | Status |
|----------|--------|--------|
| `↑` | Navigate up in grid | ⏳ Needs integration |
| `↓` | Navigate down in grid | ⏳ Needs integration |
| `←` | Navigate left in grid | ⏳ Needs integration |
| `→` | Navigate right in grid | ⏳ Needs integration |

**Edit Panel (when open)**
| Shortcut | Action | Status |
|----------|--------|--------|
| `←` | Previous beat | ⏳ Needs integration |
| `→` | Next beat | ⏳ Needs integration |
| `Enter` | Accept changes & close | ⏳ Needs integration |
| `[` | Decrease value | ⏳ Needs integration |
| `]` | Increase value | ⏳ Needs integration |

**Sequence Management**
| Shortcut | Action | Status |
|----------|--------|--------|
| `Ctrl+S` | Save sequence | ⏳ Needs integration |
| `+` | Add beat | ⏳ Needs integration |
| `Backspace` | Delete selected beat | ✅ Working |

**Integration guide**: See [INTEGRATING_CREATE_SHORTCUTS.md](docs/INTEGRATING_CREATE_SHORTCUTS.md)

## 🔧 How to Add New Shortcuts

### Option 1: Register in a Component

```typescript
import { onMount } from "svelte";
import { resolve, TYPES } from "$shared/inversify";
import type { IKeyboardShortcutService } from "$shared/keyboard/services/contracts";

onMount(async () => {
  const shortcutService = await resolve<IKeyboardShortcutService>(
    TYPES.IKeyboardShortcutService
  );

  // Register a shortcut
  const unregister = shortcutService.register({
    id: "create.play-sequence",
    label: "Play sequence",
    description: "Play the current sequence animation",
    key: "Space",
    modifiers: [], // Single-key shortcut
    context: "create", // Only active in CREATE module
    scope: "action",
    priority: "high",
    condition: () => {
      // Only enable if a sequence exists
      return sequenceExists();
    },
    action: () => {
      playSequence();
    },
  });

  // Cleanup on component unmount
  return () => {
    unregister();
  };
});
```

### Option 2: Add to Global Shortcuts

Edit `src/lib/shared/keyboard/utils/register-global-shortcuts.ts`:

```typescript
service.register({
  id: "create.save-sequence",
  label: "Save sequence",
  description: "Save the current sequence",
  key: "s",
  modifiers: ["ctrl"],
  context: "create",
  scope: "action",
  priority: "high",
  action: () => {
    saveSequence();
  },
});
```

### Option 3: Add to Command Palette

Edit `src/lib/shared/keyboard/utils/register-commands.ts`:

```typescript
service.registerCommand({
  id: "sequence.export",
  label: "Export Sequence",
  description: "Export the current sequence as GIF or video",
  icon: "fa-download",
  category: "Actions",
  shortcut: state.isMac ? "⌘E" : "Ctrl+E",
  keywords: ["export", "download", "save", "gif", "video"],
  available: sequenceExists(),
  action: () => {
    openExportDialog();
    state.closeCommandPalette();
  },
});
```

## 📖 API Reference

### ShortcutRegistrationOptions

```typescript
interface ShortcutRegistrationOptions {
  id: string;                    // Unique identifier
  label: string;                 // Human-readable label
  description?: string;          // Description for help dialog
  key: string;                   // Key to press ("k", "Enter", "ArrowLeft", etc.)
  modifiers?: KeyModifier[];     // ["ctrl", "alt", "shift", "meta"]
  context?: ShortcutContext;     // "global" | "create" | "explore" | etc.
  scope?: ShortcutScope;         // "navigation" | "action" | "editing" | etc.
  priority?: ShortcutPriority;   // "low" | "medium" | "high" | "critical"
  preventDefault?: boolean;      // Prevent default browser behavior (default: true)
  stopPropagation?: boolean;     // Stop event propagation (default: false)
  condition?: () => boolean;     // Optional condition to enable/disable
  action: (event: KeyboardEvent) => void | Promise<void>;
  enabled?: boolean;             // Whether shortcut is enabled (default: true)
}
```

### Shortcut Contexts

- `global` - Active anywhere in the app
- `create` - Active in CREATE module
- `explore` - Active in EXPLORE module
- `learn` - Active in LEARN module
- `collect` - Active in COLLECT module
- `animate` - Active in ANIMATE module
- `admin` - Active in ADMIN module
- `edit-panel` - Active when Edit panel is open
- `animation-panel` - Active when Animation panel is open
- `share-panel` - Active when Share panel is open
- `modal` - Active when any modal is open
- `command-palette` - Active when command palette is open

### Shortcut Scopes

- `navigation` - Navigation shortcuts (module switching, tab switching)
- `action` - Action shortcuts (play, save, share)
- `editing` - Editing shortcuts (undo, redo, delete)
- `panel` - Panel management (open, close, navigate)
- `focus` - Focus management (regions, inputs)
- `help` - Help and information

## 🎨 Styling

The Command Palette and Shortcuts Help dialog use CSS custom properties for theming:

```css
--background: #1e1e1e
--background-secondary: #2a2a2a
--background-tertiary: #333
--border-color: #333
--text-primary: #fff
--text-secondary: #888
```

Override these in your global styles to customize the appearance.

## ♿ Accessibility

### WCAG 2.1.4 Compliance

Single-key shortcuts can be disabled in settings to comply with WCAG 2.1.4:

```typescript
import { keyboardShortcutState } from "$shared/keyboard/state";

// Disable single-key shortcuts
keyboardShortcutState.updateSettings({
  enableSingleKeyShortcuts: false,
});
```

### Screen Reader Support

- All interactive elements have proper ARIA labels
- Keyboard navigation follows logical tab order
- Focus is managed correctly in modals
- Announcements for important state changes

### Focus Management

- Focus trap in modals (Esc to exit)
- Visible focus indicators
- Skip-to-main-content support

## 🧪 Testing

To test keyboard shortcuts:

1. **Manual Testing**:
   - Open the app
   - Press `Cmd/Ctrl+K` to open command palette
   - Press `Cmd/Ctrl+/` to view all shortcuts
   - Try navigating with `Cmd/Ctrl+1-5`

2. **Unit Testing** (TODO):
   ```typescript
   // Test shortcut matching
   import { Shortcut } from "$shared/keyboard/domain/models/Shortcut";

   test("shortcut matches key combination", () => {
     const shortcut = new Shortcut({
       id: "test",
       label: "Test",
       key: "k",
       modifiers: ["ctrl"],
       // ... other props
     });

     expect(shortcut.matches("k", ["ctrl"], true)).toBe(true);
     expect(shortcut.matches("k", [], false)).toBe(false);
   });
   ```

## 🔮 Future Enhancements

### Priority 1: CREATE Module Integration
- [x] Register CREATE module shortcuts (DONE)
- [ ] Integrate Space for play/pause (needs animation service update)
- [ ] Integrate Ctrl+S for save (needs persistence implementation)
- [ ] Integrate arrow keys for beat grid navigation
- [ ] Integrate arrow keys for edit panel navigation
- [ ] Integrate Enter for accepting edit changes
- [ ] Integrate +/Backspace for beat management
- [ ] Add undo/redo shortcuts (`Ctrl+Z`, `Ctrl+Shift+Z`)
- [ ] Add CREATE tab switching (`Alt+1-5` or similar)

### Priority 2: Navigation Shortcuts
- [ ] `J` `K` - Navigate grid (Vim-style) in EXPLORE
- [ ] `Tab` - Focus next element
- [ ] `Shift+Tab` - Focus previous element

### Priority 3: Advanced Features
- [ ] Custom key binding editor
- [ ] Shortcut cheat sheet overlay
- [ ] Shortcut achievements/tips
- [ ] Import/export custom bindings
- [ ] Shortcut recording mode

## 💡 Best Practices

1. **Use Modifiers**: Avoid single-key shortcuts except for essential actions like Space (play/pause)
2. **Be Contextual**: Use the `context` and `condition` options to make shortcuts context-aware
3. **Provide Feedback**: Show visual feedback when a shortcut is activated
4. **Document Everything**: Add clear labels and descriptions for the help dialog
5. **Test Cross-Platform**: Shortcuts should work on Mac, Windows, and Linux
6. **Respect User Preferences**: Check settings before executing single-key shortcuts

## 🐛 Troubleshooting

### Shortcuts not working?

1. Check the browser console for errors
2. Verify the keyboard service is initialized: `⌨️ KeyboardShortcutService initialized`
3. Check if you're in an input field (single-key shortcuts are disabled)
4. Verify the shortcut context matches the current module

### Command palette not opening?

1. Check that `Cmd/Ctrl+K` is not intercepted by the browser
2. Verify `commandPaletteState.isOpen` is updating
3. Check browser console for service resolution errors

### Shortcuts conflicting with browser?

Use `preventDefault: true` in the shortcut registration to prevent default browser behavior.

## 📚 Resources

- [WCAG 2.1.4: Character Key Shortcuts](https://www.w3.org/WAI/WCAG21/Understanding/character-key-shortcuts.html)
- [Keyboard Shortcuts Best Practices](https://www.nngroup.com/articles/ui-copy/)
- [InversifyJS Documentation](https://inversify.io/)
- [Svelte 5 Runes](https://svelte-5-preview.vercel.app/docs/runes)

## 👥 Contributing

When adding new shortcuts:

1. Follow the existing patterns
2. Add documentation in this file
3. Test on multiple platforms
4. Consider accessibility implications
5. Add to the command palette if relevant

---

**Version**: 1.0.0
**Last Updated**: 2025
**Maintainer**: TKA Studio Team
