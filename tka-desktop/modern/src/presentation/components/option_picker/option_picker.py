from typing import List, Optional, Dict, Any
from PyQt6.QtWidgets import QWidget, QVBoxLayout
from PyQt6.QtCore import pyqtSignal

# Import the new base class
from ..component_base import ViewableComponentBase
from core.dependency_injection.di_container import DIContainer
from core.interfaces.core_services import ILayoutService
from domain.models.core_models import BeatData, SequenceData
from .pictograph_pool_manager import PictographPoolManager
from .beat_data_loader import BeatDataLoader
from .display_manager import OptionPickerDisplayManager
from ...factories.widget_factory import OptionPickerWidgetFactory
from .dimension_analyzer import OptionPickerDimensionAnalyzer
from .option_picker_filter import OptionPickerFilter
from .geometric_measurement_logger import GeometricMeasurementLogger


class OptionPicker(
    ViewableComponentBase
):  # 🔥 CHANGED: Now inherits from ViewableComponentBase
    """
    Modern Option Picker - WORLD-CLASS Component Implementation

    This class now inherits from ViewableComponentBase, making it a pure modern component with:
    - ZERO global state access
    - Pure dependency injection
    - Event-driven communication
    - Proper lifecycle management

    This works directly with Modern data structures (BeatData, SequenceData)
    and never requires Legacy format conversions.
    """

    option_selected = pyqtSignal(str)
    beat_data_selected = pyqtSignal(object)  # New signal for actual BeatData

    def __init__(self, container: DIContainer, progress_callback=None, parent=None):
        # 🔥 CHANGED: Call ViewableComponentBase constructor
        super().__init__(container, parent)

        # Component-specific properties
        self.progress_callback = progress_callback

        # Core components (will be initialized in initialize())
        # Note: self._widget is now managed by base class
        self.sections_container: Optional[QWidget] = None
        self.sections_layout: Optional[QVBoxLayout] = None
        self.filter_widget: Optional[OptionPickerFilter] = None

        # Service components
        self._layout_service: Optional[ILayoutService] = None
        self._pool_manager: Optional[PictographPoolManager] = None
        self._beat_loader: Optional[BeatDataLoader] = None
        self._display_manager: Optional[OptionPickerDisplayManager] = None
        self._widget_factory: Optional[OptionPickerWidgetFactory] = None
        self._dimension_analyzer: Optional[OptionPickerDimensionAnalyzer] = None

    def initialize(
        self,
    ) -> None:  # 🔥 CHANGED: Implement abstract method from base class
        """Initialize the option picker with all components - PURE DEPENDENCY INJECTION"""
        try:
            if self.progress_callback:
                self.progress_callback("Resolving layout service", 0.1)

            # 🔥 CHANGED: Use base class service resolution method
            self._layout_service = self.resolve_service(ILayoutService)

            if self.progress_callback:
                self.progress_callback("Creating widget factory", 0.15)

            self._widget_factory = OptionPickerWidgetFactory(self.container)

            if self.progress_callback:
                self.progress_callback("Creating option picker widget", 0.2)

            (
                self._widget,
                self.sections_container,
                self.sections_layout,
                self.filter_widget,
            ) = self._widget_factory.create_widget(self._on_widget_resize)

            if self.progress_callback:
                self.progress_callback("Initializing pool manager", 0.25)

            self._pool_manager = PictographPoolManager(self._widget)
            self._pool_manager.set_click_handler(self._handle_beat_click)
            self._pool_manager.set_beat_data_click_handler(self._handle_beat_data_click)

            if self.progress_callback:
                self.progress_callback("Initializing display manager", 0.3)

            # Create size provider that gives sections the full available width
            def mw_size_provider():
                from PyQt6.QtCore import QSize

                # Get actual available width from the option picker widget hierarchy
                if self._widget and self._widget.width() > 0:
                    # In Modern, the option picker IS the full available space
                    # So sections should use the full widget width, not half
                    actual_width = self._widget.width()
                    actual_height = self._widget.height()
                    # Return the actual size - sections will use full width
                    return QSize(actual_width, actual_height)
                else:
                    # Fallback for initialization phase
                    return QSize(1200, 800)

            self._display_manager = OptionPickerDisplayManager(
                self.sections_container,
                self.sections_layout,
                self._pool_manager,
                mw_size_provider,
            )

            if self.progress_callback:
                self.progress_callback("Initializing beat data loader", 0.35)

            self._beat_loader = BeatDataLoader()

            if self.progress_callback:
                self.progress_callback("Initializing dimension analyzer", 0.4)

            self._dimension_analyzer = OptionPickerDimensionAnalyzer(
                self._widget,
                self.sections_container,
                self.sections_layout,
                self._display_manager.get_sections(),
            )

            if self.progress_callback:
                self.progress_callback("Initializing pictograph pool", 0.45)

            self._pool_manager.initialize_pool(self.progress_callback)

            if self.progress_callback:
                self.progress_callback("Creating sections", 0.85)

            self._display_manager.create_sections()

            if self.progress_callback:
                self.progress_callback("Setting up filter connections", 0.9)

            self.filter_widget.filter_changed.connect(self._on_filter_changed)

            if self.progress_callback:
                self.progress_callback("Loading initial beat options", 0.95)

            self._load_beat_options()

            if self.progress_callback:
                self.progress_callback("Option picker initialization complete", 1.0)

            # 🔥 CHANGED: Mark as initialized and emit signal
            self._initialized = True
            self.component_ready.emit()

        except Exception as e:
            # 🔥 CHANGED: Use base class error handling
            self.emit_error(f"Failed to initialize option picker: {e}", e)
            raise

    def get_widget(
        self,
    ) -> QWidget:  # 🔥 CHANGED: Implement abstract method from base class
        """Get the main widget for this component."""
        if not self._widget:
            raise RuntimeError("OptionPicker not initialized - call initialize() first")
        return self._widget

    # 🔥 CHANGED: Override cleanup to handle component-specific cleanup
    def cleanup(self) -> None:
        """Clean up option picker resources."""
        try:
            # Component-specific cleanup
            if self._pool_manager:
                # Add pool manager cleanup if it has a cleanup method
                if hasattr(self._pool_manager, "cleanup"):
                    self._pool_manager.cleanup()
                self._pool_manager = None

            if self._display_manager:
                # Add display manager cleanup if it has a cleanup method
                if hasattr(self._display_manager, "cleanup"):
                    self._display_manager.cleanup()
                self._display_manager = None

            # Clear references
            self._beat_loader = None
            self._widget_factory = None
            self._dimension_analyzer = None
            self._layout_service = None

            # Call parent cleanup
            super().cleanup()

        except Exception as e:
            self.emit_error(f"Error during cleanup: {e}", e)

    def load_motion_combinations(self, sequence_data: List[Dict[str, Any]]) -> None:
        """Load motion combinations using data-driven position matching"""
        if not self._beat_loader or not self._display_manager:
            print("❌ Components not initialized")
            return

        beat_options = self._beat_loader.load_motion_combinations(sequence_data)
        self._display_manager.update_beat_display(beat_options)
        self._ensure_sections_visible()

    def _load_beat_options(self) -> None:
        """Load initial beat options"""
        if not self._beat_loader or not self._display_manager:
            return

        beat_options = self._beat_loader.refresh_options()
        self._display_manager.update_beat_display(beat_options)

    def _ensure_sections_visible(self) -> None:
        """Ensure sections are visible after loading combinations"""
        if self._display_manager:
            sections = self._display_manager.get_sections()
            for section in sections.values():
                if hasattr(section, "pictograph_container"):
                    section.pictograph_container.setVisible(True)

    def _handle_beat_click(self, beat_id: str) -> None:
        """Handle beat selection clicks (legacy compatibility)"""
        self.option_selected.emit(beat_id)

    def _handle_beat_data_click(self, beat_data: BeatData) -> None:
        """Handle beat data selection clicks (new precise method)"""
        self.beat_data_selected.emit(beat_data)

    def get_beat_data_for_option(self, option_id: str) -> Optional[BeatData]:
        """Get BeatData for a specific option ID (e.g., 'beat_J' -> BeatData with letter='J')"""
        if not self._beat_loader:
            return None

        # Extract letter from option_id (e.g., "beat_J" -> "J")
        if option_id.startswith("beat_"):
            target_letter = option_id[5:]  # Remove "beat_" prefix

            # Search through current beat options for matching letter
            beat_options = self._beat_loader.get_beat_options()
            for beat_data in beat_options:
                if beat_data.letter == target_letter:
                    print(
                        f"✅ Found beat data for option {option_id}: {beat_data.letter}"
                    )
                    return beat_data

            print(
                f"❌ No beat data found for option {option_id} (letter: {target_letter})"
            )
            return None
        else:
            print(f"❌ Invalid option ID format: {option_id}")
            return None

    def refresh_options(self) -> None:
        """Refresh the option picker with latest beat options"""
        if self._beat_loader and self._display_manager:
            beat_options = self._beat_loader.refresh_options()
            self._display_manager.update_beat_display(beat_options)
            print(f"🔄 Option picker refreshed with {len(beat_options)} options")

    def refresh_options_from_sequence(
        self, sequence_data: List[Dict[str, Any]]
    ) -> None:
        """Refresh options based on sequence state (DEPRECATED - Legacy-compatible)"""
        if self._beat_loader and self._display_manager:
            beat_options = self._beat_loader.refresh_options_from_sequence(
                sequence_data
            )
            self._display_manager.update_beat_display(beat_options)
            print(
                f"🔄 Option picker dynamically refreshed with {len(beat_options)} options"
            )

    def refresh_options_from_modern_sequence(self, sequence: SequenceData) -> None:
        """PURE Modern: Refresh options based on Modern SequenceData - no conversion needed!"""
        if self._beat_loader and self._display_manager:
            beat_options = self._beat_loader.refresh_options_from_modern_sequence(
                sequence
            )
            self._display_manager.update_beat_display(beat_options)
            print(
                f"🔄 PURE Modern: Option picker refreshed with {len(beat_options)} options"
            )

    def _on_widget_resize(self) -> None:
        """Handle widget resize events"""
        if self._pool_manager:
            self._pool_manager.resize_all_frames()

        # CRITICAL: Resize bottom row sections to proper 1/3 width
        if self._display_manager:
            self._display_manager.resize_bottom_row_sections()

    def _on_filter_changed(self, filter_text: str) -> None:
        """Handle filter changes"""
        if self._beat_loader and self._display_manager:
            beat_options = self._beat_loader.get_beat_options()
            self._display_manager.update_beat_display(beat_options)

    def set_enabled(self, enabled: bool) -> None:
        """Enable or disable the widget"""
        if self._widget:
            self._widget.setEnabled(enabled)

    def get_size(self) -> tuple[int, int]:
        """Get widget size"""
        if self._widget_factory:
            return self._widget_factory.get_size()
        return (600, 800)

    def log_dimensions(self, phase: str) -> None:
        """Log comprehensive dimension analysis"""
        if self._dimension_analyzer:
            self._dimension_analyzer.log_all_container_dimensions(phase)

    def measure_header_button_centering(self) -> bool:
        """
        Measure the geometric centering of all Option Picker header buttons.

        Returns:
            bool: True if all header buttons are perfectly centered, False otherwise
        """
        print("🔍 MEASURING OPTION PICKER HEADER BUTTON CENTERING")
        print("=" * 60)

        if not self._display_manager:
            print("❌ Display manager not initialized")
            return False

        # Get all sections
        sections = self._display_manager.get_sections()
        if not sections:
            print("❌ No Option Picker sections found")
            print("   Make sure the Option Picker is populated with pictographs")
            return False

        print(f"✅ Found {len(sections)} Option Picker sections")

        # Create measurement logger
        logger = GeometricMeasurementLogger()

        # Process events to ensure accurate measurements
        from PyQt6.QtWidgets import QApplication

        app = QApplication.instance()
        if app:
            app.processEvents()

        # Measure each section
        measured_sections = 0
        for section_name, section in sections.items():
            try:
                print(f"📏 Measuring section: {section_name}")

                # Use the section's built-in measurement method if available
                if hasattr(section, "capture_geometric_measurements"):
                    section.capture_geometric_measurements(logger)
                    if hasattr(section, "analyze_button_centering"):
                        section.analyze_button_centering(logger)
                        measured_sections += 1
                    else:
                        # Manual analysis fallback
                        self._manual_centering_analysis(logger, section, section_name)
                        measured_sections += 1
                else:
                    # Manual measurement fallback
                    self._manual_section_measurement(logger, section, section_name)
                    measured_sections += 1

            except Exception as e:
                print(f"❌ Error measuring section {section_name}: {e}")

        # Generate summary report
        print("\n" + "=" * 60)
        print("📊 MEASUREMENT SUMMARY REPORT")
        print("=" * 60)

        logger.log_summary_report()

        # Check if all sections are perfectly centered
        if logger.centering_analyses:
            all_perfect = all(
                result.is_perfectly_centered for result in logger.centering_analyses
            )

            print(f"\n🎯 FINAL RESULT:")
            if all_perfect:
                print("✅ SUCCESS: All section header buttons are perfectly centered!")
            else:
                print(
                    "❌ ISSUES FOUND: Some section header buttons are not perfectly centered"
                )

                print(f"\n🔧 SECTIONS REQUIRING FIXES:")
                for result in logger.centering_analyses:
                    if not result.is_perfectly_centered:
                        direction = "RIGHT" if result.centering_offset > 0 else "LEFT"
                        print(
                            f"   • {result.section_name}: {abs(result.centering_offset):.1f}px too far {direction}"
                        )

            print("=" * 60)
            return all_perfect
        else:
            print("❌ No measurements were captured")
            return False

    def _manual_section_measurement(
        self, logger: GeometricMeasurementLogger, section, section_name: str
    ) -> None:
        """Manually measure a section if the built-in method is not available."""
        try:
            # Capture section container
            container_name = f"{section_name}_container"
            logger.capture_widget_geometry(section, container_name)

            # Find and capture header button
            header_button = getattr(section, "header_button", None)
            if header_button:
                button_name = f"{section_name}_button"
                logger.capture_widget_geometry(header_button, button_name)

                # Analyze centering
                self._manual_centering_analysis(logger, section, section_name)
            else:
                print(f"⚠️  No header button found for {section_name}")

        except Exception as e:
            print(f"⚠️  Manual measurement failed for section {section_name}: {e}")

    def _manual_centering_analysis(
        self, logger: GeometricMeasurementLogger, section, section_name: str
    ) -> None:
        """Manually analyze centering if the built-in method is not available."""
        try:
            container_name = f"{section_name}_container"
            button_name = f"{section_name}_button"

            analysis = logger.analyze_button_centering(
                container_name, button_name, section_name
            )

            if analysis:
                logger.log_centering_analysis(analysis)
            else:
                print(f"⚠️  Failed to analyze centering for {section_name}")

        except Exception as e:
            print(f"⚠️  Manual analysis failed for section {section_name}: {e}")
