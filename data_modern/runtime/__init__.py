"""
Runtime Module

Contains generated and temporary data created during application execution.

Structure:
- logs/: Application log files
- performance/: Performance monitoring data
- sequences/: Runtime sequence storage
- temp/: Temporary files

This data is typically generated at runtime and may be safely deleted.
"""

from pathlib import Path

# Provide easy access to runtime directories
_module_dir = Path(__file__).parent

LOGS_DIR = _module_dir / "logs"
PERFORMANCE_DIR = _module_dir / "performance"
SEQUENCES_DIR = _module_dir / "sequences"
TEMP_DIR = _module_dir / "temp"

def ensure_runtime_dirs():
    """Ensure all runtime directories exist."""
    for dir_path in [LOGS_DIR, PERFORMANCE_DIR, SEQUENCES_DIR, TEMP_DIR]:
        dir_path.mkdir(parents=True, exist_ok=True)

__all__ = [
    "LOGS_DIR",
    "PERFORMANCE_DIR",
    "SEQUENCES_DIR", 
    "TEMP_DIR",
    "ensure_runtime_dirs",
    "logs",
    "performance",
    "sequences",
    "temp"
]
