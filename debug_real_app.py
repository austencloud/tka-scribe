#!/usr/bin/env python3
"""
Debug the real application option picker issue.
"""

import sys
import os
import logging

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src", "desktop", "modern", "src"))

# Set up logging to see what's happening
logging.basicConfig(level=logging.DEBUG, format='%(levelname)s - %(name)s - %(message)s')

def debug_real_app():
    """Debug what happens in the real application."""
    print("🔍 Debugging real application option picker...")
    
    try:
        # Create QApplication
        from PyQt6.QtWidgets import QApplication
        app = QApplication(sys.argv)
        print("   ✅ QApplication created")
        
        # Create the real application factory (not test)
        from core.application.application_factory import ApplicationFactory
        
        print("   🔍 Creating REAL application (not test)...")
        container = ApplicationFactory.create_app()  # NOT create_test_app()
        print("   ✅ Real application created")
        
        # Create orchestrator
        from application.services.option_picker.orchestrator import OptionPickerOrchestrator
        
        print("   🔍 Creating orchestrator...")
        orchestrator = OptionPickerOrchestrator(container=container)
        
        print("   🔍 Initializing orchestrator...")
        orchestrator.initialize()
        print("   ✅ Orchestrator initialized")
        
        # Check initial state
        print(f"   📊 Sections created: {len(orchestrator.sections)}")
        print(f"   📊 Pool manager: {orchestrator.pool_manager is not None}")
        
        # Test loading options like the real app would
        print("   🔍 Testing real option loading...")
        
        # Simulate what happens when user clicks start position
        # This should be the same sequence data that the real app generates
        sequence_data = [
            {'metadata': 'sequence_info'}, 
            {'letter': 'α', 'start_pos': 'alpha1_alpha1', 'end_pos': 'alpha1'}
        ]
        
        print(f"   📊 Loading sequence: {sequence_data}")
        orchestrator.load_motion_combinations(sequence_data)
        print("   ✅ load_motion_combinations completed")
        
        # Check final state
        visible_count = 0
        if orchestrator.pool_manager:
            for i in range(len(orchestrator.pool_manager._pictograph_pool)):
                frame = orchestrator.pool_manager.get_pictograph_from_pool(i)
                if frame and frame.isVisible():
                    visible_count += 1
        
        print(f"   📊 Final visible frames: {visible_count}")
        
        # Check widget visibility
        if orchestrator.sections:
            for letter_type, section in orchestrator.sections.items():
                section_visible = section.isVisible() if hasattr(section, 'isVisible') else 'unknown'
                container_visible = section.section_pictograph_container.isVisible() if hasattr(section.section_pictograph_container, 'isVisible') else 'unknown'
                frame_count = len(section.section_pictograph_container.pictographs) if hasattr(section.section_pictograph_container, 'pictographs') else 0
                print(f"   📊 {letter_type}: section_visible={section_visible}, container_visible={container_visible}, frames={frame_count}")
        
        if orchestrator.option_picker_widget:
            main_visible = orchestrator.option_picker_widget.isVisible() if hasattr(orchestrator.option_picker_widget, 'isVisible') else 'unknown'
            print(f"   📊 Main widget visible: {main_visible}")
        
        if visible_count > 0:
            print("   ✅ SUCCESS: Options should be visible in real app")
            return True
        else:
            print("   ❌ FAILURE: Options not visible in real app")
            return False
        
    except Exception as e:
        print(f"   ❌ Real app debug failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = debug_real_app()
    
    print(f"\n📊 Real App Debug Results:")
    if success:
        print("   ✅ Debug completed successfully")
    else:
        print("   ❌ Debug failed")
    
    sys.exit(0 if success else 1)
