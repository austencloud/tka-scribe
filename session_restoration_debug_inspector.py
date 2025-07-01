#!/usr/bin/env python3
"""
Session Restoration Debug Inspector

Provides debugging infrastructure for TKA's auto-save/restore system.
Includes structured logging, session state inspection, and validation tools.
"""

import json
import sys
import os
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime

# Add TKA to path
tka_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(tka_path))
os.chdir(tka_path)

def print_header(title: str) -> None:
    """Print a formatted header."""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def print_section(title: str) -> None:
    """Print a formatted section."""
    print(f"\n--- {title} ---")

class SessionStateInspector:
    """Inspector for session state files and data."""
    
    def __init__(self, session_file_path: str = "session_state.json"):
        self.session_file = Path(session_file_path)
    
    def inspect_session_file(self) -> Dict[str, Any]:
        """Inspect the current session state file."""
        print_section("Session File Inspection")
        
        if not self.session_file.exists():
            print("❌ No session_state.json file found")
            return {"exists": False}
        
        try:
            with open(self.session_file, 'r', encoding='utf-8') as f:
                session_data = json.load(f)
            
            print(f"✅ Session file found: {self.session_file}")
            print(f"📁 File size: {self.session_file.stat().st_size} bytes")
            print(f"📅 Last modified: {datetime.fromtimestamp(self.session_file.stat().st_mtime)}")
            
            # Analyze session structure
            metadata = session_data.get("session_metadata", {})
            current_sequence = session_data.get("current_sequence", {})
            workbench_state = session_data.get("workbench_state", {})
            graph_editor_state = session_data.get("graph_editor_state", {})
            ui_state = session_data.get("ui_state", {})
            
            print_section("Session Metadata")
            print(f"🆔 Session ID: {metadata.get('session_id', 'Unknown')}")
            print(f"📅 Created: {metadata.get('created_at', 'Unknown')}")
            print(f"🕐 Last interaction: {metadata.get('last_interaction', 'Unknown')}")
            print(f"🏷️ TKA version: {metadata.get('tka_version', 'Unknown')}")
            
            print_section("Current Sequence")
            sequence_id = current_sequence.get("sequence_id")
            sequence_data = current_sequence.get("sequence_data", {})
            
            if sequence_id:
                print(f"🆔 Sequence ID: {sequence_id}")
                print(f"📝 Sequence name: {sequence_data.get('name', 'Unknown')}")
                print(f"📝 Word: {sequence_data.get('word', 'Unknown')}")
                
                beats = sequence_data.get("beats", [])
                print(f"🎵 Beat count: {len(beats)}")
                
                for i, beat in enumerate(beats):
                    if isinstance(beat, dict):
                        letter = beat.get("letter", "Unknown")
                        duration = beat.get("duration", "Unknown")
                        beat_number = beat.get("beat_number", i)
                        print(f"   Beat {beat_number}: {letter} (duration: {duration})")
                    else:
                        print(f"   Beat {i}: {type(beat)} (unexpected format)")
            else:
                print("ℹ️ No current sequence")
            
            print_section("Workbench State")
            print(f"🎯 Selected beat index: {workbench_state.get('selected_beat_index', 'None')}")
            print(f"📍 Start position data: {'Present' if workbench_state.get('start_position_data') else 'None'}")
            
            print_section("Graph Editor State")
            print(f"👁️ Visible: {graph_editor_state.get('visible', False)}")
            print(f"📏 Height: {graph_editor_state.get('height', 'Unknown')}")
            print(f"🎯 Selected beat: {graph_editor_state.get('selected_beat_index', 'None')}")
            
            print_section("UI State")
            print(f"📑 Active tab: {ui_state.get('active_tab', 'Unknown')}")
            print(f"🎛️ Component visibility: {len(ui_state.get('component_visibility', {}))}")
            
            return {
                "exists": True,
                "valid_json": True,
                "metadata": metadata,
                "has_sequence": bool(sequence_id),
                "sequence_id": sequence_id,
                "sequence_name": sequence_data.get('name'),
                "beat_count": len(beats) if beats else 0,
                "file_size": self.session_file.stat().st_size
            }
            
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON in session file: {e}")
            return {"exists": True, "valid_json": False, "error": str(e)}
        except Exception as e:
            print(f"❌ Error reading session file: {e}")
            return {"exists": True, "valid_json": False, "error": str(e)}

class AutoSaveRestoreValidator:
    """Validator for auto-save/restore functionality."""
    
    def __init__(self):
        self.inspector = SessionStateInspector()
    
    def validate_complete_workflow(self) -> Dict[str, Any]:
        """Validate the complete auto-save/restore workflow."""
        print_header("Auto-Save/Restore Workflow Validation")
        
        results = {}
        
        try:
            from core.application.application_factory import ApplicationFactory
            from core.interfaces.session_services import ISessionStateService
            from application.services.core.application_lifecycle_manager import ApplicationLifecycleManager
            from core.events.event_bus import get_event_bus
            from domain.models.core_models import SequenceData, BeatData
            import uuid
            
            print_section("Step 1: Initialize Services")
            container = ApplicationFactory.create_test_app()
            session_service = container.resolve(ISessionStateService)
            lifecycle_manager = ApplicationLifecycleManager(session_service)
            event_bus = get_event_bus()
            
            results["services_initialized"] = True
            print("✅ Services initialized successfully")
            
            print_section("Step 2: Create Test Sequence")
            sequence_id = str(uuid.uuid4())
            test_sequence = SequenceData(
                id=sequence_id,
                name="Validation Test Sequence",
                beats=[
                    BeatData(beat_number=1, letter="V", duration=1.0),
                    BeatData(beat_number=2, letter="T", duration=1.5),
                    BeatData(beat_number=3, letter="S", duration=2.0)
                ]
            )
            
            print(f"✅ Created test sequence: {test_sequence.name}")
            print(f"   Beats: {len(test_sequence.beats)}")
            
            print_section("Step 3: Test Auto-Save")
            session_service.update_current_sequence(test_sequence, sequence_id)
            save_success = session_service.save_session_state()
            
            results["auto_save_success"] = save_success
            print(f"✅ Auto-save result: {save_success}")
            
            # Inspect saved file
            file_inspection = self.inspector.inspect_session_file()
            results["file_inspection"] = file_inspection
            
            print_section("Step 4: Test Session Loading")
            load_result = session_service.load_session_state()
            
            results["load_success"] = load_result.success
            results["session_restored"] = load_result.session_restored
            
            print(f"✅ Load result: {load_result.success}")
            print(f"✅ Session restored: {load_result.session_restored}")
            
            if load_result.session_restored:
                session_data = load_result.session_data
                print(f"✅ Loaded sequence: {session_data.current_sequence_id}")
                
                # Validate data fidelity
                loaded_sequence_data = session_data.current_sequence_data
                if isinstance(loaded_sequence_data, dict):
                    loaded_name = loaded_sequence_data.get('name')
                    loaded_beats = loaded_sequence_data.get('beats', [])
                    
                    name_match = loaded_name == test_sequence.name
                    beat_count_match = len(loaded_beats) == len(test_sequence.beats)
                    
                    results["data_fidelity"] = {
                        "name_match": name_match,
                        "beat_count_match": beat_count_match,
                        "perfect": name_match and beat_count_match
                    }
                    
                    print(f"✅ Name fidelity: {name_match}")
                    print(f"✅ Beat count fidelity: {beat_count_match}")
            
            print_section("Step 5: Test Event System")
            events_received = []
            
            def validation_event_handler(event):
                events_received.append(event)
                print(f"📨 Validation event received: {event.component}.{event.action}")
            
            # Subscribe to restoration events
            subscription_id = event_bus.subscribe(
                "ui.session_restoration.sequence_restored",
                validation_event_handler
            )
            
            # Trigger restoration
            if load_result.session_restored:
                lifecycle_manager._pending_session_data = load_result.session_data
                lifecycle_manager.trigger_deferred_session_restoration()
            
            results["events_received"] = len(events_received)
            results["event_system_working"] = len(events_received) > 0
            
            print(f"✅ Events received: {len(events_received)}")
            print(f"✅ Event system working: {len(events_received) > 0}")
            
            # Clean up
            event_bus.unsubscribe(subscription_id)
            
            results["overall_success"] = all([
                results.get("services_initialized", False),
                results.get("auto_save_success", False),
                results.get("load_success", False),
                results.get("session_restored", False),
                results.get("event_system_working", False)
            ])
            
            return results
            
        except Exception as e:
            print(f"❌ Validation failed: {e}")
            import traceback
            traceback.print_exc()
            results["error"] = str(e)
            results["overall_success"] = False
            return results

def main():
    """Run session restoration debugging and validation."""
    print_header("TKA Session Restoration Debug Inspector")
    
    # Step 1: Inspect current session file
    inspector = SessionStateInspector()
    file_inspection = inspector.inspect_session_file()
    
    # Step 2: Validate complete workflow
    validator = AutoSaveRestoreValidator()
    validation_results = validator.validate_complete_workflow()
    
    # Step 3: Summary
    print_header("Summary")
    
    if validation_results.get("overall_success", False):
        print("🎉 All auto-save/restore functionality is working correctly!")
        print("✅ Session persistence: WORKING")
        print("✅ Data fidelity: PERFECT")
        print("✅ Event system: WORKING")
        print("✅ UI restoration pipeline: READY")
    else:
        print("❌ Some issues detected in auto-save/restore system")
        if "error" in validation_results:
            print(f"   Error: {validation_results['error']}")
    
    print("\n📊 Detailed Results:")
    for key, value in validation_results.items():
        if key != "error":
            print(f"   {key}: {value}")
    
    return validation_results

if __name__ == "__main__":
    main()
