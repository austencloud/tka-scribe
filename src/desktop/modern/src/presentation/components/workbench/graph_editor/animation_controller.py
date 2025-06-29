from typing import Optional, TYPE_CHECKING, Dict, Any
from PyQt6.QtCore import QObject, QPropertyAnimation, QEasingCurve, pyqtSignal, QTimer
from PyQt6.QtWidgets import QFrame
import time

if TYPE_CHECKING:
    from .graph_editor import GraphEditor


class AnimationDebugger:
    """Smart animation debugging system that tracks anomalies without log spam"""

    def __init__(self):
        self.animation_start_time = None
        self.last_positions = {}
        self.milestone_positions = {}
        self.position_jumps = []
        self.timing_discrepancies = []

    def start_animation_tracking(
        self, animation_type: str, start_pos: Any, end_pos: Any
    ):
        """Start tracking an animation"""
        self.animation_start_time = time.time()
        self.last_positions[animation_type] = start_pos
        self.milestone_positions[animation_type] = {}
        print(
            f"🎬 [SYNC DEBUG] Starting {animation_type} animation: {start_pos} → {end_pos}"
        )

    def track_position(self, animation_type: str, current_pos: Any, progress: float):
        """Track position at key milestones"""
        if animation_type not in self.last_positions:
            return

        # Check for position jumps
        last_pos = self.last_positions[animation_type]
        if hasattr(current_pos, "y") and hasattr(last_pos, "y"):
            jump_distance = abs(current_pos.y() - last_pos.y())
            if jump_distance > 20:  # Significant jump detected
                self.position_jumps.append(
                    {
                        "type": animation_type,
                        "from": last_pos,
                        "to": current_pos,
                        "jump": jump_distance,
                        "time": (
                            time.time() - self.animation_start_time
                            if self.animation_start_time
                            else 0
                        ),
                    }
                )
                print(
                    f"⚠️ [SYNC DEBUG] Position jump in {animation_type}: {jump_distance}px at {progress:.1%}"
                )

        # Track milestone positions
        milestone = int(progress * 4) * 25  # 0%, 25%, 50%, 75%, 100%
        if milestone not in self.milestone_positions[animation_type] and milestone in [
            25,
            50,
            75,
            100,
        ]:
            self.milestone_positions[animation_type][milestone] = current_pos
            elapsed = (
                time.time() - self.animation_start_time
                if self.animation_start_time
                else 0
            )
            print(
                f"📍 [SYNC DEBUG] {animation_type} at {milestone}%: {current_pos} (t={elapsed:.2f}s)"
            )

        self.last_positions[animation_type] = current_pos

    def check_synchronization(self, graph_pos: Any, toggle_pos: Any, progress: float):
        """Check if animations are synchronized"""
        if not hasattr(graph_pos, "y") or not hasattr(toggle_pos, "y"):
            return

        # Calculate expected relationship between positions
        # Toggle should be at bottom edge of graph editor
        expected_toggle_y = (
            graph_pos.y() + graph_pos.height()
            if hasattr(graph_pos, "height")
            else graph_pos.y()
        )
        actual_toggle_y = toggle_pos.y()

        sync_error = abs(expected_toggle_y - actual_toggle_y)
        if sync_error > 10:  # Significant desynchronization
            self.timing_discrepancies.append(
                {
                    "progress": progress,
                    "sync_error": sync_error,
                    "graph_pos": graph_pos,
                    "toggle_pos": toggle_pos,
                    "time": (
                        time.time() - self.animation_start_time
                        if self.animation_start_time
                        else 0
                    ),
                }
            )
            print(
                f"🔄 [SYNC DEBUG] Desync detected at {progress:.1%}: {sync_error}px error"
            )

    def finish_animation_tracking(self, animation_type: str):
        """Finish tracking and report summary"""
        if self.position_jumps:
            print(
                f"⚠️ [SYNC DEBUG] {animation_type} had {len(self.position_jumps)} position jumps"
            )
        if self.timing_discrepancies:
            print(
                f"🔄 [SYNC DEBUG] {animation_type} had {len(self.timing_discrepancies)} sync issues"
            )


class GraphEditorAnimationController(QObject):
    """
    Handles all animation-related functionality for the graph editor.

    Responsibilities:
    - Sliding animations (up/down)
    - Height calculations
    - Animation state management
    - Smooth transitions and easing
    - Animation debugging and synchronization
    """

    # Signals
    animation_started = pyqtSignal(bool)  # is_showing
    animation_finished = pyqtSignal(bool)  # is_visible

    def __init__(self, graph_editor: "GraphEditor", parent: Optional[QObject] = None):
        super().__init__(parent)
        self._graph_editor = graph_editor

        # Animation state
        self._animating = False
        self._animation_cooldown_active = (
            False  # Prevents immediate layout interference after animation
        )
        self._animation_target_height: Optional[int] = None

        # Workbench dimensions for height calculations
        self._workbench_width = 800
        self._workbench_height = 600

        # Animation objects
        self._height_animation: Optional[QPropertyAnimation] = None
        self._toggle_position_animation: Optional[QPropertyAnimation] = None

        # Animation debugging system
        self._debugger = AnimationDebugger()
        self._animation_progress_timer: Optional[QTimer] = None

        self._setup_animations()

    def _setup_animations(self) -> None:
        """Setup smooth sliding animation system with debugging"""
        # Single height animation for clean sliding effect
        self._height_animation = QPropertyAnimation(
            self._graph_editor, b"maximumHeight"
        )
        self._height_animation.setDuration(400)  # Slightly longer for smoother feel
        self._height_animation.setEasingCurve(
            QEasingCurve.Type.OutCubic
        )  # Smoother easing

        # Connect animation events
        self._height_animation.finished.connect(self._on_animation_finished)
        self._height_animation.valueChanged.connect(self._on_height_animation_progress)

        # Setup progress tracking timer
        self._animation_progress_timer = QTimer()
        self._animation_progress_timer.timeout.connect(self._track_animation_progress)
        self._animation_progress_timer.setInterval(50)  # Track every 50ms

    def _on_height_animation_progress(self, value):
        """Track height animation progress for debugging"""
        if self._animating:
            start_height = self._height_animation.startValue()
            end_height = self._height_animation.endValue()
            if start_height is not None and end_height is not None:
                progress = (
                    (value - start_height) / (end_height - start_height)
                    if end_height != start_height
                    else 1.0
                )
                self._debugger.track_position("graph_editor", value, progress)

    def _track_animation_progress(self):
        """Track overall animation progress and synchronization"""
        if not self._animating:
            return

        # Get current positions
        graph_height = self._graph_editor.height()
        toggle_tab = getattr(self._graph_editor, "_toggle_tab", None)

        if toggle_tab:
            toggle_pos = toggle_tab.pos()

            # Calculate progress based on height animation
            start_height = self._height_animation.startValue()
            end_height = self._height_animation.endValue()
            if start_height is not None and end_height is not None:
                progress = (
                    (graph_height - start_height) / (end_height - start_height)
                    if end_height != start_height
                    else 1.0
                )
                progress = max(0.0, min(1.0, progress))  # Clamp to [0, 1]

                # Check synchronization
                class GraphPos:
                    def __init__(self, graph_editor, height):
                        self._graph_editor = graph_editor
                        self._height = height

                    def y(self):
                        return self._graph_editor.y()

                    def height(self):
                        return self._height

                graph_pos_obj = GraphPos(self._graph_editor, graph_height)

                # self._debugger.check_synchronization(
                #     graph_pos_obj,
                #     toggle_pos,
                #     progress,
                # )

                # Check for layout interference
                # self._detect_layout_interference()

    def update_workbench_size(self, width: int, height: int) -> None:
        """Update workbench size reference for height calculations"""
        old_width, old_height = self._workbench_width, self._workbench_height
        self._workbench_width = width
        self._workbench_height = height

        is_visible = (
            hasattr(self._graph_editor, "_state_manager")
            and self._graph_editor._state_manager.is_visible()
        )

        print(
            f"🔍 [HEIGHT DEBUG] Workbench size update: {old_width}x{old_height} -> {width}x{height} (visible={is_visible})"
        )

        # If visible and not animating (including cooldown), recalculate size
        if is_visible and not self._animating and not self._animation_cooldown_active:
            print(
                f"🔍 [HEIGHT DEBUG] Workbench size change triggering recalculation..."
            )
            self._recalculate_size_if_needed()
        else:
            print(
                f"🚫 [HEIGHT DEBUG] Blocking workbench size recalculation - visible={is_visible}, animating={self._animating}, cooldown={self._animation_cooldown_active}"
            )

    def get_preferred_height(self) -> int:
        """Calculate preferred height based on workbench dimensions"""
        return min(int(self._workbench_height // 3.5), self._workbench_width // 4)

    def is_animating(self) -> bool:
        """Check if animation is currently in progress or in cooldown period"""
        return self._animating or self._animation_cooldown_active

    def slide_up(self) -> bool:
        """
        Slide the graph editor up from bottom (show) with consistent height.

        Returns:
            bool: True if animation started, False if already visible or animating
        """
        # Check if already visible or animating
        is_visible = (
            hasattr(self._graph_editor, "_state_manager")
            and self._graph_editor._state_manager.is_visible()
        )
        if is_visible or self._animating:
            return False

        print("🔼 Starting slide up animation")
        self._animating = True

        # Update state to visible at animation start
        if hasattr(self._graph_editor, "_state_manager"):
            self._graph_editor._state_manager.set_visibility(True, emit_signal=False)

        # Show the widget first to let Qt establish its natural size
        self._graph_editor.show()

        # Set the preferred height and let Qt determine the actual size
        preferred_height = self.get_preferred_height()
        self._graph_editor.setFixedHeight(preferred_height)

        # Now get the actual height that Qt settled on - this is our animation target
        self._animation_target_height = self._graph_editor.height()
        print(
            f"🎯 Animation target height: {self._animation_target_height}px (preferred: {preferred_height}px)"
        )

        # Reset height constraints for animation
        self._graph_editor.setMaximumHeight(self._animation_target_height)
        self._graph_editor.setMinimumHeight(0)

        # Configure animation from 0 to the actual target height
        self._height_animation.setStartValue(0)
        self._height_animation.setEndValue(self._animation_target_height)

        # Start debugging for this animation
        self._debugger.start_animation_tracking(
            "slide_up", 0, self._animation_target_height
        )

        # Enable real-time sync mode on toggle tab
        toggle_tab = getattr(self._graph_editor, "_toggle_tab", None)
        if toggle_tab and hasattr(toggle_tab, "set_real_time_sync_active"):
            toggle_tab.set_real_time_sync_active(True)

        # Lock graph editor height during animation to prevent external interference
        # self._lock_graph_editor_height_during_animation()

        # Start progress tracking
        self._animation_progress_timer.start()

        # Start synchronized animations (graph editor + toggle tab)
        self._start_synchronized_animations(is_showing=True)

        # Emit signal
        self.animation_started.emit(True)

        return True

    def slide_down(self) -> bool:
        """
        Slide the graph editor down to bottom (hide).

        Returns:
            bool: True if animation started, False if already hidden or animating
        """
        # Check if already hidden or animating
        is_visible = (
            hasattr(self._graph_editor, "_state_manager")
            and self._graph_editor._state_manager.is_visible()
        )
        if not is_visible or self._animating:
            return False

        print("🔽 Starting slide down animation")
        self._animating = True

        # Update state to invisible at animation start
        if hasattr(self._graph_editor, "_state_manager"):
            self._graph_editor._state_manager.set_visibility(False, emit_signal=False)

        # Clear the stored target height since we're hiding
        self._animation_target_height = None

        current_height = self._graph_editor.height()

        # Clear height constraints for smooth animation
        self._graph_editor.setMaximumHeight(16777215)
        self._graph_editor.setMinimumHeight(0)

        # Configure animation from current height to 0
        self._height_animation.setStartValue(current_height)
        self._height_animation.setEndValue(0)

        # Start debugging for this animation
        self._debugger.start_animation_tracking("slide_down", current_height, 0)

        # Enable real-time sync mode on toggle tab
        toggle_tab = getattr(self._graph_editor, "_toggle_tab", None)
        if toggle_tab and hasattr(toggle_tab, "set_real_time_sync_active"):
            toggle_tab.set_real_time_sync_active(True)

        # Lock graph editor height during animation to prevent external interference
        # self._lock_graph_editor_height_during_animation()

        # Start progress tracking
        self._animation_progress_timer.start()

        # Start synchronized animations (graph editor + toggle tab)
        self._start_synchronized_animations(is_showing=False)

        # Emit signal
        self.animation_started.emit(False)

        return True

    def _on_animation_finished(self) -> None:
        """Handle animation completion using stored target height"""
        is_visible = (
            hasattr(self._graph_editor, "_state_manager")
            and self._graph_editor._state_manager.is_visible()
        )
        print(f"✅ Animation finished. Visible: {is_visible}")

        # # CRITICAL FIX: Add a brief delay before allowing layout recalculations
        # # This prevents immediate interference from external layout events
        self._animation_cooldown_active = True
        QTimer.singleShot(100, self._complete_animation_cleanup)  # 100ms delay

        # # Disable real-time sync mode on toggle tab
        # toggle_tab = getattr(self._graph_editor, "_toggle_tab", None)
        # if toggle_tab and hasattr(toggle_tab, "set_real_time_sync_active"):
        #     toggle_tab.set_real_time_sync_active(False)

        # # Unlock graph editor height to allow normal layout updates
        self._unlock_graph_editor_height_after_animation()

        # Stop progress tracking
        if self._animation_progress_timer:
            self._animation_progress_timer.stop()

        # # Finish debugging tracking
        animation_type = "slide_up" if is_visible else "slide_down"
        self._debugger.finish_animation_tracking(animation_type)

        # # Emit signal
        self.animation_finished.emit(is_visible)

    def _complete_animation_cleanup(self) -> None:
        """Complete animation cleanup after cooldown period"""
        is_visible = (
            hasattr(self._graph_editor, "_state_manager")
            and self._graph_editor._state_manager.is_visible()
        )
        current_height = self._graph_editor.height()

        print(
            f"🔓 [ANIMATION DEBUG] Animation cooldown completed - layout recalculations enabled"
        )
        print(
            f"🔍 [HEIGHT DEBUG] Post-cooldown state: height={current_height}px, visible={is_visible}"
        )

        self._animating = False
        self._animation_cooldown_active = False

        # # CRITICAL FIX: Correct height discrepancies after animation
        # target_height = self._animation_target_height
        # if target_height is not None:
        #     height_discrepancy = abs(current_height - target_height)
        #     if height_discrepancy > 5:  # Significant discrepancy
        #         print(
        #             f"🔧 [HEIGHT DEBUG] Correcting height discrepancy: {current_height}px -> {target_height}px (diff: {height_discrepancy}px)"
        #         )

        #         # Apply the correct target height
        #         if is_visible and target_height > 0:
        #             # Expanding: ensure we reach the full target height
        #             self._graph_editor.setFixedHeight(target_height)
        #             print(
        #                 f"✅ [HEIGHT DEBUG] Corrected expand height to: {target_height}px"
        #             )
        #         elif not is_visible and target_height == 0:
        #             # Collapsing: ensure we reach 0 height
        #             self._graph_editor.setFixedHeight(0)
        #             print(f"✅ [HEIGHT DEBUG] Corrected collapse height to: 0px")

        # # CRITICAL DEBUG: Check if height is correct after cooldown
        # final_height = self._graph_editor.height()
        # if not is_visible and final_height > 0:
        #     print(
        #         f"🚨 [HEIGHT DEBUG] CRITICAL: Graph editor has height {final_height}px but should be collapsed!"
        #     )
        #     print(f"🚨 [HEIGHT DEBUG] Forcing collapse to height=0px")
        #     self._graph_editor.setFixedHeight(0)

        # print(
        #     f"🔍 [HEIGHT DEBUG] Animation cleanup complete - monitoring for any subsequent height changes..."
        # )

    def _start_synchronized_animations(self, is_showing: bool) -> None:
        """
        Start synchronized animations for graph editor and toggle tab.
        This replicates the legacy behavior where both animate simultaneously.
        """
        # Clean up any existing toggle tab animation first
        if self._toggle_position_animation:
            self._toggle_position_animation.stop()
            self._toggle_position_animation = None
            print("🧹 [SYNC DEBUG] Cleaned up previous toggle animation")

        # Start the main graph editor height animation
        self._height_animation.start()

        # If we have a toggle tab, animate its position simultaneously
        toggle_tab = getattr(self._graph_editor, "_toggle_tab", None)
        if toggle_tab:
            self._animate_toggle_tab_position(is_showing)

    def _animate_toggle_tab_position(self, is_showing: bool) -> None:
        """
        Animate toggle tab position synchronized with graph editor animation.
        Uses the same timing and easing as the legacy implementation.
        """
        toggle_tab = self._graph_editor._toggle_tab

        # Get parent workbench for positioning calculations
        if (
            not hasattr(self._graph_editor, "_parent_workbench")
            or not self._graph_editor._parent_workbench
        ):
            return

        parent = self._graph_editor._parent_workbench

        # Calculate positions using dynamic geometry (no hard-coded values)
        parent_height = parent.height()
        # parent_width = parent.width()
        toggle_height = toggle_tab.height()
        # toggle_width = toggle_tab.width()

        # Use bottom-left corner positioning (legacy-exact)
        x = 0  # Bottom-left corner positioning (legacy-exact)

        # Get actual current graph editor position and dimensions
        # graph_editor_rect = self._graph_editor.geometry()
        # current_graph_y = graph_editor_rect.y()
        # current_graph_height = graph_editor_rect.height()

        # Calculate dynamic positions based on actual geometry
        from PyQt6.QtCore import QPoint

        if is_showing:
            # Showing: animate from bottom edge to top of graph editor
            start_y = parent_height - toggle_height  # Bottom edge of window

            # Calculate end position based on actual target graph editor position
            # The toggle tab should align with the top edge of the graph editor
            target_graph_bottom_y = parent_height - self._animation_target_height
            end_y = target_graph_bottom_y - toggle_height

            print(
                f"🎬 [SYNC DEBUG] Toggle show animation: parent_h={parent_height}, "
                f"target_graph_h={self._animation_target_height}, toggle_h={toggle_height}"
            )
            print(
                f"🎬 [SYNC DEBUG] Calculated positions: start_y={start_y}, end_y={end_y}"
            )
        else:
            # Hiding: animate from current position to bottom edge
            # Use actual current toggle position as start
            current_toggle_y = toggle_tab.y()
            start_y = current_toggle_y
            end_y = parent_height - toggle_height  # Bottom edge of window

            print(
                f"🎬 [SYNC DEBUG] Toggle hide animation: current_y={current_toggle_y}, "
                f"target_y={end_y}"
            )

        # Validate positions to prevent off-screen positioning
        start_y = max(0, min(start_y, parent_height - toggle_height))
        end_y = max(0, min(end_y, parent_height - toggle_height))

        start_pos = QPoint(x, start_y)
        end_pos = QPoint(x, end_y)

        # Create and configure toggle tab position animation
        if not self._toggle_position_animation:
            self._toggle_position_animation = QPropertyAnimation(toggle_tab, b"pos")

        # Use same timing and easing as graph editor animation (legacy-exact)
        self._toggle_position_animation.setDuration(400)  # Match graph editor animation
        self._toggle_position_animation.setEasingCurve(
            QEasingCurve.Type.OutCubic
        )  # Match graph editor easing

        # Set animation values
        self._toggle_position_animation.setStartValue(start_pos)
        self._toggle_position_animation.setEndValue(end_pos)

        # Start debugging for toggle tab animation
        animation_type = "toggle_tab_show" if is_showing else "toggle_tab_hide"
        self._debugger.start_animation_tracking(animation_type, start_pos, end_pos)

        # Connect progress tracking for toggle tab
        if hasattr(self._toggle_position_animation, "valueChanged"):
            self._toggle_position_animation.valueChanged.connect(
                lambda pos: self._debugger.track_position(
                    animation_type,
                    pos,
                    self._calculate_toggle_progress(start_pos, end_pos, pos),
                )
            )

        # CRITICAL: Connect toggle tab to graph editor height changes for real-time sync
        self._height_animation.valueChanged.connect(
            lambda height: self._sync_toggle_to_graph_height(height, is_showing)
        )

        # Don't start the separate toggle animation - use real-time sync instead
        # self._toggle_position_animation.start()  # Disabled for real-time sync
        print(
            "🔄 [SYNC DEBUG] Using real-time synchronization instead of separate toggle animation"
        )

        print(
            f"🎬 [SYNC DEBUG] Both animations started - Graph: {self._height_animation.state()}, Toggle: {self._toggle_position_animation.state()}"
        )

    def _calculate_toggle_progress(self, start_pos, end_pos, current_pos):
        """Calculate animation progress for toggle tab"""
        if (
            not hasattr(start_pos, "y")
            or not hasattr(end_pos, "y")
            or not hasattr(current_pos, "y")
        ):
            return 0.0

        total_distance = abs(end_pos.y() - start_pos.y())
        if total_distance == 0:
            return 1.0

        current_distance = abs(current_pos.y() - start_pos.y())
        return min(1.0, current_distance / total_distance)

    def _sync_toggle_to_graph_height(self, graph_height: int, is_showing: bool):
        """Synchronize toggle tab position to actual graph editor height in real-time"""
        toggle_tab = getattr(self._graph_editor, "_toggle_tab", None)
        if not toggle_tab or not self._animating:
            return

        parent = self._graph_editor._parent_workbench
        if not parent:
            return

        # Calculate toggle tab position based on actual graph editor position
        toggle_height = toggle_tab.height()

        # CRITICAL FIX: Use actual graph editor position relative to workbench
        # Get the graph editor's actual position within the workbench coordinate system
        graph_editor_rect = self._graph_editor.geometry()

        # Safety check: ensure graph editor has valid geometry
        if graph_editor_rect.height() <= 0:
            print(
                f"⚠️ [SYNC DEBUG] Graph editor has invalid geometry: {graph_editor_rect}"
            )
            return

        # Map the graph editor's top-left corner to workbench coordinates
        workbench_pos = self._graph_editor.mapTo(parent, graph_editor_rect.topLeft())

        print(
            f"🔍 [SYNC DEBUG] Graph editor rect: {graph_editor_rect}, workbench_pos: {workbench_pos}"
        )

        # The toggle tab's bottom edge should align with graph editor's top edge
        # So toggle tab's top edge should be at: graph_editor_top_y - toggle_height
        target_y = workbench_pos.y() - toggle_height

        # Update toggle tab position to match graph editor
        from PyQt6.QtCore import QPoint

        new_pos = QPoint(0, target_y)

        # Only update if position changed significantly (avoid micro-adjustments)
        current_pos = toggle_tab.pos()
        if abs(current_pos.y() - target_y) > 2:
            toggle_tab.move(new_pos)
            print(
                f"🔄 [SYNC DEBUG] Real-time sync: graph_h={graph_height}, graph_top={workbench_pos.y()}, toggle_y={target_y}"
            )

    def _detect_layout_interference(self):
        """Detect if external layout updates are interfering with animations"""
        if not self._animating:
            return

        # Check if graph editor position/size changed unexpectedly during animation
        current_height = self._graph_editor.height()
        expected_height = (
            self._height_animation.currentValue() if self._height_animation else None
        )

        if expected_height is not None:
            height_discrepancy = abs(current_height - expected_height)
            if height_discrepancy > 5:  # Significant discrepancy
                print(
                    f"⚠️ [SYNC DEBUG] Layout interference detected: "
                    f"expected_h={expected_height}, actual_h={current_height}, "
                    f"discrepancy={height_discrepancy}px"
                )

        # Check toggle tab position consistency
        # toggle_tab = getattr(self._graph_editor, "_toggle_tab", None)
        # if toggle_tab and self._toggle_position_animation:
        #     current_pos = toggle_tab.pos()
        #     expected_pos = self._toggle_position_animation.currentValue()
        #     if (
        #         expected_pos
        #         and hasattr(expected_pos, "y")
        #         and hasattr(current_pos, "y")
        #     ):
        #         pos_discrepancy = abs(current_pos.y() - expected_pos.y())
        #         if pos_discrepancy > 5:  # Significant discrepancy
        #             print(
        #                 f"⚠️ [SYNC DEBUG] Toggle position interference: "
        #                 f"expected_y={expected_pos.y()}, actual_y={current_pos.y()}, "
        #                 f"discrepancy={pos_discrepancy}px"
        #             )

    def _recalculate_size_if_needed(self) -> None:
        """Recalculate and apply new size if needed (only when not animating)"""
        if self._animating or self._animation_cooldown_active:
            print(
                "🚫 [SYNC DEBUG] Blocking size recalculation during animation/cooldown"
            )
            return  # Never interfere with ongoing animations or cooldown period

        new_height = self.get_preferred_height()
        current_height = self._graph_editor.height()

        # CRITICAL DEBUG: Track all height recalculation attempts
        is_visible = (
            hasattr(self._graph_editor, "_state_manager")
            and self._graph_editor._state_manager.is_visible()
        )
        print(
            f"🔍 [HEIGHT DEBUG] Recalculate check: current={current_height}px, new={new_height}px, visible={is_visible}"
        )

        # Only update if there's a significant difference (avoid micro-adjustments)
        if abs(new_height - current_height) > 5:
            print(
                f"📏 [HEIGHT DEBUG] APPLYING height change: {current_height} -> {new_height} (visible={is_visible})"
            )

            # CRITICAL: Check if we're trying to set height when graph editor should be collapsed
            if not is_visible and new_height > 0:
                print(
                    f"🚨 [HEIGHT DEBUG] WARNING: Attempting to set height {new_height}px when graph editor should be collapsed!"
                )
                print(
                    f"🚨 [HEIGHT DEBUG] Call stack trace needed - this should not happen!"
                )
                return  # Prevent unwanted reopening

            self._graph_editor.setFixedHeight(new_height)
        else:
            print(
                f"🔍 [HEIGHT DEBUG] Skipping height change: difference {abs(new_height - current_height)}px too small"
            )

    def _lock_graph_editor_height_during_animation(self):
        """Lock graph editor height to prevent external layout interference during animation"""
        # Store original size policies and constraints
        self._original_size_policy = self._graph_editor.sizePolicy()
        self._original_min_height = self._graph_editor.minimumHeight()
        self._original_max_height = self._graph_editor.maximumHeight()

        # Set fixed size policy to prevent external layout changes
        from PyQt6.QtWidgets import QSizePolicy

        fixed_policy = QSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
        self._graph_editor.setSizePolicy(fixed_policy)

        # Override resize methods to prevent external height changes
        self._original_resize_event = self._graph_editor.resizeEvent
        self._original_set_fixed_height = self._graph_editor.setFixedHeight

        def locked_resize_event(event):
            print(
                f"🚫 [SYNC DEBUG] Blocked resize event during animation: {event.size().height()}px"
            )
            # Don't call the original resize event during animation

        def locked_set_fixed_height(height):
            print(
                f"🚫 [SYNC DEBUG] Blocked setFixedHeight during animation: {height}px"
            )
            # Don't allow external height changes during animation

        self._graph_editor.resizeEvent = locked_resize_event
        self._graph_editor.setFixedHeight = locked_set_fixed_height

        print("🔒 [SYNC DEBUG] Graph editor height LOCKED during animation")

    def _unlock_graph_editor_height_after_animation(self):
        """Unlock graph editor height to allow normal layout updates after animation"""
        # Restore original size policies and constraints
        if hasattr(self, "_original_size_policy"):
            self._graph_editor.setSizePolicy(self._original_size_policy)
        if hasattr(self, "_original_min_height"):
            self._graph_editor.setMinimumHeight(self._original_min_height)
        if hasattr(self, "_original_max_height"):
            self._graph_editor.setMaximumHeight(self._original_max_height)

        # Restore original methods
        if hasattr(self, "_original_resize_event"):
            self._graph_editor.resizeEvent = self._original_resize_event
        if hasattr(self, "_original_set_fixed_height"):
            self._graph_editor.setFixedHeight = self._original_set_fixed_height

        print("🔓 [SYNC DEBUG] Graph editor height UNLOCKED after animation")
