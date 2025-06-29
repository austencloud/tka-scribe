"""
Graph Editor Managers Package
============================

High-level coordination and state management components for the graph editor.

This package contains managers that handle:
- Animation coordination and control
- Layout management and calculations
- State management and synchronization
- Signal coordination between components
"""

# Manager imports
from .animation_controller import GraphEditorAnimationController
from .layout_manager import GraphEditorLayoutManager
from .state_manager import GraphEditorStateManager
from .signal_coordinator import GraphEditorSignalCoordinator

__all__ = [
    "GraphEditorAnimationController",
    "GraphEditorLayoutManager",
    "GraphEditorStateManager",
    "GraphEditorSignalCoordinator",
]
