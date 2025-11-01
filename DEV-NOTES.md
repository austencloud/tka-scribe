# TKA Development Notes

## Quick Commands

```bash
# Development
npm run dev                    # Start dev server
npm run dev:clean              # Clean build and restart
npm run dev:debug              # Dev server with Node debugger
npm run dev:turbo              # Force rebuild everything

# Testing
npm run test                   # Run unit tests
npm run flows                  # Run E2E flow tests
npm run flows:ui               # E2E tests with UI

# Code Quality
npm run lint                   # Check code style
npm run lint:fix               # Fix code style issues
npm run type-check             # Quick TypeScript check
npm run check                  # Full Svelte + TS check

# Analysis
npm run size                   # Visualize bundle size
npm run update:deps            # Interactive dependency updates

# Build & Deploy
npm run build                  # Production build
npm run preview                # Preview production build
```

## Development Tips

### HMR (Hot Module Replacement)
- **CSS changes**: Instant hot reload with state preservation
- **Component changes**: Fast hot reload (~100-200ms)
- **State file changes**: Full page reload (necessary for stability)

### Debugging
1. Use `$inspect(value)` in Svelte components to auto-log reactive changes
2. Press F5 in VS Code to start debugging with Chrome
3. Use Svelte DevTools browser extension for component inspection

### Performance
- Use `npm run size` to check bundle size before committing
- Check browser Performance tab for rendering bottlenecks
- Use `$derived` instead of `$:` for reactive computations in Svelte 5

### Common Issues

**Problem: HMR not working**
```bash
npm run dev:turbo  # Force Vite to rebuild
```

**Problem: TypeScript errors in editor**
```
Ctrl+Shift+P → "Svelte: Restart Language Server"
```

**Problem: Build artifacts causing issues**
```bash
npm run dev:clean  # Clean everything and restart
```

## Architecture Notes

### Module Structure
- `$lib/modules/build/` - Build module (construct, edit, share)
- `$lib/modules/learn/` - Learn module (drills, tutorials)
- `$lib/modules/explore/` - Explore module (browse, discover)
- `$lib/shared/` - Shared utilities and components

### State Management
- Using Svelte 5 runes (`$state`, `$derived`, `$effect`)
- Critical state files trigger full page reload on change
- Component-local state preferred over global when possible

## VS Code Tips
- Install recommended extensions (Ctrl+Shift+X → "Show Recommended Extensions")
- Use GitLens for powerful Git integration
- `pretty-ts-errors` makes TypeScript errors readable
- `import-cost` shows bundle impact of imports

---

Last updated: $(date)
