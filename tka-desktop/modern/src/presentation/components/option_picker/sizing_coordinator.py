"""
Sizing Coordinator for Option Picker
Ensures proper timing and coordination of resize operations during sequential loading.
"""

from typing import Dict, List, Optional, Callable
from PyQt6.QtWidgets import QWidget, QApplication
from PyQt6.QtCore import QTimer, QObject, pyqtSignal
import time


class SizingCoordinator(QObject):
    """
    Coordinates sizing operations to ensure parent containers are properly
    sized before child pictographs are resized. Addresses the sequential
    loading sizing bug.
    """

    sizing_complete = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.pending_resize_operations: List[Callable] = []
        self.container_widgets: Dict[str, QWidget] = {}
        self.pictograph_frames: Dict[str, List[QWidget]] = {}

        # Timing control
        self.resize_timer = QTimer()
        self.resize_timer.timeout.connect(self._execute_pending_resizes)
        self.resize_timer.setSingleShot(True)

        # Sizing state tracking
        self.last_container_sizes: Dict[str, tuple] = {}
        self.sizing_in_progress = False

    def register_container(self, container_id: str, container_widget: QWidget):
        """Register a container widget for sizing coordination"""
        self.container_widgets[container_id] = container_widget

        # Only initialize frames list if it doesn't exist (don't clear existing frames!)
        if container_id not in self.pictograph_frames:
            self.pictograph_frames[container_id] = []

        # Track initial size
        size = (container_widget.width(), container_widget.height())
        self.last_container_sizes[container_id] = size

    def register_pictograph_frame(self, container_id: str, frame: QWidget):
        """Register a pictograph frame under a container"""
        if container_id not in self.pictograph_frames:
            self.pictograph_frames[container_id] = []
        self.pictograph_frames[container_id].append(frame)

    def schedule_coordinated_resize(self, delay_ms: int = 50):
        """Schedule a coordinated resize operation with proper timing"""
        if self.sizing_in_progress:
            delay_ms += 100

        self.resize_timer.start(delay_ms)

    def force_immediate_resize(self):
        """Force immediate resize without delay (for critical situations)"""
        self._execute_pending_resizes()

    def _execute_pending_resizes(self):
        """Execute all pending resize operations in proper order"""
        if self.sizing_in_progress:
            return

        self.sizing_in_progress = True

        try:
            # Step 1: Ensure all containers have updated their sizes
            self._update_container_sizes()

            # Step 2: Wait for layout updates to propagate
            QApplication.processEvents()

            # Step 3: Resize pictographs based on updated container sizes
            self._resize_all_pictographs()

            # Step 4: Final layout update
            QApplication.processEvents()

            self.sizing_complete.emit()

        except Exception:
            pass
        finally:
            self.sizing_in_progress = False

    def _update_container_sizes(self):
        """Update and track container size changes"""
        for container_id, container in self.container_widgets.items():
            if not container:
                continue

            # Force container to update its geometry
            container.updateGeometry()
            container.update()

            # Get current size
            current_size = (container.width(), container.height())
            last_size = self.last_container_sizes.get(container_id, (0, 0))

            # Update tracked size
            self.last_container_sizes[container_id] = current_size

            # If size changed significantly, ensure layout updates
            if (
                abs(current_size[0] - last_size[0]) > 10
                or abs(current_size[1] - last_size[1]) > 10
            ):
                container.updateGeometry()

    def _resize_all_pictographs(self):
        """Resize all pictograph frames using UNIFIED sizing - all same size"""
        # Calculate ONE unified size for ALL pictographs across ALL containers
        unified_size = self._calculate_optimal_pictograph_size()

        for container_id, frames in self.pictograph_frames.items():
            container = self.container_widgets.get(container_id)
            if not container or not frames:
                continue

            # Apply the SAME unified size to all frames in ALL containers
            for frame in frames:
                if frame:
                    try:
                        # Set container reference if needed
                        if hasattr(frame, "set_container_widget"):
                            frame.set_container_widget(container)

                        # Use unified size method if available, otherwise fallback to resize_frame
                        if hasattr(frame, "set_unified_size"):
                            frame.set_unified_size(unified_size)
                        elif hasattr(frame, "resize_frame"):
                            frame.resize_frame()
                        else:
                            # Direct size setting as last resort
                            frame.setFixedSize(unified_size, unified_size)
                    except Exception:
                        pass

    def _calculate_optimal_pictograph_size(
        self, container: Optional[QWidget] = None
    ) -> int:
        """Calculate UNIFIED pictograph size for ALL containers - all pictographs same size"""
        # Get the option picker widget width (the main container)
        option_picker_width = 0
        max_container_width = 0

        # Find the STACKED WIDGET parent that contains both start pos picker and option picker
        for container_id, cont in self.container_widgets.items():
            if cont:
                # Traverse up to find the QStackedWidget that holds both pickers
                parent = cont.parent()
                while parent:
                    if (
                        hasattr(parent, "width")
                        and "StackedWidget" in type(parent).__name__
                        and parent.width() > 1000  # Should be ~1096px
                    ):
                        option_picker_width = parent.width()
                        break
                    parent = parent.parent()

                if option_picker_width > 0:
                    break

        # Also track max container width
        for container_id, cont in self.container_widgets.items():
            if cont and cont.width() > max_container_width:
                max_container_width = cont.width()

        # ALWAYS use option picker width for proper sizing - ignore small container widths
        if option_picker_width > 0:
            base_width = option_picker_width
        else:
            base_width = max_container_width

        if base_width <= 0:
            return self._get_fallback_size()

        # Get main window width for legacy formula
        main_window_width = 0
        try:
            # Try to find main window width by traversing up the widget hierarchy
            for container_id, cont in self.container_widgets.items():
                if cont:
                    parent = cont.parent()
                    while parent:
                        if (
                            hasattr(parent, "width")
                            and "MainWindow" in type(parent).__name__
                        ):
                            main_window_width = parent.width()
                            break
                        parent = parent.parent()
                    if main_window_width > 0:
                        break
        except Exception:
            pass

        # Calculate base size: parent_width // 8
        base_size = base_width // 8

        # Account for borders, padding, and margins to prevent overflow
        # Typical spacing in Qt layouts:
        frame_border = 2  # Frame border width
        container_margin = 4  # Container margins
        layout_spacing = 6  # Spacing between pictographs
        safety_margin = 4  # Extra safety margin

        total_spacing = (
            (2 * frame_border) + (2 * container_margin) + layout_spacing + safety_margin
        )
        calculated_size = base_size - total_spacing

        # Apply reasonable constraints (legacy used no explicit constraints, but we'll be safe)
        unified_size = max(
            60, min(calculated_size, 300)
        )  # Allow larger sizes like legacy

        return unified_size

    def _get_fallback_size(self) -> int:
        """Get fallback size when calculations fail"""
        try:
            screen = QApplication.primaryScreen()
            if screen:
                screen_width = screen.availableGeometry().width()
                container_width = screen_width // 2
                available_width = container_width - 40
                size_per_pictograph = available_width // 8
                return max(60, min(size_per_pictograph, 120))
        except:
            pass
        return 100

    def get_debug_info(self) -> Dict:
        """Get debug information about current sizing state"""
        return {
            "containers": {
                container_id: {
                    "size": self.last_container_sizes.get(container_id, (0, 0)),
                    "frame_count": len(self.pictograph_frames.get(container_id, [])),
                }
                for container_id in self.container_widgets.keys()
            },
            "sizing_in_progress": self.sizing_in_progress,
            "pending_operations": len(self.pending_resize_operations),
        }


# Global instance
_sizing_coordinator = None


def get_sizing_coordinator() -> SizingCoordinator:
    """Get the global sizing coordinator instance"""
    global _sizing_coordinator
    if _sizing_coordinator is None:
        _sizing_coordinator = SizingCoordinator()
    return _sizing_coordinator
