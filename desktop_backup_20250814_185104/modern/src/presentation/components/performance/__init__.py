"""
Performance UI Components

Qt-based user interface components for performance monitoring and visualization.
Integrates with the main TKA application interface and provides real-time
performance insights.

COMPONENTS:
- monitor_widget: Live performance monitoring widget
- profiler_dialog: Profiler configuration and control dialog
- metrics_overlay: Performance metrics overlay for debugging

INTEGRATION:
- Follows existing presentation layer patterns
- Uses Qt resource management
- Integrates with existing UI components
- Provides non-intrusive performance monitoring
"""

from .monitor_widget import PerformanceMonitorWidget
from .profiler_dialog import ProfilerControlDialog

__all__ = [
    "PerformanceMonitorWidget",
    "ProfilerControlDialog",
]
