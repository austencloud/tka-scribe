"""
Legacy production API - REFACTORED INTO MODULAR STRUCTURE

This file has been refactored into a modular FastAPI architecture.
The new structure can be found in:

src/infrastructure/api/
├── app/
│   ├── app_factory.py          # FastAPI app creation & configuration
│   ├── config.py               # API settings & configuration
│   └── lifespan.py             # Startup/shutdown logic
├── routers/
│   ├── health_router.py        # /api/health, /api/status, /api/performance
│   ├── sequence_router.py      # /api/sequences/* endpoints
│   ├── beat_router.py          # /api/sequences/{id}/beats/* endpoints
│   ├── command_router.py       # /api/commands/* endpoints
│   ├── arrow_router.py         # /api/arrows/* endpoints
│   └── event_router.py         # /api/events/* endpoints
├── middleware/
│   ├── cors_middleware.py      # CORS setup function
│   ├── error_middleware.py     # Global exception handlers
│   └── performance_middleware.py # Performance monitoring
├── dependencies/
│   ├── service_dependencies.py # Service injection functions
│   └── validation_dependencies.py # Request validation
├── converters/
│   ├── domain_to_api.py        # Domain → API model conversion
│   └── api_to_domain.py        # API → Domain model conversion
├── exceptions/
│   ├── api_exceptions.py       # Custom API exceptions
│   └── handlers.py             # Exception handler functions
└── main.py                     # New entry point

To use the new modular API, import from main.py:
    from src.infrastructure.api.main import app

All functionality has been preserved with improved maintainability and separation of concerns.
"""

# Re-export the new modular app for backward compatibility
from .main import app

__all__ = ["app"]
