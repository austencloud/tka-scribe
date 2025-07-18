"""
Test just the basic browse models without domain imports.
"""

import sys
from pathlib import Path

# Add the src path
sys.path.append(str(Path(__file__).parent.parent.parent.parent))

try:
    # Test just the basic enum models first
    from src.desktop.modern.src.presentation.tabs.browse.models import (
        FilterType,
        NavigationMode,
    )

    print("✅ Successfully imported browse enums")

    # Test the services without domain imports
    print("✅ Basic browse models imported successfully!")

except ImportError as e:
    print(f"❌ Import error: {e}")
except Exception as e:
    print(f"❌ Other error: {e}")
