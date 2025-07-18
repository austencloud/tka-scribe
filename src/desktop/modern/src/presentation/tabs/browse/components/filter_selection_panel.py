"""
Filter Selection Panel - Main Filter Interface

Simple filter selection panel that shows the 8 filter types in a clean grid.
Focuses on usability and glassmorphism styling without over-engineering.
"""

from typing import Optional

from presentation.tabs.browse.models import FilterType
from presentation.tabs.browse.services.browse_service import BrowseService
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont, QIcon
from PyQt6.QtWidgets import (
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QVBoxLayout,
    QWidget,
)


class FilterSelectionPanel(QWidget):
    """
    Main filter selection interface.

    Shows the 8 filter types in a clean, accessible grid layout.
    Each filter button leads to its specific filter configuration.
    """

    # Signals
    filter_selected = pyqtSignal(FilterType, object)  # filter_type, filter_value

    def __init__(self, browse_service: BrowseService, parent: Optional[QWidget] = None):
        """Initialize the filter selection panel."""
        super().__init__(parent)

        self.browse_service = browse_service

        self._setup_ui()
        self._connect_signals()

    def _setup_ui(self) -> None:
        """Setup the filter selection UI."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(20)

        # Title
        title = QLabel("Filter Sequences")
        title.setFont(QFont("Segoe UI", 20, QFont.Weight.Bold))
        title.setStyleSheet("color: white; margin-bottom: 10px;")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(title)

        # Main panel with glassmorphism styling
        main_panel = QFrame()
        main_panel.setStyleSheet(
            """
            QFrame {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
            }
        """
        )
        panel_layout = QVBoxLayout(main_panel)
        panel_layout.setContentsMargins(30, 30, 30, 30)
        panel_layout.setSpacing(20)

        # Filter grid
        self._create_filter_grid(panel_layout)

        layout.addWidget(main_panel)
        layout.addStretch()

    def _create_filter_grid(self, parent_layout: QVBoxLayout) -> None:
        """Create the filter selection grid."""
        grid_layout = QGridLayout()
        grid_layout.setSpacing(15)

        # Filter button configurations
        filters = [
            (
                FilterType.ALL_SEQUENCES,
                "All Sequences",
                "🎯",
                "Browse all available sequences",
            ),
            (
                FilterType.STARTING_LETTER,
                "Starting Letter",
                "🔤",
                "Filter by first letter (A-Z)",
            ),
            (
                FilterType.CONTAINS_LETTERS,
                "Contains Letters",
                "🔍",
                "Search for specific letters",
            ),
            (
                FilterType.SEQUENCE_LENGTH,
                "Sequence Length",
                "📏",
                "Filter by number of beats",
            ),
            (
                FilterType.DIFFICULTY_LEVEL,
                "Difficulty Level",
                "⭐",
                "Filter by skill level",
            ),
            (
                FilterType.STARTING_POSITION,
                "Starting Position",
                "📍",
                "Filter by starting position",
            ),
            (FilterType.AUTHOR, "Author", "👤", "Filter by sequence creator"),
            (FilterType.GRID_MODE, "Grid Mode", "🔲", "Filter by diamond/box mode"),
        ]

        # Create filter buttons
        self.filter_buttons = {}
        for i, (filter_type, title, icon, description) in enumerate(filters):
            button = self._create_filter_button(filter_type, title, icon, description)
            self.filter_buttons[filter_type] = button

            row = i // 2
            col = i % 2
            grid_layout.addWidget(button, row, col)

        parent_layout.addLayout(grid_layout)

    def _create_filter_button(
        self, filter_type: FilterType, title: str, icon: str, description: str
    ) -> QPushButton:
        """Create a filter selection button."""
        button = QPushButton()
        button.setFixedSize(250, 100)

        # Button text with icon and description
        button_text = f"{icon}\\n{title}\\n{description}"
        button.setText(button_text)
        button.setFont(QFont("Segoe UI", 10))

        # Glassmorphism button styling
        button.setStyleSheet(
            """
            QPushButton {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                color: white;
                padding: 10px;
                text-align: center;
            }
            QPushButton:hover {
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
            QPushButton:pressed {
                background: rgba(255, 255, 255, 0.15);
            }
        """
        )

        # Connect button click
        button.clicked.connect(lambda: self._on_filter_button_clicked(filter_type))

        return button

    def _connect_signals(self) -> None:
        """Connect component signals."""
        pass  # Individual buttons connected in _create_filter_button

    def _on_filter_button_clicked(self, filter_type: FilterType) -> None:
        """Handle filter button click."""
        print(f"🔍 [BROWSE] Filter button clicked: {filter_type.value}")
        
        if filter_type == FilterType.ALL_SEQUENCES:
            # All sequences - no additional configuration needed
            print("🔍 [BROWSE] Emitting all sequences filter")
            self.filter_selected.emit(filter_type, None)
        else:
            # For now, emit with None - specific filter UIs will be implemented next
            print(f"🔍 [BROWSE] Filter selected: {filter_type.value}")
            self.filter_selected.emit(filter_type, None)
