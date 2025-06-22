"""
API routers for TKA Desktop.
Organized by domain for clean separation of concerns.
"""

from .arrows import router as arrows_router
from .beats import router as beats_router
from .commands import router as commands_router
from .health import router as health_router
from .monitoring import router as monitoring_router
from .sequences import router as sequences_router

__all__ = [
    "health_router",
    "sequences_router",
    "beats_router",
    "commands_router",
    "arrows_router",
    "monitoring_router",
]
