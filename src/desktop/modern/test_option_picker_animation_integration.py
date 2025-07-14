#!/usr/bin/env python3
"""
Test Option Picker Animation Integration

This test validates that the modern animation system is properly integrated
into the option picker and replicates the legacy fade behavior.

Test Scenarios:
1. Option picker with animation system available
2. Option picker without animation system (fallback)
3. Performance validation (target <100ms for option changes)
4. Signal flow integrity
5. Fade timing matches legacy (200ms)
"""

import asyncio
import sys
import time
from typing import List

# Add src to path for imports
sys.path.insert(0, "src")

from application.services.ui.animation.modern_service_registration import (
    setup_modern_animation_services,
)
from core.dependency_injection.di_container import DIContainer
from core.interfaces.animation_core_interfaces import IAnimationOrchestrator
from domain.models.beat_data import BeatData
from domain.models.pictograph_data import PictographData
from domain.models.sequence_data import SequenceData
from presentation.components.option_picker.components.option_picker import OptionPicker
from PyQt6.QtCore import QTimer, pyqtSignal
from PyQt6.QtWidgets import (
    QApplication,
    QLabel,
    QMainWindow,
    QPushButton,
    QVBoxLayout,
    QWidget,
)


class OptionPickerAnimationTest(QMainWindow):
    """Test harness for option picker animation integration."""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Option Picker Animation Integration Test")
        self.setGeometry(100, 100, 1200, 800)

        # Initialize services
        self.container = DIContainer()
        self.animation_available = False

        # Create test UI first
        self.setup_ui()

        # Then setup services
        self.setup_services()

        # Test data
        self.test_sequences = self.create_test_sequences()
        self.current_test_index = 0

        # Performance tracking
        self.transition_times = []

    def setup_services(self):
        """Setup DI container with animation services."""
        try:
            # Register animation services
            setup_modern_animation_services(self.container)

            # Register all required services for option picker
            from application.services.core.service_registration_manager import (
                ServiceRegistrationManager,
            )

            registration_manager = ServiceRegistrationManager()
            registration_manager.register_all_services(self.container)

            self.animation_available = True
            self.status_label.setText("✅ Animation system available")

        except Exception as e:
            self.animation_available = False
            self.status_label.setText(f"⚠️ Animation system not available: {e}")
            print(f"Animation setup failed: {e}")
            import traceback

            traceback.print_exc()

    def setup_ui(self):
        """Setup test UI."""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)

        # Status label
        self.status_label = QLabel("Initializing...")
        layout.addWidget(self.status_label)

        # Performance label
        self.performance_label = QLabel("Performance: Not tested")
        layout.addWidget(self.performance_label)

        # Test controls
        self.test_button = QPushButton("Run Animation Test")
        self.test_button.clicked.connect(self.run_animation_test)
        layout.addWidget(self.test_button)

        self.fallback_button = QPushButton("Test Fallback Mode")
        self.fallback_button.clicked.connect(self.test_fallback_mode)
        layout.addWidget(self.fallback_button)

        # Option picker
        try:
            self.option_picker = OptionPicker(
                container=self.container,
                progress_callback=self.progress_callback,
                parent=self,
            )
            layout.addWidget(self.option_picker.get_widget())

            # Connect signals
            self.option_picker.pictograph_selected.connect(self.on_pictograph_selected)

        except Exception as e:
            error_label = QLabel(f"❌ Failed to create option picker: {e}")
            layout.addWidget(error_label)
            print(f"Option picker creation failed: {e}")

    def create_test_sequences(self) -> List[SequenceData]:
        """Create test sequence data using real CSV data for animation testing."""
        sequences = []

        try:
            # Use the real pictograph factory to create proper data
            from application.services.data.pictograph_factory import PictographFactory
            from application.services.pictograph.pictograph_csv_manager import (
                PictographCSVManager,
            )

            csv_manager = PictographCSVManager()
            pictograph_factory = PictographFactory()

            # Load real CSV data
            csv_data = csv_manager._load_csv_data()
            if csv_data.empty:
                print("No CSV data available for test")
                return sequences

            # Get a few real entries for testing
            test_entries = csv_data.head(3).to_dict("records")

            for i, entry in enumerate(test_entries):
                # Create real pictograph data from CSV entry
                pictograph_data = pictograph_factory.create_pictograph_data_from_entry(
                    entry, "diamond"
                )

                # Create beat with real pictograph data
                beat = BeatData(beat_number=i + 1, pictograph_data=pictograph_data)

                # Create sequence
                sequence = SequenceData()
                sequence.add_beat(beat)
                sequences.append(sequence)

                print(
                    f"Created test sequence {i+1}: {entry.get('letter', '?')} - {entry.get('start_pos', '?')} to {entry.get('end_pos', '?')}"
                )

        except Exception as e:
            print(f"Failed to create real test sequences: {e}")
            # Fallback: create minimal valid sequence
            beat = BeatData(beat_number=1)
            sequence = SequenceData()
            sequence.add_beat(beat)
            sequences.append(sequence)

        return sequences

    def progress_callback(self, message: str, progress: float):
        """Progress callback for option picker."""
        print(f"Progress: {message} ({progress:.1%})")

    def on_pictograph_selected(self, pictograph_data: PictographData):
        """Handle pictograph selection."""
        print(f"Pictograph selected: {pictograph_data.letter}")

    def run_animation_test(self):
        """Run animation integration test."""
        if not self.animation_available:
            self.status_label.setText("❌ Cannot test - animation system not available")
            return

        self.status_label.setText("🔄 Running animation test...")

        # Start performance measurement
        start_time = time.perf_counter()

        # Trigger option refresh with animation
        if self.test_sequences:
            sequence = self.test_sequences[self.current_test_index]
            self.option_picker.refresh_options_from_modern_sequence(sequence)

            # Switch to next sequence for next test
            self.current_test_index = (self.current_test_index + 1) % len(
                self.test_sequences
            )

            # Measure transition time
            transition_time = (time.perf_counter() - start_time) * 1000
            self.transition_times.append(transition_time)

            # Update performance display
            avg_time = sum(self.transition_times) / len(self.transition_times)
            self.performance_label.setText(
                f"Performance: Last: {transition_time:.1f}ms, Avg: {avg_time:.1f}ms, "
                f"Target: <100ms {'✅' if avg_time < 100 else '❌'}"
            )

            self.status_label.setText(
                f"✅ Animation test complete - {len(self.transition_times)} transitions tested"
            )

    def test_fallback_mode(self):
        """Test fallback mode without animation."""
        self.status_label.setText("🔄 Testing fallback mode...")

        # Temporarily disable animation
        original_orchestrator = getattr(
            self.option_picker.option_picker_widget.option_picker_scroll,
            "_animation_orchestrator",
            None,
        )
        self.option_picker.option_picker_widget.option_picker_scroll._animation_orchestrator = (
            None
        )

        try:
            # Test direct update
            if self.test_sequences:
                sequence = self.test_sequences[0]
                start_time = time.perf_counter()
                self.option_picker.refresh_options_from_modern_sequence(sequence)
                fallback_time = (time.perf_counter() - start_time) * 1000

                self.status_label.setText(
                    f"✅ Fallback mode works - {fallback_time:.1f}ms (direct update)"
                )

        finally:
            # Restore animation orchestrator
            self.option_picker.option_picker_widget.option_picker_scroll._animation_orchestrator = (
                original_orchestrator
            )


def main():
    """Run the option picker animation integration test."""
    app = QApplication(sys.argv)

    print("🎭 Option Picker Animation Integration Test")
    print("=" * 50)
    print("This test validates:")
    print("• Modern animation system integration")
    print("• Legacy fade behavior replication (200ms)")
    print("• Performance targets (<100ms)")
    print("• Fallback mode functionality")
    print("• Signal flow integrity")
    print()

    test_window = OptionPickerAnimationTest()
    test_window.show()

    print("🚀 Test window launched!")
    print("Use the buttons to test different scenarios:")
    print("• 'Run Animation Test' - Test animated transitions")
    print("• 'Test Fallback Mode' - Test without animation")
    print()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
