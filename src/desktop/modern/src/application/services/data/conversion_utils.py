"""
Conversion Utilities

Simple utility functions for data conversion operations.
"""


def extract_end_position_from_position_key(position_key: str) -> str:
    """
    Extract the actual end position from a position key like 'beta5_beta5'.

    Args:
        position_key: Position key in format "start_end" or just "position"

    Returns:
        The end position part of the key
    """
    # Position keys are in format "start_end", we want the end part
    if "_" in position_key:
        parts = position_key.split("_")
        if len(parts) == 2:
            return parts[1]  # Return the end position part

    # Fallback: if no underscore, assume it's already the position
    return position_key
