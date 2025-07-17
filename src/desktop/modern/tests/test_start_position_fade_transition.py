#!/usr/bin/env python3
"""
Test script to verify the start position picker fade transition functionality.
"""

import sys
import os
import logging
from PyQt6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget, QPushButton, QLabel
from PyQt6.QtCore import QTimer, Qt

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

logger = logging.getLogger(__name__)


class StartPositionFadeTestWindow(QMainWindow):
    """Test window for start position picker fade transitions."""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Start Position Picker Fade Transition Test")
        self.setGeometry(100, 100, 1200, 800)
        
        # State
        self.start_position_picker = None
        self.container = None
        
        self._setup_ui()
        self._setup_services()

    def _setup_ui(self):
        """Setup the test UI."""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        layout = QVBoxLayout(central_widget)
        
        # Status label
        self.status_label = QLabel("Status: Initializing...")
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(self.status_label)
        
        # Control buttons
        self.create_picker_button = QPushButton("Create Start Position Picker")
        self.create_picker_button.clicked.connect(self._create_picker)
        layout.addWidget(self.create_picker_button)
        
        self.toggle_mode_button = QPushButton("Toggle Mode (Basic ↔ Advanced)")
        self.toggle_mode_button.clicked.connect(self._toggle_mode)
        self.toggle_mode_button.setEnabled(False)
        layout.addWidget(self.toggle_mode_button)
        
        self.toggle_grid_button = QPushButton("Toggle Grid (Diamond ↔ Box)")
        self.toggle_grid_button.clicked.connect(self._toggle_grid)
        self.toggle_grid_button.setEnabled(False)
        layout.addWidget(self.toggle_grid_button)
        
        # Picker container
        self.picker_container = QWidget()
        self.picker_layout = QVBoxLayout(self.picker_container)
        layout.addWidget(self.picker_container, 1)

    def _setup_services(self):
        """Setup the DI container and services."""
        try:
            from core.application.application_factory import ApplicationFactory, ApplicationMode
            
            self.container = ApplicationFactory.create_app(ApplicationMode.PRODUCTION)
            self.status_label.setText("Status: Services initialized successfully")
            logger.info("✅ DI container and services initialized")
            
        except Exception as e:
            self.status_label.setText(f"Status: Service initialization failed - {e}")
            logger.error(f"❌ Failed to initialize services: {e}")

    def _create_picker(self):
        """Create the start position picker with animation support."""
        try:
            if not self.container:
                self.status_label.setText("Status: No DI container available")
                return
                
            from presentation.components.start_position_picker.start_position_picker import (
                StartPositionPicker, PickerMode
            )
            from application.services.pictograph_pool_manager import PictographPoolManager
            from core.interfaces.start_position_services import (
                IStartPositionDataService,
                IStartPositionUIService,
                IStartPositionOrchestrator,
            )
            from core.interfaces.animation_core_interfaces import IAnimationOrchestrator
            
            # Resolve services
            pool_manager = self.container.resolve(PictographPoolManager)
            data_service = self.container.resolve(IStartPositionDataService)
            ui_service = self.container.resolve(IStartPositionUIService)
            orchestrator = self.container.resolve(IStartPositionOrchestrator)
            
            # Try to get animation orchestrator
            try:
                animation_orchestrator = self.container.resolve(IAnimationOrchestrator)
                orchestrator._container = self.container
                self.status_label.setText("Status: Animation system available ✨")
                logger.info("✅ Animation orchestrator resolved successfully")
            except Exception as e:
                self.status_label.setText(f"Status: Animation system not available - {e}")
                logger.warning(f"⚠️ Animation orchestrator not available: {e}")
            
            # Create picker
            self.start_position_picker = StartPositionPicker(
                pool_manager=pool_manager,
                data_service=data_service,
                ui_service=ui_service,
                orchestrator=orchestrator,
                initial_mode=PickerMode.BASIC,
            )
            
            # Add to layout
            self.picker_layout.addWidget(self.start_position_picker)
            
            # Enable controls
            self.toggle_mode_button.setEnabled(True)
            self.toggle_grid_button.setEnabled(True)
            self.create_picker_button.setEnabled(False)
            
            self.status_label.setText("Status: Start position picker created successfully! Try the fade transitions.")
            logger.info("✅ Start position picker created with fade transition support")
            
        except Exception as e:
            self.status_label.setText(f"Status: Failed to create picker - {e}")
            logger.error(f"❌ Failed to create start position picker: {e}")

    def _toggle_mode(self):
        """Toggle between basic and advanced modes to test fade transition."""
        if not self.start_position_picker:
            return
            
        try:
            from presentation.components.start_position_picker.start_position_picker import PickerMode
            
            current_mode = self.start_position_picker.get_current_mode()
            new_mode = PickerMode.ADVANCED if current_mode == PickerMode.BASIC else PickerMode.BASIC
            
            self.status_label.setText(f"Status: Transitioning to {new_mode.value} mode with fade...")
            logger.info(f"🎭 Triggering fade transition: {current_mode.value} → {new_mode.value}")
            
            # Trigger the mode change (should use fade transition)
            self.start_position_picker.set_mode(new_mode)
            
            # Update status after a delay
            QTimer.singleShot(300, lambda: self.status_label.setText(
                f"Status: Transitioned to {new_mode.value} mode ✨"
            ))
            
        except Exception as e:
            self.status_label.setText(f"Status: Mode toggle failed - {e}")
            logger.error(f"❌ Mode toggle failed: {e}")

    def _toggle_grid(self):
        """Toggle between diamond and box grid modes to test fade transition."""
        if not self.start_position_picker:
            return
            
        try:
            current_grid = self.start_position_picker.get_current_grid_mode()
            new_grid = "box" if current_grid == "diamond" else "diamond"
            
            self.status_label.setText(f"Status: Transitioning to {new_grid} grid with fade...")
            logger.info(f"🎭 Triggering fade transition: {current_grid} → {new_grid}")
            
            # Trigger the grid change (should use fade transition)
            self.start_position_picker._toggle_grid_mode()
            
            # Update status after a delay
            QTimer.singleShot(300, lambda: self.status_label.setText(
                f"Status: Transitioned to {new_grid} grid ✨"
            ))
            
        except Exception as e:
            self.status_label.setText(f"Status: Grid toggle failed - {e}")
            logger.error(f"❌ Grid toggle failed: {e}")


def main():
    """Run the fade transition test."""
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    print("🧪 Starting Start Position Picker Fade Transition Test")
    print("=" * 60)
    
    app = QApplication(sys.argv)
    
    try:
        window = StartPositionFadeTestWindow()
        window.show()
        
        print("✅ Test window created successfully")
        print("📋 Instructions:")
        print("   1. Click 'Create Start Position Picker'")
        print("   2. Click 'Toggle Mode' to test Basic ↔ Advanced fade transitions")
        print("   3. Click 'Toggle Grid' to test Diamond ↔ Box fade transitions")
        print("   4. Watch for smooth fade effects during transitions")
        print()
        
        return app.exec()
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
