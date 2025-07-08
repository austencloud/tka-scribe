"""
CRITICAL: Essential Domain Models - IMPLEMENT THESE THIRD

These are the core business models that replace the current tightly-coupled classes.
Start with these simplified but complete models.

REPLACES:
- Pictograph class (base_widgets.pictograph.pictograph.Pictograph)
- Beat class (sequence_beat_frame.beat.Beat)
- Complex inheritance hierarchies with UI dependencies

ELIMINATES:
- UI coupling in business models
- Mutable state causing bugs
- Complex inheritance chains
- PyQt dependencies in business logic
"""

import json
import uuid
from dataclasses import dataclass, field, fields, is_dataclass
from enum import Enum
from typing import Any, Dict, List, Optional, Union


def _process_field_value(value: Any, field_type: Any) -> Any:
    """Process field value based on type for deserialization."""
    # Handle Optional types
    if hasattr(field_type, "__origin__") and field_type.__origin__ is Union:
        args = field_type.__args__
        if len(args) == 2 and type(None) in args:
            actual_type = args[0] if args[1] is type(None) else args[1]
            if value is None:
                return None
            return _process_field_value(value, actual_type)

    # Handle dataclasses
    if is_dataclass(field_type) and isinstance(value, dict):
        return field_type.from_dict(value)

    # Handle enums
    if isinstance(field_type, type) and issubclass(field_type, Enum):
        return field_type(value)

    # Handle lists
    if hasattr(field_type, "__origin__") and field_type.__origin__ is list:
        if isinstance(value, list):
            list_type = field_type.__args__[0]
            return [_process_field_value(item, list_type) for item in value]

    return value


class Timing(Enum):
    TOGETHER = "together"
    SPLIT = "split"


class Direction(Enum):
    SAME = "same"
    OPP = "opp"


class MotionType(Enum):
    """Types of motion for props and arrows."""

    PRO = "pro"
    ANTI = "anti"
    FLOAT = "float"
    DASH = "dash"
    STATIC = "static"


class HandMotionType(Enum):
    """Types of motion for props and arrows."""

    SHIFT = "shift"
    DASH = "dash"
    STATIC = "static"


class HandPath(Enum):
    """Hand rotation directions."""

    CLOCKWISE = "cw"
    COUNTER_CLOCKWISE = "ccw"
    DASH = "dash"
    STATIC = "static"


class RotationDirection(Enum):
    """Rotation directions."""

    CLOCKWISE = "cw"
    COUNTER_CLOCKWISE = "ccw"
    NO_ROTATION = "no_rot"


class Orientation(Enum):
    """Prop orientations."""

    IN = "in"
    OUT = "out"
    CLOCK = "clock"
    COUNTER = "counter"


class Location(Enum):
    """Location constants matching legacy exactly."""

    NORTH = "n"
    EAST = "e"
    SOUTH = "s"
    WEST = "w"
    NORTHEAST = "ne"
    SOUTHEAST = "se"
    SOUTHWEST = "sw"
    NORTHWEST = "nw"


class GridPosition(Enum):
    """Grid positions matching legacy constants exactly."""

    # Alpha positions (radial)
    ALPHA1 = "alpha1"
    ALPHA2 = "alpha2"
    ALPHA3 = "alpha3"
    ALPHA4 = "alpha4"
    ALPHA5 = "alpha5"
    ALPHA6 = "alpha6"
    ALPHA7 = "alpha7"
    ALPHA8 = "alpha8"

    # Beta positions (same direction)
    BETA1 = "beta1"
    BETA2 = "beta2"
    BETA3 = "beta3"
    BETA4 = "beta4"
    BETA5 = "beta5"
    BETA6 = "beta6"
    BETA7 = "beta7"
    BETA8 = "beta8"

    # Gamma positions (shift)
    GAMMA1 = "gamma1"
    GAMMA2 = "gamma2"
    GAMMA3 = "gamma3"
    GAMMA4 = "gamma4"
    GAMMA5 = "gamma5"
    GAMMA6 = "gamma6"
    GAMMA7 = "gamma7"
    GAMMA8 = "gamma8"
    GAMMA9 = "gamma9"
    GAMMA10 = "gamma10"
    GAMMA11 = "gamma11"
    GAMMA12 = "gamma12"
    GAMMA13 = "gamma13"
    GAMMA14 = "gamma14"
    GAMMA15 = "gamma15"
    GAMMA16 = "gamma16"


@dataclass(frozen=True)
class MotionData:
    """
    REPLACES: Complex motion attribute dictionaries

    Immutable motion data for props and arrows.
    Uses Orientation enum for type safety while maintaining JSON compatibility.
    """

    motion_type: MotionType
    prop_rot_dir: RotationDirection
    start_loc: Location
    end_loc: Location
    turns: float = 0.0

    # Orientation fields now use enum types
    start_ori: Orientation = Orientation.IN
    end_ori: Orientation = Orientation.IN

    def __post_init__(self):
        """Ensure orientation fields are converted to enums."""
        # Convert start_ori if it's not already an Orientation enum
        if not isinstance(self.start_ori, Orientation):
            object.__setattr__(
                self, "start_ori", self._convert_orientation(self.start_ori)
            )

        # Convert end_ori if it's not already an Orientation enum
        if not isinstance(self.end_ori, Orientation):
            object.__setattr__(self, "end_ori", self._convert_orientation(self.end_ori))

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "motion_type": self.motion_type.value,
            "prop_rot_dir": self.prop_rot_dir.value,
            "start_loc": self.start_loc.value,
            "end_loc": self.end_loc.value,
            "turns": self.turns,
            "start_ori": self.start_ori.value,  # Always Orientation enum after __post_init__
            "end_ori": self.end_ori.value,  # Always Orientation enum after __post_init__
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "MotionData":
        """Create from dictionary with backward compatibility."""
        return cls(
            motion_type=MotionType(data["motion_type"]),
            prop_rot_dir=RotationDirection(data["prop_rot_dir"]),
            start_loc=Location(data["start_loc"]),
            end_loc=Location(data["end_loc"]),
            turns=data.get("turns", 0.0),
            start_ori=cls._convert_orientation(data.get("start_ori", "in")),
            end_ori=cls._convert_orientation(data.get("end_ori", "in")),
        )

    @staticmethod
    def _convert_orientation(value) -> Orientation:
        """Convert orientation value to Orientation enum with backward compatibility."""
        if isinstance(value, Orientation):
            return value

        if isinstance(value, str):
            # Handle string values from JSON
            value_lower = value.lower().strip()
            orientation_map = {
                "in": Orientation.IN,
                "out": Orientation.OUT,
                "clock": Orientation.CLOCK,
                "counter": Orientation.COUNTER,
            }
            return orientation_map.get(value_lower, Orientation.IN)

        # Default fallback
        return Orientation.IN

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with snake_case keys."""
        from dataclasses import asdict

        return asdict(self)

    def to_camel_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with camelCase keys for JSON APIs."""
        from ..serialization import dataclass_to_camel_dict

        return dataclass_to_camel_dict(self)

    def to_json(self, camel_case: bool = True, **kwargs) -> str:
        """Serialize to JSON string."""
        from ..serialization import domain_model_to_json

        if camel_case:
            return domain_model_to_json(self, **kwargs)
        else:
            return json.dumps(self.to_dict(), **kwargs)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "MotionData":
        """Create instance from dictionary."""
        # Handle nested dataclasses and enums
        field_types = {f.name: f.type for f in fields(cls)}

        processed_data = {}
        for key, value in data.items():
            if key in field_types:
                field_type = field_types[key]
                processed_data[key] = _process_field_value(value, field_type)
            else:
                processed_data[key] = value

        return cls(**processed_data)

    @classmethod
    def from_json(cls, json_str: str, camel_case: bool = True) -> "MotionData":
        """Create instance from JSON string."""
        from ..serialization import domain_model_from_json

        if camel_case:
            return domain_model_from_json(json_str, cls)
        else:
            data = json.loads(json_str)
            return cls.from_dict(data)

    def update(self, **kwargs) -> "MotionData":
        """Create a new MotionData with updated fields."""
        from dataclasses import replace

        # Convert orientation fields if they're provided as strings
        if "start_ori" in kwargs:
            kwargs["start_ori"] = self._convert_orientation(kwargs["start_ori"])
        if "end_ori" in kwargs:
            kwargs["end_ori"] = self._convert_orientation(kwargs["end_ori"])

        return replace(self, **kwargs)


class VTGMode(Enum):
    """VTG (Vertical/Timing/Grid) modes for pictograph classification."""

    SPLIT_SAME = "SS"
    SPLIT_OPP = "SO"
    TOG_SAME = "TS"
    TOG_OPP = "TO"
    QUARTER_SAME = "QS"
    QUARTER_OPP = "QO"


class ElementalType(Enum):
    """Elemental types for pictograph classification."""

    WATER = "water"
    FIRE = "fire"
    EARTH = "earth"
    AIR = "air"
    SUN = "sun"
    MOON = "moon"


class LetterType(Enum):
    """Letter types for TKA glyph classification."""

    TYPE1 = "Type1"
    TYPE2 = "Type2"
    TYPE3 = "Type3"
    TYPE4 = "Type4"
    TYPE5 = "Type5"
    TYPE6 = "Type6"
    TYPE7 = "Type7"
    TYPE8 = "Type8"
    TYPE9 = "Type9"


@dataclass(frozen=True)
class GlyphData:
    """
    Data for pictograph glyphs (elemental, VTG, TKA, position).
    """

    # VTG glyph data
    vtg_mode: Optional[VTGMode] = None

    # Elemental glyph data
    elemental_type: Optional[ElementalType] = None

    # TKA glyph data
    letter_type: Optional[LetterType] = None
    has_dash: bool = False
    turns_data: Optional[str] = None  # Turns tuple string

    # Start-to-end position glyph data
    start_position: Optional[str] = None
    end_position: Optional[str] = None

    # Visibility flags
    show_elemental: bool = True
    show_vtg: bool = True
    show_tka: bool = True
    show_positions: bool = True

    def update(self, **kwargs) -> "GlyphData":
        """Create a new GlyphData with updated fields."""
        from dataclasses import replace

        return replace(self, **kwargs)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "vtg_mode": self.vtg_mode.value if self.vtg_mode else None,
            "elemental_type": (
                self.elemental_type.value if self.elemental_type else None
            ),
            "letter_type": self.letter_type.value if self.letter_type else None,
            "has_dash": self.has_dash,
            "turns_data": self.turns_data,
            "start_position": self.start_position,
            "end_position": self.end_position,
            "show_elemental": self.show_elemental,
            "show_vtg": self.show_vtg,
            "show_tka": self.show_tka,
            "show_positions": self.show_positions,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "GlyphData":
        """Create from dictionary."""
        vtg_mode = None
        if data.get("vtg_mode"):
            vtg_mode = VTGMode(data["vtg_mode"])

        elemental_type = None
        if data.get("elemental_type"):
            elemental_type = ElementalType(data["elemental_type"])

        letter_type = None
        if data.get("letter_type"):
            letter_type = LetterType(data["letter_type"])

        return cls(
            vtg_mode=vtg_mode,
            elemental_type=elemental_type,
            letter_type=letter_type,
            has_dash=data.get("has_dash", False),
            turns_data=data.get("turns_data"),
            start_position=data.get("start_position"),
            end_position=data.get("end_position"),
            show_elemental=data.get("show_elemental", True),
            show_vtg=data.get("show_vtg", True),
            show_tka=data.get("show_tka", True),
            show_positions=data.get("show_positions", True),
        )

    def to_camel_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with camelCase keys for JSON APIs."""
        from ..serialization import dataclass_to_camel_dict

        return dataclass_to_camel_dict(self)

    def to_json(self, camel_case: bool = True, **kwargs) -> str:
        """Serialize to JSON string."""
        from ..serialization import domain_model_to_json

        if camel_case:
            return domain_model_to_json(self, **kwargs)
        else:
            return json.dumps(self.to_dict(), **kwargs)

    @classmethod
    def from_json(cls, json_str: str, camel_case: bool = True) -> "GlyphData":
        """Create instance from JSON string."""
        from ..serialization import domain_model_from_json

        if camel_case:
            return domain_model_from_json(json_str, cls)
        else:
            data = json.loads(json_str)
            return cls.from_dict(data)


@dataclass(frozen=True)
class BeatData:
    """
    REPLACES: Beat class with UI coupling

    Pure business data for a single beat in a sequence.
    No UI dependencies, completely immutable.
    """

    # Core identity
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    beat_number: int = 1

    # Business data
    letter: Optional[str] = None
    duration: float = 1.0

    # Motion data (replaces complex dictionaries)
    blue_motion: Optional[MotionData] = None
    red_motion: Optional[MotionData] = None

    # Glyph data
    glyph_data: Optional[GlyphData] = None

    # State flags
    blue_reversal: bool = False
    red_reversal: bool = False
    is_blank: bool = False

    # Metadata
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        """Validate beat data."""
        if self.duration < 0:
            raise ValueError("Duration must be positive")
        # Allow beat_number=0 for start positions (legacy compatibility)
        if self.beat_number < 0:
            raise ValueError("Beat number must be non-negative")

    def update(self, **kwargs) -> "BeatData":
        """Create a new BeatData with updated fields."""
        from dataclasses import replace

        return replace(self, **kwargs)

    def is_valid(self) -> bool:
        """Check if beat has valid data for sequence inclusion."""
        if self.is_blank:
            return True
        return (
            self.letter is not None
            and self.blue_motion is not None
            and self.red_motion is not None
        )

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "id": self.id,
            "beat_number": self.beat_number,
            "letter": self.letter,
            "duration": self.duration,
            "blue_motion": self.blue_motion.to_dict() if self.blue_motion else None,
            "red_motion": self.red_motion.to_dict() if self.red_motion else None,
            "glyph_data": self.glyph_data.to_dict() if self.glyph_data else None,
            "blue_reversal": self.blue_reversal,
            "red_reversal": self.red_reversal,
            "is_blank": self.is_blank,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "BeatData":
        """Create from dictionary."""
        blue_motion = None
        if data.get("blue_motion"):
            blue_motion = MotionData.from_dict(data["blue_motion"])

        red_motion = None
        if data.get("red_motion"):
            red_motion = MotionData.from_dict(data["red_motion"])

        glyph_data = None
        if data.get("glyph_data"):
            glyph_data = GlyphData.from_dict(data["glyph_data"])

        return cls(
            id=data.get("id", str(uuid.uuid4())),
            beat_number=data.get("beat_number", 1),
            letter=data.get("letter"),
            duration=data.get("duration", 1.0),
            blue_motion=blue_motion,
            red_motion=red_motion,
            glyph_data=glyph_data,
            blue_reversal=data.get("blue_reversal", False),
            red_reversal=data.get("red_reversal", False),
            is_blank=data.get("is_blank", False),
            metadata=data.get("metadata", {}),
        )

    def to_camel_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with camelCase keys for JSON APIs."""
        from ..serialization import dataclass_to_camel_dict

        return dataclass_to_camel_dict(self)

    def to_json(self, camel_case: bool = True, **kwargs) -> str:
        """Serialize to JSON string."""
        from ..serialization import domain_model_to_json

        if camel_case:
            return domain_model_to_json(self, **kwargs)
        else:
            return json.dumps(self.to_dict(), **kwargs)

    @classmethod
    def from_json(cls, json_str: str, camel_case: bool = True) -> "BeatData":
        """Create instance from JSON string."""
        from ..serialization import domain_model_from_json

        if camel_case:
            return domain_model_from_json(json_str, cls)
        else:
            data = json.loads(json_str)
            return cls.from_dict(data)

    @classmethod
    def empty(cls) -> "BeatData":
        """Create an empty beat data."""
        return cls(is_blank=True)


@dataclass(frozen=True)
class SequenceData:
    """
    REPLACES: Complex sequence management with UI coupling

    Pure business data for a complete kinetic sequence.
    No UI dependencies, completely immutable.
    """

    # Core identity
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    word: str = ""  # Generated word from sequence

    # Business data
    beats: List[BeatData] = field(default_factory=list)
    start_position: Optional[str] = None  # Simplified for now

    # Metadata
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        """Validate sequence data."""
        # Validate beat numbers are sequential (allowing beat_number=0 for start positions)
        for i, beat in enumerate(self.beats):
            # Check if this is a start position beat
            is_start_position = beat.metadata.get("is_start_position", False)

            if is_start_position:
                # Start position should be beat_number=0 and should be first in array
                if beat.beat_number != 0:
                    raise ValueError(
                        f"Start position beat has number {beat.beat_number}, expected 0"
                    )
                if i != 0:
                    raise ValueError(
                        f"Start position beat is at index {i}, should be at index 0"
                    )
            else:
                # Regular beats should be numbered sequentially starting from 1
                # Account for start position offset
                start_position_offset = (
                    1
                    if (
                        self.beats
                        and self.beats[0].metadata.get("is_start_position", False)
                    )
                    else 0
                )
                expected_beat_number = i + 1 - start_position_offset

                if beat.beat_number != expected_beat_number:
                    raise ValueError(
                        f"Beat {i} has number {beat.beat_number}, expected {expected_beat_number}"
                    )

    @property
    def length(self) -> int:
        """Get the number of beats in the sequence."""
        return len(self.beats)

    @property
    def total_duration(self) -> float:
        """Get the total duration of the sequence."""
        return sum(beat.duration for beat in self.beats)

    @property
    def is_empty(self) -> bool:
        """Check if sequence has no beats."""
        return len(self.beats) == 0

    @property
    def is_valid(self) -> bool:
        """Check if sequence is valid."""
        if self.is_empty:
            return False
        return all(beat.is_valid() for beat in self.beats)

    def get_beat(self, beat_number: int) -> Optional[BeatData]:
        """Get a beat by its number."""
        for beat in self.beats:
            if beat.beat_number == beat_number:
                return beat
        return None

    def add_beat(self, beat_data: BeatData) -> "SequenceData":
        """Create a new sequence with an additional beat."""
        new_beat = beat_data.update(beat_number=len(self.beats) + 1)
        new_beats = list(self.beats) + [new_beat]

        from dataclasses import replace

        return replace(self, beats=new_beats)

    def remove_beat(self, beat_number: int) -> "SequenceData":
        """Create a new sequence with a beat removed."""
        new_beats = []
        for beat in self.beats:
            if beat.beat_number != beat_number:
                # Renumber remaining beats Call
                new_beat_number = len(new_beats) + 1
                new_beats.append(beat.update(beat_number=new_beat_number))

        from dataclasses import replace

        return replace(self, beats=new_beats)

    def update_beat(self, beat_number: int, **kwargs) -> "SequenceData":
        """Create a new sequence with an updated beat."""
        new_beats = []
        for beat in self.beats:
            if beat.beat_number == beat_number:
                new_beats.append(beat.update(**kwargs))
            else:
                new_beats.append(beat)

        from dataclasses import replace

        return replace(self, beats=new_beats)

    def update(self, **kwargs) -> "SequenceData":
        """Create a new sequence with updated fields."""
        from dataclasses import replace

        return replace(self, **kwargs)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "id": self.id,
            "name": self.name,
            "word": self.word,
            "beats": [beat.to_dict() for beat in self.beats],
            "start_position": self.start_position,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "SequenceData":
        """Create from dictionary."""
        beats = [BeatData.from_dict(beat_data) for beat_data in data.get("beats", [])]

        return cls(
            id=data.get("id", str(uuid.uuid4())),
            name=data.get("name", ""),
            word=data.get("word", ""),
            beats=beats,
            start_position=data.get("start_position"),
            metadata=data.get("metadata", {}),
        )

    def to_camel_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with camelCase keys for JSON APIs."""
        from ..serialization import dataclass_to_camel_dict

        return dataclass_to_camel_dict(self)

    def to_json(self, camel_case: bool = True, **kwargs) -> str:
        """Serialize to JSON string."""
        from ..serialization import domain_model_to_json

        if camel_case:
            return domain_model_to_json(self, **kwargs)
        else:
            return json.dumps(self.to_dict(), **kwargs)

    @classmethod
    def from_json(cls, json_str: str, camel_case: bool = True) -> "SequenceData":
        """Create instance from JSON string."""
        from ..serialization import domain_model_from_json

        if camel_case:
            return domain_model_from_json(json_str, cls)
        else:
            data = json.loads(json_str)
            return cls.from_dict(data)

    @classmethod
    def empty(cls) -> "SequenceData":
        """Create an empty sequence."""
        return cls(name="", beats=[])


class ArrowColor(Enum):
    """Arrow colors matching legacy constants."""

    RED = "red"
    BLUE = "blue"


class GridMode(Enum):
    """Grid modes matching legacy constants."""

    DIAMOND = "diamond"
    BOX = "box"
