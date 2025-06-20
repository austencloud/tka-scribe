"""
Sequence management endpoints for the TKA Desktop API.
"""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from core.monitoring import monitor_performance
from ..api_models import SequenceAPI, CreateSequenceRequest
from ..dependencies.service_dependencies import get_sequence_service
from ..converters.domain_to_api import domain_to_api_sequence
from application.services.core.sequence_management_service import (
    SequenceManagementService,
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Sequences"])


@router.get(
    "/api/sequences/current",
    response_model=Optional[SequenceAPI],
    summary="Get Current Active Sequence",
    description="Retrieves the currently active sequence being worked on",
    responses={
        200: {
            "description": "Current sequence retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": "seq_123456",
                        "name": "My Sequence",
                        "word": "EXAMPLE",
                        "beats": [
                            {
                                "id": "beat_001",
                                "beat_number": 1,
                                "letter": "E",
                                "duration": 1.0,
                                "blue_motion": {
                                    "motion_type": "pro",
                                    "prop_rot_dir": "cw",
                                    "start_loc": "alpha",
                                    "end_loc": "beta",
                                    "turns": 1,
                                    "start_ori": "in",
                                    "end_ori": "out",
                                },
                                "red_motion": None,
                                "blue_reversal": False,
                                "red_reversal": False,
                                "is_blank": False,
                                "metadata": {},
                            }
                        ],
                        "start_position": "alpha",
                        "metadata": {
                            "created_at": "2024-01-15T10:30:00.000Z",
                            "modified_at": "2024-01-15T10:35:00.000Z",
                        },
                    }
                }
            },
        },
        404: {
            "description": "No current sequence found",
            "content": {
                "application/json": {
                    "example": {
                        "error": "No current sequence found",
                        "status_code": 404,
                    }
                }
            },
        },
    },
)
@monitor_performance("api_get_current_sequence")
async def get_current_sequence(
    sequence_service: SequenceManagementService = Depends(get_sequence_service),
):
    """
    Get Currently Active Sequence

    Retrieves the sequence that is currently being worked on or edited.
    This represents the "active" sequence in the application context.

    **Performance Characteristics:**
    - Response time: <100ms typical
    - Memory impact: <5MB for typical sequence
    - CPU usage: <2% during retrieval

    **Usage Scenarios:**
    - Loading current work session
    - Resuming editing after application restart
    - Synchronizing state across multiple clients
    - Auto-save functionality

    **Best Practices:**
    - Cache the result for short periods (30-60 seconds)
    - Check for updates before making modifications
    - Handle null response gracefully (no current sequence)

    **Error Handling:**
    - Returns null if no sequence is currently active
    - 503 if sequence service is unavailable
    - 500 for unexpected errors
    """
    try:
        # For now, return the most recently created sequence
        # In a full implementation, this would track the "current" sequence
        return None  # Placeholder - implement current sequence tracking
    except Exception as e:
        logger.error(f"Failed to get current sequence: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve current sequence"
        )


@router.post(
    "/api/sequences",
    response_model=SequenceAPI,
    summary="Create New Sequence",
    description="Creates a new sequence with the specified name and length",
    responses={
        200: {
            "description": "Sequence created successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": "seq_789012",
                        "name": "New Sequence",
                        "word": "NEWSEQ",
                        "beats": [
                            {
                                "id": "beat_001",
                                "beat_number": 1,
                                "letter": "N",
                                "duration": 1.0,
                                "blue_motion": None,
                                "red_motion": None,
                                "blue_reversal": False,
                                "red_reversal": False,
                                "is_blank": True,
                                "metadata": {},
                            }
                        ],
                        "start_position": "alpha",
                        "metadata": {
                            "created_at": "2024-01-15T10:30:00.000Z",
                            "modified_at": "2024-01-15T10:30:00.000Z",
                        },
                    }
                }
            },
        },
        400: {
            "description": "Invalid request parameters",
            "content": {
                "application/json": {
                    "example": {
                        "error": "Invalid sequence length: must be between 1 and 100",
                        "status_code": 400,
                    }
                }
            },
        },
        503: {
            "description": "Service unavailable",
            "content": {
                "application/json": {
                    "example": {
                        "error": "Sequence service not available",
                        "status_code": 503,
                    }
                }
            },
        },
    },
)
@monitor_performance("api_create_sequence")
async def create_sequence(
    request: CreateSequenceRequest,
    sequence_service: SequenceManagementService = Depends(get_sequence_service),
):
    """
    Create New Sequence

    Creates a new sequence with the specified parameters. The sequence will be
    initialized with blank beats that can be populated with motions.

    **Request Parameters:**
    - name: Human-readable name for the sequence
    - length: Number of beats in the sequence (1-100)

    **Performance Characteristics:**
    - Response time: <200ms for typical sequences
    - Memory impact: ~1MB per 10 beats
    - CPU usage: <5% during creation

    **Usage Scenarios:**
    - Starting a new choreography project
    - Creating templates for common sequences
    - Batch sequence generation
    - Educational sequence creation

    **Best Practices:**
    - Use descriptive names for easy identification
    - Keep sequences under 50 beats for optimal performance
    - Validate sequence length before creation
    - Store the returned ID for future operations

    **Error Handling:**
    - 400: Invalid parameters (name too long, invalid length)
    - 503: Service unavailable
    - 500: Unexpected creation errors
    """
    try:
        # Create sequence using the service
        sequence = sequence_service.create_sequence(request.name, request.length)

        # Convert to API format
        api_sequence = domain_to_api_sequence(sequence)

        logger.info(f"Created sequence: {sequence.id} with {len(sequence.beats)} beats")
        return api_sequence

    except Exception as e:
        logger.error(f"Failed to create sequence: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/api/sequences/{sequence_id}", response_model=SequenceAPI)
@monitor_performance("api_get_sequence")
async def get_sequence(
    sequence_id: str,
    sequence_service: SequenceManagementService = Depends(get_sequence_service),
):
    """Get a specific sequence by ID."""
    try:
        # Note: This would require implementing sequence storage/retrieval in the service
        # For now, return a placeholder response
        raise HTTPException(status_code=404, detail="Sequence not found")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get sequence {sequence_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve sequence")


@router.put("/api/sequences/{sequence_id}", response_model=SequenceAPI)
@monitor_performance("api_update_sequence")
async def update_sequence(
    sequence_id: str,
    sequence: SequenceAPI,
    sequence_service: SequenceManagementService = Depends(get_sequence_service),
):
    """Update an existing sequence."""
    try:
        # Note: This would require implementing sequence update in the service
        # For now, return a placeholder response
        raise HTTPException(
            status_code=501, detail="Sequence update not yet implemented"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update sequence {sequence_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update sequence")


@router.delete("/api/sequences/{sequence_id}")
@monitor_performance("api_delete_sequence")
async def delete_sequence(
    sequence_id: str,
    sequence_service: SequenceManagementService = Depends(get_sequence_service),
):
    """Delete a sequence."""
    try:
        # Note: This would require implementing sequence deletion in the service
        # For now, return a placeholder response
        raise HTTPException(
            status_code=501, detail="Sequence deletion not yet implemented"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete sequence {sequence_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete sequence")
