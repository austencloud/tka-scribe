"""
Main entry point for the TKA Desktop Production API.
"""

from .app.app_factory import create_app
from .app.config import APIConfig

# Create the FastAPI application
config = APIConfig()
app = create_app(config)

# Export the app for uvicorn
__all__ = ["app"]
