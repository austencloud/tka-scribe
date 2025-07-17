"""
Glassmorphism Generate Panel - 2025 Modern Design
================================================

Complete redesign of the Generate tab with modern glassmorphism aesthetics.
Features floating glass cards, depth through transparency, and elegant interactions.
"""

from typing import Optional

from core.interfaces.generation_services import GenerationMode
from domain.models.generation_models import (
    GenerationConfig,
    GenerationResult,
    GenerationState,
)
from PyQt6.QtCore import Qt, pyqtSignal, QEasingCurve, QPropertyAnimation, QRect
from PyQt6.QtGui import QFont, QPainter, QBrush, QColor
from PyQt6.QtWidgets import (
    QFrame,
    QGraphicsDropShadowEffect,
    QHBoxLayout,
    QLabel,
    QProgressBar,
    QPushButton,
    QScrollArea,
    QTextEdit,
    QVBoxLayout,
    QWidget,
)

from .generation_controls import (
    ModernCAPTypeSelector,
    ModernGenerationModeToggle,
    ModernLengthSelector,
    ModernLetterTypeSelector,
    ModernLevelSelector,
    ModernPropContinuityToggle,
    ModernSliceSizeSelector,
    ModernTurnIntensitySelector,
)


class GlassCard(QWidget):
    """
    Base glass card component with glassmorphism styling.
    Features translucent background, subtle blur, and hover effects.
    """

    def __init__(self, parent: Optional[QWidget] = None, opacity_base: float = 0.15):
        super().__init__(parent)
        self.opacity_base = opacity_base
        self.opacity_hover = opacity_base + 0.1
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)

        # Add subtle drop shadow for depth
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(20)
        shadow.setOffset(0, 8)
        shadow.setColor(QColor(0, 0, 0, 40))
        self.setGraphicsEffect(shadow)

        self.setStyleSheet(self._get_glass_style())

    def _get_glass_style(self):
        return f"""
            QWidget {{
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(255, 255, 255, {self.opacity_base}),
                    stop:1 rgba(255, 255, 255, {self.opacity_base * 0.6}));
                border: 1px solid rgba(255, 255, 255, 0.25);
                border-radius: 20px;
                padding: 24px;
            }}
            QWidget:hover {{
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(255, 255, 255, {self.opacity_hover}),
                    stop:1 rgba(255, 255, 255, {self.opacity_hover * 0.6}));
                border: 1px solid rgba(255, 255, 255, 0.35);
            }}
        """


class GlassMorphicButton(QPushButton):
    """
    Glassmorphic button with subtle glass effects and smooth animations.
    """

    def __init__(
        self, text: str, primary: bool = False, parent: Optional[QWidget] = None
    ):
        super().__init__(text, parent)
        self.primary = primary
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setMinimumHeight(56)
        self.setFont(QFont("Inter", 12, QFont.Weight.Medium))

        # Add subtle shadow
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(15)
        shadow.setOffset(0, 4)
        shadow.setColor(QColor(0, 0, 0, 30))
        self.setGraphicsEffect(shadow)

        self.setStyleSheet(self._get_button_style())

    def _get_button_style(self):
        if self.primary:
            return """
                QPushButton {
                    background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                        stop:0 rgba(100, 200, 255, 0.9),
                        stop:1 rgba(50, 150, 255, 0.8));
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 16px;
                    padding: 12px 32px;
                    font-weight: 500;
                    font-size: 14px;
                }
                QPushButton:hover {
                    background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                        stop:0 rgba(120, 220, 255, 0.95),
                        stop:1 rgba(70, 170, 255, 0.85));
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    transform: translateY(-2px);
                }
                QPushButton:pressed {
                    background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                        stop:0 rgba(80, 180, 255, 0.85),
                        stop:1 rgba(30, 130, 255, 0.75));
                    transform: translateY(0px);
                }
                QPushButton:disabled {
                    background: rgba(100, 100, 100, 0.3);
                    color: rgba(255, 255, 255, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
            """
        else:
            return """
                QPushButton {
                    background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                        stop:0 rgba(255, 255, 255, 0.2),
                        stop:1 rgba(255, 255, 255, 0.1));
                    color: rgba(255, 255, 255, 0.9);
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    border-radius: 16px;
                    padding: 12px 32px;
                    font-weight: 500;
                    font-size: 14px;
                }
                QPushButton:hover {
                    background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                        stop:0 rgba(255, 255, 255, 0.3),
                        stop:1 rgba(255, 255, 255, 0.15));
                    border: 1px solid rgba(255, 255, 255, 0.35);
                    transform: translateY(-2px);
                }
                QPushButton:pressed {
                    background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                        stop:0 rgba(255, 255, 255, 0.15),
                        stop:1 rgba(255, 255, 255, 0.08));
                    transform: translateY(0px);
                }
            """


class GeneratePanel(QWidget):
    """
    Complete redesign of Generate Panel with 2025 glassmorphism aesthetics.

    Features:
    - Floating glass cards instead of bordered frames
    - Depth through transparency and blur
    - Elegant hover interactions
    - Minimal visual clutter
    - Modern spacing and typography
    """

    generate_requested = pyqtSignal(GenerationConfig)
    auto_complete_requested = pyqtSignal()
    config_changed = pyqtSignal(GenerationConfig)

    def __init__(self, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self._current_config = GenerationConfig()
        self._current_state = GenerationState(config=self._current_config)
        self._setup_ui()
        self._connect_signals()
        self._apply_glassmorphism_theme()

    def _setup_ui(self):
        # Main layout with generous spacing for breathing room
        layout = QVBoxLayout(self)
        layout.setContentsMargins(32, 32, 32, 32)
        layout.setSpacing(24)

        # Header
        self._setup_header(layout)

        # Controls scroll area
        self._setup_controls_area(layout)

        # Action buttons
        self._setup_action_buttons(layout)

        # Status area
        self._setup_status_area(layout)

    def _setup_header(self, layout: QVBoxLayout):
        """Create floating header with glassmorphic styling."""
        header_card = GlassCard(opacity_base=0.1)
        header_layout = QVBoxLayout(header_card)

        header = QLabel("Generate Sequence")
        header_font = QFont("Inter", 24, QFont.Weight.Bold)
        header.setFont(header_font)
        header.setAlignment(Qt.AlignmentFlag.AlignCenter)
        header.setStyleSheet(
            """
            QLabel {
                color: rgba(255, 255, 255, 0.95);
                padding: 12px;
                background: transparent;
                border: none;
            }
        """
        )

        subtitle = QLabel("Configure your kinetic sequence generation")
        subtitle_font = QFont("Inter", 12, QFont.Weight.Normal)
        subtitle.setFont(subtitle_font)
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        subtitle.setStyleSheet(
            """
            QLabel {
                color: rgba(255, 255, 255, 0.7);
                padding: 4px;
                background: transparent;
                border: none;
            }
        """
        )

        header_layout.addWidget(header)
        header_layout.addWidget(subtitle)
        layout.addWidget(header_card)

    def _setup_controls_area(self, layout: QVBoxLayout):
        """Create floating controls area with glassmorphic cards."""
        # Remove traditional scroll area frame, use transparent background
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        scroll_area.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        scroll_area.setFrameShape(QFrame.Shape.NoFrame)
        scroll_area.setStyleSheet(
            """
            QScrollArea {
                background: transparent;
                border: none;
            }
            QScrollBar:vertical {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 6px;
                width: 12px;
            }
            QScrollBar::handle:vertical {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 6px;
                min-height: 20px;
            }
            QScrollBar::handle:vertical:hover {
                background: rgba(255, 255, 255, 0.4);
            }
        """
        )

        controls_widget = QWidget()
        controls_widget.setStyleSheet("background: transparent;")
        controls_layout = QVBoxLayout(controls_widget)
        controls_layout.setSpacing(20)

        # Generation mode toggle in its own glass card
        mode_card = GlassCard(opacity_base=0.12)
        mode_layout = QVBoxLayout(mode_card)
        self._mode_toggle = ModernGenerationModeToggle()
        mode_layout.addWidget(self._mode_toggle)
        controls_layout.addWidget(mode_card)

        # Basic parameters in glass card
        self._setup_basic_parameters_glass(controls_layout)

        # Mode-specific controls
        self._setup_mode_specific_controls_glass(controls_layout)

        controls_layout.addStretch()
        scroll_area.setWidget(controls_widget)
        layout.addWidget(scroll_area, 1)

    def _setup_basic_parameters_glass(self, layout: QVBoxLayout):
        """Setup basic parameters in glassmorphic card."""
        basic_card = GlassCard(opacity_base=0.12)
        basic_layout = QVBoxLayout(basic_card)
        basic_layout.setSpacing(16)

        # Card title
        title = QLabel("Generation Parameters")
        title.setFont(QFont("Inter", 14, QFont.Weight.Medium))
        title.setStyleSheet(
            """
            QLabel {
                color: rgba(255, 255, 255, 0.9);
                padding: 0px 0px 8px 0px;
                background: transparent;
                border: none;
            }
        """
        )
        basic_layout.addWidget(title)

        # Basic controls with glassmorphic styling
        self._length_selector = ModernLengthSelector()
        self._level_selector = ModernLevelSelector()
        self._turn_intensity_selector = ModernTurnIntensitySelector()
        self._prop_continuity_toggle = ModernPropContinuityToggle()

        basic_layout.addWidget(self._length_selector)
        basic_layout.addWidget(self._level_selector)
        basic_layout.addWidget(self._turn_intensity_selector)
        basic_layout.addWidget(self._prop_continuity_toggle)

        layout.addWidget(basic_card)

    def _setup_mode_specific_controls_glass(self, layout: QVBoxLayout):
        """Setup mode-specific controls in glassmorphic cards."""
        # Container for mode-specific controls
        self._mode_specific_layout = QVBoxLayout()
        self._mode_specific_layout.setSpacing(20)

        # Freeform controls
        self._setup_freeform_controls_glass()

        # Circular controls
        self._setup_circular_controls_glass()

        layout.addLayout(self._mode_specific_layout)

    def _setup_freeform_controls_glass(self):
        """Setup freeform controls in glass card."""
        self._freeform_controls = GlassCard(opacity_base=0.12)
        freeform_layout = QVBoxLayout(self._freeform_controls)
        freeform_layout.setSpacing(16)

        title = QLabel("Freeform Options")
        title.setFont(QFont("Inter", 14, QFont.Weight.Medium))
        title.setStyleSheet(
            """
            QLabel {
                color: rgba(255, 255, 255, 0.9);
                padding: 0px 0px 8px 0px;
                background: transparent;
                border: none;
            }
        """
        )
        freeform_layout.addWidget(title)

        # Letter type selector
        self._letter_type_selector = ModernLetterTypeSelector()
        freeform_layout.addWidget(self._letter_type_selector)

        self._mode_specific_layout.addWidget(self._freeform_controls)

    def _setup_circular_controls_glass(self):
        """Setup circular controls in glass card."""
        self._circular_controls = GlassCard(opacity_base=0.12)
        circular_layout = QVBoxLayout(self._circular_controls)
        circular_layout.setSpacing(16)

        title = QLabel("Circular Options")
        title.setFont(QFont("Inter", 14, QFont.Weight.Medium))
        title.setStyleSheet(
            """
            QLabel {
                color: rgba(255, 255, 255, 0.9);
                padding: 0px 0px 8px 0px;
                background: transparent;
                border: none;
            }
        """
        )
        circular_layout.addWidget(title)

        # Slice size selector
        self._slice_size_selector = ModernSliceSizeSelector()
        circular_layout.addWidget(self._slice_size_selector)

        # CAP type selector
        self._cap_type_selector = ModernCAPTypeSelector()
        circular_layout.addWidget(self._cap_type_selector)

        self._mode_specific_layout.addWidget(self._circular_controls)

        # Initially hide circular controls
        self._circular_controls.hide()

    def _setup_action_buttons(self, layout: QVBoxLayout):
        """Setup floating action buttons with glassmorphic styling."""
        button_card = GlassCard(opacity_base=0.1)
        button_layout = QHBoxLayout(button_card)
        button_layout.setSpacing(16)

        self._auto_complete_button = GlassMorphicButton("Auto Complete", primary=False)
        self._generate_button = GlassMorphicButton(
            "Generate New Sequence", primary=True
        )

        button_layout.addWidget(self._auto_complete_button)
        button_layout.addWidget(self._generate_button)

        layout.addWidget(button_card)

    def _setup_status_area(self, layout: QVBoxLayout):
        """Setup status area with glassmorphic styling."""
        self._status_frame = GlassCard(opacity_base=0.1)
        status_layout = QVBoxLayout(self._status_frame)

        self._progress_bar = QProgressBar()
        self._progress_bar.setStyleSheet(
            """
            QProgressBar {
                border: none;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.1);
                text-align: center;
                color: rgba(255, 255, 255, 0.9);
                font-weight: 500;
                height: 24px;
            }
            QProgressBar::chunk {
                border-radius: 8px;
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 rgba(100, 200, 255, 0.8),
                    stop:1 rgba(50, 150, 255, 0.9));
            }
        """
        )
        self._progress_bar.hide()

        self._status_text = QTextEdit()
        self._status_text.setMaximumHeight(120)
        self._status_text.setReadOnly(True)
        self._status_text.setStyleSheet(
            """
            QTextEdit {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 12px;
                color: rgba(255, 255, 255, 0.9);
                padding: 12px;
                font-family: "Inter";
                font-size: 12px;
                selection-background-color: rgba(100, 200, 255, 0.3);
            }
        """
        )
        self._status_text.hide()

        status_layout.addWidget(self._progress_bar)
        status_layout.addWidget(self._status_text)

        layout.addWidget(self._status_frame)
        self._status_frame.hide()

    def _connect_signals(self):
        """Connect all UI signals (unchanged from original)."""
        # Mode change
        self._mode_toggle.mode_changed.connect(self._on_mode_changed)

        # Parameter changes
        self._length_selector.value_changed.connect(
            lambda v: self._update_config(length=v)
        )
        self._level_selector.value_changed.connect(
            lambda v: self._update_config(level=v)
        )
        self._turn_intensity_selector.value_changed.connect(
            lambda v: self._update_config(turn_intensity=v)
        )
        self._prop_continuity_toggle.value_changed.connect(
            lambda v: self._update_config(prop_continuity=v)
        )

        # Freeform controls
        self._letter_type_selector.value_changed.connect(
            lambda v: self._update_config(letter_types=v)
        )

        # Circular controls
        self._slice_size_selector.value_changed.connect(
            lambda v: self._update_config(slice_size=v)
        )
        self._cap_type_selector.value_changed.connect(
            lambda v: self._update_config(cap_type=v)
        )

        # Action buttons
        self._generate_button.clicked.connect(self._on_generate_clicked)
        self._auto_complete_button.clicked.connect(self._on_auto_complete_clicked)

    def _apply_glassmorphism_theme(self):
        """Apply overall glassmorphism theme to the panel."""
        self.setStyleSheet(
            """
            QWidget {
                background: transparent;
                color: rgba(255, 255, 255, 0.9);
                font-family: "Inter", "Segoe UI", sans-serif;
            }
            
            /* Make the entire panel have a subtle glass background */
            GeneratePanel {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(15, 15, 25, 0.95),
                    stop:0.5 rgba(25, 25, 40, 0.90),
                    stop:1 rgba(35, 35, 55, 0.95));
            }
        """
        )

    def _on_mode_changed(self, mode: GenerationMode):
        """Handle mode change (unchanged from original)."""
        self._update_config(mode=mode)

        # Show/hide mode-specific controls with smooth transition
        is_freeform = mode == GenerationMode.FREEFORM
        self._freeform_controls.setVisible(is_freeform)
        self._circular_controls.setVisible(not is_freeform)

    def _update_config(self, **kwargs):
        """Update configuration (unchanged from original)."""
        try:
            self._current_config = self._current_config.with_updates(**kwargs)
            self._current_state = self._current_state.with_config(self._current_config)
            self.config_changed.emit(self._current_config)
        except Exception as e:
            self._show_error(f"Configuration error: {e}")

    def _on_generate_clicked(self):
        """Handle generate button click (unchanged from original)."""
        if self._current_state.is_generating:
            return

        self._current_state = self._current_state.start_generation()
        self._update_ui_for_generation_state()
        self.generate_requested.emit(self._current_config)

    def _on_auto_complete_clicked(self):
        """Handle auto complete button click (unchanged from original)."""
        if self._current_state.is_generating:
            return

        self.auto_complete_requested.emit()

    def _update_ui_for_generation_state(self):
        """Update UI for generation state (unchanged from original)."""
        is_generating = self._current_state.is_generating

        self._generate_button.setEnabled(not is_generating)
        self._auto_complete_button.setEnabled(not is_generating)

        if is_generating:
            self._show_progress("Generating sequence...")
        else:
            self._hide_progress()

    def _show_progress(self, message: str):
        """Show progress with glassmorphic styling."""
        self._status_frame.show()
        self._progress_bar.show()
        self._progress_bar.setRange(0, 0)  # Indeterminate
        self._status_text.show()
        self._status_text.setText(message)
        self._status_text.setStyleSheet(
            self._status_text.styleSheet()
            + """
            QTextEdit { color: rgba(100, 200, 255, 0.9); }
        """
        )

    def _hide_progress(self):
        """Hide progress (unchanged from original)."""
        self._progress_bar.hide()
        self._status_text.hide()
        self._status_frame.hide()

    def _show_error(self, message: str):
        """Show error with glassmorphic styling."""
        self._status_frame.show()
        self._status_text.show()
        self._status_text.setText(f"Error: {message}")
        self._status_text.setStyleSheet(
            self._status_text.styleSheet()
            + """
            QTextEdit { color: rgba(255, 100, 100, 0.9); }
        """
        )

    def set_state(self, state: GenerationState):
        """Set panel state (unchanged from original)."""
        self._current_state = state
        self._current_config = state.config
        self._update_controls_from_config()
        self._update_ui_for_generation_state()

    def set_generation_result(self, result: GenerationResult):
        """Set generation result (unchanged from original)."""
        self._current_state = self._current_state.with_result(result)
        self._update_ui_for_generation_state()

        if result.success:
            self._status_text.setText("Generation completed successfully!")
            self._status_text.setStyleSheet(
                self._status_text.styleSheet()
                + """
                QTextEdit { color: rgba(100, 255, 100, 0.9); }
            """
            )
        else:
            self._show_error(result.error_message or "Generation failed")

    def _update_controls_from_config(self):
        """Update controls from config (unchanged from original)."""
        # Update all controls to reflect current config
        self._mode_toggle.set_mode(self._current_config.mode)
        self._length_selector.set_value(self._current_config.length)
        self._level_selector.set_value(self._current_config.level)
        self._turn_intensity_selector.set_value(self._current_config.turn_intensity)
        self._prop_continuity_toggle.set_value(self._current_config.prop_continuity)

        if self._current_config.letter_types:
            self._letter_type_selector.set_value(self._current_config.letter_types)

        self._slice_size_selector.set_value(self._current_config.slice_size)
        if self._current_config.cap_type:
            self._cap_type_selector.set_value(self._current_config.cap_type)
