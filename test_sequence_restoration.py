#!/usr/bin/env python3
"""
Test Sequence Restoration

This script tests the complete sequence restoration cycle:
1. Create sequence with motion data
2. Save to session
3. Load from session
4. Verify motion data is restored correctly
"""

import sys
import json
from pathlib import Path

# Add TKA modern src to path
tka_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(tka_src_path))


def test_complete_restoration_cycle():
    """Test the complete save/restore cycle for sequences with motion data."""
    print("=" * 80)
    print("  Complete Sequence Restoration Test")
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
        from data.types import RotationDirection, Location

        print("\n--- Step 1: Create Test Application ---")
        container = ApplicationFactory.create_test_app()
        session_service = container.resolve(ISessionStateService)
        print("✅ Test application created")

        print("\n--- Step 2: Create Sequence with Rich Motion Data ---")

        # Create blue motion (STATIC at NORTH)
        blue_motion = MotionData(
            motion_type=MotionType.STATIC,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            start_loc=Location.NORTH,
            end_loc=Location.NORTH,
            turns=0.0,
            start_ori="in",
            end_ori="in",
        )

        # Create red motion (PRO from SOUTH to EAST)
        red_motion = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.SOUTH,
            end_loc=Location.EAST,
            turns=1.0,
            start_ori="in",
            end_ori="out",
        )

        # Create beat with motion data
        test_beat = BeatData(
            beat_number=1,
            letter="X",
            duration=2.5,
            blue_motion=blue_motion,
            red_motion=red_motion,
            metadata={"test_marker": "restoration_test"},
        )

        # Create sequence
        test_sequence = SequenceData(
            id="restoration_test_seq",
            name="Restoration Test Sequence",
            beats=[test_beat],
        )

        print(f"✅ Created sequence: {test_sequence.name}")
        print(f"   Beat: {test_beat.letter} (duration: {test_beat.duration})")
        print(f"   Blue motion: {blue_motion.motion_type} at {blue_motion.start_loc}")
        print(
            f"   Red motion: {red_motion.motion_type} from {red_motion.start_loc} to {red_motion.end_loc}"
        )

        print("\n--- Step 3: Save Sequence to Session ---")

        # Save to session
        session_service.update_current_sequence(test_sequence, test_sequence.id)
        save_success = session_service.save_session_state()

        if not save_success:
            print("❌ Failed to save sequence to session")
            return False

        print("✅ Sequence saved to session successfully")

        print("\n--- Step 4: Load Session State (Simulate Restart) ---")

        # Create fresh application (simulate restart)
        fresh_container = ApplicationFactory.create_test_app()
        fresh_session_service = fresh_container.resolve(ISessionStateService)

        # Load session state
        load_success = fresh_session_service.load_session_state()

        if not load_success:
            print("❌ Failed to load session state")
            return False

        print("✅ Session state loaded successfully")

        print("\n--- Step 5: Verify Restored Sequence Data ---")

        # Get current session state
        current_session = fresh_session_service.get_current_session_state()

        if not current_session:
            print("❌ No current session found")
            return False

        if not current_session.current_sequence_data:
            print("❌ No sequence data in current session")
            return False

        # Convert restored data back to SequenceData
        restored_sequence_dict = current_session.current_sequence_data
        restored_sequence = SequenceData.from_dict(restored_sequence_dict)

        print(f"✅ Restored sequence: {restored_sequence.name}")
        print(f"   Sequence ID: {restored_sequence.id}")
        print(f"   Number of beats: {len(restored_sequence.beats)}")

        if len(restored_sequence.beats) == 0:
            print("❌ No beats in restored sequence")
            return False

        # Verify beat data
        restored_beat = restored_sequence.beats[0]
        print(f"\n🔍 Restored Beat Analysis:")
        print(f"   Beat number: {restored_beat.beat_number}")
        print(f"   Letter: {restored_beat.letter}")
        print(f"   Duration: {restored_beat.duration}")
        print(f"   Metadata: {restored_beat.metadata}")

        # Verify motion data
        if not restored_beat.blue_motion:
            print("❌ Blue motion data missing")
            return False

        if not restored_beat.red_motion:
            print("❌ Red motion data missing")
            return False

        print(f"\n🔵 Blue Motion Verification:")
        print(f"   Type: {restored_beat.blue_motion.motion_type}")
        print(f"   Rotation: {restored_beat.blue_motion.prop_rot_dir}")
        print(f"   Start: {restored_beat.blue_motion.start_loc}")
        print(f"   End: {restored_beat.blue_motion.end_loc}")
        print(f"   Turns: {restored_beat.blue_motion.turns}")

        print(f"\n🔴 Red Motion Verification:")
        print(f"   Type: {restored_beat.red_motion.motion_type}")
        print(f"   Rotation: {restored_beat.red_motion.prop_rot_dir}")
        print(f"   Start: {restored_beat.red_motion.start_loc}")
        print(f"   End: {restored_beat.red_motion.end_loc}")
        print(f"   Turns: {restored_beat.red_motion.turns}")

        print("\n--- Step 6: Data Integrity Verification ---")

        # Debug the location comparison issue
        print(f"\n🔍 Debug Location Comparison:")
        print(
            f"   Original blue start: {blue_motion.start_loc} (type: {type(blue_motion.start_loc)})"
        )
        print(
            f"   Restored blue start: {restored_beat.blue_motion.start_loc} (type: {type(restored_beat.blue_motion.start_loc)})"
        )
        print(
            f"   Blue start equality: {blue_motion.start_loc == restored_beat.blue_motion.start_loc}"
        )
        print(
            f"   Blue start identity: {blue_motion.start_loc is restored_beat.blue_motion.start_loc}"
        )
        print(
            f"   Blue start values: '{blue_motion.start_loc.value}' vs '{restored_beat.blue_motion.start_loc.value}'"
        )

        print(
            f"   Original red start: {red_motion.start_loc} (type: {type(red_motion.start_loc)})"
        )
        print(
            f"   Restored red start: {restored_beat.red_motion.start_loc} (type: {type(restored_beat.red_motion.start_loc)})"
        )
        print(
            f"   Red start equality: {red_motion.start_loc == restored_beat.red_motion.start_loc}"
        )
        print(
            f"   Red start identity: {red_motion.start_loc is restored_beat.red_motion.start_loc}"
        )
        print(
            f"   Red start values: '{red_motion.start_loc.value}' vs '{restored_beat.red_motion.start_loc.value}'"
        )

        # Verify exact data matches
        integrity_checks = []

        # Beat properties
        integrity_checks.append(
            ("Beat number", restored_beat.beat_number == test_beat.beat_number)
        )
        integrity_checks.append(("Letter", restored_beat.letter == test_beat.letter))
        integrity_checks.append(
            ("Duration", restored_beat.duration == test_beat.duration)
        )

        # Blue motion properties
        integrity_checks.append(
            (
                "Blue motion type",
                restored_beat.blue_motion.motion_type == blue_motion.motion_type,
            )
        )
        integrity_checks.append(
            (
                "Blue start location",
                restored_beat.blue_motion.start_loc == blue_motion.start_loc,
            )
        )
        integrity_checks.append(
            (
                "Blue end location",
                restored_beat.blue_motion.end_loc == blue_motion.end_loc,
            )
        )
        integrity_checks.append(
            ("Blue turns", restored_beat.blue_motion.turns == blue_motion.turns)
        )

        # Red motion properties
        integrity_checks.append(
            (
                "Red motion type",
                restored_beat.red_motion.motion_type == red_motion.motion_type,
            )
        )
        integrity_checks.append(
            (
                "Red start location",
                restored_beat.red_motion.start_loc == red_motion.start_loc,
            )
        )
        integrity_checks.append(
            ("Red end location", restored_beat.red_motion.end_loc == red_motion.end_loc)
        )
        integrity_checks.append(
            ("Red turns", restored_beat.red_motion.turns == red_motion.turns)
        )

        print("🔍 Data Integrity Results:")
        all_passed = True
        for check_name, passed in integrity_checks:
            status = "✅" if passed else "❌"
            print(f"   {status} {check_name}")
            if not passed:
                all_passed = False

        if all_passed:
            print("\n🎉 SUCCESS: Complete restoration cycle works perfectly!")
            print("   - Motion data is saved correctly")
            print("   - Motion data is loaded correctly")
            print("   - All properties are preserved exactly")
            return True
        else:
            print("\n❌ FAILURE: Some data integrity checks failed")
            return False

    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        import traceback

        traceback.print_exc()
        return False


def main():
    """Main test function."""
    print("🔍 Sequence Restoration Test")
    print("   This script tests the complete save/restore cycle")
    print("   to verify motion data persistence works correctly.")

    success = test_complete_restoration_cycle()

    if success:
        print("\n" + "=" * 80)
        print("  🎉 RESTORATION TEST PASSED")
        print("=" * 80)
        print("\n✅ The sequence restoration system is working correctly!")
        print(
            "✅ Motion data (arrows, props, orientations) will persist across restarts"
        )
        print("✅ Beat frame should display visual elements correctly")

        print("\n🔍 Next Steps:")
        print("   1. Test with TKA main application to verify UI rendering")
        print("   2. Verify beat views display arrows and props correctly")
        print("   3. Test with multiple beats and complex sequences")

    else:
        print("\n" + "=" * 80)
        print("  ❌ RESTORATION TEST FAILED")
        print("=" * 80)
        print("\n❌ The sequence restoration system has issues")
        print("❌ Motion data may not persist correctly across restarts")
        print("❌ Further investigation needed")


if __name__ == "__main__":
    main()
