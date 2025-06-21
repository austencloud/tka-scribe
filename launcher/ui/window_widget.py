"""
Window mode widget for TKA Unified Launcher.
Enhanced with responsive layout and premium glassmorphism design.
"""

from typing import Dict, List
from PyQt6.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QGridLayout,
    QPushButton,
    QLabel,
    QScrollArea,
    QGroupBox,
    QLineEdit,
)
from PyQt6.QtCore import Qt, pyqtSignal, QTimer
from PyQt6.QtGui import QFont

from launcher.core.app_manager import ApplicationManager
from launcher.config.settings import SettingsManager
from launcher.config.app_definitions import AppDefinition
from launcher.ui.styles import ModernLauncherStyles


class WindowLauncherWidget(QWidget):
    """
    Window mode interface for the launcher.
    Features responsive layout, premium glassmorphism, and modern design.
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
        self.filtered_apps: List[AppDefinition] = []

        # Search functionality
        self.search_timer = QTimer()
        self.search_timer.setSingleShot(True)
        self.search_timer.timeout.connect(self._perform_search)

        self._setup_ui()
        self._load_applications()

        # Apply premium 2025 styling
        self.setStyleSheet(ModernLauncherStyles.get_premium_main_window_style())

    def _setup_ui(self):
        """Setup the responsive UI layout."""
        layout = QVBoxLayout(self)
        # Use relative margins based on window size
        self._update_responsive_margins(layout)
        
        # Connect to resize events for responsive behavior
        self.resizeEvent = self._on_resize

        # Header section
        header_layout = self._create_header()
        layout.addLayout(header_layout)

        # Premium search bar
        search_layout = self._create_search_bar()
        layout.addLayout(search_layout)

        # Applications section
        apps_widget = self._create_applications_section()
        layout.addWidget(apps_widget)

        # Footer section
        footer_layout = self._create_footer()
        layout.addLayout(footer_layout)

    def _create_header(self) -> QHBoxLayout:
        """Create the header section."""
        layout = QHBoxLayout()

        # Title
        title_label = QLabel("TKA Unified Launcher")
        title_font = QFont()
        title_font.setPointSize(24)
        title_font.setWeight(QFont.Weight.Bold)
        title_label.setFont(title_font)
        layout.addWidget(title_label)

        layout.addStretch()

        # Mode switch button
        mode_button = QPushButton("Switch to Docked Mode")
        mode_button.setStyleSheet(
            ModernLauncherStyles.get_premium_button_style("secondary")
        )
        mode_button.clicked.connect(self.mode_switch_requested.emit)
        layout.addWidget(mode_button)

        return layout

    def _create_search_bar(self) -> QHBoxLayout:
        """Create the premium search bar section."""
        layout = QHBoxLayout()
        layout.setContentsMargins(0, 0, 0, 0)

        # Search input
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText(
            "✨ Search applications or type command..."
        )
        self.search_input.setStyleSheet(ModernLauncherStyles.get_premium_search_style())
        self.search_input.textChanged.connect(self._on_search_text_changed)
        self.search_input.returnPressed.connect(self._on_search_enter)

        layout.addWidget(self.search_input)
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
        self.apps_layout.setSpacing(20)

        scroll_area.setWidget(content_widget)
        return scroll_area

    def _create_footer(self) -> QHBoxLayout:
        """Create the footer section."""
        layout = QHBoxLayout()

        # Status info
        status_label = QLabel("Ready")
        status_label.setStyleSheet(
            f"color: {ModernLauncherStyles.COLORS['text_secondary']};"
        )
        layout.addWidget(status_label)

        layout.addStretch()

        # Refresh button
        refresh_button = QPushButton("Refresh")
        refresh_button.setStyleSheet(
            ModernLauncherStyles.get_premium_button_style("secondary")
        )
        refresh_button.clicked.connect(self.refresh_applications)
        layout.addWidget(refresh_button)

        return layout

    def _load_applications(self):
        """Load and display applications by category."""
        # Clear existing content
        self._clear_layout(self.apps_layout)

        # Get applications by category
        categories = self.app_manager.app_definitions.get_categories()

        for category in sorted(categories):
            apps = self.app_manager.app_definitions.get_by_category(category)
            if apps:
                category_widget = self._create_category_widget(category, apps)
                self.apps_layout.addWidget(category_widget)

        # Add stretch at the end
        self.apps_layout.addStretch()

    def _create_category_widget(
        self, category: str, apps: List[AppDefinition]
    ) -> QGroupBox:
        """Create a widget for a category of applications."""
        group_box = QGroupBox(category)
        group_box.setStyleSheet(ModernLauncherStyles.get_premium_group_box_style())

        layout = QGridLayout(group_box)
        
        # Responsive spacing and margins
        window_width = self.width()
        spacing = max(12, min(24, int(window_width * 0.015)))
        margin = max(16, min(32, int(window_width * 0.02)))
        
        layout.setSpacing(spacing)
        layout.setContentsMargins(margin, margin, margin, margin)

        # Create buttons for each app in a responsive grid
        row, col = 0, 0
        max_cols = self._calculate_responsive_columns()

        for app in apps:
            button = self._create_app_button(app)
            layout.addWidget(button, row, col)

            col += 1
            if col >= max_cols:
                col = 0
                row += 1

        return group_box

    def _create_app_button(self, app: AppDefinition) -> QPushButton:
        """Create a button for an application."""
        button = QPushButton()

        # Button text with icon and title
        button_text = f"{app.icon}\n{app.title}"
        button.setText(button_text)

        # Set tooltip with description
        button.setToolTip(app.description)

        # Apply premium styling
        button.setStyleSheet(ModernLauncherStyles.get_premium_app_card_style())

        # Connect click handler
        button.clicked.connect(lambda: self._launch_application(app.id))

        # Store reference
        self.app_buttons[app.id] = button

        return button

    def _launch_application(self, app_id: str):
        """Launch an application."""
        success = self.app_manager.launch_application(app_id)
        if success:
            print(f"✅ Launching {app_id}")
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

    def _on_search_text_changed(self, text: str):
        """Handle search text changes with debouncing."""
        self.search_timer.stop()
        self.search_timer.start(300)  # 300ms debounce

    def _on_search_enter(self):
        """Handle Enter key in search box."""
        search_text = self.search_input.text().strip()
        if search_text and self.filtered_apps:
            # Launch the first filtered app
            first_app = self.filtered_apps[0]
            self._launch_application(first_app.id)

    def _perform_search(self):
        """Perform the actual search filtering."""
        search_text = self.search_input.text().strip().lower()

        if not search_text:
            # Show all applications
            self._load_applications()
            return

        # Filter applications
        all_apps = self.app_manager.app_definitions.get_all()
        self.filtered_apps = [
            app
            for app in all_apps
            if (
                search_text in app.title.lower()
                or search_text in app.description.lower()
                or search_text in app.category.lower()
            )
        ]

        # Update display with filtered results
        self._display_filtered_applications()

    def _display_filtered_applications(self):
        """Display filtered search results."""
        # Clear existing content
        self._clear_layout(self.apps_layout)

        if not self.filtered_apps:
            # Show "no results" message
            no_results = QLabel("No applications found")
            no_results.setStyleSheet(
                f"""
                color: {ModernLauncherStyles.COLORS['text_tertiary']};
                font-size: {ModernLauncherStyles.FONTS['size_lg']};
                font-weight: {ModernLauncherStyles.FONTS['weight_medium']};
                padding: {ModernLauncherStyles.SPACING['8']};
            """
            )
            no_results.setAlignment(Qt.AlignmentFlag.AlignCenter)
            self.apps_layout.addWidget(no_results)
            return

        # Group filtered apps by category
        categories = {}
        for app in self.filtered_apps:
            if app.category not in categories:
                categories[app.category] = []
            categories[app.category].append(app)

        # Display filtered results by category
        for category, apps in categories.items():
            category_widget = self._create_category_widget(category, apps)
            self.apps_layout.addWidget(category_widget)

        # Add stretch at the end
        self.apps_layout.addStretch()
    
    def _update_responsive_margins(self, layout):
        """Update margins based on window size."""
        # Get current window size
        window_size = self.size()
        
        # Calculate responsive margins (2-4% of window width)
        base_margin = max(16, min(40, int(window_size.width() * 0.03)))
        spacing = max(12, min(24, int(window_size.width() * 0.02)))
        
        layout.setContentsMargins(base_margin, base_margin, base_margin, base_margin)
        layout.setSpacing(spacing)
    
    def _calculate_responsive_columns(self) -> int:
        """Calculate optimal number of columns based on window width."""
        window_width = self.width()
        
        # Responsive column calculation
        if window_width < 800:
            return 1  # Single column for narrow windows
        elif window_width < 1200:
            return 2  # Two columns for medium windows
        elif window_width < 1600:
            return 3  # Three columns for wide windows
        else:
            return 4  # Four columns for very wide windows
    
    def _on_resize(self, event):
        """Handle window resize events for responsive layout."""
        # Update margins
        if hasattr(self, 'layout'):
            self._update_responsive_margins(self.layout())
        
        # Refresh layout with new column count
        self._load_applications()
        
        # Call parent resize event
        super().resizeEvent(event)
