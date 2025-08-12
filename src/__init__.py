"""
TKA - The Kinetic Alphabet

A comprehensive juggling sequence visualization and management application.
"""

__version__ = "0.1.0"
__author__ = "Austen Cloud"
__email__ = "austen@example.com"

# Make key classes available at package level
try:
    from desktop.modern.main import main as run_modern_app
    from desktop.legacy.main import main as run_legacy_app
except ImportError:
    # Handle cases where PyQt6 or other dependencies aren't available
    def run_modern_app():
        raise ImportError("PyQt6 dependencies not available for modern app")
    
    def run_legacy_app():
        raise ImportError("PyQt6 dependencies not available for legacy app")

__all__ = [
    "__version__",
    "__author__",
    "__email__",
    "run_modern_app",
    "run_legacy_app",
]
