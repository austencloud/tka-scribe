"""
System initializer for A+ enhancements.
"""

from typing import Optional, Dict, Any
from pathlib import Path

from core.types.result import Result
from core.logging.structured_logger import get_logger, LogContext
from core.events import IEventBus
from .integration_manager import get_integration_manager

logger = get_logger(__name__)


class SystemInitializer:
    """
    Helper class for initializing A+ systems in TKA Desktop.
    
    Provides convenient methods for integrating A+ enhancements
    into existing TKA Desktop startup procedures.
    """
    
    @staticmethod
    def initialize_a_plus_systems(event_bus: Optional[IEventBus] = None, 
                                 config_path: Optional[Path] = None) -> Result[Dict[str, Any], Exception]:
        """
        Initialize all A+ systems for TKA Desktop.
        
        Args:
            event_bus: Optional event bus instance
            config_path: Optional path to configuration file
            
        Returns:
            Result containing initialization status
        """
        try:
            logger.info(
                "Initializing A+ systems for TKA Desktop",
                context=LogContext(
                    operation="a_plus_init",
                    component="system_initializer"
                )
            )
            
            # Get integration manager
            manager = get_integration_manager(event_bus)
            
            # Initialize all systems
            init_result = manager.initialize_all_systems()
            
            if init_result.is_error():
                return Result.error(init_result.unwrap_error())
            
            # Get status
            status = manager.get_integration_status()
            
            logger.info(
                "A+ systems initialization completed",
                context=LogContext(
                    operation="a_plus_init_complete",
                    component="system_initializer"
                ),
                status=status['status'],
                success_rate=status['success_rate']
            )
            
            return Result.ok(status)
            
        except Exception as e:
            logger.error(
                "Failed to initialize A+ systems",
                error=e,
                context=LogContext(
                    operation="a_plus_init_error",
                    component="system_initializer"
                )
            )
            return Result.error(e)
    
    @staticmethod
    def shutdown_a_plus_systems() -> Result[None, Exception]:
        """
        Shutdown all A+ systems gracefully.
        
        Returns:
            Result indicating shutdown success/failure
        """
        try:
            logger.info(
                "Shutting down A+ systems",
                context=LogContext(
                    operation="a_plus_shutdown",
                    component="system_initializer"
                )
            )
            
            manager = get_integration_manager()
            return manager.shutdown_all_systems()
            
        except Exception as e:
            logger.error(
                "Failed to shutdown A+ systems",
                error=e,
                context=LogContext(
                    operation="a_plus_shutdown_error",
                    component="system_initializer"
                )
            )
            return Result.error(e)


# Convenience function for easy integration
def initialize_a_plus_systems(event_bus: Optional[IEventBus] = None) -> Result[Dict[str, Any], Exception]:
    """
    Convenience function to initialize A+ systems.
    
    Args:
        event_bus: Optional event bus instance
        
    Returns:
        Result containing initialization status
    """
    return SystemInitializer.initialize_a_plus_systems(event_bus)
