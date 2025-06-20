"""
Centralized configuration management with environment-based settings.
"""

import os
from pathlib import Path
from typing import Optional, List, Dict, Any, Union

import json
from enum import Enum
from dataclasses import dataclass, field

from core.types.result import Result


# Simple settings classes without Pydantic dependency for testing
class SimpleBaseSettings:
    """Simple base settings class for testing."""

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)


class Environment(str, Enum):
    """Application environment enumeration."""

    DEVELOPMENT = "development"
    TESTING = "testing"
    STAGING = "staging"
    PRODUCTION = "production"


class LogLevel(str, Enum):
    """Logging level enumeration."""

    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class DatabaseSettings(BaseSettings):
    """Database configuration settings."""

    url: str = Field(default="sqlite:///tka.db", env="DATABASE_URL")
    pool_size: int = Field(default=5, env="DATABASE_POOL_SIZE")
    echo: bool = Field(default=False, env="DATABASE_ECHO")
    timeout: int = Field(default=30, env="DATABASE_TIMEOUT")

    @validator("pool_size")
    def validate_pool_size(cls, v):
        if v < 1 or v > 100:
            raise ValueError("Pool size must be between 1 and 100")
        return v

    class Config:
        env_prefix = "DATABASE_"


class APISettings(BaseSettings):
    """API configuration settings."""

    host: str = Field(default="localhost", env="API_HOST")
    port: int = Field(default=8000, env="API_PORT")
    debug: bool = Field(default=False, env="API_DEBUG")
    cors_origins: List[str] = Field(default=["*"], env="API_CORS_ORIGINS")
    rate_limit: int = Field(default=100, env="API_RATE_LIMIT")
    timeout: int = Field(default=30, env="API_TIMEOUT")

    @validator("port")
    def validate_port(cls, v):
        if v < 1 or v > 65535:
            raise ValueError("Port must be between 1 and 65535")
        return v

    @validator("cors_origins", pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    class Config:
        env_prefix = "API_"


class UISettings(BaseSettings):
    """UI configuration settings."""

    theme: str = Field(default="dark", env="UI_THEME")
    window_width: int = Field(default=1400, env="UI_WINDOW_WIDTH")
    window_height: int = Field(default=900, env="UI_WINDOW_HEIGHT")
    background_type: str = Field(default="Aurora", env="UI_BACKGROUND_TYPE")
    enable_animations: bool = Field(default=True, env="UI_ENABLE_ANIMATIONS")
    auto_save_interval: int = Field(default=300, env="UI_AUTO_SAVE_INTERVAL")

    @validator("theme")
    def validate_theme(cls, v):
        valid_themes = ["light", "dark", "auto"]
        if v not in valid_themes:
            raise ValueError(f"Theme must be one of: {valid_themes}")
        return v

    @validator("window_width", "window_height")
    def validate_dimensions(cls, v):
        if v < 800 or v > 4000:
            raise ValueError("Window dimensions must be between 800 and 4000")
        return v

    class Config:
        env_prefix = "UI_"


class LoggingSettings(BaseSettings):
    """Logging configuration settings."""

    level: LogLevel = Field(default=LogLevel.INFO, env="LOG_LEVEL")
    format: str = Field(default="structured", env="LOG_FORMAT")
    file_enabled: bool = Field(default=True, env="LOG_FILE_ENABLED")
    file_path: Optional[str] = Field(default=None, env="LOG_FILE_PATH")
    max_file_size: int = Field(default=10485760, env="LOG_MAX_FILE_SIZE")  # 10MB
    backup_count: int = Field(default=5, env="LOG_BACKUP_COUNT")

    @validator("format")
    def validate_format(cls, v):
        valid_formats = ["structured", "simple", "json"]
        if v not in valid_formats:
            raise ValueError(f"Log format must be one of: {valid_formats}")
        return v

    class Config:
        env_prefix = "LOG_"


class PerformanceSettings(BaseSettings):
    """Performance monitoring configuration."""

    monitoring_enabled: bool = Field(default=True, env="PERF_MONITORING_ENABLED")
    slow_operation_threshold: float = Field(default=1.0, env="PERF_SLOW_THRESHOLD")
    memory_warning_threshold: float = Field(default=100.0, env="PERF_MEMORY_WARNING")
    memory_error_threshold: float = Field(default=500.0, env="PERF_MEMORY_ERROR")
    metrics_retention_days: int = Field(default=7, env="PERF_RETENTION_DAYS")

    @validator("slow_operation_threshold")
    def validate_slow_threshold(cls, v):
        if v < 0.1 or v > 60.0:
            raise ValueError(
                "Slow operation threshold must be between 0.1 and 60.0 seconds"
            )
        return v

    class Config:
        env_prefix = "PERF_"


class SecuritySettings(BaseSettings):
    """Security configuration settings."""

    secret_key: str = Field(default="dev-secret-key", env="SECRET_KEY")
    token_expiry_hours: int = Field(default=24, env="TOKEN_EXPIRY_HOURS")
    max_login_attempts: int = Field(default=5, env="MAX_LOGIN_ATTEMPTS")
    session_timeout_minutes: int = Field(default=60, env="SESSION_TIMEOUT_MINUTES")

    @validator("secret_key")
    def validate_secret_key(cls, v):
        if len(v) < 32:
            raise ValueError("Secret key must be at least 32 characters long")
        return v

    class Config:
        env_prefix = "SECURITY_"


class Settings(BaseSettings):
    """Main application settings."""

    environment: Environment = Field(default=Environment.DEVELOPMENT, env="ENVIRONMENT")
    debug: bool = Field(default=False, env="DEBUG")
    app_name: str = Field(default="TKA Desktop", env="APP_NAME")
    app_version: str = Field(default="2.0.0", env="APP_VERSION")

    # Sub-configurations
    database: DatabaseSettings = DatabaseSettings()
    api: APISettings = APISettings()
    ui: UISettings = UISettings()
    logging: LoggingSettings = LoggingSettings()
    performance: PerformanceSettings = PerformanceSettings()
    security: SecuritySettings = SecuritySettings()

    @validator("environment", pre=True)
    def parse_environment(cls, v):
        if isinstance(v, str):
            return Environment(v.lower())
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

        @classmethod
        def customise_sources(cls, init_settings, env_settings, file_secret_settings):
            # Prioritize environment variables over .env file
            return (init_settings, env_settings, file_secret_settings)


# Global settings instance
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """Get the global settings instance."""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings


def reload_settings() -> Result[Settings, Exception]:
    """Reload settings from environment and configuration files."""
    global _settings
    try:
        _settings = Settings()
        return Result.ok(_settings)
    except Exception as e:
        return Result.error(e)


def validate_settings(settings: Settings) -> Result[None, List[str]]:
    """Validate settings configuration."""
    errors = []

    # Environment-specific validations
    if settings.environment == Environment.PRODUCTION:
        if settings.debug:
            errors.append("Debug mode should not be enabled in production")

        if settings.security.secret_key == "dev-secret-key":
            errors.append("Production environment requires a secure secret key")

        if settings.api.debug:
            errors.append("API debug mode should not be enabled in production")

    # Cross-setting validations
    if settings.api.port == settings.database.pool_size:
        errors.append("API port and database pool size should not be the same")

    if errors:
        return Result.error(errors)

    return Result.ok(None)
