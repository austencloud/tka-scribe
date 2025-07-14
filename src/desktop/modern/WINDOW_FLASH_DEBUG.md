# Window Flash Debug Guide

## Problem
Pictographs flash as separate windows when switching to the Advanced Start Position picker in the actual TKA application, but this issue doesn't reproduce in isolated tests.

## Diagnostic Tool

I've created a window flash monitor that you can integrate into your actual application to capture exactly what's happening.

### Step 1: Add the Monitor to Enhanced Start Position Picker

Edit `src/desktop/modern/src/presentation/components/start_position_picker/enhanced_start_position_picker.py`:

```python
# Add this import at the top
from debug.window_flash_monitor import start_monitoring, stop_monitoring

# Modify the _handle_variations_clicked method:
def _handle_variations_clicked(self):
    """Handle variations button click with window flash monitoring."""
    
    # START MONITORING BEFORE THE CRITICAL OPERATION
    print("🔍 Starting window flash monitoring...")
    start_monitoring(duration_ms=3000)  # Monitor for 3 seconds
    
    # Original code continues here...
    if not self.advanced_picker:
        self.advanced_picker = AdvancedStartPositionPicker(
            self.pool_manager, self.current_grid_mode
        )
        # ... rest of the original method
```

### Step 2: Run Your Application

1. Start your TKA application normally
2. Navigate to the start position picker
3. Click the "Variations" button
4. Watch the console output for real-time flash detection
5. After 3 seconds, you'll get a detailed report

### Step 3: Expected Output

If window flashing occurs, you'll see:
```
🚨 FLASH DETECTED at +45.2ms: 1 pictograph windows!
  Window 0: visible=True, size=PyQt6.QtCore.QSize(200, 200)

📊 WINDOW FLASH MONITOR REPORT
🚨 WINDOW FLASHING CONFIRMED!
🚨 3 flash events occurred:
...detailed analysis...
```

If no flashing occurs:
```
📊 WINDOW FLASH MONITOR REPORT
✅ NO WINDOW FLASHING DETECTED
```

### Step 4: Alternative Integration (If Above Doesn't Work)

If you can't modify the enhanced picker, you can manually start monitoring:

```python
# In your main application, before clicking variations:
from debug.window_flash_monitor import start_monitoring
start_monitoring(3000)
# Then click the variations button
```

### Step 5: Report Results

Please run this and share:
1. The complete console output from the monitor
2. Whether you see the actual window flashing visually
3. Any error messages or unexpected behavior

This will help me understand:
- **When** the flashing occurs (timing)
- **What type** of windows are flashing
- **How many** windows flash
- **Why** my isolated tests don't reproduce it

## Potential Fixes to Try

Based on the monitor results, I can then implement targeted fixes such as:

1. **Pool Initialization Timing**: Ensure pool is fully initialized before use
2. **Widget Parenting**: Force proper parenting during checkout
3. **Visibility Management**: Better control of component visibility
4. **Event Processing**: Adjust Qt event processing timing
5. **Window Flags**: Set proper window flags to prevent separate windows

## Next Steps

Once we have the diagnostic data, I can create a precise fix that addresses the actual root cause in your specific environment.
