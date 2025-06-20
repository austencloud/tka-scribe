"""
Built-in health checks for common TKA Desktop components.
"""

import psutil
import sqlite3
from pathlib import Path
from typing import Optional, Any

from .health_checker import HealthCheck, HealthCheckResult, HealthStatus
from core.events import IEventBus


class DatabaseHealthCheck(HealthCheck):
    """Health check for database connectivity."""
    
    def __init__(self, db_path: Optional[Path] = None, name: str = "database"):
        super().__init__(name)
        self.db_path = db_path or Path("tka.db")
    
    async def check_health(self) -> HealthCheckResult:
        """Check database connectivity and basic operations."""
        try:
            # Test database connection
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Test basic query
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                
                if result and result[0] == 1:
                    # Get database info
                    cursor.execute("PRAGMA database_list")
                    db_info = cursor.fetchall()
                    
                    # Get table count
                    cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
                    table_count = cursor.fetchone()[0]
                    
                    return HealthCheckResult(
                        name=self.name,
                        status=HealthStatus.HEALTHY,
                        message="Database is accessible and responsive",
                        details={
                            'db_path': str(self.db_path),
                            'table_count': table_count,
                            'db_size_bytes': self.db_path.stat().st_size if self.db_path.exists() else 0
                        }
                    )
                else:
                    return HealthCheckResult(
                        name=self.name,
                        status=HealthStatus.UNHEALTHY,
                        message="Database query returned unexpected result",
                        details={'db_path': str(self.db_path)}
                    )
                    
        except sqlite3.Error as e:
            return HealthCheckResult(
                name=self.name,
                status=HealthStatus.UNHEALTHY,
                message=f"Database error: {str(e)}",
                details={'db_path': str(self.db_path), 'error': str(e)}
            )
        except Exception as e:
            return HealthCheckResult(
                name=self.name,
                status=HealthStatus.UNHEALTHY,
                message=f"Unexpected database error: {str(e)}",
                details={'db_path': str(self.db_path), 'error': str(e)}
            )


class MemoryHealthCheck(HealthCheck):
    """Health check for system memory usage."""
    
    def __init__(self, warning_threshold: float = 80.0, critical_threshold: float = 95.0, 
                 name: str = "memory"):
        super().__init__(name)
        self.warning_threshold = warning_threshold
        self.critical_threshold = critical_threshold
    
    async def check_health(self) -> HealthCheckResult:
        """Check system memory usage."""
        try:
            memory = psutil.virtual_memory()
            usage_percent = memory.percent
            
            # Determine status based on thresholds
            if usage_percent >= self.critical_threshold:
                status = HealthStatus.UNHEALTHY
                message = f"Critical memory usage: {usage_percent:.1f}%"
            elif usage_percent >= self.warning_threshold:
                status = HealthStatus.DEGRADED
                message = f"High memory usage: {usage_percent:.1f}%"
            else:
                status = HealthStatus.HEALTHY
                message = f"Memory usage normal: {usage_percent:.1f}%"
            
            return HealthCheckResult(
                name=self.name,
                status=status,
                message=message,
                details={
                    'usage_percent': usage_percent,
                    'total_gb': round(memory.total / (1024**3), 2),
                    'available_gb': round(memory.available / (1024**3), 2),
                    'used_gb': round(memory.used / (1024**3), 2),
                    'warning_threshold': self.warning_threshold,
                    'critical_threshold': self.critical_threshold
                }
            )
            
        except Exception as e:
            return HealthCheckResult(
                name=self.name,
                status=HealthStatus.UNHEALTHY,
                message=f"Failed to check memory: {str(e)}",
                details={'error': str(e)}
            )


class DiskSpaceHealthCheck(HealthCheck):
    """Health check for disk space usage."""
    
    def __init__(self, path: Optional[Path] = None, warning_threshold: float = 80.0, 
                 critical_threshold: float = 95.0, name: str = "disk_space"):
        super().__init__(name)
        self.path = path or Path.cwd()
        self.warning_threshold = warning_threshold
        self.critical_threshold = critical_threshold
    
    async def check_health(self) -> HealthCheckResult:
        """Check disk space usage."""
        try:
            disk_usage = psutil.disk_usage(self.path)
            usage_percent = (disk_usage.used / disk_usage.total) * 100
            
            # Determine status based on thresholds
            if usage_percent >= self.critical_threshold:
                status = HealthStatus.UNHEALTHY
                message = f"Critical disk usage: {usage_percent:.1f}%"
            elif usage_percent >= self.warning_threshold:
                status = HealthStatus.DEGRADED
                message = f"High disk usage: {usage_percent:.1f}%"
            else:
                status = HealthStatus.HEALTHY
                message = f"Disk usage normal: {usage_percent:.1f}%"
            
            return HealthCheckResult(
                name=self.name,
                status=status,
                message=message,
                details={
                    'path': str(self.path),
                    'usage_percent': round(usage_percent, 1),
                    'total_gb': round(disk_usage.total / (1024**3), 2),
                    'free_gb': round(disk_usage.free / (1024**3), 2),
                    'used_gb': round(disk_usage.used / (1024**3), 2),
                    'warning_threshold': self.warning_threshold,
                    'critical_threshold': self.critical_threshold
                }
            )
            
        except Exception as e:
            return HealthCheckResult(
                name=self.name,
                status=HealthStatus.UNHEALTHY,
                message=f"Failed to check disk space: {str(e)}",
                details={'path': str(self.path), 'error': str(e)}
            )


class ServiceHealthCheck(HealthCheck):
    """Generic health check for service availability."""
    
    def __init__(self, service_name: str, check_function: callable, name: str = None):
        super().__init__(name or f"service_{service_name}")
        self.service_name = service_name
        self.check_function = check_function
    
    async def check_health(self) -> HealthCheckResult:
        """Check service health using provided function."""
        try:
            # Call the service check function
            is_healthy = await self.check_function() if asyncio.iscoroutinefunction(self.check_function) else self.check_function()
            
            if is_healthy:
                return HealthCheckResult(
                    name=self.name,
                    status=HealthStatus.HEALTHY,
                    message=f"Service '{self.service_name}' is healthy",
                    details={'service_name': self.service_name}
                )
            else:
                return HealthCheckResult(
                    name=self.name,
                    status=HealthStatus.UNHEALTHY,
                    message=f"Service '{self.service_name}' is not healthy",
                    details={'service_name': self.service_name}
                )
                
        except Exception as e:
            return HealthCheckResult(
                name=self.name,
                status=HealthStatus.UNHEALTHY,
                message=f"Service '{self.service_name}' check failed: {str(e)}",
                details={'service_name': self.service_name, 'error': str(e)}
            )


class EventBusHealthCheck(HealthCheck):
    """Health check for event bus functionality."""
    
    def __init__(self, event_bus: Optional[IEventBus] = None, name: str = "event_bus"):
        super().__init__(name)
        self.event_bus = event_bus
    
    async def check_health(self) -> HealthCheckResult:
        """Check event bus health."""
        try:
            if self.event_bus is None:
                return HealthCheckResult(
                    name=self.name,
                    status=HealthStatus.DEGRADED,
                    message="Event bus not configured",
                    details={'configured': False}
                )
            
            # Test basic event bus functionality
            # This is a simplified check - in practice you might want to test
            # actual event publishing/subscribing
            subscriber_count = getattr(self.event_bus, 'subscriber_count', 0)
            
            return HealthCheckResult(
                name=self.name,
                status=HealthStatus.HEALTHY,
                message="Event bus is operational",
                details={
                    'configured': True,
                    'subscriber_count': subscriber_count,
                    'event_bus_type': type(self.event_bus).__name__
                }
            )
            
        except Exception as e:
            return HealthCheckResult(
                name=self.name,
                status=HealthStatus.UNHEALTHY,
                message=f"Event bus check failed: {str(e)}",
                details={'error': str(e)}
            )


class ComponentHealthCheck(HealthCheck):
    """Health check for TKA Desktop components."""
    
    def __init__(self, component_name: str, component_instance: Any, name: str = None):
        super().__init__(name or f"component_{component_name}")
        self.component_name = component_name
        self.component_instance = component_instance
    
    async def check_health(self) -> HealthCheckResult:
        """Check component health."""
        try:
            # Check if component has a health check method
            if hasattr(self.component_instance, 'health_check'):
                result = self.component_instance.health_check()
                if asyncio.iscoroutinefunction(self.component_instance.health_check):
                    result = await result
                
                if result:
                    return HealthCheckResult(
                        name=self.name,
                        status=HealthStatus.HEALTHY,
                        message=f"Component '{self.component_name}' is healthy",
                        details={'component_name': self.component_name}
                    )
                else:
                    return HealthCheckResult(
                        name=self.name,
                        status=HealthStatus.UNHEALTHY,
                        message=f"Component '{self.component_name}' health check failed",
                        details={'component_name': self.component_name}
                    )
            
            # Basic check - component exists and is not None
            if self.component_instance is not None:
                return HealthCheckResult(
                    name=self.name,
                    status=HealthStatus.HEALTHY,
                    message=f"Component '{self.component_name}' is available",
                    details={
                        'component_name': self.component_name,
                        'component_type': type(self.component_instance).__name__
                    }
                )
            else:
                return HealthCheckResult(
                    name=self.name,
                    status=HealthStatus.UNHEALTHY,
                    message=f"Component '{self.component_name}' is not available",
                    details={'component_name': self.component_name}
                )
                
        except Exception as e:
            return HealthCheckResult(
                name=self.name,
                status=HealthStatus.UNHEALTHY,
                message=f"Component '{self.component_name}' check failed: {str(e)}",
                details={'component_name': self.component_name, 'error': str(e)}
            )
