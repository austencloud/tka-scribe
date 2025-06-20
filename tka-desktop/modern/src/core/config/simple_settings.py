"""
Simplified settings for testing A+ enhancements.
"""

import os
from typing import Optional
from enum import Enum

from core.types.result import Result


class Environment(str, Enum):
    """Application environment enumeration."""
    DEVELOPMENT = "development"
    TESTING = "testing"
    STAGING = "staging"
    PRODUCTION = "production"


class SimpleSettings:
    """Simplified settings class for testing."""
    
    def __init__(self):
        # Basic app settings
        self.app_name = os.getenv("APP_NAME", "TKA Desktop")
        self.app_version = os.getenv("APP_VERSION", "2.0.0")
        self.environment = Environment(os.getenv("ENVIRONMENT", "development"))
        self.debug = os.getenv("DEBUG", "false").lower() == "true"
        
        # Database settings
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///tka.db")
        self.database_pool_size = int(os.getenv("DATABASE_POOL_SIZE", "5"))
        
        # API settings
        self.api_host = os.getenv("API_HOST", "localhost")
        self.api_port = int(os.getenv("API_PORT", "8000"))
        self.api_debug = os.getenv("API_DEBUG", "false").lower() == "true"
        
        # UI settings
        self.ui_theme = os.getenv("UI_THEME", "dark")
        self.ui_window_width = int(os.getenv("UI_WINDOW_WIDTH", "1400"))
        self.ui_window_height = int(os.getenv("UI_WINDOW_HEIGHT", "900"))
        
        # Logging settings
        self.log_level = os.getenv("LOG_LEVEL", "INFO")
        self.log_format = os.getenv("LOG_FORMAT", "structured")
        
        # Performance settings
        self.perf_monitoring_enabled = os.getenv("PERF_MONITORING_ENABLED", "true").lower() == "true"
        self.perf_slow_threshold = float(os.getenv("PERF_SLOW_THRESHOLD", "1.0"))


# Global settings instance
_simple_settings: Optional[SimpleSettings] = None


def get_simple_settings() -> SimpleSettings:
    """Get the global simple settings instance."""
    global _simple_settings
    if _simple_settings is None:
        _simple_settings = SimpleSettings()
    return _simple_settings


def validate_simple_settings(settings: SimpleSettings) -> Result[None, Exception]:
    """Validate simple settings configuration."""
    try:
        # Basic validation
        if not settings.app_name:
            return Result.error(Exception("App name is required"))
        
        if settings.api_port < 1 or settings.api_port > 65535:
            return Result.error(Exception("API port must be between 1 and 65535"))
        
        if settings.ui_window_width < 800 or settings.ui_window_height < 600:
            return Result.error(Exception("Window dimensions too small"))
        
        return Result.ok(None)
    except Exception as e:
        return Result.error(e)
