"""
Debug Start Position Rendering Integration Test

This test creates real components to debug the pictograph rendering issue.
"""

import logging

import pytest
from application.services.pictograph_pool_manager import PictographPoolManager
from core.application.application_factory import ApplicationFactory, ApplicationMode
from core.interfaces.start_position_services import IStartPositionDataService
from presentation.components.start_position_picker.enhanced_start_position_option import (
    EnhancedStartPositionOption,
)
from PyQt6.QtCore import QTimer
from PyQt6.QtWidgets import QApplication

logger = logging.getLogger(__name__)


@pytest.fixture
def app():
    """Create QApplication for testing."""
    app = QApplication.instance()
    if app is None:
        app = QApplication([])
    yield app


class TestStartPositionRenderingDebug:
    """Debug the start position rendering issue with real components."""

    def test_real_component_creation_and_data_loading(self, app):
        """Test creating a real enhanced start position option with real services."""
        try:
            # Create properly initialized container
            container = ApplicationFactory.create_app(ApplicationMode.PRODUCTION)

            # Initialize pool manager
            pool_manager = PictographPoolManager(container)
            pool_manager.initialize_pool()

            # Get data service
            data_service = container.resolve(IStartPositionDataService)

            # Create enhanced start position option
            option = EnhancedStartPositionOption(
                position_key="alpha1_alpha1",
                pool_manager=pool_manager,
                data_service=data_service,
                grid_mode="diamond",
                enhanced_styling=True,
            )

            # Check if component was created
            assert (
                option._pictograph_component is not None
            ), "Pictograph component should be created"

            # Check if data was loaded
            data_service_call_result = data_service.get_position_data(
                "alpha1_alpha1", "diamond"
            )
            assert (
                data_service_call_result is not None
            ), "Data service should return pictograph data"

            logger.info(f"✅ Component created successfully")
            logger.info(f"✅ Pictograph component: {option._pictograph_component}")
            logger.info(f"✅ Data loaded: {data_service_call_result}")

            # Show the component to see if it renders
            option.show()

            # Process events to allow rendering
            app.processEvents()

            # Check if component is visible
            assert option.isVisible(), "Component should be visible"

            # Clean up
            option.hide()
            pool_manager.checkin_pictograph(option._pictograph_component)

        except Exception as e:
            logger.error(f"❌ Test failed with error: {e}")
            raise

    def test_data_service_directly(self, app):
        """Test the data service directly to see what data it returns."""
        try:
            container = ApplicationFactory.create_app(ApplicationMode.PRODUCTION)
            data_service = container.resolve(IStartPositionDataService)

            # Test different position keys
            test_positions = ["alpha1_alpha1", "beta5_beta5", "gamma11_gamma11"]

            for position_key in test_positions:
                pictograph_data = data_service.get_position_data(
                    position_key, "diamond"
                )

                logger.info(f"Position {position_key}:")
                if pictograph_data:
                    logger.info(f"  ✅ Data found: {pictograph_data.letter}")
                    logger.info(f"  ✅ Arrows: {list(pictograph_data.arrows.keys())}")
                    logger.info(f"  ✅ Motions: {list(pictograph_data.motions.keys())}")
                    logger.info(f"  ✅ Glyph data: {pictograph_data.glyph_data}")
                else:
                    logger.warning(f"  ❌ No data found for {position_key}")

                assert (
                    pictograph_data is not None
                ), f"Should have data for {position_key}"

        except Exception as e:
            logger.error(f"❌ Data service test failed: {e}")
            raise

    def test_pool_manager_directly(self, app):
        """Test the pool manager directly to see if it creates components."""
        try:
            container = ApplicationFactory.create_app(ApplicationMode.PRODUCTION)
            pool_manager = PictographPoolManager(container)
            pool_manager.initialize_pool()

            # Check pool stats
            stats = pool_manager.get_pool_stats()
            logger.info(f"Pool stats: {stats}")

            # Checkout a component
            component = pool_manager.checkout_pictograph()

            assert component is not None, "Pool should provide a component"
            logger.info(f"✅ Component checked out: {component}")
            logger.info(f"✅ Component type: {type(component)}")

            # Check if component has scene
            if hasattr(component, "scene"):
                logger.info(f"✅ Component has scene: {component.scene}")
            else:
                logger.warning("❌ Component has no scene attribute")

            # Check in component
            pool_manager.checkin_pictograph(component)

            # Check pool stats after checkin
            stats_after = pool_manager.get_pool_stats()
            logger.info(f"Pool stats after checkin: {stats_after}")

        except Exception as e:
            logger.error(f"❌ Pool manager test failed: {e}")
            raise

    def test_pictograph_component_rendering(self, app):
        """Test if pictograph component can render data directly."""
        try:
            container = ApplicationFactory.create_app(ApplicationMode.PRODUCTION)
            pool_manager = PictographPoolManager(container)
            pool_manager.initialize_pool()
            data_service = container.resolve(IStartPositionDataService)

            # Get component and data
            component = pool_manager.checkout_pictograph()
            pictograph_data = data_service.get_position_data("alpha1_alpha1", "diamond")

            assert component is not None, "Should have component"
            assert pictograph_data is not None, "Should have data"

            # Try to update component with data
            logger.info("Attempting to update component with pictograph data...")
            component.update_from_pictograph_data(pictograph_data)

            # Process events
            app.processEvents()

            logger.info("✅ Component updated successfully")

            # Check if scene has items
            if hasattr(component, "scene") and component.scene:
                items = component.scene.items()
                logger.info(f"Scene items count: {len(items)}")
                for i, item in enumerate(items):
                    logger.info(f"  Item {i}: {type(item)}")

            # Clean up
            pool_manager.checkin_pictograph(component)

        except Exception as e:
            logger.error(f"❌ Pictograph rendering test failed: {e}")
            raise


if __name__ == "__main__":
    # Enable debug logging
    logging.basicConfig(level=logging.DEBUG)
    pytest.main([__file__, "-v", "-s"])
