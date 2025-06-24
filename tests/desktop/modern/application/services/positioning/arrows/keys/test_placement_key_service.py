"""
Comprehensive tests for PlacementKeyService - Legacy Parity Validation

Tests the modern PlacementKeyService against expected legacy behavior to ensure
100% functional parity with the legacy PlacementKeyGenerator.
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
from application.services.positioning.arrows.keys.placement_key_service import (
    PlacementKeyService,
)


class TestPlacementKeyService:
    """Test suite for PlacementKeyService with legacy parity validation."""

    @pytest.fixture
    def placement_key_service(self):
        """Create a PlacementKeyService instance."""
        return PlacementKeyService()

    @pytest.fixture
    def sample_motion_data(self):
        """Create sample motion data for testing."""
        return MotionData(
            motion_type=MotionType.PRO,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            start_ori="in",
            prop_rot_dir=RotationDirection.CLOCKWISE,
            turns=1.0,
        )

    @pytest.fixture
    def sample_arrow_data(self, sample_motion_data):
        """Create sample arrow data for testing."""
        return ArrowData(motion_data=sample_motion_data, color="blue")

    @pytest.fixture
    def sample_pictograph_data(self):
        """Create sample pictograph data for testing."""
        return PictographData(letter="A", arrows={})

    def test_basic_placement_key_generation(
        self, placement_key_service, sample_arrow_data, sample_pictograph_data
    ):
        """Test basic placement key generation with simple inputs."""
        default_placements = {
            "pro_to_layer1_alpha_A": {"x": 100, "y": 100},
            "pro_to_layer1_alpha": {"x": 90, "y": 90},
            "pro": {"x": 80, "y": 80},
        }

        key = placement_key_service.generate_placement_key(
            sample_arrow_data, sample_pictograph_data, default_placements
        )

        # Should prefer the most specific key available
        assert key in default_placements
        assert "pro" in key  # Should contain motion type

    def test_letter_suffix_generation_type1(self, placement_key_service):
        """Test letter suffix generation for Type1 letters (normal letters)."""
        # Type1 letters should get normal suffix
        suffix = placement_key_service._get_letter_suffix("A")
        assert suffix == "_A"

        suffix = placement_key_service._get_letter_suffix("G")
        assert suffix == "_G"

        suffix = placement_key_service._get_letter_suffix("M")
        assert suffix == "_M"

    def test_letter_suffix_generation_type3_type5(self, placement_key_service):
        """Test letter suffix generation for Type3 and Type5 letters (dash letters)."""
        # Type3 letters (dash letters) should get special dash suffix
        suffix = placement_key_service._get_letter_suffix("W-")
        assert suffix == "_W_dash"

        suffix = placement_key_service._get_letter_suffix("X-")
        assert suffix == "_X_dash"

        suffix = placement_key_service._get_letter_suffix("Y-")
        assert suffix == "_Y_dash"

        # Type5 letters (dash letters) should also get special dash suffix
        suffix = placement_key_service._get_letter_suffix("Φ-")
        assert suffix == "_Φ_dash"

        suffix = placement_key_service._get_letter_suffix("Ψ-")
        assert suffix == "_Ψ_dash"

    def test_letter_suffix_generation_no_letter(self, placement_key_service):
        """Test letter suffix generation when no letter is provided."""
        suffix = placement_key_service._get_letter_suffix(None)
        assert suffix == ""

        suffix = placement_key_service._get_letter_suffix("")
        assert suffix == ""

    def test_motion_end_ori_key_generation(self, placement_key_service):
        """Test motion end orientation key generation for hybrid orientations."""
        # Hybrid orientation with radial end orientation
        key = placement_key_service._get_motion_end_ori_key(True, "IN")
        assert key == "radial_"

        key = placement_key_service._get_motion_end_ori_key(True, "OUT")
        assert key == "radial_"

        # Hybrid orientation with nonradial end orientation
        key = placement_key_service._get_motion_end_ori_key(True, "CLOCK")
        assert key == "nonradial_"

        key = placement_key_service._get_motion_end_ori_key(True, "COUNTER")
        assert key == "nonradial_"

        # Non-hybrid orientation should return empty string
        key = placement_key_service._get_motion_end_ori_key(False, "IN")
        assert key == ""

        key = placement_key_service._get_motion_end_ori_key(False, "CLOCK")
        assert key == ""

    def test_key_middle_generation_layer1(self, placement_key_service):
        """Test key middle generation for layer1 (radial props)."""
        # Layer1 with alpha props
        key_middle = placement_key_service._get_key_middle(
            has_radial_props=True,
            has_nonradial_props=False,
            has_hybrid_orientation=False,
            has_alpha_props=True,
            has_beta_props=False,
            has_gamma_props=False,
        )
        assert key_middle == "layer1_alpha"

        # Layer1 with beta props
        key_middle = placement_key_service._get_key_middle(
            has_radial_props=True,
            has_nonradial_props=False,
            has_hybrid_orientation=False,
            has_alpha_props=False,
            has_beta_props=True,
            has_gamma_props=False,
        )
        assert key_middle == "layer1_beta"

    def test_key_middle_generation_layer2(self, placement_key_service):
        """Test key middle generation for layer2 (nonradial props)."""
        key_middle = placement_key_service._get_key_middle(
            has_radial_props=False,
            has_nonradial_props=True,
            has_hybrid_orientation=False,
            has_alpha_props=True,
            has_beta_props=False,
            has_gamma_props=False,
        )
        assert key_middle == "layer2_alpha"

    def test_key_middle_generation_layer3(self, placement_key_service):
        """Test key middle generation for layer3 (hybrid orientation)."""
        key_middle = placement_key_service._get_key_middle(
            has_radial_props=False,
            has_nonradial_props=False,
            has_hybrid_orientation=True,
            has_alpha_props=False,
            has_beta_props=False,
            has_gamma_props=True,
        )
        assert key_middle == "layer3_gamma"

    def test_key_middle_generation_no_layer(self, placement_key_service):
        """Test key middle generation when no layer conditions are met."""
        key_middle = placement_key_service._get_key_middle(
            has_radial_props=False,
            has_nonradial_props=False,
            has_hybrid_orientation=False,
            has_alpha_props=True,
            has_beta_props=False,
            has_gamma_props=False,
        )
        assert key_middle == ""

    def test_key_selection_priority(self, placement_key_service):
        """Test key selection priority logic."""
        # Test priority 1: key_with_letter exists
        default_placements = {
            "pro_to_layer1_alpha_A": {"x": 100, "y": 100},
            "pro_to_layer1_alpha": {"x": 90, "y": 90},
            "pro": {"x": 80, "y": 80},
        }

        selected_key = placement_key_service._select_key(
            "pro_to_layer1_alpha_A", "pro_to_layer1_alpha", "pro", default_placements
        )
        assert selected_key == "pro_to_layer1_alpha_A"

        # Test priority 2: key exists but key_with_letter doesn't
        default_placements = {
            "pro_to_layer1_alpha": {"x": 90, "y": 90},
            "pro": {"x": 80, "y": 80},
        }

        selected_key = placement_key_service._select_key(
            "pro_to_layer1_alpha_A", "pro_to_layer1_alpha", "pro", default_placements
        )
        assert selected_key == "pro_to_layer1_alpha"

        # Test priority 3: only motion_type exists
        default_placements = {"pro": {"x": 80, "y": 80}}

        selected_key = placement_key_service._select_key(
            "pro_to_layer1_alpha_A", "pro_to_layer1_alpha", "pro", default_placements
        )
        assert selected_key == "pro"

        # Test fallback: nothing exists in default_placements
        default_placements = {}

        selected_key = placement_key_service._select_key(
            "pro_to_layer1_alpha_A", "pro_to_layer1_alpha", "pro", default_placements
        )
        assert selected_key == "pro"  # Falls back to motion_type

    def test_motion_type_extraction(self, placement_key_service):
        """Test motion type string extraction from motion data."""
        pro_motion_data = MotionData(
            motion_type=MotionType.PRO,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            start_ori="in",
            prop_rot_dir=RotationDirection.CLOCKWISE,
            turns=1.0,
        )

        motion_type = placement_key_service._get_motion_type_string(pro_motion_data)
        assert motion_type == "pro"

        # Test with different motion types - create new instance
        anti_motion_data = MotionData(
            motion_type=MotionType.ANTI,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            start_ori="in",
            prop_rot_dir=RotationDirection.COUNTER_CLOCKWISE,
            turns=1.0,
        )
        motion_type = placement_key_service._get_motion_type_string(anti_motion_data)
        assert motion_type == "anti"

        # Test with None motion data
        motion_type = placement_key_service._get_motion_type_string(None)
        assert motion_type == "static"

    def test_legacy_compatibility_method(
        self, placement_key_service, sample_motion_data
    ):
        """Test the legacy compatibility method for backward compatibility."""
        key = placement_key_service.generate_placement_key_legacy(sample_motion_data)

        # Should return a valid key (will be motion type since no default placements)
        assert key == "pro"  # Falls back to motion type

    def test_debug_key_generation(
        self, placement_key_service, sample_arrow_data, sample_pictograph_data, capsys
    ):
        """Test the debug key generation method."""
        default_placements = {"pro": {"x": 80, "y": 80}}

        key = placement_key_service.debug_key_generation(
            sample_arrow_data, sample_pictograph_data, default_placements
        )

        # Check that debug output was printed
        captured = capsys.readouterr()
        assert "Key Generation Debug" in captured.out
        assert "Letter: A" in captured.out
        assert "Generated Key:" in captured.out

        # Should return a valid key
        assert key == "pro"


class TestPlacementKeyServicePictographIntegration:
    """Test suite for PlacementKeyService integration with PictographCheckerService."""

    @pytest.fixture
    def placement_key_service(self):
        """Create a PlacementKeyService instance."""
        return PlacementKeyService()

    def test_alpha_ending_letter_integration(self, placement_key_service):
        """Test placement key generation with alpha-ending letters."""
        # Create arrow and pictograph data for alpha-ending letter
        motion_data = MotionData(
            motion_type=MotionType.PRO,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            start_ori="in",
            prop_rot_dir=RotationDirection.CLOCKWISE,
            turns=1.0,
        )
        arrow_data = ArrowData(motion_data=motion_data, color="blue")
        pictograph_data = PictographData(letter="A", arrows={"blue": arrow_data})

        default_placements = {
            "pro_to_layer1_alpha_A": {"x": 100, "y": 100},
            "pro_to_layer1_alpha": {"x": 90, "y": 90},
            "pro": {"x": 80, "y": 80},
        }

        with patch(
            "application.services.validation.pictograph_checker_service.PictographCheckerService"
        ) as mock_checker:
            # Mock alpha ending behavior
            mock_instance = mock_checker.return_value
            mock_instance.ends_with_alpha.return_value = True
            mock_instance.ends_with_beta.return_value = False
            mock_instance.ends_with_gamma.return_value = False
            mock_instance.ends_with_layer3.return_value = False
            mock_instance.ends_with_radial_ori.return_value = True
            mock_instance.ends_with_nonradial_ori.return_value = False

            key = placement_key_service.generate_placement_key(
                arrow_data, pictograph_data, default_placements
            )

            # Should generate key with alpha component
            assert "alpha" in key
            assert key == "pro_to_layer1_alpha_A"

    def test_beta_ending_letter_integration(self, placement_key_service):
        """Test placement key generation with beta-ending letters."""
        motion_data = MotionData(
            motion_type=MotionType.ANTI,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            start_ori="in",
            prop_rot_dir=RotationDirection.COUNTER_CLOCKWISE,
            turns=1.0,
        )
        arrow_data = ArrowData(motion_data=motion_data, color="red")
        pictograph_data = PictographData(letter="G", arrows={"red": arrow_data})

        default_placements = {
            "anti_to_layer1_beta_G": {"x": 100, "y": 100},
            "anti_to_layer1_beta": {"x": 90, "y": 90},
            "anti": {"x": 80, "y": 80},
        }

        with patch(
            "application.services.validation.pictograph_checker_service.PictographCheckerService"
        ) as mock_checker:
            # Mock beta ending behavior
            mock_instance = mock_checker.return_value
            mock_instance.ends_with_alpha.return_value = False
            mock_instance.ends_with_beta.return_value = True
            mock_instance.ends_with_gamma.return_value = False
            mock_instance.ends_with_layer3.return_value = False
            mock_instance.ends_with_radial_ori.return_value = True
            mock_instance.ends_with_nonradial_ori.return_value = False

            key = placement_key_service.generate_placement_key(
                arrow_data, pictograph_data, default_placements
            )

            # Should generate key with beta component
            assert "beta" in key
            assert key == "anti_to_layer1_beta_G"

    def test_dash_letter_integration(self, placement_key_service):
        """Test placement key generation with dash letters (Type3/Type5)."""
        motion_data = MotionData(
            motion_type=MotionType.PRO,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            start_ori="in",
            prop_rot_dir=RotationDirection.CLOCKWISE,
            turns=1.0,
        )
        arrow_data = ArrowData(motion_data=motion_data, color="blue")
        pictograph_data = PictographData(letter="W-", arrows={"blue": arrow_data})

        default_placements = {
            "pro_to_layer1_alpha_W_dash": {"x": 100, "y": 100},
            "pro_to_layer1_alpha": {"x": 90, "y": 90},
            "pro": {"x": 80, "y": 80},
        }

        with patch(
            "application.services.validation.pictograph_checker_service.PictographCheckerService"
        ) as mock_checker:
            # Mock alpha ending behavior for dash letter
            mock_instance = mock_checker.return_value
            mock_instance.ends_with_alpha.return_value = True
            mock_instance.ends_with_beta.return_value = False
            mock_instance.ends_with_gamma.return_value = False
            mock_instance.ends_with_layer3.return_value = False
            mock_instance.ends_with_radial_ori.return_value = True
            mock_instance.ends_with_nonradial_ori.return_value = False

            key = placement_key_service.generate_placement_key(
                arrow_data, pictograph_data, default_placements
            )

            # Should generate key with dash suffix
            assert "_dash" in key
            assert key == "pro_to_layer1_alpha_W_dash"
