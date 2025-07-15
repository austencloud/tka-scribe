"""
Test Advanced Start Position Picker Consolidation

This test verifies that the AdvancedStartPositionPicker now properly uses
EnhancedStartPositionOption with the correct services and sizing.
"""

import pytest
import logging
from PyQt6.QtWidgets import QApplication

from core.application.application_factory import ApplicationFactory, ApplicationMode
from application.services.pictograph_pool_manager import PictographPoolManager
from core.interfaces.start_position_services import (
    IStartPositionDataService,
    IStartPositionSelectionService,
    IStartPositionUIService,
    IStartPositionOrchestrator,
)
from presentation.components.start_position_picker.advanced_start_position_picker import (
    AdvancedStartPositionPicker,
)
from presentation.components.start_position_picker.enhanced_start_position_option import (
    EnhancedStartPositionOption,
)

logger = logging.getLogger(__name__)


@pytest.fixture
def app():
    """Create QApplication for testing."""
    app = QApplication.instance()
    if app is None:
        app = QApplication([])
    yield app


@pytest.fixture
def initialized_container():
    """Create a properly initialized DI container with all services."""
    return ApplicationFactory.create_app(ApplicationMode.PRODUCTION)


class TestAdvancedPickerConsolidation:
    """Test the consolidated advanced start position picker."""

    def test_advanced_picker_uses_enhanced_options(self, app, initialized_container):
        """Test that AdvancedStartPositionPicker creates EnhancedStartPositionOption instances."""
        # Initialize services
        pool_manager = PictographPoolManager(initialized_container)
        pool_manager.initialize_pool()
        
        data_service = initialized_container.resolve(IStartPositionDataService)
        selection_service = initialized_container.resolve(IStartPositionSelectionService)
        ui_service = initialized_container.resolve(IStartPositionUIService)
        orchestrator = initialized_container.resolve(IStartPositionOrchestrator)
        
        # Create advanced picker
        advanced_picker = AdvancedStartPositionPicker(
            pool_manager=pool_manager,
            data_service=data_service,
            selection_service=selection_service,
            ui_service=ui_service,
            orchestrator=orchestrator,
            grid_mode="diamond",
        )
        
        # Show the picker to trigger position loading
        advanced_picker.show()
        app.processEvents()
        
        # Verify that position options were created
        assert len(advanced_picker.position_options) > 0, "Should have position options"
        
        # Verify that all options are EnhancedStartPositionOption instances
        for option in advanced_picker.position_options:
            assert isinstance(option, EnhancedStartPositionOption), \
                f"Expected EnhancedStartPositionOption, got {type(option)}"
            
            # Verify that the option has the correct services
            assert option.data_service is data_service, "Option should have correct data service"
            assert option._pool_manager is pool_manager, "Option should have correct pool manager"
        
        logger.info(f"✅ Advanced picker created {len(advanced_picker.position_options)} enhanced options")
        
        # Clean up
        advanced_picker.hide()
        for option in advanced_picker.position_options:
            if option._pictograph_component:
                pool_manager.checkin_pictograph(option._pictograph_component)

    def test_advanced_picker_sizing_formula(self, app, initialized_container):
        """Test that advanced picker uses 1/12th sizing formula."""
        # Initialize services
        pool_manager = PictographPoolManager(initialized_container)
        pool_manager.initialize_pool()
        
        data_service = initialized_container.resolve(IStartPositionDataService)
        selection_service = initialized_container.resolve(IStartPositionSelectionService)
        ui_service = initialized_container.resolve(IStartPositionUIService)
        orchestrator = initialized_container.resolve(IStartPositionOrchestrator)
        
        # Create advanced picker
        advanced_picker = AdvancedStartPositionPicker(
            pool_manager=pool_manager,
            data_service=data_service,
            selection_service=selection_service,
            ui_service=ui_service,
            orchestrator=orchestrator,
            grid_mode="diamond",
        )
        
        # Set a known window size for testing
        advanced_picker.resize(1200, 800)
        advanced_picker.show()
        app.processEvents()
        
        # Check that options exist and have reasonable sizes
        assert len(advanced_picker.position_options) > 0, "Should have position options"
        
        for option in advanced_picker.position_options:
            size = option.size()
            width = size.width()
            height = size.height()
            
            # Should be roughly 1/12th of 1200px = 100px, with min/max constraints
            assert 100 <= width <= 250, f"Width {width} should be between 100-250px"
            assert 100 <= height <= 250, f"Height {height} should be between 100-250px"
            
            logger.info(f"✅ Option size: {width}x{height}px")
        
        # Clean up
        advanced_picker.hide()
        for option in advanced_picker.position_options:
            if option._pictograph_component:
                pool_manager.checkin_pictograph(option._pictograph_component)

    def test_advanced_picker_pictograph_loading(self, app, initialized_container):
        """Test that pictographs load correctly in the advanced picker."""
        # Initialize services
        pool_manager = PictographPoolManager(initialized_container)
        pool_manager.initialize_pool()
        
        data_service = initialized_container.resolve(IStartPositionDataService)
        selection_service = initialized_container.resolve(IStartPositionSelectionService)
        ui_service = initialized_container.resolve(IStartPositionUIService)
        orchestrator = initialized_container.resolve(IStartPositionOrchestrator)
        
        # Create advanced picker
        advanced_picker = AdvancedStartPositionPicker(
            pool_manager=pool_manager,
            data_service=data_service,
            selection_service=selection_service,
            ui_service=ui_service,
            orchestrator=orchestrator,
            grid_mode="diamond",
        )
        
        # Show the picker to trigger position loading
        advanced_picker.show()
        app.processEvents()
        
        # Verify that pictographs are loaded
        loaded_count = 0
        for option in advanced_picker.position_options:
            if option._pictograph_component is not None:
                loaded_count += 1
                logger.info(f"✅ Option {option.position_key} has pictograph component")
        
        assert loaded_count > 0, "At least some options should have pictograph components"
        logger.info(f"✅ {loaded_count}/{len(advanced_picker.position_options)} options have pictographs")
        
        # Clean up
        advanced_picker.hide()
        for option in advanced_picker.position_options:
            if option._pictograph_component:
                pool_manager.checkin_pictograph(option._pictograph_component)


if __name__ == "__main__":
    # Enable debug logging
    logging.basicConfig(level=logging.INFO)
    pytest.main([__file__, "-v", "-s"])
