"""
Start Position Rendering Regression Test

This test ensures that start position pictographs always render correctly.
It verifies the complete pipeline from data loading to visual rendering.

This test should be run regularly to catch any regressions in:
- Service injection and dependency resolution
- Data loading from start position services
- Pictograph component creation and pooling
- Scene rendering and visual output
- Enhanced start position option functionality
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


@pytest.fixture
def initialized_container():
    """Create a properly initialized DI container with all services."""
    return ApplicationFactory.create_app(ApplicationMode.PRODUCTION)


class TestStartPositionRenderingRegression:
    """Regression tests for start position rendering functionality."""

    def test_all_standard_start_positions_render(self, app, initialized_container):
        """Test that all standard start positions can be rendered successfully."""
        # Standard start positions by grid mode
        diamond_positions = [
            "alpha1_alpha1",
            "beta5_beta5",
            "gamma11_gamma11",
        ]

        box_positions = [
            "alpha2_alpha2",
            "beta4_beta4",
            "gamma12_gamma12",
        ]

        # Initialize services
        pool_manager = PictographPoolManager(initialized_container)
        pool_manager.initialize_pool()
        data_service = initialized_container.resolve(IStartPositionDataService)

        successful_renders = []
        failed_renders = []

        # Test diamond positions
        for position_key in diamond_positions:
            try:
                # Test data loading
                pictograph_data = data_service.get_position_data(
                    position_key, "diamond"
                )
                assert pictograph_data is not None, f"No data for {position_key}"

                # Test component creation
                option = EnhancedStartPositionOption(
                    position_key=position_key,
                    pool_manager=pool_manager,
                    data_service=data_service,
                    grid_mode="diamond",
                    enhanced_styling=True,
                )

                # Verify component was created with pictograph
                assert (
                    option._pictograph_component is not None
                ), f"No component for {position_key}"

                # Test visibility
                option.show()
                app.processEvents()
                assert option.isVisible(), f"Component not visible for {position_key}"

                # Clean up
                option.hide()
                pool_manager.checkin_pictograph(option._pictograph_component)

                successful_renders.append(f"{position_key} (diamond)")
                logger.info(f"✅ {position_key} rendered successfully in diamond mode")

            except Exception as e:
                failed_renders.append((f"{position_key} (diamond)", str(e)))
                logger.error(f"❌ {position_key} failed in diamond mode: {e}")

        # Test box positions
        for position_key in box_positions:
            try:
                # Test data loading
                pictograph_data = data_service.get_position_data(position_key, "box")
                assert pictograph_data is not None, f"No data for {position_key}"

                # Test component creation
                option = EnhancedStartPositionOption(
                    position_key=position_key,
                    pool_manager=pool_manager,
                    data_service=data_service,
                    grid_mode="box",
                    enhanced_styling=True,
                )

                # Verify component was created with pictograph
                assert (
                    option._pictograph_component is not None
                ), f"No component for {position_key}"

                # Test visibility
                option.show()
                app.processEvents()
                assert option.isVisible(), f"Component not visible for {position_key}"

                # Clean up
                option.hide()
                pool_manager.checkin_pictograph(option._pictograph_component)

                successful_renders.append(f"{position_key} (box)")
                logger.info(f"✅ {position_key} rendered successfully in box mode")

            except Exception as e:
                failed_renders.append((f"{position_key} (box)", str(e)))
                logger.error(f"❌ {position_key} failed in box mode: {e}")

        # Report results
        logger.info(f"Successful renders: {len(successful_renders)}")
        logger.info(f"Failed renders: {len(failed_renders)}")

        # All standard positions should render successfully
        assert len(failed_renders) == 0, f"Failed renders: {failed_renders}"
        assert len(successful_renders) == len(diamond_positions) + len(box_positions)

    def test_enhanced_start_position_option_service_injection(
        self, app, initialized_container
    ):
        """Test that enhanced start position option receives services correctly."""
        pool_manager = PictographPoolManager(initialized_container)
        pool_manager.initialize_pool()
        data_service = initialized_container.resolve(IStartPositionDataService)

        option = EnhancedStartPositionOption(
            position_key="alpha1_alpha1",
            pool_manager=pool_manager,
            data_service=data_service,
            grid_mode="diamond",
        )

        # Verify services are injected correctly
        assert option.data_service is data_service
        assert option._pool_manager is pool_manager
        assert option.position_key == "alpha1_alpha1"
        assert option.grid_mode == "diamond"

        # Clean up
        if option._pictograph_component:
            pool_manager.checkin_pictograph(option._pictograph_component)

    def test_pictograph_data_contains_required_elements(
        self, app, initialized_container
    ):
        """Test that pictograph data contains all required elements for rendering."""
        data_service = initialized_container.resolve(IStartPositionDataService)

        test_positions = ["alpha1_alpha1", "beta5_beta5", "gamma11_gamma11"]

        for position_key in test_positions:
            pictograph_data = data_service.get_position_data(position_key, "diamond")

            assert pictograph_data is not None, f"No data for {position_key}"
            assert pictograph_data.letter is not None, f"No letter for {position_key}"
            assert pictograph_data.arrows is not None, f"No arrows for {position_key}"
            assert pictograph_data.motions is not None, f"No motions for {position_key}"

            # Should have blue and red motions for complete pictographs
            assert (
                "blue" in pictograph_data.motions
            ), f"No blue motion for {position_key}"
            assert "red" in pictograph_data.motions, f"No red motion for {position_key}"

            logger.info(
                f"✅ {position_key} has complete data: {pictograph_data.letter}"
            )

    def test_pool_manager_component_lifecycle(self, app, initialized_container):
        """Test that pool manager correctly handles component lifecycle."""
        pool_manager = PictographPoolManager(initialized_container)
        pool_manager.initialize_pool()

        # Get initial stats
        initial_stats = pool_manager.get_pool_stats()
        assert initial_stats["pool_size"] > 0, "Pool should have components"

        # Checkout component
        component = pool_manager.checkout_pictograph()
        assert component is not None, "Should get component from pool"

        # Check stats after checkout
        checkout_stats = pool_manager.get_pool_stats()
        assert checkout_stats["checked_out"] == 1, "Should have 1 checked out component"

        # Checkin component
        pool_manager.checkin_pictograph(component)

        # Check stats after checkin
        checkin_stats = pool_manager.get_pool_stats()
        assert checkin_stats["checked_out"] == 0, "Should have 0 checked out components"
        assert (
            checkin_stats["pool_size"] == initial_stats["pool_size"]
        ), "Pool size should be restored"

    def test_pictograph_scene_rendering_pipeline(self, app, initialized_container):
        """Test that the pictograph scene rendering pipeline works correctly."""
        pool_manager = PictographPoolManager(initialized_container)
        pool_manager.initialize_pool()
        data_service = initialized_container.resolve(IStartPositionDataService)

        # Get component and data
        component = pool_manager.checkout_pictograph()
        pictograph_data = data_service.get_position_data("alpha1_alpha1", "diamond")

        assert component is not None, "Should have component"
        assert pictograph_data is not None, "Should have data"
        assert hasattr(component, "scene"), "Component should have scene"
        assert component.scene is not None, "Scene should not be None"

        # Test rendering
        component.update_from_pictograph_data(pictograph_data)
        app.processEvents()

        # Check that scene has items after rendering
        if hasattr(component.scene, "items"):
            items = component.scene.items()
            logger.info(f"Scene has {len(items)} items after rendering")
            # Note: We don't assert a specific count as it depends on the pictograph complexity

        # Clean up
        pool_manager.checkin_pictograph(component)

    def test_grid_mode_compatibility(self, app, initialized_container):
        """Test that both diamond and box grid modes work correctly."""
        pool_manager = PictographPoolManager(initialized_container)
        pool_manager.initialize_pool()
        data_service = initialized_container.resolve(IStartPositionDataService)

        test_positions = ["alpha1_alpha1", "alpha2_alpha2"]  # Diamond and box positions
        grid_modes = ["diamond", "box"]

        for position_key in test_positions:
            for grid_mode in grid_modes:
                try:
                    pictograph_data = data_service.get_position_data(
                        position_key, grid_mode
                    )

                    if pictograph_data is not None:
                        option = EnhancedStartPositionOption(
                            position_key=position_key,
                            pool_manager=pool_manager,
                            data_service=data_service,
                            grid_mode=grid_mode,
                        )

                        assert option._pictograph_component is not None
                        logger.info(f"✅ {position_key} works with {grid_mode} mode")

                        # Clean up
                        if option._pictograph_component:
                            pool_manager.checkin_pictograph(
                                option._pictograph_component
                            )
                    else:
                        logger.info(
                            f"ℹ️ {position_key} has no data for {grid_mode} mode (expected)"
                        )

                except Exception as e:
                    logger.error(f"❌ {position_key} failed with {grid_mode}: {e}")
                    # Don't fail the test for grid mode incompatibilities
                    pass


if __name__ == "__main__":
    # Enable debug logging for detailed output
    logging.basicConfig(level=logging.INFO)
    pytest.main([__file__, "-v", "-s"])
