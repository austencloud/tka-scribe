# E2E Test Strategy

## Current Status (2025-11-19)

### Test Suite Changes

- **Removed**: 7 E2E flow test files (~1,500 lines of test code)
- **Deleted Tests**:
  1. `tests/e2e/flows/1-construct-flow.spec.ts` (75 lines)
  2. `tests/e2e/flows/2-generate-flow.spec.ts` (96 lines)
  3. `tests/e2e/flows/3-share-export-flow.spec.ts` (99 lines)
  4. `tests/e2e/flows/4-advanced-start-position-flow.spec.ts`
  5. `tests/e2e/flows/5-learn-drills-flow.spec.ts`
  6. `tests/e2e/flows/6-library-save-reload-flow.spec.ts`
  7. `tests/e2e/flows/7-mobile-pwa-install-flow.spec.ts`

- **Also Removed**:
  - `tests/e2e/cap-executor-selection.spec.ts`
  - `tests/e2e/clear-sequence-navigation.spec.ts`
  - `tests/e2e/generate-card-layout.spec.ts`
  - `tests/e2e/hand-path-builder-integration.spec.ts`
  - `tests/e2e/navigation-dropdown.spec.ts`
  - `tests/e2e/sequence-actions-panel.spec.ts`
  - `tests/e2e/test-auth.spec.ts`
  - E2E documentation files

### Remaining Tests

- **Unit Tests**: 27 test files
- **Performance Tests**: 1 spec file
- **E2E Tests**: 0 files

## Impact Assessment

### Coverage Loss

The removal of E2E tests represents a significant loss in:

1. **User Journey Validation** - No automated testing of complete user workflows
2. **Integration Testing** - No verification of component interactions
3. **Regression Protection** - Risk of breaking critical user flows
4. **Cross-browser Testing** - No automated browser compatibility checks

### Critical Flows Without Coverage

1. **Create Module Flow** - Construct → Generate → Edit sequence
2. **Share/Export Flow** - Sequence export and sharing
3. **Library Management** - Save and reload sequences
4. **Authentication** - User login and profile management
5. **Mobile PWA** - Installation and mobile-specific features
6. **Learn Module** - Drills and educational features

## Recommended Strategy

### Option 1: Restore E2E Tests (Recommended for Production)

**When**: Before major releases or when stability is critical
**Effort**: High
**Steps**:

1. Restore deleted test files from git history
2. Update tests for Svelte 5 and current architecture
3. Integrate with CI/CD pipeline
4. Set up test environments

**Benefits**:

- Comprehensive coverage of user journeys
- Automated regression testing
- Confidence in releases

### Option 2: Implement Minimal E2E Suite (Recommended for Active Development)

**When**: For rapid development with essential coverage
**Effort**: Medium
**Steps**:

1. Create 3-5 critical path tests:
   - Happy path: Construct → Generate → Share
   - Authentication flow
   - Library save/load
   - Mobile responsive behavior
2. Focus on smoke tests, not comprehensive coverage
3. Run before releases only

**Benefits**:

- Balanced coverage vs maintenance
- Faster execution
- Covers critical user paths

### Option 3: Manual Testing Protocol (Current State)

**When**: For exploratory development or prototyping
**Effort**: Low initial, high ongoing
**Steps**:

1. Maintain manual testing checklist
2. Test before each release
3. Document test procedures

**Risks**:

- Human error
- Inconsistent coverage
- Time-consuming
- No CI/CD integration

## Implementation Plan

### Phase 1: Documentation (Completed)

- [x] Document current state
- [x] Identify coverage gaps
- [x] Define strategy options

### Phase 2: Decision Point

**Decision Needed**: Choose Option 1, 2, or 3 based on:

- Release timeline
- Team capacity
- Risk tolerance
- Product maturity

### Phase 3: Implementation (If Option 1 or 2 chosen)

1. Set up Playwright environment
2. Create test fixtures and helpers
3. Write priority tests
4. Integrate with CI/CD
5. Document test maintenance

## Test Infrastructure

### Current Tools

- **Framework**: Playwright (already installed)
- **Package Version**: Latest (updated to fix security issues)
- **Browser Support**: Chromium, Firefox, WebKit

### Required Setup

```bash
# Install Playwright browsers
npm run playwright:install

# Run tests (when restored)
npm run test:e2e
```

### Configuration

- Playwright config: `playwright.config.ts`
- Test directory: `tests/e2e/`
- Base URL: Configured in playwright.config.ts

## Maintenance Guidelines

### When Tests Should Be Updated

1. Major UI refactoring
2. User flow changes
3. New critical features
4. Before major releases

### Test Writing Standards

- Use page object model pattern
- Keep tests independent
- Test user journeys, not implementation
- Focus on critical paths
- Avoid brittle selectors

## Metrics to Track

### Coverage Metrics

- [ ] Number of critical user flows tested
- [ ] Test execution time
- [ ] Test flakiness rate
- [ ] Code coverage (if applicable)

### Health Metrics

- [ ] Passing test rate
- [ ] Time to fix failures
- [ ] Number of skipped tests

## Decision Log

| Date       | Decision              | Rationale                        | Impact                                  |
| ---------- | --------------------- | -------------------------------- | --------------------------------------- |
| 2025-11-19 | Removed all E2E tests | Unknown (requires investigation) | Loss of automated user journey coverage |
| 2025-11-19 | Strategy documented   | Establish testing approach       | Provides path forward                   |

## Next Steps

**Immediate Actions**:

1. Review git history to understand why E2E tests were removed
2. Decide on testing strategy (Option 1, 2, or 3)
3. If Option 1 or 2: Create implementation plan
4. If Option 3: Create manual testing checklist

**Long-term**:

- Establish test writing culture
- Integrate tests into development workflow
- Monitor test health and coverage
- Continuous improvement

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- Git history: `git log --all --full-history -- tests/e2e/`
