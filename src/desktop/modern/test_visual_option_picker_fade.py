#!/usr/bin/env python3
"""
Visual Option Picker Fade Animation Test

This test creates a comprehensive visual demonstration of the option picker
with fade animations, using real pictograph data and a full UI similar to
the main application.

Features:
1. Full option picker with real pictographs from CSV
2. Visible fade transitions when switching between sequences
3. Performance monitoring and timing display
4. Side-by-side comparison of animated vs direct updates
5. Interactive controls to trigger different scenarios
"""

import sys
import time
from typing import List, Optional

# Add src to path for imports
sys.path.insert(0, "src")

from application.services.core.service_registration_manager import (
    ServiceRegistrationManager,
)
from application.services.ui.animation.modern_service_registration import (
    setup_modern_animation_services,
)
from core.dependency_injection.di_container import DIContainer
from domain.models.beat_data import BeatData
from domain.models.sequence_data import SequenceData
from presentation.components.option_picker.components.option_picker import OptionPicker
from PyQt6.QtCore import QSize, Qt, QTimer
from PyQt6.QtGui import QFont
from PyQt6.QtWidgets import (
    QApplication,
    QGroupBox,
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QPushButton,
    QSplitter,
    QTextEdit,
    QVBoxLayout,
    QWidget,
)


class VisualOptionPickerTest(QMainWindow):
    """Visual test for option picker fade animations."""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Visual Option Picker Fade Animation Test")
        self.setGeometry(100, 100, 1400, 900)

        # Initialize services
        self.setup_services()

        # Create test sequences
        self.test_sequences = self.create_test_sequences()
        self.current_sequence_index = 0

        # Performance tracking
        self.transition_times = []

        # Initialize UI attributes first
        self.log_display = None

        # Setup UI
        self.setup_ui()

        # Auto-load first sequence
        QTimer.singleShot(1000, self.load_initial_sequence)

    def setup_services(self):
        """Setup DI container with all required services."""
        try:
            self.container = DIContainer()

            # Register animation services
            setup_modern_animation_services(self.container)

            # Register all application services
            registration_manager = ServiceRegistrationManager()
            registration_manager.register_all_services(self.container)

            self.services_available = True
            print("✅ All services registered successfully")

        except Exception as e:
            self.services_available = False
            print(f"❌ Service setup failed: {e}")
            import traceback

            traceback.print_exc()

    def create_test_sequences(self) -> List[SequenceData]:
        """Create test sequences using real CSV data."""
        sequences = []

        try:
            from application.services.data.pictograph_factory import PictographFactory
            from application.services.pictograph.pictograph_csv_manager import (
                PictographCSVManager,
            )

            csv_manager = PictographCSVManager()
            pictograph_factory = PictographFactory()

            # Load real CSV data
            csv_data = csv_manager._load_csv_data()
            if csv_data.empty:
                print("No CSV data available")
                return sequences

            # Create sequences for different letters
            letters = ["A", "B", "C", "D"]
            for letter in letters:
                letter_entries = csv_data[csv_data["letter"] == letter].head(1)
                if not letter_entries.empty:
                    entry = letter_entries.iloc[0].to_dict()

                    # Create pictograph data
                    pictograph_data = (
                        pictograph_factory.create_pictograph_data_from_entry(
                            entry, "diamond"
                        )
                    )

                    # Create beat with pictograph data
                    beat = BeatData(beat_number=1, pictograph_data=pictograph_data)

                    # Create sequence
                    sequence = SequenceData()
                    sequence.add_beat(beat)
                    sequences.append(sequence)

                    print(
                        f"Created sequence for {letter}: {entry.get('start_pos', '?')} → {entry.get('end_pos', '?')}"
                    )

            print(f"✅ Created {len(sequences)} test sequences")

        except Exception as e:
            print(f"❌ Failed to create test sequences: {e}")
            import traceback

            traceback.print_exc()

        return sequences

    def setup_ui(self):
        """Setup the visual test UI."""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        # Main horizontal layout
        main_layout = QHBoxLayout(central_widget)

        # Left side: Option picker
        self.setup_option_picker_side(main_layout)

        # Right side: Controls and info
        self.setup_control_side(main_layout)

    def setup_option_picker_side(self, main_layout):
        """Setup the option picker display side."""
        # Option picker container
        picker_container = QGroupBox("Option Picker with Fade Animations")
        picker_container.setMinimumWidth(800)
        main_layout.addWidget(picker_container, 2)  # 2/3 of space

        picker_layout = QVBoxLayout(picker_container)

        # Status label
        self.picker_status = QLabel("Initializing option picker...")
        self.picker_status.setStyleSheet("color: blue; font-weight: bold;")
        picker_layout.addWidget(self.picker_status)

        # Create option picker
        try:
            if self.services_available:
                self.option_picker = OptionPicker(
                    container=self.container,
                    progress_callback=self.progress_callback,
                    parent=picker_container,
                )

                # Initialize the option picker
                self.option_picker.initialize()

                # Add to layout
                picker_layout.addWidget(self.option_picker.get_widget())

                # Connect signals
                self.option_picker.pictograph_selected.connect(
                    self.on_pictograph_selected
                )

                self.picker_status.setText(
                    "✅ Option picker ready - Load a sequence to see pictographs"
                )

            else:
                error_label = QLabel(
                    "❌ Services not available - cannot create option picker"
                )
                error_label.setStyleSheet("color: red;")
                picker_layout.addWidget(error_label)

        except Exception as e:
            error_label = QLabel(f"❌ Failed to create option picker: {e}")
            error_label.setStyleSheet("color: red;")
            picker_layout.addWidget(error_label)
            print(f"Option picker creation failed: {e}")

    def setup_control_side(self, main_layout):
        """Setup the control panel side."""
        control_container = QGroupBox("Animation Controls & Performance")
        control_container.setMinimumWidth(500)
        main_layout.addWidget(control_container, 1)  # 1/3 of space

        control_layout = QVBoxLayout(control_container)

        # Animation controls
        self.setup_animation_controls(control_layout)

        # Performance display
        self.setup_performance_display(control_layout)

        # Log display
        self.setup_log_display(control_layout)

    def setup_animation_controls(self, layout):
        """Setup animation control buttons."""
        controls_group = QGroupBox("Test Controls")
        layout.addWidget(controls_group)

        controls_layout = QVBoxLayout(controls_group)

        # Sequence navigation
        nav_layout = QHBoxLayout()

        self.prev_button = QPushButton("← Previous Sequence")
        self.prev_button.clicked.connect(self.load_previous_sequence)
        nav_layout.addWidget(self.prev_button)

        self.next_button = QPushButton("Next Sequence →")
        self.next_button.clicked.connect(self.load_next_sequence)
        nav_layout.addWidget(self.next_button)

        controls_layout.addLayout(nav_layout)

        # Animation mode toggle
        self.toggle_animation_button = QPushButton(
            "🎭 Disable Animations (Test Direct Mode)"
        )
        self.toggle_animation_button.clicked.connect(self.toggle_animation_mode)
        controls_layout.addWidget(self.toggle_animation_button)

        # Auto cycle
        self.auto_cycle_button = QPushButton("🔄 Start Auto Cycle (Every 3s)")
        self.auto_cycle_button.clicked.connect(self.toggle_auto_cycle)
        controls_layout.addWidget(self.auto_cycle_button)

        # Current sequence info
        self.sequence_info = QLabel("No sequence loaded")
        self.sequence_info.setStyleSheet(
            "background: #f0f0f0; padding: 5px; border-radius: 3px;"
        )
        controls_layout.addWidget(self.sequence_info)

    def setup_performance_display(self, layout):
        """Setup performance monitoring display."""
        perf_group = QGroupBox("Performance Metrics")
        layout.addWidget(perf_group)

        perf_layout = QVBoxLayout(perf_group)

        self.performance_label = QLabel("Performance: Not tested")
        self.performance_label.setFont(QFont("Courier", 10))
        perf_layout.addWidget(self.performance_label)

        self.animation_status = QLabel("Animation: Enabled")
        self.animation_status.setStyleSheet("color: green; font-weight: bold;")
        perf_layout.addWidget(self.animation_status)

    def setup_log_display(self, layout):
        """Setup log display."""
        log_group = QGroupBox("Activity Log")
        layout.addWidget(log_group)

        log_layout = QVBoxLayout(log_group)

        self.log_display = QTextEdit()
        self.log_display.setMaximumHeight(200)
        self.log_display.setFont(QFont("Courier", 9))
        log_layout.addWidget(self.log_display)

        # Clear log button
        clear_button = QPushButton("Clear Log")
        clear_button.clicked.connect(self.log_display.clear)
        log_layout.addWidget(clear_button)

    def progress_callback(self, message: str, progress: float):
        """Progress callback for option picker."""
        self.log(f"Progress: {message} ({progress:.1%})")

    def on_pictograph_selected(self, pictograph_data):
        """Handle pictograph selection."""
        self.log(f"Pictograph selected: {pictograph_data.letter}")

    def log(self, message: str):
        """Add message to log display."""
        timestamp = time.strftime("%H:%M:%S")
        log_message = f"[{timestamp}] {message}"

        # Print to console always
        print(log_message)

        # Add to log display if available
        if self.log_display:
            self.log_display.append(log_message)

            # Auto-scroll to bottom
            scrollbar = self.log_display.verticalScrollBar()
            scrollbar.setValue(scrollbar.maximum())

    def load_initial_sequence(self):
        """Load the first sequence."""
        if self.test_sequences:
            self.load_sequence(0)

    def load_sequence(self, index: int):
        """Load a specific sequence with performance monitoring."""
        if not self.test_sequences or not hasattr(self, "option_picker"):
            return

        if 0 <= index < len(self.test_sequences):
            self.current_sequence_index = index
            sequence = self.test_sequences[index]

            # Update sequence info
            beat = sequence.beats[0] if sequence.beats else None
            if beat and beat.pictograph_data:
                letter = beat.pictograph_data.letter
                self.sequence_info.setText(
                    f"Sequence {index + 1}/{len(self.test_sequences)}: Letter {letter}"
                )
            else:
                self.sequence_info.setText(
                    f"Sequence {index + 1}/{len(self.test_sequences)}"
                )

            # Measure performance
            start_time = time.perf_counter()

            # Load sequence (this will trigger fade animations)
            self.option_picker.refresh_options_from_modern_sequence(sequence)

            # Record timing
            transition_time = (time.perf_counter() - start_time) * 1000
            self.transition_times.append(transition_time)

            # Update performance display
            avg_time = sum(self.transition_times) / len(self.transition_times)
            target_time = 200  # Legacy target

            performance_status = "✅" if transition_time <= target_time * 1.5 else "⚠️"
            self.performance_label.setText(
                f"Last: {transition_time:.1f}ms\n"
                f"Avg: {avg_time:.1f}ms\n"
                f"Target: {target_time}ms {performance_status}\n"
                f"Tests: {len(self.transition_times)}"
            )

            self.log(f"Loaded sequence {index + 1} - {transition_time:.1f}ms")
            self.picker_status.setText(f"✅ Showing options for sequence {index + 1}")

    def load_next_sequence(self):
        """Load next sequence."""
        if self.test_sequences:
            next_index = (self.current_sequence_index + 1) % len(self.test_sequences)
            self.load_sequence(next_index)

    def load_previous_sequence(self):
        """Load previous sequence."""
        if self.test_sequences:
            prev_index = (self.current_sequence_index - 1) % len(self.test_sequences)
            self.load_sequence(prev_index)

    def toggle_animation_mode(self):
        """Toggle between animated and direct update modes."""
        if not hasattr(self, "option_picker"):
            return

        try:
            scroll_widget = self.option_picker.option_picker_widget.option_picker_scroll

            if (
                hasattr(scroll_widget, "_animation_orchestrator")
                and scroll_widget._animation_orchestrator
            ):
                # Disable animations
                scroll_widget._animation_orchestrator = None
                self.toggle_animation_button.setText("🎭 Enable Animations")
                self.animation_status.setText("Animation: Disabled (Direct Mode)")
                self.animation_status.setStyleSheet("color: red; font-weight: bold;")
                self.log("Animations disabled - using direct updates")
            else:
                # Re-enable animations
                from core.interfaces.animation_core_interfaces import (
                    IAnimationOrchestrator,
                )

                scroll_widget._animation_orchestrator = self.container.resolve(
                    IAnimationOrchestrator
                )
                self.toggle_animation_button.setText(
                    "🎭 Disable Animations (Test Direct Mode)"
                )
                self.animation_status.setText("Animation: Enabled")
                self.animation_status.setStyleSheet("color: green; font-weight: bold;")
                self.log("Animations enabled - using fade transitions")

        except Exception as e:
            self.log(f"Failed to toggle animation mode: {e}")

    def toggle_auto_cycle(self):
        """Toggle auto-cycling through sequences."""
        if not hasattr(self, "auto_timer"):
            # Start auto cycle
            self.auto_timer = QTimer()
            self.auto_timer.timeout.connect(self.load_next_sequence)
            self.auto_timer.start(3000)  # Every 3 seconds

            self.auto_cycle_button.setText("⏹️ Stop Auto Cycle")
            self.log("Started auto-cycling every 3 seconds")
        else:
            # Stop auto cycle
            self.auto_timer.stop()
            delattr(self, "auto_timer")

            self.auto_cycle_button.setText("🔄 Start Auto Cycle (Every 3s)")
            self.log("Stopped auto-cycling")


def main():
    """Run the visual option picker fade test."""
    app = QApplication(sys.argv)

    print("🎭 Visual Option Picker Fade Animation Test")
    print("=" * 50)
    print("This test demonstrates:")
    print("• Full option picker with real pictographs")
    print("• Visible fade transitions (200ms legacy timing)")
    print("• Performance monitoring and metrics")
    print("• Interactive controls for testing")
    print("• Side-by-side animated vs direct comparison")
    print()

    test_window = VisualOptionPickerTest()
    test_window.show()

    print("🚀 Visual test launched!")
    print("Use the controls to:")
    print("• Navigate between sequences (see fade transitions)")
    print("• Toggle animation mode (compare animated vs direct)")
    print("• Monitor performance metrics")
    print("• Auto-cycle for continuous demonstration")

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
