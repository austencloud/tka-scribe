# Onboarding System Plan

## Overview

Two-tier onboarding system:
1. **App-wide onboarding** (light) - Brief intro to modules on first login
2. **Per-module onboarding** (detailed) - Carousel explaining each module's tabs on first visit

---

## Phase 1: Simplify App-Wide Onboarding

**Goal:** Cut the current 7-step onboarding down to a quick 3-step intro

**Location:** `src/lib/shared/onboarding/`

### Steps:
1. Welcome to TKA Scribe (logo + tagline)
2. Module overview grid (show all 5 main modules with icons)
3. "Pick a module to start" - tap any to begin

### Changes needed:
- [ ] Simplify `OnboardingExperience.svelte` from 7 steps to 3
- [ ] Remove individual module detail steps (those move to per-module onboarding)
- [ ] Add module selection grid on final step
- [ ] On module tap → mark app onboarding complete + navigate to that module

---

## Phase 2: Create Reusable Module Onboarding Component

**Goal:** Extract the CreationMethodSelector pattern into a reusable base

**Location:** `src/lib/shared/onboarding/components/ModuleOnboarding.svelte`

### Props:
```typescript
interface ModuleOnboardingProps {
  moduleId: string;
  moduleName: string;
  moduleIcon: string;
  moduleColor: string;
  welcomeDescription: string;
  tabs: Array<{
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: string;
    color: string;
    features: string[];
    recommendation?: string;
  }>;
  onTabSelected: (tabId: string) => void;
  onSkip: () => void;
}
```

### Features (copied from CreationMethodSelector):
- Embla carousel with swipe support
- Progress bar
- Skip button
- Step dots with icons
- Keyboard navigation (arrows, Enter, number keys)
- Final "choice" step with animated buttons
- Haptic feedback
- Accessibility (ARIA labels, screen reader announcements)

### Storage:
- `tka-{moduleId}-onboarding-completed` - localStorage key per module
- Persistence service: `src/lib/shared/onboarding/services/`

---

## Phase 3: Implement Per-Module Onboarding

Each module gets its own onboarding configuration. Listed by priority:

### 3.1 Discover Module
**Tabs:** Gallery, Collections, Creators

| Step | Title | Subtitle | Description |
|------|-------|----------|-------------|
| Welcome | Welcome to Discover | Explore the TKA community | Browse sequences from flow artists worldwide, find inspiration, and save your favorites |
| Gallery | Gallery | Browse all sequences | See what the community has created. Filter by difficulty, prop type, or style. Tap any sequence to preview |
| Collections | Collections | Curated playlists | Themed collections organized by style, difficulty, or creator. Great for finding related sequences |
| Creators | Creators | Follow flow artists | Discover talented creators, follow their work, and get notified of new sequences |
| Choice | Start Exploring | Where would you like to begin? | [Gallery] [Collections] [Creators] |

### 3.2 Learn Module
**Tabs:** Concepts, Play, Codex

| Step | Title | Subtitle | Description |
|------|-------|----------|-------------|
| Welcome | Welcome to Learn | Master the Kinetic Alphabet | Interactive lessons and games to help you read and write TKA notation fluently |
| Concepts | Concepts | Structured learning path | Step-by-step lessons that build on each other. Start with the grid, progress to complex movements |
| Play | Play | Learn through games | Quiz games, matching challenges, and timed tests. Earn XP while having fun |
| Codex | Codex | Reference encyclopedia | Look up any pictograph, motion type, or position. Your TKA dictionary |
| Choice | Ready to Learn | Pick your starting point | [Concepts] [Play] [Codex] |

### 3.3 Compose Module
**Tabs:** Arrange, Browse

| Step | Title | Subtitle | Description |
|------|-------|----------|-------------|
| Welcome | Welcome to Compose | Bring sequences to life | Turn your sequences into smooth animations synced to music |
| Arrange | Arrange | Build compositions | Combine multiple sequences, set timing, add music, and create complete choreography pieces |
| Browse | Browse | Your compositions | View, edit, and export your saved compositions. Share videos with the community |
| Choice | Start Composing | What would you like to do? | [Arrange] [Browse] |

### 3.4 Train Module
**Tabs:** Practice, Challenges, Progress

| Step | Title | Subtitle | Description |
|------|-------|----------|-------------|
| Welcome | Welcome to Train | Practice makes perfect | Use your camera to practice sequences with real-time feedback and scoring |
| Practice | Practice | Free training | Pick any sequence and practice at your own pace. Adaptive, step-by-step, or timed modes |
| Challenges | Challenges | Structured goals | Daily and weekly challenges with XP rewards. Compete on leaderboards |
| Progress | Progress | Track improvement | See your stats, streaks, and skill progression over time |
| Choice | Start Training | Choose your mode | [Practice] [Challenges] [Progress] |

### 3.5 Library Module
**Tabs:** Sequences, Collections

| Step | Title | Subtitle | Description |
|------|-------|----------|-------------|
| Welcome | Welcome to Library | Your personal collection | All your saved sequences and collections in one place |
| Sequences | Sequences | Your creations | Sequences you've created or saved. Edit, organize, or share them |
| Collections | Collections | Organize your work | Group sequences into folders. Create playlists for practice or performance |
| Choice | Open Library | Where to? | [Sequences] [Collections] |

---

## Phase 4: Integration

### 4.1 Module Integration Pattern

Each module needs:
1. Import `ModuleOnboarding` component
2. Add state for `hasCompletedOnboarding`
3. Check localStorage on mount
4. Show onboarding if first time
5. On tab selection → mark complete + navigate

### 4.2 Files to modify:

| Module | File | Changes |
|--------|------|---------|
| Discover | `src/lib/features/discover/shared/components/DiscoverModule.svelte` | Add onboarding wrapper |
| Learn | `src/lib/features/learn/LearnModule.svelte` | Add onboarding wrapper |
| Compose | `src/lib/features/compose/ComposeModule.svelte` | Add onboarding wrapper |
| Train | `src/lib/features/train/components/TrainModule.svelte` | Add onboarding wrapper |
| Library | `src/lib/features/library/LibraryModule.svelte` | Add onboarding wrapper |

### 4.3 Navigation state additions:

Add to `navigation-state.svelte.ts`:
- `isModuleOnboardingVisible: boolean`
- `setModuleOnboardingVisible(moduleId, visible)`

---

## Phase 5: Test Routes

Create test routes for development:
- `/test/onboarding` - App-wide (already exists)
- `/test/onboarding/discover` - Discover module
- `/test/onboarding/learn` - Learn module
- `/test/onboarding/compose` - Compose module
- `/test/onboarding/train` - Train module
- `/test/onboarding/library` - Library module

---

## File Structure

```
src/lib/shared/onboarding/
├── components/
│   ├── OnboardingExperience.svelte      # App-wide (simplified)
│   └── ModuleOnboarding.svelte          # Reusable per-module
├── config/
│   ├── storage-keys.ts                  # All onboarding keys
│   └── module-onboarding-content.ts     # Content for each module
├── state/
│   └── onboarding-state.svelte.ts       # Unified state
└── index.ts
```

---

## Implementation Order

1. **[Phase 2]** Create `ModuleOnboarding.svelte` base component (extract from CreationMethodSelector)
2. **[Phase 3.1]** Implement Discover onboarding (most commonly visited after Create)
3. **[Phase 1]** Simplify app-wide onboarding (now that we have per-module)
4. **[Phase 3.2-3.5]** Implement remaining modules (Learn, Compose, Train, Library)
5. **[Phase 5]** Test routes

---

## Estimated Effort

| Phase | Est. Time | Priority |
|-------|-----------|----------|
| Phase 2 (Base component) | 2-3 hours | High |
| Phase 3.1 (Discover) | 1 hour | High |
| Phase 1 (Simplify app-wide) | 30 min | Medium |
| Phase 3.2-3.5 (Other modules) | 3-4 hours | Medium |
| Phase 5 (Test routes) | 30 min | Low |

**Total:** ~7-8 hours of implementation

---

## Open Questions

1. Should Settings/Feedback/Admin modules also have onboarding? (Probably not - power user features)
2. Should onboarding be re-playable from Settings? (Add "Replay tutorials" option?)
3. Should we track onboarding analytics? (Which step users drop off, skip rate)
