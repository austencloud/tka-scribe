"""
Enhanced Start Position Picker with modern glassmorphism design and variations support.

This component provides an improved user interface for selecting start positions
with contemporary design trends including glassmorphism, smooth animations,
and an advanced variations picker.
"""

import logging
from typing import Optional

from application.services.pictograph_pool_manager import PictographPoolManager
from presentation.components.start_position_picker.advanced_start_position_picker import (
    AdvancedStartPositionPicker,
)
from presentation.components.start_position_picker.start_position_option import (
    StartPositionOption,
)
from presentation.components.start_position_picker.variations_button import (
    VariationsButton,
)
from presentation.utils.dynamic_text_color import get_glassmorphism_text_color
from PyQt6.QtCore import QEasingCurve, QPropertyAnimation, QRect, QSize, Qt, pyqtSignal
from PyQt6.QtGui import QColor, QFont, QLinearGradient, QPainter, QPainterPath
from PyQt6.QtWidgets import (
    QGraphicsDropShadowEffect,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QScrollArea,
    QStackedWidget,
    QVBoxLayout,
    QWidget,
)

logger = logging.getLogger(__name__)


class EnhancedStartPositionPicker(QWidget):
    """
    Enhanced start position picker with glassmorphism design and variations support.

    Features:
    - Modern glassmorphism styling with transparency and blur effects
    - Smooth animations and transitions
    - Variations button that opens advanced picker
    - Responsive layout that adapts to container size
    - Improved accessibility and user experience
    - Dynamic text color for optimal readability
    """

    start_position_selected = pyqtSignal(str)
    variations_requested = pyqtSignal()

    # Start position configurations
    DIAMOND_START_POSITIONS = ["alpha1_alpha1", "beta5_beta5", "gamma11_gamma11"]
    BOX_START_POSITIONS = ["alpha2_alpha2", "beta4_beta4", "gamma12_gamma12"]

    def __init__(self, pool_manager: PictographPoolManager):
        super().__init__()
        self.pool_manager = pool_manager
        self.current_grid_mode = "diamond"
        self.position_options: list[StartPositionOption] = []
        self.advanced_picker: Optional[AdvancedStartPositionPicker] = None

        # Animation properties
        self.fade_animation: Optional[QPropertyAnimation] = None

        self._setup_ui()
        self._setup_animations()
        self._load_start_positions()

    def _setup_ui(self):
        """Set up the enhanced UI with glassmorphism styling."""
        self.setStyleSheet(self._get_glassmorphism_styles())
        self.setObjectName("EnhancedGlassContainer")

        # Main layout
        layout = QVBoxLayout(self)
        layout.setContentsMargins(24, 24, 24, 24)
        layout.setSpacing(20)

        # Title with enhanced typography
        self.header_card = self._create_unified_header_card()
        layout.addWidget(self.header_card)

        # Main content area with stacked widget for smooth transitions
        self.stacked_widget = QStackedWidget()

        # Basic picker widget
        self.basic_picker_widget = self._create_basic_picker_widget()
        self.stacked_widget.addWidget(self.basic_picker_widget)

        layout.addWidget(self.stacked_widget)

        # Variations button
        self.variations_button = VariationsButton(self)
        self.variations_button.clicked.connect(self._handle_variations_clicked)

        button_layout = QHBoxLayout()
        button_layout.addStretch()
        button_layout.addWidget(self.variations_button)
        button_layout.addStretch()

        layout.addLayout(button_layout)

        # Add subtle drop shadow effect
        self._add_drop_shadow()

    def _get_glassmorphism_styles(self) -> str:
        """Return comprehensive glassmorphism stylesheet."""
        return """
            QWidget#EnhancedGlassContainer {
                background: qlineargradient(
                    x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(255, 255, 255, 0.25),
                    stop:0.5 rgba(255, 255, 255, 0.18),
                    stop:1 rgba(255, 255, 255, 0.15)
                );
                border-radius: 28px;
                border: 2px solid rgba(255, 255, 255, 0.3);
            }
            
            QWidget#EnhancedHeaderCard {
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid black;
                border-radius: 12px;
                padding: 16px;
            }
            
            QLabel#EnhancedGlassTitle {
                background: transparent;
                font-weight: 700;
                text-align: center;
                padding: 4px 0;
            }
            
            QLabel#EnhancedGlassSubtitle {
                background: transparent;
                font-weight: 400;
                text-align: center;
                padding: 4px 0;
            }
            
            QScrollArea {
                background: transparent;
                border: none;
                border-radius: 16px;
            }
            
            QScrollArea > QWidget > QWidget {
                background: transparent;
            }
            
            QScrollBar:vertical {
                background: rgba(255, 255, 255, 0.1);
                width: 8px;
                border-radius: 4px;
            }
            
            QScrollBar::handle:vertical {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                min-height: 20px;
            }
            
            QScrollBar::handle:vertical:hover {
                background: rgba(255, 255, 255, 0.5);
            }
        """

    def _create_unified_header_card(self) -> QWidget:
        """Create a unified header card containing both title and subtitle."""
        card = QWidget()
        card.setObjectName("EnhancedHeaderCard")

        layout = QVBoxLayout(card)
        layout.setContentsMargins(16, 16, 16, 16)
        layout.setSpacing(8)

        # Title
        title = QLabel("Choose Your Start Position")
        title.setFont(QFont("Monotype Corsiva", 28, QFont.Weight.Bold))
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setObjectName("EnhancedGlassTitle")
        layout.addWidget(title)

        # Subtitle
        subtitle = QLabel("Select a starting position to begin crafting your sequence")
        subtitle.setFont(QFont("Monotype Corsiva", 16))
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        subtitle.setObjectName("EnhancedGlassSubtitle")
        layout.addWidget(subtitle)

        # Store references for later updates
        self.title_label = title
        self.subtitle_label = subtitle

        # Apply dynamic text color for optimal readability
        self._apply_dynamic_text_colors()

        return card

    def _apply_dynamic_text_colors(self):
        """Apply dynamic text colors to ensure optimal readability on glassmorphism background."""
        # Get the optimal text color for glassmorphism background
        title_color = get_glassmorphism_text_color(
            self.title_label,
            glassmorphism_base_color=(255, 255, 255),
            glassmorphism_opacity=0.2
        )
        subtitle_color = get_glassmorphism_text_color(
            self.subtitle_label,
            glassmorphism_base_color=(255, 255, 255),
            glassmorphism_opacity=0.15
        )

        # Apply the colors to the labels
        self.title_label.setStyleSheet(f"color: {title_color};")
        self.subtitle_label.setStyleSheet(f"color: {subtitle_color};")

        logger.debug(f"Applied dynamic text colors - Title: {title_color}, Subtitle: {subtitle_color}")

    def _create_basic_picker_widget(self) -> QWidget:
        """Create the basic picker widget with enhanced scroll area."""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(16)

        # Enhanced scroll area
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        scroll_area.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)

        # Positions container with improved spacing
        self.positions_container = QWidget()
        self.positions_layout = QGridLayout(self.positions_container)
        self.positions_layout.setSpacing(20)
        self.positions_layout.setContentsMargins(12, 12, 12, 12)

        scroll_area.setWidget(self.positions_container)
        layout.addWidget(scroll_area)

        return widget

    def _add_drop_shadow(self):
        """Add subtle drop shadow effect for depth."""
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(30)
        shadow.setColor(QColor(0, 0, 0, 50))
        shadow.setOffset(0, 8)
        self.setGraphicsEffect(shadow)

    def _setup_animations(self):
        """Set up smooth animations for transitions."""
        self.fade_animation = QPropertyAnimation(self, b"windowOpacity")
        self.fade_animation.setDuration(300)
        self.fade_animation.setEasingCurve(QEasingCurve.Type.OutCubic)

    def _load_start_positions(self):
        """Load start positions with enhanced options."""
        # Clear existing options
        for option in self.position_options:
            option.setParent(None)
        self.position_options.clear()

        # Get position keys based on current grid mode
        position_keys = (
            self.DIAMOND_START_POSITIONS
            if self.current_grid_mode == "diamond"
            else self.BOX_START_POSITIONS
        )

        # Create enhanced start position options
        for i, position_key in enumerate(position_keys):
            option = StartPositionOption(
                position_key, self.pool_manager, self.current_grid_mode
            )
            option.position_selected.connect(self._handle_position_selection)

            # Initially set a reasonable default size - we'll resize properly later
            option.setFixedSize(120, 120)

            # Arrange in responsive grid
            row = i // 3
            col = i % 3
            self.positions_layout.addWidget(option, row, col)
            self.position_options.append(option)

    def _handle_position_selection(self, position_key: str):
        """Handle position selection with enhanced feedback."""
        try:
            logger.info(f"Enhanced picker: Position selected - {position_key}")

            # For now, use the simple signal-based approach for reliability
            # The command pattern can be added back later once the flow is stable
            self.start_position_selected.emit(position_key)

            # Add selection feedback animation
            self._animate_selection_feedback()

        except Exception as e:
            logger.error(f"Error in start position selection: {e}")
            # Fallback to basic signal emission
            self.start_position_selected.emit(position_key)

    def _handle_variations_clicked(self):
        """Handle variations button click with smooth transition."""
        if not self.advanced_picker:
            self.advanced_picker = AdvancedStartPositionPicker(
                self.pool_manager, self.current_grid_mode
            )
            self.advanced_picker.position_selected.connect(
                self._handle_advanced_position_selection
            )
            self.advanced_picker.back_requested.connect(self._handle_back_to_basic)
            self.stacked_widget.addWidget(self.advanced_picker)

            # Ensure the advanced picker gets proper size from its parent
            self.advanced_picker.setSizePolicy(
                self.sizePolicy().horizontalPolicy(), self.sizePolicy().verticalPolicy()
            )

            # Force visibility update after adding to stacked widget
            self.advanced_picker.force_visibility_update()

        # Animate transition to advanced picker
        self._animate_to_advanced_picker()

    def _handle_advanced_position_selection(self, position_key: str):
        """Handle position selection from advanced picker."""
        self._handle_position_selection(position_key)

    def _handle_back_to_basic(self):
        """Handle back button from advanced picker."""
        self._animate_to_basic_picker()

    def _animate_to_advanced_picker(self):
        """Animate transition to advanced picker."""
        self.stacked_widget.setCurrentWidget(self.advanced_picker)
        self.variations_button.hide()

        # Force visibility update when switching to advanced picker
        self.advanced_picker.force_visibility_update()

    def _animate_to_basic_picker(self):
        """Animate transition back to basic picker."""
        self.stacked_widget.setCurrentWidget(self.basic_picker_widget)
        self.variations_button.show()

        # Restore original title and subtitle
        self.title_label.setText("Choose Your Start Position")
        self.subtitle_label.setText(
            "Select a starting position to begin crafting your sequence"
        )

    def _animate_selection_feedback(self):
        """Provide visual feedback for selection."""
        # Add subtle pulse animation or similar feedback
        if self.fade_animation:
            self.fade_animation.setStartValue(1.0)
            self.fade_animation.setEndValue(0.95)
            self.fade_animation.finished.connect(self._restore_opacity)
            self.fade_animation.start()

    def _restore_opacity(self):
        """Restore opacity after selection feedback."""
        if self.fade_animation:
            self.fade_animation.finished.disconnect()
            self.fade_animation.setStartValue(0.95)
            self.fade_animation.setEndValue(1.0)
            self.fade_animation.start()

    def update_layout_for_size(self, container_size: QSize):
        """Update layout responsively based on container size."""
        if not self.position_options:
            return

        container_width = container_size.width()
        position_width = 240  # Slightly larger for better visual impact
        total_positions = len(self.position_options)
        spacing = 20

        # Calculate optimal layout
        total_width_needed = (
            total_positions * position_width + (total_positions - 1) * spacing
        )

        # Clear current layout
        for i in reversed(range(self.positions_layout.count())):
            item = self.positions_layout.itemAt(i)
            if item:
                widget = item.widget()
                if widget:
                    widget.setParent(None)

        # Determine layout based on available space
        if container_width >= total_width_needed + 100:
            # Single row layout
            for i, option in enumerate(self.position_options):
                self.positions_layout.addWidget(option, 0, i)
        else:
            # Multi-row layout
            max_cols = max(1, (container_width - 100) // (position_width + spacing))
            for i, option in enumerate(self.position_options):
                row = i // max_cols
                col = i % max_cols
                self.positions_layout.addWidget(option, row, col)

        self.positions_container.update()

    def get_current_grid_mode(self) -> str:
        """Get the current grid mode."""
        return self.current_grid_mode

    def _apply_legacy_sizing_regular(self, option: StartPositionOption):
        """Apply legacy-style sizing for regular picker (main_window_width // 10)."""
        try:
            # Get main window width using improved approach
            main_window_width = self._get_reliable_width()

            # Legacy formula: main_window_width // 10 for regular picker
            size = main_window_width // 10

            # Ensure reasonable size range for visibility and usability
            size = max(size, 80)  # Minimum 80px (same as legacy)
            size = min(size, 400)  # Maximum 200px to prevent too large

            # Apply the size
            option.setFixedSize(size, size)

            # Update pictograph size to match container
            if hasattr(option, "_update_pictograph_size"):
                option._update_pictograph_size()

            # Ensure the option is visible
            option.show()
            option.setVisible(True)

        except Exception:
            # Fallback to reasonable default size
            option.setFixedSize(120, 120)
            option.show()

    def _get_reliable_width(self) -> int:
        """Get a reliable width using the most direct approach."""
        try:
            # Use Qt's built-in window() method - most reliable
            main_window = self.window()
            if main_window and main_window.width() > 400:
                return main_window.width()

            # Fallback to reasonable default
            return 1000
        except Exception:
            return 1000

    def showEvent(self, event):
        """Handle show event - apply proper sizing when widget is actually shown."""
        super().showEvent(event)

        # Use a timer to delay sizing until the main window is properly set up
        # This ensures we don't get splash screen dimensions
        from PyQt6.QtCore import QTimer

        QTimer.singleShot(100, self._apply_delayed_sizing)

    def _apply_delayed_sizing(self):
        """Apply proper sizing after the main window is set up."""
        # Now apply the legacy sizing to all position options
        for option in self.position_options:
            self._apply_legacy_sizing_regular(option)

    def resizeEvent(self, event):
        """Handle resize events to update position option sizes."""
        super().resizeEvent(event)

        # Update sizing for all position options when window is resized
        for option in self.position_options:
            self._apply_legacy_sizing_regular(option)

    def set_grid_mode(self, grid_mode: str):
        """Set the grid mode and refresh positions."""
        if grid_mode != self.current_grid_mode:
            self.current_grid_mode = grid_mode
            self._load_start_positions()
            if self.advanced_picker:
                self.advanced_picker.set_grid_mode(grid_mode)
