from enum import Enum


class CAPType(Enum):
    STRICT_ROTATED = "strict_rotated"
    STRICT_MIRRORED = "strict_mirrored"
    STRICT_SWAPPED = "strict_swapped"
    STRICT_INVERTED = "strict_inverted"

    SWAPPED_INVERTED = "swapped_inverted"

    ROTATED_INVERTED = "rotated_inverted"
    MIRRORED_SWAPPED = "mirrored_swapped"

    MIRRORED_INVERTED = "mirrored_inverted"
    ROTATED_SWAPPED = "rotated_swapped"

    MIRRORED_ROTATED = "mirrored_rotated"
    MIRRORED_INVERTED_ROTATED = "mirrored_inverted_rotated"
    # ROTATED_SWAPPED_INVERTED = "rotated_swapped_inverted"
    # MIRRORED_SWAPPED_INVERTED = "mirrored_swapped_inverted"
    # MIRRORED_ROTATED_SWAPPED = "mirrored_rotated_swapped"
    # MIRRORED_ROTATED_INVERTED_SWAPPED = "mirrored_rotated_inverted_swapped"
    # TIME REVERSAL = "time_reversal"

    @staticmethod
    def from_str(s: str):
        _lookup_map = {cap_type.value: cap_type for cap_type in CAPType}
        try:
            return _lookup_map[s]
        except KeyError:
            raise ValueError(f"Invalid CAPType string: {s}")
