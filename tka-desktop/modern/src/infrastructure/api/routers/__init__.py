"""
Router modules for the TKA Desktop API.
"""

from . import (
    health_router,
    sequence_router,
    beat_router,
    command_router,
    arrow_router,
    event_router,
)

__all__ = [
    "health_router",
    "sequence_router",
    "beat_router",
    "command_router",
    "arrow_router",
    "event_router",
]
