# TKA Testing Strategy Analysis

**Date:** 2025-10-22
**Analyst:** Claude (AI Assistant)
**Current Coverage:** ~40% (16 test files)

---

## Executive Summary

This document provides a comprehensive analysis of the TKA codebase testing landscape, categorizing all services and modules by **testing confidence level** and identifying which areas require domain-specific knowledge about The Kinetic Alphabet notation system.

### Key Metrics

| Metric | Count | Percentage |
|--------|-------|------------|
| **Total Service Implementations** | ~100 | 100% |
| **HIGH Confidence (Can Test Immediately)** | ~60 | 60% |
| **MEDIUM Confidence (Light Domain Knowledge)** | ~25 | 25% |
| **LOW Confidence (Deep Domain Knowledge)** | ~15 | 15% |
| **Current Test Coverage** | ~40 | 40% |

---

## Testing Confidence Levels

### 🟢 HIGH CONFIDENCE - Can Test Immediately (60 services)

These services use general software engineering patterns and don't require deep domain knowledge.

#### **Infrastructure Services** (10 services)
- ✅ **Already Tested:**
  - `DexiePersistenceService` - 744 lines of tests
  - `HMRStateRecovery` - 449 lines
  - `SequenceCoreState` - 615 lines
  - `DI Container` - 370 lines

- 🎯 **Ready to Test:**
  - `FilterPersistenceService` - Save/load filter state
  - `PersistenceInitializationService` - Database initialization
  - `StorageService` - LocalStorage wrapper
  - `ErrorHandlingService` - Error tracking & reporting
  - `ResourceTracker` - Resource management
  - `ComponentManagementService` - Component lifecycle

**Testing Approach:** Standard unit tests with mocks. No domain knowledge required.

---

#### **Utility Services** (15 services)
- `FileDownloadService` - File save/download
- `SeoService` - SEO meta tags
- `SvgImageService` - SVG loading/caching
- `SimpleJsonCache` - JSON caching
- `SvgPreloadService` - SVG preloading
- `DataTransformationService` - Data serialization
- `FilenameGeneratorService` - Filename creation
- `ImageFormatConverterService` - Image conversion
- `SVGToCanvasConverterService` - SVG → Canvas
- `CanvasManagementService` - Canvas operations
- `DimensionCalculationService` - Size calculations
- `ImageCompositionService` - Image composition
- `ViewportCalculator` - Viewport math
- `HoverController` - Hover state management
- `DataTransformer` - Generic data transforms

**Testing Approach:** Unit tests with minimal mocking. Pure functions ideal for testing.

---

#### **Device & Viewport Services** (5 services)
- `DeviceDetector` - Device type detection
- `ViewportService` - Viewport dimensions
- `FoldableDeviceDetection` - Foldable screen detection
- `HapticFeedbackService` - Haptic feedback (already has mocks)
- `MobileFullscreenService` - PWA fullscreen detection

**Testing Approach:** Mock browser APIs (window, navigator, screen). Test different device profiles.

---

#### **Background Animation Services** (8 services)
- `BackgroundManager` - Background switching
- `BackgroundRenderingService` - Canvas rendering
- `BackgroundService` - Background coordination
- `BackgroundConfigurationService` - Config management
- `BackgroundFactory` - Background instantiation
- `PerformanceTracker` - Performance monitoring
- `ShootingStarSystem` - Shooting star animation
- `StarfieldBackgroundSystem` - Starfield rendering

**Testing Approach:** Mock canvas, test state transitions, verify performance thresholds.

---

#### **Navigation Services** (3 services)
- `KeyboardNavigationService` - Keyboard shortcuts
- `ModuleSelectionService` - Module routing
- `ViewportService` (navigation) - Scroll management

**Testing Approach:** Mock DOM events, test keyboard bindings, verify navigation state.

---

#### **Rendering Utilities** (10 services)
- `ArrowPathResolver` - SVG path resolution
- `ArrowSvgLoader` - Arrow SVG loading
- `ArrowSvgParser` - SVG parsing
- `ArrowSvgColorTransformer` - SVG color transformation
- `PropSvgLoader` - Prop SVG loading
- `GridRenderingService` - Grid rendering
- `NightSkyCalculationService` - Night sky math
- `LayoutCalculationService` - Layout calculations
- `TextRenderingService` - Text rendering
- `FontManagementService` - Font loading

**Testing Approach:** Mock SVG/Canvas APIs, test transformations, verify output.

---

### 🟡 MEDIUM CONFIDENCE - Light Domain Knowledge Required (25 services)

These services implement TKA-specific logic but are straightforward to test with basic understanding.

#### **Grid Services** (3 services)
- `GridModeDeriver` - Determine grid mode (Box/Diamond)
- `GridPositionDeriver` - Calculate grid positions
- `GridRenderingService` - Render grid overlay

**Domain Knowledge Needed:**
- Grid modes: Box vs. Diamond
- Grid positions: Alpha, Beta, Gamma, etc.
- 9x9 grid structure

**Testing Approach:** Create test cases for known grid positions/modes. Use factories for grid data.

---

#### **Animation Services** (2 services)
- `AnimationService` - Sequence animation playback
- `SequenceRenderService` - Sequence rendering

**Domain Knowledge Needed:**
- Beat progression
- Animation timing
- Sequence structure

**Testing Approach:** Test beat navigation, playback controls, timing. Mock rendering.

---

#### **CAP Generation** (3 services)
- ✅ **Already Tested:**
  - `CAPExecutor` - Partial tests (212 lines)

- 🎯 **Ready to Test:**
  - `CircularPatternGenerator` - Generate circular patterns
  - `CAPValidator` - Validate CAP sequences

**Domain Knowledge Needed:**
- CAP = Circular Alternating Pattern
- HALVED and QUARTERED modes
- Position rotation rules

**Testing Approach:** Test known CAP sequences, verify rotations, validate outputs.

---

#### **Build Module Services** (5 services)
- `BuildTabService` - Build tab coordination
- `SequenceService` - Sequence operations
- `BeatService` - Beat operations
- `MotionService` - Motion editing
- `SequenceLifecycleManager` - Sequence lifecycle

**Domain Knowledge Needed:**
- Sequence structure (beats, motions)
- Beat numbering
- Valid motion types

**Testing Approach:** Use test factories, verify CRUD operations, test state transitions.

---

#### **Gallery Services** (3 services)
- `GalleryLoader` - Gallery data loading
- `GalleryFilterService` - Filtering sequences
- `GallerySortService` - Sorting sequences

**Domain Knowledge Needed:**
- Sequence metadata (level, tags, author)
- Filter criteria
- Sort order preferences

**Testing Approach:** Test filtering/sorting with varied test data. Verify query logic.

---

#### **Settings Services** (2 services)
- `SettingsService` - Settings management
- `ThemeService` - Theme switching

**Domain Knowledge Needed:**
- Available settings options
- Theme structure

**Testing Approach:** Test get/set operations, verify persistence, test defaults.

---

#### **Arrow Positioning Services** (7 services)
- `ArrowDataProcessor` - Process arrow data
- `ArrowCoordinateTransformer` - Transform coordinates
- `ArrowGridCoordinateService` - Grid coordinate mapping
- `ArrowLifecycleManager` - Arrow lifecycle
- `ArrowQuadrantCalculator` - Quadrant calculation
- `ArrowAdjustmentProcessor` - Arrow adjustments
- `ArrowPositioningOrchestrator` - Coordinate positioning

**Domain Knowledge Needed:**
- Arrow coordinate system
- Grid quadrants
- Arrow types (static, shift, dash)

**Testing Approach:** Test coordinate transformations, verify quadrant logic, validate positions.

---

### 🔴 LOW CONFIDENCE - Deep Domain Knowledge Required (15 services)

These services implement core TKA notation rules and require expert knowledge to test correctly.

#### **TKA Glyph & Letter Services** (4 services)
- `LetterDeriver` - Derive letter from motion
- `LetterQueryHandler` - Letter queries
- `LetterGHHandler` - G & H letter logic
- `LetterIHandler` - I letter logic
- `LetterYZHandler` - Y & Z letter logic

**Domain Knowledge Needed:**
- ⚠️ **TKA alphabet rules**
- ⚠️ **Letter-to-motion mappings**
- ⚠️ **Special letter behaviors**
- ⚠️ **Glyph rendering rules**

**Why Low Confidence:** Requires understanding of TKA notation system, which is domain-specific. Would need expert validation for test cases.

---

#### **Prop Orientation Services** (5 services)
- `OrientationCalculator` - Calculate prop orientations
- `OrientationChecker` - Validate orientations
- `BetaPropDirectionCalculator` - Beta orientation
- `DefaultPropPositioner` - Prop positioning
- `PropRotAngleManager` - Rotation angles

**Domain Knowledge Needed:**
- ⚠️ **Prop types** (fans, poi, staff, etc.)
- ⚠️ **Orientation rules** per prop type
- ⚠️ **Beta vs. Alpha orientations**
- ⚠️ **Rotation angle conventions**

**Why Low Confidence:** Orientation rules are prop-specific and depend on physical constraints of flow arts props.

---

#### **Motion Handler Services** (3 services)
- `ShiftMotionHandler` - Shift motion logic
- `StaticDashMotionHandler` - Static/Dash motion
- `BetaDetectionService` - Beta position detection

**Domain Knowledge Needed:**
- ⚠️ **Motion types** (Pro, Contra, Spin, Shift, Dash, Static)
- ⚠️ **Motion semantics** and valid transitions
- ⚠️ **Beta detection rules**

**Why Low Confidence:** Motion semantics are core to TKA notation and require choreography knowledge.

---

#### **Arrow Calculation Services** (3 services)
- `ArrowLocationCalculator` - Arrow position calculation
- `ArrowLocationService` - Arrow location logic
- `ArrowRotationCalculator` - Arrow rotation
- `ArrowAdjustmentCalculator` - Arrow adjustments
- `DashLocationCalculator` - Dash arrow locations
- `StaticLocationCalculator` - Static arrow locations
- `ShiftLocationCalculator` - Shift arrow locations
- `DirectionalTupleProcessor` - Direction tuples

**Domain Knowledge Needed:**
- ⚠️ **Arrow placement rules**
- ⚠️ **Rotation semantics**
- ⚠️ **Motion-specific arrow types**
- ⚠️ **Directional tuples**

**Why Low Confidence:** Arrow positioning depends on motion semantics and TKA visual language rules.

---

## Testing Strategy & Priorities

### Phase 1: Expand HIGH Confidence Coverage (Week 1-2)

**Goal:** Increase coverage to 60%

**Priorities:**
1. **Infrastructure Services** - Critical path, pure logic
   - Add tests for `ErrorHandlingService`
   - Add tests for `ResourceTracker`
   - Add tests for `ComponentManagementService`

2. **Utility Services** - High value, easy wins
   - Test `FileDownloadService`
   - Test `SeoService`
   - Test `SvgImageService`
   - Test `DataTransformationService`

3. **Device Services** - Mobile support critical
   - Test `DeviceDetector`
   - Test `ViewportService`
   - Test `FoldableDeviceDetection`

**Expected Test Count:** +20 test suites

---

### Phase 2: MEDIUM Confidence with Guidance (Week 3-4)

**Goal:** Increase coverage to 75%

**Priorities:**
1. **Grid Services** (need validation)
   - Create grid position test cases → **Need:** Grid position examples
   - Test grid mode derivation → **Need:** Mode derivation rules

2. **CAP Generation** (expand existing)
   - Expand CAP tests → **Need:** More CAP examples
   - Test edge cases → **Need:** Invalid CAP cases

3. **Build Module Services**
   - Test sequence CRUD → **Use existing factories**
   - Test beat operations → **Use existing factories**

**Expected Test Count:** +15 test suites

**Required from You:** Sample data, validation rules, edge case examples

---

### Phase 3: Component & Integration Tests (Week 5-6)

**Goal:** Increase coverage to 85%

**Priorities:**
1. **Component Tests** (Svelte Testing Library)
   - Test base components (buttons, cards, modals)
   - Test shared UI components
   - Test module-specific components

2. **Integration Tests**
   - Test service interactions
   - Test module workflows
   - Test state management flows

3. **E2E Tests** (Playwright)
   - Expand from 6 to 20+ tests
   - Test full user workflows
   - Test mobile scenarios

**Expected Test Count:** +25 test suites

---

### Phase 4: LOW Confidence with Expert Validation (Week 7-8)

**Goal:** Increase coverage to 90%+

**Approach:** Test-Driven with Expert Review

**Process:**
1. I write tests based on documentation/code analysis
2. You review tests for correctness
3. We iterate until tests are accurate
4. Tests serve as documentation

**Priorities:**
1. **TKA Glyph Services**
   - Test letter derivation → **Need:** Letter derivation rules
   - Test special letters → **Need:** G, H, I, Y, Z examples

2. **Prop Orientation Services**
   - Test orientation calculations → **Need:** Orientation rules
   - Test prop-specific logic → **Need:** Prop behavior specs

3. **Motion Handler Services**
   - Test motion semantics → **Need:** Motion type definitions
   - Test motion transitions → **Need:** Valid/invalid transitions

**Expected Test Count:** +15 test suites

**Required from You:** Expert validation, domain specifications, edge case examples

---

## Test Infrastructure Assessment

### ✅ Excellent Foundation Already Established

**What's Good:**
- **Factory Pattern:** Comprehensive test data factories
- **Mock Services:** Well-designed mocks for services
- **Test Setup:** Browser API mocks, test database utilities
- **Vitest Config:** Proper test categorization (unit/integration/debug)
- **Playwright Config:** Multi-browser E2E testing
- **Performance Tests:** Performance assertions in tests

**What's Missing:**
- **Component Tests:** Limited Svelte component testing
- **Visual Regression:** No visual testing for pictograph rendering
- **Accessibility Tests:** No a11y testing
- **Load Tests:** No large sequence performance tests
- **Contract Tests:** No interface/contract tests for services

---

## Recommended Test Additions

### 1. Component Snapshot Tests
```typescript
// tests/unit/components/BaseCard.test.ts
import { render } from '@testing-library/svelte';
import BaseCard from '$shared/components/BaseCard.svelte';

describe('BaseCard', () => {
  it('should match snapshot', () => {
    const { container } = render(BaseCard, {
      props: { title: 'Test' }
    });
    expect(container).toMatchSnapshot();
  });
});
```

### 2. Visual Regression Tests (Playwright)
```typescript
// tests/e2e/visual/pictograph-rendering.spec.ts
test('pictograph renders correctly', async ({ page }) => {
  await page.goto('/build');
  // Load test sequence
  await expect(page).toHaveScreenshot('pictograph-basic.png');
});
```

### 3. Accessibility Tests
```typescript
// tests/e2e/a11y/navigation.spec.ts
import { injectAxe, checkA11y } from 'axe-playwright';

test('navigation is accessible', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page);
});
```

### 4. Performance/Load Tests
```typescript
// tests/performance/large-sequences.test.ts
describe('Large Sequence Performance', () => {
  it('should render 1000-beat sequence in < 2s', async () => {
    const sequence = createLargeSequence(1000);
    const start = performance.now();
    await renderSequence(sequence);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(2000);
  });
});
```

### 5. Contract/Interface Tests
```typescript
// tests/integration/service-contracts.test.ts
describe('Service Contracts', () => {
  it('all persistence services implement IPersistenceService', () => {
    const service = resolve<IPersistenceService>(TYPES.IPersistenceService);

    // Verify interface compliance
    expect(typeof service.initialize).toBe('function');
    expect(typeof service.saveSequence).toBe('function');
    expect(typeof service.loadSequence).toBe('function');
    // ... all interface methods
  });
});
```

---

## Testing Tools & Libraries Needed

### Already Available ✅
- Vitest (unit/integration)
- Playwright (E2E)
- @testing-library/svelte (component testing)
- @testing-library/user-event (user simulation)
- jsdom (DOM environment)

### Recommended Additions 🎯
```bash
# Visual regression testing
npm install -D playwright-expect

# Accessibility testing
npm install -D axe-playwright @axe-core/playwright

# Component snapshot testing (already available in Vitest)
# Performance testing (already available)

# Mock service workers (API mocking)
npm install -D msw

# Test coverage reporting
npm install -D @vitest/coverage-v8
```

---

## Risk Assessment

### 🚨 Critical Gaps (High Risk)

1. **Pictograph Rendering** - Core feature, 0% test coverage
   - **Risk:** Visual bugs in production
   - **Mitigation:** Visual regression tests + manual QA

2. **CAP Generation** - Limited test coverage
   - **Risk:** Incorrect sequence generation
   - **Mitigation:** Expand test cases, add validation

3. **Motion Semantics** - Untested
   - **Risk:** Invalid motions accepted
   - **Mitigation:** Domain expert validation of test cases

### ⚠️ Medium Gaps (Medium Risk)

1. **Component Integration** - Limited testing
   - **Risk:** UI bugs, broken interactions
   - **Mitigation:** Component integration tests

2. **Mobile Features** - Limited testing
   - **Risk:** Mobile-specific bugs
   - **Mitigation:** Mobile E2E tests

3. **Error Handling** - Untested
   - **Risk:** Poor error messages, crashes
   - **Mitigation:** Error scenario tests

### ✅ Well-Covered (Low Risk)

1. **DI Container** - Comprehensive tests
2. **Persistence Layer** - Comprehensive tests
3. **State Management** - Comprehensive tests

---

## Collaboration Model

### For HIGH Confidence Areas
**My Role:** Write tests independently
**Your Role:** Review PRs, approve
**Timeline:** Fast (1-2 weeks)

### For MEDIUM Confidence Areas
**My Role:** Write tests, ask clarifying questions
**Your Role:** Provide examples, validate edge cases
**Timeline:** Moderate (2-3 weeks)

### For LOW Confidence Areas
**My Role:** Draft tests based on code analysis
**Your Role:** Expert review, provide specifications
**Timeline:** Slower (3-4 weeks with iterations)

---

## Next Steps - Decision Points

### Option 1: Rapid Infrastructure Coverage
**Focus:** HIGH confidence areas
**Goal:** 60% coverage in 2 weeks
**Pros:** Fast wins, reduce risk in critical paths
**Cons:** Doesn't test domain-specific logic

### Option 2: Feature-Focused Testing
**Focus:** Specific module (e.g., Build, Gallery)
**Goal:** 90% coverage of one module
**Pros:** Complete coverage of one area
**Cons:** Slower overall progress

### Option 3: Risk-Based Testing
**Focus:** Critical gaps (pictograph, CAP, motion)
**Goal:** Cover highest-risk areas first
**Pros:** Reduces production risk
**Cons:** Requires more domain knowledge upfront

### Option 4: Balanced Approach (RECOMMENDED)
**Week 1-2:** HIGH confidence infrastructure (30 tests)
**Week 3-4:** MEDIUM confidence with guidance (15 tests)
**Week 5-6:** Component & E2E tests (25 tests)
**Week 7-8:** LOW confidence with expert validation (15 tests)
**Total:** 85+ new test suites, 85%+ coverage

---

## Questions for You

1. **Which option do you prefer?** (1, 2, 3, or 4)

2. **Domain Knowledge:** Can you provide:
   - TKA alphabet documentation?
   - Motion type definitions?
   - CAP generation rules?
   - Grid position specifications?
   - Prop orientation rules?

3. **Priorities:** Which areas concern you most?
   - Pictograph rendering bugs?
   - CAP generation correctness?
   - Mobile functionality?
   - Performance issues?
   - Data integrity?

4. **Review Capacity:** How much time can you dedicate to:
   - Reviewing test PRs? (hours/week)
   - Providing domain expertise? (hours/week)
   - Validating test cases? (hours/week)

5. **Testing Tools:** Should I add:
   - Visual regression testing?
   - Accessibility testing?
   - Performance benchmarking?
   - API contract testing?

---

## Conclusion

You have a **well-architected codebase** with **excellent testing patterns** already established. The test infrastructure is solid, and factories/mocks are professional-grade.

**I can confidently write tests for ~60% of the codebase immediately** without needing domain knowledge. For the remaining 40%, I'll need varying levels of guidance:
- **25%** (MEDIUM) - Light guidance, examples, edge cases
- **15%** (LOW) - Expert validation, domain specs, iterative review

The biggest value-add will be:
1. **Expanding infrastructure test coverage** (high confidence, fast)
2. **Adding component tests** (good ROI, improves UI stability)
3. **Expanding E2E tests** (6 → 20+, catches integration bugs)
4. **Adding domain-specific tests with your guidance** (highest value, requires collaboration)

**Ready to start when you are!** Just let me know which option you prefer and I'll begin writing tests.

---

**Document Version:** 1.0
**Last Updated:** 2025-10-22
**Next Review:** After Phase 1 completion
