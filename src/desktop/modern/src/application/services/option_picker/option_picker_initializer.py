"""
Option Picker Initialization Service

Pure service for handling complex option picker initialization logic.
Extracted from OptionPicker to follow single responsibility principle.

This service handles:
- Component creation and dependency resolution
- Widget hierarchy setup
- Service initialization coordination
- Progress reporting during initialization

Uses dependency injection and follows TKA's clean architecture.
"""

import logging
from typing import Any, Callable, Dict, Optional, Tuple

from core.dependency_injection.di_container import DIContainer
from core.interfaces.core_services import ILayoutService
from core.interfaces.option_picker_interfaces import IOptionPickerInitializer
from PyQt6.QtWidgets import QVBoxLayout, QWidget

logger = logging.getLogger(__name__)


class OptionPickerInitializer(IOptionPickerInitializer):
    """
    Pure service for option picker initialization logic.

    Handles the complex initialization sequence without any UI concerns.
    Coordinates service creation and dependency resolution.
    """

    def __init__(self):
        """Initialize the initialization service."""

    def initialize_components(
        self,
        container: DIContainer,
        progress_callback: Optional[Callable[[str, float], None]] = None,
    ) -> Dict[str, Any]:
        """
        Initialize all option picker components.

        Args:
            container: DI container for service resolution
            progress_callback: Optional progress reporting callback

        Returns:
            Dictionary containing initialized components
        """
        components = {}

        try:
            if progress_callback:
                progress_callback("Resolving layout service", 0.1)

            # Resolve core services
            layout_service = container.resolve(ILayoutService)
            components["layout_service"] = layout_service

            if progress_callback:
                progress_callback("Creating widget factory", 0.15)

            # Create widget factory
            from application.services.option_picker.option_picker_widget_factory import (
                OptionPickerWidgetFactory,
            )

            widget_factory = OptionPickerWidgetFactory(container)
            components["widget_factory"] = widget_factory

            if progress_callback:
                progress_callback("Initializing pool manager", 0.25)

            # Pool manager will be created after widget hierarchy
            components["pool_manager"] = None

            if progress_callback:
                progress_callback("Initializing option service", 0.35)

            # Resolve option service from DI container
            from core.interfaces.option_picker_interfaces import IOptionProvider

            option_service = container.resolve(IOptionProvider)
            components["option_service"] = option_service

            if progress_callback:
                progress_callback("Components initialized", 0.4)

            return components

        except Exception as e:
            logger.error(f"Error initializing components: {e}")
            raise

    def create_widget_hierarchy(
        self, container: DIContainer, resize_callback: Callable[[], None]
    ) -> Tuple[QWidget, QWidget, QVBoxLayout, QWidget]:
        """
        Create the widget hierarchy for option picker.

        Args:
            container: DI container for service resolution
            resize_callback: Callback for widget resize events

        Returns:
            Tuple of (main_widget, sections_container, sections_layout, filter_widget)
        """
        try:
            from application.services.option_picker.option_picker_widget_factory import (
                OptionPickerWidgetFactory,
            )

            widget_factory = OptionPickerWidgetFactory(container)

            return widget_factory.create_widget(resize_callback)

        except Exception as e:
            logger.error(f"Error creating widget hierarchy: {e}")
            raise

    def create_pool_manager(
        self,
        main_widget: QWidget,
        pictograph_click_handler: Callable[[str], None],
        pictograph_data_click_handler: Callable[[object], None],
    ) -> Any:
        """
        Create and configure the pictograph pool manager.

        Args:
            main_widget: Main widget for pool manager
            pictograph_click_handler: Handler for pictograph clicks
            pictograph_data_click_handler: Handler for pictograph data clicks

        Returns:
            Configured pool manager
        """
        try:
            from application.services.option_picker.data.option_pool_manager import (
                OptionPoolManager,
            )

            pool_manager = OptionPoolManager(main_widget)
            pool_manager.set_click_handler(pictograph_click_handler)
            pool_manager.set_pictograph_click_handler(pictograph_data_click_handler)

            return pool_manager

        except Exception as e:
            logger.error(f"Error creating pool manager: {e}")
            raise

    def create_dimension_calculator(
        self,
        container: DIContainer,
    ) -> Any:
        """
        Create and configure the dimension calculator.

        Args:
            container: DI container for service resolution

        Returns:
            Configured dimension calculator
        """
        try:
            from application.services.layout.dimension_calculator import (
                DimensionCalculator,
            )

            dimension_calculator = DimensionCalculator()
            return dimension_calculator

        except Exception as e:
            logger.error(f"Error creating dimension calculator: {e}")
            raise

    def initialize_pool(
        self,
        pool_manager: Any,
        progress_callback: Optional[Callable[[str, float], None]] = None,
    ) -> None:
        """
        Initialize the pictograph pool.

        Args:
            pool_manager: Pool manager to initialize
            progress_callback: Optional progress reporting callback
        """
        try:
            if progress_callback:
                progress_callback("Initializing pictograph pool", 0.45)

            pool_manager.initialize_pool(progress_callback)

        except Exception as e:
            logger.error(f"Error initializing pool: {e}")
            raise

    def setup_filter_connections(
        self,
        filter_widget: QWidget,
        filter_change_handler: Callable[[str], None],
        progress_callback: Optional[Callable[[str, float], None]] = None,
    ) -> None:
        """
        Setup filter widget connections.

        Args:
            filter_widget: Filter widget
            filter_change_handler: Handler for filter changes
            progress_callback: Optional progress reporting callback
        """
        try:
            if progress_callback:
                progress_callback("Setting up filter connections", 0.9)

            filter_widget.filter_changed.connect(filter_change_handler)

        except Exception as e:
            logger.error(f"Error setting up filter connections: {e}")
            raise

    def validate_initialization(self, components: Dict[str, Any]) -> bool:
        """
        Validate that all required components were initialized.

        Args:
            components: Dictionary of initialized components

        Returns:
            True if all components are valid
        """
        required_components = ["layout_service", "widget_factory", "option_service"]

        for component_name in required_components:
            if component_name not in components or components[component_name] is None:
                logger.error(f"Required component not initialized: {component_name}")
                return False

        return True

    def get_initialization_info(self, components: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get information about the initialization process.

        Args:
            components: Dictionary of initialized components

        Returns:
            Dictionary with initialization information
        """
        return {
            "components_count": len(components),
            "components_initialized": list(components.keys()),
            "validation_passed": self.validate_initialization(components),
            "layout_service_available": components.get("layout_service") is not None,
            "widget_factory_available": components.get("widget_factory") is not None,
            "option_service_available": components.get("option_service") is not None,
        }
