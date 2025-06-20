#!/usr/bin/env python3
"""
Isolated test for Option Picker layout debugging.
Focus: Fix cyan bordered button sizing within its parent container.
"""

import sys
import os
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / "src"))

from PyQt6.QtWidgets import (
    QApplication,
    QMainWindow,
    QVBoxLayout,
    QHBoxLayout,
    QWidget,
    QLabel,
    QPushButton,
    QFrame,
    QScrollArea,
)
from PyQt6.QtCore import Qt, QSize
from PyQt6.QtGui import QFont

# Import the option picker components
try:
    from presentation.components.option_picker.option_picker import OptionPicker
    from presentation.components.option_picker.option_picker_section import (
        OptionPickerSection,
    )
    from presentation.components.option_picker.display_manager import (
        OptionPickerDisplayManager,
    )
    from presentation.components.option_picker.responsive_sizing_manager import (
        ResponsiveSizingManager,
    )
    from presentation.components.option_picker.letter_types import LetterType
except ImportError as e:
    print(f"Import error: {e}")
    print("Make sure you're running from the modern directory")
    sys.exit(1)


class OptionPickerLayoutTest(QMainWindow):
    """Isolated test window for debugging option picker layout issues."""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Option Picker Layout Debugger")
        self.setGeometry(100, 100, 1200, 800)

        self._setup_ui()
        self._add_debug_controls()

    def _setup_ui(self):
        """Setup the main UI with option picker for testing."""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(10)

        # Title
        title = QLabel("Option Picker Layout Debugger")
        title.setFont(QFont("Arial", 16, QFont.Weight.Bold))
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(title)

        # Info label
        info = QLabel(
            "Focus: Debug cyan button sizing within purple container boundaries"
        )
        info.setStyleSheet("color: #666; font-style: italic;")
        info.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(info)

        # Container for the option picker with debugging border
        self.option_picker_container = QFrame()
        self.option_picker_container.setStyleSheet(
            """
            QFrame {
                background: rgba(240, 240, 240, 100);
                border: 3px solid #333;
                border-radius: 8px;
                margin: 10px;
            }
        """
        )

        container_layout = QVBoxLayout(self.option_picker_container)
        container_layout.setContentsMargins(10, 10, 10, 10)

        # Create option picker with size provider
        def size_provider():
            return QSize(
                self.option_picker_container.width() - 40,  # Account for margins
                self.option_picker_container.height() - 40,
            )

        # Initialize option picker
        try:
            self.option_picker = OptionPicker()
            container_layout.addWidget(self.option_picker)
        except Exception as e:
            error_label = QLabel(f"Failed to create OptionPickerWidget: {e}")
            error_label.setStyleSheet("color: red; padding: 20px;")
            container_layout.addWidget(error_label)
            self.option_picker = None

        main_layout.addWidget(self.option_picker_container)

    def _add_debug_controls(self):
        """Add debugging controls at the bottom."""
        controls_frame = QFrame()
        controls_frame.setStyleSheet(
            """
            QFrame {
                background: rgba(200, 200, 200, 100);
                border: 1px solid #999;
                border-radius: 5px;
                padding: 10px;
            }
        """
        )

        controls_layout = QHBoxLayout(controls_frame)

        # Resize test buttons
        resize_small_btn = QPushButton("Resize Small (800x400)")
        resize_small_btn.clicked.connect(lambda: self.resize(800, 400))
        controls_layout.addWidget(resize_small_btn)

        resize_medium_btn = QPushButton("Resize Medium (1200x600)")
        resize_medium_btn.clicked.connect(lambda: self.resize(1200, 600))
        controls_layout.addWidget(resize_medium_btn)

        resize_large_btn = QPushButton("Resize Large (1600x900)")
        resize_large_btn.clicked.connect(lambda: self.resize(1600, 900))
        controls_layout.addWidget(resize_large_btn)

        controls_layout.addStretch()

        # Debug info button
        debug_info_btn = QPushButton("Show Debug Info")
        debug_info_btn.clicked.connect(self._show_debug_info)
        controls_layout.addWidget(debug_info_btn)

        # Dimensional analysis button
        analysis_btn = QPushButton("📏 Analyze Dimensions")
        analysis_btn.clicked.connect(self.analyze_component_dimensions)
        controls_layout.addWidget(analysis_btn)

        # Refresh button
        refresh_btn = QPushButton("Refresh Layout")
        refresh_btn.clicked.connect(self._refresh_layout)
        controls_layout.addWidget(refresh_btn)

        self.centralWidget().layout().addWidget(controls_frame)

    def _show_debug_info(self):
        """Print debug information about current layout."""
        print("\n" + "=" * 50)
        print("OPTION PICKER LAYOUT DEBUG INFO")
        print("=" * 50)

        print(f"Window size: {self.size().width()} x {self.size().height()}")
        print(
            f"Container size: {self.option_picker_container.size().width()} x {self.option_picker_container.size().height()}"
        )

        if self.option_picker:
            print(
                f"Option picker size: {self.option_picker.size().width()} x {self.option_picker.size().height()}"
            )

            # Try to access sections if available
            if (
                hasattr(self.option_picker, "display_manager")
                and self.option_picker.display_manager
            ):
                dm = self.option_picker.display_manager
                if hasattr(dm, "_sections"):
                    print(f"Number of sections: {len(dm._sections)}")
                    for section_type, section in dm._sections.items():
                        if section:
                            print(
                                f"  Section {section_type}: {section.size().width()} x {section.size().height()}"
                            )

                            # Check if section has header button
                            if hasattr(section, "header_button"):
                                btn = section.header_button
                                print(
                                    f"    Header button: {btn.size().width()} x {btn.size().height()}"
                                )

        print("=" * 50 + "\n")

    def _refresh_layout(self):
        """Force refresh of the option picker layout."""
        if self.option_picker:
            try:
                # Try to trigger layout recalculation
                if hasattr(self.option_picker, "update_layout"):
                    self.option_picker.update_layout()
                elif hasattr(self.option_picker, "display_manager"):
                    dm = self.option_picker.display_manager
                    if hasattr(dm, "responsive_sizing") and dm.responsive_sizing:
                        dm.responsive_sizing.calculate_dynamic_sizing()
                        dm.responsive_sizing.apply_sizing_to_sections()

                # Force layout updates
                self.option_picker.updateGeometry()
                QApplication.processEvents()

                # Run our detailed analysis
                self.analyze_component_dimensions()

            except Exception as e:
                print(f"Error during layout refresh: {e}")
                # Still run analysis even if refresh fails
                self.analyze_component_dimensions()

    def resizeEvent(self, event):
        """Handle window resize to trigger option picker updates."""
        super().resizeEvent(event)
        if (
            hasattr(self, "option_picker") and self.option_picker
        ):  # Trigger layout update after resize
            self.option_picker.update()

    def analyze_component_dimensions(self):
        """Analyze and print detailed dimensions of all components to identify overflow."""
        print(f"\n{'='*80}")
        print(f"DETAILED COMPONENT DIMENSIONAL ANALYSIS")
        print(f"{'='*80}")

        # Start with root widget hierarchy analysis
        print(f"\n🌳 WIDGET HIERARCHY ANALYSIS:")
        if hasattr(self, "sections"):
            for section_type, section in self.sections.items():
                print(f"\n--- SECTION {section_type} HIERARCHY ---")
                self._analyze_widget_hierarchy(section)

        # Original analysis for comparison
        print(f"\n🔍 ORIGINAL GEOMETRIC ANALYSIS:")

        # Check each section in detail
        if hasattr(self, "sections"):
            for section_type, section in self.sections.items():
                print(f"\n📋 SECTION {section_type} DETAILED ANALYSIS:")
                section_rect = section.geometry()
                print(
                    f"   Section size: {section_rect.width()}x{section_rect.height()}"
                )

                # Check header button
                if hasattr(section, "header_button"):
                    header_rect = section.header_button.geometry()
                    print(
                        f"   Header button: {header_rect.width()}x{header_rect.height()}"
                    )

                    # Precise overflow check for header vs section
                    self._check_precise_overflow(
                        header_rect,
                        section_rect,
                        f"Header Button (Section {section_type})",
                        f"Section Container {section_type}",
                    )

                # Check pictograph container
                if hasattr(section, "pictograph_container"):
                    pictograph_rect = section.pictograph_container.geometry()
                    print(
                        f"   Pictograph container: {pictograph_rect.width()}x{pictograph_rect.height()}"
                    )

                    # Check if any pictographs overflow
                    try:
                        pictographs = section.pictograph_container.findChildren(QWidget)
                        for i, pictograph in enumerate(
                            pictographs[:3]
                        ):  # Check first few
                            pict_rect = pictograph.geometry()
                            self._check_precise_overflow(
                                pict_rect,
                                pictograph_rect,
                                f"Pictograph {i}",
                                "Pictograph Container",
                            )
                    except Exception as e:
                        print(f"   Error checking pictographs: {e}")

        print(f"\n{'='*80}")
        print(f"END DIMENSIONAL ANALYSIS")
        print(f"{'='*80}\n")

    def _analyze_section(self, section, section_type, parent_container):
        """Analyze individual section dimensions and check for overflow."""
        section_rect = section.geometry()
        parent_rect = parent_container.geometry() if parent_container else None

        print(f"\n   📄 SECTION {section_type}:")
        print(f"      Position: ({section_rect.x()}, {section_rect.y()})")
        print(f"      Size: {section_rect.width()}x{section_rect.height()}")
        print(f"      Bottom edge: {section_rect.y() + section_rect.height()}")
        print(f"      Right edge: {section_rect.x() + section_rect.width()}")

        # Check header button if it exists
        if hasattr(section, "header_button"):
            header_rect = section.header_button.geometry()
            print(f"      📝 Header Button:")
            print(f"         Position: ({header_rect.x()}, {header_rect.y()})")
            print(f"         Size: {header_rect.width()}x{header_rect.height()}")
            print(f"         Bottom edge: {header_rect.y() + header_rect.height()}")
            print(f"         Right edge: {header_rect.x() + header_rect.width()}")

            # Check if header button overflows section
            section_inner_width = section_rect.width()
            section_inner_height = section_rect.height()

            if header_rect.width() > section_inner_width:
                overflow_x = header_rect.width() - section_inner_width
                print(
                    f"         ⚠️  HEADER HORIZONTAL OVERFLOW: {overflow_x}px beyond section"
                )
            if header_rect.height() > section_inner_height:
                overflow_y = header_rect.height() - section_inner_height
                print(
                    f"         ⚠️  HEADER VERTICAL OVERFLOW: {overflow_y}px beyond section"
                )

        # Check pictograph container if it exists
        if hasattr(section, "pictograph_container"):
            pictograph_rect = section.pictograph_container.geometry()
            print(f"      🖼️  Pictograph Container:")
            print(f"         Position: ({pictograph_rect.x()}, {pictograph_rect.y()})")
            print(
                f"         Size: {pictograph_rect.width()}x{pictograph_rect.height()}"
            )
            print(
                f"         Bottom edge: {pictograph_rect.y() + pictograph_rect.height()}"
            )
            print(
                f"         Right edge: {pictograph_rect.x() + pictograph_rect.width()}"
            )

        # Check if section overflows parent
        if parent_rect:
            if section_rect.x() + section_rect.width() > parent_rect.width():
                overflow_x = (
                    section_rect.x() + section_rect.width()
                ) - parent_rect.width()
                print(
                    f"      ⚠️  SECTION HORIZONTAL OVERFLOW: {overflow_x}px beyond parent"
                )
            if section_rect.y() + section_rect.height() > parent_rect.height():
                overflow_y = (
                    section_rect.y() + section_rect.height()
                ) - parent_rect.height()
                print(
                    f"      ⚠️  SECTION VERTICAL OVERFLOW: {overflow_y}px beyond parent"
                )

    def _analyze_bottom_row_container(self, bottom_container, parent_container):
        """Analyze the bottom row container that holds Types 4,5,6."""
        if not bottom_container:
            return

        bottom_rect = bottom_container.geometry()
        parent_rect = parent_container.geometry() if parent_container else None

        print(f"\n🔄 BOTTOM ROW CONTAINER (Types 4,5,6):")
        print(f"   Position: ({bottom_rect.x()}, {bottom_rect.y()})")
        print(f"   Size: {bottom_rect.width()}x{bottom_rect.height()}")
        print(f"   Bottom edge: {bottom_rect.y() + bottom_rect.height()}")
        print(f"   Right edge: {bottom_rect.x() + bottom_rect.width()}")

        # Check bottom row layout
        if hasattr(bottom_container, "layout") and bottom_container.layout():
            layout = bottom_container.layout()
            print(f"   Layout margins: {layout.contentsMargins()}")
            print(f"   Layout spacing: {layout.spacing()}")

            # Analyze each widget in bottom row
            for i in range(layout.count()):
                item = layout.itemAt(i)
                if item and item.widget():
                    widget = item.widget()
                    widget_rect = widget.geometry()
                    print(f"   Widget {i}:")
                    print(f"      Position: ({widget_rect.x()}, {widget_rect.y()})")
                    print(f"      Size: {widget_rect.width()}x{widget_rect.height()}")
                    print(f"      Right edge: {widget_rect.x() + widget_rect.width()}")

        # Check if bottom container overflows parent
        if parent_rect:
            if bottom_rect.x() + bottom_rect.width() > parent_rect.width():
                overflow_x = (
                    bottom_rect.x() + bottom_rect.width()
                ) - parent_rect.width()
                print(
                    f"   ⚠️  BOTTOM ROW HORIZONTAL OVERFLOW: {overflow_x}px beyond parent"
                )
            if bottom_rect.y() + bottom_rect.height() > parent_rect.height():
                overflow_y = (
                    bottom_rect.y() + bottom_rect.height()
                ) - parent_rect.height()
                print(
                    f"   ⚠️  BOTTOM ROW VERTICAL OVERFLOW: {overflow_y}px beyond parent"
                )

    def _check_precise_overflow(self, child_rect, parent_rect, child_name, parent_name):
        """Check for precise overflow including visual boundaries, not just geometric ones."""
        print(f"\n🔍 PRECISE OVERFLOW CHECK: {child_name} vs {parent_name}")

        # Calculate absolute positions
        child_left = child_rect.x()
        child_right = child_rect.x() + child_rect.width()
        child_top = child_rect.y()
        child_bottom = child_rect.y() + child_rect.height()

        parent_left = parent_rect.x()
        parent_right = parent_rect.x() + parent_rect.width()
        parent_top = parent_rect.y()
        parent_bottom = parent_rect.y() + parent_rect.height()

        print(f"   {child_name}:")
        print(
            f"     Left: {child_left}, Right: {child_right}, Top: {child_top}, Bottom: {child_bottom}"
        )
        print(f"   {parent_name}:")
        print(
            f"     Left: {parent_left}, Right: {parent_right}, Top: {parent_top}, Bottom: {parent_bottom}"
        )

        # Check each edge
        overflow_left = max(0, parent_left - child_left)
        overflow_right = max(0, child_right - parent_right)
        overflow_top = max(0, parent_top - child_top)
        overflow_bottom = max(0, child_bottom - parent_bottom)

        has_overflow = any(
            [overflow_left, overflow_right, overflow_top, overflow_bottom]
        )

        if has_overflow:
            print(f"   ⚠️  OVERFLOW DETECTED:")
            if overflow_left > 0:
                print(f"     LEFT OVERFLOW: {overflow_left}px")
            if overflow_right > 0:
                print(f"     RIGHT OVERFLOW: {overflow_right}px")
            if overflow_top > 0:
                print(f"     TOP OVERFLOW: {overflow_top}px")
            if overflow_bottom > 0:
                print(f"     BOTTOM OVERFLOW: {overflow_bottom}px")
        else:
            print(f"   ✅ No overflow detected")

        return has_overflow

    def _analyze_widget_hierarchy(self, widget, parent=None, depth=0):
        """Recursively analyze widget hierarchy to find overflow at any level."""
        indent = "  " * depth
        widget_name = widget.__class__.__name__

        if hasattr(widget, "objectName") and widget.objectName():
            widget_name += f" ({widget.objectName()})"

        widget_rect = widget.geometry()
        print(
            f"{indent}📦 {widget_name}: {widget_rect.width()}x{widget_rect.height()} at ({widget_rect.x()}, {widget_rect.y()})"
        )

        # Check overflow against parent
        if parent:
            parent_rect = parent.geometry()
            self._check_precise_overflow(
                widget_rect, parent_rect, widget_name, parent.__class__.__name__
            )

        # Analyze children
        try:
            children = widget.findChildren(QWidget)
            # Only direct children
            direct_children = [child for child in children if child.parent() == widget]

            for child in direct_children[:5]:  # Limit to first 5 to avoid spam
                self._analyze_widget_hierarchy(child, widget, depth + 1)

        except Exception as e:
            print(f"{indent}Error analyzing children: {e}")


def main():
    """Run the isolated option picker layout test."""
    app = QApplication(sys.argv)

    # Set application style
    app.setStyle("Fusion")

    # Create and show test window
    test_window = OptionPickerLayoutTest()
    test_window.show()

    print("Option Picker Layout Debugger Started")
    print("Use the buttons to resize and debug the layout")
    print("Focus: Cyan button sizing within purple containers")

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
