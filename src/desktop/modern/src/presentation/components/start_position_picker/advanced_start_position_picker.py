"""
Advanced Start Position Picker with 16 positions in a 4x4 grid layout.

This component displays the standard 16 start positions (like legacy) with
modern glassmorphism design and grid mode toggle functionality.
"""

import logging
from typing import Any, Dict, List, Optional

from application.services.data.dataset_query import DatasetQuery
from application.services.pictograph_pool_manager import PictographPoolManager
from presentation.components.start_position_picker.start_position_option import (
    StartPositionOption,
)
from PyQt6.QtCore import QEasingCurve, QPropertyAnimation, QSize, Qt, QTimer, pyqtSignal
from PyQt6.QtGui import QColor, QFont, QIcon, QLinearGradient, QPainter, QPainterPath
from PyQt6.QtWidgets import (
    QComboBox,
    QFrame,
    QGraphicsDropShadowEffect,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QScrollArea,
    QSizePolicy,
    QVBoxLayout,
    QWidget,
)

logger = logging.getLogger(__name__)


class AdvancedStartPositionPicker(QWidget):
    """
    Advanced start position picker with 16 positions in a 4x4 grid.

    Features:
    - Displays 16 standard start positions (matching legacy)
    - Grid mode toggle (Diamond/Box)
    - Modern glassmorphism design with fixed 4x4 layout
    - Back button to return to basic picker
    - Legacy-compatible sizing and spacing
    """

    position_selected = pyqtSignal(str)
    back_requested = pyqtSignal()

    def __init__(self, pool_manager: PictographPoolManager, grid_mode: str = "diamond"):
        super().__init__()
        self.pool_manager = pool_manager
        self.current_grid_mode = grid_mode
        self.dataset_service = DatasetQuery()

        # UI state
        self.position_options: List[StartPositionOption] = []
        self.all_positions: List[Dict[str, Any]] = []
        self.filtered_positions: List[Dict[str, Any]] = []

        # Animation properties
        self.fade_animation: Optional[QPropertyAnimation] = None
        self.search_timer: Optional[QTimer] = None

        self._setup_ui()
        self._setup_animations()
        self._load_all_positions()

        logger.info(
            f"Advanced picker initialized with {len(self.position_options)} options in {grid_mode} mode"
        )

    def force_visibility_update(self):
        """Force all position options to be visible - call this after adding to parent."""
        # Ensure this widget is visible
        self.show()
        self.setVisible(True)

        # Ensure container is visible
        if hasattr(self, "positions_container"):
            self.positions_container.show()
            self.positions_container.setVisible(True)

        # Ensure all position options are visible
        for option in self.position_options:
            option.show()
            option.setVisible(True)
            option.update()
            option.repaint()

        # Force layout updates
        if hasattr(self, "positions_layout"):
            self.positions_layout.update()
        if hasattr(self, "positions_container"):
            self.positions_container.update()
            self.positions_container.repaint()

        self.update()
        self.repaint()

        logger.info(
            f"Advanced picker visibility forced for {len(self.position_options)} options"
        )

    def _setup_ui(self):
        """Set up the advanced picker UI with modern styling."""
        self.setStyleSheet(self._get_advanced_picker_styles())
        self.setObjectName("AdvancedPickerContainer")

        # Main layout
        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(16)

        # Header section with back button
        header_widget = self._create_header_section()
        layout.addWidget(header_widget)

        # Grid mode toggle section
        controls_widget = self._create_grid_mode_toggle()
        layout.addWidget(controls_widget)

        # Positions grid (4x4 fixed layout)
        positions_widget = self._create_positions_grid()
        layout.addWidget(positions_widget, 1)  # Give it stretch factor

        # Add drop shadow effect
        self._add_drop_shadow()

    def _get_advanced_picker_styles(self) -> str:
        """Return comprehensive stylesheet for advanced picker."""
        return """
            QWidget#AdvancedPickerContainer {
                background: qlineargradient(
                    x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(255, 255, 255, 0.22),
                    stop:0.5 rgba(255, 255, 255, 0.18),
                    stop:1 rgba(255, 255, 255, 0.15)
                );
                border-radius: 24px;
                border: 2px solid rgba(255, 255, 255, 0.25);
            }
            
            QLabel#AdvancedTitle {
                color: #1a202c;
                background: transparent;
                font-weight: 700;
                padding: 4px 0;
            }
            
            QLabel#AdvancedSubtitle {
                color: #4a5568;
                background: transparent;
                font-weight: 400;
                padding: 2px 0;
            }
            
            QLineEdit#SearchField {
                background: rgba(255, 255, 255, 0.3);
                border: 2px solid rgba(255, 255, 255, 0.4);
                border-radius: 12px;
                padding: 8px 16px;
                font-size: 14px;
                color: #2d3748;
            }
            
            QLineEdit#SearchField:focus {
                background: rgba(255, 255, 255, 0.4);
                border: 2px solid rgba(99, 102, 241, 0.6);
            }
            
            QComboBox#FilterCombo {
                background: rgba(255, 255, 255, 0.3);
                border: 2px solid rgba(255, 255, 255, 0.4);
                border-radius: 12px;
                padding: 8px 16px;
                font-size: 14px;
                color: #2d3748;
                min-width: 120px;
            }
            
            QComboBox#FilterCombo:hover {
                background: rgba(255, 255, 255, 0.4);
                border: 2px solid rgba(255, 255, 255, 0.5);
            }
            
            QComboBox#FilterCombo::drop-down {
                border: none;
                width: 30px;
            }
            
            QComboBox#FilterCombo::down-arrow {
                image: none;
                border: none;
            }
            
            QPushButton#BackButton {
                background: rgba(107, 114, 128, 0.15);
                border: 2px solid rgba(107, 114, 128, 0.3);
                border-radius: 12px;
                color: #374151;
                font-weight: 600;
                padding: 10px 20px;
                min-width: 100px;
            }
            
            QPushButton#BackButton:hover {
                background: rgba(107, 114, 128, 0.25);
                border: 2px solid rgba(107, 114, 128, 0.4);
                color: #1f2937;
            }
            
            QPushButton#BackButton:pressed {
                background: rgba(107, 114, 128, 0.35);
            }

            QPushButton#GridModeToggle {
                background: rgba(99, 102, 241, 0.15);
                border: 2px solid rgba(99, 102, 241, 0.3);
                border-radius: 12px;
                color: #4338ca;
                font-weight: 600;
                padding: 10px 20px;
                min-width: 120px;
            }

            QPushButton#GridModeToggle:hover {
                background: rgba(99, 102, 241, 0.25);
                border: 2px solid rgba(99, 102, 241, 0.4);
                color: #3730a3;
            }

            QPushButton#GridModeToggle:pressed {
                background: rgba(99, 102, 241, 0.35);
            }
            
            QScrollArea {
                background: transparent;
                border: none;
                border-radius: 16px;
            }
            
            QScrollBar:vertical {
                background: rgba(255, 255, 255, 0.1);
                width: 10px;
                border-radius: 5px;
                margin: 2px;
            }
            
            QScrollBar::handle:vertical {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 5px;
                min-height: 30px;
            }
            
            QScrollBar::handle:vertical:hover {
                background: rgba(255, 255, 255, 0.5);
            }
        """

    def _create_header_section(self) -> QWidget:
        """Create header section with back button and title."""
        widget = QWidget()
        layout = QHBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 8)
        layout.setSpacing(12)

        # Back button (top left)
        self.back_button = QPushButton("← Back")
        self.back_button.setObjectName("BackButton")
        self.back_button.setFont(QFont("Segoe UI", 12, QFont.Weight.Medium))
        self.back_button.clicked.connect(self.back_requested.emit)
        self.back_button.setCursor(Qt.CursorShape.PointingHandCursor)
        layout.addWidget(self.back_button)

        # Title (centered)
        title_container = QWidget()
        title_layout = QVBoxLayout(title_container)
        title_layout.setContentsMargins(0, 0, 0, 0)
        title_layout.setSpacing(2)

        layout.addWidget(title_container, 1)  # Center with stretch
        layout.addStretch()  # Balance the back button

        return widget

    def _create_grid_mode_toggle(self) -> QWidget:
        """Create simple grid mode toggle button (Diamond/Box)."""
        widget = QWidget()
        layout = QHBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # Grid mode toggle button
        self.grid_mode_button = QPushButton()
        self.grid_mode_button.setObjectName("GridModeToggle")
        self.grid_mode_button.setFont(QFont("Segoe UI", 12, QFont.Weight.Medium))
        self.grid_mode_button.clicked.connect(self._toggle_grid_mode)
        self.grid_mode_button.setCursor(Qt.CursorShape.PointingHandCursor)
        self._update_grid_mode_button_text()

        layout.addStretch()
        layout.addWidget(self.grid_mode_button)
        layout.addStretch()

        return widget

    def _create_positions_grid(self) -> QWidget:
        """Create fixed 4x4 grid for 16 positions (legacy-style)."""
        # Positions container
        self.positions_container = QWidget()
        self.positions_layout = QGridLayout(self.positions_container)

        # Legacy-style spacing (match advanced picker sizing)
        self.positions_layout.setSpacing(0)  # Legacy SPACING = 10
        self.positions_layout.setContentsMargins(0, 0, 0, 0)

        # Set size policy to expand
        self.positions_container.setSizePolicy(
            QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding
        )

        return self.positions_container

    def _update_grid_mode_button_text(self):
        """Update the grid mode button text based on current mode."""
        if self.current_grid_mode == "diamond":
            self.grid_mode_button.setText("Diamond Grid")
        else:
            self.grid_mode_button.setText("Box Grid")

    def _toggle_grid_mode(self):
        """Toggle between diamond and box grid modes."""
        if self.current_grid_mode == "diamond":
            self.current_grid_mode = "box"
        else:
            self.current_grid_mode = "diamond"

        self._update_grid_mode_button_text()
        self._load_all_positions()

    def _add_drop_shadow(self):
        """Add subtle drop shadow effect for depth."""
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(35)
        shadow.setColor(QColor(0, 0, 0, 60))
        shadow.setOffset(0, 10)
        self.setGraphicsEffect(shadow)

    def _setup_animations(self):
        """Set up smooth animations for interactions."""
        self.fade_animation = QPropertyAnimation(self, b"windowOpacity")
        self.fade_animation.setDuration(300)
        self.fade_animation.setEasingCurve(QEasingCurve.Type.OutCubic)

    def _load_all_positions(self):
        """Load all available start positions from the dataset."""
        try:
            # Get all available positions from dataset
            self.all_positions = []

            # Define 16 standard positions for each grid mode (legacy-compatible)
            diamond_positions = [
                "alpha1_alpha1",
                "alpha3_alpha3",
                "alpha5_alpha5",
                "alpha7_alpha7",
                "beta1_beta1",
                "beta3_beta3",
                "beta5_beta5",
                "beta7_beta7",
                "gamma1_gamma1",
                "gamma3_gamma3",
                "gamma5_gamma5",
                "gamma7_gamma7",
                "gamma9_gamma9",
                "gamma11_gamma11",
                "gamma13_gamma13",
                "gamma15_gamma15",
            ]

            box_positions = [
                "alpha2_alpha2",
                "alpha4_alpha4",
                "alpha6_alpha6",
                "alpha8_alpha8",
                "beta2_beta2",
                "beta4_beta4",
                "beta6_beta6",
                "beta8_beta8",
                "gamma2_gamma2",
                "gamma4_gamma4",
                "gamma6_gamma6",
                "gamma8_gamma8",
                "gamma10_gamma10",
                "gamma12_gamma12",
                "gamma14_gamma14",
                "gamma16_gamma16",
            ]

            # Create position data for current grid mode only
            positions = (
                diamond_positions
                if self.current_grid_mode == "diamond"
                else box_positions
            )

            for position_key in positions:
                start_pos, end_pos = position_key.split("_")
                letter = self._extract_letter_from_position(start_pos)

                position_data = {
                    "position_key": position_key,
                    "start_pos": start_pos,
                    "end_pos": end_pos,
                    "letter": letter,
                    "grid_mode": self.current_grid_mode,
                    "display_name": f"{letter.upper()} - {position_key.replace('_', ' → ')}",
                }
                self.all_positions.append(position_data)

            # Initialize filtered positions
            self.filtered_positions = self.all_positions.copy()
            self._update_positions_display()

            logger.info(f"Loaded {len(self.all_positions)} start positions")

        except Exception as e:
            logger.error(f"Error loading start positions: {e}")
            self.all_positions = []
            self.filtered_positions = []

    def _extract_letter_from_position(self, position: str) -> str:
        """Extract letter from position string."""
        if position.startswith("alpha"):
            return "α"
        elif position.startswith("beta"):
            return "β"
        elif position.startswith("gamma"):
            return "Γ"
        return "?"

    def _update_positions_display(self):
        """Update the positions grid display."""
        # Clear existing options
        for option in self.position_options:
            option.setParent(None)
        self.position_options.clear()

        # Clear layout
        for i in reversed(range(self.positions_layout.count())):
            item = self.positions_layout.itemAt(i)
            if item:
                widget = item.widget()
                if widget:
                    widget.setParent(None)

        # Create new options for filtered positions (limit to 16 for 4x4 grid)
        positions_to_show = self.filtered_positions[:16]  # Ensure exactly 16 positions

        for i, position_data in enumerate(positions_to_show):
            try:
                option = StartPositionOption(
                    position_data["position_key"],
                    self.pool_manager,
                    position_data["grid_mode"],
                )
                option.position_selected.connect(self._handle_position_selection)

                # CRITICAL FIX: Add to layout FIRST, then apply sizing and visibility
                row = i // 4
                col = i % 4
                self.positions_layout.addWidget(option, row, col)
                self.position_options.append(option)

                # Apply legacy-style sizing AFTER adding to layout
                self._apply_legacy_sizing(option)

                # Ensure option is visible and properly sized
                option.show()
                option.setVisible(True)  # Explicitly set visible
                option.update()

                # Force immediate visibility update
                option.repaint()

            except Exception as e:
                logger.warning(
                    f"Failed to create option for position {position_data['position_key']}: {e}"
                )

        # Update container and force layout
        self.positions_container.show()
        self.positions_container.setVisible(True)
        self.positions_container.update()
        self.positions_layout.update()

        # Force immediate layout and visibility updates
        self.positions_container.repaint()
        self.update()
        self.repaint()

        logger.info(
            f"Advanced picker loaded {len(self.position_options)} positions in 4x4 grid"
        )

    def _apply_legacy_sizing(self, option: StartPositionOption):
        """Apply legacy-style sizing to position option (main_window_width // 12)."""
        try:
            # Get main window width using the same approach as legacy
            main_window_width = self._get_main_window_width()

            # Legacy formula: main_window_width // 12 for advanced picker
            size = main_window_width // 12

            # Ensure reasonable size range for visibility and usability
            size = max(size, 70)  # Minimum 70px (same as legacy)

            # Apply the size
            option.setFixedSize(size, size)

            # Update pictograph size to match container
            if hasattr(option, "_update_pictograph_size"):
                option._update_pictograph_size()

            # Ensure the option is visible
            option.show()
            option.setVisible(True)

        except Exception as e:
            logger.warning(f"Failed to apply legacy sizing: {e}")
            # Fallback to reasonable default size
            option.setFixedSize(100, 100)
            option.show()

    def _get_main_window_width(self) -> int:
        """Get main window width using the same approach as legacy size_provider."""
        try:
            # Try to find main window by traversing up the parent hierarchy
            widget = self
            while widget and widget.parent():
                widget = widget.parent()
                if hasattr(widget, "__class__"):
                    class_name = widget.__class__.__name__
                    if "MainWindow" in class_name or hasattr(widget, "menuBar"):
                        return widget.width()

            # Fallback: try QApplication active window
            from PyQt6.QtWidgets import QApplication

            app = QApplication.instance()
            if app and app.activeWindow():
                return app.activeWindow().width()

            # Final fallback
            return 1200

        except Exception as e:
            logger.warning(f"Failed to get main window width: {e}")
            return 1200

    def _handle_position_selection(self, position_key: str):
        """Handle position selection from advanced picker."""
        logger.info(f"Advanced picker position selected: {position_key}")
        self.position_selected.emit(position_key)

    def set_grid_mode(self, grid_mode: str):
        """Set the grid mode and update display."""
        self.current_grid_mode = grid_mode

        # Update button text
        self._update_grid_mode_button_text()

        # Reload positions for the new grid mode
        self._load_all_positions()

    def showEvent(self, event):
        """Handle show event with entrance animation."""
        super().showEvent(event)

        # Ensure proper sizing when shown
        self._ensure_proper_sizing()

        logger.info(f"Advanced picker shown with {len(self.position_options)} options")

        # Animate entrance if animation is set up
        if self.fade_animation:
            self.setWindowOpacity(0.0)
            self.fade_animation.setStartValue(0.0)
            self.fade_animation.setEndValue(1.0)
            self.fade_animation.start()

    def _ensure_proper_sizing(self):
        """Ensure all components are properly sized when the widget is shown."""
        # Force layout update
        self.updateGeometry()
        self.positions_container.updateGeometry()

        # Apply sizing to all position options
        for option in self.position_options:
            self._apply_legacy_sizing(option)

        # Force container visibility
        self.positions_container.show()
        self.positions_container.setVisible(True)

        logger.info(
            f"Advanced picker sizing ensured - container size: {self.positions_container.size()}"
        )

    def resizeEvent(self, event):
        """Handle resize events to update position option sizes."""
        super().resizeEvent(event)

        # Update sizing for all position options
        for option in self.position_options:
            self._apply_legacy_sizing(option)

    def sizeHint(self) -> QSize:
        """Provide size hint for the advanced picker."""
        return QSize(800, 600)  # Larger size for more content
