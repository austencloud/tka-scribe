#!/usr/bin/env python3
"""
Minimal test for debugging cyan button sizing in option picker sections.
Focus: Isolate and fix the button overflow issue.
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
    QSpinBox,
)
from PyQt6.QtCore import Qt, QSize
from PyQt6.QtGui import QFont

# Import the specific components we need to test
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
    print("Make sure you're running from the modern directory")
    sys.exit(1)


class ButtonSizingTest(QMainWindow):
    """Minimal test for debugging button sizing issues."""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Button Sizing Debugger")
        self.setGeometry(100, 100, 1000, 700)

        self._setup_ui()

    def _setup_ui(self):
        """Setup minimal UI to test button sizing."""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(15)

        # Title
        title = QLabel("Cyan Button Sizing Debugger")
        title.setFont(QFont("Arial", 16, QFont.Weight.Bold))
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(title)

        # Controls for testing different container sizes
        controls_frame = QFrame()
        controls_frame.setStyleSheet(
            "border: 1px solid #ccc; padding: 10px; border-radius: 5px;"
        )
        controls_layout = QHBoxLayout(controls_frame)

        controls_layout.addWidget(QLabel("Container Width:"))
        self.width_spinbox = QSpinBox()
        self.width_spinbox.setRange(200, 1500)
        self.width_spinbox.setValue(800)
        self.width_spinbox.valueChanged.connect(self._update_container_size)
        controls_layout.addWidget(self.width_spinbox)

        controls_layout.addWidget(QLabel("Container Height:"))
        self.height_spinbox = QSpinBox()
        self.height_spinbox.setRange(100, 800)
        self.height_spinbox.setValue(200)
        self.height_spinbox.valueChanged.connect(self._update_container_size)
        controls_layout.addWidget(self.height_spinbox)

        refresh_btn = QPushButton("Refresh")
        refresh_btn.clicked.connect(self._refresh_sections)
        controls_layout.addWidget(refresh_btn)

        controls_layout.addStretch()
        main_layout.addWidget(controls_frame)

        # Test container with visible borders (purple container)
        self.test_container = QFrame()
        self.test_container.setStyleSheet(
            """
            QFrame {
                background: rgba(240, 240, 255, 100);
                border: 3px solid purple;
                border-radius: 8px;
                margin: 5px;
            }
        """
        )

        self.container_layout = QVBoxLayout(self.test_container)
        self.container_layout.setContentsMargins(10, 10, 10, 10)
        self.container_layout.setSpacing(10)

        # Create test sections
        self._create_test_sections()

        main_layout.addWidget(self.test_container)

        # Info panel
        self.info_label = QLabel()
        self.info_label.setStyleSheet(
            "color: #666; font-family: monospace; padding: 10px;"
        )
        self.info_label.setWordWrap(True)
        main_layout.addWidget(self.info_label)

        self._update_info()

    def _create_test_sections(self):
        """Create test sections to debug button sizing."""

        # Create a simple size provider
        def size_provider():
            return QSize(self.width_spinbox.value(), self.height_spinbox.value())

        # Test different section types
        section_types = [LetterType.TYPE1, LetterType.TYPE4, LetterType.TYPE5]

        for i, section_type in enumerate(section_types):
            # Section container with cyan styling (like in the actual app)
            section_frame = QFrame()
            section_frame.setStyleSheet(
                f"""
                QFrame {{
                    background: rgba(100, 200, 200, 150);  /* Cyan background */
                    border: 2px solid cyan;
                    border-radius: 12px;
                    margin: 3px;
                    padding: 5px;
                }}
            """
            )

            section_layout = QVBoxLayout(section_frame)
            section_layout.setContentsMargins(5, 5, 5, 5)

            # Create section
            try:
                section = OptionPickerSection(
                    section_type, parent=section_frame, mw_size_provider=size_provider
                )

                # Add some test content
                section_layout.addWidget(QLabel(f"Section: {section_type}"))
                section_layout.addWidget(section)

                # Store reference for debugging
                setattr(self, f"section_{i}", section)

            except Exception as e:
                error_label = QLabel(f"Failed to create section {section_type}: {e}")
                error_label.setStyleSheet("color: red;")
                section_layout.addWidget(error_label)

            self.container_layout.addWidget(section_frame)

    def _update_container_size(self):
        """Update the test container size."""
        width = self.width_spinbox.value()
        height = self.height_spinbox.value()

        self.test_container.setFixedSize(width + 20, height + 100)  # Add padding
        self._update_info()

    def _refresh_sections(self):
        """Refresh the section layout."""
        # Clear existing sections
        for i in reversed(range(self.container_layout.count())):
            child = self.container_layout.itemAt(i).widget()
            if child:
                child.deleteLater()

        # Recreate sections
        self._create_test_sections()
        self._update_info()

    def _update_info(self):
        """Update debug information display."""
        width = self.width_spinbox.value()
        height = self.height_spinbox.value()

        info_text = f"""
Debug Info:
Container Size: {width} x {height}
Expected Section Width: {width // 3} (for TYPE4/5/6)
Expected Section Width: {width} (for TYPE1/2/3)

Check: Do cyan sections fit within purple container?
Check: Are button sizes appropriate for container?
Check: Any overflow or clipping issues?
        """.strip()

        self.info_label.setText(info_text)


def main():
    """Run the button sizing test."""
    app = QApplication(sys.argv)
    app.setStyle("Fusion")

    test_window = ButtonSizingTest()
    test_window.show()

    print("Button Sizing Debugger Started")
    print("Adjust container size to test button fitting")
    print("Look for cyan sections overflowing purple container")

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
