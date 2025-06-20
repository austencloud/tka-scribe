"""
Lightweight UI state management for TKA Desktop.

Provides centralized UI state management without Redux complexity,
complementing existing event-driven architecture.
"""

import json
from typing import Dict, Any, Optional, Callable, List
from pathlib import Path
from datetime import datetime
from core.events import IEventBus, UIStateChangedEvent
from core.types.result import Result
from core.logging.structured_logger import get_logger, LogContext

logger = get_logger(__name__)


class UIStateManager:
    """
    Lightweight UI state management for TKA Desktop.

    Centralizes UI-specific state (tabs, theme, window size, etc.) without
    the complexity of Redux patterns. Works with existing event bus and
    service architecture.

    Usage:
        ui_state = UIStateManager()
        ui_state.set_current_tab('construct')
        ui_state.set_theme('dark')

        # Subscribe to changes
        ui_state.subscribe(lambda key, old, new: print(f"{key} changed"))

        # Get state
        current_tab = ui_state.get('current_tab')
        all_state = ui_state.get_all()
    """

    def __init__(self, event_bus: Optional[IEventBus] = None):
        self.event_bus = event_bus
        self.subscribers: List[Callable[[str, Any, Any], None]] = []

        # Initialize default UI state
        self.ui_state: Dict[str, Any] = {
            # Navigation state
            "current_tab": "construct",
            "current_sequence_id": None,
            "current_beat": None,
            # UI appearance
            "theme": "dark",
            "window_size": {"width": 1400, "height": 900},
            "sidebar_visible": True,
            "toolbar_visible": True,
            # UI behavior
            "auto_save_enabled": True,
            "animations_enabled": True,
            "show_tooltips": True,
            # Modal and overlay state
            "modal_open": None,
            "loading": {"active": False, "message": ""},
            "notifications": [],
            # Editor state
            "editing_mode": False,
            "selected_beat_numbers": [],
            "zoom_level": 1.0,
            # Layout state
            "splitter_positions": {},
            "panel_visibility": {
                "sequence_browser": True,
                "beat_frame": True,
                "option_picker": True,
                "timeline": True,
            },
        }

        logger.info(
            "UI State Manager initialized",
            context=LogContext(operation="ui_state_init", component="ui_state_manager"),
            state_keys=list(self.ui_state.keys()),
        )

    def get(self, key: str, default: Any = None) -> Any:
        """
        Get UI state value by key.

        Args:
            key: State key (supports dot notation for nested values)
            default: Default value if key not found

        Returns:
            State value or default
        """
        try:
            # Support dot notation for nested keys
            keys = key.split(".")
            current = self.ui_state

            for k in keys:
                current = current[k]

            return current
        except (KeyError, TypeError):
            return default

    def set(self, key: str, value: Any) -> Result[None, Exception]:
        """
        Set UI state value.

        Args:
            key: State key (supports dot notation for nested values)
            value: New value

        Returns:
            Result indicating success/failure
        """
        try:
            old_value = self.get(key)

            # Support dot notation for nested keys
            keys = key.split(".")
            current = self.ui_state

            # Navigate to parent of target key
            for k in keys[:-1]:
                if k not in current:
                    current[k] = {}
                current = current[k]

            # Set the value
            current[keys[-1]] = value

            # Notify subscribers and event bus
            self._notify_change(key, old_value, value)

            logger.debug(
                "UI state updated",
                context=LogContext(
                    operation="ui_state_update", component="ui_state_manager"
                ),
                key=key,
                old_value=str(old_value)[:100],  # Truncate for logging
                new_value=str(value)[:100],
            )

            return Result.ok(None)

        except Exception as e:
            logger.error(
                "Failed to update UI state",
                error=e,
                context=LogContext(
                    operation="ui_state_update_error", component="ui_state_manager"
                ),
                key=key,
                value=str(value)[:100],
            )
            return Result.error(e)

    def get_all(self) -> Dict[str, Any]:
        """Get all UI state as a dictionary."""
        return self.ui_state.copy()

    def update_multiple(self, updates: Dict[str, Any]) -> Result[None, Exception]:
        """
        Update multiple UI state values at once.

        Args:
            updates: Dictionary of key-value pairs to update

        Returns:
            Result indicating success/failure
        """
        try:
            for key, value in updates.items():
                result = self.set(key, value)
                if result.is_error():
                    return result

            return Result.ok(None)

        except Exception as e:
            return Result.error(e)

    def subscribe(self, callback: Callable[[str, Any, Any], None]):
        """
        Subscribe to UI state changes.

        Args:
            callback: Function called with (key, old_value, new_value) on changes
        """
        self.subscribers.append(callback)

        logger.debug(
            "UI state subscriber added",
            context=LogContext(
                operation="ui_state_subscribe", component="ui_state_manager"
            ),
            subscriber_count=len(self.subscribers),
        )

    def unsubscribe(self, callback: Callable):
        """Remove a UI state change subscriber."""
        if callback in self.subscribers:
            self.subscribers.remove(callback)

    def reset_to_defaults(self) -> Result[None, Exception]:
        """Reset UI state to default values."""
        try:
            old_state = self.ui_state.copy()

            # Reset to defaults (reinitialize)
            self.__init__(self.event_bus)

            # Notify of complete state change
            self._notify_change("*", old_state, self.ui_state)

            logger.info(
                "UI state reset to defaults",
                context=LogContext(
                    operation="ui_state_reset", component="ui_state_manager"
                ),
            )

            return Result.ok(None)

        except Exception as e:
            logger.error(
                "Failed to reset UI state",
                error=e,
                context=LogContext(
                    operation="ui_state_reset_error", component="ui_state_manager"
                ),
            )
            return Result.error(e)

    def save_to_file(self, file_path: Path) -> Result[None, Exception]:
        """
        Save UI state to file for persistence.

        Args:
            file_path: Path to save state file

        Returns:
            Result indicating success/failure
        """
        try:
            state_data = {
                "ui_state": self.ui_state,
                "saved_at": datetime.utcnow().isoformat(),
                "version": "1.0",
            }

            # Ensure directory exists
            file_path.parent.mkdir(parents=True, exist_ok=True)

            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(state_data, f, indent=2, ensure_ascii=False)

            logger.info(
                "UI state saved to file",
                context=LogContext(
                    operation="ui_state_save", component="ui_state_manager"
                ),
                file_path=str(file_path),
            )

            return Result.ok(None)

        except Exception as e:
            logger.error(
                "Failed to save UI state",
                error=e,
                context=LogContext(
                    operation="ui_state_save_error", component="ui_state_manager"
                ),
                file_path=str(file_path),
            )
            return Result.error(e)

    def load_from_file(self, file_path: Path) -> Result[None, Exception]:
        """
        Load UI state from file.

        Args:
            file_path: Path to state file

        Returns:
            Result indicating success/failure
        """
        try:
            if not file_path.exists():
                return Result.error(
                    FileNotFoundError(f"UI state file not found: {file_path}")
                )

            with open(file_path, "r", encoding="utf-8") as f:
                state_data = json.load(f)

            # Merge loaded state with defaults (in case new keys were added)
            loaded_state = state_data.get("ui_state", {})
            old_state = self.ui_state.copy()

            # Update state while preserving new defaults
            for key, value in loaded_state.items():
                if key in self.ui_state:  # Only load known keys
                    self.ui_state[key] = value

            # Notify of state change
            self._notify_change("*", old_state, self.ui_state)

            logger.info(
                "UI state loaded from file",
                context=LogContext(
                    operation="ui_state_load", component="ui_state_manager"
                ),
                file_path=str(file_path),
                version=state_data.get("version", "unknown"),
            )

            return Result.ok(None)

        except Exception as e:
            logger.error(
                "Failed to load UI state",
                error=e,
                context=LogContext(
                    operation="ui_state_load_error", component="ui_state_manager"
                ),
                file_path=str(file_path),
            )
            return Result.error(e)

    def _notify_change(self, key: str, old_value: Any, new_value: Any):
        """Notify subscribers and event bus of state change."""
        # Notify direct subscribers
        for subscriber in self.subscribers:
            try:
                subscriber(key, old_value, new_value)
            except Exception as e:
                logger.warning(
                    "UI state subscriber error",
                    error=e,
                    context=LogContext(
                        operation="ui_state_subscriber_error",
                        component="ui_state_manager",
                    ),
                    key=key,
                )

        # Notify via event bus if available
        if self.event_bus:
            try:
                event = UIStateChangedEvent(
                    component="ui_state_manager",
                    state_key=key,
                    old_value=old_value,
                    new_value=new_value,
                )
                self.event_bus.publish(event)
            except Exception as e:
                logger.warning(
                    "Failed to publish UI state change event",
                    error=e,
                    context=LogContext(
                        operation="ui_state_event_error", component="ui_state_manager"
                    ),
                    key=key,
                )


# Global UI state manager instance
ui_state_manager: Optional[UIStateManager] = None


def get_ui_state_manager(event_bus: Optional[IEventBus] = None) -> UIStateManager:
    """Get or create global UI state manager instance."""
    global ui_state_manager
    if ui_state_manager is None:
        ui_state_manager = UIStateManager(event_bus)
    return ui_state_manager
