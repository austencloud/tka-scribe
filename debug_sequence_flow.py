#!/usr/bin/env python3
"""
Debug Sequence Flow

This script traces the sequence flow from workbench to option picker
to identify where motion data is getting lost.
"""

import json
import sys
from pathlib import Path

# Add modern/src to path for imports
modern_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(modern_src_path))

def test_workbench_sequence():
    """Test getting sequence from workbench."""
    print("🔍 TESTING WORKBENCH SEQUENCE")
    print("=" * 50)
    
    try:
        # Import the main window to get workbench
        from presentation.main_window import MainWindow
        from PyQt6.QtWidgets import QApplication
        import sys
        
        # Create QApplication if it doesn't exist
        app = QApplication.instance()
        if app is None:
            app = QApplication(sys.argv)
        
        # Create main window
        main_window = MainWindow()
        
        # Get workbench
        workbench = main_window.construct_tab.workbench
        
        if workbench:
            print("✅ Got workbench instance")
            
            # Get sequence from workbench
            sequence = workbench.get_sequence()
            
            if sequence:
                print(f"✅ Got sequence from workbench: {sequence.name}")
                print(f"   Sequence ID: {sequence.id}")
                print(f"   Number of beats: {len(sequence.beats)}")
                
                # Check motion data in beats
                for i, beat in enumerate(sequence.beats[:3]):  # Check first 3 beats
                    print(f"\n   Beat {i+1}: {beat.letter}")
                    print(f"      Blue motion: {beat.blue_motion}")
                    print(f"      Red motion: {beat.red_motion}")
                    
                    if beat.blue_motion:
                        print(f"      Blue end_ori: {beat.blue_motion.end_ori}")
                    if beat.red_motion:
                        print(f"      Red end_ori: {beat.red_motion.end_ori}")
                
                return sequence
            else:
                print("❌ No sequence in workbench")
                return None
        else:
            print("❌ No workbench found")
            return None
            
    except Exception as e:
        print(f"❌ Error testing workbench sequence: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_sequence_loader():
    """Test the sequence loader's get_current_sequence_from_workbench method."""
    print("\n🔍 TESTING SEQUENCE LOADER")
    print("=" * 50)
    
    try:
        from application.services.sequence.loader import SequenceLoader
        from application.services.data.sequence_data_converter import SequenceDataConverter
        
        # Create a mock workbench getter
        def mock_workbench_getter():
            # This would normally return the actual workbench
            # For testing, we'll return None and handle it
            return None
        
        # Create converter and loader
        converter = SequenceDataConverter()
        loader = SequenceLoader(
            workbench_getter=mock_workbench_getter,
            workbench_setter=None,
            data_converter=converter
        )
        
        # Test getting sequence from workbench (will be None with mock)
        sequence = loader.get_current_sequence_from_workbench()
        print(f"Sequence from loader: {sequence}")
        
        # Test loading from persistence and converting
        print("\n🔧 Testing persistence loading and conversion:")
        sequence_data = loader.persistence_service.load_current_sequence()
        print(f"Raw sequence data: {len(sequence_data)} items")
        
        if len(sequence_data) > 1:
            # Test conversion of first beat
            for item in sequence_data[1:]:
                if 'letter' in item and item.get('beat', 0) > 0:
                    print(f"\nTesting conversion of beat: {item.get('letter', '?')}")
                    
                    converted_beat = converter.convert_legacy_to_beat_data(item, 1)
                    print(f"Converted beat:")
                    print(f"   Letter: {converted_beat.letter}")
                    print(f"   Blue motion: {converted_beat.blue_motion}")
                    print(f"   Red motion: {converted_beat.red_motion}")
                    
                    if converted_beat.blue_motion:
                        print(f"   Blue end_ori: {converted_beat.blue_motion.end_ori}")
                    if converted_beat.red_motion:
                        print(f"   Red end_ori: {converted_beat.red_motion.end_ori}")
                    
                    break
        
    except Exception as e:
        print(f"❌ Error testing sequence loader: {e}")
        import traceback
        traceback.print_exc()

def test_option_picker_flow():
    """Test the complete option picker flow."""
    print("\n🔍 TESTING OPTION PICKER FLOW")
    print("=" * 50)
    
    try:
        from application.services.option_picker.orchestrator import OptionPickerOrchestrator
        from application.services.option_picker.option_orientation_updater import OptionOrientationUpdater
        from application.services.data.sequence_data_converter import SequenceDataConverter
        from domain.models.sequence_models import SequenceData
        
        # Create a test sequence with proper motion data
        converter = SequenceDataConverter()
        
        # Load and convert a beat from persistence
        from application.services.sequence.sequence_persister import SequencePersister
        persister = SequencePersister()
        sequence_data = persister.load_current_sequence()
        
        if len(sequence_data) > 1:
            # Convert first beat
            beat_dict = None
            for item in sequence_data[1:]:
                if 'letter' in item and item.get('beat', 0) > 0:
                    beat_dict = item
                    break
            
            if beat_dict:
                print(f"Creating test sequence with beat: {beat_dict.get('letter', '?')}")
                
                converted_beat = converter.convert_legacy_to_beat_data(beat_dict, 1)
                test_sequence = SequenceData(
                    id="test_sequence",
                    name="Test Sequence",
                    beats=[converted_beat]
                )
                
                print(f"Test sequence created:")
                print(f"   Beats: {len(test_sequence.beats)}")
                print(f"   First beat letter: {test_sequence.beats[0].letter}")
                print(f"   First beat blue motion: {test_sequence.beats[0].blue_motion}")
                print(f"   First beat red motion: {test_sequence.beats[0].red_motion}")
                
                # Test orientation updater
                updater = OptionOrientationUpdater()
                last_beat = updater._get_last_valid_beat(test_sequence)
                
                if last_beat:
                    print(f"\n✅ Got last valid beat: {last_beat.letter}")
                    blue_end_ori, red_end_ori = updater._extract_end_orientations(last_beat)
                    print(f"   Extracted orientations:")
                    print(f"   Blue: {blue_end_ori}")
                    print(f"   Red: {red_end_ori}")
                    
                    if blue_end_ori and red_end_ori:
                        print("✅ Orientation extraction working correctly!")
                    else:
                        print("❌ Failed to extract orientations")
                else:
                    print("❌ No valid last beat found")
        
    except Exception as e:
        print(f"❌ Error testing option picker flow: {e}")
        import traceback
        traceback.print_exc()

def compare_persistence_vs_workbench():
    """Compare sequence data from persistence vs workbench."""
    print("\n🔍 COMPARING PERSISTENCE VS WORKBENCH")
    print("=" * 60)
    
    try:
        # Get from persistence
        from application.services.sequence.sequence_persister import SequencePersister
        persister = SequencePersister()
        persistence_data = persister.load_current_sequence()
        
        print(f"📁 Persistence data: {len(persistence_data)} items")
        if len(persistence_data) > 1:
            first_beat = persistence_data[1]
            if 'letter' in first_beat:
                print(f"   First beat letter: {first_beat.get('letter', '?')}")
                print(f"   Blue attributes: {first_beat.get('blue_attributes', {})}")
                print(f"   Red attributes: {first_beat.get('red_attributes', {})}")
        
        # Get from workbench (if available)
        workbench_sequence = test_workbench_sequence()
        
        if workbench_sequence:
            print(f"\n🖥️ Workbench sequence: {len(workbench_sequence.beats)} beats")
            if workbench_sequence.beats:
                first_beat = workbench_sequence.beats[0]
                print(f"   First beat letter: {first_beat.letter}")
                print(f"   Blue motion: {first_beat.blue_motion}")
                print(f"   Red motion: {first_beat.red_motion}")
        else:
            print("\n🖥️ No workbench sequence available")
        
    except Exception as e:
        print(f"❌ Error comparing persistence vs workbench: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🚀 SEQUENCE FLOW DEBUGGER")
    print("=" * 60)
    
    # Test sequence loader
    test_sequence_loader()
    
    # Test option picker flow
    test_option_picker_flow()
    
    # Compare persistence vs workbench
    compare_persistence_vs_workbench()
    
    print("\n🏁 DEBUGGING COMPLETE!")
    print("=" * 30)
