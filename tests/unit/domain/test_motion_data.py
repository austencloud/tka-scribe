"""
Test Motion Data Domain Model

Tests the MotionData domain model for immutability, serialization, and validation.
"""

import pytest
import json
from dataclasses import FrozenInstanceError

from desktop.modern.domain.models.motion_data import MotionData
from desktop.modern.domain.models.enums import (
    MotionType,
    RotationDirection, 
    Location,
    Orientation
)


class TestMotionDataCreation:
    """Test MotionData creation and validation."""

    def test_create_basic_motion_data(self):
        """Test creating basic motion data."""
        motion = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH
        )
        
        assert motion.motion_type == MotionType.PRO
        assert motion.prop_rot_dir == RotationDirection.CLOCKWISE
        assert motion.start_loc == Location.NORTH
        assert motion.end_loc == Location.SOUTH
        assert motion.turns == 0.0  # Default
        assert motion.start_ori == Orientation.IN  # Default
        assert motion.end_ori == Orientation.IN  # Default
        assert motion.is_visible is True  # Default

    def test_create_motion_data_with_all_parameters(self):
        """Test creating motion data with all parameters."""
        motion = MotionData(
            motion_type=MotionType.ANTI,
            prop_rot_dir=RotationDirection.COUNTER_CLOCKWISE,
            start_loc=Location.EAST,
            end_loc=Location.WEST,
            turns=1.5,
            start_ori=Orientation.OUT,
            end_ori=Orientation.IN,
            is_visible=False,
            prefloat_motion_type=MotionType.FLOAT,
            prefloat_prop_rot_dir=RotationDirection.NO_ROTATION
        )
        
        assert motion.motion_type == MotionType.ANTI
        assert motion.prop_rot_dir == RotationDirection.COUNTER_CLOCKWISE
        assert motion.start_loc == Location.EAST
        assert motion.end_loc == Location.WEST
        assert motion.turns == 1.5
        assert motion.start_ori == Orientation.OUT
        assert motion.end_ori == Orientation.IN
        assert motion.is_visible is False
        assert motion.prefloat_motion_type == MotionType.FLOAT
        assert motion.prefloat_prop_rot_dir == RotationDirection.NO_ROTATION

    def test_motion_data_immutability(self):
        """Test that MotionData is immutable."""
        motion = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH
        )
        
        # Should not be able to modify fields
        with pytest.raises(FrozenInstanceError):
            motion.motion_type = MotionType.ANTI
        
        with pytest.raises(FrozenInstanceError):
            motion.turns = 2.0

    def test_float_turns_handling(self):
        """Test handling of float turns."""
        motion = MotionData(
            motion_type=MotionType.FLOAT,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            turns="fl"  # Float turns
        )
        
        assert motion.turns == "fl"
        assert motion.motion_type == MotionType.FLOAT

    def test_all_motion_types(self):
        """Test all motion types can be used."""
        for motion_type in MotionType:
            motion = MotionData(
                motion_type=motion_type,
                prop_rot_dir=RotationDirection.CLOCKWISE,
                start_loc=Location.NORTH,
                end_loc=Location.SOUTH
            )
            assert motion.motion_type == motion_type

    def test_all_rotation_directions(self):
        """Test all rotation directions can be used."""
        for rot_dir in RotationDirection:
            motion = MotionData(
                motion_type=MotionType.PRO,
                prop_rot_dir=rot_dir,
                start_loc=Location.NORTH,
                end_loc=Location.SOUTH
            )
            assert motion.prop_rot_dir == rot_dir

    def test_all_locations(self):
        """Test all locations can be used."""
        for location in Location:
            motion = MotionData(
                motion_type=MotionType.PRO,
                prop_rot_dir=RotationDirection.CLOCKWISE,
                start_loc=location,
                end_loc=location
            )
            assert motion.start_loc == location
            assert motion.end_loc == location

    def test_all_orientations(self):
        """Test all orientations can be used."""
        for orientation in Orientation:
            motion = MotionData(
                motion_type=MotionType.PRO,
                prop_rot_dir=RotationDirection.CLOCKWISE,
                start_loc=Location.NORTH,
                end_loc=Location.SOUTH,
                start_ori=orientation,
                end_ori=orientation
            )
            assert motion.start_ori == orientation
            assert motion.end_ori == orientation


class TestMotionDataProperties:
    """Test MotionData properties and methods."""

    def test_is_float_property(self):
        """Test is_float property."""
        float_motion = MotionData(
            motion_type=MotionType.FLOAT,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH
        )
        
        pro_motion = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH
        )
        
        assert float_motion.is_float is True
        assert pro_motion.is_float is False

    def test_is_static_property(self):
        """Test is_static property."""
        static_motion = MotionData(
            motion_type=MotionType.STATIC,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            start_loc=Location.NORTH,
            end_loc=Location.NORTH
        )
        
        pro_motion = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH
        )
        
        assert static_motion.is_static is True
        assert pro_motion.is_static is False


class TestMotionDataSerialization:
    """Test MotionData serialization and deserialization."""

    def test_to_dict(self):
        """Test converting MotionData to dictionary."""
        motion = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            turns=1.5,
            start_ori=Orientation.IN,
            end_ori=Orientation.OUT
        )
        
        data_dict = motion.to_dict()
        
        assert data_dict["motion_type"] == "pro"
        assert data_dict["prop_rot_dir"] == "cw"
        assert data_dict["start_loc"] == "n"
        assert data_dict["end_loc"] == "s"
        assert data_dict["turns"] == 1.5
        assert data_dict["start_ori"] == "in"
        assert data_dict["end_ori"] == "out"

    def test_from_dict(self):
        """Test creating MotionData from dictionary."""
        data_dict = {
            "motion_type": "anti",
            "prop_rot_dir": "ccw",
            "start_loc": "e",
            "end_loc": "w",
            "turns": 2.0,
            "start_ori": "out",
            "end_ori": "in",
            "is_visible": False
        }
        
        motion = MotionData.from_dict(data_dict)
        
        assert motion.motion_type == MotionType.ANTI
        assert motion.prop_rot_dir == RotationDirection.COUNTER_CLOCKWISE
        assert motion.start_loc == Location.EAST
        assert motion.end_loc == Location.WEST
        assert motion.turns == 2.0
        assert motion.start_ori == Orientation.OUT
        assert motion.end_ori == Orientation.IN
        assert motion.is_visible is False

    def test_serialization_roundtrip(self):
        """Test that serialization roundtrip preserves data."""
        original = MotionData(
            motion_type=MotionType.DASH,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            start_loc=Location.SOUTHWEST,
            end_loc=Location.NORTHEAST,
            turns="fl",
            start_ori=Orientation.OUT,
            end_ori=Orientation.IN,
            is_visible=False,
            prefloat_motion_type=MotionType.PRO,
            prefloat_prop_rot_dir=RotationDirection.CLOCKWISE
        )
        
        # Convert to dict and back
        data_dict = original.to_dict()
        restored = MotionData.from_dict(data_dict)
        
        assert restored.motion_type == original.motion_type
        assert restored.prop_rot_dir == original.prop_rot_dir
        assert restored.start_loc == original.start_loc
        assert restored.end_loc == original.end_loc
        assert restored.turns == original.turns
        assert restored.start_ori == original.start_ori
        assert restored.end_ori == original.end_ori
        assert restored.is_visible == original.is_visible
        assert restored.prefloat_motion_type == original.prefloat_motion_type
        assert restored.prefloat_prop_rot_dir == original.prefloat_prop_rot_dir

    def test_json_serialization(self):
        """Test JSON serialization."""
        motion = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH
        )
        
        # Convert to JSON and back
        json_str = json.dumps(motion.to_dict())
        data_dict = json.loads(json_str)
        restored = MotionData.from_dict(data_dict)
        
        assert restored.motion_type == motion.motion_type
        assert restored.prop_rot_dir == motion.prop_rot_dir
        assert restored.start_loc == motion.start_loc
        assert restored.end_loc == motion.end_loc


class TestMotionDataValidation:
    """Test MotionData validation and error handling."""

    def test_invalid_motion_type_conversion(self):
        """Test handling of invalid motion type."""
        # The _convert_motion_type method should handle invalid values gracefully
        data_dict = {
            "motion_type": "invalid_type",
            "prop_rot_dir": "cw",
            "start_loc": "n",
            "end_loc": "s"
        }
        
        motion = MotionData.from_dict(data_dict)
        # Should default to STATIC for invalid motion type
        assert motion.motion_type == MotionType.STATIC

    def test_missing_optional_fields(self):
        """Test handling of missing optional fields."""
        minimal_dict = {
            "motion_type": "pro",
            "prop_rot_dir": "cw",
            "start_loc": "n",
            "end_loc": "s"
        }
        
        motion = MotionData.from_dict(minimal_dict)
        
        # Should use defaults for missing fields
        assert motion.turns == 0.0
        assert motion.start_ori == Orientation.IN
        assert motion.end_ori == Orientation.IN
        assert motion.is_visible is True
        assert motion.prefloat_motion_type is None
        assert motion.prefloat_prop_rot_dir is None

    def test_string_turns_handling(self):
        """Test handling of string turns (for float motions)."""
        data_dict = {
            "motion_type": "float",
            "prop_rot_dir": "no_rot",
            "start_loc": "n",
            "end_loc": "s",
            "turns": "fl"
        }
        
        motion = MotionData.from_dict(data_dict)
        assert motion.turns == "fl"
        assert motion.motion_type == MotionType.FLOAT


class TestMotionDataEquality:
    """Test MotionData equality and hashing."""

    def test_equality(self):
        """Test that identical MotionData instances are equal."""
        motion1 = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH
        )
        
        motion2 = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH
        )
        
        assert motion1 == motion2

    def test_inequality(self):
        """Test that different MotionData instances are not equal."""
        motion1 = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH
        )
        
        motion2 = MotionData(
            motion_type=MotionType.ANTI,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH
        )
        
        assert motion1 != motion2

    def test_hashability(self):
        """Test that MotionData instances are hashable."""
        motion = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH
        )
        
        # Should be able to use as dict key or in set
        motion_set = {motion}
        motion_dict = {motion: "test"}
        
        assert len(motion_set) == 1
        assert motion_dict[motion] == "test"
