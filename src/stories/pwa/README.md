# PWA Installation Components - Storybook Documentation

This directory contains Storybook stories for all PWA installation-related components in TKA Studio.

## Overview

These components encourage users to install TKA as a Progressive Web App (PWA) for a better fullscreen experience. The components are organized into different tiers based on how aggressive/subtle they are:

### Components

1. **SubtleInstallBanner** (Tier 1 - Subtle)
   - Minimalist banner that slides from the top
   - Shows only after meaningful user engagement
   - Respects dismissal timing (7/30/90 days)
   - Located: `src/lib/shared/mobile/components/SubtleInstallBanner.svelte`

2. **MobileFullscreenPrompt** (Tier 2 - Direct)
   - Modal prompt encouraging PWA installation
   - Offers native install button or manual instructions
   - Configurable position (top/bottom/center)
   - Optional "nag mode" for persistent reminders
   - Located: `src/lib/shared/mobile/components/MobileFullscreenPrompt.svelte`

3. **PWAInstallGuide** (Information)
   - Device-specific installation instructions
   - Automatically detects platform and browser
   - Modal overlay with step-by-step guidance
   - Located: `src/lib/shared/mobile/components/PWAInstallGuide.svelte`

4. **EnhancedPWAInstallGuide** (Premium Information)
   - Polished version with glass morphism styling
   - Bottom sheet design with swipe affordance
   - Container-aware responsive layout
   - Compact mode for small screens
   - Located: `src/lib/shared/mobile/components/EnhancedPWAInstallGuide.svelte`

5. **InstallPromptButton** (Action Component)
   - Button component for triggering PWA installation
   - Adapts text based on native install availability
   - Used in settings/profile panels
   - Located: `src/lib/shared/navigation/components/InstallPromptButton.svelte`

## Running Storybook

To view these components in Storybook:

```bash
npm run storybook
```

This will start the Storybook dev server at `http://localhost:6006`

## Building the Stories

To build a static version of Storybook:

```bash
npm run build-storybook
```

## Using the Stories for Development

### Viewing Different States

Each component has multiple stories showing different states:
- **Visible/Hidden states** - To see the component in action vs default
- **Different positions** - For components with configurable positioning
- **Viewport variations** - Mobile, tablet, and desktop views
- **Feature variations** - Nag mode, native install, etc.

### Testing Responsive Behavior

Use Storybook's viewport toolbar to test different screen sizes:
- Mobile Portrait (375px)
- Mobile Landscape (667px)
- Tablet (768px)
- Desktop (1024px+)

### Improving the Components

As you mentioned wanting to make these components "a little better", here are some areas to consider:

#### Design Improvements
1. **Visual Polish**
   - Refine spacing and padding
   - Improve color scheme and contrast
   - Add animations and transitions
   - Enhance glass morphism effects

2. **Content**
   - Simplify copy and messaging
   - Add better iconography
   - Include platform-specific screenshots
   - Improve instruction clarity

3. **Interaction**
   - Add swipe-to-dismiss gestures
   - Improve button hover/active states
   - Add loading states
   - Enhance accessibility (ARIA labels, keyboard navigation)

#### Functional Improvements
1. **Smart Timing**
   - Better engagement detection
   - More intelligent auto-show logic
   - Improved dismissal tracking

2. **Platform Detection**
   - More accurate browser/device detection
   - Better fallback instructions
   - iOS Safari vs Chrome detection

3. **User Experience**
   - A/B test different prompts
   - Track conversion rates
   - Personalize based on user behavior

## Service Dependencies

Note: These components depend on several services that are mocked in Storybook:
- `IMobileFullscreenService` - Handles fullscreen and PWA installation
- `IPWAEngagementService` - Tracks user engagement
- `IPWAInstallDismissalService` - Manages dismissal timing
- `IHapticFeedbackService` - Provides haptic feedback

Some stories may not show interactive behavior in Storybook due to these service dependencies. Consider creating decorators or mock implementations if you need fully interactive stories.

## Creating Mock Implementations

To make stories more interactive, you can create mock service implementations:

```typescript
// Example decorator for mocking services
import { resolve, TYPES } from "$shared";

const withMockServices = () => {
  // Setup mock services
  const mockFullscreenService = {
    isPWA: () => false,
    canInstallPWA: () => true,
    promptInstallPWA: async () => true,
    // ... other methods
  };

  // Register mocks
  // ... implementation
};
```

## Storybook Addons Available

This project includes:
- `@storybook/addon-svelte-csf` - For Svelte CSF stories
- `@storybook/addon-docs` - Auto-generated documentation
- `@storybook/addon-a11y` - Accessibility testing
- `@storybook/addon-vitest` - Component testing
- `@chromatic-com/storybook` - Visual testing

Use the addon panels at the bottom of Storybook to:
- Check accessibility issues
- Test keyboard navigation
- View component props documentation
- Interact with controls

## Next Steps

1. **Run Storybook** and review each component
2. **Identify areas** for visual/UX improvements
3. **Make changes** to the component files
4. **Test in Storybook** to see changes live
5. **Document improvements** in the component stories

## Related Files

- Service contracts: `src/lib/shared/mobile/services/contracts/`
- Service implementations: `src/lib/shared/mobile/services/implementations/`
- Configuration: `src/lib/shared/mobile/config/pwa-install-instructions.ts`
- E2E test: `tests/e2e/flows/7-mobile-pwa-install-flow.spec.ts`
