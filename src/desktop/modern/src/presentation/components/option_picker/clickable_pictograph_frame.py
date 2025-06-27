from PyQt6.QtWidgets import QFrame, QVBoxLayout, QSizePolicy, QWidget, QLabel
from PyQt6.QtCore import pyqtSignal, Qt, QEvent
from PyQt6.QtGui import QCloseEvent, QMouseEvent, QEnterEvent
from typing import Optional

from domain.models.core_models import BeatData
from presentation.components.pictograph.pictograph_component import (
    PictographComponent,
)


class ClickablePictographFrame(QFrame):
    clicked = pyqtSignal(str)
    beat_data_clicked = pyqtSignal(object)  # New signal that passes the actual BeatData

    def __init__(self, beat_data: BeatData, parent: Optional[QWidget] = None) -> None:
        if parent is not None:
            try:
                _ = parent.isVisible()
            except RuntimeError:
                print(
                    "❌ Parent widget deleted, cannot create ClickablePictographFrame"
                )
                raise RuntimeError("Parent widget has been deleted")

        super().__init__(parent)
        self.beat_data: BeatData = beat_data
        # CRITICAL FIX: Remove frame's own border styling to prevent double borders
        # The PictographComponent's border manager will handle all border rendering
        self.setFrameStyle(QFrame.Shape.NoFrame)
        self.setLineWidth(0)

        self.container_widget: Optional[QWidget] = None
        self._option_picker_width: int = 0  # Reactive sizing reference

        square_size: int = 160
        self.setFixedSize(square_size, square_size)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        try:
            self.pictograph_component: Optional[PictographComponent] = (
                PictographComponent(parent=None)
            )
            self.pictograph_component.setSizePolicy(
                QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding
            )

            self._configure_option_picker_context(beat_data)

            self.pictograph_component.update_from_beat(beat_data)
            layout.addWidget(self.pictograph_component)
        except RuntimeError as e:
            print(f"❌ Failed to create PictographComponent: {e}")

            fallback_label = QLabel(f"Beat {beat_data.letter}")
            fallback_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            layout.addWidget(fallback_label)
            self.pictograph_component = None

        # CRITICAL FIX: Remove CSS border styling to prevent conflicts with border manager
        # The PictographComponent's border manager handles all border rendering and styling
        self.setStyleSheet(
            """
            ClickablePictographFrame {
                background-color: transparent;
                border: none;
            }
            ClickablePictographFrame:hover {
                background-color: transparent;
            }
        """
        )

        self.show()
        if self.pictograph_component:
            self.pictograph_component.show()

    def _configure_option_picker_context(self, beat_data: BeatData) -> None:
        if not self.pictograph_component:
            return

        try:
            # CRITICAL FIX: Set appropriate scaling context for option picker
            # This prevents the over-scaling issue seen in the option picker
            from application.services.ui.context_aware_scaling_service import (
                ScalingContext,
            )

            self.pictograph_component.set_scaling_context(ScalingContext.OPTION_VIEW)

            # Apply letter type-specific colored borders
            if beat_data.glyph_data and beat_data.glyph_data.letter_type:
                self.pictograph_component.enable_borders()
                self.pictograph_component.update_border_colors_for_letter_type(
                    beat_data.glyph_data.letter_type
                )

            # Configure hover effects for option picker context
            # This is now handled by the pictograph component itself

        except Exception as e:
            print(f"⚠️  Failed to configure Option Picker context: {e}")
            # Fallback: enable borders with letter type colors and set scaling context
            from application.services.ui.context_aware_scaling_service import (
                ScalingContext,
            )

            self.pictograph_component.set_scaling_context(ScalingContext.OPTION_VIEW)
            if beat_data.glyph_data and beat_data.glyph_data.letter_type:
                self.pictograph_component.enable_borders()
                self.pictograph_component.update_border_colors_for_letter_type(
                    beat_data.glyph_data.letter_type
                )

    def set_container_widget(self, container_widget: QWidget) -> None:
        self.container_widget = container_widget

    def resize_frame(self) -> None:
        """Resize frame using reactive sizing reference from option picker"""
        try:
            # Use the reactive sizing reference if available
            if self._option_picker_width > 0:
                container_width = self._option_picker_width
                print(
                    f"🔍 SIZING DEBUG: Using reactive sizing reference: {container_width}px"
                )
            elif self.container_widget and self.container_widget.width() > 0:
                # Fallback to container width
                container_width = self.container_widget.width()
                print(
                    f"🔍 SIZING DEBUG: Using fallback container width: {container_width}px"
                )
            else:
                print(f"🔍 SIZING DEBUG: No valid sizing reference available")
                return

            # Use unified sizing calculation for ALL section types
            # This ensures Types 1-6 all have identical pictograph sizes
            container_based_size = container_width // 8
            size = container_based_size

            # Legacy border width calculation: max(1, int(size * 0.015))
            border_width = max(1, int(size * 0.015))

            # Legacy spacing (use grid spacing from parent layout)
            spacing = 3  # Match the grid spacing used in pictograph frame

            # Legacy final calculation: size -= 2 * bw + spacing
            final_size = size - (2 * border_width) - spacing

            # Apply reasonable bounds to prevent extreme sizes
            final_size = max(60, min(final_size, 200))

            print(
                f"🔍 SIZING DEBUG: Final pictograph size: {final_size}px (from container: {container_width}px)"
            )

            self.setFixedSize(final_size, final_size)

        except Exception as e:
            print(f"❌ Error in resize_frame: {e}")

    def update_sizing_reference(self, option_picker_width: int):
        """Update the sizing reference and resize the frame"""
        self._option_picker_width = option_picker_width
        print(f"📏 Frame received sizing update: {option_picker_width}px")
        self.resize_frame()

    def update_beat_data(self, beat_data: BeatData) -> None:
        """Update the frame's content with new beat data (Legacy-style reuse pattern)"""
        self.beat_data = beat_data
        if self.pictograph_component:
            # Reconfigure context for new beat data (important for letter type colors)
            self._configure_option_picker_context(beat_data)
            self.pictograph_component.update_from_beat(beat_data)

    def cleanup(self) -> None:
        if self.pictograph_component:
            self.pictograph_component.cleanup()
            self.pictograph_component = None

    def closeEvent(self, event: QCloseEvent) -> None:
        self.cleanup()
        super().closeEvent(event)

    def mousePressEvent(self, event: QMouseEvent) -> None:
        if event.button() == Qt.MouseButton.LeftButton:
            # Emit both the old signal (for compatibility) and the new signal with actual beat data
            self.clicked.emit(f"beat_{self.beat_data.letter}")
            self.beat_data_clicked.emit(
                self.beat_data
            )  # Pass the actual BeatData object
        super().mousePressEvent(event)

    def enterEvent(self, event: QEnterEvent) -> None:
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        super().enterEvent(event)

    def leaveEvent(self, event: QEvent) -> None:
        self.setCursor(Qt.CursorShape.ArrowCursor)
        super().leaveEvent(event)
