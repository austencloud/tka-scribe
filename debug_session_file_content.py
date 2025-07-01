#!/usr/bin/env python3
"""
Debug Session File Content

This script analyzes the actual content of session_state.json to identify
what data is being saved and what might be missing.
"""

import sys
import json
from pathlib import Path

# Add TKA modern src to path
tka_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(tka_src_path))


def analyze_session_file():
    """Analyze the session file content in detail."""
    print("=" * 80)
    print("  Session File Content Analysis")
    print("=" * 80)

    session_file = Path("src/desktop/modern/session_state.json")

    if not session_file.exists():
        print("❌ No session file found")
        return False

    try:
        with open(session_file, "r") as f:
            session_data = json.load(f)

        print(f"📄 Session file: {session_file}")
        print(f"📊 File size: {session_file.stat().st_size} bytes")

        # Analyze top-level structure
        print(f"\n🔍 Top-level keys: {list(session_data.keys())}")

        # Analyze current sequence
        current_sequence = session_data.get("current_sequence", {})
        if not current_sequence:
            print("❌ No current_sequence in session data")
            return False

        print(f"\n🔍 Current sequence keys: {list(current_sequence.keys())}")

        sequence_id = current_sequence.get("sequence_id")
        sequence_data = current_sequence.get("sequence_data", {})

        print(f"📋 Sequence ID: {sequence_id}")
        print(f"📋 Sequence data keys: {list(sequence_data.keys())}")

        # Analyze sequence metadata
        sequence_name = sequence_data.get("name", "Unknown")
        beats = sequence_data.get("beats", [])

        print(f"\n📝 Sequence name: {sequence_name}")
        print(f"📝 Number of beats: {len(beats)}")

        # Analyze each beat in detail
        for i, beat in enumerate(beats):
            print(f"\n--- Beat {i} Analysis ---")
            if isinstance(beat, dict):
                print(f"🔍 Beat keys: {list(beat.keys())}")

                # Basic beat properties
                beat_number = beat.get("beat_number", "Unknown")
                letter = beat.get("letter", "Unknown")
                duration = beat.get("duration", "Unknown")

                print(f"   Beat number: {beat_number}")
                print(f"   Letter: {letter}")
                print(f"   Duration: {duration}")

                # Motion data analysis
                blue_motion = beat.get("blue_motion")
                red_motion = beat.get("red_motion")
                start_position = beat.get("start_position")

                print(f"\n🔍 Motion Data:")
                print(f"   Blue motion: {type(blue_motion)} - {blue_motion}")
                print(f"   Red motion: {type(red_motion)} - {red_motion}")
                print(f"   Start position: {type(start_position)} - {start_position}")

                # Detailed motion analysis
                if blue_motion:
                    print(f"\n   🔵 Blue Motion Details:")
                    if isinstance(blue_motion, dict):
                        print(f"      Keys: {list(blue_motion.keys())}")
                        print(f"      Motion type: {blue_motion.get('motion_type')}")
                        print(f"      Arrow: {blue_motion.get('arrow')}")
                        print(f"      Prop: {blue_motion.get('prop')}")
                    else:
                        print(f"      ⚠️ Blue motion is not a dict: {blue_motion}")

                if red_motion:
                    print(f"\n   🔴 Red Motion Details:")
                    if isinstance(red_motion, dict):
                        print(f"      Keys: {list(red_motion.keys())}")
                        print(f"      Motion type: {red_motion.get('motion_type')}")
                        print(f"      Arrow: {red_motion.get('arrow')}")
                        print(f"      Prop: {red_motion.get('prop')}")
                    else:
                        print(f"      ⚠️ Red motion is not a dict: {red_motion}")

                if start_position:
                    print(f"\n   🎯 Start Position Details:")
                    if isinstance(start_position, dict):
                        print(f"      Keys: {list(start_position.keys())}")
                        print(f"      Orientation: {start_position.get('orientation')}")
                    else:
                        print(f"      ⚠️ Start position is not a dict: {start_position}")

            else:
                print(f"⚠️ Beat {i} is not a dict: {type(beat)}")

        return True

    except Exception as e:
        print(f"❌ Failed to analyze session file: {e}")
        import traceback

        traceback.print_exc()
        return False


def create_test_sequence_with_motion():
    """Create a test sequence with actual motion data to see what gets saved."""
    print("\n" + "=" * 80)
    print("  Creating Test Sequence with Motion Data")
    print("=" * 80)

    try:
        from core.application.application_factory import ApplicationFactory
        from core.interfaces.session_services import ISessionStateService
        from domain.models.core_models import (
            SequenceData,
            BeatData,
            MotionData,
            MotionType,
        )

        print("\n--- Creating Test Application ---")
        container = ApplicationFactory.create_test_app()
        session_service = container.resolve(ISessionStateService)

        print("✅ Test application created")

        print("\n--- Creating Sequence with Motion Data ---")

        # Create motion data with correct parameters
        try:
            from data.types import RotationDirection, Location

            # Create blue motion with correct parameters
            blue_motion = MotionData(
                motion_type=MotionType.STATIC,
                prop_rot_dir=RotationDirection.NO_ROTATION,
                start_loc=Location.NORTH,
                end_loc=Location.NORTH,
                turns=0.0,
                start_ori="in",
                end_ori="in",
            )

            # Create red motion with different parameters
            red_motion = MotionData(
                motion_type=MotionType.PRO,
                prop_rot_dir=RotationDirection.CLOCKWISE,
                start_loc=Location.SOUTH,
                end_loc=Location.EAST,
                turns=1.0,
                start_ori="in",
                end_ori="out",
            )

            # For now, skip start position (focus on motion data first)
            start_position = None

            print("✅ Motion data objects created with correct parameters")
            print(
                f"   Blue motion: {blue_motion.motion_type} from {blue_motion.start_loc} to {blue_motion.end_loc}"
            )
            print(
                f"   Red motion: {red_motion.motion_type} from {red_motion.start_loc} to {red_motion.end_loc}"
            )

        except ImportError as e:
            print(f"⚠️ Could not import required types: {e}")
            return False

        # Create beat with motion data (no start_position field in BeatData)
        beat_with_motion = BeatData(
            beat_number=1,
            letter="A",
            duration=1.0,
            blue_motion=blue_motion,
            red_motion=red_motion,
        )

        print(f"✅ Beat created with motion data")
        print(f"   Blue motion type: {beat_with_motion.blue_motion.motion_type}")
        print(f"   Red motion type: {beat_with_motion.red_motion.motion_type}")
        print(
            f"   Blue motion: {beat_with_motion.blue_motion.start_loc} → {beat_with_motion.blue_motion.end_loc}"
        )
        print(
            f"   Red motion: {beat_with_motion.red_motion.start_loc} → {beat_with_motion.red_motion.end_loc}"
        )

        # Create sequence with motion beat
        sequence_with_motion = SequenceData(
            id="motion_test_seq", name="Motion Test Sequence", beats=[beat_with_motion]
        )

        print(f"✅ Sequence created: {sequence_with_motion.name}")

        print("\n--- Saving to Session ---")

        # Save to session
        session_service.update_current_sequence(
            sequence_with_motion, sequence_with_motion.id
        )

        # Force save
        save_success = session_service.save_session_state()
        if save_success:
            print("✅ Sequence with motion data saved to session")
        else:
            print("❌ Failed to save sequence to session")
            return False

        return True

    except Exception as e:
        print(f"❌ Failed to create test sequence with motion: {e}")
        import traceback

        traceback.print_exc()
        return False


def main():
    """Main analysis function."""
    print("🔍 Session File Content Debug Analysis")
    print("   This script analyzes what data is actually being saved")
    print("   and identifies missing motion/visual elements.")

    # First, analyze existing session file
    print("\n📋 Step 1: Analyze Existing Session File")
    existing_analysis = analyze_session_file()

    # Create test sequence with motion data
    print("\n📋 Step 2: Create Test Sequence with Motion Data")
    motion_test = create_test_sequence_with_motion()

    if motion_test:
        print("\n📋 Step 3: Analyze Session File After Motion Test")
        motion_analysis = analyze_session_file()

        print("\n" + "=" * 80)
        print("  Analysis Results")
        print("=" * 80)

        if existing_analysis and motion_analysis:
            print("✅ Session file analysis completed")
            print("\n🔍 Key findings:")
            print("   - Check if motion data (blue_motion, red_motion) is present")
            print("   - Verify if arrow and prop data is serialized")
            print("   - Confirm start position orientation is saved")
            print("   - Look for null/None values where motion data should be")

            print("\n🚨 If motion data is missing or null:")
            print("   - BeatData.to_dict() may not be serializing motion objects")
            print("   - MotionData.to_dict() may not be implemented")
            print("   - Motion objects may be None when they should have data")

            print("\n🚨 If motion data is present but beats appear blank:")
            print("   - BeatData.from_dict() may not be reconstructing motion objects")
            print("   - BeatView.set_beat_data() may not be rendering motion data")
            print("   - Motion data may be corrupted during deserialization")

    else:
        print("\n❌ Could not complete motion test")


if __name__ == "__main__":
    main()
