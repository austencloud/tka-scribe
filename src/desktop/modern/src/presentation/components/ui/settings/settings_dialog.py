"""
Production-ready settings dialog - drop-in replacement for ModernSettingsDialog.

This is the enhanced settings dialog that combines the beautiful glassmorphism design 
from the legacy system with the modern architecture. It's designed to be a complete 
replacement for the existing ModernSettingsDialog.

Features:
- Glassmorphism design with translucent backgrounds and blur effects
- Enhanced component architecture with reusable SettingCard, Toggle, ComboBox
- Settings coordinator for centralized state management
- Smooth animations and modern visual hierarchy
- All essential tabs: General, Prop Types, Visibility, Beat Layout, Image Export, Background
- Backward compatible service integration

This dialog automatically creates and manages all required services internally,
making it a true drop-in replacement that requires minimal integration effort.

Usage:
    Replace any instance of ModernSettingsDialog with SettingsDialog:
    
    # Old way:
    dialog = ModernSettingsDialog(ui_state_service, parent)
    
    # New way:
    dialog = SettingsDialog(ui_state_service, parent)
    
The new dialog provides the same interface while delivering a significantly 
enhanced user experience with modern visual design.

Note: Import errors in IDE are expected due to relative imports - all services 
and tabs exist and will resolve correctly at runtime.
"""

from typing import Optional
from PyQt6.QtWidgets import (
    QDialog,
    QVBoxLayout,
    QHBoxLayout,
    QTabWidget,
    QWidget,
    QLabel,
    QPushButton,
    QFrame,
    QScrollArea,
)
from PyQt6.QtCore import Qt, pyqtSignal, QPropertyAnimation, QEasingCurve
from PyQt6.QtGui import QFont, QPainter, QBrush, QColor, QLinearGradient

from core.interfaces.core_services import IUIStateManagementService
from .coordinator import SettingsCoordinator
from .tabs.general_tab import GeneralTab
from .tabs.prop_type_tab import PropTypeTab
from .tabs.visibility_tab import VisibilityTab
from .tabs.beat_layout_tab import BeatLayoutTab
from .tabs.image_export_tab import ImageExportTab
from .tabs.background_tab import BackgroundTab


class SettingsDialog(QDialog):
    """Enhanced settings dialog with glassmorphism design and modern functionality."""
    
    settings_changed = pyqtSignal(str, object)

    def __init__(self, ui_state_service: IUIStateManagementService, parent=None):
        super().__init__(parent)
        self.ui_state_service = ui_state_service
        self._setup_coordinator()
        self._initialize_services()        
        self._setup_dialog()
        self._create_ui()
        self._apply_styling()
        self._setup_animations()

    def _setup_coordinator(self):
        """Setup the settings coordinator for managing state."""
        from ...application.services.settings.settings_service import SettingsService
        settings_service = SettingsService(self.ui_state_service)
        self.coordinator = SettingsCoordinator(settings_service)
        self.coordinator.settings_changed.connect(self.settings_changed.emit)

    def _initialize_services(self):
        """Initialize all the tab-specific services."""
        from ...application.services.settings.user_profile_service import UserProfileService
        from ...application.services.settings.prop_type_service import PropTypeService
        from ...application.services.settings.visibility_service import VisibilityService
        from ...application.services.settings.beat_layout_service import BeatLayoutService
        from ...application.services.settings.image_export_service import ImageExportService
        from ...application.services.settings.background_service import BackgroundService

        self.user_service = UserProfileService(self.ui_state_service)
        self.prop_service = PropTypeService(self.ui_state_service)
        self.visibility_service = VisibilityService(self.ui_state_service)
        self.layout_service = BeatLayoutService(self.ui_state_service)
        self.export_service = ImageExportService(self.ui_state_service)
        self.background_service = BackgroundService(self.ui_state_service)

    def _setup_dialog(self):
        """Setup basic dialog properties."""
        self.setWindowTitle("Settings")
        self.setModal(True)
        self.setFixedSize(1200, 800)
        self.setWindowFlags(Qt.WindowType.Dialog | Qt.WindowType.FramelessWindowHint)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)

    def _create_ui(self):
        """Create the enhanced UI layout."""
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(0, 0, 0, 0)

        # Main container with glassmorphism effect
        self.container = QFrame()
        self.container.setObjectName("glassmorphism_container")
        main_layout.addWidget(self.container)

        container_layout = QVBoxLayout(self.container)
        container_layout.setContentsMargins(25, 25, 25, 25)
        container_layout.setSpacing(20)

        # Enhanced header
        self._create_header(container_layout)
        
        # Enhanced tab widget
        self._create_tab_widget(container_layout)
        
        # Enhanced action buttons
        self._create_action_buttons(container_layout)

    def _create_header(self, parent_layout):
        """Create the enhanced header with glassmorphism styling."""
        header_frame = QFrame()
        header_frame.setObjectName("header_frame")
        header_layout = QHBoxLayout(header_frame)
        header_layout.setContentsMargins(15, 15, 15, 15)

        # Title with enhanced styling
        title = QLabel("Settings")
        title.setObjectName("dialog_title")
        title.setFont(QFont("Segoe UI", 26, QFont.Weight.Bold))

        # Close button with hover effects
        self.close_button = QPushButton("×")
        self.close_button.setObjectName("close_button")
        self.close_button.setFixedSize(45, 45)
        self.close_button.setCursor(Qt.CursorShape.PointingHandCursor)
        self.close_button.clicked.connect(self.close)

        header_layout.addWidget(title)
        header_layout.addStretch()
        header_layout.addWidget(self.close_button)
        
        parent_layout.addWidget(header_frame)

    def _create_tab_widget(self, parent_layout):
        """Create the enhanced tab widget with all tabs."""
        self.tab_widget = QTabWidget()
        self.tab_widget.setObjectName("enhanced_tab_widget")

        # Create all tabs (keeping the important ones, removing empty Advanced)
        self._create_enhanced_tabs()

        parent_layout.addWidget(self.tab_widget)

    def _create_enhanced_tabs(self):
        """Create all the enhanced tabs with better styling."""
        # General Tab 
        general_tab = GeneralTab(self.user_service)
        general_tab.setting_changed.connect(self.coordinator.update_setting)
        self.tab_widget.addTab(general_tab, "General")

        # Prop Type Tab
        prop_tab = PropTypeTab(self.prop_service)
        prop_tab.prop_type_changed.connect(
            lambda prop_type: self.coordinator.update_setting("prop_type", prop_type)
        )
        self.tab_widget.addTab(prop_tab, "Prop Types")

        # Visibility Tab
        visibility_tab = VisibilityTab(self.visibility_service)
        visibility_tab.visibility_changed.connect(self.coordinator.update_setting)
        self.tab_widget.addTab(visibility_tab, "Visibility")

        # Beat Layout Tab
        layout_tab = BeatLayoutTab(self.layout_service)
        layout_tab.layout_changed.connect(
            lambda length, rows, cols: self.coordinator.update_setting(
                "beat_layout", {"length": length, "rows": rows, "cols": cols}
            )
        )
        self.tab_widget.addTab(layout_tab, "Beat Layout")

        # Image Export Tab
        export_tab = ImageExportTab(self.export_service)
        export_tab.export_option_changed.connect(self.coordinator.update_setting)
        self.tab_widget.addTab(export_tab, "Image Export")

        # Background Tab (keep this important feature!)
        background_tab = BackgroundTab(self.background_service)
        background_tab.background_changed.connect(self.coordinator.update_setting)
        self.tab_widget.addTab(background_tab, "Background")

    def _create_action_buttons(self, parent_layout):
        """Create enhanced action buttons."""
        button_frame = QFrame()
        button_frame.setObjectName("button_frame")
        button_layout = QHBoxLayout(button_frame)
        button_layout.setContentsMargins(15, 15, 15, 15)
        button_layout.addStretch()

        # Reset button
        self.reset_button = QPushButton("Reset to Defaults")
        self.reset_button.setObjectName("secondary_button")
        self.reset_button.setCursor(Qt.CursorShape.PointingHandCursor)
        self.reset_button.clicked.connect(self._reset_settings)

        # Apply button
        self.apply_button = QPushButton("Apply")
        self.apply_button.setObjectName("secondary_button")
        self.apply_button.setCursor(Qt.CursorShape.PointingHandCursor)
        self.apply_button.clicked.connect(self._apply_settings)

        # OK button (primary)
        self.ok_button = QPushButton("OK")
        self.ok_button.setObjectName("primary_button")
        self.ok_button.setCursor(Qt.CursorShape.PointingHandCursor)
        self.ok_button.clicked.connect(self.accept)

        button_layout.addWidget(self.reset_button)
        button_layout.addWidget(self.apply_button)
        button_layout.addWidget(self.ok_button)
        
        parent_layout.addWidget(button_frame)

    def _setup_animations(self):
        """Setup smooth animations for UI interactions."""
        # Fade in animation for dialog
        self.fade_animation = QPropertyAnimation(self, b"windowOpacity")
        self.fade_animation.setDuration(250)
        self.fade_animation.setEasingCurve(QEasingCurve.Type.OutCubic)
        
    def showEvent(self, event):
        """Override show event to add fade in animation."""
        super().showEvent(event)
        self.setWindowOpacity(0)
        self.fade_animation.setStartValue(0)
        self.fade_animation.setEndValue(1)
        self.fade_animation.start()

    def _apply_settings(self):
        """Apply all current settings."""
        self.coordinator.save_settings()

    def _reset_settings(self):
        """Reset all settings to defaults with confirmation."""
        from PyQt6.QtWidgets import QMessageBox
        
        reply = QMessageBox.question(
            self, 
            "Reset Settings",
            "Are you sure you want to reset all settings to their default values?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
            QMessageBox.StandardButton.No
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            self.coordinator.reset_to_defaults()

    def paintEvent(self, event):
        """Custom paint event for glassmorphism background."""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)

        # Create glassmorphism background
        gradient = QLinearGradient(0, 0, 0, self.height())
        gradient.setColorAt(0, QColor(20, 25, 35, 180))
        gradient.setColorAt(0.5, QColor(25, 30, 40, 160))
        gradient.setColorAt(1, QColor(30, 35, 45, 180))

        painter.fillRect(self.rect(), QBrush(gradient))

    def _apply_styling(self):
        """Apply the enhanced glassmorphism styling."""
        self.setStyleSheet("""
            QDialog {
                background: transparent;
            }
            
            #glassmorphism_container {
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 20px;
                backdrop-filter: blur(20px);
            }
            
            #header_frame {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                margin-bottom: 10px;
            }
            
            #dialog_title {
                color: rgba(255, 255, 255, 0.95);
                background: transparent;
                padding: 5px;
            }
            
            #close_button {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 22px;
                color: rgba(255, 255, 255, 0.8);
                font-size: 18px;
                font-weight: bold;
            }
            
            #close_button:hover {
                background: rgba(255, 100, 100, 0.3);
                border-color: rgba(255, 150, 150, 0.5);
                color: white;
            }
            
            #enhanced_tab_widget {
                background: transparent;
                border: none;
            }
            
            #enhanced_tab_widget::pane {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                top: -1px;
            }
            
            #enhanced_tab_widget::tab-bar {
                alignment: center;
            }
            
            QTabBar::tab {
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.15);
                padding: 12px 20px;
                margin-right: 2px;
                border-top-left-radius: 12px;
                border-top-right-radius: 12px;
                color: rgba(255, 255, 255, 0.7);
                font-weight: 500;
                min-width: 100px;
            }
            
            QTabBar::tab:selected {
                background: rgba(42, 130, 218, 0.3);
                border-color: rgba(42, 130, 218, 0.5);
                color: white;
            }
            
            QTabBar::tab:hover {
                background: rgba(255, 255, 255, 0.12);
                color: rgba(255, 255, 255, 0.9);
            }
            
            #button_frame {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                margin-top: 10px;
            }
            
            #primary_button {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 rgba(42, 130, 218, 0.8),
                    stop:1 rgba(42, 130, 218, 0.6));
                border: 1px solid rgba(42, 130, 218, 0.9);
                border-radius: 12px;
                color: white;
                font-weight: bold;
                padding: 12px 25px;
                font-size: 14px;
            }
            
            #primary_button:hover {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 rgba(42, 130, 218, 1.0),
                    stop:1 rgba(42, 130, 218, 0.8));
            }
            
            #primary_button:pressed {
                background: rgba(42, 130, 218, 0.9);
            }
            
            #secondary_button {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                color: rgba(255, 255, 255, 0.8);
                font-weight: 500;
                padding: 12px 20px;
                font-size: 14px;
                margin-right: 10px;
            }
            
            #secondary_button:hover {
                background: rgba(255, 255, 255, 0.15);
                color: white;
            }
            
            #secondary_button:pressed {
                background: rgba(255, 255, 255, 0.08);
            }
        """)
