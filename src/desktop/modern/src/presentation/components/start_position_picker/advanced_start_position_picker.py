"""
Advanced Start Position Picker with comprehensive position options and modern design.

This component displays all available start positions in a searchable, filterable
grid layout with contemporary styling and smooth interactions.
"""
import logging
from typing import List, Optional, Dict, Any

from application.services.pictograph_pool_manager import PictographPoolManager
from application.services.data.dataset_query import DatasetQuery
from presentation.components.start_position_picker.start_position_option import (
    StartPositionOption,
)
from PyQt6.QtCore import (
    QSize, 
    Qt, 
    pyqtSignal, 
    QPropertyAnimation, 
    QEasingCurve,
    QTimer
)
from PyQt6.QtGui import (
    QFont, 
    QPainter, 
    QColor, 
    QLinearGradient, 
    QPainterPath,
    QIcon
)
from PyQt6.QtWidgets import (
    QGridLayout, 
    QLabel, 
    QScrollArea, 
    QVBoxLayout, 
    QHBoxLayout,
    QWidget,
    QPushButton,
    QLineEdit,
    QComboBox,
    QFrame,
    QGraphicsDropShadowEffect,
    QSizePolicy
)

logger = logging.getLogger(__name__)


class AdvancedStartPositionPicker(QWidget):
    """
    Advanced start position picker with comprehensive filtering and search capabilities.
    
    Features:
    - Displays all available start positions for both grid modes
    - Search and filter functionality
    - Modern glassmorphism design with responsive layout
    - Back button to return to basic picker
    - Enhanced accessibility and user experience
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

    def _setup_ui(self):
        """Set up the advanced picker UI with modern styling."""
        self.setStyleSheet(self._get_advanced_picker_styles())
        self.setObjectName("AdvancedPickerContainer")
        
        # Main layout
        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(16)

        # Header section
        header_widget = self._create_header_section()
        layout.addWidget(header_widget)

        # Controls section (search, filter, grid mode)
        controls_widget = self._create_controls_section()
        layout.addWidget(controls_widget)

        # Positions grid with enhanced scroll area
        scroll_area = self._create_positions_scroll_area()
        layout.addWidget(scroll_area)

        # Footer with back button
        footer_widget = self._create_footer_section()
        layout.addWidget(footer_widget)

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
        """Create header with title and subtitle."""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(4)
        
        # Title
        title = QLabel("Advanced Start Positions")
        title.setFont(QFont("Segoe UI", 20, QFont.Weight.Bold))
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setObjectName("AdvancedTitle")
        layout.addWidget(title)
        
        # Subtitle
        subtitle = QLabel("Explore all available starting positions and variations")
        subtitle.setFont(QFont("Segoe UI", 13))
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        subtitle.setObjectName("AdvancedSubtitle")
        layout.addWidget(subtitle)
        
        return widget

    def _create_controls_section(self) -> QWidget:
        """Create controls section with search and filters."""
        widget = QWidget()
        layout = QHBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(12)
        
        # Search field
        self.search_field = QLineEdit()
        self.search_field.setObjectName("SearchField")
        self.search_field.setPlaceholderText("🔍 Search positions...")
        self.search_field.textChanged.connect(self._on_search_text_changed)
        layout.addWidget(self.search_field, 2)
        
        # Grid mode filter
        self.grid_mode_combo = QComboBox()
        self.grid_mode_combo.setObjectName("FilterCombo")
        self.grid_mode_combo.addItems(["Diamond Grid", "Box Grid", "All Grids"])
        self.grid_mode_combo.setCurrentText(
            "Diamond Grid" if self.current_grid_mode == "diamond" else "Box Grid"
        )
        self.grid_mode_combo.currentTextChanged.connect(self._on_grid_mode_changed)
        layout.addWidget(self.grid_mode_combo, 1)
        
        # Letter filter
        self.letter_filter_combo = QComboBox()
        self.letter_filter_combo.setObjectName("FilterCombo")
        self.letter_filter_combo.addItems(["All Letters", "Alpha (α)", "Beta (β)", "Gamma (Γ)"])
        self.letter_filter_combo.currentTextChanged.connect(self._on_letter_filter_changed)
        layout.addWidget(self.letter_filter_combo, 1)
        
        return widget

    def _create_positions_scroll_area(self) -> QScrollArea:
        """Create enhanced scroll area for positions grid."""
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        scroll_area.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        
        # Positions container
        self.positions_container = QWidget()
        self.positions_layout = QGridLayout(self.positions_container)
        self.positions_layout.setSpacing(16)
        self.positions_layout.setContentsMargins(8, 8, 8, 8)
        
        scroll_area.setWidget(self.positions_container)
        return scroll_area

    def _create_footer_section(self) -> QWidget:
        """Create footer section with back button."""
        widget = QWidget()
        layout = QHBoxLayout(widget)
        layout.setContentsMargins(0, 8, 0, 0)
        layout.setSpacing(0)
        
        # Back button
        self.back_button = QPushButton("← Back to Basic")
        self.back_button.setObjectName("BackButton")
        self.back_button.setFont(QFont("Segoe UI", 12, QFont.Weight.Medium))
        self.back_button.clicked.connect(self.back_requested.emit)
        self.back_button.setCursor(Qt.CursorShape.PointingHandCursor)
        
        layout.addWidget(self.back_button)
        layout.addStretch()
        
        return widget

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
        
        # Search delay timer
        self.search_timer = QTimer()
        self.search_timer.setSingleShot(True)
        self.search_timer.timeout.connect(self._perform_search)

    def _load_all_positions(self):
        """Load all available start positions from the dataset."""
        try:
            # Get all available positions from dataset
            self.all_positions = []
            
            # Define all possible position keys for both grid modes
            diamond_positions = [
                "alpha1_alpha1", "beta5_beta5", "gamma11_gamma11",
                "alpha3_alpha3", "beta7_beta7", "gamma9_gamma9",
                "alpha5_alpha5", "beta1_beta1", "gamma1_gamma1",
                "alpha7_alpha7", "beta3_beta3", "gamma3_gamma3",
                "alpha9_alpha9", "beta9_beta9", "gamma5_gamma5",
                "alpha11_alpha11", "beta11_beta11", "gamma7_gamma7"
            ]
            
            box_positions = [
                "alpha2_alpha2", "beta4_beta4", "gamma12_gamma12",
                "alpha4_alpha4", "beta6_beta6", "gamma10_gamma10",
                "alpha6_alpha6", "beta2_beta2", "gamma2_gamma2",
                "alpha8_alpha8", "beta8_beta8", "gamma4_gamma4",
                "alpha10_alpha10", "beta10_beta10", "gamma6_gamma6",
                "alpha12_alpha12", "beta12_beta12", "gamma8_gamma8"
            ]
            
            # Create position data
            for grid_mode, positions in [("diamond", diamond_positions), ("box", box_positions)]:
                for position_key in positions:
                    start_pos, end_pos = position_key.split("_")
                    letter = self._extract_letter_from_position(start_pos)
                    
                    position_data = {
                        "position_key": position_key,
                        "start_pos": start_pos,
                        "end_pos": end_pos,
                        "letter": letter,
                        "grid_mode": grid_mode,
                        "display_name": f"{letter.upper()} - {position_key.replace('_', ' → ')}"
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

    def _on_search_text_changed(self, text: str):
        """Handle search text changes with debouncing."""
        if self.search_timer:
            self.search_timer.stop()
            self.search_timer.start(300)  # 300ms delay

    def _perform_search(self):
        """Perform the actual search filtering."""
        search_text = self.search_field.text().lower().strip()
        self._apply_filters()

    def _on_grid_mode_changed(self, mode_text: str):
        """Handle grid mode filter changes."""
        if mode_text == "Diamond Grid":
            self.current_grid_mode = "diamond"
        elif mode_text == "Box Grid":
            self.current_grid_mode = "box"
        else:
            self.current_grid_mode = "all"
        
        self._apply_filters()

    def _on_letter_filter_changed(self, letter_text: str):
        """Handle letter filter changes."""
        self._apply_filters()

    def _apply_filters(self):
        """Apply all active filters to the positions list."""
        search_text = self.search_field.text().lower().strip()
        grid_mode_text = self.grid_mode_combo.currentText()
        letter_text = self.letter_filter_combo.currentText()
        
        # Start with all positions
        filtered = self.all_positions.copy()
        
        # Apply search filter
        if search_text:
            filtered = [
                pos for pos in filtered
                if search_text in pos["display_name"].lower() or 
                   search_text in pos["position_key"].lower() or
                   search_text in pos["letter"].lower()
            ]
        
        # Apply grid mode filter
        if grid_mode_text == "Diamond Grid":
            filtered = [pos for pos in filtered if pos["grid_mode"] == "diamond"]
        elif grid_mode_text == "Box Grid":
            filtered = [pos for pos in filtered if pos["grid_mode"] == "box"]
        
        # Apply letter filter
        if letter_text != "All Letters":
            letter_map = {
                "Alpha (α)": "α",
                "Beta (β)": "β", 
                "Gamma (Γ)": "Γ"
            }
            target_letter = letter_map.get(letter_text)
            if target_letter:
                filtered = [pos for pos in filtered if pos["letter"] == target_letter]
        
        self.filtered_positions = filtered
        self._update_positions_display()

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
        
        # Create new options for filtered positions
        for i, position_data in enumerate(self.filtered_positions):
            try:
                option = StartPositionOption(
                    position_data["position_key"], 
                    self.pool_manager, 
                    position_data["grid_mode"]
                )
                option.position_selected.connect(self._handle_position_selection)
                
                # Calculate grid position (4 columns for advanced picker)
                row = i // 4
                col = i % 4
                self.positions_layout.addWidget(option, row, col)
                self.position_options.append(option)
                
            except Exception as e:
                logger.warning(f"Failed to create option for position {position_data['position_key']}: {e}")
        
        # Update container
        self.positions_container.update()

    def _handle_position_selection(self, position_key: str):
        """Handle position selection from advanced picker."""
        logger.info(f"Advanced picker position selected: {position_key}")
        self.position_selected.emit(position_key)

    def set_grid_mode(self, grid_mode: str):
        """Set the grid mode and update filters."""
        self.current_grid_mode = grid_mode
        
        # Update combo box
        if grid_mode == "diamond":
            self.grid_mode_combo.setCurrentText("Diamond Grid")
        elif grid_mode == "box":
            self.grid_mode_combo.setCurrentText("Box Grid")
        
        self._apply_filters()

    def showEvent(self, event):
        """Handle show event with entrance animation."""
        super().showEvent(event)
        
        # Animate entrance if animation is set up
        if self.fade_animation:
            self.setWindowOpacity(0.0)
            self.fade_animation.setStartValue(0.0)
            self.fade_animation.setEndValue(1.0)
            self.fade_animation.start()

    def sizeHint(self) -> QSize:
        """Provide size hint for the advanced picker."""
        return QSize(800, 600)  # Larger size for more content
