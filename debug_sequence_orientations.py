#!/usr/bin/env python3
"""
Debug Sequence Orientation Flow

This script monitors the actual sequence data and orientation flow
to identify why options always have default "in" orientations.
"""

import json
import sys
import time
from pathlib import Path

# Add modern/src to path for imports
modern_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(modern_src_path))


def read_current_sequence():
    """Read the current sequence from the persistence file."""
    try:
        sequence_file = Path("src/desktop/modern/current_sequence.json")
        if sequence_file.exists():
            with open(sequence_file, "r") as f:
                data = json.load(f)
            return data
        else:
            print("❌ No current_sequence.json found")
            return None
    except Exception as e:
        print(f"❌ Error reading sequence: {e}")
        return None


def analyze_sequence_orientations(sequence_data):
    """Analyze the orientation data in the sequence."""
    if not sequence_data:
        return

    print("\n🔍 SEQUENCE ORIENTATION ANALYSIS")
    print("=" * 50)

    # Check if it's the new format or old format
    if isinstance(sequence_data, list):
        print("📊 Sequence format: List (legacy)")
        beats = sequence_data
    elif isinstance(sequence_data, dict):
        print("📊 Sequence format: Dict (modern)")
        beats = sequence_data.get("beats", [])
        start_pos = sequence_data.get("start_position")
        if start_pos:
            print(f"🎯 Start position: {start_pos}")
    else:
        print("❌ Unknown sequence format")
        return

    print(f"📏 Total beats: {len(beats)}")

    for i, beat in enumerate(beats):
        print(f"\n🎵 Beat {i + 1}:")
        print(f"   Letter: {beat.get('letter', 'Unknown')}")

        # Check for motion data
        blue_motion = beat.get("blue_motion")
        red_motion = beat.get("red_motion")

        if blue_motion:
            print(f"   🔵 Blue Motion:")
            print(f"      Start Ori: {blue_motion.get('start_ori', 'None')}")
            print(f"      End Ori: {blue_motion.get('end_ori', 'None')}")
            print(f"      Start Loc: {blue_motion.get('start_loc', 'None')}")
            print(f"      End Loc: {blue_motion.get('end_loc', 'None')}")
        else:
            print(f"   🔵 Blue Motion: None")

        if red_motion:
            print(f"   🔴 Red Motion:")
            print(f"      Start Ori: {red_motion.get('start_ori', 'None')}")
            print(f"      End Ori: {red_motion.get('end_ori', 'None')}")
            print(f"      Start Loc: {red_motion.get('start_loc', 'None')}")
            print(f"      End Loc: {red_motion.get('end_loc', 'None')}")
        else:
            print(f"   🔴 Red Motion: None")

        # Check for glyph data
        glyph_data = beat.get("glyph_data")
        if glyph_data:
            print(f"   📍 Glyph Data:")
            print(f"      Start Pos: {glyph_data.get('start_position', 'None')}")
            print(f"      End Pos: {glyph_data.get('end_position', 'None')}")
        else:
            print(f"   📍 Glyph Data: None")


def test_orientation_extraction():
    """Test the orientation extraction logic from the actual sequence."""
    print("\n🧪 TESTING ORIENTATION EXTRACTION")
    print("=" * 40)

    try:
        from application.services.option_picker.option_orientation_updater import (
            OptionOrientationUpdater,
        )
        from domain.models.beat_data import BeatData
        from domain.models.enums import Orientation
        from domain.models.motion_models import MotionData
        from domain.models.sequence_models import SequenceData

        # Read current sequence
        sequence_data = read_current_sequence()
        if not sequence_data:
            print("❌ No sequence data to test")
            return

        # Try to convert to SequenceData object
        if isinstance(sequence_data, dict) and "beats" in sequence_data:
            beats_data = sequence_data["beats"]

            # Convert to BeatData objects (simplified)
            beat_objects = []
            for beat_dict in beats_data:
                # Create a simple BeatData for testing
                beat_obj = type(
                    "BeatData",
                    (),
                    {
                        "blue_motion": (
                            type("Motion", (), beat_dict.get("blue_motion", {}))()
                            if beat_dict.get("blue_motion")
                            else None
                        ),
                        "red_motion": (
                            type("Motion", (), beat_dict.get("red_motion", {}))()
                            if beat_dict.get("red_motion")
                            else None
                        ),
                        "glyph_data": (
                            type("Glyph", (), beat_dict.get("glyph_data", {}))()
                            if beat_dict.get("glyph_data")
                            else None
                        ),
                    },
                )()
                beat_objects.append(beat_obj)

            # Create sequence object
            sequence_obj = type(
                "Sequence", (), {"beats": beat_objects, "length": len(beat_objects)}
            )()

            # Test orientation extraction
            updater = OptionOrientationUpdater()
            if beat_objects:
                last_beat = beat_objects[-1]
                blue_end_ori, red_end_ori = updater._extract_end_orientations_from_beat(
                    last_beat
                )

                print(f"✅ Extracted orientations from last beat:")
                print(f"   🔵 Blue end orientation: {blue_end_ori}")
                print(f"   🔴 Red end orientation: {red_end_ori}")

                # Compare with raw data
                raw_last_beat = beats_data[-1]
                raw_blue = raw_last_beat.get("blue_motion", {}).get("end_ori")
                raw_red = raw_last_beat.get("red_motion", {}).get("end_ori")

                print(f"📊 Raw data comparison:")
                print(f"   🔵 Raw blue end_ori: {raw_blue}")
                print(f"   🔴 Raw red end_ori: {raw_red}")

                if str(blue_end_ori) != str(raw_blue) or str(red_end_ori) != str(
                    raw_red
                ):
                    print("⚠️ MISMATCH DETECTED!")
                else:
                    print("✅ Extraction matches raw data")

    except Exception as e:
        print(f"❌ Error testing orientation extraction: {e}")
        import traceback

        traceback.print_exc()


def monitor_sequence_changes():
    """Monitor the sequence file for changes and analyze orientations."""
    print("🔍 MONITORING SEQUENCE CHANGES")
    print("=" * 40)
    print("Watching current_sequence.json for changes...")
    print("Click options in the application to see orientation flow!")
    print("Press Ctrl+C to stop monitoring")

    sequence_file = Path("src/desktop/modern/current_sequence.json")
    last_modified = 0
    last_length = 0

    try:
        while True:
            if sequence_file.exists():
                current_modified = sequence_file.stat().st_mtime

                if current_modified > last_modified:
                    last_modified = current_modified

                    # Read and analyze sequence
                    sequence_data = read_current_sequence()
                    if sequence_data:
                        # Handle both list and dict formats
                        if isinstance(sequence_data, list):
                            current_length = len(sequence_data)
                        else:
                            current_length = len(sequence_data.get("beats", []))

                        if current_length != last_length:
                            print(
                                f"\n🔄 SEQUENCE UPDATED (Length: {last_length} → {current_length})"
                            )
                            print("=" * 60)
                            analyze_sequence_orientations(sequence_data)
                            test_orientation_extraction()
                            last_length = current_length
                            print("\n⏳ Waiting for next change...")

            time.sleep(0.5)  # Check every 500ms

    except KeyboardInterrupt:
        print("\n👋 Monitoring stopped")


def debug_option_picker_flow():
    """Debug the complete option picker flow with real data."""
    print("\n🔧 DEBUGGING OPTION PICKER FLOW")
    print("=" * 40)

    try:
        from application.services.option_picker.option_orientation_updater import (
            OptionOrientationUpdater,
        )
        from application.services.option_picker.option_provider import OptionProvider

        # Read current sequence
        sequence_data = read_current_sequence()
        if not sequence_data:
            print("❌ No sequence data to debug")
            return

        print("✅ Current sequence loaded")
        analyze_sequence_orientations(sequence_data)

        # Test option provider
        print("\n🔍 Testing Option Provider...")
        option_provider = OptionProvider(signal_emitter=None)

        # Create a mock sequence object for testing
        # This is a simplified version - in real app it would be proper SequenceData
        mock_sequence = type("MockSequence", (), {"beats": [], "length": 0})()

        # Convert beats to mock objects
        if "beats" in sequence_data:
            for beat_dict in sequence_data["beats"]:
                mock_beat = type(
                    "MockBeat",
                    (),
                    {
                        "glyph_data": (
                            type("MockGlyph", (), beat_dict.get("glyph_data", {}))()
                            if beat_dict.get("glyph_data")
                            else None
                        ),
                        "blue_motion": (
                            type("MockMotion", (), beat_dict.get("blue_motion", {}))()
                            if beat_dict.get("blue_motion")
                            else None
                        ),
                        "red_motion": (
                            type("MockMotion", (), beat_dict.get("red_motion", {}))()
                            if beat_dict.get("red_motion")
                            else None
                        ),
                    },
                )()
                mock_sequence.beats.append(mock_beat)
            mock_sequence.length = len(mock_sequence.beats)

        if mock_sequence.length > 0:
            print(f"📊 Testing with sequence of {mock_sequence.length} beats")

            # Test loading options
            try:
                options = option_provider.load_options_from_modern_sequence(
                    mock_sequence
                )
                print(f"✅ Loaded {len(options)} options")

                # Check first few options' orientations
                for i, option in enumerate(options[:3]):
                    print(f"   Option {i+1}: {option.letter}")
                    if hasattr(option, "props") and option.props:
                        for color, prop in option.props.items():
                            print(f"      {color} prop orientation: {prop.orientation}")

            except Exception as e:
                print(f"❌ Error loading options: {e}")
                import traceback

                traceback.print_exc()

    except Exception as e:
        print(f"❌ Error debugging option picker: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    print("🚀 SEQUENCE ORIENTATION DEBUGGER")
    print("=" * 50)

    # First, analyze current state
    sequence_data = read_current_sequence()
    if sequence_data:
        analyze_sequence_orientations(sequence_data)
        test_orientation_extraction()
        debug_option_picker_flow()

    print("\n" + "=" * 50)
    print("Choose debugging mode:")
    print("1. Monitor sequence changes (real-time)")
    print("2. Analyze current sequence only")
    print("3. Debug option picker flow")

    try:
        choice = input("\nEnter choice (1-3): ").strip()

        if choice == "1":
            monitor_sequence_changes()
        elif choice == "2":
            if sequence_data:
                analyze_sequence_orientations(sequence_data)
                test_orientation_extraction()
            else:
                print("❌ No sequence data found")
        elif choice == "3":
            debug_option_picker_flow()
        else:
            print("❌ Invalid choice")

    except KeyboardInterrupt:
        print("\n👋 Debugging stopped")
