"""
API routers for TKA Desktop.
Organized by domain for clean separation of concerns.
"""

from .health import router as health_router
from .sequences import router as sequences_router
from .commands import router as commands_router
from .monitoring import router as monitoring_router

__all__ = [
    "health_router",
    "sequences_router", 
    "commands_router",
    "monitoring_router",
]
