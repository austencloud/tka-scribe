#!/usr/bin/env python3
"""
Monitor TKA Startup for Session Restoration

This script helps monitor TKA startup to verify session restoration is working.
"""

import subprocess
import sys
import time
from pathlib import Path

def monitor_tka_startup():
    """Monitor TKA startup for session restoration messages."""
    print("=" * 80)
    print("  TKA Session Restoration Monitoring")
    print("=" * 80)
    
    print("\n🔍 Expected debug messages during TKA startup:")
    print("   🔍 [MAIN] Creating orchestrator with container...")
    print("   ✅ [ORCHESTRATOR] Session service resolved for lifecycle manager")
    print("   🔍 [LIFECYCLE] Session service available, attempting restoration...")
    print("   🔍 [LIFECYCLE] Session load result: success=True, restored=True")
    print("   ✅ [LIFECYCLE] Previous session restored successfully")
    print("   🔍 [LIFECYCLE] Publishing sequence restoration event...")
    print("   🔍 [WORKBENCH] Received sequence restoration event!")
    print("   🔍 [WORKBENCH] set_sequence() called with: [sequence_name]")
    
    print("\n📋 Instructions:")
    print("   1. The script will show you what to look for")
    print("   2. Start TKA manually: python main.py → TKA Desktop (Modern)")
    print("   3. Watch the console output for the debug messages above")
    print("   4. If you see the messages, session restoration is working!")
    print("   5. Create a sequence, close TKA, restart, and verify restoration")
    
    print("\n🎯 Success Criteria:")
    print("   ✅ See [ORCHESTRATOR] message - session service connected")
    print("   ✅ See [LIFECYCLE] restoration messages - session loading works")
    print("   ✅ See [WORKBENCH] event messages - UI restoration works")
    print("   ✅ Sequences persist across application restarts")
    
    print("\n⚠️ If you don't see the expected messages:")
    print("   - Check that you're running TKA Desktop (Modern)")
    print("   - Verify the console output is visible")
    print("   - Look for any error messages")
    print("   - Ensure session_state.json exists in src/desktop/modern/")

def check_session_file():
    """Check if session file exists and show its content."""
    print("\n" + "=" * 80)
    print("  Session File Status")
    print("=" * 80)
    
    session_file = Path("src/desktop/modern/session_state.json")
    
    if session_file.exists():
        print(f"✅ Session file exists: {session_file}")
        print(f"📊 File size: {session_file.stat().st_size} bytes")
        print(f"📅 Last modified: {time.ctime(session_file.stat().st_mtime)}")
        
        try:
            import json
            with open(session_file, 'r') as f:
                session_data = json.load(f)
            
            current_sequence = session_data.get("current_sequence", {})
            if current_sequence.get("sequence_id"):
                print(f"\n📋 Session contains sequence:")
                print(f"   ID: {current_sequence['sequence_id']}")
                
                sequence_data = current_sequence.get("sequence_data", {})
                if sequence_data:
                    print(f"   Name: {sequence_data.get('name', 'Unknown')}")
                    print(f"   Beats: {len(sequence_data.get('beats', []))}")
                
                print("\n✅ Session file is ready for restoration testing")
            else:
                print("\nℹ️ Session file exists but contains no sequence")
                print("   This is normal if no sequence has been created yet")
        
        except Exception as e:
            print(f"\n⚠️ Could not read session file: {e}")
    
    else:
        print(f"ℹ️ No session file found: {session_file}")
        print("   This is normal if TKA hasn't been run yet or no sequences created")

def main():
    """Main monitoring function."""
    print("🔍 TKA Session Restoration Monitoring Tool")
    print("   Use this to verify that session restoration is working correctly")
    
    # Check session file status
    check_session_file()
    
    # Show monitoring instructions
    monitor_tka_startup()
    
    print("\n" + "=" * 80)
    print("  Ready for Testing")
    print("=" * 80)
    
    print("🚀 You can now start TKA and watch for the debug messages!")
    print("   The session restoration system should be working correctly.")
    
    print("\n📝 Testing Workflow:")
    print("   1. Start TKA: python main.py")
    print("   2. Select 'TKA Desktop (Modern)'")
    print("   3. Watch console for [ORCHESTRATOR] and [LIFECYCLE] messages")
    print("   4. Create a sequence with 2-3 beats")
    print("   5. Watch for [SESSION] messages when sequence is created")
    print("   6. Close TKA completely")
    print("   7. Restart TKA and watch for restoration messages")
    print("   8. Verify sequence appears in beat frame")
    
    print("\n✅ If all messages appear and sequences persist, the system is working!")

if __name__ == "__main__":
    main()
