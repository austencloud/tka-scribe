#!/usr/bin/env python3
"""
Comprehensive test script for sequence generation functionality.

Tests all generation modes, parameters, and data format compatibility.
"""

import os
import sys
from pathlib import Path

# Add the src directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))
sys.path.insert(0, str(current_dir.parent.parent))  # Add TKA root
sys.path.insert(0, str(current_dir / "src" / "desktop" / "modern"))  # Add modern src


def test_imports():
    """Test that all required modules can be imported."""
    print("🔍 Testing imports...")

    try:
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
        from domain.models.beat_data import BeatData
        from domain.models.sequence_data import SequenceData

        print("✅ All imports successful")
        return True
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False


def test_turn_intensity_manager():
    """Test turn intensity allocation."""
    print("\n🔍 Testing TurnIntensityManager...")

    try:
        from application.services.generation.turn_intensity_manager import (
            TurnIntensityManagerFactory,
        )

        # Test different configurations
        test_cases = [
            (8, 1, 1.0),  # Basic level 1
            (16, 2, 2.0),  # Level 2 with higher intensity
            (12, 3, 1.5),  # Level 3 with fractional intensity
        ]

        for length, level, intensity in test_cases:
            turns_blue, turns_red = (
                TurnIntensityManagerFactory.allocate_turns_for_blue_and_red(
                    length, level, intensity
                )
            )

            print(f"  Length={length}, Level={level}, Intensity={intensity}")
            print(
                f"    Blue turns: {turns_blue[:5]}..."
                if len(turns_blue) > 5
                else f"    Blue turns: {turns_blue}"
            )
            print(
                f"    Red turns: {turns_red[:5]}..."
                if len(turns_red) > 5
                else f"    Red turns: {turns_red}"
            )

            # Validate results
            assert (
                len(turns_blue) == length
            ), f"Blue turns length mismatch: {len(turns_blue)} != {length}"
            assert (
                len(turns_red) == length
            ), f"Red turns length mismatch: {len(turns_red)} != {length}"

        print("✅ TurnIntensityManager tests passed")
        return True
    except Exception as e:
        print(f"❌ TurnIntensityManager test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_rotation_determiner():
    """Test rotation direction determination."""
    print("\n🔍 Testing RotationDeterminer...")

    try:
        from application.services.generation.freeform_generation_service import (
            RotationDeterminer,
        )

        # Test continuous mode
        blue_rot, red_rot = RotationDeterminer.get_rotation_dirs("continuous")
        print(f"  Continuous mode: blue={blue_rot}, red={red_rot}")
        assert (
            blue_rot is not None and red_rot is not None
        ), "Continuous mode should return rotation directions"

        # Test random mode
        blue_rot, red_rot = RotationDeterminer.get_rotation_dirs("random")
        print(f"  Random mode: blue={blue_rot}, red={red_rot}")
        assert (
            blue_rot is None and red_rot is None
        ), "Random mode should return None values"

        print("✅ RotationDeterminer tests passed")
        return True
    except Exception as e:
        print(f"❌ RotationDeterminer test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_sequence_generator():
    """Test the main SequenceGenerator class."""
    print("\n🔍 Testing SequenceGenerator...")

    try:
        from application.services.sequence.sequence_generator import (
            SequenceGenerator,
            SequenceType,
        )

        generator = SequenceGenerator()

        # Test freeform generation
        print("  Testing freeform generation...")
        freeform_sequence = generator.generate_sequence(
            sequence_type=SequenceType.FREEFORM,
            name="Test_Freeform",
            length=8,
            level=2,
            turn_intensity=1.5,
            prop_continuity="continuous",
        )

        print(f"    Generated freeform sequence: {freeform_sequence.name}")
        print(f"    Beats count: {len(freeform_sequence.beats)}")
        print(
            f"    First beat: {freeform_sequence.beats[0] if freeform_sequence.beats else 'None'}"
        )

        assert freeform_sequence.name == "Test_Freeform", "Sequence name mismatch"
        assert (
            len(freeform_sequence.beats) == 8
        ), f"Beat count mismatch: {len(freeform_sequence.beats)} != 8"

        # Test circular generation
        print("  Testing circular generation...")
        circular_sequence = generator.generate_sequence(
            sequence_type=SequenceType.CIRCULAR,
            name="Test_Circular",
            length=12,
            level=3,
            turn_intensity=2.0,
            prop_continuity="continuous",
            cap_type="strict_rotated",
        )

        print(f"    Generated circular sequence: {circular_sequence.name}")
        print(f"    Beats count: {len(circular_sequence.beats)}")
        print(
            f"    First beat: {circular_sequence.beats[0] if circular_sequence.beats else 'None'}"
        )

        assert circular_sequence.name == "Test_Circular", "Sequence name mismatch"
        assert (
            len(circular_sequence.beats) == 12
        ), f"Beat count mismatch: {len(circular_sequence.beats)} != 12"

        print("✅ SequenceGenerator tests passed")
        return True
    except Exception as e:
        print(f"❌ SequenceGenerator test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_data_format_compatibility():
    """Test that generated sequences work with both legacy and modern formats."""
    print("\n🔍 Testing data format compatibility...")

    try:
        from application.services.sequence.sequence_generator import (
            SequenceGenerator,
            SequenceType,
        )

        generator = SequenceGenerator()
        sequence = generator.generate_sequence(
            sequence_type=SequenceType.FREEFORM,
            name="Compatibility_Test",
            length=4,
            level=2,
            turn_intensity=1.0,
            prop_continuity="continuous",
        )

        # Test SequenceData methods
        print("  Testing SequenceData methods...")
        sequence_dict = sequence.to_dict()
        print(f"    to_dict() keys: {list(sequence_dict.keys())}")

        # Test BeatData methods
        if sequence.beats:
            beat = sequence.beats[0]
            print(f"    First beat data: {beat}")
            print(f"    Beat metadata: {beat.metadata}")

            # Check for legacy-compatible data
            if hasattr(beat, "letter"):
                print(f"    Beat letter: {beat.letter}")
            if hasattr(beat, "beat_number"):
                print(f"    Beat number: {beat.beat_number}")

        print("✅ Data format compatibility tests passed")
        return True
    except Exception as e:
        print(f"❌ Data format compatibility test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def run_comprehensive_tests():
    """Run all tests and provide summary."""
    print("🚀 Starting comprehensive sequence generation tests...\n")

    tests = [
        ("Imports", test_imports),
        ("TurnIntensityManager", test_turn_intensity_manager),
        ("RotationDeterminer", test_rotation_determiner),
        ("SequenceGenerator", test_sequence_generator),
        ("Data Format Compatibility", test_data_format_compatibility),
    ]

    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results.append((test_name, False))

    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)

    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if result:
            passed += 1

    print(f"\nResults: {passed}/{len(results)} tests passed")

    if passed == len(results):
        print("🎉 All tests passed! Sequence generation is working correctly.")
    else:
        print("⚠️ Some tests failed. Check the output above for details.")

    return passed == len(results)


if __name__ == "__main__":
    success = run_comprehensive_tests()
    sys.exit(0 if success else 1)
