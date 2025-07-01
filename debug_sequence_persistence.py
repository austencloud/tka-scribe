#!/usr/bin/env python3
"""
TKA Sequence Persistence Diagnostic Tool

This script helps debug sequence persistence issues by checking:
1. Session state file creation and content
2. Session restoration logic
3. UI component integration
4. Service registration and connectivity
"""

import sys
import json
from pathlib import Path
from datetime import datetime

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

def check_session_file_exists():
    """Check if session state file exists and show its content."""
    print_section("Checking Session State File")
    
    # Check multiple possible locations
    possible_locations = [
        Path("session_state.json"),
        Path("src/desktop/modern/session_state.json"),
        Path("src/desktop/modern/src/session_state.json"),
        Path.home() / ".tka" / "session_state.json",
    ]
    
    session_file = None
    for location in possible_locations:
        if location.exists():
            session_file = location
            break
    
    if session_file:
        print(f"✅ Session file found: {session_file}")
        try:
            with open(session_file, 'r') as f:
                session_data = json.load(f)
            
            print(f"📄 File size: {session_file.stat().st_size} bytes")
            print(f"📅 Last modified: {datetime.fromtimestamp(session_file.stat().st_mtime)}")
            
            # Show session content structure
            print("\n📋 Session Content Structure:")
            for key, value in session_data.items():
                if isinstance(value, dict):
                    print(f"  {key}: {len(value)} items")
                    for subkey in value.keys():
                        print(f"    - {subkey}")
                else:
                    print(f"  {key}: {value}")
            
            # Check for sequence data specifically
            current_sequence = session_data.get("current_sequence", {})
            if current_sequence.get("sequence_id"):
                print(f"\n✅ Sequence found in session: {current_sequence['sequence_id']}")
                sequence_data = current_sequence.get("sequence_data")
                if sequence_data:
                    if isinstance(sequence_data, dict):
                        beats_count = len(sequence_data.get("beats", []))
                        sequence_name = sequence_data.get("name", "Unknown")
                        print(f"   Name: {sequence_name}")
                        print(f"   Beats: {beats_count}")
                    else:
                        print(f"   Data type: {type(sequence_data)}")
                else:
                    print("   ⚠️ No sequence data found")
            else:
                print("❌ No sequence found in session")
            
            return session_file, session_data
            
        except json.JSONDecodeError as e:
            print(f"❌ Session file is corrupted: {e}")
            return session_file, None
        except Exception as e:
            print(f"❌ Error reading session file: {e}")
            return session_file, None
    else:
        print("❌ No session file found in any expected location")
        print("   Checked locations:")
        for location in possible_locations:
            print(f"   - {location}")
        return None, None

def test_session_service():
    """Test session service functionality."""
    print_section("Testing Session Service")
    
    try:
        from core.application.application_factory import ApplicationFactory
        from core.interfaces.session_services import ISessionStateService
        
        # Create test application
        container = ApplicationFactory.create_test_app()
        print("✅ Test application container created")
        
        # Try to resolve session service
        try:
            session_service = container.resolve(ISessionStateService)
            print("✅ Session service resolved from DI container")
            
            # Test basic functionality
            current_session = session_service.get_current_session_state()
            print(f"✅ Current session state retrieved: {type(current_session)}")
            
            # Check if auto-save is enabled
            auto_save_enabled = session_service.is_auto_save_enabled()
            print(f"✅ Auto-save enabled: {auto_save_enabled}")
            
            return session_service
            
        except Exception as e:
            print(f"❌ Failed to resolve session service: {e}")
            return None
            
    except Exception as e:
        print(f"❌ Failed to create test application: {e}")
        return None

def test_ui_state_service():
    """Test UI state service integration."""
    print_section("Testing UI State Service Integration")
    
    try:
        from core.application.application_factory import ApplicationFactory
        from core.interfaces.core_services import IUIStateManagementService
        
        container = ApplicationFactory.create_test_app()
        ui_service = container.resolve(IUIStateManagementService)
        print("✅ UI state service resolved")
        
        # Check if session service is integrated
        if hasattr(ui_service, '_session_service'):
            if ui_service._session_service:
                print("✅ Session service is integrated with UI service")
            else:
                print("⚠️ Session service is None in UI service")
        else:
            print("❌ UI service has no _session_service attribute")
        
        # Test session-aware methods
        if hasattr(ui_service, 'restore_session_on_startup'):
            print("✅ restore_session_on_startup method exists")
        else:
            print("❌ restore_session_on_startup method missing")
        
        if hasattr(ui_service, 'update_current_sequence_with_session'):
            print("✅ update_current_sequence_with_session method exists")
        else:
            print("❌ update_current_sequence_with_session method missing")
        
        return ui_service
        
    except Exception as e:
        print(f"❌ Failed to test UI state service: {e}")
        return None

def test_sequence_creation_and_save():
    """Test creating a sequence and saving it to session."""
    print_section("Testing Sequence Creation and Session Save")
    
    try:
        from core.testing.ai_agent_helpers import TKAAITestHelper
        from core.application.application_factory import ApplicationFactory
        from core.interfaces.session_services import ISessionStateService
        
        # Create test environment
        container = ApplicationFactory.create_test_app()
        test_helper = TKAAITestHelper(use_test_mode=True)
        session_service = container.resolve(ISessionStateService)
        
        print("✅ Test environment created")
        
        # Create a test sequence
        sequence_result = test_helper.create_sequence("Debug Test Sequence", 6)
        if sequence_result.success:
            print(f"✅ Test sequence created: {sequence_result.data}")
            
            # Try to save to session
            sequence_data = sequence_result.data
            sequence_id = sequence_data.get('id') if isinstance(sequence_data, dict) else sequence_data.id
            
            session_service.update_current_sequence(sequence_data, sequence_id)
            print(f"✅ Sequence updated in session: {sequence_id}")
            
            # Try to save session state
            save_success = session_service.save_session_state()
            if save_success:
                print("✅ Session state saved successfully")
                
                # Verify session file was created
                current_session = session_service.get_current_session_state()
                if current_session.current_sequence_id == sequence_id:
                    print("✅ Session state contains correct sequence ID")
                else:
                    print(f"❌ Session state has wrong sequence ID: {current_session.current_sequence_id}")
            else:
                print("❌ Failed to save session state")
        else:
            print(f"❌ Failed to create test sequence: {sequence_result.error}")
        
    except Exception as e:
        print(f"❌ Error in sequence creation test: {e}")
        import traceback
        traceback.print_exc()

def test_sequence_restoration():
    """Test loading and restoring sequence from session."""
    print_section("Testing Sequence Restoration")
    
    try:
        from core.application.application_factory import ApplicationFactory
        from core.interfaces.session_services import ISessionStateService
        from core.interfaces.core_services import IUIStateManagementService
        
        # Create fresh application (simulating restart)
        container = ApplicationFactory.create_test_app()
        session_service = container.resolve(ISessionStateService)
        ui_service = container.resolve(IUIStateManagementService)
        
        print("✅ Fresh application created (simulating restart)")
        
        # Try to load session
        restore_result = session_service.load_session_state()
        if restore_result.success:
            print("✅ Session load operation succeeded")
            
            if restore_result.session_restored:
                print("✅ Session was restored")
                session_data = restore_result.session_data
                
                if session_data.current_sequence_id:
                    print(f"✅ Sequence found in restored session: {session_data.current_sequence_id}")
                    
                    # Test UI restoration
                    if hasattr(ui_service, 'set_session_service'):
                        ui_service.set_session_service(session_service)
                        restore_ui_success = ui_service.restore_session_on_startup()
                        if restore_ui_success:
                            print("✅ UI state restoration succeeded")
                        else:
                            print("❌ UI state restoration failed")
                    else:
                        print("❌ UI service missing set_session_service method")
                else:
                    print("❌ No sequence in restored session")
            else:
                print("⚠️ Session load succeeded but no session was restored")
                if restore_result.warnings:
                    for warning in restore_result.warnings:
                        print(f"   Warning: {warning}")
        else:
            print(f"❌ Session load failed: {restore_result.error_message}")
        
    except Exception as e:
        print(f"❌ Error in sequence restoration test: {e}")
        import traceback
        traceback.print_exc()

def main():
    """Run comprehensive sequence persistence diagnostics."""
    print_header("TKA Sequence Persistence Diagnostic Tool")
    
    print("🔍 This tool will help diagnose sequence persistence issues.")
    print("   Follow the steps and check each result carefully.")
    
    # Step 1: Check session file
    session_file, session_data = check_session_file_exists()
    
    # Step 2: Test session service
    session_service = test_session_service()
    
    # Step 3: Test UI service integration
    ui_service = test_ui_state_service()
    
    # Step 4: Test sequence creation and save
    test_sequence_creation_and_save()
    
    # Step 5: Test sequence restoration
    test_sequence_restoration()
    
    print_header("Diagnostic Summary")
    
    # Provide recommendations based on findings
    if session_file and session_data:
        print("✅ Session file exists and is readable")
    else:
        print("❌ ISSUE: Session file missing or corrupted")
        print("   SOLUTION: Check session service file path and permissions")
    
    if session_service:
        print("✅ Session service is working")
    else:
        print("❌ ISSUE: Session service not working")
        print("   SOLUTION: Check DI container registration")
    
    if ui_service:
        print("✅ UI service integration is working")
    else:
        print("❌ ISSUE: UI service integration problems")
        print("   SOLUTION: Check UI service session integration")
    
    print("\n🔧 Next Steps:")
    print("1. Run this diagnostic after creating a sequence in TKA")
    print("2. Check console output during TKA startup for errors")
    print("3. Verify session file location matches TKA's expected path")
    print("4. Test with a simple sequence (2-3 beats) first")

if __name__ == "__main__":
    main()
