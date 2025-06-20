"""
TKA Desktop Health Check & Metrics Module

A+ Enhancement: Production-ready health monitoring with comprehensive system
checks, metrics collection, and observability dashboard capabilities.

ARCHITECTURE: Provides health check framework with service monitoring,
system metrics collection, and dashboard endpoints for production observability.

EXPORTS:
- HealthChecker: Main health check coordinator
- HealthCheck: Individual health check interface
- SystemMetrics: System metrics collector
- MetricsDashboard: Metrics dashboard generator
- health_checker: Global health checker instance
"""

# Health Check Components
from .health_checker import (
    HealthChecker,
    HealthCheck,
    HealthStatus,
    HealthCheckResult,
    health_checker,
)

from .system_metrics import (
    SystemMetrics,
    MetricsCollector,
    system_metrics,
)

from .metrics_dashboard import (
    MetricsDashboard,
    DashboardData,
    metrics_dashboard,
)

from .builtin_checks import (
    DatabaseHealthCheck,
    ServiceHealthCheck,
    MemoryHealthCheck,
    DiskSpaceHealthCheck,
    EventBusHealthCheck,
)

__all__ = [
    "HealthChecker",
    "HealthCheck",
    "HealthStatus", 
    "HealthCheckResult",
    "health_checker",
    "SystemMetrics",
    "MetricsCollector",
    "system_metrics",
    "MetricsDashboard",
    "DashboardData",
    "metrics_dashboard",
    "DatabaseHealthCheck",
    "ServiceHealthCheck",
    "MemoryHealthCheck",
    "DiskSpaceHealthCheck",
    "EventBusHealthCheck",
]
