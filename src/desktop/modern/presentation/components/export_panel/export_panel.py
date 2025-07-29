"""
Export Panel - Main component for the Export tab

This component provides comprehensive export functionality with live preview,
replacing the save image button from the workbench button panel.

Features:
- Live preview of export output with real-time updates
- All export settings migrated from settings dialog
- Export actions (current sequence, all pictographs)
- Consistent styling with other right panel tabs

Refactored into smaller components for better maintainability.
"""

from typing import Dict, Optional, Union

from PyQt6.QtCore import Qt, QTimer, pyqtSignal
from PyQt6.QtGui import QCursor, QFont, QPainter, QPixmap
from PyQt6.QtWidgets import QCheckBox, QFrame, QHBoxLayout, QLabel, QVBoxLayout, QWidget

from desktop.modern.core.dependency_injection.di_container import DIContainer
from desktop.modern.core.interfaces.settings_services import IImageExportSettingsManager
from desktop.modern.core.interfaces.workbench_export_services import (
    IWorkbenchExportService,
)

from .cards import (
    ExportActionsCard,
    ExportOptionsCard,
    ExportPreviewCard,
    FormatSettingsCard,
    UserSettingsCard,
)


class ExportPreviewPanel(QFrame):
    """Live preview panel that shows how the exported image will look."""

    def __init__(self, parent=None):
        super().__init__(parent)
        self._setup_ui()
        self._current_pixmap = None

    def _setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)

        # Preview label
        self.preview_label = QLabel()
        self.preview_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.preview_label.setMinimumSize(400, 300)
        self.preview_label.setStyleSheet(
            """
            QLabel {
                background: rgba(0, 0, 0, 0.3);
                border: 2px dashed rgba(255, 255, 255, 0.3);
                border-radius: 12px;
                color: rgba(255, 255, 255, 0.6);
                font-size: 16px;
                font-weight: 500;
            }
        """
        )
        self.preview_label.setText(
            "Preview will appear here\nwhen a sequence is available"
        )

        # Preview info label
        self.info_label = QLabel("No export settings applied")
        self.info_label.setStyleSheet(
            """
            QLabel {
                color: rgba(255, 255, 255, 0.7);
                font-size: 12px;
                padding: 8px;
                text-align: center;
            }
        """
        )

        layout.addWidget(self.preview_label)
        layout.addWidget(self.info_label)

    def update_preview(self, pixmap: QPixmap, settings_info: str = ""):
        """Update the preview with a new pixmap and settings info."""
        if pixmap and not pixmap.isNull():
            # Scale pixmap to fit the preview area while maintaining aspect ratio
            scaled_pixmap = pixmap.scaled(
                self.preview_label.size(),
                Qt.AspectRatioMode.KeepAspectRatio,
                Qt.TransformationMode.SmoothTransformation,
            )
            self.preview_label.setPixmap(scaled_pixmap)
            self._current_pixmap = scaled_pixmap
            self.info_label.setText(settings_info or "Preview updated")
        else:
            self.preview_label.clear()
            self.preview_label.setText("No preview available")
            self._current_pixmap = None
            self.info_label.setText("No sequence to preview")


class ExportToggle(QCheckBox):
    """Enhanced export toggle with modern styling."""

    def __init__(self, label: str, tooltip: Union[str, None] = None, parent=None):
        super().__init__(label, parent)
        if tooltip:
            self.setToolTip(tooltip)
        self.setCursor(QCursor(Qt.CursorShape.PointingHandCursor))
        self._apply_styling()

    def _apply_styling(self):
        self.setStyleSheet(
            """
            QCheckBox {
                color: rgba(255, 255, 255, 0.9);
                font-size: 14px;
                font-weight: 500;
                font-family: "Inter", "Segoe UI", sans-serif;
                spacing: 12px;
                padding: 12px;
                border-radius: 10px;
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 rgba(255, 255, 255, 0.08),
                    stop:1 rgba(255, 255, 255, 0.04));
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            QCheckBox:hover {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 rgba(255, 255, 255, 0.12),
                    stop:1 rgba(255, 255, 255, 0.08));
                border-color: rgba(255, 255, 255, 0.2);
            }

            QCheckBox::indicator {
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255, 255, 255, 0.4);
                border-radius: 6px;
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 rgba(255, 255, 255, 0.12),
                    stop:1 rgba(255, 255, 255, 0.06));
            }

            QCheckBox::indicator:checked {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 rgba(42, 130, 218, 0.9),
                    stop:1 rgba(42, 130, 218, 0.7));
                border-color: rgba(42, 130, 218, 1.0);
            }

            QCheckBox::indicator:hover {
                border-color: rgba(255, 255, 255, 0.6);
            }
        """
        )


class ExportPanel(QWidget):
    """
    Main Export Panel component for the right panel tabs.

    Replaces the save image button functionality and provides
    comprehensive export options with live preview.
    """

    # Signals for parent components
    export_requested = pyqtSignal(str, dict)  # export_type, options
    setting_changed = pyqtSignal(str, object)  # setting_name, value

    def __init__(
        self,
        container: DIContainer,
        parent: Optional[QWidget] = None,
    ):
        super().__init__(parent)
        self.container = container

        # Resolve export services
        try:
            self.export_service = container.resolve(IWorkbenchExportService)
            self.settings_manager = container.resolve(IImageExportSettingsManager)
        except Exception as e:
            print(f"⚠️ Failed to resolve export services: {e}")
            self.export_service = None
            self.settings_manager = None

        # Create preview panel
        self.preview_panel = ExportPreviewPanel(self)

        # Update timer for preview (debounce rapid changes)
        self.update_timer = QTimer()
        self.update_timer.setSingleShot(True)
        self.update_timer.timeout.connect(self._update_preview)

        self._setup_ui()
        self._load_settings()
        self._setup_connections()

    def _setup_ui(self):
        """Set up the main UI layout with improved space utilization."""
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(15, 10, 15, 15)
        main_layout.setSpacing(10)

        # Compact header section
        header_layout = QVBoxLayout()
        header_layout.setSpacing(5)

        # Compact title
        title = QLabel("Export")
        title.setObjectName("compact_title")
        title.setFont(QFont("Inter", 16, QFont.Weight.Bold))
        header_layout.addWidget(title)

        # Compact description
        description = QLabel("Configure export options and preview results")
        description.setObjectName("compact_description")
        description.setWordWrap(True)
        header_layout.addWidget(description)

        main_layout.addLayout(header_layout)

        # Export options card (full width)
        self.options_card = ExportOptionsCard()
        main_layout.addWidget(self.options_card)

        # Format and user settings in horizontal layout
        settings_layout = QHBoxLayout()
        settings_layout.setSpacing(15)

        self.format_card = FormatSettingsCard()
        self.user_card = UserSettingsCard()

        settings_layout.addWidget(self.format_card)
        settings_layout.addWidget(self.user_card)
        main_layout.addLayout(settings_layout)

        # Preview card (full width)
        self.preview_card = ExportPreviewCard()
        main_layout.addWidget(self.preview_card)

        # Export actions card at bottom (full width)
        self.actions_card = ExportActionsCard()
        main_layout.addWidget(self.actions_card)

        self._apply_styling()

    def _apply_styling(self):
        """Apply consistent glassmorphism styling."""
        self.setStyleSheet(
            """
            QWidget {
                background: transparent;
                color: white;
            }
            
            QLabel#compact_title {
                color: white;
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 3px;
            }

            QLabel#compact_description {
                color: rgba(255, 255, 255, 0.7);
                font-size: 12px;
                margin-bottom: 8px;
            }
            
            QLabel#subsection_title {
                color: rgba(255, 255, 255, 0.9);
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 15px;
            }
            
            QLabel#input_label {
                color: rgba(255, 255, 255, 0.9);
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 5px;
                margin-top: 10px;
            }
            
            QFrame#settings_section {
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 20px;
                margin: 5px;
                min-width: 300px;
            }
            
            QFrame#preview_container {
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid rgba(255, 255, 255, 0.15);
                border-radius: 12px;
                padding: 15px;
            }
            
            QLineEdit#export_input, QComboBox#export_input {
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 8px;
                padding: 10px;
                color: white;
                font-size: 14px;
                margin-bottom: 10px;
            }
            
            QLineEdit#export_input:focus, QComboBox#export_input:focus {
                border-color: rgba(59, 130, 246, 0.8);
            }
            
            QPushButton#action_button {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 rgba(59, 130, 246, 0.8),
                    stop:1 rgba(59, 130, 246, 0.6));
                border: 2px solid rgba(59, 130, 246, 0.3);
                border-radius: 10px;
                color: white;
                font-size: 16px;
                font-weight: bold;
                padding: 15px;
                margin: 8px 0;
                min-height: 50px;
            }
            
            QPushButton#action_button:hover {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 rgba(59, 130, 246, 1.0),
                    stop:1 rgba(59, 130, 246, 0.8));
                border-color: rgba(59, 130, 246, 0.8);
            }
            
            QPushButton#action_button:pressed {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 rgba(59, 130, 246, 0.6),
                    stop:1 rgba(59, 130, 246, 0.4));
            }
            
            QPushButton#secondary_button {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 rgba(255, 255, 255, 0.15),
                    stop:1 rgba(255, 255, 255, 0.08));
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                color: white;
                font-size: 14px;
                font-weight: 500;
                padding: 12px;
                margin: 5px 0;
            }
            
            QPushButton#secondary_button:hover {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 rgba(255, 255, 255, 0.25),
                    stop:1 rgba(255, 255, 255, 0.15));
                border-color: rgba(255, 255, 255, 0.4);
            }
        """
        )

    def _load_settings(self):
        """Load current settings from the settings manager."""
        if not self.settings_manager:
            return

        # Load default settings into cards
        default_options = {
            "include_start_position": True,
            "add_beat_numbers": True,
            "add_reversal_symbols": True,
            "add_user_info": True,
            "add_word": True,
            "use_last_save_directory": True,
        }

        default_format = {
            "format": "PNG",
            "quality": "300 DPI",
        }

        default_user = {
            "user_name": "Default User",
            "notes": "",
        }

        # Set defaults in cards
        self.options_card.set_options(default_options)
        self.format_card.set_format_settings(default_format)
        self.user_card.set_user_settings(default_user)

    def _setup_connections(self):
        """Setup signal connections."""
        # Export options card
        self.options_card.option_changed.connect(self._on_option_changed)

        # Format settings card
        self.format_card.format_changed.connect(self._on_format_changed)

        # User settings card
        self.user_card.user_setting_changed.connect(self._on_user_setting_changed)

        # Action buttons (from actions card)
        self.actions_card.export_current_requested.connect(self._export_current)
        self.actions_card.export_all_requested.connect(self._export_all)

    def _on_option_changed(self, option_key: str, value: bool):
        """Handle export option changes and trigger preview update."""
        print(f"🔧 Export option changed: {option_key} = {value}")
        self.setting_changed.emit(option_key, value)

        # Trigger preview update with a small delay
        self.update_timer.start(300)

    def _on_format_changed(self, setting_name: str, value: str):
        """Handle format setting changes from format card."""
        print(f"🔧 Format setting changed: {setting_name} = {value}")

        if setting_name == "format":
            if self.settings_manager:
                self.settings_manager.set_export_format(value)
            self.setting_changed.emit("export_format", value)
        elif setting_name == "quality":
            try:
                if "DPI" in value.upper():
                    # Extract DPI value
                    dpi = int("".join(filter(str.isdigit, value)))
                    quality = min(
                        100, max(0, dpi // 3)
                    )  # Convert DPI to quality percentage
                else:
                    quality = int(value) if value else 95
                    quality = max(0, min(100, quality))

                if self.settings_manager:
                    self.settings_manager.set_export_quality(quality)
                self.setting_changed.emit("export_quality", quality)
            except ValueError:
                pass  # Invalid input, ignore

        self.update_timer.start(300)

    def _on_user_setting_changed(self, setting_name: str, value: str):
        """Handle user setting changes from user card."""
        print(f"🔧 User setting changed: {setting_name} = {value}")

        if setting_name == "user_name":
            self.setting_changed.emit("user_name", value)
        elif setting_name == "notes":
            self.setting_changed.emit("custom_note", value)

        self.update_timer.start(300)

    def _update_preview(self):
        """Update the preview image based on current settings."""
        try:
            # Get current export options
            options = self._get_current_export_options()

            # Create a placeholder preview for now
            # In a real implementation, this would use the actual export service
            # to generate a preview of the current sequence
            placeholder_pixmap = self._create_placeholder_preview(options)

            # Update preview card
            self.preview_card.update_preview(placeholder_pixmap)

        except Exception as e:
            print(f"Error updating preview: {e}")

    def _get_current_export_options(self) -> Dict[str, Union[bool, str, int]]:
        """Get current export options as a dictionary."""
        options = {}

        # Get options from cards
        options.update(self.options_card.get_options())
        options.update(self.format_card.get_format_settings())
        options.update(self.user_card.get_user_settings())

        # Convert quality to int if needed
        if "quality" in options:
            try:
                quality_str = options["quality"]
                if "DPI" in str(quality_str).upper():
                    # Extract DPI value and convert to quality percentage
                    dpi = int("".join(filter(str.isdigit, str(quality_str))))
                    options["export_quality"] = min(100, max(0, dpi // 3))
                else:
                    options["export_quality"] = int(quality_str) if quality_str else 95
            except (ValueError, TypeError):
                options["export_quality"] = 95
            # Remove the original quality key
            options.pop("quality", None)

        # Ensure format is properly named
        if "format" in options:
            options["export_format"] = options.pop("format")

        return options

    def _create_placeholder_preview(
        self, options: Dict[str, Union[bool, str, int]]
    ) -> QPixmap:
        """Create a placeholder preview image."""
        pixmap = QPixmap(400, 300)
        pixmap.fill(Qt.GlobalColor.darkGray)

        painter = QPainter(pixmap)
        painter.setPen(Qt.GlobalColor.white)

        # Draw export info
        enabled_count = len(
            [k for k, v in options.items() if v and isinstance(v, bool)]
        )
        format_name = options.get("export_format", "PNG")
        quality = options.get("export_quality", 95)

        text = f"Export Preview\n{format_name} - Quality: {quality}\n{enabled_count} options enabled"

        painter.drawText(
            pixmap.rect(),
            Qt.AlignmentFlag.AlignCenter,
            text,
        )
        painter.end()

        return pixmap

    def _export_current(self):
        """Export the current sequence (replaces save image button functionality)."""
        options = self._get_current_export_options()
        self.export_requested.emit("export_current", options)

        # Show feedback via actions card
        self.actions_card.set_export_current_loading(True)

        # Reset button after delay (in real implementation, this would be done via callback)
        QTimer.singleShot(
            2000, lambda: self.actions_card.set_export_current_loading(False)
        )

    def _export_all(self):
        """Export all pictographs."""
        options = self._get_current_export_options()
        self.export_requested.emit("export_all", options)

        # Show feedback via actions card
        self.actions_card.set_export_all_loading(True)

        # Reset button after delay
        QTimer.singleShot(2000, lambda: self.actions_card.set_export_all_loading(False))

    def update_preview_from_external(self, pixmap: QPixmap = None):
        """Public method to update preview from external source (e.g., when sequence changes)."""
        if pixmap:
            self.preview_card.update_preview(pixmap)
        else:
            self._update_preview()
