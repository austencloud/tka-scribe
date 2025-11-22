# Agent Task: Fix Unused Variables - Group 1 (About, Admin, Collect Modules)

## Your Assignment

Fix all unused variable errors in the **about**, **admin**, and **collect** modules.

## Files to Fix (15 files, ~14 errors)

### About Module

1. `src/lib/modules/about/components/CallToAction.svelte` - Line 26: error
2. `src/lib/modules/about/components/LandingNavBar.svelte` - Lines 12, 14: currentBackground, background
3. `src/lib/modules/about/components/SettingsModal.svelte` - Line 10: background
4. `src/lib/modules/about/components/contact/forms/ContactForm.svelte` - Line 27: field, value
5. `src/lib/modules/about/components/resources/ResourceCard.svelte` - Line 16: resource
6. `src/lib/modules/about/components/resources/ResourceGrid.svelte` - Line 20: resource
7. `src/lib/modules/about/components/tabs/OverviewTab.svelte` - Line 2: navigationState
8. `src/lib/modules/about/components/tabs/SupportTab.svelte` - Line 25: event

### Admin Module

9. `src/lib/modules/admin/components/ChallengeCalendar.svelte` - Lines 17, 18: date, challengeId
10. `src/lib/modules/admin/components/SequenceBrowser.svelte` - Line 18: sequence

### Collect Module

11. `src/lib/modules/collect/components/AchievementsSection.svelte` - Line 13: getLevelProgress
12. `src/lib/modules/collect/components/ChallengesSection.svelte` - Line 30: isCompact

## Instructions

Read AGENT-PROMPT-UNUSED-VARS.md for the fixing guidelines, then:

1. Fix ALL unused variable errors in these files
2. Follow the rules:
   - Truly unused: Remove completely
   - Required parameter not used: Prefix with underscore (error → \_error)
   - Unused destructured property: Remove or use rest syntax
   - Variables starting with \_ that are "assigned but never used": Add eslint-disable comment

## When Done

Report back with:

- ✅ Number of files fixed
- ✅ Number of errors resolved
- ❌ Any issues encountered
