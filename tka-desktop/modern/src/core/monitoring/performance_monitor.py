"""
Enhanced Performance monitoring system with decorators and context managers.
Builds on existing monitoring.py with enterprise-grade features.
"""

import time
import functools
from contextlib import contextmanager
from typing import Dict, List, Callable, Any, Optional
from dataclasses import dataclass, field
from collections import defaultdict
from datetime import datetime, timedelta
import threading
from pathlib import Path
import json

from core.types.result import Result

# Import existing monitoring for compatibility
import importlib.util
import os

monitoring_module_path = os.path.join(
    os.path.dirname(__file__), "..", "legacy_monitoring.py"
)
spec = importlib.util.spec_from_file_location(
    "legacy_monitoring", monitoring_module_path
)
if spec and spec.loader:
    legacy_monitoring_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(legacy_monitoring_module)
    legacy_monitor = legacy_monitoring_module.performance_monitor
else:
    raise ImportError("Could not load legacy monitoring module")


@dataclass
class PerformanceMetrics:
    """Metrics for a single operation."""

    operation_name: str
    total_calls: int = 0
    total_duration: float = 0.0
    min_duration: float = float("inf")
    max_duration: float = 0.0
    errors: int = 0
    last_called: Optional[datetime] = None
    durations: List[float] = field(default_factory=list)

    @property
    def average_duration(self) -> float:
        return self.total_duration / self.total_calls if self.total_calls > 0 else 0.0

    @property
    def error_rate(self) -> float:
        return self.errors / self.total_calls if self.total_calls > 0 else 0.0

    @property
    def p95_duration(self) -> float:
        if not self.durations:
            return 0.0
        sorted_durations = sorted(self.durations)
        index = int(0.95 * len(sorted_durations))
        return sorted_durations[index] if index < len(sorted_durations) else 0.0


class EnhancedPerformanceMonitor:
    """
    Thread-safe performance monitoring system.

    Usage:
        # As decorator
        @performance_monitor.measure("database_query")
        def query_database():
            # Database operation
            pass

        # As context manager
        with performance_monitor.measure("api_call"):
            # API operation
            pass
    """

    def __init__(self, max_duration_samples: int = 1000):
        self.metrics: Dict[str, PerformanceMetrics] = defaultdict(
            lambda: PerformanceMetrics("")
        )
        self.max_duration_samples = max_duration_samples
        self._lock = threading.Lock()
        self.start_time = datetime.now()

    @contextmanager
    def measure(self, operation_name: str):
        """Context manager for measuring operation performance."""
        start_time = time.perf_counter()
        start_datetime = datetime.now()

        try:
            yield
            duration = time.perf_counter() - start_time
            self._record_success(operation_name, duration, start_datetime)

        except Exception as e:
            duration = time.perf_counter() - start_time
            self._record_error(operation_name, duration, start_datetime, e)
            raise

    def measure_decorator(self, operation_name: Optional[str] = None):
        """Decorator for measuring function performance."""

        def decorator(func: Callable) -> Callable:
            name = operation_name or f"{func.__module__}.{func.__name__}"

            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                with self.measure(name):
                    return func(*args, **kwargs)

            return wrapper

        return decorator

    def _record_success(self, operation: str, duration: float, timestamp: datetime):
        """Record a successful operation."""
        with self._lock:
            metrics = self.metrics[operation]
            metrics.operation_name = operation
            metrics.total_calls += 1
            metrics.total_duration += duration
            metrics.min_duration = min(metrics.min_duration, duration)
            metrics.max_duration = max(metrics.max_duration, duration)
            metrics.last_called = timestamp

            # Keep limited sample of durations for percentile calculations
            metrics.durations.append(duration)
            if len(metrics.durations) > self.max_duration_samples:
                metrics.durations.pop(0)

            # Log slow operations
            if duration > 1.0:  # More than 1 second
                print(f"SLOW OPERATION: {operation} took {duration:.3f}s")

    def _record_error(
        self, operation: str, duration: float, timestamp: datetime, error: Exception
    ):
        """Record a failed operation."""
        with self._lock:
            metrics = self.metrics[operation]
            metrics.operation_name = operation
            metrics.total_calls += 1
            metrics.errors += 1
            metrics.total_duration += duration
            metrics.last_called = timestamp

            print(f"OPERATION FAILED: {operation} - {error}")

    def get_metrics(
        self, operation_name: Optional[str] = None
    ) -> Dict[str, Dict[str, Any]]:
        """Get performance metrics."""
        with self._lock:
            if operation_name:
                if operation_name in self.metrics:
                    return {
                        operation_name: self._metrics_to_dict(
                            self.metrics[operation_name]
                        )
                    }
                return {}

            return {
                name: self._metrics_to_dict(metrics)
                for name, metrics in self.metrics.items()
            }

    def _metrics_to_dict(self, metrics: PerformanceMetrics) -> Dict[str, Any]:
        """Convert metrics to dictionary."""
        return {
            "total_calls": metrics.total_calls,
            "total_duration": metrics.total_duration,
            "average_duration": metrics.average_duration,
            "min_duration": (
                metrics.min_duration if metrics.min_duration != float("inf") else 0
            ),
            "max_duration": metrics.max_duration,
            "p95_duration": metrics.p95_duration,
            "error_count": metrics.errors,
            "error_rate": metrics.error_rate,
            "last_called": (
                metrics.last_called.isoformat() if metrics.last_called else None
            ),
        }

    def get_summary_report(self) -> str:
        """Get a human-readable summary report."""
        with self._lock:
            uptime = datetime.now() - self.start_time

            report = [
                "=== Performance Monitor Summary ===",
                f"Uptime: {uptime}",
                f"Total Operations: {len(self.metrics)}",
                "",
            ]

            # Sort by total duration descending
            sorted_metrics = sorted(
                self.metrics.items(), key=lambda x: x[1].total_duration, reverse=True
            )

            for name, metrics in sorted_metrics[:10]:  # Top 10
                report.append(
                    f"{name:30} | "
                    f"Calls: {metrics.total_calls:6} | "
                    f"Avg: {metrics.average_duration:8.3f}s | "
                    f"Total: {metrics.total_duration:8.3f}s | "
                    f"Errors: {metrics.error_rate:6.1%}"
                )

            return "\n".join(report)

    def export_metrics(self, file_path: Path) -> Result[None, Exception]:
        """Export metrics to JSON file."""
        try:
            with self._lock:
                data = {
                    "timestamp": datetime.now().isoformat(),
                    "uptime_seconds": (
                        datetime.now() - self.start_time
                    ).total_seconds(),
                    "metrics": self.get_metrics(),
                }

            with open(file_path, "w") as f:
                json.dump(data, f, indent=2)

            return Result.ok(None)

        except Exception as e:
            return Result.error(e)

    def reset_metrics(self):
        """Reset all metrics."""
        with self._lock:
            self.metrics.clear()
            self.start_time = datetime.now()


# Global enhanced performance monitor instance
enhanced_performance_monitor = EnhancedPerformanceMonitor()

# Decorator alias for convenience
measure = enhanced_performance_monitor.measure_decorator
