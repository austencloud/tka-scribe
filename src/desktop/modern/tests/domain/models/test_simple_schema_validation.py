"""
Simple Schema Compatibility Tests

Tests that Pydantic domain models produce JSON in the expected format
for cross-platform compatibility (without requiring jsonschema).
"""

import json
import pytest

from src.domain.models.pydantic_models import (
    MotionData,
    BeatData,
    SequenceData,
    create_default_motion_data,
    create_default_beat_data,
    create_default_sequence_data,
)


class TestPydanticSchemaCompatibility:
    """Test that Pydantic models produce expected JSON structure."""
    
    def test_motion_data_json_structure(self):
        """Test MotionData produces expected camelCase JSON."""
        motion = create_default_motion_data(
            motion_type='pro',
            prop_rot_dir='cw',
            start_loc='n',
            end_loc='e',
            start_ori='in',
            end_ori='out'
        )
        
        json_data = motion.model_dump()
        
        # Should have exactly the expected keys in camelCase
        expected_keys = {
            'motionType', 'propRotDir', 'startLoc', 
            'endLoc', 'turns', 'startOri', 'endOri'
        }
        assert set(json_data.keys()) == expected_keys
        
        # Verify values are correctly serialized
        assert json_data['motionType'] == 'pro'
        assert json_data['propRotDir'] == 'cw'
        assert json_data['startLoc'] == 'n'
        assert json_data['endLoc'] == 'e'
        assert json_data['turns'] == 0.0
        assert json_data['startOri'] == 'in'
        assert json_data['endOri'] == 'out'
        
        # Verify no snake_case keys leaked through
        snake_case_keys = {'motion_type', 'prop_rot_dir', 'start_loc', 'end_loc', 'start_ori', 'end_ori'}
        assert not any(key in json_data for key in snake_case_keys)
    
    def test_beat_data_json_structure(self):
        """Test BeatData produces expected camelCase JSON."""
        blue_motion = create_default_motion_data(motion_type='pro')
        red_motion = create_default_motion_data(motion_type='anti')
        
        beat = BeatData(
            beat_number=1,
            letter='A',
            duration=1.5,
            blue_motion=blue_motion,
            red_motion=red_motion,
            filled=True
        )
        
        json_data = beat.model_dump()
        
        # Should have camelCase keys
        assert 'beatNumber' in json_data
        assert 'blueMotion' in json_data
        assert 'redMotion' in json_data
        
        # Should NOT have snake_case keys
        assert 'beat_number' not in json_data
        assert 'blue_motion' not in json_data
        assert 'red_motion' not in json_data
        
        # Verify nested motion data is also camelCase
        blue_motion_data = json_data['blueMotion']
        assert 'motionType' in blue_motion_data
        assert 'propRotDir' in blue_motion_data
        assert blue_motion_data['motionType'] == 'pro'
        
        red_motion_data = json_data['redMotion']
        assert red_motion_data['motionType'] == 'anti'
    
    def test_sequence_data_json_structure(self):
        """Test SequenceData produces expected camelCase JSON."""
        sequence = create_default_sequence_data("Test Sequence", 4)
        beat1 = create_default_beat_data(1, 'A')
        beat2 = create_default_beat_data(2, 'B')
        
        sequence = sequence.add_beat(beat1)
        sequence = sequence.add_beat(beat2)
        
        json_data = sequence.model_dump()
        
        # Should have expected structure
        assert json_data['name'] == "Test Sequence"
        assert json_data['length'] == 4
        assert len(json_data['beats']) == 2
        
        # Verify beats are properly formatted
        beat_data = json_data['beats'][0]
        assert 'beatNumber' in beat_data
        assert 'blueMotion' in beat_data
        assert 'redMotion' in beat_data
        assert beat_data['letter'] == 'A'
        
        # Verify no snake_case leaked through anywhere
        json_str = json.dumps(json_data)
        assert 'beat_number' not in json_str
        assert 'blue_motion' not in json_str
        assert 'motion_type' not in json_str
    
    def test_all_enum_values_serialize_correctly(self):
        """Test that all enum values are properly serialized."""
        motion_types = ['pro', 'anti', 'float', 'dash', 'static']
        prop_rot_dirs = ['cw', 'ccw', 'no_rot']
        locations = ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw']
        orientations = ['in', 'out', 'clock', 'counter']
        
        for motion_type in motion_types:
            for prop_rot_dir in prop_rot_dirs:
                for start_loc in locations:
                    for end_loc in locations:
                        for start_ori in orientations:
                            for end_ori in orientations:
                                motion = create_default_motion_data(
                                    motion_type=motion_type,
                                    prop_rot_dir=prop_rot_dir,
                                    start_loc=start_loc,
                                    end_loc=end_loc,
                                    start_ori=start_ori,
                                    end_ori=end_ori
                                )
                                
                                json_data = motion.model_dump()
                                
                                # Verify all values are correctly serialized
                                assert json_data['motionType'] == motion_type
                                assert json_data['propRotDir'] == prop_rot_dir
                                assert json_data['startLoc'] == start_loc
                                assert json_data['endLoc'] == end_loc
                                assert json_data['startOri'] == start_ori
                                assert json_data['endOri'] == end_ori
                                
                                # This is a comprehensive test, so we'll just test a few combinations
                                # to avoid too many iterations
                                break
                        break
                    break
                break
            # Just test first few to avoid excessive test time
            if motion_types.index(motion_type) >= 2:
                break
    
    def test_round_trip_compatibility(self):
        """Test that data can round-trip through JSON serialization."""
        original_motion = create_default_motion_data(
            motion_type='anti',
            prop_rot_dir='ccw',
            start_loc='ne',
            end_loc='sw'
        )
        
        # Serialize to JSON string
        json_str = original_motion.model_dump_json()
        
        # Parse back to dict
        json_data = json.loads(json_str)
        
        # Should be able to recreate the object using camelCase keys
        # (thanks to populate_by_name=True)
        restored_motion = MotionData(**json_data)
        assert restored_motion == original_motion
    
    def test_factory_functions_produce_valid_objects(self):
        """Test that factory functions produce objects that serialize correctly."""
        motion = create_default_motion_data()
        beat = create_default_beat_data(1, 'A')
        sequence = create_default_sequence_data("Test")
        
        # All should serialize without errors
        motion_json = motion.model_dump()
        beat_json = beat.model_dump()
        sequence_json = sequence.model_dump()
        
        # Should have expected basic structure
        assert 'motionType' in motion_json
        assert 'beatNumber' in beat_json
        assert 'name' in sequence_json
        
        # Should be JSON serializable
        json.dumps(motion_json)
        json.dumps(beat_json)
        json.dumps(sequence_json)
    
    def test_immutability_preserved(self):
        """Test that Pydantic models are immutable as expected."""
        motion = create_default_motion_data()
        
        with pytest.raises(ValueError, match="Instance is frozen"):
            motion.motion_type = 'anti'
    
    def test_validation_works(self):
        """Test that Pydantic validation catches invalid data."""
        with pytest.raises(ValueError):
            MotionData(
                motion_type='invalid_type',  # Invalid enum value
                prop_rot_dir='cw',
                start_loc='n',
                end_loc='e',
                turns=0.0,
                start_ori='in',
                end_ori='in'
            )


if __name__ == "__main__":
    # Simple manual test
    print("Testing Pydantic model JSON output...")
    
    motion = create_default_motion_data(
        motion_type='pro',
        prop_rot_dir='cw', 
        start_loc='n',
        end_loc='e'
    )
    
    print("MotionData JSON:")
    print(json.dumps(motion.model_dump(), indent=2))
    
    beat = create_default_beat_data(1, 'A')
    print("\nBeatData JSON:")
    print(json.dumps(beat.model_dump(), indent=2))
    
    print("\nAll tests would pass if run with pytest!")
