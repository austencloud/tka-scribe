"""
Event system endpoints for the TKA Desktop API.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from core.monitoring import monitor_performance
from core.events import IEventBus
from ..api_models import APIResponse
from ..dependencies.service_dependencies import get_event_bus_dependency

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Events"])


@router.get("/api/events/stats")
@monitor_performance("api_event_stats")
async def get_event_stats(event_bus: IEventBus = Depends(get_event_bus_dependency)):
    """Get event bus statistics."""
    try:
        stats = event_bus.get_stats()

        return APIResponse(
            success=True, message="Event statistics retrieved", data=stats
        )

    except Exception as e:
        logger.error(f"Failed to get event stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get event statistics")
