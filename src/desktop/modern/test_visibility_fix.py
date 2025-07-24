#!/usr/bin/env python3
"""
Test script to verify that the visibility component fix works correctly.
This tests that the visibility pictograph preview can be created and used without import errors.
"""

import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_visibility_component_import():
    """Test that the visibility component can be imported without errors."""
    print("🧪 Testing visibility component import...")
    
    try:
        from presentation.components.ui.settings.visibility.visibility_pictograph_preview import (
            VisibilityPictographPreview
        )
        print("✅ VisibilityPictographPreview imported successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to import VisibilityPictographPreview: {e}")
        return False

def test_visibility_component_creation():
    """Test that the visibility component can be created."""
    print("🧪 Testing visibility component creation...")
    
    try:
        from PyQt6.QtWidgets import QApplication
        from presentation.components.ui.settings.visibility.visibility_pictograph_preview import (
            VisibilityPictographPreview
        )
        
        # Create QApplication if it doesn't exist
        app = QApplication.instance()
        if app is None:
            app = QApplication(sys.argv)
        
        # Create the component
        preview = VisibilityPictographPreview()
        print("✅ VisibilityPictographPreview created successfully")
        
        # Test that it has the expected methods
        if hasattr(preview, 'update_visibility'):
            print("✅ update_visibility method exists")
        else:
            print("❌ update_visibility method missing")
            return False
            
        if hasattr(preview, 'refresh_preview'):
            print("✅ refresh_preview method exists")
        else:
            print("❌ refresh_preview method missing")
            return False
            
        # Test that the view was created
        if hasattr(preview, 'pictograph_view') and preview.pictograph_view is not None:
            print("✅ Pictograph view created successfully")
        else:
            print("❌ Pictograph view not created")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Failed to create VisibilityPictographPreview: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_graph_editor_import():
    """Test that the graph editor components can be imported without errors."""
    print("🧪 Testing graph editor component imports...")
    
    try:
        from presentation.components.graph_editor.components.pictograph_display_section import (
            PictographDisplaySection
        )
        print("✅ PictographDisplaySection imported successfully")
        
        from presentation.components.graph_editor.components.pictograph_container import (
            GraphEditorPictographContainer
        )
        print("✅ GraphEditorPictographContainer imported successfully")
        
        return True
    except Exception as e:
        print(f"❌ Failed to import graph editor components: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_pictograph_views_import():
    """Test that the new pictograph views can be imported."""
    print("🧪 Testing pictograph views import...")
    
    try:
        from presentation.components.pictograph.views import (
            BasePictographView,
            create_pictograph_view,
            create_option_view,
            create_start_position_view,
            create_learn_view
        )
        print("✅ All pictograph view functions imported successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to import pictograph views: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests."""
    print("🚀 Starting visibility component fix verification tests...")
    print("=" * 60)
    
    tests = [
        test_pictograph_views_import,
        test_visibility_component_import,
        test_graph_editor_import,
        test_visibility_component_creation,
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        print()
        if test():
            passed += 1
        print("-" * 40)
    
    print()
    print("=" * 60)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The visibility component fix is working correctly.")
        return True
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
