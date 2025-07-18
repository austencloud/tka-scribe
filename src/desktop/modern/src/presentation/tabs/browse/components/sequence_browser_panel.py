"""
Sequence Browser Panel - Thumbnail Grid and Preview

Displays filtered sequences in a responsive thumbnail grid.
Handles the complex thumbnail management identified in the Legacy audit.
"""

from typing import List, Optional

from domain.models.sequence_data import SequenceData
from presentation.tabs.browse.services.browse_service import BrowseService
from presentation.tabs.browse.services.browse_state_service import BrowseStateService
from PyQt6.QtCore import QSize, Qt, pyqtSignal
from PyQt6.QtGui import QFont, QPixmap
from PyQt6.QtWidgets import (
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QScrollArea,
    QVBoxLayout,
    QWidget,
)


class SequenceBrowserPanel(QWidget):
    """
    Sequence browser with thumbnail grid.

    Handles the complex thumbnail management and responsive layout
    identified as real complexity in the Legacy audit.
    """

    # Signals
    sequence_selected = pyqtSignal(str)  # sequence_id
    open_in_construct = pyqtSignal(str)  # sequence_id
    back_to_filters = pyqtSignal()

    def __init__(
        self,
        browse_service: BrowseService,
        state_service: BrowseStateService,
        parent: Optional[QWidget] = None,
    ):
        """Initialize the sequence browser panel."""
        super().__init__(parent)

        self.browse_service = browse_service
        self.state_service = state_service
        self.current_sequences: List[SequenceData] = []

        self._setup_ui()
        self._connect_signals()

    def _setup_ui(self) -> None:
        """Setup the browser UI."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(15)

        # Header with back button and title
        header = self._create_header()
        layout.addWidget(header)

        # Main content area
        content_panel = QFrame()
        content_panel.setStyleSheet(
            """
            QFrame {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
            }
        """
        )
        content_layout = QVBoxLayout(content_panel)
        content_layout.setContentsMargins(20, 20, 20, 20)
        content_layout.setSpacing(15)

        # Results info
        self.results_label = QLabel("No sequences loaded")
        self.results_label.setFont(QFont("Segoe UI", 12))
        self.results_label.setStyleSheet("color: rgba(255, 255, 255, 0.8);")
        content_layout.addWidget(self.results_label)

        # Thumbnail grid scroll area
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setStyleSheet(
            """
            QScrollArea {
                background: transparent;
                border: none;
            }
            QScrollBar:vertical {
                background: rgba(255, 255, 255, 0.1);
                width: 12px;
                border-radius: 6px;
            }
            QScrollBar::handle:vertical {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 6px;
            }
        """
        )

        # Grid widget
        self.grid_widget = QWidget()
        self.grid_layout = QGridLayout(self.grid_widget)
        self.grid_layout.setSpacing(15)
        self.scroll_area.setWidget(self.grid_widget)

        content_layout.addWidget(self.scroll_area)
        layout.addWidget(content_panel)

    def _create_header(self) -> QWidget:
        """Create the header with back button and title."""
        header = QFrame()
        layout = QHBoxLayout(header)
        layout.setContentsMargins(0, 0, 0, 0)

        # Back button
        self.back_button = QPushButton("← Back to Filters")
        self.back_button.setFont(QFont("Segoe UI", 12))
        self.back_button.setStyleSheet(
            """
            QPushButton {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                color: white;
                padding: 8px 16px;
            }
            QPushButton:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        """
        )
        layout.addWidget(self.back_button)

        layout.addStretch()

        # Title
        self.title_label = QLabel("Sequence Browser")
        self.title_label.setFont(QFont("Segoe UI", 18, QFont.Weight.Bold))
        self.title_label.setStyleSheet("color: white;")
        layout.addWidget(self.title_label)

        layout.addStretch()

        return header

    def _connect_signals(self) -> None:
        """Connect component signals."""
        self.back_button.clicked.connect(self.back_to_filters.emit)

    def show_sequences(self, sequences: List[SequenceData]) -> None:
        """Display sequences in the thumbnail grid."""
        self.current_sequences = sequences

        # Update results label
        count = len(sequences)
        if count == 0:
            self.results_label.setText(
                "No sequences found matching the filter criteria"
            )
        elif count == 1:
            self.results_label.setText("1 sequence found")
        else:
            self.results_label.setText(f"{count} sequences found")

        # Clear existing grid
        self._clear_grid()

        # Add sequence thumbnails
        for i, sequence in enumerate(sequences):
            thumbnail = self._create_sequence_thumbnail(sequence)
            row = i // 4  # 4 columns
            col = i % 4
            self.grid_layout.addWidget(thumbnail, row, col)

        # Add stretch to bottom
        self.grid_layout.setRowStretch(self.grid_layout.rowCount(), 1)

    def _clear_grid(self) -> None:
        """Clear all items from the grid layout."""
        while self.grid_layout.count():
            child = self.grid_layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()

    def _create_sequence_thumbnail(self, sequence: SequenceData) -> QWidget:
        """Create a thumbnail widget for a sequence."""
        thumbnail = QFrame()
        thumbnail.setFixedSize(150, 120)
        thumbnail.setStyleSheet(
            """
            QFrame {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
            }
            QFrame:hover {
                border: 2px solid rgba(255, 255, 255, 0.4);
            }
        """
        )
        layout = QVBoxLayout(thumbnail)
        layout.setContentsMargins(10, 10, 10, 10)
        layout.setSpacing(5)

        # Sequence word
        word_label = QLabel(sequence.word or "Unknown")
        word_label.setFont(QFont("Segoe UI", 12, QFont.Weight.Bold))
        word_label.setStyleSheet("color: white;")
        word_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(word_label)

        # Placeholder for actual thumbnail image
        image_placeholder = QLabel("🎭")
        image_placeholder.setFont(QFont("Segoe UI", 24))
        image_placeholder.setAlignment(Qt.AlignmentFlag.AlignCenter)
        image_placeholder.setStyleSheet("color: rgba(255, 255, 255, 0.7);")
        layout.addWidget(image_placeholder)

        # Sequence info
        info_text = f"Length: {sequence.sequence_length}"
        if sequence.difficulty_level:
            info_text += f"\\n{sequence.difficulty_level}"

        info_label = QLabel(info_text)
        info_label.setFont(QFont("Segoe UI", 9))
        info_label.setStyleSheet("color: rgba(255, 255, 255, 0.6);")
        info_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(info_label)

        # Make clickable
        thumbnail.mousePressEvent = (
            lambda event, seq_id=sequence.id: self._on_thumbnail_clicked(seq_id)
        )

        return thumbnail

    def _on_thumbnail_clicked(self, sequence_id: str) -> None:
        """Handle thumbnail click."""
        self.sequence_selected.emit(sequence_id)
        # For now, also emit open in construct
        self.open_in_construct.emit(sequence_id)
