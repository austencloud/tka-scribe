from typing import List
from PyQt6.QtWidgets import QWidget, QVBoxLayout, QGridLayout, QHBoxLayout
from PyQt6.QtCore import Qt, QTimer
from .section_button import OptionPickerSectionButton
from .letter_types import LetterType
from .geometric_measurement_logger import GeometricMeasurementLogger


class OptionPickerSection(QWidget):
    # Legacy-style consistent sizing constants
    FIXED_COLUMN_COUNT = 8  # Always use 8 columns like legacy

    def __init__(
        self,
        letter_type: str,
        parent=None,
        mw_size_provider=None,
        sizing_coordinator=None,
    ):
        super().__init__(parent)
        self.letter_type = letter_type
        self.section_type = letter_type  # Add section_type for debug messages
        self.pictographs: List = []
        self.mw_size_provider = mw_size_provider  # Legacy-style size provider
        self.sizing_coordinator = sizing_coordinator  # Add sizing coordinator reference
        self._setup_ui()

    def _setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)  # Minimal margins
        layout.setSpacing(0)  # Minimal spacing between header and content

        # Create a transparent container for the header button to ensure proper centering
        header_container = QWidget()
        header_container.setStyleSheet("background: transparent; border: none;")
        header_layout = QHBoxLayout(header_container)
        header_layout.setContentsMargins(0, 0, 0, 0)
        header_layout.setSpacing(0)
        header_layout.setAlignment(
            Qt.AlignmentFlag.AlignCenter
        )  # Legacy-exact: center alignment
        header_layout.addStretch(1)  # Legacy-exact: equal stretch factor

        self.header_button = OptionPickerSectionButton(self)
        self.header_button.clicked.connect(self._toggle_section)

        self.header_button.setContentsMargins(0, 0, 0, 0)
        header_layout.addWidget(self.header_button)
        header_layout.addStretch(1)  # Legacy-exact: equal stretch factor

        layout.addWidget(header_container)

        # Legacy-style container: simple QFrame with QGridLayout
        from PyQt6.QtWidgets import QFrame

        self.pictograph_container = QFrame()
        self.pictograph_layout = QGridLayout(self.pictograph_container)

        # Legacy-style layout settings
        self.pictograph_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.pictograph_layout.setContentsMargins(0, 0, 0, 0)
        # self.pictograph_layout.setSpacing(8)  # Legacy uses spacing from option_scroll

        layout.addWidget(self.pictograph_container)

        # Legacy-style transparent styling
        self.setStyleSheet("background: transparent; border: none;")
        header_container.setStyleSheet("background: transparent; border: none;")
        self.pictograph_container.setStyleSheet(
            "background: transparent; border: none;"
        )

        # Initialize container visibility to match button state (expanded by default)
        self.pictograph_container.setVisible(self.header_button.is_expanded)

        # Initialize measurement logger for geometric analysis
        self.measurement_logger = None

    def _toggle_section(self):
        self.header_button.toggle_expansion()
        self.pictograph_container.setVisible(self.header_button.is_expanded)

    def capture_geometric_measurements(
        self, logger: GeometricMeasurementLogger
    ) -> None:
        """
        Capture precise geometric measurements for centering analysis.

        Args:
            logger: GeometricMeasurementLogger instance to store measurements
        """
        self.measurement_logger = logger

        # Ensure widgets are visible and properly laid out
        if not self.isVisible():
            print(
                f"⚠️  WARNING: Section {self.letter_type} is not visible for measurement"
            )
            return

        # Force layout update to ensure accurate measurements
        self.updateGeometry()
        from PyQt6.QtWidgets import QApplication

        QApplication.processEvents()

        # Capture section container measurements
        container_name = f"{self.letter_type}_container"
        logger.capture_widget_geometry(self, container_name)

        # Capture header button measurements
        button_name = f"{self.letter_type}_button"
        if self.header_button and self.header_button.isVisible():
            logger.capture_widget_geometry(self.header_button, button_name)
        else:
            print(f"⚠️  WARNING: Header button for {self.letter_type} is not visible")

        # Capture pictograph container measurements
        pictograph_container_name = f"{self.letter_type}_pictograph_container"
        if self.pictograph_container and self.pictograph_container.isVisible():
            logger.capture_widget_geometry(
                self.pictograph_container, pictograph_container_name
            )

        # Capture leftmost and rightmost pictograph measurements if available
        if self.pictographs:
            leftmost_name = f"{self.letter_type}_leftmost_pictograph"
            rightmost_name = f"{self.letter_type}_rightmost_pictograph"

            # Find leftmost pictograph (first in grid)
            if len(self.pictographs) > 0:
                logger.capture_widget_geometry(self.pictographs[0], leftmost_name)

            # Find rightmost pictograph (last in current row or specific position)
            if len(self.pictographs) > 1:
                # For rightmost, we want the last pictograph in the first row
                rightmost_index = min(
                    len(self.pictographs) - 1, self.FIXED_COLUMN_COUNT - 1
                )
                logger.capture_widget_geometry(
                    self.pictographs[rightmost_index], rightmost_name
                )

        print(f"📏 Captured geometric measurements for section: {self.letter_type}")

    def analyze_button_centering(self, logger: GeometricMeasurementLogger) -> None:
        """
        Analyze the centering of this section's header button.

        Args:
            logger: GeometricMeasurementLogger instance with captured measurements
        """
        container_name = f"{self.letter_type}_container"
        button_name = f"{self.letter_type}_button"

        analysis = logger.analyze_button_centering(
            container_name, button_name, self.letter_type
        )

        if analysis:
            logger.log_centering_analysis(analysis)
        else:
            print(f"❌ Failed to analyze centering for section: {self.letter_type}")

    def add_pictograph(self, pictograph_frame):
        """Add pictograph using Legacy-style direct layout positioning with lifecycle safety"""
        if not self._ensure_layout_validity():
            self._recreate_layout_objects()
            if not self._ensure_layout_validity():
                return

        self.pictographs.append(pictograph_frame)

        COLUMN_COUNT = self.FIXED_COLUMN_COUNT  # Use class constant
        count = len(self.pictographs)

        # Safety check: ensure count is valid
        if count <= 0:
            print(f"❌ Invalid pictograph count: {count} for {self.letter_type}")
            if pictograph_frame in self.pictographs:
                self.pictographs.remove(pictograph_frame)
            return

        row, col = divmod(count - 1, COLUMN_COUNT)

        # Additional safety check for negative coordinates
        if row < 0 or col < 0:
            print(
                f"❌ Invalid grid position: row={row}, col={col}, count={count} for {self.letter_type}"
            )
            if pictograph_frame in self.pictographs:
                self.pictographs.remove(pictograph_frame)
            return

        try:
            if not self._ensure_layout_validity():
                self.pictographs.remove(pictograph_frame)
                return

            self.pictograph_layout.addWidget(pictograph_frame, row, col)
            pictograph_frame.setVisible(True)
            self._update_container_size()

        except RuntimeError:
            if pictograph_frame in self.pictographs:
                self.pictographs.remove(pictograph_frame)

    def clear_pictographs(self):
        """Clear pictographs using proper Qt widget lifecycle management"""
        for pictograph in self.pictographs:
            if pictograph is not None:
                try:
                    if hasattr(pictograph, "cleanup"):
                        pictograph.cleanup()

                    if self._ensure_layout_validity():
                        self.pictograph_layout.removeWidget(pictograph)

                    pictograph.setParent(None)
                    pictograph.deleteLater()

                except RuntimeError:
                    pass

        self.pictographs.clear()

    def clear_pictographs_legacy_style(self):
        """Clear pictographs using Legacy-style approach: hide and remove from layout, don't delete"""
        for pictograph in self.pictographs:
            if pictograph is not None:
                try:
                    if self._ensure_layout_validity():
                        self.pictograph_layout.removeWidget(pictograph)
                    pictograph.setVisible(False)
                except RuntimeError:
                    pass

        self.pictographs.clear()

    def add_pictograph_from_pool(self, pictograph_frame):
        """Add pictograph from pool using unified sizing coordinator"""
        print(f"🔍 SECTION DEBUG: Adding pictograph to {self.section_type} section")
        print(f"   - Current pictograph count: {len(self.pictographs)}")
        print(
            f"   - Section size before add: {self.size().width()}x{self.size().height()}"
        )

        if not self._ensure_layout_validity():
            self._recreate_layout_objects()
            if not self._ensure_layout_validity():
                return

        self.pictographs.append(pictograph_frame)

        COLUMN_COUNT = self.FIXED_COLUMN_COUNT  # Use class constant
        count = len(self.pictographs)

        # Safety check: ensure count is valid
        if count <= 0:
            print(f"❌ Invalid pictograph count: {count} for {self.letter_type}")
            if pictograph_frame in self.pictographs:
                self.pictographs.remove(pictograph_frame)
            return

        row, col = divmod(count - 1, COLUMN_COUNT)

        # Additional safety check for negative coordinates
        if row < 0 or col < 0:
            print(
                f"❌ Invalid grid position: row={row}, col={col}, count={count} for {self.letter_type}"
            )
            if pictograph_frame in self.pictographs:
                self.pictographs.remove(pictograph_frame)
            return

        try:
            if not self._ensure_layout_validity():
                self.pictographs.remove(pictograph_frame)
                return

            self.pictograph_layout.addWidget(pictograph_frame, row, col)

            # Set container reference for the frame - use the actual section container
            if hasattr(pictograph_frame, "set_container_widget"):
                container_size = self.pictograph_container.size()
                print(
                    f"🔍 SECTION DEBUG: Setting container for frame in {self.section_type} section"
                )
                print(
                    f"   - Section container size: {container_size.width()}x{container_size.height()}"
                )
                print(
                    f"   - Container type: {type(self.pictograph_container).__name__}"
                )
                pictograph_frame.set_container_widget(self.pictograph_container)

            # Register with sizing coordinator for unified sizing
            if hasattr(self, "sizing_coordinator") and self.sizing_coordinator:
                container_id = f"{self.section_type}_{id(self.pictograph_container)}"
                self.sizing_coordinator.register_pictograph_frame(
                    container_id, pictograph_frame
                )
                self.sizing_coordinator.register_container(
                    container_id, self.pictograph_container
                )
                self.sizing_coordinator.schedule_coordinated_resize()

            pictograph_frame.setVisible(True)
            pictograph_frame.show()

            if hasattr(pictograph_frame, "pictograph_component"):
                pictograph_frame.pictograph_component.setVisible(True)
                pictograph_frame.pictograph_component.show()

            self._force_layout_activation()
            self._update_container_size()

        except RuntimeError:
            if pictograph_frame in self.pictographs:
                self.pictographs.remove(pictograph_frame)

    def _ensure_layout_validity(self) -> bool:
        """Check if layout objects are still valid (not deleted)"""
        try:
            # Try to access layout properties to check if they're still valid
            if self.pictograph_container is None:
                return False
            if self.pictograph_layout is None:
                return False

            # Try to access a property to see if the C++ object is still alive
            _ = self.pictograph_layout.count()
            _ = self.pictograph_container.isVisible()
            return True
        except (RuntimeError, AttributeError):
            return False

    def _recreate_layout_objects(self):
        """Recreate layout objects if they've been deleted"""
        try:
            from PyQt6.QtWidgets import QFrame

            if (
                hasattr(self, "pictograph_container")
                and self.pictograph_container is not None
            ):
                try:
                    self.pictograph_container.setParent(None)
                except RuntimeError:
                    pass

            self.pictograph_container = QFrame()
            self.pictograph_layout = QGridLayout(self.pictograph_container)

            self.pictograph_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
            self.pictograph_layout.setContentsMargins(0, 0, 0, 0)
            self.pictograph_layout.setSpacing(8)

            parent_layout = self.layout()
            if parent_layout:
                parent_layout.addWidget(self.pictograph_container)

            self.pictograph_container.setStyleSheet(
                """
                QWidget {
                    background-color: transparent;
                    border: none;
                }
            """
            )

            self.pictograph_container.setVisible(self.header_button.is_expanded)

        except Exception:
            pass

    def _get_consistent_pictograph_size(self) -> int:
        """Calculate consistent pictograph size for ALL sections using legacy strategy"""
        if self.mw_size_provider:
            mw_size = self.mw_size_provider()
            mw_width = mw_size.width()

            # Legacy formula adapted: max(width // 16, picker_width // 8)
            # But ensure all sections get the same size regardless of their layout
            if mw_width > 1200:
                base_size = mw_width // 14  # Larger screens get bigger pictographs
            else:
                base_size = mw_width // 16  # Standard size for smaller screens

            # Ensure reasonable bounds (60-160px like the original calculation)
            return max(60, min(160, base_size))
        return 80  # Fallback size

    def _update_container_size(self):
        """Update container size to accommodate 8-column layout with proper scroll area sizing"""
        if len(self.pictographs) == 0:
            return

        if not self._ensure_layout_validity():
            self._recreate_layout_objects()
            if not self._ensure_layout_validity():
                return

        try:
            if self.mw_size_provider:
                full_width = self.mw_size_provider().width()

                if self.letter_type in [
                    LetterType.TYPE4,
                    LetterType.TYPE5,
                    LetterType.TYPE6,
                ]:
                    section_width = (full_width - 20) // 3
                    available_width = section_width - 20
                else:
                    section_width = full_width
                    available_width = section_width - 40
            else:
                available_width = (
                    self._get_available_scroll_width()
                )  # Use consistent COLUMN_COUNT for all sections (legacy approach)
            COLUMN_COUNT = self.FIXED_COLUMN_COUNT  # Use class constant

            container_margins = 10
            grid_spacing = 8

            # Use sizing coordinator for unified pictograph sizing
            print(
                f"🔍 SECTION DEBUG: Checking sizing coordinator for {self.section_type}"
            )
            print(
                f"   - Has sizing_coordinator attr: {hasattr(self, 'sizing_coordinator')}"
            )
            print(
                f"   - Sizing coordinator value: {getattr(self, 'sizing_coordinator', 'NOT_FOUND')}"
            )
            print(
                f"   - Sizing coordinator type: {type(getattr(self, 'sizing_coordinator', None))}"
            )

            if hasattr(self, "sizing_coordinator") and self.sizing_coordinator:
                # Let the sizing coordinator handle the sizing - it will call set_unified_size on frames
                print(
                    f"🔍 SECTION DEBUG: Using sizing coordinator for {self.section_type}"
                )
                # Don't resize frames here - let the coordinator do it
                pictograph_size = 100  # Placeholder for container calculations
            else:
                # Fallback to legacy approach if no coordinator
                print(
                    f"🔍 SECTION DEBUG: No sizing coordinator, using legacy sizing for {self.section_type}"
                )
                pictograph_size = self._get_consistent_pictograph_size()
                self._resize_pictograph_frames(pictograph_size)

            actual_width = available_width
            max_row = (len(self.pictographs) - 1) // COLUMN_COUNT
            rows_needed = max_row + 1

            container_height = (
                (rows_needed * pictograph_size)
                + (grid_spacing * (rows_needed - 1))
                + (2 * container_margins)
            )

            if not self._ensure_layout_validity():
                return

            self.pictograph_container.setMinimumSize(actual_width, container_height)
            self.pictograph_container.setMaximumWidth(actual_width)

            from PyQt6.QtWidgets import QSizePolicy

            self.pictograph_container.setSizePolicy(
                QSizePolicy.Policy.Preferred,
                QSizePolicy.Policy.Minimum,
            )

            section_height = (
                container_height + 20
            )  # Reduced from 60px to 20px for header space
            self.setMinimumHeight(section_height)
            self.setSizePolicy(
                QSizePolicy.Policy.Expanding,
                QSizePolicy.Policy.Minimum,
            )

            self._force_layout_activation()

            self.pictograph_container.setVisible(True)
            self.pictograph_container.show()
            self.setVisible(True)
            self.show()

        except RuntimeError:
            pass

    def _get_available_scroll_width(self) -> int:
        """Get available width from parent scroll area, accounting for scroll bars"""
        # Default fallback width
        default_width = 600

        # Try to find the scroll area in parent hierarchy
        parent = self.parent()
        while parent:
            if hasattr(parent, "viewport") and hasattr(parent, "verticalScrollBar"):
                # Found scroll area
                viewport_width = parent.viewport().width()
                scrollbar_width = (
                    parent.verticalScrollBar().width()
                    if parent.verticalScrollBar().isVisible()
                    else 0
                )
                available_width = (
                    viewport_width - scrollbar_width - 20
                )  # Account for margins
                return max(400, available_width)  # Minimum reasonable width
            parent = parent.parent()

        return default_width

    def _resize_pictograph_frames(self, target_size: int) -> None:
        """Resize all pictograph frames to the target size"""
        for pictograph_frame in self.pictographs:
            if pictograph_frame and hasattr(pictograph_frame, "setFixedSize"):
                try:
                    pictograph_frame.setFixedSize(target_size, target_size)
                except RuntimeError:
                    continue

    def _force_layout_activation(self) -> None:
        """Force the QGridLayout to activate and position widgets correctly"""
        try:
            self.pictograph_layout.activate()
            self.pictograph_layout.update()
            self.pictograph_container.updateGeometry()

            from PyQt6.QtWidgets import QApplication

            QApplication.processEvents()
        except RuntimeError:
            pass

    def update_layout(self):
        return

    def _calculate_optimal_columns(self) -> int:
        """Calculate optimal columns based on Legacy behavior and available width"""
        # Get available width from the option picker container
        available_width = 600  # Default fallback

        # Try to get actual available width from parent hierarchy
        parent = self.parent()
        while parent:
            if hasattr(parent, "sections_container"):
                available_width = (
                    parent.sections_container.width() - 40
                )  # Account for margins
                break
            parent = parent.parent()

        pictograph_width = 160 + 8  # Frame width + spacing

        # Calculate max columns that fit
        max_possible_columns = max(1, available_width // pictograph_width)

        # Apply Legacy-style limits based on letter type (but more generous than before)
        if self.letter_type == LetterType.TYPE1:
            # Type1 can have more columns like Legacy's COLUMN_COUNT = 8
            max_columns = min(8, max_possible_columns)
        elif self.letter_type in [LetterType.TYPE4, LetterType.TYPE5, LetterType.TYPE6]:
            max_columns = min(6, max_possible_columns)
        else:
            max_columns = min(7, max_possible_columns)

        result = max(2, max_columns)
        return result

    def resizeEvent(self, event):
        """Modern-style resize event to set proper section width"""
        if self.mw_size_provider:
            # Modern pattern: different width handling for bottom row vs vertical sections
            full_width = self.mw_size_provider().width()

            # Check if this section is in the bottom row (sections 4, 5, 6)
            if self.letter_type in [
                LetterType.TYPE4,
                LetterType.TYPE5,
                LetterType.TYPE6,
            ]:
                # Bottom row sections share the width equally (1/3 each)
                section_width = (
                    full_width - 20
                ) // 3  # Account for spacing between sections
            else:
                # Vertical sections (1, 2, 3) get full width
                section_width = full_width

            # Set the calculated width
            self.setFixedWidth(section_width)

            # Also ensure pictograph container uses available width
            if hasattr(self, "pictograph_container") and self.pictograph_container:
                container_width = section_width - 20  # Account for margins
                self.pictograph_container.setMinimumWidth(container_width)
                self.pictograph_container.setMaximumWidth(container_width)

        super().resizeEvent(event)
