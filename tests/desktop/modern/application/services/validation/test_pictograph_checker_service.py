"""
Comprehensive tests for PictographCheckerService - Legacy Parity Validation

Tests the modern PictographCheckerService against expected legacy behavior to ensure
100% functional parity with the legacy PictographChecker.
"""

import pytest
from unittest.mock import Mock, patch

from domain.models.core_models import (
    MotionData,
    MotionType,
    Orientation,
    Location,
    RotationDirection,
)
from domain.models.pictograph_models import ArrowData, PictographData
from domain.models.letter_condition import LetterCondition
from application.services.validation.pictograph_checker_service import (
    PictographCheckerService,
)


class TestPictographCheckerService:
    """Test suite for PictographCheckerService with legacy parity validation."""

    def test_alpha_ending_letters(self):
        """Test alpha ending letter detection using legacy letter_condition_mappings."""
        # Test known alpha-ending letters from legacy mappings
        alpha_ending_letters = [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "W",
            "X",
            "W-",
            "X-",
            "Φ",
            "Φ-",
            "α",
        ]

        for letter in alpha_ending_letters:
            pictograph_data = PictographData(letter=letter, arrows={})
            checker = PictographCheckerService(pictograph_data)

            assert (
                checker.ends_with_alpha()
            ), f"Letter '{letter}' should be alpha-ending"

    def test_beta_ending_letters(self):
        """Test beta ending letter detection using legacy letter_condition_mappings."""
        # Test known beta-ending letters from legacy mappings
        beta_ending_letters = [
            "G",
            "H",
            "I",
            "J",
            "K",
            "L",
            "Y",
            "Z",
            "Y-",
            "Z-",
            "Ψ",
            "Ψ-",
            "β",
        ]

        for letter in beta_ending_letters:
            pictograph_data = PictographData(letter=letter, arrows={})
            checker = PictographCheckerService(pictograph_data)

            assert checker.ends_with_beta(), f"Letter '{letter}' should be beta-ending"

    def test_gamma_ending_letters(self):
        """Test gamma ending letter detection using legacy letter_condition_mappings."""
        # Test known gamma-ending letters from legacy mappings
        gamma_ending_letters = [
            "M",
            "N",
            "O",
            "P",
            "Q",
            "R",
            "S",
            "T",
            "U",
            "V",
            "Σ",
            "Δ",
            "θ",
            "Ω",
            "Σ-",
            "Δ-",
            "θ-",
            "Ω-",
            "Λ",
            "Λ-",
            "Γ",
        ]

        for letter in gamma_ending_letters:
            pictograph_data = PictographData(letter=letter, arrows={})
            checker = PictographCheckerService(pictograph_data)

            assert (
                checker.ends_with_gamma()
            ), f"Letter '{letter}' should be gamma-ending"

    def test_non_ending_letters(self):
        """Test that letters not in any ending category return False."""
        # Test with None letter
        pictograph_data = PictographData(letter=None, arrows={})
        checker = PictographCheckerService(pictograph_data)

        assert not checker.ends_with_alpha()
        assert not checker.ends_with_beta()
        assert not checker.ends_with_gamma()

        # Test with empty string
        pictograph_data = PictographData(letter="", arrows={})
        checker = PictographCheckerService(pictograph_data)

        assert not checker.ends_with_alpha()
        assert not checker.ends_with_beta()
        assert not checker.ends_with_gamma()

    def test_letter_condition_mappings_consistency(self):
        """Test that letter condition mappings are consistent with legacy system."""
        pictograph_data = PictographData(letter="A", arrows={})
        checker = PictographCheckerService(pictograph_data)

        # Test that the internal mappings match expected legacy values
        alpha_letters = checker._get_letters_by_condition(LetterCondition.ALPHA_ENDING)
        beta_letters = checker._get_letters_by_condition(LetterCondition.BETA_ENDING)
        gamma_letters = checker._get_letters_by_condition(LetterCondition.GAMMA_ENDING)

        # Verify no overlap between categories
        assert not set(alpha_letters) & set(
            beta_letters
        ), "Alpha and beta letters should not overlap"
        assert not set(alpha_letters) & set(
            gamma_letters
        ), "Alpha and gamma letters should not overlap"
        assert not set(beta_letters) & set(
            gamma_letters
        ), "Beta and gamma letters should not overlap"

        # Verify expected letters are in correct categories
        assert "A" in alpha_letters
        assert "G" in beta_letters
        assert "M" in gamma_letters

    def test_radial_orientation_detection(self):
        """Test radial orientation detection (all props have IN/OUT orientations)."""
        # Create motion data with radial end orientation
        motion_data = MotionData(
            motion_type=MotionType.PRO,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            start_ori=Orientation.IN,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            turns=1.0,
        )
        arrow_data = ArrowData(motion_data=motion_data, color="blue")
        pictograph_data = PictographData(letter="A", arrows={"blue": arrow_data})

        checker = PictographCheckerService(pictograph_data)

        # Mock the end orientation calculation to return IN (radial)
        with patch.object(
            checker, "_get_arrow_end_orientation", return_value=Orientation.IN
        ):
            assert checker.ends_with_radial_ori()
            assert not checker.ends_with_nonradial_ori()

    def test_nonradial_orientation_detection(self):
        """Test nonradial orientation detection (all props have CLOCK/COUNTER orientations)."""
        # Create motion data with nonradial end orientation
        motion_data = MotionData(
            motion_type=MotionType.ANTI,
            start_loc=Location.NORTH,
            end_loc=Location.EAST,
            start_ori=Orientation.CLOCK,
            prop_rot_dir=RotationDirection.COUNTER_CLOCKWISE,
            turns=1.0,
        )
        arrow_data = ArrowData(motion_data=motion_data, color="red")
        pictograph_data = PictographData(letter="G", arrows={"red": arrow_data})

        checker = PictographCheckerService(pictograph_data)

        # Mock the end orientation calculation to return CLOCK (nonradial)
        with patch.object(
            checker, "_get_arrow_end_orientation", return_value=Orientation.CLOCK
        ):
            assert checker.ends_with_nonradial_ori()
            assert not checker.ends_with_radial_ori()

    def test_empty_pictograph_handling(self):
        """Test handling of pictographs with no arrows."""
        pictograph_data = PictographData(letter="A", arrows={})
        checker = PictographCheckerService(pictograph_data)

        # Should handle empty arrows gracefully
        assert not checker.ends_with_radial_ori()
        assert not checker.ends_with_nonradial_ori()
        assert not checker.ends_with_layer1()
        assert not checker.ends_with_layer2()
        assert not checker.ends_with_layer3()

    def test_orientation_calculator_integration(self):
        """Test integration with orientation calculator."""
        motion_data = MotionData(
            motion_type=MotionType.PRO,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            start_ori=Orientation.IN,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            turns=1.0,
        )

        checker = PictographCheckerService(PictographData(letter="A", arrows={}))

        # Test that orientation calculation works
        with patch(
            "application.services.positioning.arrows.calculation.orientation_calculator.OrientationCalculator"
        ) as mock_calc:
            mock_instance = mock_calc.return_value
            mock_instance.calculate_end_orientation.return_value = Orientation.OUT

            end_ori = checker._get_arrow_end_orientation(motion_data)
            assert end_ori == Orientation.OUT

            # Verify calculator was called with correct parameters
            mock_instance.calculate_end_orientation.assert_called_once()
