"""
Health check system for production monitoring.
"""

import asyncio
import time
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum

from core.types.result import Result
from core.logging.structured_logger import get_logger, LogContext

logger = get_logger(__name__)


class HealthStatus(Enum):
    """Health check status enumeration."""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"


@dataclass
class HealthCheckResult:
    """Result of a health check operation."""
    name: str
    status: HealthStatus
    message: str = ""
    details: Dict[str, Any] = field(default_factory=dict)
    duration_ms: float = 0.0
    timestamp: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            'name': self.name,
            'status': self.status.value,
            'message': self.message,
            'details': self.details,
            'duration_ms': self.duration_ms,
            'timestamp': self.timestamp.isoformat() + 'Z'
        }


class HealthCheck(ABC):
    """
    Abstract base class for health checks.
    
    Implement this interface to create custom health checks
    for different system components.
    """
    
    def __init__(self, name: str, timeout_seconds: float = 30.0):
        self.name = name
        self.timeout_seconds = timeout_seconds
    
    @abstractmethod
    async def check_health(self) -> HealthCheckResult:
        """
        Perform the health check.
        
        Returns:
            HealthCheckResult with status and details
        """
        pass
    
    async def run_with_timeout(self) -> HealthCheckResult:
        """Run health check with timeout protection."""
        start_time = time.perf_counter()
        
        try:
            # Run with timeout
            result = await asyncio.wait_for(
                self.check_health(),
                timeout=self.timeout_seconds
            )
            
            # Calculate duration
            duration_ms = (time.perf_counter() - start_time) * 1000
            result.duration_ms = duration_ms
            
            return result
            
        except asyncio.TimeoutError:
            duration_ms = (time.perf_counter() - start_time) * 1000
            return HealthCheckResult(
                name=self.name,
                status=HealthStatus.UNHEALTHY,
                message=f"Health check timed out after {self.timeout_seconds}s",
                duration_ms=duration_ms,
                details={'timeout': True, 'timeout_seconds': self.timeout_seconds}
            )
        except Exception as e:
            duration_ms = (time.perf_counter() - start_time) * 1000
            return HealthCheckResult(
                name=self.name,
                status=HealthStatus.UNHEALTHY,
                message=f"Health check failed: {str(e)}",
                duration_ms=duration_ms,
                details={'error': str(e), 'error_type': type(e).__name__}
            )


class HealthChecker:
    """
    Central health check coordinator.
    
    Manages multiple health checks and provides overall system health status.
    """
    
    def __init__(self):
        self.health_checks: Dict[str, HealthCheck] = {}
        self.last_check_results: Dict[str, HealthCheckResult] = {}
        self.start_time = datetime.utcnow()
        
        logger.info(
            "Health checker initialized",
            context=LogContext(
                operation="health_checker_init",
                component="health_checker"
            )
        )
    
    def register_check(self, health_check: HealthCheck):
        """
        Register a health check.
        
        Args:
            health_check: HealthCheck instance to register
        """
        self.health_checks[health_check.name] = health_check
        
        logger.info(
            "Health check registered",
            context=LogContext(
                operation="health_check_register",
                component="health_checker"
            ),
            check_name=health_check.name,
            timeout_seconds=health_check.timeout_seconds
        )
    
    def unregister_check(self, name: str):
        """Remove a health check by name."""
        if name in self.health_checks:
            del self.health_checks[name]
            if name in self.last_check_results:
                del self.last_check_results[name]
            
            logger.info(
                "Health check unregistered",
                context=LogContext(
                    operation="health_check_unregister",
                    component="health_checker"
                ),
                check_name=name
            )
    
    async def run_all_checks(self) -> Dict[str, HealthCheckResult]:
        """
        Run all registered health checks.
        
        Returns:
            Dictionary of check results by name
        """
        if not self.health_checks:
            logger.warning(
                "No health checks registered",
                context=LogContext(
                    operation="health_check_warning",
                    component="health_checker"
                )
            )
            return {}
        
        logger.info(
            "Running all health checks",
            context=LogContext(
                operation="health_check_run_all",
                component="health_checker"
            ),
            check_count=len(self.health_checks)
        )
        
        # Run all checks concurrently
        tasks = [
            health_check.run_with_timeout()
            for health_check in self.health_checks.values()
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        check_results = {}
        for i, result in enumerate(results):
            check_name = list(self.health_checks.keys())[i]
            
            if isinstance(result, Exception):
                # Handle unexpected exceptions
                check_results[check_name] = HealthCheckResult(
                    name=check_name,
                    status=HealthStatus.UNHEALTHY,
                    message=f"Unexpected error: {str(result)}",
                    details={'error': str(result), 'error_type': type(result).__name__}
                )
            else:
                check_results[check_name] = result
        
        # Store results for future reference
        self.last_check_results = check_results
        
        # Log summary
        healthy_count = sum(1 for r in check_results.values() if r.status == HealthStatus.HEALTHY)
        total_count = len(check_results)
        
        logger.info(
            "Health checks completed",
            context=LogContext(
                operation="health_check_completed",
                component="health_checker"
            ),
            healthy_count=healthy_count,
            total_count=total_count,
            overall_healthy=healthy_count == total_count
        )
        
        return check_results
    
    async def run_single_check(self, name: str) -> Result[HealthCheckResult, Exception]:
        """
        Run a single health check by name.
        
        Args:
            name: Name of the health check to run
            
        Returns:
            Result containing health check result or error
        """
        if name not in self.health_checks:
            return Result.error(ValueError(f"Health check '{name}' not found"))
        
        try:
            result = await self.health_checks[name].run_with_timeout()
            self.last_check_results[name] = result
            return Result.ok(result)
        except Exception as e:
            return Result.error(e)
    
    def get_overall_status(self) -> HealthStatus:
        """
        Get overall system health status based on all checks.
        
        Returns:
            Overall health status
        """
        if not self.last_check_results:
            return HealthStatus.UNKNOWN
        
        statuses = [result.status for result in self.last_check_results.values()]
        
        # If any check is unhealthy, system is unhealthy
        if HealthStatus.UNHEALTHY in statuses:
            return HealthStatus.UNHEALTHY
        
        # If any check is degraded, system is degraded
        if HealthStatus.DEGRADED in statuses:
            return HealthStatus.DEGRADED
        
        # If all checks are healthy, system is healthy
        if all(status == HealthStatus.HEALTHY for status in statuses):
            return HealthStatus.HEALTHY
        
        return HealthStatus.UNKNOWN
    
    def get_health_summary(self) -> Dict[str, Any]:
        """
        Get comprehensive health summary.
        
        Returns:
            Dictionary with health summary information
        """
        uptime = datetime.utcnow() - self.start_time
        overall_status = self.get_overall_status()
        
        # Count statuses
        status_counts = {
            'healthy': 0,
            'degraded': 0,
            'unhealthy': 0,
            'unknown': 0
        }
        
        for result in self.last_check_results.values():
            status_counts[result.status.value] += 1
        
        return {
            'overall_status': overall_status.value,
            'uptime_seconds': uptime.total_seconds(),
            'uptime_human': str(uptime),
            'total_checks': len(self.health_checks),
            'last_check_time': max(
                (r.timestamp for r in self.last_check_results.values()),
                default=None
            ),
            'status_counts': status_counts,
            'checks': {
                name: result.to_dict()
                for name, result in self.last_check_results.items()
            }
        }
    
    def get_last_results(self) -> Dict[str, HealthCheckResult]:
        """Get the last health check results."""
        return self.last_check_results.copy()


# Global health checker instance
health_checker: Optional[HealthChecker] = None


def get_health_checker() -> HealthChecker:
    """Get or create global health checker instance."""
    global health_checker
    if health_checker is None:
        health_checker = HealthChecker()
    return health_checker
