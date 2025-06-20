#!/usr/bin/env python3
"""
Simple dimensional analysis test for option picker sections.
Focus: Analyze cyan button overflow in purple containers.
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
    QSpinBox,
)
from PyQt6.QtCore import Qt, QSize
from PyQt6.QtGui import QFont

try:
    from presentation.components.option_picker.option_picker_section import (
        OptionPickerSection,
    )
    from presentation.components.option_picker.responsive_section_button import (
        ResponsiveSectionButton,
    )
    from presentation.components.option_picker.letter_types import LetterType
except ImportError as e:
    print(f"Import error: {e}")
    sys.exit(1)


class SectionDimensionsTest(QMainWindow):
    """Test window for analyzing section dimensions and overflow."""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Section Dimensions Analyzer")
        self.setGeometry(100, 100, 1200, 800)

        self.sections = {}
        self._setup_ui()

    def _setup_ui(self):
        """Setup the test UI."""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        layout = QVBoxLayout(central_widget)

        # Title
        title = QLabel("Section Dimensions Analysis")
        title.setFont(QFont("Arial", 16, QFont.Weight.Bold))
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(title)

        # Controls
        controls_frame = QFrame()
        controls_layout = QHBoxLayout(controls_frame)

        # Container width control
        controls_layout.addWidget(QLabel("Container Width:"))
        self.width_spinbox = QSpinBox()
        self.width_spinbox.setRange(400, 2000)
        self.width_spinbox.setValue(800)
        controls_layout.addWidget(self.width_spinbox)

        # Analysis button
        analyze_btn = QPushButton("📏 Analyze Dimensions")
        analyze_btn.clicked.connect(self.analyze_dimensions)
        controls_layout.addWidget(analyze_btn)

        controls_layout.addStretch()
        layout.addWidget(controls_frame)

        # Container for sections
        self.sections_container = QWidget()
        self.sections_container.setStyleSheet(
            "border: 2px solid blue; background: rgba(200, 200, 255, 50);"
        )
        self.sections_layout = QVBoxLayout(self.sections_container)

        # Create test sections
        self._create_test_sections()

        layout.addWidget(self.sections_container)

    def _create_test_sections(self):
        """Create test sections to analyze."""

        def dummy_size_provider():
            return QSize(self.width_spinbox.value(), 600)

        # Create individual sections (Types 1,2,3)
        for section_type in [LetterType.TYPE1, LetterType.TYPE2, LetterType.TYPE3]:
            section = OptionPickerSection(
                section_type,
                parent=self.sections_container,
                mw_size_provider=dummy_size_provider,
            )
            self.sections[section_type] = section
            self.sections_layout.addWidget(section)

        # Create bottom row for Types 4,5,6
        bottom_row = QWidget()
        bottom_row.setStyleSheet(
            "border: 2px solid green; background: rgba(200, 255, 200, 50);"
        )
        bottom_layout = QHBoxLayout(bottom_row)

        for section_type in [LetterType.TYPE4, LetterType.TYPE5, LetterType.TYPE6]:
            section = OptionPickerSection(
                section_type, parent=bottom_row, mw_size_provider=dummy_size_provider
            )
            self.sections[section_type] = section
            bottom_layout.addWidget(section)

            # Set equal width
            section.setFixedWidth(self.width_spinbox.value() // 3)

        self.sections_layout.addWidget(bottom_row)

    def analyze_dimensions(self):
        """Analyze all section dimensions and identify overflow."""
        container_width = self.width_spinbox.value()

        print(f"\n{'='*100}")
        print(f"DETAILED SECTION DIMENSIONAL ANALYSIS")
        print(f"{'='*100}")
        print(f"Container Width: {container_width}px")

        # Update container width
        self.sections_container.setFixedWidth(container_width)

        # Update section widths for Types 4,5,6
        for section_type in [LetterType.TYPE4, LetterType.TYPE5, LetterType.TYPE6]:
            if section_type in self.sections:
                section = self.sections[section_type]
                new_width = container_width // 3
                section.setFixedWidth(new_width)
                print(f"Set {section_type} width to: {new_width}px")

        # Force layout update
        QApplication.processEvents()

        # Analyze each section
        for section_type, section in self.sections.items():
            self._analyze_section(section, section_type, container_width)

        print(f"{'='*100}\n")

    def _analyze_section(self, section, section_type, container_width):
        """Analyze individual section for overflow."""
        section_rect = section.geometry()

        print(f"\n🔍 SECTION {section_type}:")
        print(
            f"   Geometry: x={section_rect.x()}, y={section_rect.y()}, w={section_rect.width()}, h={section_rect.height()}"
        )
        print(f"   Right edge: {section_rect.x() + section_rect.width()}px")

        # Analyze header button (the cyan rounded button)
        if hasattr(section, "header_button"):
            header_button = section.header_button
            button_rect = header_button.geometry()

            print(f"   📝 Header Button (Cyan Rounded):")
            print(
                f"      Geometry: x={button_rect.x()}, y={button_rect.y()}, w={button_rect.width()}, h={button_rect.height()}"
            )
            print(f"      Right edge: {button_rect.x() + button_rect.width()}px")
            print(f"      Parent section width: {section_rect.width()}px")

            # Check for overflow
            button_right = button_rect.x() + button_rect.width()
            section_right = section_rect.width()  # Since button is relative to section

            if button_right > section_right:
                overflow = button_right - section_right
                print(
                    f"      ⚠️  CYAN BUTTON OVERFLOW: {overflow}px beyond section boundary!"
                )
                print(
                    f"      ⚠️  Button extends to {button_right}px but section is only {section_right}px wide"
                )
            else:
                margin = section_right - button_right
                print(f"      ✅ Button fits with {margin}px margin")

            # Check button styling
            button_style = header_button.styleSheet()
            if "border-radius" in button_style:
                print(f"      🎨 Button has rounded styling (border-radius detected)")

            # Get button margins and padding from style
            print(
                f"      📐 Button size policy: {header_button.sizePolicy().horizontalPolicy()}"
            )
            print(f"      📐 Button minimum size: {header_button.minimumSize()}")
            print(f"      📐 Button maximum size: {header_button.maximumSize()}")

        # Check for section overflow beyond container
        if section_type in [LetterType.TYPE4, LetterType.TYPE5, LetterType.TYPE6]:
            expected_width = container_width // 3
            if section_rect.width() > expected_width:
                section_overflow = section_rect.width() - expected_width
                print(
                    f"   ⚠️  SECTION OVERFLOW: {section_overflow}px beyond expected width"
                )


def main():
    app = QApplication(sys.argv)
    window = SectionDimensionsTest()
    window.show()

    # Run initial analysis
    window.analyze_dimensions()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
