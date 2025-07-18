#!/usr/bin/env python3
"""
Simple test to verify browse tab imports work correctly
"""

import sys
from pathlib import Path

# Add the src directory to the path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

try:
    print("Testing basic imports...")

    # Test individual components
    from desktop.modern.src.presentation.tabs.browse.models import (
        FilterType,
        NavigationMode,
    )

    print("✅ Models imported successfully")

    from desktop.modern.src.presentation.tabs.browse.services.browse_service import (
        BrowseService,
    )

    print("✅ BrowseService imported successfully")

    from desktop.modern.src.presentation.tabs.browse.services.browse_state_service import (
        BrowseStateService,
    )

    print("✅ BrowseStateService imported successfully")

    from desktop.modern.src.presentation.tabs.browse.components.browse_navigation_stack import (
        BrowseNavigationStack,
    )

    print("✅ BrowseNavigationStack imported successfully")

    from desktop.modern.src.presentation.tabs.browse.components.filter_selection_panel import (
        FilterSelectionPanel,
    )

    print("✅ FilterSelectionPanel imported successfully")

    from desktop.modern.src.presentation.tabs.browse.components.sequence_browser_panel import (
        SequenceBrowserPanel,
    )

    print("✅ SequenceBrowserPanel imported successfully")

    # Test main tab
    from desktop.modern.src.presentation.tabs.browse.modern_browse_tab import (
        ModernBrowseTab,
    )

    print("✅ ModernBrowseTab imported successfully")

    # Test package import
    from desktop.modern.src.presentation.tabs.browse import (
        ModernBrowseTab as TabFromPackage,
    )

    print("✅ Package import successful")

    print("\n🎉 All imports successful! Browse tab is ready to use.")

except Exception as e:
    print(f"❌ Import error: {e}")
    import traceback

    traceback.print_exc()
    sys.exit(1)
