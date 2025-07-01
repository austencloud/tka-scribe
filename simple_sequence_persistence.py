"""
Simple Sequence Persistence - Legacy Style

A simplified version that just saves/restores the current sequence
like the legacy version, but with modern TKA integration.
"""

import json
import logging
from pathlib import Path
from typing import Optional, Any
from datetime import datetime

logger = logging.getLogger(__name__)


class SimpleSequencePersistence:
    """
    Simple sequence persistence that mimics the legacy approach.
    Just saves/restores the current sequence to current_sequence.json
    """
    
    def __init__(self, file_system_service):
        self.file_system_service = file_system_service
        
        # Use same location as legacy - alongside user_settings.json
        modern_dir = Path(__file__).parent.parent / "src" / "desktop" / "modern"
        self.sequence_file = modern_dir / "current_sequence.json"
        
        logger.info(f"Simple sequence persistence initialized: {self.sequence_file}")
    
    def save_current_sequence(self, sequence_data: Any, sequence_id: str) -> bool:
        """Save current sequence to JSON file (legacy style)."""
        try:
            # Convert sequence data to serializable format
            if hasattr(sequence_data, '__dict__'):
                if hasattr(sequence_data, '__dataclass_fields__'):
                    from dataclasses import asdict
                    serializable_data = asdict(sequence_data)
                else:
                    serializable_data = vars(sequence_data)
            else:
                serializable_data = sequence_data
            
            # Create simple JSON structure like legacy
            sequence_json = {
                "sequence_id": sequence_id,
                "sequence_data": serializable_data,
                "last_modified": datetime.now().isoformat(),
                "tka_version": "modern"
            }
            
            # Write to file
            self.file_system_service.write_file(
                self.sequence_file,
                json.dumps(sequence_json, indent=2)
            )
            
            logger.debug(f"Saved current sequence: {sequence_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to save current sequence: {e}")
            return False
    
    def load_current_sequence(self) -> Optional[dict]:
        """Load current sequence from JSON file (legacy style)."""
        try:
            if not self.sequence_file.exists():
                logger.info("No current sequence file found")
                return None
            
            # Read and parse JSON
            content = self.file_system_service.read_file(self.sequence_file)
            sequence_json = json.loads(content)
            
            # Basic validation
            if "sequence_id" not in sequence_json or "sequence_data" not in sequence_json:
                logger.warning("Invalid sequence file format")
                return None
            
            logger.info(f"Loaded current sequence: {sequence_json['sequence_id']}")
            return sequence_json
            
        except json.JSONDecodeError:
            logger.error("Corrupted sequence file - starting fresh")
            return None
        except Exception as e:
            logger.error(f"Failed to load current sequence: {e}")
            return None
    
    def clear_current_sequence(self) -> bool:
        """Clear the current sequence file."""
        try:
            if self.sequence_file.exists():
                self.sequence_file.unlink()
            logger.info("Cleared current sequence")
            return True
        except Exception as e:
            logger.error(f"Failed to clear current sequence: {e}")
            return False


# Integration with TKA Services
class SimpleSequenceService:
    """
    Service that integrates simple sequence persistence with TKA.
    Drop-in replacement for complex session management.
    """
    
    def __init__(self, file_system_service, ui_state_service):
        self.persistence = SimpleSequencePersistence(file_system_service)
        self.ui_state_service = ui_state_service
        self._current_sequence_id = None
    
    def save_sequence(self, sequence_data: Any, sequence_id: str) -> None:
        """Save sequence and update UI state."""
        # Save to file
        success = self.persistence.save_current_sequence(sequence_data, sequence_id)
        
        if success:
            self._current_sequence_id = sequence_id
            # Update UI state setting
            self.ui_state_service.set_setting("current_sequence_id", sequence_id)
    
    def restore_sequence_on_startup(self) -> Optional[dict]:
        """Restore sequence on application startup."""
        sequence_json = self.persistence.load_current_sequence()
        
        if sequence_json:
            self._current_sequence_id = sequence_json["sequence_id"]
            # Update UI state
            self.ui_state_service.set_setting("current_sequence_id", self._current_sequence_id)
            
            print(f"✅ Restored sequence: {self._current_sequence_id}")
            return sequence_json
        
        print("ℹ️ No sequence to restore")
        return None
    
    def get_current_sequence_id(self) -> Optional[str]:
        """Get current sequence ID."""
        return self._current_sequence_id


# Usage Example:
def integrate_simple_persistence():
    """
    Example of how to integrate simple sequence persistence.
    Add this to your workbench or sequence management code.
    """
    
    # Get services from DI container
    from core.application.application_factory import ApplicationFactory
    container = ApplicationFactory.create_production_app()
    
    file_system_service = container.resolve("IFileSystemService")  # Adjust interface name
    ui_state_service = container.resolve("IUIStateManagementService")
    
    # Create simple sequence service
    sequence_service = SimpleSequenceService(file_system_service, ui_state_service)
    
    # On application startup:
    restored_sequence = sequence_service.restore_sequence_on_startup()
    if restored_sequence:
        # Load the sequence into your workbench
        sequence_data = restored_sequence["sequence_data"]
        # workbench.set_sequence(sequence_data)
    
    # When sequence changes:
    # sequence_service.save_sequence(sequence_data, sequence_id)
    
    return sequence_service


if __name__ == "__main__":
    # Test the simple persistence
    print("Testing simple sequence persistence...")
    
    # This would be integrated into your actual TKA startup code
    service = integrate_simple_persistence()
    print("Simple sequence persistence ready!")
