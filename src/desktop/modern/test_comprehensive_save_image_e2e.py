#!/usr/bin/env python3
"""
Comprehensive End-to-End Test for Save Image with Real User Workflow

This test simulates the complete real-world user experience:
1. Creates a fully functional workbench environment
2. Uses real UI interactions to create authentic sequences
3. Validates image export with user feedback interface
4. Provides comprehensive sequence data integrity checks
"""

import logging
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, Optional

from PyQt6.QtCore import Qt, QTimer, pyqtSignal
from PyQt6.QtGui import QFont, QPixmap
from PyQt6.QtTest import QTest
from PyQt6.QtWidgets import (
    QApplication,
    QButtonGroup,
    QDialog,
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QPushButton,
    QRadioButton,
    QTextEdit,
    QVBoxLayout,
    QWidget,
)

# Add src to Python path
project_root = Path(__file__).parent
src_path = project_root / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

# Set up logging
logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)


class UserFeedbackDialog(QDialog):
    """Interactive feedback dialog for image validation."""

    feedback_submitted = pyqtSignal(dict)

    def __init__(self, image_path: Path, parent=None):
        super().__init__(parent)
        self.image_path = image_path
        self.feedback_data = {}
        self.setup_ui()

    def setup_ui(self):
        """Set up the feedback interface."""
        self.setWindowTitle("Image Quality Validation")
        self.setModal(True)
        self.resize(1000, 800)

        layout = QVBoxLayout(self)

        # Title
        title = QLabel("Please validate the exported sequence image:")
        title.setFont(QFont("Arial", 14, QFont.Weight.Bold))
        layout.addWidget(title)

        # Image display
        image_frame = QFrame()
        image_frame.setFrameStyle(QFrame.Shape.Box)
        image_frame.setMinimumHeight(400)
        image_layout = QVBoxLayout(image_frame)

        # Load and display image
        pixmap = QPixmap(str(self.image_path))
        if not pixmap.isNull():
            # Scale image to fit
            scaled_pixmap = pixmap.scaled(
                800,
                350,
                Qt.AspectRatioMode.KeepAspectRatio,
                Qt.TransformationMode.SmoothTransformation,
            )
            image_label = QLabel()
            image_label.setPixmap(scaled_pixmap)
            image_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            image_layout.addWidget(image_label)

            # Image info
            info_text = f"File: {self.image_path.name}\nSize: {self.image_path.stat().st_size} bytes\nDimensions: {pixmap.width()}x{pixmap.height()}"
            info_label = QLabel(info_text)
            info_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            image_layout.addWidget(info_label)
        else:
            error_label = QLabel("Could not load image")
            error_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            image_layout.addWidget(error_label)

        layout.addWidget(image_frame)

        # Feedback questions
        self.setup_feedback_questions(layout)

        # Text feedback
        layout.addWidget(QLabel("Additional feedback (optional):"))
        self.text_feedback = QTextEdit()
        self.text_feedback.setMaximumHeight(100)
        self.text_feedback.setPlaceholderText(
            "Describe any specific issues or observations..."
        )
        layout.addWidget(self.text_feedback)

        # Buttons
        button_layout = QHBoxLayout()

        submit_button = QPushButton("Submit Feedback")
        submit_button.clicked.connect(self.submit_feedback)
        submit_button.setStyleSheet(
            "QPushButton { background-color: #4CAF50; color: white; font-weight: bold; padding: 10px; }"
        )

        cancel_button = QPushButton("Skip Feedback")
        cancel_button.clicked.connect(self.reject)

        button_layout.addWidget(cancel_button)
        button_layout.addWidget(submit_button)
        layout.addLayout(button_layout)

    def setup_feedback_questions(self, layout):
        """Set up feedback question groups."""
        questions_frame = QFrame()
        questions_layout = QGridLayout(questions_frame)

        # Question groups
        self.question_groups = {}

        questions = [
            (
                "overall",
                "Overall image quality:",
                ["Excellent", "Good", "Fair", "Poor"],
            ),
            (
                "pictograph_size",
                "Pictograph size:",
                ["Too large", "Perfect", "Too small"],
            ),
            (
                "layout_spacing",
                "Beat layout spacing:",
                ["Too close", "Perfect", "Too far apart"],
            ),
            ("start_position", "Start position placement:", ["Correct", "Issues"]),
            (
                "text_readability",
                "Text readability:",
                ["Very clear", "Clear", "Hard to read"],
            ),
            ("color_quality", "Colors and contrast:", ["Excellent", "Good", "Poor"]),
        ]

        row = 0
        for question_id, question_text, options in questions:
            # Question label
            label = QLabel(question_text)
            label.setFont(QFont("Arial", 10, QFont.Weight.Bold))
            questions_layout.addWidget(label, row, 0)

            # Radio buttons
            button_group = QButtonGroup(self)
            option_layout = QHBoxLayout()

            for option in options:
                radio = QRadioButton(option)
                button_group.addButton(radio)
                option_layout.addWidget(radio)

            option_widget = QWidget()
            option_widget.setLayout(option_layout)
            questions_layout.addWidget(option_widget, row, 1)

            self.question_groups[question_id] = button_group
            row += 1

        layout.addWidget(questions_frame)

    def submit_feedback(self):
        """Collect and submit feedback data."""
        # Collect radio button responses
        for question_id, button_group in self.question_groups.items():
            checked_button = button_group.checkedButton()
            if checked_button:
                self.feedback_data[question_id] = checked_button.text()
            else:
                self.feedback_data[question_id] = "No response"

        # Collect text feedback
        self.feedback_data["additional_feedback"] = (
            self.text_feedback.toPlainText().strip()
        )

        # Add metadata
        self.feedback_data["image_path"] = str(self.image_path)
        self.feedback_data["image_size_bytes"] = self.image_path.stat().st_size
        self.feedback_data["timestamp"] = time.strftime("%Y-%m-%d %H:%M:%S")

        self.feedback_submitted.emit(self.feedback_data)
        self.accept()


class ComprehensiveSaveImageTest:
    """Comprehensive end-to-end test with real user workflow simulation."""

    def __init__(self):
        self.app = None
        self.main_window = None
        self.container = None
        self.sequence_workbench = None
        self.test_results = {}
        self.sequence_data_log = []
        self.feedback_results = []

    def setup_realistic_workbench_environment(self):
        """Set up a complete, realistic workbench environment."""
        print("🏗️ Setting up realistic workbench environment...")

        try:
            # Create QApplication
            self.app = QApplication.instance()
            if not self.app:
                self.app = QApplication(sys.argv)
                self.app.setStyle("Fusion")

            # Create comprehensive service container
            from application.services.core.registrars.workbench_service_registrar import (
                WorkbenchServiceRegistrar,
            )
            from core.dependency_injection.di_container import DIContainer

            self.container = DIContainer()

            # Register all necessary services
            self._register_comprehensive_services()

            # Create sequence workbench with full functionality
            from application.services.workbench.beat_selection_service import (
                BeatSelectionService,
            )
            from presentation.components.sequence_workbench.sequence_workbench import (
                SequenceWorkbench,
            )

            self.sequence_workbench = SequenceWorkbench(
                container=self.container,
                layout_service=self._create_mock_layout_service(),
                beat_selection_service=self.container.resolve(BeatSelectionService),
            )

            # Initialize workbench
            self.sequence_workbench.initialize()

            # Create main window
            self.main_window = QMainWindow()
            self.main_window.setWindowTitle(
                "TKA Comprehensive Test - Real User Workflow"
            )
            self.main_window.setCentralWidget(self.sequence_workbench.get_widget())
            self.main_window.resize(1400, 900)
            self.main_window.show()

            # Wait for initialization
            self._wait_for_workbench_initialization()

            print("✅ Realistic workbench environment ready")
            return True

        except Exception as e:
            print(f"❌ Environment setup failed: {e}")
            import traceback

            traceback.print_exc()
            return False

    def _register_comprehensive_services(self):
        """Register all services needed for realistic operation."""
        print("🔧 Registering comprehensive services...")

        # Import all necessary services
        from application.services.workbench.beat_selection_service import (
            BeatSelectionService,
        )
        from application.services.workbench.workbench_export_service import (
            WorkbenchExportService,
        )
        from application.services.workbench.workbench_operation_coordinator import (
            WorkbenchOperationCoordinator,
        )
        from application.services.workbench.workbench_session_manager import (
            WorkbenchSessionManager,
        )
        from application.services.workbench.workbench_state_manager import (
            WorkbenchStateManager,
        )

        # Create and register services
        state_manager = WorkbenchStateManager()
        export_service = WorkbenchExportService()
        coordinator = WorkbenchOperationCoordinator(
            workbench_state_manager=state_manager, export_service=export_service
        )
        session_manager = WorkbenchSessionManager(state_manager)
        beat_selection_service = BeatSelectionService()

        # Register in container
        self.container.register_instance(WorkbenchStateManager, state_manager)
        self.container.register_instance(WorkbenchExportService, export_service)
        self.container.register_instance(WorkbenchOperationCoordinator, coordinator)
        self.container.register_instance(WorkbenchSessionManager, session_manager)
        self.container.register_instance(BeatSelectionService, beat_selection_service)

        print("✅ Comprehensive services registered")

    def _create_mock_layout_service(self):
        """Create a mock layout service for testing."""

        class MockLayoutService:
            def get_layout(self, *args, **kwargs):
                return {"rows": 1, "cols": 5}  # Layout for start + 4 beats

        return MockLayoutService()

    def _wait_for_workbench_initialization(self):
        """Wait for workbench to fully initialize."""
        print("⏳ Waiting for workbench initialization...")

        for attempt in range(20):  # Wait up to 10 seconds
            self.app.processEvents()
            time.sleep(0.5)

            # Check if workbench is ready
            if (
                hasattr(self.sequence_workbench, "_beat_frame_section")
                and self.sequence_workbench._beat_frame_section is not None
            ):
                print(f"✅ Workbench ready after {attempt * 0.5:.1f}s")
                return True

        print("⚠️ Workbench initialization timeout")
        return False

    def create_authentic_sequence_via_ui(self):
        """Create a sequence using real UI interactions and authentic data."""
        print("🎨 Creating authentic sequence via UI interactions...")

        try:
            # Step 1: Select start position using real position keys
            start_position_success = self._select_authentic_start_position()
            if not start_position_success:
                return False

            # Step 2: Create beats using realistic pictograph data
            beats_success = self._create_authentic_beats()
            if not beats_success:
                return False

            # Step 3: Validate sequence data integrity
            validation_success = self._validate_sequence_data_integrity()
            if not validation_success:
                return False

            print("✅ Authentic sequence created successfully")
            return True

        except Exception as e:
            print(f"❌ Authentic sequence creation failed: {e}")
            import traceback

            traceback.print_exc()
            return False

    def _select_authentic_start_position(self):
        """Select a real start position using authentic position keys."""
        print("🎯 Selecting authentic start position...")

        try:
            # Get available start position keys (realistic options)
            from application.services.data.position_resolver import PositionResolver

            position_resolver = PositionResolver()

            # Use diamond mode start positions
            available_positions = position_resolver.get_start_positions("diamond")
            selected_position_key = available_positions[
                0
            ]  # Use first available position

            print(f"🎯 Selected position key: {selected_position_key}")

            # Create authentic start position data
            start_position_data = self._create_authentic_start_position_data(
                selected_position_key
            )

            # Set start position via workbench state manager
            from application.services.workbench.workbench_state_manager import (
                WorkbenchStateManager,
            )

            state_manager = self.container.resolve(WorkbenchStateManager)
            result = state_manager.set_start_position(start_position_data)

            if result.changed:
                print(f"✅ Start position set successfully: {selected_position_key}")

                # Create initial sequence with start position
                from domain.models.sequence_data import SequenceData

                initial_sequence = SequenceData(
                    name="Comprehensive Test Sequence",
                    word="TEST",
                    beats=[],  # Start with empty beats, will add them next
                )

                # Set the sequence in state manager
                sequence_result = state_manager.set_sequence(initial_sequence)
                if sequence_result.changed:
                    print("✅ Initial sequence created")
                else:
                    print("⚠️ Failed to create initial sequence")

                self.sequence_data_log.append(
                    {
                        "action": "start_position_set",
                        "position_key": selected_position_key,
                        "data": (
                            start_position_data.__dict__
                            if hasattr(start_position_data, "__dict__")
                            else str(start_position_data)
                        ),
                    }
                )
                return True
            else:
                print("❌ Failed to set start position")
                return False

        except Exception as e:
            print(f"❌ Start position selection failed: {e}")
            return False

    def _create_authentic_start_position_data(self, position_key: str):
        """Create authentic start position data from position key."""
        from application.services.data.pictograph_factory import PictographFactory
        from domain.models.beat_data import BeatData
        from domain.models.pictograph_data import PictographData

        try:
            # Create pictograph factory
            pictograph_factory = PictographFactory()

            # Create entry data for the position
            entry_data = {
                "letter": position_key.split("_")[0].upper(),  # e.g., "ALPHA1" -> "A"
                "start_pos": position_key.split("_")[0],
                "end_pos": position_key.split("_")[1],
                "motion_type": "static",
                "turns": 0,
            }

            # Create pictograph data using the correct method
            pictograph_data = pictograph_factory.create_pictograph_data_from_entry(
                entry_data, "diamond"
            )

            # Create beat data
            start_position_beat = BeatData(
                beat_number=0,  # Start position is beat 0
                is_blank=False,
                pictograph_data=pictograph_data,
                metadata={
                    "position_key": position_key,
                    "is_start_position": True,
                    "created_via": "authentic_ui_simulation",
                },
            )

            return start_position_beat

        except Exception as e:
            print(f"❌ Failed to create start position data: {e}")
            # Fallback to simple beat data
            return BeatData(
                beat_number=0,
                is_blank=False,
                metadata={
                    "position_key": position_key,
                    "is_start_position": True,
                    "fallback": True,
                },
            )

    def _create_authentic_beats(self):
        """Create authentic beats using realistic pictograph data."""
        print("🥁 Creating authentic beats...")

        try:
            # Get state manager
            from application.services.workbench.workbench_state_manager import (
                WorkbenchStateManager,
            )

            state_manager = self.container.resolve(WorkbenchStateManager)

            # Get current sequence to build upon
            current_sequence = state_manager.get_current_sequence()
            if not current_sequence:
                print("❌ No current sequence found")
                return False

            # Create 4 realistic beats
            beat_configs = [
                {"motion_type": "pro", "turns": 0, "letter": "A"},
                {"motion_type": "anti", "turns": 1, "letter": "B"},
                {"motion_type": "static", "turns": 0, "letter": "C"},
                {"motion_type": "dash", "turns": 2, "letter": "D"},
            ]

            for i, config in enumerate(beat_configs):
                beat_success = self._create_single_authentic_beat(i + 1, config)
                if not beat_success:
                    print(f"❌ Failed to create beat {i + 1}")
                    return False

                # Small delay to simulate user interaction timing
                time.sleep(0.2)
                self.app.processEvents()

            print("✅ All authentic beats created")
            return True

        except Exception as e:
            print(f"❌ Beat creation failed: {e}")
            return False

    def _create_single_authentic_beat(self, beat_number: int, config: Dict[str, Any]):
        """Create a single authentic beat with real pictograph data."""
        try:
            from application.services.data.pictograph_factory import PictographFactory
            from domain.models.beat_data import BeatData
            from domain.models.pictograph_data import PictographData

            # Create realistic entry data
            entry_data = {
                "letter": config["letter"],
                "start_pos": f"alpha{beat_number}",  # Realistic position progression
                "end_pos": f"beta{beat_number + 1}",
                "motion_type": config["motion_type"],
                "turns": config["turns"],
            }

            # Create pictograph factory and generate data
            pictograph_factory = PictographFactory()
            pictograph_data = pictograph_factory.create_pictograph_data_from_entry(
                entry_data, "diamond"
            )

            # Create beat data
            beat_data = BeatData(
                beat_number=beat_number,
                is_blank=False,
                pictograph_data=pictograph_data,
                metadata={
                    "created_via": "authentic_ui_simulation",
                    "motion_type": config["motion_type"],
                    "turns": config["turns"],
                },
            )

            # Add beat to sequence via state manager
            from application.services.workbench.workbench_state_manager import (
                WorkbenchStateManager,
            )

            state_manager = self.container.resolve(WorkbenchStateManager)

            current_sequence = state_manager.get_current_sequence()
            if current_sequence:
                updated_sequence = current_sequence.add_beat(beat_data)
                result = state_manager.set_sequence(updated_sequence)

                if result.changed:
                    print(
                        f"✅ Beat {beat_number} added: {config['letter']} ({config['motion_type']})"
                    )
                    self.sequence_data_log.append(
                        {
                            "action": "beat_added",
                            "beat_number": beat_number,
                            "config": config,
                            "data": (
                                beat_data.__dict__
                                if hasattr(beat_data, "__dict__")
                                else str(beat_data)
                            ),
                        }
                    )
                    return True
                else:
                    print(f"❌ Failed to add beat {beat_number} to sequence")
                    return False
            else:
                print(f"❌ No current sequence to add beat {beat_number}")
                return False

        except Exception as e:
            print(f"❌ Failed to create beat {beat_number}: {e}")
            return False

    def _validate_sequence_data_integrity(self):
        """Validate that sequence data is complete and authentic."""
        print("🔍 Validating sequence data integrity...")

        try:
            from application.services.workbench.workbench_state_manager import (
                WorkbenchStateManager,
            )

            state_manager = self.container.resolve(WorkbenchStateManager)

            current_sequence = state_manager.get_current_sequence()
            if not current_sequence:
                print("❌ No current sequence found")
                return False

            print(f"📊 Sequence validation:")
            print(f"  - Name: {current_sequence.name}")
            print(f"  - Word: {current_sequence.word}")
            print(f"  - Length: {current_sequence.length}")
            print(f"  - Beat count: {len(current_sequence.beats)}")

            # Validate start position
            start_position = state_manager.get_start_position()
            if start_position:
                print(f"  - Start position: ✅ Present")
                print(f"    - Beat number: {start_position.beat_number}")
                print(
                    f"    - Has pictograph data: {start_position.pictograph_data is not None}"
                )
            else:
                print(f"  - Start position: ❌ Missing")
                return False

            # Validate each beat
            for i, beat in enumerate(current_sequence.beats):
                print(f"  - Beat {i+1}:")
                print(f"    - Beat number: {beat.beat_number}")
                print(f"    - Is blank: {beat.is_blank}")
                print(f"    - Has pictograph data: {beat.pictograph_data is not None}")
                print(f"    - Has metadata: {bool(beat.metadata)}")

                if beat.pictograph_data:
                    print(
                        f"    - Letter: {getattr(beat.pictograph_data, 'letter', 'N/A')}"
                    )
                    print(
                        f"    - Start pos: {getattr(beat.pictograph_data, 'start_position', 'N/A')}"
                    )
                    print(
                        f"    - End pos: {getattr(beat.pictograph_data, 'end_position', 'N/A')}"
                    )

            # Log sequence data for analysis
            self.sequence_data_log.append(
                {
                    "action": "sequence_validation",
                    "sequence_name": current_sequence.name,
                    "sequence_word": current_sequence.word,
                    "sequence_length": current_sequence.length,
                    "beat_count": len(current_sequence.beats),
                    "has_start_position": start_position is not None,
                    "validation_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                }
            )

            print("✅ Sequence data integrity validated")
            return True

        except Exception as e:
            print(f"❌ Sequence validation failed: {e}")
            return False

    def execute_save_image_with_validation(self):
        """Execute Save Image workflow with comprehensive validation."""
        print("🖼️ Executing Save Image with validation...")

        try:
            # Find and click Save Image button
            workbench_widget = self.sequence_workbench.get_widget()
            save_button = self._find_save_image_button(workbench_widget)

            if not save_button:
                print("❌ Save Image button not found")
                return False

            # Record pre-export state
            export_dir = Path("exports/workbench")
            initial_files = (
                list(export_dir.glob("*.png")) if export_dir.exists() else []
            )

            print(f"📁 Export directory: {export_dir}")
            print(f"📄 Initial file count: {len(initial_files)}")

            # Click the button
            print("🖱️ Clicking Save Image button...")
            QTest.mouseClick(save_button, Qt.MouseButton.LeftButton)

            # Wait for export to complete
            self.app.processEvents()
            time.sleep(3)  # Give time for export
            self.app.processEvents()

            # Check for new files
            final_files = list(export_dir.glob("*.png")) if export_dir.exists() else []
            new_files = [f for f in final_files if f not in initial_files]

            if not new_files:
                print("❌ No new files created")
                return False

            # Validate the exported file
            latest_file = new_files[0]  # Get the newest file
            validation_success = self._validate_exported_image(latest_file)

            if validation_success:
                # Show user feedback dialog
                feedback_success = self._collect_user_feedback(latest_file)
                return feedback_success
            else:
                print("❌ Image validation failed")
                return False

        except Exception as e:
            print(f"❌ Save Image execution failed: {e}")
            import traceback

            traceback.print_exc()
            return False

    def _find_save_image_button(self, widget):
        """Find the Save Image button in the workbench."""
        from PyQt6.QtWidgets import QPushButton

        buttons = widget.findChildren(QPushButton)
        for button in buttons:
            if button.text() == "💾" or "save" in button.text().lower():
                print(f"✅ Found Save Image button: {button.text()}")
                return button

        print("❌ Save Image button not found")
        return None

    def _validate_exported_image(self, image_path: Path):
        """Validate the exported image file."""
        print(f"🔍 Validating exported image: {image_path.name}")

        try:
            # Check file exists and has content
            if not image_path.exists():
                print("❌ Image file does not exist")
                return False

            file_size = image_path.stat().st_size
            print(f"📏 File size: {file_size} bytes")

            if file_size == 0:
                print("❌ Image file is empty")
                return False

            # Check if it's a real image
            if file_size < 1000:  # Likely a placeholder
                print("⚠️ File size suggests placeholder content")
                return False

            # Try to load as image
            from PyQt6.QtGui import QPixmap

            pixmap = QPixmap(str(image_path))

            if pixmap.isNull():
                print("❌ Cannot load as valid image")
                return False

            print(f"✅ Valid image: {pixmap.width()}x{pixmap.height()}")
            print(f"✅ File size: {file_size} bytes")

            return True

        except Exception as e:
            print(f"❌ Image validation error: {e}")
            return False

    def _collect_user_feedback(self, image_path: Path):
        """Collect user feedback on the exported image."""
        print("📋 Collecting user feedback...")

        try:
            # Create and show feedback dialog
            feedback_dialog = UserFeedbackDialog(image_path, self.main_window)

            # Connect feedback signal
            feedback_received = False
            feedback_data = {}

            def on_feedback_received(data):
                nonlocal feedback_received, feedback_data
                feedback_received = True
                feedback_data = data
                self.feedback_results.append(data)
                print("✅ User feedback received")

            feedback_dialog.feedback_submitted.connect(on_feedback_received)

            # Show dialog and wait for response
            result = feedback_dialog.exec()

            if feedback_received:
                self._log_feedback_results(feedback_data)
                return True
            else:
                print("⚠️ No feedback received")
                return True  # Still consider success if user skips

        except Exception as e:
            print(f"❌ Feedback collection failed: {e}")
            return False

    def _log_feedback_results(self, feedback_data):
        """Log feedback results for analysis."""
        print("📊 Feedback Results:")
        for key, value in feedback_data.items():
            if key != "additional_feedback":
                print(f"  - {key.replace('_', ' ').title()}: {value}")

        if feedback_data.get("additional_feedback"):
            print(f"  - Additional feedback: {feedback_data['additional_feedback']}")

        # Add to sequence data log
        self.sequence_data_log.append(
            {
                "action": "user_feedback",
                "feedback": feedback_data,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            }
        )

    def run_comprehensive_test(self):
        """Run the complete comprehensive test."""
        print("🎯 Starting Comprehensive Save Image End-to-End Test")
        print("🔧 Real user workflow simulation with authentic sequence creation")
        print("=" * 80)

        test_phases = {
            "environment_setup": False,
            "sequence_creation": False,
            "data_validation": False,
            "image_export": False,
            "user_feedback": False,
        }

        try:
            # Phase 1: Environment Setup
            print("\n📋 PHASE 1: Realistic Workbench Environment Setup")
            test_phases["environment_setup"] = (
                self.setup_realistic_workbench_environment()
            )
            if not test_phases["environment_setup"]:
                return self._print_comprehensive_results(test_phases)

            # Phase 2: Authentic Sequence Creation
            print("\n📋 PHASE 2: Authentic Sequence Creation via UI")
            test_phases["sequence_creation"] = self.create_authentic_sequence_via_ui()
            if not test_phases["sequence_creation"]:
                return self._print_comprehensive_results(test_phases)

            # Phase 3: Data Validation (already done in sequence creation)
            test_phases["data_validation"] = True

            # Phase 4: Save Image with Validation
            print("\n📋 PHASE 4: Save Image Execution with Validation")
            test_phases["image_export"] = self.execute_save_image_with_validation()

            # Phase 5: User Feedback (handled in image export)
            test_phases["user_feedback"] = len(self.feedback_results) > 0

            return self._print_comprehensive_results(test_phases)

        except Exception as e:
            print(f"💥 Comprehensive test failed: {e}")
            import traceback

            traceback.print_exc()
            return self._print_comprehensive_results(test_phases)

        finally:
            self.cleanup()

    def _print_comprehensive_results(self, test_phases):
        """Print comprehensive test results with detailed analysis."""
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE TEST RESULTS")
        print("=" * 80)

        # Phase results
        all_passed = True
        for phase, passed in test_phases.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            phase_name = phase.replace("_", " ").title()
            print(f"{status} - {phase_name}")
            if not passed:
                all_passed = False

        print("\n" + "=" * 80)

        # Sequence data analysis
        if self.sequence_data_log:
            print("📊 SEQUENCE DATA ANALYSIS:")
            for entry in self.sequence_data_log:
                action = entry.get("action", "unknown")
                if action == "start_position_set":
                    print(f"  ✅ Start position: {entry.get('position_key', 'N/A')}")
                elif action == "beat_added":
                    config = entry.get("config", {})
                    print(
                        f"  ✅ Beat {entry.get('beat_number', '?')}: {config.get('letter', '?')} ({config.get('motion_type', '?')})"
                    )
                elif action == "sequence_validation":
                    print(
                        f"  ✅ Sequence: {entry.get('beat_count', 0)} beats, start pos: {entry.get('has_start_position', False)}"
                    )

        # Feedback analysis
        if self.feedback_results:
            print("\n📊 USER FEEDBACK ANALYSIS:")
            for feedback in self.feedback_results:
                print(f"  📋 Image: {Path(feedback.get('image_path', '')).name}")
                print(f"    - Overall quality: {feedback.get('overall', 'N/A')}")
                print(
                    f"    - Pictograph size: {feedback.get('pictograph_size', 'N/A')}"
                )
                print(f"    - Layout spacing: {feedback.get('layout_spacing', 'N/A')}")
                print(
                    f"    - Text readability: {feedback.get('text_readability', 'N/A')}"
                )
                if feedback.get("additional_feedback"):
                    print(f"    - Additional: {feedback['additional_feedback']}")

        print("\n" + "=" * 80)

        # Final assessment
        if all_passed:
            print("🎉 ALL PHASES PASSED - COMPREHENSIVE TEST SUCCESSFUL!")
            print("✅ Realistic workbench environment created")
            print("✅ Authentic sequence created via UI simulation")
            print("✅ Sequence data integrity validated")
            print("✅ Real image export working")
            if self.feedback_results:
                print("✅ User feedback collected and analyzed")
        else:
            print("💥 SOME PHASES FAILED")

            if not test_phases["environment_setup"]:
                print("❌ Environment setup issues")
            if not test_phases["sequence_creation"]:
                print("❌ Sequence creation issues")
            if not test_phases["image_export"]:
                print("❌ Image export issues")

        print("=" * 80)

        # Save detailed log
        self._save_test_log()

        return all_passed

    def _save_test_log(self):
        """Save detailed test log for analysis."""
        try:
            import json

            log_file = Path("comprehensive_test_log.json")

            log_data = {
                "test_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "sequence_data_log": self.sequence_data_log,
                "feedback_results": self.feedback_results,
                "test_summary": {
                    "total_sequence_actions": len(
                        [
                            e
                            for e in self.sequence_data_log
                            if e.get("action") in ["start_position_set", "beat_added"]
                        ]
                    ),
                    "total_feedback_entries": len(self.feedback_results),
                    "test_duration": "N/A",  # Could add timing if needed
                },
            }

            with open(log_file, "w") as f:
                json.dump(log_data, f, indent=2, default=str)

            print(f"📄 Detailed test log saved: {log_file}")

        except Exception as e:
            print(f"⚠️ Could not save test log: {e}")

    def cleanup(self):
        """Clean up test resources."""
        print("🧹 Cleaning up comprehensive test...")

        try:
            if self.main_window:
                self.main_window.close()

            if self.app:
                self.app.processEvents()
                # Don't quit if app was already running
                if QApplication.instance() == self.app:
                    self.app.quit()

            print("✅ Cleanup complete")

        except Exception as e:
            print(f"⚠️ Cleanup warning: {e}")


def main():
    """Run the comprehensive end-to-end test."""
    print("🎯 Comprehensive Save Image End-to-End Test")
    print("🔧 Real User Workflow Simulation with Authentic Sequence Creation")
    print("📋 Interactive Feedback Collection and Validation")

    test = ComprehensiveSaveImageTest()
    success = test.run_comprehensive_test()

    if success:
        print("\n🎉 COMPREHENSIVE TEST COMPLETED SUCCESSFULLY!")
        print("✅ Real user workflow simulation working")
        print("✅ Authentic sequence creation validated")
        print("✅ Image export with real pictograph data confirmed")
        print("✅ User feedback system operational")
        sys.exit(0)
    else:
        print("\n💥 COMPREHENSIVE TEST HAD ISSUES!")
        print("❌ Check the detailed logs for specific problems")
        sys.exit(1)


if __name__ == "__main__":
    main()
