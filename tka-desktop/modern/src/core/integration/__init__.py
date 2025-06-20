"""
TKA Desktop Integration Module

A+ Enhancement: Integration layer that connects all new A+ systems with the
existing TKA Desktop architecture, ensuring seamless compatibility and
enhanced functionality without breaking existing patterns.

ARCHITECTURE: Provides integration adapters, enhanced base classes, and
initialization helpers that bridge new systems with existing components.

EXPORTS:
- EnhancedComponentBase: Enhanced component base with A+ features
- IntegrationManager: Central integration coordinator
- SystemInitializer: A+ systems initialization helper
- CompatibilityAdapter: Backward compatibility adapter
"""

# Integration Components
from .enhanced_component_base import (
    EnhancedComponentBase,
    AsyncEnhancedComponentBase,
)

from .integration_manager import (
    IntegrationManager,
    integration_manager,
)

from .system_initializer import (
    SystemInitializer,
    initialize_a_plus_systems,
)

from .compatibility_adapter import (
    CompatibilityAdapter,
    LegacyComponentAdapter,
)

__all__ = [
    "EnhancedComponentBase",
    "AsyncEnhancedComponentBase",
    "IntegrationManager",
    "integration_manager",
    "SystemInitializer",
    "initialize_a_plus_systems",
    "CompatibilityAdapter",
    "LegacyComponentAdapter",
]
