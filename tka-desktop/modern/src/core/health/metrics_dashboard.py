"""
Metrics dashboard for TKA Desktop monitoring.
"""

import json
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from .health_checker import HealthChecker, HealthStatus
from .system_metrics import SystemMetrics
from core.monitoring.performance_monitor import enhanced_performance_monitor
from core.logging.structured_logger import get_logger, LogContext

logger = get_logger(__name__)


@dataclass
class DashboardData:
    """Data structure for metrics dashboard."""
    timestamp: datetime
    overall_status: str
    health_checks: Dict[str, Any]
    system_metrics: Dict[str, Any]
    performance_metrics: Dict[str, Any]
    alerts: List[Dict[str, Any]]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            'timestamp': self.timestamp.isoformat() + 'Z',
            'overall_status': self.overall_status,
            'health_checks': self.health_checks,
            'system_metrics': self.system_metrics,
            'performance_metrics': self.performance_metrics,
            'alerts': self.alerts
        }


class MetricsDashboard:
    """
    Metrics dashboard generator for TKA Desktop.
    
    Combines health checks, system metrics, and performance data
    into a comprehensive monitoring dashboard.
    """
    
    def __init__(self, health_checker: Optional[HealthChecker] = None,
                 system_metrics: Optional[SystemMetrics] = None):
        self.health_checker = health_checker
        self.system_metrics = system_metrics
        self.alert_thresholds = {
            'cpu_critical': 90.0,
            'cpu_warning': 75.0,
            'memory_critical': 95.0,
            'memory_warning': 80.0,
            'disk_critical': 95.0,
            'disk_warning': 85.0
        }
        
        logger.info(
            "Metrics dashboard initialized",
            context=LogContext(
                operation="dashboard_init",
                component="metrics_dashboard"
            )
        )
    
    async def generate_dashboard_data(self) -> DashboardData:
        """
        Generate comprehensive dashboard data.
        
        Returns:
            DashboardData with current system state
        """
        timestamp = datetime.utcnow()
        
        # Collect health check data
        health_data = {}
        overall_status = "unknown"
        
        if self.health_checker:
            try:
                health_results = await self.health_checker.run_all_checks()
                health_data = {
                    name: result.to_dict()
                    for name, result in health_results.items()
                }
                overall_status = self.health_checker.get_overall_status().value
            except Exception as e:
                logger.error(
                    "Failed to collect health check data",
                    error=e,
                    context=LogContext(
                        operation="dashboard_health_error",
                        component="metrics_dashboard"
                    )
                )
                health_data = {'error': str(e)}
        
        # Collect system metrics data
        system_data = {}
        if self.system_metrics:
            try:
                system_data = self.system_metrics.get_dashboard_data()
            except Exception as e:
                logger.error(
                    "Failed to collect system metrics data",
                    error=e,
                    context=LogContext(
                        operation="dashboard_metrics_error",
                        component="metrics_dashboard"
                    )
                )
                system_data = {'error': str(e)}
        
        # Collect performance metrics data
        performance_data = {}
        try:
            performance_data = enhanced_performance_monitor.get_metrics()
        except Exception as e:
            logger.error(
                "Failed to collect performance metrics data",
                error=e,
                context=LogContext(
                    operation="dashboard_performance_error",
                    component="metrics_dashboard"
                )
            )
            performance_data = {'error': str(e)}
        
        # Generate alerts
        alerts = self._generate_alerts(system_data, health_data)
        
        dashboard_data = DashboardData(
            timestamp=timestamp,
            overall_status=overall_status,
            health_checks=health_data,
            system_metrics=system_data,
            performance_metrics=performance_data,
            alerts=alerts
        )
        
        logger.debug(
            "Dashboard data generated",
            context=LogContext(
                operation="dashboard_generate",
                component="metrics_dashboard"
            ),
            overall_status=overall_status,
            health_checks_count=len(health_data),
            alerts_count=len(alerts)
        )
        
        return dashboard_data
    
    def _generate_alerts(self, system_data: Dict[str, Any], 
                        health_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate alerts based on current metrics and thresholds.
        
        Args:
            system_data: System metrics data
            health_data: Health check data
            
        Returns:
            List of alert dictionaries
        """
        alerts = []
        
        # System metrics alerts
        if 'summary' in system_data and 'latest' in system_data['summary']:
            latest = system_data['summary']['latest']
            if latest:
                # CPU alerts
                cpu_percent = latest.get('cpu_percent', 0)
                if cpu_percent >= self.alert_thresholds['cpu_critical']:
                    alerts.append({
                        'type': 'critical',
                        'category': 'system',
                        'message': f"Critical CPU usage: {cpu_percent}%",
                        'value': cpu_percent,
                        'threshold': self.alert_thresholds['cpu_critical']
                    })
                elif cpu_percent >= self.alert_thresholds['cpu_warning']:
                    alerts.append({
                        'type': 'warning',
                        'category': 'system',
                        'message': f"High CPU usage: {cpu_percent}%",
                        'value': cpu_percent,
                        'threshold': self.alert_thresholds['cpu_warning']
                    })
                
                # Memory alerts
                memory_percent = latest.get('memory_percent', 0)
                if memory_percent >= self.alert_thresholds['memory_critical']:
                    alerts.append({
                        'type': 'critical',
                        'category': 'system',
                        'message': f"Critical memory usage: {memory_percent}%",
                        'value': memory_percent,
                        'threshold': self.alert_thresholds['memory_critical']
                    })
                elif memory_percent >= self.alert_thresholds['memory_warning']:
                    alerts.append({
                        'type': 'warning',
                        'category': 'system',
                        'message': f"High memory usage: {memory_percent}%",
                        'value': memory_percent,
                        'threshold': self.alert_thresholds['memory_warning']
                    })
                
                # Disk alerts
                disk_percent = latest.get('disk_usage_percent', 0)
                if disk_percent >= self.alert_thresholds['disk_critical']:
                    alerts.append({
                        'type': 'critical',
                        'category': 'system',
                        'message': f"Critical disk usage: {disk_percent}%",
                        'value': disk_percent,
                        'threshold': self.alert_thresholds['disk_critical']
                    })
                elif disk_percent >= self.alert_thresholds['disk_warning']:
                    alerts.append({
                        'type': 'warning',
                        'category': 'system',
                        'message': f"High disk usage: {disk_percent}%",
                        'value': disk_percent,
                        'threshold': self.alert_thresholds['disk_warning']
                    })
        
        # Health check alerts
        for check_name, check_data in health_data.items():
            if isinstance(check_data, dict) and 'status' in check_data:
                status = check_data['status']
                if status == 'unhealthy':
                    alerts.append({
                        'type': 'critical',
                        'category': 'health',
                        'message': f"Health check failed: {check_name}",
                        'check_name': check_name,
                        'details': check_data.get('message', 'No details available')
                    })
                elif status == 'degraded':
                    alerts.append({
                        'type': 'warning',
                        'category': 'health',
                        'message': f"Health check degraded: {check_name}",
                        'check_name': check_name,
                        'details': check_data.get('message', 'No details available')
                    })
        
        return alerts
    
    def generate_html_dashboard(self, dashboard_data: DashboardData) -> str:
        """
        Generate HTML dashboard for web display.
        
        Args:
            dashboard_data: Dashboard data to render
            
        Returns:
            HTML string for dashboard
        """
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>TKA Desktop Metrics Dashboard</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
                .dashboard { max-width: 1200px; margin: 0 auto; }
                .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                .status-healthy { color: #27ae60; }
                .status-degraded { color: #f39c12; }
                .status-unhealthy { color: #e74c3c; }
                .card { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .metric { display: inline-block; margin: 10px; padding: 10px; background: #ecf0f1; border-radius: 4px; }
                .alert-critical { background: #e74c3c; color: white; padding: 10px; margin: 5px 0; border-radius: 4px; }
                .alert-warning { background: #f39c12; color: white; padding: 10px; margin: 5px 0; border-radius: 4px; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            </style>
        </head>
        <body>
            <div class="dashboard">
                <div class="header">
                    <h1>TKA Desktop Metrics Dashboard</h1>
                    <p>Last Updated: {timestamp}</p>
                    <p>Overall Status: <span class="status-{overall_status}">{overall_status_upper}</span></p>
                </div>
                
                {alerts_section}
                
                <div class="grid">
                    <div class="card">
                        <h2>System Metrics</h2>
                        {system_metrics_section}
                    </div>
                    
                    <div class="card">
                        <h2>Health Checks</h2>
                        {health_checks_section}
                    </div>
                </div>
                
                <div class="card">
                    <h2>Performance Metrics</h2>
                    {performance_metrics_section}
                </div>
            </div>
        </body>
        </html>
        """
        
        # Generate sections
        alerts_section = self._generate_alerts_html(dashboard_data.alerts)
        system_metrics_section = self._generate_system_metrics_html(dashboard_data.system_metrics)
        health_checks_section = self._generate_health_checks_html(dashboard_data.health_checks)
        performance_metrics_section = self._generate_performance_metrics_html(dashboard_data.performance_metrics)
        
        return html_template.format(
            timestamp=dashboard_data.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC'),
            overall_status=dashboard_data.overall_status,
            overall_status_upper=dashboard_data.overall_status.upper(),
            alerts_section=alerts_section,
            system_metrics_section=system_metrics_section,
            health_checks_section=health_checks_section,
            performance_metrics_section=performance_metrics_section
        )
    
    def _generate_alerts_html(self, alerts: List[Dict[str, Any]]) -> str:
        """Generate HTML for alerts section."""
        if not alerts:
            return '<div class="card"><h2>Alerts</h2><p>No alerts</p></div>'
        
        alerts_html = '<div class="card"><h2>Alerts</h2>'
        for alert in alerts:
            alert_class = f"alert-{alert['type']}"
            alerts_html += f'<div class="{alert_class}">{alert["message"]}</div>'
        alerts_html += '</div>'
        
        return alerts_html
    
    def _generate_system_metrics_html(self, system_data: Dict[str, Any]) -> str:
        """Generate HTML for system metrics section."""
        if 'summary' not in system_data or 'latest' not in system_data['summary']:
            return '<p>No system metrics available</p>'
        
        latest = system_data['summary']['latest']
        if not latest:
            return '<p>No recent system metrics</p>'
        
        return f"""
        <div class="metric">CPU: {latest.get('cpu_percent', 0)}%</div>
        <div class="metric">Memory: {latest.get('memory_percent', 0)}%</div>
        <div class="metric">Disk: {latest.get('disk_usage_percent', 0)}%</div>
        <div class="metric">Processes: {latest.get('process_count', 0)}</div>
        """
    
    def _generate_health_checks_html(self, health_data: Dict[str, Any]) -> str:
        """Generate HTML for health checks section."""
        if not health_data:
            return '<p>No health checks available</p>'
        
        html = ''
        for check_name, check_data in health_data.items():
            if isinstance(check_data, dict) and 'status' in check_data:
                status = check_data['status']
                status_class = f"status-{status}"
                html += f'<div class="metric"><span class="{status_class}">{check_name}: {status.upper()}</span></div>'
        
        return html or '<p>No valid health check data</p>'
    
    def _generate_performance_metrics_html(self, performance_data: Dict[str, Any]) -> str:
        """Generate HTML for performance metrics section."""
        if not performance_data:
            return '<p>No performance metrics available</p>'
        
        html = ''
        for operation, metrics in performance_data.items():
            if isinstance(metrics, dict):
                avg_duration = metrics.get('average_duration', 0)
                total_calls = metrics.get('total_calls', 0)
                error_rate = metrics.get('error_rate', 0) * 100
                
                html += f"""
                <div class="metric">
                    <strong>{operation}</strong><br>
                    Avg: {avg_duration:.3f}s | Calls: {total_calls} | Errors: {error_rate:.1f}%
                </div>
                """
        
        return html or '<p>No performance data available</p>'
    
    def save_dashboard_html(self, dashboard_data: DashboardData, file_path: Path):
        """Save dashboard as HTML file."""
        html_content = self.generate_html_dashboard(dashboard_data)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        logger.info(
            "Dashboard HTML saved",
            context=LogContext(
                operation="dashboard_save_html",
                component="metrics_dashboard"
            ),
            file_path=str(file_path)
        )


# Global metrics dashboard instance
metrics_dashboard: Optional[MetricsDashboard] = None


def get_metrics_dashboard(health_checker: Optional[HealthChecker] = None,
                         system_metrics: Optional[SystemMetrics] = None) -> MetricsDashboard:
    """Get or create global metrics dashboard instance."""
    global metrics_dashboard
    if metrics_dashboard is None:
        metrics_dashboard = MetricsDashboard(health_checker, system_metrics)
    return metrics_dashboard
