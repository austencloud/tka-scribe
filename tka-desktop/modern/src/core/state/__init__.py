"""
TKA Desktop Lightweight UI State Management Module

A+ Enhancement: Simplified UI state management that centralizes UI-specific state
without the complexity of Redux patterns, complementing existing architecture.

ARCHITECTURE: Provides lightweight UI state management that works with existing
event bus, service layer, and dependency injection patterns.

EXPORTS:
- UIStateManager: Lightweight UI state management class
- UIStateChangedEvent: Event for UI state changes
- ui_state_manager: Global UI state manager instance
"""

# Lightweight UI State Management
from .ui_state_manager import (
    UIStateManager,
    UIStateChangedEvent,
    ui_state_manager,
)

__all__ = [
    "UIStateManager",
    "UIStateChangedEvent",
    "ui_state_manager",
]
