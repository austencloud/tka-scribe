#!/usr/bin/env python3
"""
Test Session Service Connection in Production Mode

This script tests that the session service is properly connected
in production mode after our fixes.
"""

import sys
from pathlib import Path

# Add TKA modern src to path
tka_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(tka_src_path))

def test_session_service_connection():
    """Test that session service is properly connected in production mode."""
    print("=" * 80)
    print("  Testing Session Service Connection in Production Mode")
    print("=" * 80)
    
    try:
        from core.application.application_factory import ApplicationFactory
        from core.interfaces.session_services import ISessionStateService
        from application.services.core.application_orchestrator import ApplicationOrchestrator
        from PyQt6.QtWidgets import QMainWindow, QApplication
        
        print("\n--- Step 1: Create Production Application ---")
        
        # Create production application
        container = ApplicationFactory.create_production_app()
        print("✅ Production application container created")
        
        # Verify session service is registered
        session_service = container.resolve(ISessionStateService)
        print("✅ Session service resolved from production container")
        
        print("\n--- Step 2: Test Orchestrator with Container ---")
        
        # Create orchestrator with container (like the fixed main.py does)
        orchestrator = ApplicationOrchestrator(container=container)
        print("✅ Orchestrator created with container")
        
        # Check if lifecycle manager has session service
        if orchestrator.lifecycle_manager._session_service:
            print("✅ Lifecycle manager has session service!")
            print(f"   Session service type: {type(orchestrator.lifecycle_manager._session_service)}")
        else:
            print("❌ Lifecycle manager missing session service")
            return False
        
        print("\n--- Step 3: Test Application Initialization ---")
        
        # Create QApplication and main window
        app = QApplication.instance()
        if app is None:
            app = QApplication(sys.argv)
        
        main_window = QMainWindow()
        
        # Test initialization (this should trigger session restoration)
        print("🔍 Testing application initialization...")
        tab_widget = orchestrator.initialize_application(main_window)
        
        print("✅ Application initialization completed")
        print(f"   Tab widget created: {type(tab_widget)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def create_test_sequence_and_verify():
    """Create a test sequence and verify it gets saved to session."""
    print("\n" + "=" * 80)
    print("  Creating Test Sequence and Verifying Session Save")
    print("=" * 80)
    
    try:
        from core.application.application_factory import ApplicationFactory
        from core.testing.ai_agent_helpers import TKAAITestHelper
        from core.interfaces.session_services import ISessionStateService
        
        print("\n--- Creating Test Sequence ---")
        
        # Create test application and sequence
        container = ApplicationFactory.create_test_app()
        test_helper = TKAAITestHelper(use_test_mode=True)
        session_service = container.resolve(ISessionStateService)
        
        # Create test sequence
        sequence_result = test_helper.create_sequence("Production Test Sequence", 2)
        assert sequence_result.success, f"Failed to create sequence: {sequence_result.error}"
        
        sequence_data = sequence_result.data
        sequence_id = sequence_data.get('id') if isinstance(sequence_data, dict) else sequence_data.id
        sequence_name = sequence_data.get('name') if isinstance(sequence_data, dict) else sequence_data.name
        
        print(f"✅ Created test sequence: {sequence_name} (ID: {sequence_id})")
        
        # Save to session
        session_service.update_current_sequence(sequence_data, sequence_id)
        
        # Force save
        save_success = session_service.save_session_state()
        assert save_success, "Failed to save session state"
        
        print("✅ Test sequence saved to session file")
        
        # Verify session file exists
        import json
        session_file = Path("src/desktop/modern/session_state.json")
        if session_file.exists():
            with open(session_file, 'r') as f:
                session_data = json.load(f)
            
            current_sequence = session_data.get("current_sequence", {})
            if current_sequence.get("sequence_id") == sequence_id:
                print(f"✅ Session file contains correct sequence: {sequence_name}")
                return True
            else:
                print("❌ Session file missing sequence data")
                return False
        else:
            print("❌ Session file not created")
            return False
        
    except Exception as e:
        print(f"❌ Sequence creation test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run session service connection tests."""
    print("🧪 Testing Session Service Connection After Fixes")
    print("   This verifies that the session service is properly connected")
    print("   in production mode and ready for sequence restoration.")
    
    # Test 1: Session service connection
    connection_test_passed = test_session_service_connection()
    
    # Test 2: Create test sequence for restoration
    sequence_test_passed = create_test_sequence_and_verify()
    
    print("\n" + "=" * 80)
    print("  Final Results")
    print("=" * 80)
    
    if connection_test_passed and sequence_test_passed:
        print("🎉 ALL TESTS PASSED!")
        print("\n✅ Session service is properly connected in production mode")
        print("✅ Test sequence created and saved for restoration testing")
        
        print("\n🚀 Ready to test with actual TKA application:")
        print("   1. Start TKA: python main.py → TKA Desktop (Modern)")
        print("   2. Watch for these debug messages:")
        print("      🔍 [MAIN] Creating orchestrator with container...")
        print("      ✅ [ORCHESTRATOR] Session service resolved for lifecycle manager")
        print("      🔍 [LIFECYCLE] Session service available, attempting restoration...")
        print("      ✅ [LIFECYCLE] Previous session restored successfully")
        print("   3. Create a new sequence and watch for [SESSION] messages")
        print("   4. Close and restart TKA to test restoration")
        
    else:
        print("❌ SOME TESTS FAILED!")
        if not connection_test_passed:
            print("   - Session service connection test failed")
        if not sequence_test_passed:
            print("   - Sequence creation test failed")
        
        print("\n🔧 Check the errors above and ensure:")
        print("   - ApplicationOrchestrator receives container parameter")
        print("   - Session service is properly resolved from container")
        print("   - ApplicationLifecycleManager gets session service")

if __name__ == "__main__":
    main()
