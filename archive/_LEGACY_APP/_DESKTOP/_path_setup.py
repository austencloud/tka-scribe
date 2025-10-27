# Additional Python Path Configuration for TKA
import sys
from pathlib import Path

# Project root - the main TKA directory
project_root = Path(__file__).resolve().parent.parent

# Essential paths for TKA imports
essential_paths = [
    str(project_root),  # Main project root
    str(project_root / "desktop"),  # Desktop module
    str(project_root / "desktop" / "modern"),  # Modern architecture
    str(project_root / "desktop" / "legacy"),  # Legacy architecture  
    str(project_root / "src"),  # Source directory
    str(project_root / "src" / "desktop"),  # Source desktop
    str(project_root / "src" / "desktop" / "modern" / "src"),  # Modern source
    str(project_root / "launcher"),  # Launcher
    str(project_root / "packages"),  # Packages
]

# Add paths if not already present
for path in essential_paths:
    if path not in sys.path:
        sys.path.insert(0, path)

print("✅ TKA Python paths configured successfully")