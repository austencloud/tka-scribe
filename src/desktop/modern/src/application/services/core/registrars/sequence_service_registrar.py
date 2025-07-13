"""
Sequence Service Registrar

Handles registration of sequence-related services following microservices architecture.
This registrar manages services for sequence operations, validation, persistence,
and management.

Services Registered:
- BeatFactory: Factory for creating beat objects
- SequencePersister: Sequence persistence operations
- SequenceRepository: Sequence data repository
- SequenceValidator: Sequence validation logic
- SequenceLoader: Sequence loading operations
- SequenceBeatOperations: Beat manipulation operations
- SequenceStartPositionManager: Start position management
"""

import logging
from typing import TYPE_CHECKING, List

from ..service_registration_manager import BaseServiceRegistrar

if TYPE_CHECKING:
    from core.dependency_injection.di_container import DIContainer

logger = logging.getLogger(__name__)


class SequenceServiceRegistrar(BaseServiceRegistrar):
    """
    Registrar for sequence-related services.
    
    Medium complexity registrar handling sequence operations, validation,
    persistence, and management services. These services are critical for
    sequence functionality in the application.
    """
    
    def get_domain_name(self) -> str:
        """Get the name of the service domain this registrar handles."""
        return "Sequence Services"
    
    def is_critical(self) -> bool:
        """Sequence services are critical for application functionality."""
        return True
    
    def register_services(self, container: "DIContainer") -> None:
        """Register sequence services with interface bindings."""
        self._update_progress("Registering sequence services...")
        
        try:
            # Import sequence service interfaces and implementations
            from application.services.sequence.beat_factory import BeatFactory, IBeatFactory
            from application.services.sequence.loader import SequenceLoader
            from application.services.sequence.sequence_beat_operations import (
                SequenceBeatOperations,
            )
            from application.services.sequence.sequence_persister import (
                ISequencePersister,
                SequencePersister,
            )
            from application.services.sequence.sequence_repository import (
                ISequenceRepository,
                SequenceRepository,
            )
            from application.services.sequence.sequence_start_position_manager import (
                SequenceStartPositionManager,
            )
            from application.services.sequence.sequence_validator import (
                ISequenceValidator,
                SequenceValidator,
            )
            
            # Register sequence services with interfaces
            container.register_singleton(IBeatFactory, BeatFactory)
            self._mark_service_available("BeatFactory")
            
            container.register_singleton(ISequencePersister, SequencePersister)
            self._mark_service_available("SequencePersister")
            
            container.register_singleton(ISequenceRepository, SequenceRepository)
            self._mark_service_available("SequenceRepository")
            
            container.register_singleton(ISequenceValidator, SequenceValidator)
            self._mark_service_available("SequenceValidator")
            
            # Register services without interfaces yet
            container.register_singleton(SequenceLoader, SequenceLoader)
            self._mark_service_available("SequenceLoader")
            
            container.register_singleton(SequenceBeatOperations, SequenceBeatOperations)
            self._mark_service_available("SequenceBeatOperations")
            
            container.register_singleton(
                SequenceStartPositionManager, SequenceStartPositionManager
            )
            self._mark_service_available("SequenceStartPositionManager")
            
            self._update_progress("Sequence services registered successfully")
            
        except ImportError as e:
            error_msg = f"Failed to register sequence services: {e}"
            logger.error(error_msg)
            
            # Sequence services are critical, so re-raise the error
            if self.is_critical():
                raise ImportError(f"Critical sequence services unavailable: {e}") from e
