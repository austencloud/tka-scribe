"""
TKA Desktop Centralized Configuration Module

A+ Enhancement: Comprehensive configuration management with environment-based
configuration, validation, and centralized settings management.

ARCHITECTURE: Provides centralized configuration system with Pydantic validation,
environment variable support, and hierarchical configuration management.

EXPORTS:
- Settings: Main configuration class
- DatabaseSettings: Database configuration
- APISettings: API configuration  
- UISettings: UI configuration
- LoggingSettings: Logging configuration
- get_settings: Global settings accessor
"""

# Configuration Management Components
from .settings import (
    Settings,
    DatabaseSettings,
    APISettings,
    UISettings,
    LoggingSettings,
    PerformanceSettings,
    SecuritySettings,
    get_settings,
    reload_settings,
)

from .config_manager import (
    ConfigManager,
    ConfigValidationError,
    EnvironmentConfig,
)

__all__ = [
    "Settings",
    "DatabaseSettings",
    "APISettings", 
    "UISettings",
    "LoggingSettings",
    "PerformanceSettings",
    "SecuritySettings",
    "get_settings",
    "reload_settings",
    "ConfigManager",
    "ConfigValidationError",
    "EnvironmentConfig",
]
