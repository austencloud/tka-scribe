#!/usr/bin/env python3
"""
Session Data Diagnostic Tool

Analyzes the current session data to identify specific issues with sequence
restoration without creating any fabricated data. Focuses on data integrity
and structural problems.
"""

import json
from pathlib import Path
from datetime import datetime

def analyze_session_structure():
    """Analyze the session file structure and identify issues."""
    print("🔍 Session Data Structure Analysis")
    print("=" * 60)
    
    session_file = Path("src/desktop/modern/session_state.json")
    
    if not session_file.exists():
        print("❌ CRITICAL: No session file found")
        print("   Expected location: src/desktop/modern/session_state.json")
        return False
    
    try:
        with open(session_file, 'r') as f:
            session_data = json.load(f)
        
        print("✅ Session file loaded successfully")
        print(f"   File size: {session_file.stat().st_size} bytes")
        print(f"   Last modified: {datetime.fromtimestamp(session_file.stat().st_mtime)}")
        
        # Analyze top-level structure
        print(f"\n📊 Top-level structure:")
        for key in session_data.keys():
            print(f"   - {key}: {type(session_data[key]).__name__}")
        
        # Analyze current_sequence
        current_sequence = session_data.get("current_sequence")
        if not current_sequence:
            print("\n❌ ISSUE: No 'current_sequence' found in session")
            return False
        
        print(f"\n📋 Current sequence structure:")
        for key in current_sequence.keys():
            value = current_sequence[key]
            print(f"   - {key}: {type(value).__name__}")
        
        # Analyze sequence_data
        sequence_data = current_sequence.get("sequence_data")
        if not sequence_data:
            print("\n❌ ISSUE: No 'sequence_data' found in current_sequence")
            return False
        
        print(f"\n📝 Sequence data:")
        print(f"   ID: {sequence_data.get('id', 'MISSING')}")
        print(f"   Name: {sequence_data.get('name', 'MISSING')}")
        print(f"   Word: {sequence_data.get('word', 'MISSING')}")
        print(f"   Start position: {sequence_data.get('start_position', 'MISSING')}")
        
        # Analyze beats array
        beats = sequence_data.get("beats", [])
        print(f"\n🎵 Beats analysis:")
        print(f"   Beat count: {len(beats)}")
        
        if not beats:
            print("   ❌ ISSUE: No beats found in sequence")
            return False
        
        # Analyze each beat
        start_position_found = False
        regular_beats = []
        
        for i, beat in enumerate(beats):
            beat_num = beat.get('beat_number', 'MISSING')
            letter = beat.get('letter', 'MISSING')
            duration = beat.get('duration', 'MISSING')
            
            # Check if this is a start position
            metadata = beat.get('metadata', {})
            is_start_position = metadata.get('is_start_position', False)
            
            if is_start_position:
                start_position_found = True
                print(f"   Beat {i}: START POSITION")
                print(f"      Beat number: {beat_num}")
                print(f"      Letter: {letter}")
                print(f"      Duration: {duration}")
            else:
                regular_beats.append((i, beat_num, letter))
                print(f"   Beat {i}: REGULAR BEAT #{beat_num} '{letter}' (duration: {duration})")
            
            # Analyze motion data
            blue_motion = beat.get('blue_motion')
            red_motion = beat.get('red_motion')
            
            if blue_motion:
                blue_type = blue_motion.get('motion_type', 'MISSING')
                blue_start = blue_motion.get('start_loc', 'MISSING')
                blue_end = blue_motion.get('end_loc', 'MISSING')
                blue_turns = blue_motion.get('turns', 'MISSING')
                print(f"      Blue: {blue_type} {blue_start}→{blue_end} (turns: {blue_turns})")
            else:
                print(f"      Blue: MISSING")
            
            if red_motion:
                red_type = red_motion.get('motion_type', 'MISSING')
                red_start = red_motion.get('start_loc', 'MISSING')
                red_end = red_motion.get('end_loc', 'MISSING')
                red_turns = red_motion.get('turns', 'MISSING')
                print(f"      Red: {red_type} {red_start}→{red_end} (turns: {red_turns})")
            else:
                print(f"      Red: MISSING")
        
        # Issue analysis
        print(f"\n🚨 Issue Analysis:")
        issues_found = []
        
        # Check for start position
        if not start_position_found:
            issues_found.append("No start position beat found in beats array")
            print("   ❌ MISSING START POSITION: No beat with is_start_position=True")
        
        # Check beat numbering
        expected_regular_beat_num = 1
        for i, beat_num, letter in regular_beats:
            if beat_num != expected_regular_beat_num:
                issues_found.append(f"Beat numbering issue: beat {i} has number {beat_num}, expected {expected_regular_beat_num}")
                print(f"   ❌ BEAT NUMBERING: Beat {i} has number {beat_num}, expected {expected_regular_beat_num}")
            expected_regular_beat_num += 1
        
        # Check for fabricated motion data
        for i, beat in enumerate(beats):
            blue_motion = beat.get('blue_motion', {})
            red_motion = beat.get('red_motion', {})
            
            blue_turns = blue_motion.get('turns', 0)
            red_turns = red_motion.get('turns', 0)
            
            # Flag non-zero turns as potentially fabricated
            if blue_turns != 0 or red_turns != 0:
                issues_found.append(f"Beat {i} has non-zero turns (blue: {blue_turns}, red: {red_turns})")
                print(f"   ⚠️  POTENTIAL FABRICATION: Beat {i} has turns (blue: {blue_turns}, red: {red_turns})")
        
        # Summary
        if issues_found:
            print(f"\n📋 Summary: {len(issues_found)} issues found")
            for issue in issues_found:
                print(f"   - {issue}")
        else:
            print(f"\n✅ Summary: No structural issues found")
        
        return len(issues_found) == 0
        
    except json.JSONDecodeError as e:
        print(f"❌ CRITICAL: Invalid JSON in session file")
        print(f"   Error: {e}")
        return False
    except Exception as e:
        print(f"❌ CRITICAL: Failed to analyze session file")
        print(f"   Error: {e}")
        return False

def compare_with_legacy_format():
    """Compare current session format with legacy format expectations."""
    print("\n🔄 Legacy Format Compatibility Analysis")
    print("=" * 60)
    
    print("Legacy format expects:")
    print("   [0] = Metadata object (word, author, level, etc.)")
    print("   [1] = Start position (beat: 0, sequence_start_position: 'alpha')")
    print("   [2+] = Regular beats (beat: 1, 2, 3...)")
    
    print("\nModern format uses:")
    print("   sequence_data.beats = Array of BeatData objects")
    print("   sequence_data.start_position = String field")
    
    print("\n⚠️  FORMAT MISMATCH IDENTIFIED:")
    print("   - Legacy expects start position as array element [1]")
    print("   - Modern stores start position as separate field")
    print("   - This mismatch likely causes restoration issues")

def suggest_fixes():
    """Suggest specific fixes based on analysis."""
    print("\n🔧 Suggested Fixes")
    print("=" * 60)
    
    print("1. START POSITION HANDLING:")
    print("   - Ensure start position is stored as BeatData with beat_number=0")
    print("   - Mark with metadata: {'is_start_position': True}")
    print("   - Place as first element in beats array")
    
    print("\n2. BEAT INDEXING:")
    print("   - Start position: beat_number=0, array index=0")
    print("   - Regular beats: beat_number=1,2,3..., array index=1,2,3...")
    
    print("\n3. DATA INTEGRITY:")
    print("   - Never fabricate motion data")
    print("   - Preserve exact user-created values")
    print("   - Use turns=0.0 for static motions only")
    
    print("\n4. VALIDATION:")
    print("   - Update SequenceData validation to allow beat_number=0")
    print("   - Ensure start position validation logic")
    print("   - Test with real user sequences, not fabricated data")

def main():
    """Main diagnostic function."""
    print("🩺 TKA Session Data Diagnostic Tool")
    print("   Analyzes current session data for restoration issues")
    print("   Does NOT create or modify any data")
    
    # Analyze current session
    structure_ok = analyze_session_structure()
    
    # Compare with legacy expectations
    compare_with_legacy_format()
    
    # Suggest fixes
    suggest_fixes()
    
    # Final recommendation
    print("\n📋 RECOMMENDATION:")
    if structure_ok:
        print("   ✅ Session structure looks good")
        print("   🔍 Run real sequence persistence test to verify restoration")
    else:
        print("   ❌ Session structure has issues")
        print("   🔧 Fix identified issues before testing restoration")
        print("   🚫 Do NOT create fabricated test data")
    
    print(f"\n📄 Next steps:")
    print(f"   1. Fix any structural issues identified above")
    print(f"   2. Run: python test_real_sequence_persistence.py")
    print(f"   3. Test with actual user-created sequences")

if __name__ == "__main__":
    main()
