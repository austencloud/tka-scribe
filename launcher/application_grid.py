#!/usr/bin/env python3
"""
Application Grid Widget - Modern Application Display
===================================================

A responsive grid widget for displaying TKA applications with:
- Premium glassmorphism card design
- Smooth QPropertyAnimation-based hover effects
- Search filtering with modern UI
- Category organization
- Launch functionality with micro-interactions

Architecture:
- Custom FlowLayout for responsive grid
- Modern application cards with glassmorphism
- Integrated with TKA services
- Pure PyQt6 implementation
"""

import logging
from typing import List, Optional
from PyQt6.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QScrollArea,
    QFrame,
    QPushButton,
    QGridLayout,
    QSizePolicy,
)
from PyQt6.QtCore import Qt, pyqtSignal, QPropertyAnimation, QEasingCurve, QRect, QSize
from PyQt6.QtGui import QFont, QPixmap, QPainter, QColor, QPalette

logger = logging.getLogger(__name__)


# Custom FlowLayout for responsive grid
class FlowLayout(QVBoxLayout):
    """Simple flow layout implementation for responsive grid."""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setSpacing(16)  # 8px grid system
        self.setContentsMargins(16, 16, 16, 16)


class ModernApplicationCard(QFrame):
    """
    Modern application card with glassmorphism effects and smooth animations.
    """

    # Signals
    clicked = pyqtSignal(object)  # app_data
    launch_requested = pyqtSignal(str)  # app_id

    def __init__(self, app_data, card_width=280, card_height=140, parent=None):
        """Initialize the modern application card with glassmorphism styling."""
        super().__init__(parent)

        self.app_data = app_data
        self.is_selected = False
        self.card_width = card_width
        self.card_height = card_height

        # Card properties - dynamic width and height
        self.setFixedSize(self.card_width, self.card_height)
        self.setCursor(Qt.CursorShape.PointingHandCursor)

        # Apply premium glassmorphism styling with advanced effects
        self.setStyleSheet(
            """
            ModernApplicationCard {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(255, 255, 255, 0.12),
                    stop:0.5 rgba(255, 255, 255, 0.08),
                    stop:1 rgba(255, 255, 255, 0.04));
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 20px;
                /* Enhanced shadow for depth */
            }
            ModernApplicationCard:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(255, 255, 255, 0.18),
                    stop:0.5 rgba(255, 255, 255, 0.14),
                    stop:1 rgba(255, 255, 255, 0.08));
                border: 1px solid rgba(255, 255, 255, 0.25);
                /* Hover glow effect */
            }
        """
        )

        # Setup layout and content
        self._setup_modern_layout()
        self._setup_hover_animations()

        # Signals are connected in the parent grid widget

    def _setup_modern_layout(self):
        """Setup the modern card layout with glassmorphism styling."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 16, 20, 16)  # 8px grid system
        layout.setSpacing(12)

        # Header with icon and title
        header_layout = QHBoxLayout()

        # Premium application icon with enhanced glassmorphism
        self.icon_label = QLabel(self.app_data.icon)
        self.icon_label.setFixedSize(40, 40)  # Larger for better visual impact
        self.icon_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.icon_label.setStyleSheet(
            """
            QLabel {
                font-size: 24px;
                color: #ffffff;
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(255, 255, 255, 0.15),
                    stop:1 rgba(255, 255, 255, 0.08));
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
            }
        """
        )
        header_layout.addWidget(self.icon_label)

        # Title and category with modern typography
        title_layout = QVBoxLayout()
        title_layout.setSpacing(4)

        self.title_label = QLabel(self.app_data.title)
        self.title_label.setWordWrap(True)
        self.title_label.setStyleSheet(
            """
            QLabel {
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                font-weight: 600;
                color: #ffffff;
            }
        """
        )
        title_layout.addWidget(self.title_label)

        self.category_label = QLabel(self.app_data.category.value.title())
        self.category_label.setStyleSheet(
            """
            QLabel {
                font-family: 'Inter', sans-serif;
                font-size: 12px;
                font-weight: 400;
                color: rgba(255, 255, 255, 0.7);
            }
        """
        )
        title_layout.addWidget(self.category_label)

        header_layout.addLayout(title_layout)
        header_layout.addStretch()

        layout.addLayout(header_layout)

        # Description with modern typography
        self.desc_label = QLabel(self.app_data.description)
        self.desc_label.setWordWrap(True)
        self.desc_label.setStyleSheet(
            """
            QLabel {
                font-family: 'Inter', sans-serif;
                font-size: 12px;
                font-weight: 400;
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.4;
            }
        """
        )
        layout.addWidget(self.desc_label)

        layout.addStretch()

        # Premium launch button with enhanced styling
        self.launch_btn = QPushButton("Launch")
        self.launch_btn.setFixedHeight(36)  # Slightly taller for better touch target
        self.launch_btn.setStyleSheet(
            """
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(59, 130, 246, 0.9),
                    stop:0.5 rgba(37, 99, 235, 0.85),
                    stop:1 rgba(29, 78, 216, 0.8));
                border: 1px solid rgba(255, 255, 255, 0.25);
                border-radius: 10px;
                font-family: 'Inter', sans-serif;
                font-size: 13px;
                font-weight: 600;
                color: #ffffff;
                padding: 0 16px;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(59, 130, 246, 1.0),
                    stop:0.5 rgba(37, 99, 235, 0.95),
                    stop:1 rgba(29, 78, 216, 0.9));
                border: 1px solid rgba(255, 255, 255, 0.35);
            }
            QPushButton:pressed {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(29, 78, 216, 0.95),
                    stop:1 rgba(21, 59, 184, 0.9));
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
        """
        )
        self.launch_btn.clicked.connect(self._on_launch_clicked)
        layout.addWidget(self.launch_btn)

    def _setup_hover_animations(self):
        """Setup modern hover animations."""
        # Scale animation for smooth hover effect
        self.scale_animation = QPropertyAnimation(self, b"geometry")
        self.scale_animation.setDuration(300)  # Smooth 300ms animation
        self.scale_animation.setEasingCurve(QEasingCurve.Type.OutCubic)

    def _on_launch_clicked(self):
        """Handle launch button click."""
        logger.info(f"🚀 Application card launch button clicked: {self.app_data.title}")
        self.launch_requested.emit(self.app_data.id)

    def set_selected(self, selected: bool):
        """Set the card selection state."""
        self.is_selected = selected
        self.update()  # Trigger repaint

    def enterEvent(self, event):
        """Handle mouse enter event with smooth animation."""
        super().enterEvent(event)
        # Trigger hover animation
        self._animate_hover(True)

    def leaveEvent(self, event):
        """Handle mouse leave event with smooth animation."""
        super().leaveEvent(event)
        # Trigger hover animation
        self._animate_hover(False)

    def mousePressEvent(self, event):
        """Handle mouse press event."""
        if event.button() == Qt.MouseButton.LeftButton:
            # Emit our custom clicked signal with app_data
            self.clicked.emit(self.app_data)

    def mouseReleaseEvent(self, event):
        """Handle mouse release event."""
        # Custom implementation for modern card
        pass

    def _animate_hover(self, hover_in: bool):
        """Animate hover effect."""
        if hover_in:
            # Subtle scale up on hover
            current_rect = self.geometry()
            new_rect = QRect(
                current_rect.x() - 2,
                current_rect.y() - 2,
                current_rect.width() + 4,
                current_rect.height() + 4,
            )
            self.scale_animation.setStartValue(current_rect)
            self.scale_animation.setEndValue(new_rect)
        else:
            # Scale back to normal
            current_rect = self.geometry()
            normal_rect = QRect(
                current_rect.x() + 2,
                current_rect.y() + 2,
                current_rect.width() - 4,
                current_rect.height() - 4,
            )
            self.scale_animation.setStartValue(current_rect)
            self.scale_animation.setEndValue(normal_rect)

        self.scale_animation.start()


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
        for i, app in enumerate(self.filtered_applications):
            card = ModernApplicationCard(app, card_width, card_height)
            card.clicked.connect(self._on_card_selected)
            card.launch_requested.connect(self._on_launch_requested)

            # Calculate grid position
            row = i // cards_per_row
            col = i % cards_per_row
            self.grid_layout.addWidget(card, row, col)

        # Update scroll widget size
        self.scroll_widget.updateGeometry()

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
        from PyQt5.QtCore import QTimer

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
