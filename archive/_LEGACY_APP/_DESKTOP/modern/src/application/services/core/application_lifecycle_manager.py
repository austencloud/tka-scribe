"""
Application Lifecycle Manager

Pure service for managing application lifecycle and startup sequence.
Extracted from TKAStudioModern to follow single responsibility principle.

PROVIDES:
- Application initialization sequence
- Window positioning and sizing
- Parallel testing mode detection
- Screen detection and multi-monitor support
- API server startup coordination
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Callable

from PyQt6.QtGui import QGuiApplication
from PyQt6.QtWidgets import QMainWindow

# Import session service interface
from desktop.modern.src.core.interfaces.session_services import (
    ISessionStateTracker,
    SessionState,
)


class IApplicationLifecycleManager(ABC):
    """Interface for application lifecycle operations."""

    @abstractmethod
    def initialize_application(
        self,
        main_window: QMainWindow,
        target_screen=None,
        parallel_mode=False,
        parallel_geometry=None,
        progress_callback: Callable | None = None,
    ) -> None:
        """Initialize application with proper lifecycle management."""

    @abstractmethod
    def set_window_dimensions(
        self,
        main_window: QMainWindow,
        target_screen=None,
        parallel_mode=False,
        parallel_geometry=None,
    ) -> None:
        """Set window dimensions using modern responsive design."""


class ApplicationLifecycleManager(IApplicationLifecycleManager):
    """
    Pure service for application lifecycle management.

    Handles application initialization, window management, and startup coordination
    without business logic dependencies. Uses clean separation of concerns.
    """

    def __init__(self, session_service: ISessionStateTracker | None = None):
        """Initialize application lifecycle manager."""
        self.api_enabled = True
        self._session_service = session_service
        self._pending_session_data = None

    def initialize_application(
        self,
        main_window: QMainWindow,
        target_screen=None,
        parallel_mode=False,
        parallel_geometry=None,
        progress_callback: Callable | None = None,
    ) -> None:
        """Initialize application with proper lifecycle management."""
        if progress_callback:
            progress_callback(10, "Initializing application lifecycle...")

        # Set window title based on mode
        if parallel_mode:
            main_window.setWindowTitle("TKA Modern - Parallel Testing")
        else:
            main_window.setWindowTitle("🚀 Kinetic Constructor")

        # Set window dimensions
        self.set_window_dimensions(
            main_window, target_screen, parallel_mode, parallel_geometry
        )

        if progress_callback:
            progress_callback(85, "Restoring previous session...")

        # NEW: Restore session state if available
        if self._session_service:
            try:
                restore_result = self._session_service.load_session_state()

                if restore_result.success and restore_result.session_restored:
                    self._pending_session_data = restore_result.session_data
                elif restore_result.warnings:
                    for warning in restore_result.warnings:
                        print(f"⚠️ Session warning: {warning}")
            except Exception as e:
                print(f"⚠️ Failed to restore session: {e}")
                # Continue without session restoration

        if progress_callback:
            progress_callback(90, "Session restoration complete")

        if progress_callback:
            progress_callback(95, "Application lifecycle initialized")

    def trigger_deferred_session_restoration(self):
        """Trigger session restoration after UI components are ready."""
        if self._pending_session_data:
            self._apply_restored_session_to_ui(self._pending_session_data)
            self._pending_session_data = None  # Clear after use

    def _apply_restored_session_to_ui(self, session_data: SessionState):
        """Apply restored session data to UI components."""
        try:
            from desktop.modern.src.core.events.event_bus import (
                EventPriority,
                UIEvent,
                get_event_bus,
            )

            # Get event bus for publishing restoration events
            event_bus = get_event_bus()

            # Restore sequence if available
            if session_data.current_sequence_id and session_data.current_sequence_data:
                # Convert sequence data back to SequenceData object if needed
                sequence_data = session_data.current_sequence_data
                if isinstance(sequence_data, dict):
                    from desktop.modern.src.domain.models.beat_data import BeatData
                    from desktop.modern.src.domain.models.sequence_data import (
                        SequenceData,
                    )

                    beats_data = sequence_data.get("beats", [])

                    # Convert beat dicts back to BeatData objects
                    beat_objects = []
                    for beat_dict in beats_data:
                        if isinstance(beat_dict, dict):
                            beat_obj = BeatData.from_dict(beat_dict)
                            beat_objects.append(beat_obj)
                        else:
                            beat_objects.append(beat_dict)

                    # Convert dict back to SequenceData object
                    sequence_data = SequenceData(
                        id=sequence_data.get("id", session_data.current_sequence_id),
                        name=sequence_data.get("name", "Restored Sequence"),
                        beats=beat_objects,
                    )

                    # CRITICAL FIX: Recalculate sequence name from beat letters exactly like legacy
                    if beat_objects:
                        calculated_word = self._calculate_sequence_word_from_beats(
                            beat_objects
                        )
                        sequence_data = sequence_data.update(name=calculated_word)
                # CRITICAL FIX: Also recalculate name for existing SequenceData objects
                elif sequence_data.beats:
                    calculated_word = self._calculate_sequence_word_from_beats(
                        sequence_data.beats
                    )
                    sequence_data = sequence_data.update(name=calculated_word)

                # Publish sequence restoration event
                event = UIEvent(
                    component="session_restoration",
                    action="sequence_restored",
                    state_data={
                        "sequence_data": sequence_data,
                        "sequence_id": session_data.current_sequence_id,
                        "selected_beat_index": session_data.selected_beat_index,
                        "start_position_data": session_data.start_position_data,
                    },
                    source="application_lifecycle_manager",
                    priority=EventPriority.HIGH,
                )
                event_bus.publish(event)

            # Restore UI state
            if session_data.active_tab:
                event = UIEvent(
                    component="session_restoration",
                    action="tab_restored",
                    state_data={"active_tab": session_data.active_tab},
                    source="application_lifecycle_manager",
                    priority=EventPriority.HIGH,
                )
                event_bus.publish(event)

        except Exception as e:
            print(f"⚠️ Failed to apply restored session to UI: {e}")

    def set_window_dimensions(
        self,
        main_window: QMainWindow,
        target_screen=None,
        parallel_mode=False,
        parallel_geometry=None,
    ) -> None:
        """Set window dimensions using modern responsive design: 90% of screen size."""
        # Check for parallel testing mode first
        if parallel_mode and parallel_geometry:
            try:
                x, y, width, height = map(int, parallel_geometry.split(","))
                main_window.setGeometry(x, y, width, height)
                main_window.setMinimumSize(1400, 900)
                print(f"🔄 Modern positioned at: {x},{y} ({width}x{height})")
                return
            except Exception as e:
                print(f"⚠️ Failed to apply parallel testing geometry: {e}")
                # Fall through to normal positioning

        # Use target screen for consistent positioning
        screen = target_screen or QGuiApplication.primaryScreen()

        if not screen:
            main_window.setGeometry(100, 100, 1400, 900)
            main_window.setMinimumSize(1400, 900)
            return

        # Calculate responsive dimensions (90% of screen)
        available_geometry = screen.availableGeometry()
        window_width = int(available_geometry.width() * 0.9)
        window_height = int(available_geometry.height() * 0.9)
        x = available_geometry.x() + int(
            (available_geometry.width() - window_width) / 2
        )
        y = available_geometry.y() + int(
            (available_geometry.height() - window_height) / 2
        )

        main_window.setGeometry(x, y, window_width, window_height)
        main_window.setMinimumSize(1400, 900)

    def determine_target_screen(self, parallel_mode=False, monitor=""):
        """Determine target screen for application placement."""
        screens = QGuiApplication.screens()

        # Override screen selection for parallel testing
        if parallel_mode and len(screens) > 1:
            if monitor in ["secondary", "right"]:
                # Determine which screen is physically on the right
                primary_screen = screens[0]
                secondary_screen = screens[1]

                # If secondary has higher X coordinate, it's on the right
                if secondary_screen.geometry().x() > primary_screen.geometry().x():
                    target_screen = secondary_screen
                    print(
                        "🔄 Modern forced to RIGHT monitor (secondary) for parallel testing"
                    )
                else:
                    target_screen = primary_screen
                    print(
                        "🔄 Modern forced to RIGHT monitor (primary) for parallel testing"
                    )

            elif monitor in ["primary", "left"]:
                # Determine which screen is physically on the left
                primary_screen = screens[0]
                secondary_screen = screens[1]

                # If secondary has lower X coordinate, it's on the left
                if secondary_screen.geometry().x() < primary_screen.geometry().x():
                    target_screen = secondary_screen
                    print(
                        "🔄 Modern forced to LEFT monitor (secondary) for parallel testing"
                    )
                else:
                    target_screen = primary_screen
                    print(
                        "🔄 Modern forced to LEFT monitor (primary) for parallel testing"
                    )
            else:
                target_screen = screens[1]  # Default to secondary
        else:
            # Normal behavior: prefer secondary monitor if available
            target_screen = (
                screens[1] if len(screens) > 1 else QGuiApplication.primaryScreen()
            )

        return target_screen

    def get_application_info(self) -> dict:
        """Get application information and status."""
        return {
            "title": "🚀 Kinetic Constructor",
            "version": "Modern",
            "api_enabled": self.api_enabled,
            "minimum_size": (1400, 900),
            "responsive_sizing": True,
        }

    def validate_screen_configuration(self) -> dict:
        """Validate screen configuration and return status."""
        screens = QGuiApplication.screens()
        primary_screen = QGuiApplication.primaryScreen()

        return {
            "screen_count": len(screens),
            "primary_screen_available": primary_screen is not None,
            "multi_monitor_support": len(screens) > 1,
            "screen_geometries": [
                {
                    "index": i,
                    "geometry": screen.geometry(),
                    "available_geometry": screen.availableGeometry(),
                }
                for i, screen in enumerate(screens)
            ],
        }

    def cleanup_application(self) -> None:
        """Clean up application and save session state."""
        # NEW: Save current session state before cleanup
        if self._session_service:
            try:
                success = self._session_service.save_session_state()
                if success:
                    print("✅ Session state saved successfully")
                else:
                    print("⚠️ Failed to save session state")
            except Exception as e:
                print(f"⚠️ Failed to save session state: {e}")

        # Additional cleanup can be added here as needed
        print("🧹 Application cleanup completed")

    def set_session_service(self, session_service: ISessionStateTracker) -> None:
        """Set the session service for lifecycle integration."""
        self._session_service = session_service

    def _calculate_sequence_word_from_beats(self, beat_objects) -> str:
        """Calculate sequence word from beat letters exactly like legacy SequencePropertiesManager"""
        if not beat_objects:
            return ""

        # Extract letters from beats exactly like legacy calculate_word method
        word = "".join(beat.letter for beat in beat_objects if hasattr(beat, "letter"))

        # Apply word simplification for circular sequences like legacy
        return self._simplify_repeated_word(word)

    def _simplify_repeated_word(self, word: str) -> str:
        """Simplify repeated patterns exactly like legacy WordSimplifier"""

        def can_form_by_repeating(s: str, pattern: str) -> bool:
            pattern_len = len(pattern)
            return all(
                s[i : i + pattern_len] == pattern for i in range(0, len(s), pattern_len)
            )

        n = len(word)
        for i in range(1, n // 2 + 1):
            pattern = word[:i]
            if n % i == 0 and can_form_by_repeating(word, pattern):
                return pattern
        return word
