#!/usr/bin/env python3
"""
Application Grid Widget - Premium 2025 Application Display
=========================================================

A responsive grid widget for displaying TKA applications with:
- Premium 2025 glassmorphism card design
- Advanced micro-interactions and animations
- Staggered entrance effects
- Search filtering with modern UI
- Category organization
- Launch functionality with spring physics

Architecture:
- Enhanced ModernApplicationCard with premium animations
- Staggered entrance animations
- Integrated design system
- Performance-optimized rendering
- Pure PyQt6 implementation
"""

import logging
from typing import List, Optional

from PyQt6.QtCore import (
    QEasingCurve,
    QPropertyAnimation,
    QRect,
    QSize,
    Qt,
    QTimer,
    pyqtSignal,
)
from PyQt6.QtGui import QColor, QFont, QPainter, QPalette, QPixmap
from PyQt6.QtWidgets import (
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QScrollArea,
    QSizePolicy,
    QVBoxLayout,
    QWidget,
)

logger = logging.getLogger(__name__)

# Import reliable design system components
from ui.components import ReliableApplicationCard
from ui.reliable_effects import get_animation_manager

logger.info("🎨 Reliable UI components loaded successfully")


# Use the reliable application card
ApplicationCard = ReliableApplicationCard


class ApplicationGridWidget(QWidget):
    """
    Responsive grid widget for displaying applications.
    """

    # Signals
    application_selected = pyqtSignal(object)  # app_data or None
    application_launched = pyqtSignal(str, str)  # app_id, app_title

    def __init__(self, tka_integration, parent=None):
        """Initialize the application grid."""
        super().__init__(parent)

        self.tka_integration = tka_integration
        self.applications = []
        self.filtered_applications = []
        self.selected_card = None

        # Set minimum size to ensure the widget takes up reasonable space
        self.setMinimumSize(400, 300)  # Minimum size to ensure visibility

        # Setup layout
        self._setup_layout()

        # Load applications
        self.refresh_applications()

        logger.info("✅ Application grid initialized")

    def _setup_layout(self):
        """Setup the grid layout."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)

        # Ensure this widget expands to fill available space
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)

        # Create modern scroll area with glassmorphism
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setHorizontalScrollBarPolicy(
            Qt.ScrollBarPolicy.ScrollBarAlwaysOff
        )

        # Ensure scroll area expands to fill available space
        self.scroll_area.setSizePolicy(
            QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding
        )

        # Apply modern glassmorphism styling (without unsupported CSS properties)
        self.scroll_area.setStyleSheet(
            """
            QScrollArea {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px;
            }
            QScrollBar:vertical {
                background: rgba(255, 255, 255, 0.05);
                width: 8px;
                border-radius: 4px;
                margin: 4px;
            }
            QScrollBar::handle:vertical {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                min-height: 24px;
            }
            QScrollBar::handle:vertical:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
                border: none;
                background: none;
            }
        """
        )

        # Create scroll widget with flow layout
        self.scroll_widget = QWidget()
        self.scroll_widget.setSizePolicy(
            QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding
        )
        self.scroll_widget.setStyleSheet(
            """
            QWidget {
                background-color: transparent;
            }
        """
        )

        # Use a simple grid layout instead of FlowLayout for now
        self.grid_layout = QGridLayout(self.scroll_widget)
        self.grid_layout.setContentsMargins(16, 16, 16, 16)  # 8px grid system
        self.grid_layout.setSpacing(16)  # 8px grid system

        self.scroll_area.setWidget(self.scroll_widget)
        layout.addWidget(self.scroll_area)

    def refresh_applications(self):
        """Refresh the application list from TKA integration."""
        try:
            logger.info("🔄 Refreshing application list...")

            # Get applications from TKA integration
            self.applications = self.tka_integration.get_applications()
            self.filtered_applications = self.applications.copy()

            # Update the grid display
            self._update_grid()

            logger.info(f"✅ Loaded {len(self.applications)} applications")

        except Exception as e:
            logger.error(f"❌ Failed to refresh applications: {e}")
            self.applications = []
            self.filtered_applications = []
            self._update_grid()

    def filter_applications(self, search_text: str):
        """Filter applications based on search text."""
        if not search_text:
            self.filtered_applications = self.applications.copy()
        else:
            search_lower = search_text.lower()
            self.filtered_applications = [
                app
                for app in self.applications
                if (
                    search_lower in app.title.lower()
                    or search_lower in app.description.lower()
                    or search_lower in app.category.value.lower()
                )
            ]

        self._update_grid()
        logger.info(f"🔍 Filtered to {len(self.filtered_applications)} applications")

    def _update_grid(self):
        """Update the grid display with current applications."""
        # Clear existing cards
        self._clear_grid()

        # Process pending deletion events to ensure clean slate
        from PyQt5.QtWidgets import QApplication

        QApplication.processEvents()

        # Calculate dynamic card width based on actual available width
        # Get the actual available width from the scroll area viewport
        scroll_viewport_width = self.scroll_area.viewport().width()

        # If viewport width is not available yet, use parent widget width
        if scroll_viewport_width <= 0:
            # Go up the widget hierarchy to get a reliable width
            parent_widget = self.parent()
            while parent_widget and parent_widget.width() <= 0:
                parent_widget = parent_widget.parent()
            widget_width = parent_widget.width() if parent_widget else 800
            # Account for the home interface margins (30 left + 30 right = 60)
            available_container_width = widget_width - 60
        else:
            available_container_width = scroll_viewport_width

        # Calculate space for 4 cards across
        flow_margins = 20  # Total left + right margins from flow layout (10+10)
        spacing_between_cards = 3 * 15  # 3 gaps between 4 cards (15px spacing each)
        available_width = (
            available_container_width - flow_margins - spacing_between_cards
        )

        # Calculate card width as 1/4 of available space
        card_width = max(
            150, available_width // 4
        )  # Minimum 150px to ensure readability

        # Scale height proportionally to width (maintain reasonable aspect ratio)
        card_height = max(
            140, int(card_width * 0.6)
        )  # Height is 60% of width, minimum 140px

        # Debug logging
        logger.info(
            f"🎯 Card sizing: container_width={available_container_width}, card_width={card_width}, card_height={card_height}"
        )

        # Add modern cards for filtered applications in a grid
        cards_per_row = 4  # Target 4 cards per row
        cards_created = []

        for i, app in enumerate(self.filtered_applications):
            card = ReliableApplicationCard(app, card_width, card_height)
            card.clicked.connect(self._on_card_selected)
            card.launch_requested.connect(self._on_launch_requested)

            # Calculate grid position
            row = i // cards_per_row
            col = i % cards_per_row
            self.grid_layout.addWidget(card, row, col)

            cards_created.append(card)

        # Temporarily disable animations to debug card visibility
        # if ENHANCED_UI_AVAILABLE and cards_created:
        #     self._animate_cards_entrance(cards_created)

        # Update scroll widget size
        self.scroll_widget.updateGeometry()

    def _animate_cards_entrance(self, cards):
        """Animate staggered entrance for cards."""
        try:
            animation_manager = get_animation_manager()
            # Animate cards with staggered delay
            for i, card in enumerate(cards):
                # Use reliable entrance animation
                delay = i * 50  # 50ms stagger delay
                QTimer.singleShot(
                    delay, lambda c=card: self._start_entrance_animation(c)
                )

            logger.info("🎬 Started staggered entrance for %d cards", len(cards))
        except Exception as e:
            logger.warning("Could not animate card entrance: %s", e)

    def _start_entrance_animation(self, card):
        """Start entrance animation for a single card."""
        animation_manager = get_animation_manager()
        entrance_anim = animation_manager.smooth_fade(card, fade_in=True)
        entrance_anim.start()

    def _clear_grid(self):
        """Clear all cards from the grid."""
        # Force immediate clearing of all widgets
        items_to_remove = []
        for i in range(self.grid_layout.count()):
            item = self.grid_layout.itemAt(i)
            if item and item.widget():
                items_to_remove.append(item.widget())

        # Remove and delete all widgets
        for widget in items_to_remove:
            self.grid_layout.removeWidget(widget)
            widget.setParent(None)
            widget.deleteLater()

        # Clear any remaining items
        while self.grid_layout.count():
            child = self.grid_layout.takeAt(0)
            if child and child.widget():
                child.widget().deleteLater()

        self.selected_card = None
        self.application_selected.emit(None)

    def _on_card_selected(self, app_data):
        """Handle card selection."""
        # Find the card that was clicked
        clicked_card = self.sender()

        # Prevent infinite recursion - check if this card is already selected
        if self.selected_card == clicked_card:
            return

        # Deselect previous card
        if self.selected_card:
            self.selected_card.set_selected(False)

        # Select new card
        self.selected_card = clicked_card
        self.selected_card.set_selected(True)

        # Emit selection signal
        self.application_selected.emit(app_data)

        logger.info(f"📱 Selected application: {app_data.title}")

    def _on_launch_requested(self, app_id: str):
        """Handle application launch request."""
        self.launch_application(app_id)

    def launch_application(self, app_id: str):
        """Launch an application by ID."""
        try:
            # Find the application
            app = next((app for app in self.applications if app.id == app_id), None)
            if not app:
                logger.error(f"❌ Application not found: {app_id}")
                return

            logger.info(f"🚀 Launching application: {app.title}")

            # Launch through TKA integration
            success = self.tka_integration.launch_application(app_id)

            if success:
                self.application_launched.emit(app_id, app.title)
                logger.info(f"✅ Successfully launched: {app.title}")
            else:
                logger.error(f"❌ Failed to launch: {app.title}")

        except Exception as e:
            logger.error(f"❌ Error launching application {app_id}: {e}")

    def get_selected_application(self):
        """Get the currently selected application data."""
        if self.selected_card:
            return self.selected_card.app_data
        return None

    def cleanup(self):
        """Cleanup resources."""
        logger.info("🧹 Cleaning up application grid...")
        self._clear_grid()

    def resizeEvent(self, event):
        """Handle resize events to update card sizes dynamically."""
        super().resizeEvent(event)
        # Update grid when widget is resized to recalculate card sizes
        if hasattr(self, "filtered_applications") and self.filtered_applications:
            self._update_grid()

    def showEvent(self, event):
        """Handle show event to ensure proper sizing."""
        super().showEvent(event)
        # Schedule a delayed update to ensure widget is properly sized
        QTimer.singleShot(100, self._update_grid)
        # Schedule size logging after everything is rendered
        QTimer.singleShot(500, self.log_component_sizes)

    def log_component_sizes(self):
        """Log the sizes of all components in the hierarchy to debug width constraints."""
        logger.info("🔍 ===== COMPONENT SIZE ANALYSIS =====")

        # Get main window (walk up the hierarchy)
        main_window = self
        while main_window.parent():
            main_window = main_window.parent()

        logger.info(
            f"1. Main Window: {main_window.size().width()}x{main_window.size().height()}"
        )

        # Find tab widget
        from PyQt5.QtWidgets import QTabWidget

        tab_widget = main_window.findChild(QTabWidget)

        if tab_widget:
            logger.info(
                f"2. Tab Widget: {tab_widget.size().width()}x{tab_widget.size().height()}"
            )

            # Get current widget (home interface)
            home_interface = tab_widget.currentWidget()
            if home_interface:
                logger.info(
                    f"3. Home Interface: {home_interface.size().width()}x{home_interface.size().height()}"
                )

        # ApplicationGridWidget (self)
        logger.info(
            f"4. ApplicationGridWidget: {self.size().width()}x{self.size().height()}"
        )

        # ScrollArea
        if hasattr(self, "scroll_area"):
            logger.info(
                f"5. ScrollArea: {self.scroll_area.size().width()}x{self.scroll_area.size().height()}"
            )
            logger.info(
                f"   ScrollArea viewport: {self.scroll_area.viewport().size().width()}x{self.scroll_area.viewport().size().height()}"
            )

        # Scroll Widget
        if hasattr(self, "scroll_widget"):
            logger.info(
                f"6. Scroll Widget: {self.scroll_widget.size().width()}x{self.scroll_widget.size().height()}"
            )

        # FlowLayout geometry
        if hasattr(self, "flow_layout"):
            rect = self.flow_layout.geometry()
            logger.info(f"7. FlowLayout: {rect.width()}x{rect.height()}")

        # Sample ApplicationCard if any exist
        if hasattr(self, "flow_layout") and self.flow_layout.count() > 0:
            first_card = self.flow_layout.itemAt(0).widget()
            if first_card:
                logger.info(
                    f"8. ApplicationCard (sample): {first_card.size().width()}x{first_card.size().height()}"
                )

        logger.info("🔍 ===== END SIZE ANALYSIS =====")
