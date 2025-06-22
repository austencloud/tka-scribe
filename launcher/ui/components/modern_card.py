#!/usr/bin/env python3
"""
Modern Application Card - Premium 2025 Component
===============================================

Enhanced application card with premium glassmorphism design and micro-interactions.
Implements cutting-edge 2025 design patterns:
- Advanced glassmorphism with dynamic blur
- Spring physics animations
- Magnetic hover effects
- Launch feedback animations
- Contextual shadows and lighting

Architecture:
- ModernApplicationCard: Main card component
- CardAnimationController: Animation orchestration
- CardStyleManager: Dynamic styling
- CardInteractionHandler: User interaction management
"""

import logging
from typing import Optional, Dict, Any
from PyQt6.QtWidgets import (
    QFrame,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QGraphicsBlurEffect,
    QGraphicsDropShadowEffect,
)
from PyQt6.QtCore import (
    Qt,
    pyqtSignal,
    QPropertyAnimation,
    QEasingCurve,
    QTimer,
    QPoint,
)
from PyQt6.QtGui import QFont, QColor, QPainter, QLinearGradient, QBrush

from .animation_mixins import (
    HoverAnimationMixin,
    FeedbackAnimationMixin,
    MagneticMixin,
    EntranceAnimationMixin,
)
from ..design_system import get_theme_manager, get_style_builder, AccentColor

logger = logging.getLogger(__name__)


class CardStyleManager:
    """Manages dynamic styling for application cards."""

    def __init__(self):
        self.theme_manager = get_theme_manager()
        self.style_builder = get_style_builder()
        self.current_state = "default"

    def get_card_style(self, state: str = "default") -> str:
        """Generate card CSS for different states."""
        theme = self.theme_manager.get_current_theme()

        if state == "hover":
            return f"""
                ModernApplicationCard {{
                    {self.style_builder.glassmorphism_surface('primary', hover=True)}
                    border-radius: {theme['radius']['xl']};
                    {self.style_builder.shadow('card_hover')}
                }}
            """
        elif state == "pressed":
            return f"""
                ModernApplicationCard {{
                    {self.style_builder.glassmorphism_surface('pressed')}
                    border-radius: {theme['radius']['xl']};
                    {self.style_builder.shadow('card_pressed')}
                }}
            """
        elif state == "selected":
            return f"""
                ModernApplicationCard {{
                    {self.style_builder.glassmorphism_surface('selected')}
                    border: 2px solid {theme['accent']['primary']};
                    border-radius: {theme['radius']['xl']};
                    {self.style_builder.shadow('glow')}
                }}
            """
        else:  # default
            return f"""
                ModernApplicationCard {{
                    {self.style_builder.glassmorphism_surface('primary')}
                    border-radius: {theme['radius']['xl']};
                    {self.style_builder.shadow('card')}
                }}
            """

    def get_button_style(self, variant: str = "primary") -> str:
        """Generate button CSS."""
        theme = self.theme_manager.get_current_theme()

        base_style = f"""
            QPushButton {{
                {self.style_builder.button_style(variant)}
                {self.style_builder.typography('sm', 'semibold')}
                border-radius: {theme['radius']['md']};
                padding: {theme['spacing']['sm']} {theme['spacing']['md']};
                {self.style_builder.shadow('button')}
            }}
            QPushButton:hover {{
                {self.style_builder.shadow('button_hover')}
            }}

        """

        return base_style

    def get_icon_style(self) -> str:
        """Generate icon container CSS."""
        theme = self.theme_manager.get_current_theme()

        return f"""
            QLabel {{
                {self.style_builder.glassmorphism_surface('secondary')}
                border-radius: {theme['radius']['md']};
                {self.style_builder.typography('lg', 'normal')}
                color: #ffffff;
            }}
        """

    def get_text_style(self, variant: str = "title") -> str:
        """Generate text CSS for different variants."""
        if variant == "title":
            return self.style_builder.typography("base", "semibold") + "color: #ffffff;"
        elif variant == "category":
            return (
                self.style_builder.typography("sm", "normal")
                + "color: rgba(255, 255, 255, 0.7);"
            )
        elif variant == "description":
            return (
                self.style_builder.typography("sm", "normal")
                + "color: rgba(255, 255, 255, 0.8);"
            )
        else:
            return (
                self.style_builder.typography("base", "normal")
                + "color: rgba(255, 255, 255, 0.9);"
            )


class ModernApplicationCard(
    QFrame,
    HoverAnimationMixin,
    FeedbackAnimationMixin,
    MagneticMixin,
    EntranceAnimationMixin,
):
    """
    Premium application card with advanced 2025 design patterns.

    Features:
    - Dynamic glassmorphism effects
    - Spring physics animations
    - Magnetic hover interactions
    - Launch feedback animations
    - Contextual shadows and lighting
    - Accessibility support
    """

    # Signals
    clicked = pyqtSignal(object)  # app_data
    launch_requested = pyqtSignal(str)  # app_id

    def __init__(self, app_data, card_width=280, card_height=140, parent=None):
        """Initialize the premium application card."""
        QFrame.__init__(self, parent)
        HoverAnimationMixin.__init__(self)
        FeedbackAnimationMixin.__init__(self)
        MagneticMixin.__init__(self)
        EntranceAnimationMixin.__init__(self)

        self.app_data = app_data
        self.is_selected = False
        self.card_width = card_width
        self.card_height = card_height

        # Style manager
        self.style_manager = CardStyleManager()

        # Card properties
        self.setFixedSize(self.card_width, self.card_height)
        self.setCursor(Qt.CursorShape.PointingHandCursor)

        # Setup components
        self._setup_layout()
        self._setup_styling()
        self._setup_animations()
        self._setup_effects()

        # Enable mouse tracking for magnetic effects
        self.setMouseTracking(True)

        logger.debug(f"🎨 Created premium card for: {app_data.title}")

    def _setup_layout(self):
        """Setup the card layout with premium spacing."""
        layout = QVBoxLayout(self)
        theme = self.style_manager.theme_manager.get_current_theme()

        layout.setContentsMargins(20, 16, 20, 16)
        layout.setSpacing(12)

        # Header with icon and title
        header_layout = QHBoxLayout()

        # Premium application icon
        self.icon_label = QLabel(self.app_data.icon)
        self.icon_label.setFixedSize(40, 40)
        self.icon_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.icon_label.setStyleSheet(self.style_manager.get_icon_style())
        header_layout.addWidget(self.icon_label)

        # Title and category
        title_layout = QVBoxLayout()
        title_layout.setSpacing(4)

        self.title_label = QLabel(self.app_data.title)
        self.title_label.setWordWrap(True)
        self.title_label.setStyleSheet(self.style_manager.get_text_style("title"))
        title_layout.addWidget(self.title_label)

        self.category_label = QLabel(self.app_data.category.value.title())
        self.category_label.setStyleSheet(self.style_manager.get_text_style("category"))
        title_layout.addWidget(self.category_label)

        header_layout.addLayout(title_layout)
        header_layout.addStretch()

        layout.addLayout(header_layout)

        # Description
        self.desc_label = QLabel(self.app_data.description)
        self.desc_label.setWordWrap(True)
        self.desc_label.setStyleSheet(self.style_manager.get_text_style("description"))
        layout.addWidget(self.desc_label)

        layout.addStretch()

        # Launch button
        self.launch_btn = QPushButton("Launch")
        self.launch_btn.setFixedHeight(36)
        self.launch_btn.setStyleSheet(self.style_manager.get_button_style("primary"))
        self.launch_btn.clicked.connect(self._on_launch_clicked)
        layout.addWidget(self.launch_btn)

    def _setup_styling(self):
        """Setup initial card styling."""
        self.setStyleSheet(self.style_manager.get_card_style("default"))

    def _setup_animations(self):
        """Setup all animation systems."""
        # Hover animations
        self.setup_hover_animations(self)

        # Magnetic effects
        self.setup_magnetic_effect(self)
        self.set_attraction_distance(60)  # Larger attraction zone

        # Theme change animations
        self.style_manager.theme_manager.theme_changed.connect(self._on_theme_changed)

    def _setup_effects(self):
        """Setup visual effects."""
        # Drop shadow effect - simplified to avoid deletion issues
        try:
            self.shadow_effect = QGraphicsDropShadowEffect()
            self.shadow_effect.setBlurRadius(20)
            self.shadow_effect.setColor(QColor(0, 0, 0, 30))
            self.shadow_effect.setOffset(0, 8)
            self.setGraphicsEffect(self.shadow_effect)
        except Exception as e:
            logger.warning(f"Could not apply shadow effect: {e}")
            self.shadow_effect = None

    def _on_launch_clicked(self):
        """Handle launch button click with feedback animation."""
        logger.info(f"🚀 Launch button clicked: {self.app_data.title}")

        # Animate button press
        self.animate_button_press(self.launch_btn)

        # Animate launch pulse on card
        QTimer.singleShot(100, lambda: self.animate_launch_pulse(self))

        # Emit signal
        self.launch_requested.emit(self.app_data.id)

    def _on_theme_changed(self, new_theme: Dict[str, Any]):
        """Handle theme changes."""
        self._setup_styling()
        logger.debug(f"🎨 Card theme updated for: {self.app_data.title}")

    def set_selected(self, selected: bool):
        """Set the card selection state with animation."""
        if self.is_selected == selected:
            return

        self.is_selected = selected

        if selected:
            self.setStyleSheet(self.style_manager.get_card_style("selected"))
            # Add selection glow animation
            self._animate_selection_glow()
        else:
            self.setStyleSheet(self.style_manager.get_card_style("default"))

    def _animate_selection_glow(self):
        """Animate selection glow effect."""
        # This would be enhanced with custom painting for glow effects
        pass

    def enterEvent(self, event):
        """Handle mouse enter with premium animations."""
        super().enterEvent(event)
        self.setStyleSheet(self.style_manager.get_card_style("hover"))

        # Safely animate hover
        if hasattr(self, "animate_hover_enter"):
            try:
                self.animate_hover_enter(self)
            except Exception as e:
                logger.debug(f"Hover animation error: {e}")

        # Update shadow for hover state - safely
        if self.shadow_effect:
            try:
                self.shadow_effect.setBlurRadius(30)
                self.shadow_effect.setOffset(0, 12)
            except Exception as e:
                logger.debug(f"Shadow effect error: {e}")

    def leaveEvent(self, event):
        """Handle mouse leave with smooth transitions."""
        super().leaveEvent(event)

        if not self.is_selected:
            self.setStyleSheet(self.style_manager.get_card_style("default"))

        # Safely animate hover leave
        if hasattr(self, "animate_hover_leave"):
            try:
                self.animate_hover_leave(self)
            except Exception as e:
                logger.debug(f"Hover animation error: {e}")

        # Reset shadow - safely
        if self.shadow_effect:
            try:
                self.shadow_effect.setBlurRadius(20)
                self.shadow_effect.setOffset(0, 8)
            except Exception as e:
                logger.debug(f"Shadow effect error: {e}")

    def mousePressEvent(self, event):
        """Handle mouse press with feedback."""
        if event.button() == Qt.MouseButton.LeftButton:
            self.setStyleSheet(self.style_manager.get_card_style("pressed"))
            self.clicked.emit(self.app_data)

    def mouseReleaseEvent(self, event):
        """Handle mouse release."""
        if self.is_selected:
            self.setStyleSheet(self.style_manager.get_card_style("selected"))
        else:
            self.setStyleSheet(self.style_manager.get_card_style("hover"))

    def mouseMoveEvent(self, event):
        """Handle mouse movement for magnetic effects."""
        super().mouseMoveEvent(event)

        # Update magnetic position
        global_pos = self.mapToGlobal(event.pos())
        self.update_magnetic_position(self, global_pos)

    def animate_entrance(self, delay: int = 0):
        """Animate card entrance with staggered effect."""
        entrance_anim = self.create_entrance_animation(self, delay, "fade_slide")
        entrance_anim.start()

        logger.debug(f"🎬 Card entrance animation started: {self.app_data.title}")

    def cleanup(self):
        """Cleanup resources and animations."""
        self.stop_all_animations()
        logger.debug(f"🧹 Card cleanup completed: {self.app_data.title}")
