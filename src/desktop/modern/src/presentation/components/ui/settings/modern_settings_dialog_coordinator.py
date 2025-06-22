"""
Modern Settings Dialog - Coordinator Pattern Implementation

Ports the sophisticated Legacy settings dialog architecture to Modern,
maintaining the beautiful glassmorphism design while integrating with
Modern's dependency injection system.
"""

from typing import TYPE_CHECKING, Dict, Any
from PyQt6.QtCore import QObject, pyqtSignal, QEvent, Qt
from PyQt6.QtWidgets import QDialog
import logging

if TYPE_CHECKING:
    from src.core.interfaces.core_services import IUIStateManagementService

logger = logging.getLogger(__name__)


class ModernSettingsDialogCoordinator(QObject):
    """
    Coordinates all settings dialog components following SRP.
    
    Ported from Legacy's sophisticated architecture while adapting
    to Modern's dependency injection system.
    
    Responsibilities:
    - Orchestrate component initialization
    - Coordinate component interactions  
    - Handle dialog lifecycle events
    - Maintain component references
    """

    # Signals
    settings_applied = pyqtSignal(bool)  # success
    dialog_closed = pyqtSignal()

    def __init__(
        self,
        dialog: QDialog,
        ui_state_service: "IUIStateManagementService",
    ):
        super().__init__(dialog)
        self.dialog = dialog
        self.ui_state_service = ui_state_service

        # Component managers
        self.config_manager = None
        self.layout_manager = None
        self.styling_manager = None
        self.tab_manager = None
        self.event_coordinator = None

        # Component references
        self.components: Dict[str, Any] = {}
        self.tabs: Dict[str, Any] = {}

        # Drag functionality for frameless window
        self.drag_position = None

        # Initialize services
        self._initialize_services()

    def _initialize_services(self):
        """Initialize core services and managers."""
        try:
            # Initialize services through Modern's dependency injection
            self._initialize_tab_services()
            
            # Initialize state manager for settings
            from .core.modern_settings_state_manager import ModernSettingsStateManager
            self.state_manager = ModernSettingsStateManager(self.ui_state_service)

            logger.debug("Modern settings services initialized")

        except Exception as e:
            logger.error(f"Error initializing services: {e}")
            raise

    def _initialize_tab_services(self):
        """Initialize all tab-specific services using Modern's architecture."""
        from src.application.services.settings.user_profile_service import UserProfileService
        from src.application.services.settings.prop_type_service import PropTypeService
        from src.application.services.settings.visibility_service import VisibilityService
        from src.application.services.settings.beat_layout_service import BeatLayoutService
        from src.application.services.settings.image_export_service import ImageExportService
        from src.application.services.settings.background_service import BackgroundService

        self.user_service = UserProfileService()
        self.prop_service = PropTypeService()
        self.visibility_service = VisibilityService()
        self.layout_service = BeatLayoutService()
        self.export_service = ImageExportService()
        self.background_service = BackgroundService()

    def initialize_dialog(self):
        """Initialize the complete dialog with all components."""
        try:
            logger.info("Initializing modern settings dialog coordinator...")

            # Initialize component managers
            self._initialize_managers()

            # Setup dialog configuration
            self.config_manager.setup_dialog()

            # Setup layout and get component references
            self.components = self.layout_manager.setup_layout()

            # Create and setup tabs
            self.tabs = self.tab_manager.create_tabs(
                self.components["sidebar"], self.components["content_area"]
            )

            # Setup event handling
            self.event_coordinator.setup_connections(self.components, self.tabs)

            # Apply styling
            self.styling_manager.apply_styling(self.components, self.tabs)

            # Connect coordinator signals
            self._connect_coordinator_signals()

            logger.info("Modern settings dialog coordinator initialized successfully")

        except Exception as e:
            logger.error(f"Error initializing dialog coordinator: {e}")
            raise

    def _initialize_managers(self):
        """Initialize all component managers."""
        from .core.modern_dialog_configuration_manager import ModernDialogConfigurationManager
        from .core.modern_dialog_layout_manager import ModernDialogLayoutManager
        from .core.modern_dialog_styling_manager import ModernDialogStylingManager
        from .tabs.modern_settings_tab_manager import ModernSettingsTabManager
        from .events.modern_settings_event_coordinator import ModernSettingsEventCoordinator

        self.config_manager = ModernDialogConfigurationManager(self.dialog)
        self.layout_manager = ModernDialogLayoutManager(self.dialog)
        self.styling_manager = ModernDialogStylingManager(self.dialog)
        self.tab_manager = ModernSettingsTabManager(
            self.user_service,
            self.prop_service, 
            self.visibility_service,
            self.layout_service,
            self.export_service,
            self.background_service,
            self.state_manager,
            self.dialog
        )
        self.event_coordinator = ModernSettingsEventCoordinator(
            self.state_manager,
            self.tab_manager,
            self
        )

    def _connect_coordinator_signals(self):
        """Connect coordinator-level signals."""
        # Forward event coordinator signals
        self.event_coordinator.settings_applied.connect(self.settings_applied.emit)
        self.event_coordinator.dialog_closed.connect(self._handle_dialog_close)

    def _handle_dialog_close(self):
        """Handle dialog close request."""
        self.dialog_closed.emit()
        self.dialog.reject()

    def show_dialog(self):
        """Show the dialog and handle show event."""
        try:
            # Center the dialog when shown
            self.config_manager.center_dialog()

            # Restore last selected tab
            self._restore_last_selected_tab()

            # Update specific tabs
            tab_order = self.tab_manager.get_tab_order()
            last_tab = self._get_last_selected_tab()
            self.event_coordinator.update_tab_on_show(last_tab or tab_order[0])

        except Exception as e:
            logger.error(f"Error in show dialog: {e}")

    def _restore_last_selected_tab(self):
        """Restore the last selected tab."""
        try:
            last_tab = self._get_last_selected_tab()
            if last_tab:
                tab_order = self.tab_manager.get_tab_order()
                if last_tab in tab_order:
                    tab_index = tab_order.index(last_tab)
                    self.components["sidebar"].setCurrentRow(tab_index)
                    self.components["content_area"].setCurrentIndex(tab_index)
        except Exception as e:
            logger.error(f"Error restoring last selected tab: {e}")

    def _get_last_selected_tab(self) -> str:
        """Get the last selected tab from settings."""
        try:
            # Use Modern's UI state service
            return self.ui_state_service.get_last_settings_tab()
        except Exception as e:
            logger.error(f"Error getting last selected tab: {e}")
        return None

    def handle_mouse_press(self, event):
        """Handle mouse press for dragging frameless dialog."""
        if event.button() == Qt.MouseButton.LeftButton:
            self.drag_position = (
                event.globalPosition().toPoint() - self.dialog.frameGeometry().topLeft()
            )
            event.accept()
        else:
            QDialog.mousePressEvent(self.dialog, event)

    def handle_mouse_move(self, event):
        """Handle mouse move for dragging frameless dialog."""
        if (
            event.buttons() == Qt.MouseButton.LeftButton
            and self.drag_position is not None
        ):
            self.dialog.move(event.globalPosition().toPoint() - self.drag_position)
            event.accept()
        else:
            QDialog.mouseMoveEvent(self.dialog, event)

    def handle_mouse_release(self, event):
        """Handle mouse release to stop dragging."""
        if event.button() == Qt.MouseButton.LeftButton:
            self.drag_position = None
            event.accept()
        else:
            QDialog.mouseReleaseEvent(self.dialog, event)

    def handle_close_event(self, event):
        """Handle dialog close event."""
        try:
            # Check for unsaved changes
            if self.state_manager.is_modified():
                # Changes will be handled by cancel/ok buttons
                pass

            self.dialog_closed.emit()

        except Exception as e:
            logger.error(f"Error in close event: {e}")

    def get_tab(self, tab_name: str):
        """Get a specific tab widget."""
        return self.tab_manager.get_tab(tab_name)

    def refresh_all_tabs(self):
        """Refresh all tab contents."""
        self.tab_manager.refresh_all_tabs()
