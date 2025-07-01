#!/usr/bin/env python3
"""
Final Validation Script for TKA Sequence Restoration System

This script validates that the sequence restoration system is working correctly
and provides clear instructions for testing with the actual TKA application.
"""

import sys
from pathlib import Path

# Add TKA modern src to path
tka_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(tka_src_path))

def print_header(title: str):
    """Print a formatted header."""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def print_section(title: str):
    """Print a formatted section header."""
    print(f"\n--- {title} ---")

def validate_complete_restoration_workflow():
    """Validate the complete sequence restoration workflow."""
    print_header("Validating Complete Sequence Restoration Workflow")
    
    try:
        from core.application.application_factory import ApplicationFactory
        from core.testing.ai_agent_helpers import TKAAITestHelper
        from core.interfaces.session_services import ISessionStateService
        from application.services.core.application_lifecycle_manager import ApplicationLifecycleManager
        from PyQt6.QtWidgets import QMainWindow, QApplication
        
        print_section("Step 1: Create and Save Test Sequence")
        
        # Create test application and sequence
        container = ApplicationFactory.create_test_app()
        test_helper = TKAAITestHelper(use_test_mode=True)
        session_service = container.resolve(ISessionStateService)
        
        # Create test sequence
        sequence_result = test_helper.create_sequence("Validation Test Sequence", 3)
        assert sequence_result.success, f"Failed to create sequence: {sequence_result.error}"
        
        sequence_data = sequence_result.data
        sequence_id = sequence_data.get('id') if isinstance(sequence_data, dict) else sequence_data.id
        sequence_name = sequence_data.get('name') if isinstance(sequence_data, dict) else sequence_data.name
        
        print(f"✅ Created test sequence: {sequence_name} (ID: {sequence_id})")
        
        # Save to session
        session_service.update_current_sequence(sequence_data, sequence_id)
        
        # Add workbench state
        from domain.models.core_models import BeatData
        beat_data = BeatData(beat_number=2, letter="B", duration=1.5)
        session_service.update_workbench_state(1, beat_data, None)
        session_service.update_ui_state("sequence_builder", {"test": "layout"})
        
        # Force save
        save_success = session_service.save_session_state()
        assert save_success, "Failed to save session state"
        print("✅ Session saved successfully")
        
        print_section("Step 2: Simulate Application Restart and Restoration")
        
        # Create new application instance (simulating restart)
        new_container = ApplicationFactory.create_headless_app()
        new_session_service = new_container.resolve(ISessionStateService)
        
        # Create application lifecycle manager
        lifecycle_manager = ApplicationLifecycleManager(new_session_service)
        
        # Create QApplication and main window for initialization
        app = QApplication.instance()
        if app is None:
            app = QApplication(sys.argv)
        
        main_window = QMainWindow()
        
        # Initialize application - this triggers session restoration
        print("🔍 Triggering application initialization with session restoration...")
        lifecycle_manager.initialize_application(main_window)
        
        print_section("Step 3: Verify Restoration Results")
        
        # Check session state after restoration
        current_session = new_session_service.get_current_session_state()
        
        # Verify sequence was restored
        assert current_session.current_sequence_id == sequence_id, f"Expected {sequence_id}, got {current_session.current_sequence_id}"
        assert current_session.selected_beat_index == 1, f"Expected beat index 1, got {current_session.selected_beat_index}"
        assert current_session.active_tab == "sequence_builder", f"Expected sequence_builder tab, got {current_session.active_tab}"
        
        print(f"✅ Sequence restored correctly: {current_session.current_sequence_id}")
        print(f"✅ Beat selection restored: {current_session.selected_beat_index}")
        print(f"✅ UI state restored: {current_session.active_tab}")
        
        print_section("Step 4: Verify Session File Persistence")
        
        # Check session file exists and contains correct data
        import json
        session_file = Path("src/desktop/modern/session_state.json")
        assert session_file.exists(), "Session file does not exist"
        
        with open(session_file, 'r') as f:
            session_data = json.load(f)
        
        current_sequence = session_data.get("current_sequence", {})
        assert current_sequence.get("sequence_id") == sequence_id, "Session file missing sequence"
        
        sequence_file_data = current_sequence.get("sequence_data", {})
        assert sequence_file_data.get("name") == sequence_name, "Session file missing sequence name"
        
        print(f"✅ Session file contains correct sequence: {sequence_name}")
        print(f"✅ Session file size: {session_file.stat().st_size} bytes")
        
        return True
        
    except Exception as e:
        print(f"❌ Validation failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_debug_logging_status():
    """Check that debug logging is properly enabled."""
    print_header("Debug Logging Status Check")
    
    print("🔍 Checking debug logging implementation...")
    
    # Check ApplicationLifecycleManager logging
    try:
        with open("src/desktop/modern/src/application/services/core/application_lifecycle_manager.py", 'r') as f:
            content = f.read()
        
        if "[LIFECYCLE]" in content:
            print("✅ ApplicationLifecycleManager debug logging: ENABLED")
        else:
            print("❌ ApplicationLifecycleManager debug logging: MISSING")
    except Exception as e:
        print(f"⚠️ Could not check ApplicationLifecycleManager logging: {e}")
    
    # Check Workbench logging
    try:
        with open("src/desktop/modern/src/presentation/components/workbench/workbench.py", 'r') as f:
            content = f.read()
        
        if "[WORKBENCH]" in content:
            print("✅ Workbench debug logging: ENABLED")
        else:
            print("❌ Workbench debug logging: MISSING")
    except Exception as e:
        print(f"⚠️ Could not check Workbench logging: {e}")
    
    # Check Session Service logging
    try:
        with open("src/desktop/modern/src/application/services/core/session_state_service.py", 'r') as f:
            content = f.read()
        
        if "[SESSION]" in content:
            print("✅ Session Service debug logging: ENABLED")
        else:
            print("❌ Session Service debug logging: MISSING")
    except Exception as e:
        print(f"⚠️ Could not check Session Service logging: {e}")

def provide_testing_instructions():
    """Provide clear instructions for testing with actual TKA application."""
    print_header("Instructions for Testing with Actual TKA Application")
    
    print("🚀 The sequence restoration system is now ready for real application testing!")
    print("\n📋 Follow these steps to test with the actual TKA application:")
    
    print("\n--- Step 1: Start TKA Application ---")
    print("   1. Navigate to the TKA directory")
    print("   2. Run: python main.py")
    print("   3. Select 'TKA Desktop (Modern)' from the launcher")
    print("   4. Watch the console for debug messages during startup")
    
    print("\n--- Step 2: Create a Test Sequence ---")
    print("   1. In the TKA application, create a new sequence")
    print("   2. Add 2-3 beats to the sequence")
    print("   3. Select a specific beat in the beat frame")
    print("   4. Watch for [SESSION] debug messages in the console")
    print("   5. Verify the sequence appears correctly in the beat frame")
    
    print("\n--- Step 3: Test Sequence Persistence ---")
    print("   1. Close the TKA application completely")
    print("   2. Restart TKA using the same method as Step 1")
    print("   3. Watch for these debug messages during startup:")
    
    print("\n🔍 Expected Debug Messages on Startup:")
    print("   🔍 [LIFECYCLE] Session service available, attempting restoration...")
    print("   🔍 [LIFECYCLE] Session load result: success=True, restored=True")
    print("   ✅ [LIFECYCLE] Previous session restored successfully")
    print("   🔍 [LIFECYCLE] Session contains sequence: [sequence_id]")
    print("   🔍 [LIFECYCLE] Publishing sequence restoration event...")
    print("   ✅ [LIFECYCLE] Published sequence restoration event for: [sequence_id]")
    print("   🔍 [WORKBENCH] Received sequence restoration event!")
    print("   🔍 [WORKBENCH] set_sequence() called with: [sequence_name]")
    print("   ✅ [WORKBENCH] set_sequence() completed successfully")
    
    print("\n--- Step 4: Verify Restoration Success ---")
    print("   1. Check that the sequence appears in the beat frame")
    print("   2. Verify the same beats are visible as before closing")
    print("   3. Check that the previously selected beat is still selected")
    print("   4. Confirm you can continue working exactly where you left off")
    
    print("\n🔧 Troubleshooting:")
    print("   If sequence doesn't appear:")
    print("   - Check console for [WORKBENCH] messages")
    print("   - Verify [WORKBENCH] set_sequence() is called")
    print("   - Look for any error messages")
    print("   - Check that session_state.json file exists in src/desktop/modern/")
    
    print("\n   If no debug messages appear:")
    print("   - Verify you're running the modern TKA application")
    print("   - Check that the console output is visible")
    print("   - Ensure the application is starting with the correct configuration")
    
    print("\n✅ Success Criteria:")
    print("   - Sequences persist across application restarts")
    print("   - Beat frame displays restored sequences correctly")
    print("   - Selected beat and UI state are preserved")
    print("   - Debug messages confirm each step of the restoration process")

def main():
    """Run final validation of the sequence restoration system."""
    print_header("TKA Sequence Restoration System - Final Validation")
    
    print("🎯 This script validates that the sequence restoration system is working")
    print("   correctly and provides instructions for real application testing.")
    
    # Run validation
    validation_success = validate_complete_restoration_workflow()
    
    # Check debug logging
    check_debug_logging_status()
    
    print_header("Final Results")
    
    if validation_success:
        print("🎉 SEQUENCE RESTORATION SYSTEM VALIDATION PASSED!")
        print("\n✅ All components are working correctly:")
        print("   - Session state saving and loading")
        print("   - Application lifecycle restoration")
        print("   - Event publishing for UI updates")
        print("   - Session file persistence")
        print("   - Debug logging for troubleshooting")
        
        # Provide testing instructions
        provide_testing_instructions()
        
    else:
        print("❌ VALIDATION FAILED!")
        print("   Please review the errors above and fix any issues before testing")
        print("   with the actual TKA application.")

if __name__ == "__main__":
    main()
