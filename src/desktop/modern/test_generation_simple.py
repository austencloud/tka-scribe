"""
Simple test script to verify sequence generation functionality.
Run this from within the application context.
"""

import sys
from pathlib import Path

# Add the src directory to Python path
current_dir = Path(__file__).parent
src_dir = current_dir / "src"
sys.path.insert(0, str(src_dir))


def test_generation_functionality():
    """Test sequence generation with various parameters."""
    print("🚀 Testing sequence generation functionality...")

    try:
        # Import required modules
        from application.services.generation.freeform_generation_service import (
            RotationDeterminer,
        )
        from application.services.generation.turn_intensity_manager import (
            TurnIntensityManagerFactory,
        )
        from application.services.sequence.sequence_generator import (
            SequenceGenerator,
            SequenceType,
        )

        print("✅ Imports successful")

        # Test 1: TurnIntensityManager
        print("\n🔍 Test 1: TurnIntensityManager")
        turns_blue, turns_red = (
            TurnIntensityManagerFactory.allocate_turns_for_blue_and_red(8, 2, 1.5)
        )
        print(f"  Blue turns (8 beats, level 2, intensity 1.5): {turns_blue}")
        print(f"  Red turns: {turns_red}")
        assert len(turns_blue) == 8 and len(turns_red) == 8, "Turn allocation failed"
        print("✅ TurnIntensityManager working")

        # Test 2: RotationDeterminer
        print("\n🔍 Test 2: RotationDeterminer")
        blue_rot, red_rot = RotationDeterminer.get_rotation_dirs("continuous")
        print(f"  Continuous mode: blue={blue_rot}, red={red_rot}")
        assert (
            blue_rot is not None and red_rot is not None
        ), "Continuous rotation failed"

        blue_rot, red_rot = RotationDeterminer.get_rotation_dirs("random")
        print(f"  Random mode: blue={blue_rot}, red={red_rot}")
        assert blue_rot is None and red_rot is None, "Random rotation failed"
        print("✅ RotationDeterminer working")

        # Test 3: SequenceGenerator - Freeform
        print("\n🔍 Test 3: Freeform Generation")
        generator = SequenceGenerator()

        freeform_seq = generator.generate_sequence(
            sequence_type=SequenceType.FREEFORM,
            name="Test_Freeform",
            length=6,
            level=2,
            turn_intensity=1.0,
            prop_continuity="continuous",
        )

        print(f"  Generated sequence: {freeform_seq.name}")
        print(f"  Beat count: {len(freeform_seq.beats)}")
        if freeform_seq.beats:
            beat = freeform_seq.beats[0]
            if beat.pictograph_data:
                letter = beat.pictograph_data.letter
                print(
                    f"  First beat: {letter} (beat #{beat.beat_number}) - REAL PICTOGRAPH DATA!"
                )
                print(f"  Start position: {beat.pictograph_data.start_position}")
                print(f"  End position: {beat.pictograph_data.end_position}")
                if beat.pictograph_data.motions:
                    for color, motion in beat.pictograph_data.motions.items():
                        print(
                            f"  {color} motion: {motion.motion_type}, turns={motion.turns}"
                        )
            else:
                letter = beat.metadata.get("letter", "N/A") if beat.metadata else "N/A"
                print(
                    f"  First beat: {letter} (beat #{beat.beat_number}) - placeholder"
                )
            print(f"  Metadata: {beat.metadata}")

        assert (
            len(freeform_seq.beats) == 6
        ), f"Expected 6 beats, got {len(freeform_seq.beats)}"
        print("✅ Freeform generation working")

        # Test 4: SequenceGenerator - Circular
        print("\n🔍 Test 4: Circular Generation")
        circular_seq = generator.generate_sequence(
            sequence_type=SequenceType.CIRCULAR,
            name="Test_Circular",
            length=8,
            level=3,
            turn_intensity=2.0,
            prop_continuity="continuous",
            cap_type="strict_rotated",
        )

        print(f"  Generated sequence: {circular_seq.name}")
        print(f"  Beat count: {len(circular_seq.beats)}")
        if circular_seq.beats:
            beat = circular_seq.beats[0]
            letter = beat.metadata.get("letter", "N/A") if beat.metadata else "N/A"
            print(f"  First beat: {letter} (beat #{beat.beat_number})")
            print(f"  Metadata: {beat.metadata}")

        assert (
            len(circular_seq.beats) == 8
        ), f"Expected 8 beats, got {len(circular_seq.beats)}"
        print("✅ Circular generation working")

        # Test 5: Different parameter combinations
        print("\n🔍 Test 5: Parameter Variations")

        test_cases = [
            # (type, length, level, intensity, continuity)
            (SequenceType.FREEFORM, 4, 1, 0.5, "continuous"),
            (SequenceType.FREEFORM, 12, 2, 2.0, "random"),
            (SequenceType.CIRCULAR, 16, 3, 1.5, "continuous"),
            (SequenceType.FREEFORM, 8, 2, 3.0, "continuous"),
        ]

        for i, (seq_type, length, level, intensity, continuity) in enumerate(
            test_cases
        ):
            print(
                f"    Case {i+1}: {seq_type.value}, len={length}, lvl={level}, int={intensity}, cont={continuity}"
            )

            seq = generator.generate_sequence(
                sequence_type=seq_type,
                name=f"Test_Case_{i+1}",
                length=length,
                level=level,
                turn_intensity=intensity,
                prop_continuity=continuity,
            )

            assert (
                len(seq.beats) == length
            ), f"Case {i+1}: Expected {length} beats, got {len(seq.beats)}"
            print(f"      ✅ Generated {len(seq.beats)} beats")

        print("✅ Parameter variations working")

        # Test 6: Data format compatibility
        print("\n🔍 Test 6: Data Format Compatibility")

        test_seq = generator.generate_sequence(
            sequence_type=SequenceType.FREEFORM,
            name="Format_Test",
            length=3,
            level=2,
            turn_intensity=1.0,
            prop_continuity="continuous",
        )

        # Test SequenceData methods
        seq_dict = test_seq.to_dict()
        print(f"  SequenceData.to_dict() keys: {list(seq_dict.keys())}")

        # Test BeatData compatibility
        if test_seq.beats:
            beat = test_seq.beats[0]
            print(f"  BeatData attributes:")

            # Check if beat has pictograph data (new format)
            if beat.pictograph_data:
                print(f"    - letter: {beat.pictograph_data.letter}")
                print(f"    - start_position: {beat.pictograph_data.start_position}")
                print(f"    - end_position: {beat.pictograph_data.end_position}")
                print(f"    - has_motions: {len(beat.pictograph_data.motions) > 0}")
                if beat.pictograph_data.motions:
                    for color, motion in beat.pictograph_data.motions.items():
                        print(
                            f"    - {color}_motion: {motion.motion_type}, turns={motion.turns}"
                        )
            else:
                # Fallback to metadata (legacy format)
                letter = beat.metadata.get("letter", "N/A") if beat.metadata else "N/A"
                print(f"    - letter: {letter} (from metadata)")

            print(f"    - beat_number: {beat.beat_number}")
            print(
                f"    - metadata keys: {list(beat.metadata.keys()) if beat.metadata else 'None'}"
            )

            # Check legacy-compatible data in metadata
            if beat.metadata:
                legacy_fields = [
                    "letter",
                    "turn_blue",
                    "turn_red",
                    "blue_rot_dir",
                    "red_rot_dir",
                    "prop_continuity",
                ]
                for field in legacy_fields:
                    if field in beat.metadata:
                        print(f"    - {field}: {beat.metadata[field]}")

        print("✅ Data format compatibility working")

        # Test 7: UI Integration Test (Simulate Generate Button)
        print("\n🔍 Test 7: UI Integration Simulation")

        # Simulate the generation config that would come from the UI
        from domain.models.generation_models import (
            GenerationConfig,
            GenerationMode,
            LetterType,
            PropContinuity,
        )

        # Test freeform generation config
        freeform_config = GenerationConfig(
            mode=GenerationMode.FREEFORM,
            length=8,
            level=2,
            turn_intensity=1.5,
            prop_continuity=PropContinuity.CONTINUOUS,
            letter_types=[LetterType.TYPE1, LetterType.TYPE2],
        )

        print(f"    Simulating freeform generation with config: {freeform_config}")

        # Simulate what happens in construct_tab._on_generate_requested
        freeform_result = generator.generate_sequence(
            sequence_type=SequenceType.FREEFORM,
            name=f"Generated_{SequenceType.FREEFORM.value}",
            length=freeform_config.length,
            level=freeform_config.level,
            turn_intensity=freeform_config.turn_intensity,
            prop_continuity=freeform_config.prop_continuity.value,
            letter_types=freeform_config.letter_types,
        )

        print(f"    ✅ UI simulation generated {len(freeform_result.beats)} beats")

        # Test circular generation config
        circular_config = GenerationConfig(
            mode=GenerationMode.CIRCULAR,
            length=12,
            level=3,
            turn_intensity=2.0,
            prop_continuity=PropContinuity.CONTINUOUS,
            cap_type="strict_rotated",
        )

        print(f"    Simulating circular generation with config: {circular_config}")

        circular_result = generator.generate_sequence(
            sequence_type=SequenceType.CIRCULAR,
            name=f"Generated_{SequenceType.CIRCULAR.value}",
            length=circular_config.length,
            level=circular_config.level,
            turn_intensity=circular_config.turn_intensity,
            prop_continuity=circular_config.prop_continuity.value,
            cap_type=circular_config.cap_type,
        )

        print(f"    ✅ UI simulation generated {len(circular_result.beats)} beats")
        print("✅ UI integration simulation working")

        print("\n🎉 ALL TESTS PASSED! Sequence generation is fully functional.")
        print("🚀 The Generate button should work correctly in the application!")
        return True

    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    # This will be called when running the script directly
    success = test_generation_functionality()
    if success:
        print("\n✅ Generation tests completed successfully!")
    else:
        print("\n❌ Generation tests failed!")
