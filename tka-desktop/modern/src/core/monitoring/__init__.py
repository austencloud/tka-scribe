"""
TKA Desktop Enhanced Monitoring Module

A+ Enhancement: Enterprise-grade performance monitoring with decorators,
context managers, and comprehensive metrics collection.

ARCHITECTURE: Provides enhanced performance monitoring that builds on the
existing monitoring.py with additional features for production observability.

EXPORTS:
- EnhancedPerformanceMonitor: Enhanced monitoring class
- enhanced_performance_monitor: Global enhanced monitor instance
- measure: Decorator for performance measurement
- PerformanceMetrics: Metrics data structure
"""

# Enhanced Performance Monitoring
from .performance_monitor import (
    EnhancedPerformanceMonitor,
    PerformanceMetrics,
    enhanced_performance_monitor,
    measure,
)

# Re-export legacy monitoring for compatibility
import importlib.util
import sys
import os

# Import the monitoring.py module specifically
monitoring_module_path = os.path.join(
    os.path.dirname(__file__), "..", "legacy_monitoring.py"
)
spec = importlib.util.spec_from_file_location(
    "legacy_monitoring", monitoring_module_path
)
if spec and spec.loader:
    legacy_monitoring = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(legacy_monitoring)
else:
    raise ImportError("Could not load legacy monitoring module")

# Re-export the functions
legacy_performance_monitor = legacy_monitoring.performance_monitor
monitor_performance = legacy_monitoring.monitor_performance
get_performance_report = legacy_monitoring.get_performance_report
clear_performance_data = legacy_monitoring.clear_performance_data
enable_performance_monitoring = legacy_monitoring.enable_performance_monitoring

__all__ = [
    "EnhancedPerformanceMonitor",
    "PerformanceMetrics",
    "enhanced_performance_monitor",
    "measure",
    # Legacy compatibility
    "legacy_performance_monitor",
    "monitor_performance",
    "get_performance_report",
    "clear_performance_data",
    "enable_performance_monitoring",
]
