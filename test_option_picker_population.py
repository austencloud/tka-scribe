#!/usr/bin/env python3
"""
Test script to verify that the option picker gets populated when a start position is selected.
This script simulates the start position selection process and checks if the option picker
receives the correct data.
"""

import sys
import os
from pathlib import Path

# Add the modern src directory to Python path
modern_src_path = Path(__file__).parent / "tka-desktop" / "modern" / "src"
if str(modern_src_path) not in sys.path:
    sys.path.insert(0, str(modern_src_path))

# Change to tka-desktop directory for compatibility
os.chdir(Path(__file__).parent / "tka-desktop")


def test_option_picker_population():
    """Test that option picker gets populated when start position is selected"""
    print("🧪 Testing option picker population from start position...")

    try:
        # Import required classes
        from domain.models.core_models import SequenceData, BeatData
        from presentation.tabs.construct.signal_coordinator import SignalCoordinator
        from presentation.tabs.construct.start_position_handler import (
            StartPositionHandler,
        )
        from presentation.tabs.construct.sequence_manager import SequenceManager
        from presentation.tabs.construct.data_conversion_service import (
            DataConversionService,
        )

        # Mock classes for testing
        class MockLayoutManager:
            def __init__(self):
                self.start_position_picker = None
                self.workbench = None

            def transition_to_option_picker(self):
                print("✅ Layout manager: Transitioning to option picker")

            def transition_to_start_position_picker(self):
                print("✅ Layout manager: Transitioning to start position picker")

        class MockOptionPicker:
            def __init__(self):
                self.last_sequence = None
                # Mock the PyQt signal
                from PyQt6.QtCore import QObject, pyqtSignal

                self.beat_data_selected = pyqtSignal(object)

            def refresh_options_from_modern_sequence(self, sequence):
                self.last_sequence = sequence
                print(
                    f"✅ Option picker: Refreshed with sequence containing {sequence.length} beats"
                )
                print(
                    f"   First beat letter: {sequence.beats[0].letter if sequence.beats else 'None'}"
                )
                print(f"   Sequence metadata: {sequence.metadata}")

        # Create mock components
        layout_manager = MockLayoutManager()
        option_picker = MockOptionPicker()

        # Create data conversion service
        data_conversion_service = DataConversionService()

        # Create start position handler
        start_position_handler = StartPositionHandler(data_conversion_service)

        # Create sequence manager
        sequence_manager = SequenceManager()

        # Create signal coordinator with our fix
        signal_coordinator = SignalCoordinator(
            layout_manager, start_position_handler, option_picker, sequence_manager
        )

        print("🔧 Components created successfully")

        # Test the fix: simulate start position selection
        print("\n🎯 Simulating start position selection: beta5_beta5")

        # Create mock start position data
        from domain.models.core_models import (
            MotionData,
            MotionType,
            RotationDirection,
            Location,
        )

        blue_motion = MotionData(
            motion_type=MotionType.STATIC,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            start_loc=Location.SOUTH,
            end_loc=Location.SOUTH,
        )

        red_motion = MotionData(
            motion_type=MotionType.STATIC,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            start_loc=Location.SOUTH,
            end_loc=Location.SOUTH,
        )

        start_position_data = BeatData(
            beat_number=1,
            letter="A",
            duration=1.0,
            blue_motion=blue_motion,
            red_motion=red_motion,
            metadata={"start_position": "beta5_beta5"},
        )

        # Trigger the signal coordinator's start position handler
        signal_coordinator._handle_start_position_created(
            "beta5_beta5", start_position_data
        )

        # Check if option picker was populated
        if option_picker.last_sequence:
            print("\n✅ SUCCESS: Option picker was populated!")
            print(f"   Sequence ID: {option_picker.last_sequence.id}")
            print(f"   Sequence name: {option_picker.last_sequence.name}")
            print(f"   Number of beats: {option_picker.last_sequence.length}")
            print(
                f"   Start position metadata: {option_picker.last_sequence.metadata.get('start_position')}"
            )

            if option_picker.last_sequence.beats:
                first_beat = option_picker.last_sequence.beats[0]
                print(f"   First beat letter: {first_beat.letter}")
                print(f"   First beat metadata: {first_beat.metadata}")
        else:
            print("\n❌ FAILURE: Option picker was not populated")

        print("\n🧪 Test completed")

    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    test_option_picker_population()
