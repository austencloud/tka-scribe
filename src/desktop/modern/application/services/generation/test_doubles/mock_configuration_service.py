"""
Mock Configuration Service for Testing

Provides simple mock implementation of sequence configuration service.
"""

from typing import Any, Dict, List

from desktop.modern.core.interfaces.generation_services import ISequenceConfigurationService
from desktop.modern.domain.models.generation_models import GenerationConfig


class MockSequenceConfigurationService(ISequenceConfigurationService):
    """Mock configuration service for testing."""
    
    def __init__(self, container):
        self.container = container
        self._current_config = GenerationConfig()
        self._presets = {}

    def get_current_config(self) -> GenerationConfig:
        return self._current_config

    def update_config(self, updates: Dict[str, Any]) -> None:
        self._current_config = self._current_config.with_updates(**updates)

    def save_config_as_preset(self, name: str) -> None:
        self._presets[name] = self._current_config

    def load_config_preset(self, name: str) -> GenerationConfig:
        return self._presets.get(name, self._current_config)

    def get_default_config(self) -> GenerationConfig:
        return GenerationConfig()

    def get_preset_names(self) -> List[str]:
        return list(self._presets.keys())
