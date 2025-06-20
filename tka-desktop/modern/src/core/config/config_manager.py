"""
Configuration manager for centralized configuration handling.
"""

import os
import json
import configparser
from pathlib import Path
from typing import Dict, Any, Optional, List, Union
from dataclasses import dataclass
from enum import Enum

from core.types.result import Result
from core.exceptions import ConfigurationError


class EnvironmentConfig(Enum):
    """Environment configuration types."""
    DEVELOPMENT = "development"
    TESTING = "testing"
    STAGING = "staging"
    PRODUCTION = "production"


class ConfigValidationError(Exception):
    """Configuration validation error."""
    def __init__(self, message: str, field: str = None, value: Any = None):
        super().__init__(message)
        self.field = field
        self.value = value


@dataclass
class ConfigSource:
    """Configuration source information."""
    name: str
    path: Optional[Path] = None
    priority: int = 0
    loaded: bool = False
    data: Dict[str, Any] = None


class ConfigManager:
    """
    Centralized configuration manager with multiple source support.
    
    Supports loading configuration from:
    - Environment variables
    - JSON files
    - INI files
    - Default values
    """
    
    def __init__(self, base_path: Optional[Path] = None):
        self.base_path = base_path or Path.cwd()
        self.sources: List[ConfigSource] = []
        self.config_data: Dict[str, Any] = {}
        self.environment = self._detect_environment()
    
    def _detect_environment(self) -> EnvironmentConfig:
        """Detect current environment from environment variables."""
        env_name = os.getenv("ENVIRONMENT", "development").lower()
        try:
            return EnvironmentConfig(env_name)
        except ValueError:
            return EnvironmentConfig.DEVELOPMENT
    
    def add_source(self, name: str, path: Optional[Union[str, Path]] = None, 
                   priority: int = 0) -> Result[None, Exception]:
        """Add a configuration source."""
        try:
            source_path = Path(path) if path else None
            source = ConfigSource(
                name=name,
                path=source_path,
                priority=priority
            )
            self.sources.append(source)
            
            # Sort sources by priority (higher priority first)
            self.sources.sort(key=lambda s: s.priority, reverse=True)
            
            return Result.ok(None)
        except Exception as e:
            return Result.error(e)
    
    def load_configuration(self) -> Result[Dict[str, Any], Exception]:
        """Load configuration from all sources."""
        try:
            merged_config = {}
            
            # Load from each source in priority order
            for source in self.sources:
                result = self._load_source(source)
                if result.is_ok():
                    source_data = result.unwrap()
                    # Merge with lower priority to higher priority
                    merged_config = self._merge_configs(merged_config, source_data)
                    source.loaded = True
                    source.data = source_data
            
            # Add environment-specific overrides
            env_overrides = self._get_environment_overrides()
            merged_config = self._merge_configs(merged_config, env_overrides)
            
            self.config_data = merged_config
            return Result.ok(merged_config)
            
        except Exception as e:
            return Result.error(e)
    
    def _load_source(self, source: ConfigSource) -> Result[Dict[str, Any], Exception]:
        """Load configuration from a single source."""
        try:
            if source.path is None:
                return Result.ok({})
            
            if not source.path.exists():
                return Result.ok({})
            
            if source.path.suffix == '.json':
                return self._load_json_file(source.path)
            elif source.path.suffix == '.ini':
                return self._load_ini_file(source.path)
            else:
                return Result.error(
                    ConfigurationError(f"Unsupported file type: {source.path.suffix}")
                )
                
        except Exception as e:
            return Result.error(e)
    
    def _load_json_file(self, path: Path) -> Result[Dict[str, Any], Exception]:
        """Load configuration from JSON file."""
        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return Result.ok(data)
        except Exception as e:
            return Result.error(e)
    
    def _load_ini_file(self, path: Path) -> Result[Dict[str, Any], Exception]:
        """Load configuration from INI file."""
        try:
            config = configparser.ConfigParser()
            config.read(path, encoding='utf-8')
            
            # Convert to nested dictionary
            data = {}
            for section_name in config.sections():
                data[section_name] = dict(config[section_name])
            
            return Result.ok(data)
        except Exception as e:
            return Result.error(e)
    
    def _merge_configs(self, base: Dict[str, Any], override: Dict[str, Any]) -> Dict[str, Any]:
        """Merge two configuration dictionaries."""
        result = base.copy()
        
        for key, value in override.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = self._merge_configs(result[key], value)
            else:
                result[key] = value
        
        return result
    
    def _get_environment_overrides(self) -> Dict[str, Any]:
        """Get environment-specific configuration overrides."""
        overrides = {}
        
        # Common environment variable patterns
        env_mappings = {
            'DEBUG': ('debug', lambda x: x.lower() in ('true', '1', 'yes')),
            'LOG_LEVEL': ('logging.level', str.upper),
            'DATABASE_URL': ('database.url', str),
            'API_HOST': ('api.host', str),
            'API_PORT': ('api.port', int),
        }
        
        for env_var, (config_path, converter) in env_mappings.items():
            value = os.getenv(env_var)
            if value is not None:
                try:
                    converted_value = converter(value)
                    self._set_nested_value(overrides, config_path, converted_value)
                except (ValueError, TypeError):
                    # Skip invalid values
                    continue
        
        return overrides
    
    def _set_nested_value(self, data: Dict[str, Any], path: str, value: Any):
        """Set a nested value in a dictionary using dot notation."""
        keys = path.split('.')
        current = data
        
        for key in keys[:-1]:
            if key not in current:
                current[key] = {}
            current = current[key]
        
        current[keys[-1]] = value
    
    def get_config(self, key: str = None, default: Any = None) -> Any:
        """Get configuration value by key."""
        if key is None:
            return self.config_data
        
        # Support dot notation for nested keys
        keys = key.split('.')
        current = self.config_data
        
        try:
            for k in keys:
                current = current[k]
            return current
        except (KeyError, TypeError):
            return default
    
    def validate_config(self) -> Result[None, List[str]]:
        """Validate the loaded configuration."""
        errors = []
        
        # Basic validation rules
        required_keys = ['app_name', 'app_version']
        for key in required_keys:
            if key not in self.config_data:
                errors.append(f"Required configuration key missing: {key}")
        
        # Environment-specific validations
        if self.environment == EnvironmentConfig.PRODUCTION:
            if self.get_config('debug', False):
                errors.append("Debug mode should not be enabled in production")
        
        if errors:
            return Result.error(errors)
        
        return Result.ok(None)
    
    def export_config(self, path: Path, format: str = 'json') -> Result[None, Exception]:
        """Export current configuration to file."""
        try:
            if format == 'json':
                with open(path, 'w', encoding='utf-8') as f:
                    json.dump(self.config_data, f, indent=2, ensure_ascii=False)
            else:
                return Result.error(ConfigurationError(f"Unsupported export format: {format}"))
            
            return Result.ok(None)
        except Exception as e:
            return Result.error(e)
