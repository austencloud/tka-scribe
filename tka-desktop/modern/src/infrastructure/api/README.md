# TKA Desktop API - Modular Architecture

This directory contains the refactored modular FastAPI architecture for the TKA Desktop API.

## Architecture Overview

The API has been broken down from a single monolith (`production_api.py`) into a modular structure that follows FastAPI best practices:

```
src/infrastructure/api/
├── app/                        # Application configuration
├── routers/                    # Endpoint handlers by domain
├── middleware/                 # Cross-cutting concerns
├── dependencies/              # Dependency injection
├── converters/                # Model transformations
├── exceptions/                # Error handling
└── main.py                    # Entry point
```

## Quick Start

```python
# Import the configured FastAPI app
from src.infrastructure.api.main import app

# The app is ready to use with uvicorn
# uvicorn src.infrastructure.api.main:app --reload
```

## Module Details

### 📱 App Configuration (`app/`)

- **`app_factory.py`** - Creates and configures the FastAPI application
- **`config.py`** - API configuration settings and environment variables
- **`lifespan.py`** - Service initialization and cleanup on startup/shutdown

### 🛣️ Routers (`routers/`)

Each router handles endpoints for a specific domain:

- **`health_router.py`** - Health checks and monitoring (`/api/health`, `/api/status`, `/api/performance`)
- **`sequence_router.py`** - Sequence management (`/api/sequences/*`)
- **`beat_router.py`** - Beat management (`/api/sequences/{id}/beats/*`)
- **`command_router.py`** - Command operations (`/api/commands/*`)
- **`arrow_router.py`** - Arrow positioning (`/api/arrows/*`)
- **`event_router.py`** - Event system stats (`/api/events/*`)

### 🔧 Middleware (`middleware/`)

- **`cors_middleware.py`** - CORS configuration
- **`error_middleware.py`** - Global exception handling
- **`performance_middleware.py`** - Request performance monitoring

### 💉 Dependencies (`dependencies/`)

- **`service_dependencies.py`** - Service injection functions for FastAPI Depends()
- **`validation_dependencies.py`** - Request validation helpers

### 🔄 Converters (`converters/`)

- **`domain_to_api.py`** - Convert domain models to API response models
- **`api_to_domain.py`** - Convert API request models to domain models

### ⚠️ Exceptions (`exceptions/`)

- **`api_exceptions.py`** - Custom API exception classes
- **`handlers.py`** - Exception handler functions

## Features Preserved

✅ **All original endpoints** - Every endpoint from the monolith has been preserved  
✅ **Dependency injection** - All `Depends()` functions work identically  
✅ **Performance monitoring** - `@monitor_performance` decorators maintained  
✅ **Error handling** - Comprehensive exception handling preserved  
✅ **CORS configuration** - Cross-origin request support  
✅ **Service integration** - Full integration with core services  
✅ **API documentation** - All docstrings and OpenAPI docs preserved

## Benefits of Modular Structure

🎯 **Separation of Concerns** - Each module has a single responsibility  
🔧 **Easier Maintenance** - Find and modify specific functionality quickly  
🧪 **Better Testing** - Test individual components in isolation  
🚀 **Improved Performance** - Only load what you need  
📝 **Better Documentation** - Clear module boundaries and purposes  
🔄 **Easier Extension** - Add new endpoints/features without touching existing code

## Usage Examples

### Adding a New Router

```python
# 1. Create new router file
# routers/new_feature_router.py
from fastapi import APIRouter
router = APIRouter(tags=["NewFeature"])

@router.get("/api/new-feature")
async def new_endpoint():
    return {"message": "Hello from new feature"}

# 2. Add to app factory
# app/app_factory.py
from ..routers import new_feature_router
app.include_router(new_feature_router.router)
```

### Adding Middleware

```python
# 1. Create middleware file
# middleware/my_middleware.py
def setup_my_middleware(app):
    # Add your middleware configuration
    pass

# 2. Add to app factory
# app/app_factory.py
from ..middleware.my_middleware import setup_my_middleware
setup_my_middleware(app)
```

### Custom Exception Handling

```python
# 1. Define exception
# exceptions/api_exceptions.py
class MyCustomException(TKAAPIException):
    def __init__(self, detail: str):
        super().__init__(detail, status_code=422)

# 2. Use in router
# routers/my_router.py
raise MyCustomException("Something went wrong")
```

## Migration Guide

If you're updating code that previously imported from `production_api.py`:

### Before

```python
from src.infrastructure.api.production_api import app
```

### After

```python
from src.infrastructure.api.main import app
```

The app interface remains identical, but you now have access to modular components for customization.

## Development

### Running the API

```bash
# Development mode with auto-reload
uvicorn src.infrastructure.api.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn src.infrastructure.api.main:app --host 0.0.0.0 --port 8000
```

### Testing

```python
# Test individual routers
from src.infrastructure.api.routers.health_router import router
from fastapi.testclient import TestClient

client = TestClient(router)
response = client.get("/api/health")
```

### Configuration

Environment variables can be set with the `TKA_API_` prefix:

```bash
export TKA_API_TITLE="My Custom API"
export TKA_API_VERSION="3.0.0"
```

## Future Enhancements

The modular structure makes it easy to add:

- 🔐 Authentication middleware
- 📊 Advanced monitoring and metrics
- 🗄️ Database connection management
- 📦 Plugin system for extensions
- 🔄 Versioning support
- 🚦 Rate limiting
- 📝 Enhanced logging and tracing

## Support

For questions about the modular API structure, refer to:

- Individual module docstrings
- FastAPI documentation: https://fastapi.tiangolo.com/
- This README and inline comments
