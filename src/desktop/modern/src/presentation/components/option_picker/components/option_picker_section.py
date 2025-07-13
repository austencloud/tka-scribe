"""
Option Picker Section Widget - Clean UI Layer

Pure Qt presentation component for displaying option sections.
All business logic extracted to injected services.

Key principles:
- Pure Qt UI logic only - no business logic
- Clean dependency injection of services
- Qt widget management in presentation layer
- Simple section layout and display
"""

from typing import Callable, Dict, List

from application.services.option_picker.option_configuration_service import (
    OptionConfigurationService,
)
from application.services.option_picker.option_picker_size_calculator import (
    OptionPickerSizeCalculator,
)
from application.services.option_picker.option_pool_service import OptionPoolService
from domain.models.pictograph_data import PictographData
from presentation.components.option_picker.components.option_picker_scroll import (
    OptionPickerScroll,
)
from presentation.components.option_picker.components.pictograph_option_frame import (
    PictographOptionFrame,
)
from presentation.components.option_picker.types.letter_types import LetterType
from PyQt6.QtCore import QSize, Qt, pyqtSignal
from PyQt6.QtWidgets import QFrame, QGridLayout, QGroupBox, QVBoxLayout


class OptionPickerSection(QGroupBox):
    """
    Clean UI component for option picker sections.

    All business logic extracted to injected services.
    """

    # Signal emitted when a pictograph is selected in this section
    pictograph_selected = pyqtSignal(object)  # PictographData

    def __init__(
        self,
        letter_type: LetterType,
        scroll_area,  # Parent scroll area
        mw_size_provider: Callable[[], QSize],
        option_pool_service: OptionPoolService,
        option_config_service: OptionConfigurationService,
        size_calculator: OptionPickerSizeCalculator,
    ):
        """Initialize with injected services - no service location."""
        super().__init__(None)

        # ✅ Clean dependency injection - no service location
        self.letter_type = letter_type
        self.scroll_area: OptionPickerScroll = scroll_area
        self.mw_size_provider = mw_size_provider
        self._option_pool_service = option_pool_service
        self._option_config_service = option_config_service
        self._option_sizing_service = size_calculator

        # Store the current option picker width (updated via signal)
        self._current_option_picker_width = 680  # Default fallback

    def update_option_picker_width(self, width: int) -> None:
        """Update the stored option picker width - called by parent scroll area."""
        self._current_option_picker_width = width

        # ✅ Use service for business rule
        self.is_groupable = self._option_config_service.is_groupable_type(
            self.letter_type
        )

        # UI state management
        self._loading_options = False
        self.pictographs: Dict[str, PictographOptionFrame] = {}

    def setup_components(self) -> None:
        """Setup Qt components - pure UI logic."""
        # Create container frame for pictographs
        self.pictograph_frame = QFrame(self)
        self.pictograph_frame.setStyleSheet("QFrame {border: none;}")

        self._setup_header()
        self._setup_layout()
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)

    def _setup_layout(self) -> None:
        """Setup Qt layout - pure UI logic."""
        # Main vertical layout for header + pictographs
        self.layout: QVBoxLayout = QVBoxLayout(self)
        self.layout.setAlignment(Qt.AlignmentFlag.AlignVCenter)
        self.layout.setSpacing(0)
        self.layout.setContentsMargins(0, 0, 0, 0)

        # Get layout config from service
        layout_config = self._option_config_service.get_layout_config()

        # Grid layout for pictographs
        self.pictographs_layout: QGridLayout = QGridLayout()
        self.pictographs_layout.setSpacing(layout_config["spacing"])
        self.pictographs_layout.setContentsMargins(0, 0, 0, 0)

        # Add header first, then grid layout for pictographs
        self.layout.addWidget(self.header)
        self.layout.addLayout(self.pictographs_layout)

    def _setup_header(self) -> None:
        """Setup section header - Qt UI logic."""
        from presentation.components.option_picker.components.option_picker_section_header import (
            OptionPickerSectionHeader,
        )

        self.header = OptionPickerSectionHeader(self)
        self.header.type_button.clicked.connect(self.toggle_section)

    def toggle_section(self) -> None:
        """Toggle section visibility - Qt UI logic."""
        is_visible = not self.pictograph_frame.isVisible()
        self.pictograph_frame.setVisible(is_visible)

    def load_options_from_sequence(
        self, pictographs_for_section: List[PictographData]
    ) -> None:
        """Load options for this section - UI coordination logic."""
        try:
            # ✅ Set UI loading state
            self._loading_options = True

            # ✅ Clear existing UI elements
            self.clear_pictographs()

            # ✅ Create and setup Qt widgets
            frames = []
            for pictograph_data in pictographs_for_section:
                # Get widget from pool using service
                pool_id = self._option_pool_service.checkout_item()
                if pool_id is not None:
                    # Get Qt widget from scroll area's widget pool
                    option_frame = self.scroll_area.get_widget_from_pool(pool_id)
                    if option_frame:
                        # Setup Qt widget
                        option_frame.update_pictograph(pictograph_data)

                        # CRITICAL: Disconnect any existing connections first to prevent duplicates
                        try:
                            option_frame.option_selected.disconnect(
                                self._on_pictograph_selected
                            )
                        except (TypeError, RuntimeError):
                            # No existing connection - this is fine
                            pass

                        option_frame.option_selected.connect(
                            self._on_pictograph_selected
                        )
                        frames.append(option_frame)

            # ✅ Add Qt widgets to layout
            for frame in frames:
                self.add_pictograph(frame)

        except Exception as e:
            print(f"❌ [UI] Error loading options for {self.letter_type}: {e}")
        finally:
            # ✅ Always clear loading state
            self._loading_options = False

    def clear_pictographs(self) -> None:
        """Clear pictographs from Qt layout."""
        for pictograph_frame in self.pictographs.values():
            if hasattr(pictograph_frame, "setVisible"):
                # Remove from Qt layout
                self.pictographs_layout.removeWidget(pictograph_frame)
                pictograph_frame.setVisible(False)

                # Disconnect our specific signal connection safely
                try:
                    pictograph_frame.option_selected.disconnect(
                        self._on_pictograph_selected
                    )
                except (TypeError, RuntimeError):
                    # Signal was already disconnected or never connected - this is fine
                    pass

                # Clean up widget content
                pictograph_frame.clear_pictograph()

                # Return to pool (find pool ID)
                for pool_id, widget in self.scroll_area._widget_pool.items():
                    if widget == pictograph_frame:
                        self._option_pool_service.checkin_item(pool_id)
                        break

        # Clear tracking dictionary
        self.pictographs = {}

    def add_pictograph(self, pictograph_frame: PictographOptionFrame) -> None:
        """Add pictograph to Qt grid layout."""
        # Generate tracking key
        key = f"pictograph_{len(self.pictographs)}"
        self.pictographs[key] = pictograph_frame

        # ✅ Use service for grid layout calculation
        layout_config = self._option_config_service.get_layout_config()
        column_count = layout_config["column_count"]

        # Calculate grid position
        count = len(self.pictographs)
        row, col = divmod(count - 1, column_count)

        # ✅ Add to Qt grid layout
        self.pictographs_layout.addWidget(pictograph_frame, row, col)
        pictograph_frame.setVisible(True)

    def _on_pictograph_selected(self, pictograph_data: PictographData) -> None:
        """Handle pictograph selection - emit Qt signal."""
        self.pictograph_selected.emit(pictograph_data)

    def resizeEvent(self, event) -> None:
        """Handle Qt resize events."""
        # Skip resizing during option loading
        if self._loading_options:
            return

        # ✅ Use service for dimension calculation
        main_window_size = self.mw_size_provider()

        # 🔍 REGRESSION TEST: Ensure we're not using fallback size provider
        if main_window_size.width() == 800 and main_window_size.height() == 600:
            print(
                f"🚨 [REGRESSION] Section {self.letter_type} using FALLBACK 800x600 size provider!"
            )
            print(f"🚨 This will cause incorrect section sizing in the real app!")

        # MODERN: Use stored option picker width instead of fragile parent navigation
        dimensions = self._option_sizing_service.calculate_section_dimensions(
            letter_type=self.letter_type,
            main_window_width=main_window_size.width(),
            available_container_width=self._current_option_picker_width,
        )

        # ✅ Apply to Qt widget
        self.setFixedWidth(dimensions["width"])

        # Call parent resize event
        super().resizeEvent(event)

    @property
    def pictograph_frames(self) -> List[PictographOptionFrame]:
        """Get list of pictograph frames for compatibility."""
        return list(self.pictographs.values())
