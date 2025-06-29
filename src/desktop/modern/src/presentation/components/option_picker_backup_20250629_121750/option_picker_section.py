from typing import List
from PyQt6.QtWidgets import QWidget, QVBoxLayout
from PyQt6.QtCore import Qt
from .letter_types import LetterType
from .option_picker_section_header import OptionPickerSectionHeader
from .option_picker_section_pictograph_container import (
    OptionPickerSectionPictographContainer,
)


class OptionPickerSection(QWidget):
    """
    Refactored Option Picker Section following legacy architecture.

    Components:
    - OptionPickerSectionHeader: Handles header and button
    - OptionPickerSectionPictographFrame: Handles pictograph grid

    This matches the legacy structure for proper sizing.
    """

    def __init__(self, letter_type: str, parent=None, mw_size_provider=None):
        super().__init__(parent)
        self.letter_type = letter_type
        self.mw_size_provider = mw_size_provider
        self.is_groupable = letter_type in [
            LetterType.TYPE4,
            LetterType.TYPE5,
            LetterType.TYPE6,
        ]
        self._last_width = None  # Track width to prevent unnecessary resize
        self._resize_in_progress = False  # Prevent resize cascades
        self._debug_logged = False  # Only log once per major change
        self._option_picker_width = 0  # Reactive sizing reference
        self._setup_ui()
        self._register_for_sizing_updates()

    def _setup_ui(self):
        """Setup UI using legacy-style separation of concerns."""
        # Main layout - legacy style: VBoxLayout with 0 margins and spacing
        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignmentFlag.AlignVCenter)
        layout.setSpacing(0)
        layout.setContentsMargins(0, 0, 0, 0)

        # Create header component
        self.header = OptionPickerSectionHeader(self)
        layout.addWidget(self.header)

        # Create pictograph frame component
        self.section_pictograph_container = OptionPickerSectionPictographContainer(self)
        layout.addWidget(self.section_pictograph_container)

        # Set transparent background
        self.setStyleSheet("background-color: transparent; border: none;")
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)

        # For compatibility, alias the frame as pictograph_container
        self.section_pictograph_container = self.section_pictograph_container
        self.pictograph_layout = self.section_pictograph_container.layout
        self.pictographs = self.section_pictograph_container.pictographs

        # Access header button for compatibility
        self.header_button = self.header.type_button

    def _get_global_pictograph_size(self) -> int:
        """
        Calculate consistent pictograph size using legacy algorithm.
        FIXED: Use frame width instead of section width for accurate sizing.
        """
        if self.mw_size_provider:
            main_window_width = self.mw_size_provider().width()

            # FIXED: Use frame width since that's where pictographs actually live
            frame_width = (
                self.section_pictograph_container.width()
                if self.section_pictograph_container.width() > 0
                else self.width()
            )

            # If frame width is still 0, fall back to section width
            if frame_width <= 0:
                frame_width = self.width() if self.width() > 0 else main_window_width

            # Legacy algorithm: max(mw_width // 16, container.width() // 8)
            # FIXED: Use frame_width instead of section_width
            size = max(main_window_width // 16, frame_width // 8)

            # Legacy border width calculation: max(1, int(size * 0.015))
            border_width = max(1, int(size * 0.015))

            # Legacy spacing (grid spacing from frame)
            spacing = self.section_pictograph_container.main_layout.spacing()

            # Legacy final calculation: size -= 2 * bw + spacing
            final_size = size - (2 * border_width) - spacing

            # Apply reasonable bounds to prevent extreme sizes
            final_size = max(60, min(final_size, 200))

            return final_size
        else:
            return 100  # Fallback size

    def add_pictograph_from_pool(self, pictograph_frame):
        """Add pictograph from pool using frame component."""
        # CRITICAL FIX: Ensure sections_container is properly sized before pictograph sizing
        self._ensure_container_ready()

        # FIXED: Ensure frame width is synchronized before adding pictographs
        self.section_pictograph_container.sync_width_with_section()
        self.section_pictograph_container.add_pictograph(pictograph_frame)
        self._update_size()

    def _ensure_container_ready(self):
        """Ensure the option picker container is properly sized before pictograph operations"""
        # Force the widget hierarchy to process any pending layout updates
        if self.parent():
            # Walk up to find the option picker container
            widget = self.parent()
            while widget:
                # Look for ModernOptionPickerWidget or sections container
                if (
                    hasattr(widget, "__class__")
                    and "ModernOptionPickerWidget" in widget.__class__.__name__
                ):
                    # Found the main option picker - ensure it's properly sized
                    widget.updateGeometry()
                    widget.update()
                    # Process any pending events to ensure sizing is complete
                    from PyQt6.QtWidgets import QApplication

                    QApplication.processEvents()
                    break
                elif (
                    hasattr(widget, "layout")
                    and widget.layout()
                    and widget.layout().__class__.__name__ == "QVBoxLayout"
                    and widget.width() > 500
                ):  # Reasonable minimum for option picker
                    # Found a large sections container - ensure it's properly sized
                    widget.updateGeometry()
                    widget.update()
                    # Process any pending events to ensure sizing is complete
                    from PyQt6.QtWidgets import QApplication

                    QApplication.processEvents()
                    break
                widget = widget.parent()

    def _register_for_sizing_updates(self):
        """Register this section to receive sizing updates from the option picker"""
        # Walk up to find the ModernOptionPickerWidget
        widget = self.parent()
        while widget:
            if (
                hasattr(widget, "__class__")
                and "ModernOptionPickerWidget" in widget.__class__.__name__
            ):
                # Found the option picker - register for sizing updates
                widget.add_sizing_callback(self._on_option_picker_resize)
                print(f"🔗 Section {self.letter_type} registered for sizing updates")
                break
            widget = widget.parent()

    def _on_option_picker_resize(self, option_picker_width: int):
        """Handle option picker width changes"""
        self._option_picker_width = option_picker_width
        print(
            f"📏 Section {self.letter_type} received sizing update: {option_picker_width}px"
        )

        # Notify all pictograph frames in this section
        if hasattr(self, "section_pictograph_container"):
            self.section_pictograph_container.update_sizing_reference(
                option_picker_width
            )

    def clear_pictographs(self):
        """Clear pictographs using frame component."""
        self.section_pictograph_container.clear_pictographs()

    def clear_pictographs_pool_style(self):
        """Clear pictographs using pool style."""
        self.section_pictograph_container.clear_pictographs_pool_style()

    def _update_size(self):
        """Update section size using legacy-style calculation."""
        try:
            # FIXED: Ensure frame width matches section width exactly
            self.section_pictograph_container.sync_width_with_section()

            # Get global pictograph size (now uses correct frame width)
            pictograph_size = self._get_global_pictograph_size()

            # Resize pictographs
            self.section_pictograph_container.resize_pictographs(pictograph_size)

            # Calculate required heights
            header_height = self.header.get_calculated_height()
            pictograph_height = (
                self.section_pictograph_container.calculate_required_height(
                    pictograph_size
                )
            )

            # Total section height (legacy style: just header + content)
            total_height = header_height + pictograph_height

            # Set minimum height for section
            self.setMinimumHeight(total_height)

            # Force header to correct size - but don't trigger more resizes
            if hasattr(self.header, "type_button"):
                # Directly set size without triggering resize events
                self.header.type_button._resizing = True
                try:
                    calculated_height = self.header.get_calculated_height()
                    self.header.setFixedHeight(calculated_height)

                    # Size the button without triggering resize
                    if hasattr(self, "mw_size_provider") and self.mw_size_provider:
                        parent_height = self.mw_size_provider().height()
                        font_size = max(parent_height // 70, 10)
                        label_height = max(int(font_size * 3), 20)
                        label_width = max(int(label_height * 6), 100)

                        from PyQt6.QtCore import QSize

                        self.header.type_button.setFixedSize(
                            QSize(label_width, label_height)
                        )
                finally:
                    self.header.type_button._resizing = False

            # Update layout without triggering cascading resizes
            self.updateGeometry()

        except Exception as e:
            print(f"⚠️ [ERROR] Size update failed for {self.letter_type}: {e}")

    def _log_layout_metrics(self, context: str):
        """Log comprehensive layout metrics for comparison with legacy."""
        try:
            if self.mw_size_provider:
                main_window_size = self.mw_size_provider()
                print(f"\n📊 [MODERN METRICS] {self.letter_type} - {context}")
                print(
                    f"   Main Window: {main_window_size.width()}x{main_window_size.height()}"
                )
                print(f"   Section: {self.width()}x{self.height()}")
                print(
                    f"   Frame: {self.section_pictograph_container.width()}x{self.section_pictograph_container.height()}"
                )
                print(
                    f"   Grid spacing: {self.section_pictograph_container.main_layout.spacing()}px"
                )
                print(
                    f"   Pictograph count: {len(self.section_pictograph_container.pictographs)}"
                )
                print(f"   Pictograph size: {self._get_global_pictograph_size()}px")

                # Show section width calculation details
                full_width = main_window_size.width()
                if self.letter_type in [
                    LetterType.TYPE1,
                    LetterType.TYPE2,
                    LetterType.TYPE3,
                ]:
                    expected_section_width = full_width
                    print(f"   Section width calculation: {full_width} (full width)")
                else:
                    expected_section_width = full_width // 3
                    print(
                        f"   Section width calculation: {full_width} // 3 = {expected_section_width}px"
                    )
                print(f"   Actual section width: {self.width()}px")

                # Calculate grid utilization
                if len(self.section_pictograph_container.pictographs) > 0:
                    rows = (
                        len(self.section_pictograph_container.pictographs) - 1
                    ) // 8 + 1
                    print(f"   Grid layout: {rows} rows x 8 columns")

                    # Calculate expected vs actual widths
                    pictograph_size = self._get_global_pictograph_size()
                    spacing = self.section_pictograph_container.main_layout.spacing()
                    expected_frame_width = (pictograph_size * 8) + (spacing * 7)

                    # FIXED: Show frame-section width match status
                    frame_width = self.section_pictograph_container.width()
                    section_width = self.width()
                    width_match = "✓" if frame_width == section_width else "✗"

                    # ENHANCED: Add border analysis for pictograph sizing investigation
                    border_width = max(1, int(pictograph_size * 0.015))
                    actual_pictograph_width = (
                        pictograph_size  # Frame size (borders are overlays)
                    )
                    total_pictographs_width = actual_pictograph_width * 8
                    total_spacing_width = spacing * 7
                    total_content_width = total_pictographs_width + total_spacing_width

                    overflow = (
                        total_content_width - frame_width if frame_width > 0 else 0
                    )
                    overflow_status = "⚠️ OVERFLOW" if overflow > 0 else "✓ FITS"

                    utilization = (
                        (expected_frame_width / frame_width * 100)
                        if frame_width > 0
                        else 0
                    )
                    print(f"   Expected frame width: {expected_frame_width}px")
                    print(f"   Actual frame width: {frame_width}px")
                    print(
                        f"   Frame-Section match: {width_match} ({frame_width} == {section_width})"
                    )
                    print(f"   Width utilization: {utilization:.1f}%")
                    print(f"   🔍 BORDER ANALYSIS:")
                    print(
                        f"      Border width: {border_width}px (calculated from size)"
                    )
                    print(f"      Pictograph frame size: {actual_pictograph_width}px")
                    print(
                        f"      Total pictographs: {total_pictographs_width}px (8 × {actual_pictograph_width})"
                    )
                    print(
                        f"      Total spacing: {total_spacing_width}px (7 × {spacing})"
                    )
                    print(f"      Total content width: {total_content_width}px")
                    print(
                        f"      Container overflow: {overflow_status} ({overflow:+d}px)"
                    )
                print("   ---")
        except Exception as e:
            print(f"⚠️ [ERROR] Metrics logging failed: {e}")

    def resizeEvent(self, event):
        """Handle resize events using legacy approach."""
        if self._resize_in_progress:
            return

        self._resize_in_progress = True
        try:
            if self.mw_size_provider:
                full_width = self.mw_size_provider().width()

                # Calculate section width based on type
                if self.letter_type in [
                    LetterType.TYPE4,
                    LetterType.TYPE5,
                    LetterType.TYPE6,
                ]:
                    # Bottom row sections - use fixed calculation
                    section_width = full_width // 3
                else:
                    # Top sections - use full width like legacy system
                    section_width = full_width

                # Only resize if width actually changed significantly
                if (
                    self._last_width is None
                    or abs(self._last_width - section_width) > 5
                ):
                    self._last_width = section_width
                    self.setFixedWidth(section_width)

                    # FIXED: Ensure frame width matches section width immediately
                    self.section_pictograph_container.sync_width_with_section()

                    # Log only on significant width changes for Types 1-3
                    if not self._debug_logged and self.letter_type in [
                        "Type1",
                        "Type2",
                        "Type3",
                    ]:
                        self._log_layout_metrics("On resize width change")
                        self._debug_logged = True

        except Exception as e:
            print(f"⚠️ [ERROR] Resize failed for {self.letter_type}: {e}")
        finally:
            self._resize_in_progress = False

        super().resizeEvent(event)

    def toggle_section(self):
        """Toggle section visibility."""
        is_visible = not self.section_pictograph_container.isVisible()
        self.section_pictograph_container.setVisible(is_visible)

    # Properties for compatibility with old code
    @property
    def pictographs(self):
        return self.section_pictograph_container.pictographs

    @pictographs.setter
    def pictographs(self, value):
        self.section_pictograph_container.pictographs = value
