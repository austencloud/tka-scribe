"""
Sequence Configuration Service

Manages generation configurations, presets, and settings.
Implements ISequenceConfigurationService with persistence support.
"""

import json
import logging
from typing import Any, Dict, List, TYPE_CHECKING

from desktop.modern.core.interfaces.generation_services import (
    ISequenceConfigurationService,
    GenerationMode,
    LetterType,
    PropContinuity,
    SliceSize,
    CAPType,
)
from desktop.modern.domain.models.generation_models import GenerationConfig

if TYPE_CHECKING:
    from desktop.modern.core.dependency_injection.di_container import DIContainer

logger = logging.getLogger(__name__)


class SequenceConfigurationService(ISequenceConfigurationService):
    """
    Manages generation configurations and presets.
    
    Handles loading, saving, and managing generation configurations
    with support for user presets and default settings.
    """

    def __init__(self, container: "DIContainer"):
        self.container = container
        self._current_config = self._create_default_config()
        self._presets: Dict[str, GenerationConfig] = {}
        
        # Try to get settings service for persistence
        try:
            from desktop.modern.core.interfaces.core_services import ISettingsCoordinator
            self.settings_service = container.resolve(ISettingsCoordinator)
        except Exception:
            self.settings_service = None
            logger.warning("Settings service not available - configurations will not persist")
        
        # Load saved configurations
        self._load_configurations()

    def get_current_config(self) -> GenerationConfig:
        """Get the current generation configuration."""
        return self._current_config

    def update_config(self, updates: Dict[str, Any]) -> None:
        """
        Update the current configuration with new values.
        
        Args:
            updates: Dictionary of configuration updates
        """
        try:
            # Create updated configuration
            self._current_config = self._current_config.with_updates(**updates)
            
            # Save to settings if available
            self._save_current_config()
            
            logger.debug(f"Configuration updated: {updates}")
            
        except Exception as e:
            logger.error(f"Failed to update configuration: {str(e)}")
            raise

    def save_config_as_preset(self, name: str) -> None:
        """
        Save current configuration as a named preset.
        
        Args:
            name: Preset name
        """
        if not name or not name.strip():
            raise ValueError("Preset name cannot be empty")
        
        # Clean the name
        clean_name = name.strip()
        
        # Save preset
        self._presets[clean_name] = self._current_config
        
        # Persist to settings if available
        self._save_presets()
        
        logger.info(f"Configuration saved as preset: {clean_name}")

    def load_config_preset(self, name: str) -> GenerationConfig:
        """
        Load a configuration preset by name.
        
        Args:
            name: Preset name
            
        Returns:
            Configuration from preset
        """
        if name not in self._presets:
            raise ValueError(f"Preset '{name}' not found")
        
        config = self._presets[name]
        self._current_config = config
        self._save_current_config()
        
        logger.info(f"Loaded configuration preset: {name}")
        return config

    def get_default_config(self) -> GenerationConfig:
        """Get the default generation configuration."""
        return self._create_default_config()

    def get_preset_names(self) -> List[str]:
        """Get list of available preset names."""
        return list(self._presets.keys())

    def delete_preset(self, name: str) -> None:
        """
        Delete a configuration preset.
        
        Args:
            name: Preset name to delete
        """
        if name not in self._presets:
            raise ValueError(f"Preset '{name}' not found")
        
        del self._presets[name]
        self._save_presets()
        
        logger.info(f"Deleted configuration preset: {name}")

    def reset_to_default(self) -> None:
        """Reset current configuration to default values."""
        self._current_config = self._create_default_config()
        self._save_current_config()
        logger.info("Configuration reset to default")

    def _create_default_config(self) -> GenerationConfig:
        """Create the default generation configuration."""
        return GenerationConfig(
            mode=GenerationMode.FREEFORM,
            length=16,
            level=1,
            turn_intensity=1.0,
            prop_continuity=PropContinuity.CONTINUOUS,
            letter_types={
                LetterType.TYPE1,
                LetterType.TYPE2,
                LetterType.TYPE3,
                LetterType.TYPE4,
                LetterType.TYPE5,
                LetterType.TYPE6,
            },
            slice_size=SliceSize.HALVED,
            cap_type=CAPType.STRICT_ROTATED,
        )

    def _load_configurations(self) -> None:
        """Load configurations from settings."""
        if not self.settings_service:
            return
        
        try:
            # Load current configuration
            current_config_data = self.settings_service.get_setting("generation.current_config")
            if current_config_data:
                self._current_config = self._deserialize_config(current_config_data)
            
            # Load presets
            presets_data = self.settings_service.get_setting("generation.presets")
            if presets_data:
                for name, config_data in presets_data.items():
                    try:
                        self._presets[name] = self._deserialize_config(config_data)
                    except Exception as e:
                        logger.warning(f"Failed to load preset '{name}': {str(e)}")
            
            logger.debug("Configurations loaded from settings")
            
        except Exception as e:
            logger.warning(f"Failed to load configurations: {str(e)}")

    def _save_current_config(self) -> None:
        """Save current configuration to settings."""
        if not self.settings_service:
            return
        
        try:
            config_data = self._serialize_config(self._current_config)
            self.settings_service.set_setting("generation.current_config", config_data)
        except Exception as e:
            logger.warning(f"Failed to save current configuration: {str(e)}")

    def _save_presets(self) -> None:
        """Save presets to settings."""
        if not self.settings_service:
            return
        
        try:
            presets_data = {}
            for name, config in self._presets.items():
                presets_data[name] = self._serialize_config(config)
            
            self.settings_service.set_setting("generation.presets", presets_data)
        except Exception as e:
            logger.warning(f"Failed to save presets: {str(e)}")

    def _serialize_config(self, config: GenerationConfig) -> Dict[str, Any]:
        """Serialize configuration to dictionary."""
        return {
            "mode": config.mode.value,
            "length": config.length,
            "level": config.level,
            "turn_intensity": config.turn_intensity,
            "prop_continuity": config.prop_continuity.value,
            "letter_types": [lt.value for lt in config.letter_types] if config.letter_types else [],
            "slice_size": config.slice_size.value,
            "cap_type": config.cap_type.value if config.cap_type else None,
            "start_position_key": config.start_position_key,
        }

    def _deserialize_config(self, data: Dict[str, Any]) -> GenerationConfig:
        """Deserialize configuration from dictionary."""
        # Convert enum values back to enums
        mode = GenerationMode(data.get("mode", "freeform"))
        prop_continuity = PropContinuity(data.get("prop_continuity", "continuous"))
        slice_size = SliceSize(data.get("slice_size", "halved"))
        
        cap_type = None
        if data.get("cap_type"):
            cap_type = CAPType(data["cap_type"])
        
        letter_types = None
        if data.get("letter_types"):
            letter_types = {LetterType(lt) for lt in data["letter_types"]}
        
        return GenerationConfig(
            mode=mode,
            length=data.get("length", 16),
            level=data.get("level", 1),
            turn_intensity=data.get("turn_intensity", 1.0),
            prop_continuity=prop_continuity,
            letter_types=letter_types,
            slice_size=slice_size,
            cap_type=cap_type,
            start_position_key=data.get("start_position_key"),
        )

    def export_config_to_file(self, filepath: str) -> None:
        """Export current configuration to JSON file."""
        try:
            config_data = self._serialize_config(self._current_config)
            with open(filepath, 'w') as f:
                json.dump(config_data, f, indent=2)
            logger.info(f"Configuration exported to: {filepath}")
        except Exception as e:
            logger.error(f"Failed to export configuration: {str(e)}")
            raise

    def import_config_from_file(self, filepath: str) -> None:
        """Import configuration from JSON file."""
        try:
            with open(filepath, 'r') as f:
                config_data = json.load(f)
            
            self._current_config = self._deserialize_config(config_data)
            self._save_current_config()
            
            logger.info(f"Configuration imported from: {filepath}")
        except Exception as e:
            logger.error(f"Failed to import configuration: {str(e)}")
            raise
