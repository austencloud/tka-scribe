# Window Flashing Fix Documentation

## Issue Description
When switching to the Advanced Start Position picker, pictograph components were appearing as separate windows that flashed one by one before being properly contained. This created a poor user experience with visual glitches.

## Root Cause
The issue was caused by a combination of factors:
1. **Layout spacing and margins**: Components were being positioned with spacing that caused layout issues
2. **Pool size**: Insufficient pool size (50) for the number of components needed
3. **Size constraints**: Maximum size limits were preventing proper component sizing

## Solution Implemented

### 1. Layout Optimization
**File**: `src/desktop/modern/src/presentation/components/start_position_picker/advanced_start_position_picker.py`

- **Removed spacing**: Set `layout.setSpacing(0)` and `positions_layout.setSpacing(0)`
- **Removed margins**: Set `positions_layout.setContentsMargins(0, 0, 0, 0)`
- **Removed size limits**: Removed `size = min(size, 150)` constraint

### 2. Pool Size Increase
**File**: `src/desktop/modern/src/application/services/pictograph_pool_manager.py`

- **Increased pool size**: Changed from 50 to 100 components to ensure sufficient availability

### 3. Layout-First Approach
**File**: `src/desktop/modern/src/presentation/components/start_position_picker/start_position_option.py`

- **Add to layout first**: Components are added to their parent layout immediately after creation
- **Update data second**: Pictograph data is loaded only after proper containment
- **Proper visibility**: Components are made visible after data loading

## Key Changes Made

```python
# Layout spacing removed
layout.setSpacing(0)
self.positions_layout.setSpacing(0)
self.positions_layout.setContentsMargins(0, 0, 0, 0)

# Pool size increased
self._pool_size = 100

# Layout-first approach in StartPositionOption
layout.addWidget(self._pictograph_component)  # Add to layout FIRST
self._pictograph_component.update_from_pictograph_data(pictograph_data)  # Then update
self._pictograph_component.setVisible(True)  # Finally make visible
```

## Regression Prevention

### Automated Tests
Created comprehensive regression tests in:
`src/desktop/modern/tests/regression/test_advanced_picker_no_window_flashing.py`

These tests verify:
- No pictograph components appear as top-level windows during advanced picker creation
- Enhanced picker → advanced picker transition doesn't create window flashing
- All pictograph components are properly contained within their parent widgets
- Pool operations never create top-level pictograph windows

### Test Runner
Use `src/desktop/modern/run_regression_tests.py` to verify the fix remains effective.

## Verification
Run the regression tests to confirm the fix:
```bash
cd src/desktop/modern
python run_regression_tests.py
```

Expected output:
```
✅ ALL REGRESSION TESTS PASSED!
✅ Window flashing issue is confirmed fixed!
```

## Impact
- **User Experience**: Smooth transition to advanced picker without visual glitches
- **Performance**: Proper component reuse through optimized pool management
- **Reliability**: Regression tests prevent the issue from reoccurring
- **Maintainability**: Clear documentation of the fix for future reference

## Future Considerations
- Monitor pool usage to ensure 100 components is sufficient for all use cases
- Consider implementing pool size auto-adjustment based on demand
- Keep regression tests updated if picker architecture changes
