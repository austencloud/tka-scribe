#!/usr/bin/env python3
"""
Debug Conversion Process

This script tests the legacy to modern conversion process
to see if motion data is being properly converted.
"""

import json
import sys
from pathlib import Path

# Add modern/src to path for imports
modern_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(modern_src_path))

def read_current_sequence():
    """Read the current sequence from the persistence file."""
    try:
        sequence_file = Path("src/desktop/modern/current_sequence.json")
        if sequence_file.exists():
            with open(sequence_file, 'r') as f:
                data = json.load(f)
            return data
        else:
            print("❌ No current_sequence.json found")
            return None
    except Exception as e:
        print(f"❌ Error reading sequence: {e}")
        return None

def test_conversion_process():
    """Test the complete conversion process from legacy to modern format."""
    print("🔧 TESTING CONVERSION PROCESS")
    print("=" * 50)
    
    try:
        from application.services.data.legacy_to_modern_converter import LegacyToModernConverter
        from application.services.option_picker.option_orientation_updater import OptionOrientationUpdater
        
        # Read current sequence
        sequence_data = read_current_sequence()
        if not sequence_data:
            print("❌ No sequence data to test")
            return
            
        print(f"✅ Loaded sequence with {len(sequence_data)} items")
        
        # Test the conversion process
        if isinstance(sequence_data, list) and len(sequence_data) > 1:
            converter = LegacyToModernConverter()
            updater = OptionOrientationUpdater()
            
            # Test conversion of each beat
            converted_beats = []
            
            for i, beat_dict in enumerate(sequence_data[1:], 1):
                if 'letter' in beat_dict and beat_dict.get('beat', 0) > 0:
                    print(f"\n📊 TESTING BEAT {i}: {beat_dict.get('letter', '?')}")
                    print("-" * 40)
                    
                    # Show raw legacy data
                    blue_attrs = beat_dict.get('blue_attributes', {})
                    red_attrs = beat_dict.get('red_attributes', {})
                    
                    print(f"📋 Raw Legacy Data:")
                    print(f"   Blue attributes: {blue_attrs}")
                    print(f"   Red attributes: {red_attrs}")
                    print(f"   Blue end_ori: {blue_attrs.get('end_ori', 'None')}")
                    print(f"   Red end_ori: {red_attrs.get('end_ori', 'None')}")
                    
                    # Test conversion
                    try:
                        converted_beat = converter.convert_legacy_to_beat_data(beat_dict, i)
                        converted_beats.append(converted_beat)
                        
                        print(f"\n✅ CONVERSION SUCCESSFUL!")
                        print(f"   Beat number: {converted_beat.beat_number}")
                        print(f"   Letter: {converted_beat.letter}")
                        print(f"   Blue motion exists: {converted_beat.blue_motion is not None}")
                        print(f"   Red motion exists: {converted_beat.red_motion is not None}")
                        
                        if converted_beat.blue_motion:
                            print(f"   🔵 Blue Motion Details:")
                            print(f"      Motion type: {converted_beat.blue_motion.motion_type}")
                            print(f"      Start ori: {converted_beat.blue_motion.start_ori}")
                            print(f"      End ori: {converted_beat.blue_motion.end_ori}")
                            print(f"      Start loc: {converted_beat.blue_motion.start_loc}")
                            print(f"      End loc: {converted_beat.blue_motion.end_loc}")
                            print(f"      Turns: {converted_beat.blue_motion.turns}")
                        
                        if converted_beat.red_motion:
                            print(f"   🔴 Red Motion Details:")
                            print(f"      Motion type: {converted_beat.red_motion.motion_type}")
                            print(f"      Start ori: {converted_beat.red_motion.start_ori}")
                            print(f"      End ori: {converted_beat.red_motion.end_ori}")
                            print(f"      Start loc: {converted_beat.red_motion.start_loc}")
                            print(f"      End loc: {converted_beat.red_motion.end_loc}")
                            print(f"      Turns: {converted_beat.red_motion.turns}")
                        
                        # Test orientation extraction
                        blue_end_ori, red_end_ori = updater._extract_end_orientations_from_beat(converted_beat)
                        
                        print(f"\n🎯 ORIENTATION EXTRACTION:")
                        print(f"   Extracted blue end_ori: {blue_end_ori}")
                        print(f"   Extracted red end_ori: {red_end_ori}")
                        
                        # Compare with original
                        original_blue_end = blue_attrs.get('end_ori')
                        original_red_end = red_attrs.get('end_ori')
                        
                        print(f"\n📊 COMPARISON:")
                        print(f"   Original → Extracted")
                        print(f"   Blue: {original_blue_end} → {blue_end_ori}")
                        print(f"   Red: {original_red_end} → {red_end_ori}")
                        
                        # Check if conversion preserved data
                        blue_match = str(blue_end_ori) == str(original_blue_end)
                        red_match = str(red_end_ori) == str(original_red_end)
                        
                        if blue_match and red_match:
                            print("   ✅ PERFECT MATCH - Conversion working correctly!")
                        else:
                            print("   ⚠️ MISMATCH DETECTED!")
                            if not blue_match:
                                print(f"      Blue mismatch: {original_blue_end} ≠ {blue_end_ori}")
                            if not red_match:
                                print(f"      Red mismatch: {original_red_end} ≠ {red_end_ori}")
                        
                    except Exception as e:
                        print(f"   ❌ CONVERSION FAILED: {e}")
                        import traceback
                        traceback.print_exc()
                        
            # Test sequence-level operations
            if converted_beats:
                print(f"\n🔗 TESTING SEQUENCE-LEVEL OPERATIONS")
                print("=" * 50)
                
                # Create a mock sequence object
                mock_sequence = type('MockSequence', (), {
                    'beats': converted_beats,
                    'length': len(converted_beats)
                })()
                
                print(f"✅ Created mock sequence with {len(converted_beats)} beats")
                
                # Test orientation extraction from last beat
                if converted_beats:
                    last_beat = converted_beats[-1]
                    blue_end_ori, red_end_ori = updater._extract_end_orientations_from_beat(last_beat)
                    
                    print(f"🎯 Last beat orientation extraction:")
                    print(f"   Last beat letter: {last_beat.letter}")
                    print(f"   Blue end orientation: {blue_end_ori}")
                    print(f"   Red end orientation: {red_end_ori}")
                    
                    if blue_end_ori and red_end_ori:
                        print("   ✅ Successfully extracted orientations from sequence!")
                        print("   🎉 This means orientation updates should work!")
                    else:
                        print("   ❌ Failed to extract orientations - this is the problem!")
                        
        else:
            print("❌ Invalid sequence format")
            
    except Exception as e:
        print(f"❌ Error testing conversion: {e}")
        import traceback
        traceback.print_exc()

def test_sequence_loading_in_app():
    """Test how the sequence is actually loaded in the application."""
    print("\n🔍 TESTING SEQUENCE LOADING IN APP")
    print("=" * 50)
    
    try:
        from application.services.sequence.loader import SequenceLoader
        from application.services.data.sequence_data_converter import SequenceDataConverter
        
        # Create converter
        converter = SequenceDataConverter()
        
        # Create loader (without dependencies for testing)
        loader = SequenceLoader(
            workbench_getter=None,
            workbench_setter=None, 
            data_converter=converter
        )
        
        # Read sequence data
        sequence_data = loader.persistence_service.load_current_sequence()
        print(f"✅ Loaded sequence data: {len(sequence_data)} items")
        
        if len(sequence_data) > 1:
            # Test conversion of first beat
            beat_dict = None
            for item in sequence_data[1:]:
                if 'letter' in item and item.get('beat', 0) > 0:
                    beat_dict = item
                    break
                    
            if beat_dict:
                print(f"🔍 Testing conversion of beat: {beat_dict.get('letter', '?')}")
                
                converted_beat = converter.convert_legacy_to_beat_data(beat_dict, 1)
                
                print(f"✅ Conversion result:")
                print(f"   Letter: {converted_beat.letter}")
                print(f"   Blue motion: {converted_beat.blue_motion}")
                print(f"   Red motion: {converted_beat.red_motion}")
                
                if converted_beat.blue_motion:
                    print(f"   Blue end_ori: {converted_beat.blue_motion.end_ori}")
                if converted_beat.red_motion:
                    print(f"   Red end_ori: {converted_beat.red_motion.end_ori}")
                    
                print("✅ App-level conversion test complete!")
            else:
                print("❌ No valid beats found in sequence")
        else:
            print("❌ Empty sequence")
            
    except Exception as e:
        print(f"❌ Error testing app sequence loading: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🚀 CONVERSION PROCESS DEBUGGER")
    print("=" * 60)
    
    # Test conversion process
    test_conversion_process()
    
    # Test app-level loading
    test_sequence_loading_in_app()
    
    print("\n🏁 DEBUGGING COMPLETE!")
    print("=" * 30)
