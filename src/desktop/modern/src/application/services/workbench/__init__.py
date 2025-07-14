"""
Workbench Services - Framework-Agnostic Business Logic

This module contains the framework-agnostic business services for workbench functionality.
These services are completely decoupled from Qt and can be used in any presentation layer.

Components:
- WorkbenchStateManager: State management for workbench
- WorkbenchOperationCoordinator: Operation coordination and execution
- WorkbenchSessionManager: Session restoration management
- BeatSelectionService: Beat selection business logic
"""

from .beat_selection_service import BeatSelectionService
from .workbench_state_manager import (
    WorkbenchStateManager,
    WorkbenchState,
    StateChangeResult,
)
from .workbench_operation_coordinator import (
    WorkbenchOperationCoordinator,
    OperationType,
    OperationResult,
)
from .workbench_session_manager import (
    WorkbenchSessionManager,
    SessionRestorationPhase,
    SessionRestorationResult,
)

__all__ = [
    # Business Services
    "BeatSelectionService",
    "WorkbenchStateManager",
    "WorkbenchOperationCoordinator", 
    "WorkbenchSessionManager",
    
    # State Management
    "WorkbenchState",
    "StateChangeResult",
    
    # Operation Coordination
    "OperationType",
    "OperationResult",
    
    # Session Management
    "SessionRestorationPhase",
    "SessionRestorationResult",
]
