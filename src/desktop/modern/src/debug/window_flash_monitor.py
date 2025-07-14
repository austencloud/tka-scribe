"""
Window Flash Monitor - A diagnostic tool to detect and analyze window flashing
in the actual TKA application.

Usage: Import this module and call start_monitoring() before switching to advanced picker.
"""

import time
import logging
from typing import List, Dict, Any
from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import QTimer

logger = logging.getLogger(__name__)

class WindowFlashMonitor:
    """Monitor for detecting pictograph component window flashing."""
    
    def __init__(self):
        self.monitoring = False
        self.events: List[Dict[str, Any]] = []
        self.timer: QTimer = None
        self.start_time: float = 0
        self.baseline_windows: int = 0
        
    def start_monitoring(self, duration_ms: int = 2000):
        """Start monitoring for window flashing events."""
        if self.monitoring:
            return
            
        print("🔍 Starting Window Flash Monitor...")
        self.monitoring = True
        self.events.clear()
        self.start_time = time.time()
        
        # Get baseline window count
        app = QApplication.instance()
        if app:
            self.baseline_windows = len(app.topLevelWidgets())
            print(f"📊 Baseline: {self.baseline_windows} top-level windows")
        
        # Set up monitoring timer
        self.timer = QTimer()
        self.timer.timeout.connect(self._check_windows)
        self.timer.start(5)  # Check every 5ms for high sensitivity
        
        # Auto-stop after duration
        QTimer.singleShot(duration_ms, self.stop_monitoring)
        
    def stop_monitoring(self):
        """Stop monitoring and report results."""
        if not self.monitoring:
            return
            
        self.monitoring = False
        if self.timer:
            self.timer.stop()
            self.timer = None
            
        self._report_results()
        
    def _check_windows(self):
        """Check for pictograph component windows."""
        if not self.monitoring:
            return
            
        app = QApplication.instance()
        if not app:
            return
            
        current_time = time.time()
        relative_time = (current_time - self.start_time) * 1000  # Convert to ms
        
        windows = app.topLevelWidgets()
        total_count = len(windows)
        
        # Look for pictograph components as top-level windows
        pictograph_windows = []
        for window in windows:
            window_type = str(type(window))
            if "PictographComponent" in window_type:
                pictograph_windows.append({
                    'type': window_type,
                    'visible': window.isVisible(),
                    'size': window.size(),
                    'parent': window.parent(),
                    'window_title': window.windowTitle() if hasattr(window, 'windowTitle') else 'N/A'
                })
        
        # Record event if pictograph windows detected
        if pictograph_windows:
            event = {
                'time_ms': relative_time,
                'total_windows': total_count,
                'pictograph_count': len(pictograph_windows),
                'pictograph_details': pictograph_windows
            }
            self.events.append(event)
            
            # Real-time alert
            print(f"🚨 FLASH DETECTED at +{relative_time:.1f}ms: {len(pictograph_windows)} pictograph windows!")
            for i, details in enumerate(pictograph_windows):
                print(f"  Window {i}: visible={details['visible']}, size={details['size']}")
    
    def _report_results(self):
        """Generate detailed report of monitoring results."""
        print("\n" + "=" * 80)
        print("📊 WINDOW FLASH MONITOR REPORT")
        print("=" * 80)
        
        total_duration = (time.time() - self.start_time) * 1000
        print(f"Monitoring duration: {total_duration:.1f}ms")
        print(f"Flash events detected: {len(self.events)}")
        
        if self.events:
            print(f"\n🚨 WINDOW FLASHING CONFIRMED!")
            print(f"🚨 {len(self.events)} flash events occurred:")
            
            for i, event in enumerate(self.events):
                print(f"\nEvent {i+1} at +{event['time_ms']:.1f}ms:")
                print(f"  Total windows: {event['total_windows']}")
                print(f"  Pictograph windows: {event['pictograph_count']}")
                
                for j, details in enumerate(event['pictograph_details']):
                    print(f"    Pictograph {j+1}:")
                    print(f"      Type: {details['type']}")
                    print(f"      Visible: {details['visible']}")
                    print(f"      Size: {details['size']}")
                    print(f"      Parent: {details['parent']}")
                    print(f"      Title: {details['window_title']}")
            
            # Analysis
            first_flash = self.events[0]['time_ms']
            last_flash = self.events[-1]['time_ms']
            flash_duration = last_flash - first_flash
            
            print(f"\n📈 ANALYSIS:")
            print(f"First flash: +{first_flash:.1f}ms")
            print(f"Last flash: +{last_flash:.1f}ms")
            print(f"Flash duration: {flash_duration:.1f}ms")
            print(f"Average flashes per second: {len(self.events) / (flash_duration / 1000):.1f}")
            
        else:
            print(f"\n✅ NO WINDOW FLASHING DETECTED")
            print(f"✅ No pictograph components appeared as separate windows")
        
        print("=" * 80)

# Global monitor instance
_monitor = WindowFlashMonitor()

def start_monitoring(duration_ms: int = 2000):
    """Start monitoring for window flashing (call before switching to advanced picker)."""
    _monitor.start_monitoring(duration_ms)

def stop_monitoring():
    """Stop monitoring and get report."""
    _monitor.stop_monitoring()

def get_monitor():
    """Get the monitor instance for advanced usage."""
    return _monitor
