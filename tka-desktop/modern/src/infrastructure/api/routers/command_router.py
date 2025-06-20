"""
Command management endpoints for the TKA Desktop API.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from core.monitoring import monitor_performance
from core.commands import CommandProcessor
from ..api_models import CommandResponse
from ..dependencies.service_dependencies import get_command_processor

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Commands"])


@router.post("/api/commands/undo", response_model=CommandResponse)
@monitor_performance("api_undo_command")
async def undo_last_action(
    command_processor: CommandProcessor = Depends(get_command_processor),
):
    """Undo the last executed command."""
    try:
        result = command_processor.undo()

        return CommandResponse(
            success=result.success,
            message=result.error_message
            or (
                "Command undone successfully"
                if result.success
                else "No command to undo"
            ),
            command_id=result.command_id or "",
            can_undo=command_processor.can_undo(),
            can_redo=command_processor.can_redo(),
            undo_description=command_processor.get_undo_description(),
        )

    except Exception as e:
        logger.error(f"Failed to undo command: {e}")
        raise HTTPException(status_code=500, detail="Failed to undo command")


@router.post("/api/commands/redo", response_model=CommandResponse)
@monitor_performance("api_redo_command")
async def redo_last_action(
    command_processor: CommandProcessor = Depends(get_command_processor),
):
    """Redo the last undone command."""
    try:
        result = command_processor.redo()

        return CommandResponse(
            success=result.success,
            message=result.error_message
            or (
                "Command redone successfully"
                if result.success
                else "No command to redo"
            ),
            command_id=result.command_id or "",
            can_undo=command_processor.can_undo(),
            can_redo=command_processor.can_redo(),
            undo_description=command_processor.get_undo_description(),
        )

    except Exception as e:
        logger.error(f"Failed to redo command: {e}")
        raise HTTPException(status_code=500, detail="Failed to redo command")


@router.get("/api/commands/status", response_model=CommandResponse)
@monitor_performance("api_command_status")
async def get_command_status(
    command_processor: CommandProcessor = Depends(get_command_processor),
):
    """Get current command processor status."""
    try:
        return CommandResponse(
            success=True,
            message="Command status retrieved",
            command_id="",  # Current command ID not available
            can_undo=command_processor.can_undo(),
            can_redo=command_processor.can_redo(),
            undo_description=command_processor.get_undo_description(),
        )

    except Exception as e:
        logger.error(f"Failed to get command status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get command status")
