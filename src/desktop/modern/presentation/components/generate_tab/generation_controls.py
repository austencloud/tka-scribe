"""
Modern generation control components for Modern Generate Tab.

These components provide clean, modern UI controls for sequence generation
parameters, with minimal styling that works well in glassmorphic containers.
"""

from typing import Optional, Set

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont
from PyQt6.QtWidgets import (
    QButtonGroup,
    QCheckBox,
    QComboBox,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QSizePolicy,
    QSlider,
    QSpinBox,
    QVBoxLayout,
    QWidget,
)

from desktop.modern.core.interfaces.generation_services import (
    CAPType,
    GenerationMode,
    LetterType,
    PropContinuity,
    SliceSize,
)


class ModernControlBase(QWidget):
    """Base class for modern generation controls with minimal styling"""

    def __init__(
        self,
        title: str,
        description: str = "",
        center_title: bool = False,
        parent: Optional[QWidget] = None,
    ):
        super().__init__(parent)
        self._title = title
        self._description = description
        self._center_title = center_title
        self._setup_base_ui()

    def _setup_base_ui(self):
        """Setup the base UI structure with minimal styling"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(8, 8, 8, 8)
        layout.setSpacing(6)

        # Title with clean styling
        title_label = QLabel(self._title)
        title_font = QFont("Segoe UI", 10, QFont.Weight.Medium)
        title_label.setFont(title_font)

        # Center title if requested
        if self._center_title:
            title_label.setAlignment(Qt.AlignmentFlag.AlignCenter)

        title_label.setStyleSheet(
            """
            QLabel {
                color: rgba(255, 255, 255, 0.9);
                padding: 0px;
                background: transparent;
                border: none;
            }
        """
        )
        layout.addWidget(title_label)

        # Description (if provided) with subtle styling
        if self._description:
            desc_label = QLabel(self._description)
            desc_label.setFont(QFont("Segoe UI", 8))
            desc_label.setStyleSheet(
                """
                QLabel {
                    color: rgba(255, 255, 255, 0.6);
                    padding: 0px;
                    background: transparent;
                    border: none;
                }
            """
            )
            desc_label.setWordWrap(True)
            layout.addWidget(desc_label)

        # Content area (to be filled by subclasses)
        self._content_layout = QVBoxLayout()
        self._content_layout.setContentsMargins(0, 4, 0, 0)
        layout.addWidget(self._create_content_widget())

        # Remove background and borders for clean look
        self.setStyleSheet(
            """
            ModernControlBase {
                background: transparent;
                border: none;
            }
        """
        )

    def _create_content_widget(self) -> QWidget:
        """Create the content widget (override in subclasses)"""
        content_widget = QWidget()
        content_widget.setLayout(self._content_layout)
        content_widget.setStyleSheet("background: transparent;")
        return content_widget


class ModernGenerationModeToggle(ModernControlBase):
    """Toggle between freeform and circular generation modes"""

    mode_changed = pyqtSignal(GenerationMode)

    def __init__(self, parent: Optional[QWidget] = None):
        super().__init__(
            "Generation Mode",
            "Choose between freeform or circular sequence generation",
            parent,
        )
        self._current_mode = GenerationMode.FREEFORM
        self._setup_controls()

    def _setup_controls(self):
        """Setup the mode toggle controls"""
        button_layout = QHBoxLayout()
        button_layout.setSpacing(8)

        # Create button group for exclusive selection
        self._button_group = QButtonGroup(self)

        # Freeform button
        self._freeform_button = QPushButton("Freeform")
        self._freeform_button.setCheckable(True)
        self._freeform_button.setChecked(True)
        self._freeform_button.setMinimumHeight(32)
        self._freeform_button.setCursor(Qt.CursorShape.PointingHandCursor)
        self._button_group.addButton(self._freeform_button, 0)
        button_layout.addWidget(self._freeform_button)

        # Circular button
        self._circular_button = QPushButton("Circular")
        self._circular_button.setCheckable(True)
        self._circular_button.setMinimumHeight(32)
        self._circular_button.setCursor(Qt.CursorShape.PointingHandCursor)
        self._button_group.addButton(self._circular_button, 1)
        button_layout.addWidget(self._circular_button)

        self._content_layout.addLayout(button_layout)

        # Connect signals
        self._button_group.buttonClicked.connect(self._on_button_clicked)

        # Apply styling
        self._apply_button_styling()

    def _apply_button_styling(self):
        """Apply modern toggle button styling"""
        button_style = """
            QPushButton {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                padding: 6px 12px;
                font-weight: 500;
                color: rgba(255, 255, 255, 0.8);
            }
            QPushButton:hover {
                background: rgba(255, 255, 255, 0.15);
                border-color: rgba(255, 255, 255, 0.3);
                color: rgba(255, 255, 255, 0.9);
            }
            QPushButton:checked {
                background: rgba(70, 130, 255, 0.7);
                border-color: rgba(70, 130, 255, 0.8);
                color: white;
            }
            QPushButton:checked:hover {
                background: rgba(80, 140, 255, 0.8);
            }
        """
        self._freeform_button.setStyleSheet(button_style)
        self._circular_button.setStyleSheet(button_style)

    def _on_button_clicked(self, button):
        """Handle button click"""
        if button == self._freeform_button:
            self._current_mode = GenerationMode.FREEFORM
        else:
            self._current_mode = GenerationMode.CIRCULAR

        self.mode_changed.emit(self._current_mode)

    def set_mode(self, mode: GenerationMode):
        """Set the current mode"""
        self._current_mode = mode
        if mode == GenerationMode.FREEFORM:
            self._freeform_button.setChecked(True)
        else:
            self._circular_button.setChecked(True)


class ModernLengthSelector(ModernControlBase):
    """Selector for sequence length"""

    value_changed = pyqtSignal(int)

    def __init__(self, parent: Optional[QWidget] = None):
        super().__init__(
            "Sequence Length",
            "Number of beats in the generated sequence (4-32)",
            parent,
        )
        self._current_value = 16
        self._setup_controls()

    def _setup_controls(self):
        """Setup length selector controls"""
        control_layout = QHBoxLayout()
        control_layout.setSpacing(12)

        # Slider
        self._slider = QSlider(Qt.Orientation.Horizontal)
        self._slider.setMinimum(4)
        self._slider.setMaximum(32)
        self._slider.setValue(16)
        self._slider.setTickPosition(QSlider.TickPosition.TicksBelow)
        self._slider.setTickInterval(4)
        self._slider.setStyleSheet(
            """
            QSlider::groove:horizontal {
                border: 1px solid rgba(255, 255, 255, 0.2);
                height: 4px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 2px;
            }
            QSlider::handle:horizontal {
                background: rgba(70, 130, 255, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.3);
                width: 16px;
                margin: -6px 0;
                border-radius: 8px;
            }
            QSlider::handle:horizontal:hover {
                background: rgba(80, 140, 255, 0.9);
            }
            QSlider::sub-page:horizontal {
                background: rgba(70, 130, 255, 0.5);
                border-radius: 2px;
            }
        """
        )
        control_layout.addWidget(self._slider, 1)

        # Value display/input
        self._spinbox = QSpinBox()
        self._spinbox.setMinimum(4)
        self._spinbox.setMaximum(32)
        self._spinbox.setValue(16)
        self._spinbox.setMinimumWidth(60)
        self._spinbox.setStyleSheet(
            """
            QSpinBox {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                padding: 4px 8px;
                color: rgba(255, 255, 255, 0.9);
            }
            QSpinBox:hover {
                background: rgba(255, 255, 255, 0.15);
                border-color: rgba(255, 255, 255, 0.3);
            }
            QSpinBox:focus {
                border-color: rgba(70, 130, 255, 0.8);
            }
        """
        )
        control_layout.addWidget(self._spinbox)

        self._content_layout.addLayout(control_layout)

        # Connect signals
        self._slider.valueChanged.connect(self._on_value_changed)
        self._spinbox.valueChanged.connect(self._on_value_changed)

    def _on_value_changed(self, value: int):
        """Handle value change"""
        if value != self._current_value:
            self._current_value = value

            # Sync controls
            self._slider.blockSignals(True)
            self._spinbox.blockSignals(True)
            self._slider.setValue(value)
            self._spinbox.setValue(value)
            self._slider.blockSignals(False)
            self._spinbox.blockSignals(False)

            self.value_changed.emit(value)

    def set_value(self, value: int):
        """Set the current value"""
        self._on_value_changed(value)


class ModernLevelSelector(ModernControlBase):
    """Selector for difficulty level - matches legacy 3-level design"""

    value_changed = pyqtSignal(int)

    def __init__(self, parent: Optional[QWidget] = None):
        super().__init__(
            "Difficulty Level",
            "Complexity of the generated sequence",
            center_title=True,
            parent=parent,
        )
        self._current_value = 1
        self._setup_controls()

    def _setup_controls(self):
        """Setup level selector controls matching legacy design"""
        # Main layout for the buttons
        main_layout = QHBoxLayout()
        main_layout.setSpacing(40)  # More space between buttons
        main_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)

        self._button_group = QButtonGroup(self)
        self._buttons = []

        # Level data matching legacy implementation
        level_data = [
            (1, "No Turns", "Base motions only\nNo turns added"),
            (2, "Whole Turns", "Whole turns allowed\nRadial orientations only"),
            (3, "Half Turns", "Half turns allowed\nRadial/nonradial orientations"),
        ]

        for level, title, description in level_data:
            # Create vertical layout for each level
            level_layout = QVBoxLayout()
            level_layout.setSpacing(8)
            level_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)

            # Create the level button with gradient
            button = QPushButton()
            button.setCheckable(True)
            button.setMinimumSize(100, 100)  # Larger size for better visibility
            button.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
            button.setCursor(Qt.CursorShape.PointingHandCursor)
            button.setToolTip(description)

            if level == 1:
                button.setChecked(True)

            # Apply level-specific styling with gradients
            self._apply_level_specific_styling(button, level)

            self._button_group.addButton(button, level)
            self._buttons.append(button)
            level_layout.addWidget(button, alignment=Qt.AlignmentFlag.AlignCenter)

            # Add title label
            title_label = QLabel(title)
            title_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            title_label.setStyleSheet(
                """
                QLabel {
                    color: rgba(255, 255, 255, 0.95);
                    font-size: 13px;
                    font-weight: bold;
                    background: transparent;
                    border: none;
                    padding: 4px 2px 2px 2px;
                }
            """
            )
            level_layout.addWidget(title_label)

            # Add description label
            desc_label = QLabel(description)
            desc_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            desc_label.setWordWrap(True)
            desc_label.setStyleSheet(
                """
                QLabel {
                    color: rgba(255, 255, 255, 0.75);
                    font-size: 10px;
                    background: transparent;
                    border: none;
                    padding: 0px;
                    line-height: 1.3;
                }
            """
            )
            level_layout.addWidget(desc_label)

            main_layout.addLayout(level_layout)

        self._content_layout.addLayout(main_layout)

        # Connect signals
        self._button_group.buttonClicked.connect(self._on_button_clicked)

    def _apply_level_specific_styling(self, button: QPushButton, level: int):
        """Apply level-specific gradient styling matching legacy implementation"""
        # Base button style with proper text visibility
        base_style = """
            QPushButton {
                border: 2px solid rgba(255, 255, 255, 0.4);
                border-radius: 50px;
                font-size: 22px;
                font-weight: bold;
                color: black;
                text-align: center;
                padding: 0px;
                margin: 0px;
            }
            QPushButton:hover:!checked {
                border: 3px solid rgba(255, 255, 255, 0.6);
            }
            QPushButton:checked {
                border: 4px solid rgba(255, 255, 255, 0.95);
                box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
            }
        """

        # Level-specific gradients matching legacy exactly
        if level == 1:
            # Light gray/white gradient for level 1
            gradient_style = """
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgb(250, 250, 250),
                    stop:1 rgb(220, 220, 220));
                color: rgb(40, 40, 40);
            """
        elif level == 2:
            # Gray gradient for level 2 - matching legacy complex gradient
            gradient_style = """
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgb(170, 170, 170),
                    stop:0.15 rgb(210, 210, 210),
                    stop:0.3 rgb(120, 120, 120),
                    stop:0.4 rgb(180, 180, 180),
                    stop:0.55 rgb(190, 190, 190),
                    stop:0.75 rgb(130, 130, 130),
                    stop:1 rgb(110, 110, 110));
                color: rgb(30, 30, 30);
            """
        else:  # level == 3
            # Gold to dark olive green gradient for level 3
            gradient_style = """
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgb(255, 215, 0),
                    stop:0.2 rgb(238, 201, 0),
                    stop:0.4 rgb(218, 165, 32),
                    stop:0.6 rgb(184, 134, 11),
                    stop:0.8 rgb(139, 69, 19),
                    stop:1 rgb(85, 107, 47));
                color: rgb(20, 20, 20);
            """

        button.setStyleSheet(base_style + gradient_style)
        button.setText(str(level))

    def _on_button_clicked(self, button):
        """Handle button click"""
        level = self._button_group.id(button)
        if level != self._current_value:
            self._current_value = level
            self.value_changed.emit(level)

    def set_value(self, value: int):
        """Set the current value"""
        if 1 <= value <= 3:  # Updated to support only 3 levels
            self._current_value = value
            button = self._button_group.button(value)
            if button:
                button.setChecked(True)


class ModernTurnIntensitySelector(ModernControlBase):
    """Selector for turn intensity"""

    value_changed = pyqtSignal(float)

    def __init__(self, parent: Optional[QWidget] = None):
        super().__init__(
            "Turn Intensity", "How complex the turns should be (0.5-3.0)", parent
        )
        self._current_value = 1.0
        self._setup_controls()

    def _setup_controls(self):
        """Setup turn intensity controls"""
        # Preset buttons for common values
        preset_layout = QHBoxLayout()
        preset_layout.setSpacing(6)

        self._preset_group = QButtonGroup(self)
        presets = [
            ("0.5", 0.5),
            ("1", 1.0),
            ("1.5", 1.5),
            ("2", 2.0),
            ("2.5", 2.5),
            ("3", 3.0),
        ]

        for i, (label, value) in enumerate(presets):
            button = QPushButton(label)
            button.setCheckable(True)
            button.setMinimumSize(32, 28)
            button.setCursor(Qt.CursorShape.PointingHandCursor)
            if value == 1.0:
                button.setChecked(True)

            self._preset_group.addButton(button, i)
            preset_layout.addWidget(button)

        preset_layout.addStretch()
        self._content_layout.addLayout(preset_layout)

        # Connect signals
        self._preset_group.buttonClicked.connect(self._on_preset_clicked)

        # Store preset values
        self._preset_values = [value for _, value in presets]

        # Apply styling
        self._apply_preset_styling()

    def _apply_preset_styling(self):
        """Apply styling to preset buttons"""
        button_style = """
            QPushButton {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                font-weight: 500;
                color: rgba(255, 255, 255, 0.8);
            }
            QPushButton:hover {
                background: rgba(255, 255, 255, 0.15);
                border-color: rgba(255, 255, 255, 0.3);
                color: rgba(255, 255, 255, 0.9);
            }
            QPushButton:checked {
                background: rgba(255, 152, 0, 0.7);
                border-color: rgba(255, 152, 0, 0.8);
                color: white;
            }
        """
        for button in self._preset_group.buttons():
            button.setStyleSheet(button_style)

    def _on_preset_clicked(self, button):
        """Handle preset button click"""
        preset_index = self._preset_group.id(button)
        value = self._preset_values[preset_index]
        if value != self._current_value:
            self._current_value = value
            self.value_changed.emit(value)

    def set_value(self, value: float):
        """Set the current value"""
        self._current_value = value
        # Find closest preset
        for i, preset_value in enumerate(self._preset_values):
            if abs(preset_value - value) < 0.01:
                button = self._preset_group.button(i)
                if button:
                    button.setChecked(True)
                break


class ModernPropContinuityToggle(ModernControlBase):
    """Toggle for prop continuity setting"""

    value_changed = pyqtSignal(PropContinuity)

    def __init__(self, parent: Optional[QWidget] = None):
        super().__init__(
            "Prop Continuity", "How props should behave throughout the sequence", parent
        )
        self._current_value = PropContinuity.CONTINUOUS
        self._setup_controls()

    def _setup_controls(self):
        """Setup prop continuity controls"""
        button_layout = QHBoxLayout()
        button_layout.setSpacing(8)

        self._button_group = QButtonGroup(self)

        # Continuous button
        self._continuous_button = QPushButton("Continuous")
        self._continuous_button.setCheckable(True)
        self._continuous_button.setChecked(True)
        self._continuous_button.setMinimumHeight(32)
        self._continuous_button.setCursor(Qt.CursorShape.PointingHandCursor)
        self._button_group.addButton(self._continuous_button, 0)
        button_layout.addWidget(self._continuous_button)

        # Random button
        self._random_button = QPushButton("Random")
        self._random_button.setCheckable(True)
        self._random_button.setMinimumHeight(32)
        self._random_button.setCursor(Qt.CursorShape.PointingHandCursor)
        self._button_group.addButton(self._random_button, 1)
        button_layout.addWidget(self._random_button)

        self._content_layout.addLayout(button_layout)

        # Connect signals
        self._button_group.buttonClicked.connect(self._on_button_clicked)

        # Apply styling
        self._apply_toggle_styling()

    def _apply_toggle_styling(self):
        """Apply toggle button styling"""
        button_style = """
            QPushButton {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                padding: 6px 12px;
                font-weight: 500;
                color: rgba(255, 255, 255, 0.8);
            }
            QPushButton:hover {
                background: rgba(255, 255, 255, 0.15);
                border-color: rgba(255, 255, 255, 0.3);
                color: rgba(255, 255, 255, 0.9);
            }
            QPushButton:checked {
                background: rgba(76, 175, 80, 0.7);
                border-color: rgba(76, 175, 80, 0.8);
                color: white;
            }
        """
        self._continuous_button.setStyleSheet(button_style)
        self._random_button.setStyleSheet(button_style)

    def _on_button_clicked(self, button):
        """Handle button click"""
        if button == self._continuous_button:
            self._current_value = PropContinuity.CONTINUOUS
        else:
            self._current_value = PropContinuity.RANDOM

        self.value_changed.emit(self._current_value)

    def set_value(self, value: PropContinuity):
        """Set the current value"""
        self._current_value = value
        if value == PropContinuity.CONTINUOUS:
            self._continuous_button.setChecked(True)
        else:
            self._random_button.setChecked(True)


class ModernLetterTypeSelector(ModernControlBase):
    """Multi-select for letter types (freeform mode)"""

    value_changed = pyqtSignal(set)

    def __init__(self, parent: Optional[QWidget] = None):
        super().__init__(
            "Letter Types", "Select which letter types to include in generation", parent
        )
        self._current_value = {
            LetterType.TYPE1,
            LetterType.TYPE2,
            LetterType.TYPE3,
            LetterType.TYPE4,
            LetterType.TYPE5,
            LetterType.TYPE6,
        }
        self._setup_controls()

    def _setup_controls(self):
        """Setup letter type controls"""
        checkbox_layout = QVBoxLayout()
        checkbox_layout.setSpacing(4)

        self._checkboxes = {}

        # Legacy's letter type descriptions
        letter_type_info = [
            (LetterType.TYPE1, "Type 1 (Dual-Shift: A-V)"),
            (LetterType.TYPE2, "Type 2 (Shift: W,X,Y,Z,Σ,Δ,θ,Ω)"),
            (LetterType.TYPE3, "Type 3 (Cross-Shift: W-,X-,Y-,Z-,Σ-,Δ-,θ-,Ω-)"),
            (LetterType.TYPE4, "Type 4 (Dash: Φ,Ψ,Λ)"),
            (LetterType.TYPE5, "Type 5 (Dual-Dash: Φ-,Ψ-,Λ-)"),
            (LetterType.TYPE6, "Type 6 (Static: α,β,Γ)"),
        ]

        for letter_type, description in letter_type_info:
            checkbox = QCheckBox(description)
            checkbox.setChecked(True)
            checkbox.setStyleSheet(
                """
                QCheckBox {
                    color: rgba(255, 255, 255, 0.8);
                    spacing: 8px;
                    font-size: 9px;
                }
                QCheckBox::indicator {
                    width: 16px;
                    height: 16px;
                    border-radius: 3px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    background: rgba(255, 255, 255, 0.1);
                }
                QCheckBox::indicator:hover {
                    border-color: rgba(255, 255, 255, 0.4);
                    background: rgba(255, 255, 255, 0.15);
                }
                QCheckBox::indicator:checked {
                    background: rgba(76, 175, 80, 0.7);
                    border-color: rgba(76, 175, 80, 0.8);
                }
                QCheckBox::indicator:checked:hover {
                    background: rgba(76, 175, 80, 0.8);
                }
            """
            )
            checkbox.stateChanged.connect(self._on_checkbox_changed)
            self._checkboxes[letter_type] = checkbox
            checkbox_layout.addWidget(checkbox)

        self._content_layout.addLayout(checkbox_layout)

    def _on_checkbox_changed(self):
        """Handle checkbox state change"""
        new_value = set()
        for letter_type, checkbox in self._checkboxes.items():
            if checkbox.isChecked():
                new_value.add(letter_type)

        if new_value != self._current_value:
            self._current_value = new_value
            self.value_changed.emit(new_value)

    def set_value(self, value: Set[LetterType]):
        """Set the current value"""
        self._current_value = value
        for letter_type, checkbox in self._checkboxes.items():
            checkbox.blockSignals(True)
            checkbox.setChecked(letter_type in value)
            checkbox.blockSignals(False)


class ModernSliceSizeSelector(ModernControlBase):
    """Selector for slice size (circular mode)"""

    value_changed = pyqtSignal(SliceSize)

    def __init__(self, parent: Optional[QWidget] = None):
        super().__init__(
            "Slice Size",
            "Size of circular sequence slices (quartered or halved)",
            parent,
        )
        self._current_value = SliceSize.HALVED
        self._setup_controls()

    def _setup_controls(self):
        """Setup slice size controls"""
        button_layout = QHBoxLayout()
        button_layout.setSpacing(8)

        self._button_group = QButtonGroup(self)

        # Halved button (default)
        self._halved_button = QPushButton("Halved")
        self._halved_button.setCheckable(True)
        self._halved_button.setChecked(True)
        self._halved_button.setMinimumHeight(32)
        self._halved_button.setCursor(Qt.CursorShape.PointingHandCursor)
        self._button_group.addButton(self._halved_button, 0)
        button_layout.addWidget(self._halved_button)

        # Quartered button
        self._quartered_button = QPushButton("Quartered")
        self._quartered_button.setCheckable(True)
        self._quartered_button.setMinimumHeight(32)
        self._quartered_button.setCursor(Qt.CursorShape.PointingHandCursor)
        self._button_group.addButton(self._quartered_button, 1)
        button_layout.addWidget(self._quartered_button)

        self._content_layout.addLayout(button_layout)

        # Connect signals
        self._button_group.buttonClicked.connect(self._on_button_clicked)

        # Apply styling
        self._apply_button_styling()

    def _apply_button_styling(self):
        """Apply toggle button styling"""
        button_style = """
            QPushButton {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                padding: 6px 12px;
                font-weight: 500;
                color: rgba(255, 255, 255, 0.8);
            }
            QPushButton:hover {
                background: rgba(255, 255, 255, 0.15);
                border-color: rgba(255, 255, 255, 0.3);
                color: rgba(255, 255, 255, 0.9);
            }
            QPushButton:checked {
                background: rgba(156, 39, 176, 0.7);
                border-color: rgba(156, 39, 176, 0.8);
                color: white;
            }
        """
        self._halved_button.setStyleSheet(button_style)
        self._quartered_button.setStyleSheet(button_style)

    def _on_button_clicked(self, button):
        """Handle button click"""
        if button == self._halved_button:
            self._current_value = SliceSize.HALVED
        else:
            self._current_value = SliceSize.QUARTERED

        self.value_changed.emit(self._current_value)

    def set_value(self, value: SliceSize):
        """Set the current value"""
        self._current_value = value
        if value == SliceSize.HALVED:
            self._halved_button.setChecked(True)
        else:
            self._quartered_button.setChecked(True)


class ModernCAPTypeSelector(ModernControlBase):
    """Selector for CAP type (circular mode)"""

    value_changed = pyqtSignal(CAPType)

    def __init__(self, parent: Optional[QWidget] = None):
        super().__init__("CAP Type", "Circular arrangement pattern type", parent)
        self._current_value = CAPType.STRICT_ROTATED
        self._setup_controls()

    def _setup_controls(self):
        """Setup CAP type controls"""
        combo = QComboBox()
        combo.setMinimumHeight(32)
        combo.setStyleSheet(
            """
            QComboBox {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                padding: 4px 8px;
                color: rgba(255, 255, 255, 0.9);
            }
            QComboBox:hover {
                background: rgba(255, 255, 255, 0.15);
                border-color: rgba(255, 255, 255, 0.3);
            }
            QComboBox:focus {
                border-color: rgba(70, 130, 255, 0.8);
            }
            QComboBox::drop-down {
                border: none;
                width: 20px;
            }
            QComboBox::down-arrow {
                image: none;
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                border-top: 4px solid rgba(255, 255, 255, 0.6);
                margin-right: 6px;
            }
            QComboBox QAbstractItemView {
                background: rgba(40, 40, 60, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                color: rgba(255, 255, 255, 0.9);
                selection-background-color: rgba(70, 130, 255, 0.7);
            }
        """
        )

        # Add all Legacy CAP types
        cap_types = [
            ("Strict Rotated", CAPType.STRICT_ROTATED),
            ("Strict Mirrored", CAPType.STRICT_MIRRORED),
            ("Strict Swapped", CAPType.STRICT_SWAPPED),
            ("Strict Complementary", CAPType.STRICT_COMPLEMENTARY),
            ("Swapped Complementary", CAPType.SWAPPED_COMPLEMENTARY),
            ("Rotated Complementary", CAPType.ROTATED_COMPLEMENTARY),
            ("Mirrored Swapped", CAPType.MIRRORED_SWAPPED),
            ("Mirrored Complementary", CAPType.MIRRORED_COMPLEMENTARY),
            ("Rotated Swapped", CAPType.ROTATED_SWAPPED),
            ("Mirrored Rotated", CAPType.MIRRORED_ROTATED),
            ("Mirrored Complementary Rotated", CAPType.MIRRORED_COMPLEMENTARY_ROTATED),
        ]

        for name, cap_type in cap_types:
            combo.addItem(name, cap_type)

        combo.currentIndexChanged.connect(self._on_combo_changed)
        self._combo = combo

        self._content_layout.addWidget(combo)

    def _on_combo_changed(self, index: int):
        """Handle combo box change"""
        value = self._combo.itemData(index)
        if value != self._current_value:
            self._current_value = value
            self.value_changed.emit(value)

    def set_value(self, value: CAPType):
        """Set the current value"""
        self._current_value = value
        for i in range(self._combo.count()):
            if self._combo.itemData(i) == value:
                self._combo.setCurrentIndex(i)
                break
