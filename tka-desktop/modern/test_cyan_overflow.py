#!/usr/bin/env python3
"""
Simplified test to identify cyan button overflow in option picker sections.
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


class CyanOverflowTest(QMainWindow):
    """Simple test to reproduce and analyze cyan button overflow."""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Cyan Button Overflow Test")
        self.setGeometry(100, 100, 1000, 700)

        self._setup_ui()

    def _setup_ui(self):
        """Setup simple test UI."""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        layout = QVBoxLayout(central_widget)

        # Title
        title = QLabel("Cyan Button Overflow Analysis")
        title.setFont(QFont("Arial", 16, QFont.Weight.Bold))
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(title)

        # Controls
        controls = QHBoxLayout()

        controls.addWidget(QLabel("Container Width:"))
        self.width_spin = QSpinBox()
        self.width_spin.setRange(200, 1200)
        self.width_spin.setValue(600)
        self.width_spin.valueChanged.connect(self.update_layout)
        controls.addWidget(self.width_spin)

        analyze_btn = QPushButton("🔍 Analyze Overflow")
        analyze_btn.clicked.connect(self.analyze_overflow)
        controls.addWidget(analyze_btn)

        controls.addStretch()
        layout.addLayout(controls)

        # Create test sections
        self.create_test_sections()
        layout.addWidget(self.test_container)

    def create_test_sections(self):
        """Create test sections that mimic the real option picker."""
        self.test_container = QFrame()
        self.test_container.setStyleSheet(
            """
            QFrame {
                background: rgba(230, 230, 230, 150);
                border: 3px solid red;
                margin: 10px;
            }
        """
        )

        container_layout = QVBoxLayout(self.test_container)

        # Create individual sections (Types 1, 2, 3 - full width)
        for i in range(1, 4):
            section = self.create_section(f"Type{i}", is_full_width=True)
            container_layout.addWidget(section)

        # Create bottom row (Types 4, 5, 6 - shared width)
        bottom_row = QWidget()
        bottom_row.setStyleSheet(
            """
            QWidget {
                background: rgba(200, 200, 255, 100);
                border: 2px solid blue;
            }
        """
        )
        bottom_layout = QHBoxLayout(bottom_row)

        for i in range(4, 7):
            section = self.create_section(f"Type{i}", is_full_width=False)
            bottom_layout.addWidget(section)

        container_layout.addWidget(bottom_row)

        # Store references for analysis
        self.bottom_row = bottom_row
        self.sections = self.test_container.findChildren(
            QFrame, options=Qt.FindChildOption.FindDirectChildrenOnly
        )

    def create_section(self, section_name, is_full_width=True):
        """Create a test section with cyan header button."""
        section = QFrame()
        section.setObjectName(f"section_{section_name}")
        section.setStyleSheet(
            """
            QFrame {
                background: rgba(245, 230, 255, 150);
                border: 2px solid purple;
                margin: 2px;
            }
        """
        )

        section_layout = QVBoxLayout(section)

        # Create cyan header button that might overflow
        header_button = QPushButton(f"{section_name} - Dual Shift")
        header_button.setObjectName(f"header_{section_name}")
        header_button.setStyleSheet(
            """
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(0, 255, 255, 0.8),
                    stop:1 rgba(0, 200, 200, 0.9));
                border: 2px solid rgba(0, 180, 180, 1);
                border-radius: 15px;
                padding: 8px 16px;
                font-weight: bold;
                font-size: 12px;
                color: #003333;
            }
            QPushButton:hover {
                background: rgba(0, 255, 255, 0.9);
            }
        """
        )

        # Make button potentially oversized to trigger overflow
        if not is_full_width:
            header_button.setMinimumWidth(200)  # Force potential overflow

        # Center the button in header container
        header_container = QWidget()
        header_container.setStyleSheet("background: transparent;")
        header_layout = QHBoxLayout(header_container)
        header_layout.addStretch()
        header_layout.addWidget(header_button)
        header_layout.addStretch()

        section_layout.addWidget(header_container)

        # Add some content area
        content = QLabel(f"Content area for {section_name}")
        content.setAlignment(Qt.AlignmentFlag.AlignCenter)
        content.setStyleSheet(
            "background: rgba(255, 255, 230, 150); border: 2px solid yellow; padding: 10px;"
        )
        section_layout.addWidget(content)

        return section

    def update_layout(self):
        """Update layout based on width setting."""
        new_width = self.width_spin.value()
        self.test_container.setFixedWidth(new_width)

        # Force layout update
        QApplication.processEvents()

        print(f"\\n=== Layout Updated: Container width = {new_width}px ===")

    def analyze_overflow(self):
        """Analyze for overflow in detail."""
        print(f"\\n{'='*80}")
        print(f"CYAN BUTTON OVERFLOW ANALYSIS")
        print(f"{'='*80}")

        container_width = self.test_container.width()
        print(f"Main container width: {container_width}px")

        # Analyze each section
        sections = self.test_container.findChildren(QFrame)

        for section in sections:
            if not section.objectName().startswith("section_"):
                continue

            section_name = section.objectName()
            section_rect = section.geometry()

            print(f"\\n📦 {section_name.upper()}:")
            print(f"   Position: ({section_rect.x()}, {section_rect.y()})")
            print(f"   Size: {section_rect.width()}x{section_rect.height()}")

            # Find the header button
            header_buttons = section.findChildren(QPushButton)
            for button in header_buttons:
                if button.objectName().startswith("header_"):
                    button_rect = button.geometry()

                    # Get absolute position relative to container
                    abs_button_pos = section.mapToParent(button_rect.topLeft())
                    button_right = abs_button_pos.x() + button_rect.width()

                    print(f"   🔘 Cyan Button:")
                    print(f"      Size: {button_rect.width()}x{button_rect.height()}")
                    print(
                        f"      Local position: ({button_rect.x()}, {button_rect.y()})"
                    )
                    print(
                        f"      Absolute position: ({abs_button_pos.x()}, {abs_button_pos.y()})"
                    )
                    print(f"      Right edge: {button_right}px")

                    # Check overflow
                    section_right = section_rect.x() + section_rect.width()
                    container_right = container_width

                    print(f"      Section right edge: {section_right}px")
                    print(f"      Container right edge: {container_right}px")

                    # Check for overflow
                    overflow_section = max(0, button_right - section_right)
                    overflow_container = max(0, button_right - container_right)

                    if overflow_section > 0:
                        print(
                            f"      ⚠️  SECTION OVERFLOW: {overflow_section}px beyond section border"
                        )
                    if overflow_container > 0:
                        print(
                            f"      ⚠️  CONTAINER OVERFLOW: {overflow_container}px beyond main container"
                        )

                    if overflow_section == 0 and overflow_container == 0:
                        print(f"      ✅ No overflow detected")

        # Check bottom row specifically
        if hasattr(self, "bottom_row"):
            print(f"\\n🔄 BOTTOM ROW ANALYSIS:")
            bottom_rect = self.bottom_row.geometry()
            print(f"   Bottom row size: {bottom_rect.width()}x{bottom_rect.height()}")

            # Calculate expected width per section in bottom row
            expected_section_width = bottom_rect.width() // 3
            print(f"   Expected width per section: {expected_section_width}px")

        print(f"\\n{'='*80}")
        print(f"END OVERFLOW ANALYSIS")
        print(f"{'='*80}\\n")


def main():
    app = QApplication(sys.argv)

    window = CyanOverflowTest()
    window.show()

    # Trigger initial analysis
    print("Cyan Button Overflow Test Started")
    print(
        "Adjust the container width and click 'Analyze Overflow' to see detailed measurements"
    )

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
