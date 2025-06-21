"""
Docked mode widget for TKA Unified Launcher.
Premium glassmorphism sidebar with vertical icon layout.
"""

from typing import Dict
from PyQt6.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QPushButton,
    QScrollArea,
    QLabel,
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont

from launcher.core.app_manager import ApplicationManager
from launcher.config.settings import SettingsManager
from launcher.config.app_definitions import AppDefinition
from launcher.ui.styles import ModernLauncherStyles


class DockedLauncherWidget(QWidget):
    """
    Docked mode interface for the launcher.
    Thin vertical sidebar with glassmorphism styling and icon-based navigation.
    """

    # Signals
    mode_switch_requested = pyqtSignal()

    def __init__(
        self, app_manager: ApplicationManager, settings_manager: SettingsManager
    ):
        super().__init__()

        self.app_manager = app_manager
        self.settings_manager = settings_manager
        self.app_buttons: Dict[str, QPushButton] = {}

        self._setup_ui()
        self._load_applications()

        # Apply premium docked styling
        self.setStyleSheet(ModernLauncherStyles.get_premium_docked_style())

    def _setup_ui(self):
        """Setup the docked UI layout."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(8, 8, 8, 8)
        layout.setSpacing(8)

        # Header with mode switch
        header_layout = self._create_header()
        layout.addLayout(header_layout)

        # Applications scroll area
        apps_widget = self._create_applications_section()
        layout.addWidget(apps_widget)

        # Footer
        footer_layout = self._create_footer()
        layout.addLayout(footer_layout)

    def _create_header(self) -> QVBoxLayout:
        """Create the header section."""
        layout = QVBoxLayout()
        layout.setSpacing(4)

        # TKA logo/title (compact)
        title_label = QLabel("TKA")
        title_font = QFont()
        title_font.setPointSize(12)
        title_font.setWeight(QFont.Weight.Bold)
        title_label.setFont(title_font)
        title_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title_label.setStyleSheet(f"color: {ModernLauncherStyles.COLORS['text_accent']};")
        layout.addWidget(title_label)

        # Mode switch button (compact)
        mode_button = QPushButton("⊞")
        mode_button.setToolTip("Switch to Window Mode")
        mode_button.setFixedSize(40, 40)
        mode_button.setStyleSheet(
            ModernLauncherStyles.get_premium_button_style("secondary")
        )
        mode_button.clicked.connect(self.mode_switch_requested.emit)
        layout.addWidget(mode_button)

        return layout

    def _create_applications_section(self) -> QWidget:
        """Create the applications section."""
        # Create scroll area for applications
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        scroll_area.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)

        # Content widget
        content_widget = QWidget()
        self.apps_layout = QVBoxLayout(content_widget)
        self.apps_layout.setSpacing(6)
        self.apps_layout.setContentsMargins(4, 4, 4, 4)

        scroll_area.setWidget(content_widget)
        return scroll_area

    def _create_footer(self) -> QVBoxLayout:
        """Create the footer section."""
        layout = QVBoxLayout()
        layout.setSpacing(4)

        # Settings button
        settings_button = QPushButton("⚙️")
        settings_button.setToolTip("Settings")
        settings_button.setFixedSize(40, 40)
        settings_button.setStyleSheet(
            ModernLauncherStyles.get_premium_button_style("ghost")
        )
        layout.addWidget(settings_button)

        return layout

    def _load_applications(self):
        """Load and display applications as vertical icons."""
        # Clear existing content
        self._clear_layout(self.apps_layout)

        # Get all applications
        all_apps = self.app_manager.app_definitions.get_all()

        # Create compact buttons for each app
        for app in all_apps:
            button = self._create_app_button(app)
            self.apps_layout.addWidget(button)

        # Add stretch at the end
        self.apps_layout.addStretch()

    def _create_app_button(self, app: AppDefinition) -> QPushButton:
        """Create a compact button for an application."""
        button = QPushButton()

        # Use only the icon for compact display
        button.setText(app.icon)
        button.setToolTip(f"{app.title}\n{app.description}")

        # Set fixed size for consistent docked appearance
        icon_size = self.settings_manager.get("dock_icon_size", 48)
        button.setFixedSize(icon_size, icon_size)

        # Apply premium docked button styling
        button.setStyleSheet(self._get_docked_button_style())

        # Connect click handler
        button.clicked.connect(lambda: self._launch_application(app.id))

        # Store reference
        self.app_buttons[app.id] = button

        return button

    def _get_docked_button_style(self) -> str:
        """Get styling for docked mode buttons."""
        return f"""
        QPushButton {{
            background: {ModernLauncherStyles.COLORS['glass_elevated']};
            color: {ModernLauncherStyles.COLORS['text_primary']};
            border: 1px solid {ModernLauncherStyles.COLORS['glass_border']};
            border-radius: {ModernLauncherStyles.RADIUS['lg']};
            font-size: {ModernLauncherStyles.FONTS['size_lg']};
            font-weight: {ModernLauncherStyles.FONTS['weight_semibold']};
            margin: 2px;
        }}

        QPushButton:hover {{
            background: {ModernLauncherStyles.COLORS['hover_overlay']};
            border-color: {ModernLauncherStyles.COLORS['accent_primary']};
        }}

        QPushButton:pressed {{
            background: {ModernLauncherStyles.COLORS['active_overlay']};
        }}

        QPushButton:focus {{
            border: 2px solid {ModernLauncherStyles.COLORS['focus_ring']};
            outline: none;
        }}
        """

    def _launch_application(self, app_id: str):
        """Launch an application."""
        success = self.app_manager.launch_application(app_id)
        if success:
            print(f"✅ Launching {app_id} from docked mode")
            
            # Visual feedback - briefly highlight the button
            if app_id in self.app_buttons:
                button = self.app_buttons[app_id]
                original_style = button.styleSheet()
                
                # Highlight style
                highlight_style = f"""
                QPushButton {{
                    background: {ModernLauncherStyles.COLORS['accent_primary']};
                    border-color: {ModernLauncherStyles.COLORS['accent_primary']};
                    color: {ModernLauncherStyles.COLORS['text_primary']};
                }}
                """
                
                button.setStyleSheet(highlight_style)
                
                # Reset after brief delay
                from PyQt6.QtCore import QTimer
                QTimer.singleShot(200, lambda: button.setStyleSheet(original_style))
        else:
            print(f"❌ Failed to launch {app_id}")

    def _clear_layout(self, layout):
        """Clear all widgets from a layout."""
        while layout.count():
            child = layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()

    def refresh_applications(self):
        """Refresh the applications display."""
        self._load_applications()

    def set_active_app(self, app_id: str):
        """Set an application as active (visual indicator)."""
        # Reset all buttons to normal state
        for button in self.app_buttons.values():
            button.setProperty("active", False)
            button.setStyleSheet(self._get_docked_button_style())
        
        # Set the active button
        if app_id in self.app_buttons:
            button = self.app_buttons[app_id]
            button.setProperty("active", True)
            
            # Active button style
            active_style = f"""
            QPushButton {{
                background: {ModernLauncherStyles.COLORS['accent_primary']};
                color: {ModernLauncherStyles.COLORS['text_primary']};
                border: 2px solid {ModernLauncherStyles.COLORS['accent_primary']};
                border-radius: {ModernLauncherStyles.RADIUS['lg']};
                font-size: {ModernLauncherStyles.FONTS['size_lg']};
                font-weight: {ModernLauncherStyles.FONTS['weight_bold']};
                margin: 2px;
            }}

            QPushButton:hover {{
                background: {ModernLauncherStyles.COLORS['accent_primary_hover']};
                border-color: {ModernLauncherStyles.COLORS['accent_primary_hover']};
            }}
            """
            
            button.setStyleSheet(active_style)

    def get_optimal_width(self) -> int:
        """Get the optimal width for docked mode."""
        icon_size = self.settings_manager.get("dock_icon_size", 48)
        padding = 16  # 8px on each side
        return icon_size + padding
