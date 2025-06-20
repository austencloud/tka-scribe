"""
Validation dependencies for API requests.
"""

from fastapi import HTTPException, status


def validate_sequence_id(sequence_id: str) -> str:
    """Validate sequence ID format."""
    if not sequence_id or len(sequence_id.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sequence ID cannot be empty",
        )
    return sequence_id.strip()


def validate_beat_number(beat_number: int) -> int:
    """Validate beat number."""
    if beat_number < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Beat number must be positive",
        )
    return beat_number
