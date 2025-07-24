"""
Sequence Generator - Generation Algorithms

Handles all sequence generation algorithms extracted from the monolithic
sequence management service. Focuses solely on creating new sequences
using various algorithms.
"""

import logging
from enum import Enum
from typing import Any, Dict

from core.interfaces.sequence_data_services import ISequenceGenerator
from domain.models.beat_data import BeatData
from domain.models.sequence_data import SequenceData

logger = logging.getLogger(__name__)


class SequenceType(Enum):
    """Types of sequence generation algorithms."""

    FREEFORM = "freeform"
    CIRCULAR = "circular"
    AUTO_COMPLETE = "auto_complete"
    MIRROR = "mirror"
    CONTINUOUS = "continuous"


class SequenceGenerator(ISequenceGenerator):
    """
    Pure service for generating sequences using various algorithms.

    Responsibilities:
    - Freeform sequence generation
    - Circular sequence generation
    - Auto-complete sequence generation
    - Mirror sequence generation
    - Continuous sequence generation
    """

    def __init__(self):
        """Initialize the sequence generator."""
        pass

    def generate_sequence(
        self, sequence_type: SequenceType, name: str, length: int = 16, **kwargs
    ) -> SequenceData:
        """Generate a sequence using the specified algorithm."""
        if sequence_type == SequenceType.FREEFORM:
            return self._generate_freeform_sequence(name, length, **kwargs)
        elif sequence_type == SequenceType.CIRCULAR:
            return self._generate_circular_sequence(name, length, **kwargs)
        elif sequence_type == SequenceType.AUTO_COMPLETE:
            return self._generate_auto_complete_sequence(name, length, **kwargs)
        elif sequence_type == SequenceType.MIRROR:
            return self._generate_mirror_sequence(name, length, **kwargs)
        elif sequence_type == SequenceType.CONTINUOUS:
            return self._generate_continuous_sequence(name, length, **kwargs)
        else:
            raise ValueError(f"Unknown sequence type: {sequence_type}")

    def _generate_freeform_sequence(
        self, name: str, length: int, **kwargs
    ) -> SequenceData:
        """Generate freeform sequence using legacy algorithm."""
        try:
            # Extract parameters from kwargs
            level = kwargs.get("level", 1)
            turn_intensity = kwargs.get("turn_intensity", 1)
            prop_continuity = kwargs.get("prop_continuity", "continuous")
            letter_types = kwargs.get("letter_types", [])

            print(
                f"🤖 Generating freeform sequence: length={length}, level={level}, intensity={turn_intensity}"
            )

            # Import required classes
            from application.services.generation.freeform_generation_service import (
                RotationDeterminer,
            )
            from application.services.generation.turn_intensity_manager import (
                TurnIntensityManagerFactory,
            )

            # Get rotation directions
            blue_rot_dir, red_rot_dir = RotationDeterminer.get_rotation_dirs(
                prop_continuity
            )

            # Allocate turns for blue and red
            turns_blue, turns_red = (
                TurnIntensityManagerFactory.allocate_turns_for_blue_and_red(
                    length, level, turn_intensity
                )
            )

            # Generate beats with real pictograph data
            beats = []
            sequence_so_far = []  # Track sequence for option generation

            # Create initial start position beat
            start_beat = self._create_start_position_beat()
            sequence_so_far.append(start_beat)

            for i in range(length):
                # Generate next pictograph using real data
                next_pictograph_data = self._generate_next_pictograph(
                    sequence_so_far,
                    level,
                    turns_blue[i] if i < len(turns_blue) else 0,
                    turns_red[i] if i < len(turns_red) else 0,
                    prop_continuity,
                    blue_rot_dir,
                    red_rot_dir,
                    letter_types,
                )

                if next_pictograph_data:
                    # Create beat with real pictograph data
                    beat = BeatData(
                        beat_number=i + 1,
                        pictograph_data=next_pictograph_data,
                        metadata={
                            "turn_blue": turns_blue[i] if i < len(turns_blue) else 0,
                            "turn_red": turns_red[i] if i < len(turns_red) else 0,
                            "blue_rot_dir": blue_rot_dir,
                            "red_rot_dir": red_rot_dir,
                            "prop_continuity": prop_continuity,
                        },
                    )
                    beats.append(beat)

                    # Add to sequence for next iteration
                    sequence_so_far.append(
                        self._convert_pictograph_to_legacy_dict(
                            next_pictograph_data, i + 1
                        )
                    )
                else:
                    # Fallback to placeholder if generation fails
                    beat = BeatData(
                        beat_number=i + 1,
                        metadata={
                            "letter": f"L{i+1}",  # Placeholder letter
                            "turn_blue": turns_blue[i] if i < len(turns_blue) else 0,
                            "turn_red": turns_red[i] if i < len(turns_red) else 0,
                            "blue_rot_dir": blue_rot_dir,
                            "red_rot_dir": red_rot_dir,
                            "prop_continuity": prop_continuity,
                        },
                    )
                    beats.append(beat)

            sequence = SequenceData(name=name, beats=beats)
            print(f"✅ Generated freeform sequence with {len(beats)} beats")
            return sequence

        except Exception as e:
            logger.error(f"Failed to generate freeform sequence: {e}")
            # Return empty sequence as fallback
            return SequenceData(name=name, beats=[])

    def _generate_circular_sequence(
        self, name: str, length: int, **kwargs
    ) -> SequenceData:
        """Generate circular sequence using legacy algorithm."""
        try:
            # Extract parameters from kwargs
            level = kwargs.get("level", 1)
            turn_intensity = kwargs.get("turn_intensity", 1)
            prop_continuity = kwargs.get("prop_continuity", "continuous")
            cap_type = kwargs.get("cap_type", "strict_rotated")

            print(
                f"🤖 Generating circular sequence: length={length}, level={level}, CAP={cap_type}"
            )

            # Import required classes
            from application.services.generation.freeform_generation_service import (
                RotationDeterminer,
            )
            from application.services.generation.turn_intensity_manager import (
                TurnIntensityManagerFactory,
            )

            # Get rotation directions
            blue_rot_dir, red_rot_dir = RotationDeterminer.get_rotation_dirs(
                prop_continuity
            )

            # Allocate turns for blue and red
            turns_blue, turns_red = (
                TurnIntensityManagerFactory.allocate_turns_for_blue_and_red(
                    length, level, turn_intensity
                )
            )

            # Generate beats
            beats = []
            for i in range(length):
                # For now, create simple beats with basic data
                # TODO: Implement full circular generation with CAP transformations
                beat = BeatData(
                    beat_number=i + 1,
                    metadata={
                        "letter": f"C{i+1}",  # Placeholder letter
                        "turn_blue": turns_blue[i] if i < len(turns_blue) else 0,
                        "turn_red": turns_red[i] if i < len(turns_red) else 0,
                        "blue_rot_dir": blue_rot_dir,
                        "red_rot_dir": red_rot_dir,
                        "prop_continuity": prop_continuity,
                        "cap_type": cap_type,
                    },
                )
                beats.append(beat)

            sequence = SequenceData(name=name, beats=beats)
            print(f"✅ Generated circular sequence with {len(beats)} beats")
            return sequence

        except Exception as e:
            logger.error(f"Failed to generate circular sequence: {e}")
            # Return empty sequence as fallback
            return SequenceData(name=name, beats=[])

    def _create_start_position_beat(self) -> dict:
        """Create a start position beat for sequence generation."""
        # Default start position - this could be made configurable
        return {
            "letter": "",
            "start_pos": "alpha1",
            "end_pos": "alpha1",
            "blue_attributes": {
                "start_ori": "in",
                "end_ori": "in",
                "motion_type": "static",
                "start_loc": "n",
                "end_loc": "n",
                "prop_rot_dir": "cw",
                "turns": 0,
            },
            "red_attributes": {
                "start_ori": "in",
                "end_ori": "in",
                "motion_type": "static",
                "start_loc": "s",
                "end_loc": "s",
                "prop_rot_dir": "cw",
                "turns": 0,
            },
            "is_placeholder": False,
            "beat_number": 0,
        }

    def _generate_next_pictograph(
        self,
        sequence_so_far: list,
        level: int,
        turn_blue: float,
        turn_red: float,
        prop_continuity: str,
        blue_rot_dir: str,
        red_rot_dir: str,
        letter_types: list,
    ):
        """Generate next pictograph using real data from the dataset."""
        try:
            # Get available options from the dataset
            options = self._get_option_pictographs(sequence_so_far)

            if not options:
                print(f"⚠️ No options available for sequence generation")
                return None

            # Filter options by letter type if specified
            if letter_types:
                options = self._filter_options_by_letter_type(options, letter_types)

            # Filter by rotation if continuous
            if prop_continuity == "continuous":
                options = self._filter_options_by_rotation(
                    options, blue_rot_dir, red_rot_dir
                )

            if not options:
                print(f"⚠️ No options available after filtering")
                return None

            # Randomly select an option
            import random

            selected_option = random.choice(options)

            # Apply turns if level 2 or 3
            if level in [2, 3]:
                selected_option = self._apply_turns_to_pictograph(
                    selected_option, turn_blue, turn_red
                )

            print(f"✅ Generated pictograph with letter: {selected_option.letter}")
            return selected_option

        except Exception as e:
            logger.error(f"Failed to generate next pictograph: {e}")
            import traceback

            traceback.print_exc()
            return None

    def _get_option_pictographs(self, sequence_so_far: list):
        """Get available pictograph options from the dataset."""
        try:
            # Try to get the dataset query service from DI container
            dataset_service = None
            try:
                from core.dependency_injection.di_container import get_container
                from core.interfaces.data_services import IDatasetQuery

                container = get_container()
                dataset_service = container.resolve(IDatasetQuery)
            except Exception as e:
                print(f"⚠️ Could not resolve dataset service from DI: {e}")

            # Fallback: create mock pictographs for testing
            if not dataset_service:
                return self._create_mock_pictographs_for_generation(sequence_so_far)

            # Get the last beat's end position
            if not sequence_so_far:
                return []

            last_beat = sequence_so_far[-1]
            end_position = last_beat.get("end_pos", "alpha1")

            # Find all pictographs that start from this position
            options = []

            # Get all letters and find pictographs for each
            letters = [
                "A",
                "B",
                "C",
                "D",
                "E",
                "F",
                "G",
                "H",
                "I",
                "J",
                "K",
                "L",
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
                "W",
                "X",
                "Y",
                "Z",
            ]

            for letter in letters:
                try:
                    pictographs = dataset_service.find_pictographs_by_letter(letter)
                    for beat_data in pictographs:
                        if (
                            beat_data.pictograph_data
                            and beat_data.pictograph_data.start_position == end_position
                        ):
                            options.append(beat_data.pictograph_data)
                except Exception as e:
                    continue

            print(
                f"📊 Found {len(options)} pictograph options for position {end_position}"
            )
            return options

        except Exception as e:
            logger.error(f"Error getting option pictographs: {e}")
            return self._create_mock_pictographs_for_generation(sequence_so_far)

    def _create_mock_pictographs_for_generation(self, sequence_so_far: list):
        """Create mock pictographs for generation when real data is not available."""
        try:
            import random

            from domain.models.grid_data import GridData
            from domain.models.motion_data import MotionData
            from domain.models.pictograph_data import PictographData

            # Get the last beat's end position
            if not sequence_so_far:
                end_position = "alpha1"
            else:
                last_beat = sequence_so_far[-1]
                end_position = last_beat.get("end_pos", "alpha1")

            # Create a few mock pictographs with different letters
            mock_pictographs = []
            letters = ["A", "B", "C", "D", "E", "F", "G", "H"]

            for i, letter in enumerate(letters[:3]):  # Create 3 options
                # Create mock motion data
                blue_motion = MotionData(
                    motion_type="pro",
                    start_loc="n",
                    end_loc="s",
                    start_ori="in",
                    end_ori="out",
                    prop_rot_dir="cw",
                    turns=0,
                )

                red_motion = MotionData(
                    motion_type="anti",
                    start_loc="s",
                    end_loc="n",
                    start_ori="out",
                    end_ori="in",
                    prop_rot_dir="ccw",
                    turns=0,
                )

                # Create mock pictograph
                mock_pictograph = PictographData(
                    letter=letter,
                    start_position=end_position,
                    end_position=random.choice(["alpha1", "alpha2", "beta1", "beta2"]),
                    grid_data=GridData(),
                    motions={"blue": blue_motion, "red": red_motion},
                    arrows={},
                    props={},
                    metadata={"mock": True, "index": i},
                )
                mock_pictographs.append(mock_pictograph)

            print(f"🎭 Created {len(mock_pictographs)} mock pictographs for generation")
            return mock_pictographs

        except Exception as e:
            logger.error(f"Error creating mock pictographs: {e}")
            return []

    def _filter_options_by_letter_type(self, options, letter_types):
        """Filter options by letter type."""
        if not letter_types:
            return options

        # Convert letter types to actual letters
        valid_letters = set()
        for letter_type in letter_types:
            if hasattr(letter_type, "value"):
                letter_type = letter_type.value
            valid_letters.update(self._get_letters_for_type(letter_type))

        filtered = [opt for opt in options if opt.letter in valid_letters]
        print(f"🔍 Filtered by letter type: {len(options)} → {len(filtered)} options")
        return filtered

    def _filter_options_by_rotation(self, options, blue_rot_dir, red_rot_dir):
        """Filter options by rotation direction."""
        # For now, return all options - rotation filtering can be implemented later
        print(f"🔄 Rotation filtering: {len(options)} options (not filtered yet)")
        return options

    def _apply_turns_to_pictograph(self, pictograph_data, turn_blue, turn_red):
        """Apply turns to the pictograph data."""
        try:
            # Create new motion data with updated turns (since dataclasses are immutable)
            from domain.models.motion_data import MotionData
            from domain.models.pictograph_data import PictographData

            updated_motions = {}

            # Update blue motion with turns
            if "blue" in pictograph_data.motions:
                blue_motion = pictograph_data.motions["blue"]
                updated_blue_motion = MotionData(
                    motion_type=blue_motion.motion_type,
                    prop_rot_dir=blue_motion.prop_rot_dir,
                    start_loc=blue_motion.start_loc,
                    end_loc=blue_motion.end_loc,
                    turns=turn_blue,
                    start_ori=blue_motion.start_ori,
                    end_ori=blue_motion.end_ori,
                    is_visible=blue_motion.is_visible,
                )
                updated_motions["blue"] = updated_blue_motion

            # Update red motion with turns
            if "red" in pictograph_data.motions:
                red_motion = pictograph_data.motions["red"]
                updated_red_motion = MotionData(
                    motion_type=red_motion.motion_type,
                    prop_rot_dir=red_motion.prop_rot_dir,
                    start_loc=red_motion.start_loc,
                    end_loc=red_motion.end_loc,
                    turns=turn_red,
                    start_ori=red_motion.start_ori,
                    end_ori=red_motion.end_ori,
                    is_visible=red_motion.is_visible,
                )
                updated_motions["red"] = updated_red_motion

            # Create new pictograph data with updated motions
            updated_pictograph = PictographData(
                id=pictograph_data.id,
                grid_data=pictograph_data.grid_data,
                arrows=pictograph_data.arrows,
                props=pictograph_data.props,
                motions=updated_motions,
                letter=pictograph_data.letter,
                start_position=pictograph_data.start_position,
                end_position=pictograph_data.end_position,
                glyph_data=pictograph_data.glyph_data,
                is_blank=pictograph_data.is_blank,
                is_mirrored=pictograph_data.is_mirrored,
                metadata=pictograph_data.metadata,
            )

            return updated_pictograph

        except Exception as e:
            logger.error(f"Error applying turns to pictograph: {e}")
            return pictograph_data

    def _get_letters_for_type(self, letter_type: str):
        """Get letters for a specific letter type."""
        letter_mappings = {
            "Type1": [
                "A",
                "B",
                "C",
                "D",
                "E",
                "F",
                "G",
                "H",
                "I",
                "J",
                "K",
                "L",
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
            ],
            "Type2": ["W", "X", "Y", "Z", "Σ", "Δ", "θ", "Ω"],
            "Type3": ["W-", "X-", "Y-", "Z-", "Σ-", "Δ-", "θ-", "Ω-"],
            "Type4": ["Φ", "Ψ", "Λ"],
            "Type5": ["Φ-", "Ψ-", "Λ-"],
            "Type6": ["α", "β", "Γ"],
        }
        return letter_mappings.get(letter_type, [])

    def _convert_pictograph_to_legacy_dict(self, pictograph_data, beat_number):
        """Convert PictographData to legacy dictionary format for sequence tracking."""
        return {
            "letter": pictograph_data.letter or "",
            "start_pos": pictograph_data.start_position or "",
            "end_pos": pictograph_data.end_position or "",
            "beat_number": beat_number,
            "blue_attributes": {
                "start_ori": "in",
                "end_ori": "in",
                "motion_type": "static",
                "start_loc": "n",
                "end_loc": "n",
                "prop_rot_dir": "cw",
                "turns": 0,
            },
            "red_attributes": {
                "start_ori": "in",
                "end_ori": "in",
                "motion_type": "static",
                "start_loc": "s",
                "end_loc": "s",
                "prop_rot_dir": "cw",
                "turns": 0,
            },
            "is_placeholder": False,
        }

    def _generate_auto_complete_sequence(
        self, name: str, length: int, **kwargs
    ) -> SequenceData:
        """Generate auto-completed sequence based on pattern recognition."""
        beats = []
        for i in range(length):
            beat = BeatData(beat_number=i + 1, letter="")
            beats.append(beat)

        return SequenceData(name=name, beats=beats)

    def _generate_mirror_sequence(
        self, name: str, length: int, **kwargs
    ) -> SequenceData:
        """Generate mirror sequence (palindromic pattern)."""
        beats = []
        for i in range(length):
            beat = BeatData(beat_number=i + 1, letter="")
            beats.append(beat)

        return SequenceData(name=name, beats=beats)

    def _generate_continuous_sequence(
        self, name: str, length: int, **kwargs
    ) -> SequenceData:
        """Generate continuous sequence where each beat flows into the next."""
        beats = []
        for i in range(length):
            beat = BeatData(beat_number=i + 1, letter="")
            beats.append(beat)

        return SequenceData(name=name, beats=beats)
