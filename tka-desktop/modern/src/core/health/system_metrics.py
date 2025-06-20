"""
System metrics collection for TKA Desktop monitoring.
"""

import psutil
import time
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import deque

from core.logging.structured_logger import get_logger, LogContext

logger = get_logger(__name__)


@dataclass
class MetricSnapshot:
    """Single point-in-time metric snapshot."""
    timestamp: datetime
    cpu_percent: float
    memory_percent: float
    memory_used_mb: float
    memory_available_mb: float
    disk_usage_percent: float
    disk_free_gb: float
    process_count: int
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            'timestamp': self.timestamp.isoformat() + 'Z',
            'cpu_percent': self.cpu_percent,
            'memory_percent': self.memory_percent,
            'memory_used_mb': self.memory_used_mb,
            'memory_available_mb': self.memory_available_mb,
            'disk_usage_percent': self.disk_usage_percent,
            'disk_free_gb': self.disk_free_gb,
            'process_count': self.process_count
        }


class MetricsCollector:
    """
    System metrics collector with historical data retention.
    
    Collects system metrics at regular intervals and maintains
    a rolling window of historical data for monitoring and alerting.
    """
    
    def __init__(self, max_history_size: int = 1000):
        self.max_history_size = max_history_size
        self.metrics_history: deque = deque(maxlen=max_history_size)
        self.start_time = datetime.utcnow()
        self.collection_count = 0
        
        logger.info(
            "Metrics collector initialized",
            context=LogContext(
                operation="metrics_collector_init",
                component="system_metrics"
            ),
            max_history_size=max_history_size
        )
    
    def collect_current_metrics(self) -> MetricSnapshot:
        """
        Collect current system metrics.
        
        Returns:
            MetricSnapshot with current system state
        """
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=0.1)
            
            # Memory metrics
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            memory_used_mb = memory.used / (1024 * 1024)
            memory_available_mb = memory.available / (1024 * 1024)
            
            # Disk metrics
            disk = psutil.disk_usage('/')
            disk_usage_percent = (disk.used / disk.total) * 100
            disk_free_gb = disk.free / (1024 * 1024 * 1024)
            
            # Process metrics
            process_count = len(psutil.pids())
            
            snapshot = MetricSnapshot(
                timestamp=datetime.utcnow(),
                cpu_percent=round(cpu_percent, 2),
                memory_percent=round(memory_percent, 2),
                memory_used_mb=round(memory_used_mb, 2),
                memory_available_mb=round(memory_available_mb, 2),
                disk_usage_percent=round(disk_usage_percent, 2),
                disk_free_gb=round(disk_free_gb, 2),
                process_count=process_count
            )
            
            # Add to history
            self.metrics_history.append(snapshot)
            self.collection_count += 1
            
            logger.debug(
                "Metrics collected",
                context=LogContext(
                    operation="metrics_collect",
                    component="system_metrics"
                ),
                cpu_percent=cpu_percent,
                memory_percent=memory_percent,
                collection_count=self.collection_count
            )
            
            return snapshot
            
        except Exception as e:
            logger.error(
                "Failed to collect metrics",
                error=e,
                context=LogContext(
                    operation="metrics_collect_error",
                    component="system_metrics"
                )
            )
            raise
    
    def get_latest_metrics(self) -> Optional[MetricSnapshot]:
        """Get the most recent metrics snapshot."""
        return self.metrics_history[-1] if self.metrics_history else None
    
    def get_metrics_history(self, limit: Optional[int] = None) -> List[MetricSnapshot]:
        """
        Get historical metrics data.
        
        Args:
            limit: Maximum number of snapshots to return (most recent first)
            
        Returns:
            List of metric snapshots
        """
        history = list(self.metrics_history)
        if limit:
            history = history[-limit:]
        return history
    
    def get_metrics_since(self, since: datetime) -> List[MetricSnapshot]:
        """
        Get metrics collected since a specific time.
        
        Args:
            since: Datetime to filter from
            
        Returns:
            List of metric snapshots since the specified time
        """
        return [
            snapshot for snapshot in self.metrics_history
            if snapshot.timestamp >= since
        ]
    
    def get_average_metrics(self, duration_minutes: int = 5) -> Optional[Dict[str, float]]:
        """
        Get average metrics over a specified duration.
        
        Args:
            duration_minutes: Duration in minutes to average over
            
        Returns:
            Dictionary with averaged metrics or None if insufficient data
        """
        if not self.metrics_history:
            return None
        
        cutoff_time = datetime.utcnow() - timedelta(minutes=duration_minutes)
        recent_metrics = self.get_metrics_since(cutoff_time)
        
        if not recent_metrics:
            return None
        
        # Calculate averages
        total_snapshots = len(recent_metrics)
        
        averages = {
            'cpu_percent': sum(m.cpu_percent for m in recent_metrics) / total_snapshots,
            'memory_percent': sum(m.memory_percent for m in recent_metrics) / total_snapshots,
            'memory_used_mb': sum(m.memory_used_mb for m in recent_metrics) / total_snapshots,
            'disk_usage_percent': sum(m.disk_usage_percent for m in recent_metrics) / total_snapshots,
            'process_count': sum(m.process_count for m in recent_metrics) / total_snapshots,
            'sample_count': total_snapshots,
            'duration_minutes': duration_minutes
        }
        
        # Round values
        for key, value in averages.items():
            if isinstance(value, float):
                averages[key] = round(value, 2)
        
        return averages
    
    def get_peak_metrics(self, duration_minutes: int = 60) -> Optional[Dict[str, Any]]:
        """
        Get peak (maximum) metrics over a specified duration.
        
        Args:
            duration_minutes: Duration in minutes to check for peaks
            
        Returns:
            Dictionary with peak metrics or None if insufficient data
        """
        if not self.metrics_history:
            return None
        
        cutoff_time = datetime.utcnow() - timedelta(minutes=duration_minutes)
        recent_metrics = self.get_metrics_since(cutoff_time)
        
        if not recent_metrics:
            return None
        
        peaks = {
            'cpu_percent': max(m.cpu_percent for m in recent_metrics),
            'memory_percent': max(m.memory_percent for m in recent_metrics),
            'memory_used_mb': max(m.memory_used_mb for m in recent_metrics),
            'disk_usage_percent': max(m.disk_usage_percent for m in recent_metrics),
            'process_count': max(m.process_count for m in recent_metrics),
            'sample_count': len(recent_metrics),
            'duration_minutes': duration_minutes
        }
        
        return peaks
    
    def get_summary_stats(self) -> Dict[str, Any]:
        """
        Get comprehensive summary statistics.
        
        Returns:
            Dictionary with summary statistics
        """
        if not self.metrics_history:
            return {
                'status': 'no_data',
                'collection_count': 0,
                'uptime_seconds': 0
            }
        
        latest = self.get_latest_metrics()
        averages_5min = self.get_average_metrics(5)
        averages_60min = self.get_average_metrics(60)
        peaks_60min = self.get_peak_metrics(60)
        
        uptime = datetime.utcnow() - self.start_time
        
        return {
            'status': 'active',
            'collection_count': self.collection_count,
            'uptime_seconds': uptime.total_seconds(),
            'history_size': len(self.metrics_history),
            'latest': latest.to_dict() if latest else None,
            'averages_5min': averages_5min,
            'averages_60min': averages_60min,
            'peaks_60min': peaks_60min,
            'first_collection': self.metrics_history[0].timestamp.isoformat() + 'Z' if self.metrics_history else None,
            'last_collection': latest.timestamp.isoformat() + 'Z' if latest else None
        }
    
    def clear_history(self):
        """Clear all historical metrics data."""
        self.metrics_history.clear()
        self.collection_count = 0
        self.start_time = datetime.utcnow()
        
        logger.info(
            "Metrics history cleared",
            context=LogContext(
                operation="metrics_clear",
                component="system_metrics"
            )
        )


class SystemMetrics:
    """
    High-level system metrics interface.
    
    Provides easy access to system metrics collection and analysis.
    """
    
    def __init__(self):
        self.collector = MetricsCollector()
        self.auto_collect_enabled = False
        self.collection_interval = 30  # seconds
        
        logger.info(
            "System metrics initialized",
            context=LogContext(
                operation="system_metrics_init",
                component="system_metrics"
            )
        )
    
    def start_auto_collection(self, interval_seconds: int = 30):
        """
        Start automatic metrics collection.
        
        Args:
            interval_seconds: Collection interval in seconds
        """
        self.collection_interval = interval_seconds
        self.auto_collect_enabled = True
        
        logger.info(
            "Auto metrics collection started",
            context=LogContext(
                operation="auto_collect_start",
                component="system_metrics"
            ),
            interval_seconds=interval_seconds
        )
    
    def stop_auto_collection(self):
        """Stop automatic metrics collection."""
        self.auto_collect_enabled = False
        
        logger.info(
            "Auto metrics collection stopped",
            context=LogContext(
                operation="auto_collect_stop",
                component="system_metrics"
            )
        )
    
    def collect_now(self) -> MetricSnapshot:
        """Collect metrics immediately."""
        return self.collector.collect_current_metrics()
    
    def get_current_status(self) -> Dict[str, Any]:
        """Get current system status with metrics."""
        return self.collector.get_summary_stats()
    
    def get_dashboard_data(self) -> Dict[str, Any]:
        """Get data formatted for dashboard display."""
        summary = self.collector.get_summary_stats()
        recent_history = self.collector.get_metrics_history(limit=60)  # Last 60 samples
        
        return {
            'summary': summary,
            'recent_history': [snapshot.to_dict() for snapshot in recent_history],
            'collection_active': self.auto_collect_enabled,
            'collection_interval': self.collection_interval
        }


# Global system metrics instance
system_metrics: Optional[SystemMetrics] = None


def get_system_metrics() -> SystemMetrics:
    """Get or create global system metrics instance."""
    global system_metrics
    if system_metrics is None:
        system_metrics = SystemMetrics()
    return system_metrics
