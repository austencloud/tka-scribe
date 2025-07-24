#!/usr/bin/env python3
"""
Full workflow test for Save Image functionality.
This simulates the complete flow from button click to image export.
"""

import sys
import logging
from pathlib import Path

# Add src to Python path
project_root = Path(__file__).parent
src_path = project_root / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

# Set up logging to see debug messages
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def test_full_save_image_workflow():
    """Test the complete Save Image workflow."""
    print("🚀 Testing Full Save Image Workflow")
    print("=" * 50)
    
    try:
        # Step 1: Create a realistic sequence with pictograph data
        print("\n📊 Step 1: Creating realistic sequence...")
        from domain.models.sequence_data import SequenceData
        from domain.models.beat_data import BeatData
        
        # Create beats with some metadata
        beat1 = BeatData(
            beat_number=1, 
            is_blank=False,
            metadata={'letter': 'A', 'start_pos': 'alpha', 'end_pos': 'beta'}
        )
        beat2 = BeatData(
            beat_number=2, 
            is_blank=False,
            metadata={'letter': 'B', 'start_pos': 'beta', 'end_pos': 'gamma'}
        )
        
        sequence = SequenceData(
            name="Test Sequence",
            word="HELLO",
            beats=[beat1, beat2]
        )
        
        print(f"✅ Created sequence: {sequence.name}, word='{sequence.word}', length={sequence.length}")
        
        # Step 2: Set up the complete service stack
        print("\n🔧 Step 2: Setting up service stack...")
        from application.services.workbench.workbench_state_manager import WorkbenchStateManager
        from application.services.workbench.workbench_export_service import WorkbenchExportService
        from application.services.workbench.workbench_operation_coordinator import WorkbenchOperationCoordinator
        
        # Create state manager and set sequence
        state_manager = WorkbenchStateManager()
        result = state_manager.set_sequence(sequence)
        print(f"✅ State manager: sequence set = {result.changed}")
        
        # Create export service
        export_service = WorkbenchExportService()
        print(f"✅ Export service: directory = {export_service.get_export_directory()}")
        
        # Create coordinator
        coordinator = WorkbenchOperationCoordinator(
            workbench_state_manager=state_manager,
            export_service=export_service
        )
        print(f"✅ Coordinator created with all dependencies")
        
        # Step 3: Test the complete save image operation
        print("\n🖼️ Step 3: Testing complete save image operation...")
        
        print("📋 Pre-operation checks:")
        print(f"  - Has sequence: {state_manager.has_sequence()}")
        print(f"  - Export service available: {coordinator._export_service is not None}")
        print(f"  - Sequence length: {sequence.length}")
        print(f"  - Sequence word: {sequence.word}")
        
        print("\n🔄 Executing save image operation...")
        result = coordinator.save_image()
        
        print(f"\n📊 Operation Result:")
        print(f"  - Success: {result.success}")
        print(f"  - Message: {result.message}")
        print(f"  - Operation Type: {result.operation_type}")
        
        if result.error_details:
            print(f"  - Error Details: {result.error_details}")
        
        if result.success:
            print("✅ Save Image operation completed successfully!")
            
            # Check if file was created
            export_dir = Path(export_service.get_export_directory())
            png_files = list(export_dir.glob("*.png"))
            
            print(f"\n📁 Export directory: {export_dir}")
            print(f"📄 PNG files found: {len(png_files)}")
            
            if png_files:
                latest_file = max(png_files, key=lambda f: f.stat().st_mtime)
                print(f"📄 Latest exported file: {latest_file.name}")
                print(f"📏 File size: {latest_file.stat().st_size} bytes")
                
                if latest_file.stat().st_size > 0:
                    print("✅ File has content - export appears successful!")
                    return True
                else:
                    print("❌ File is empty - export may have failed")
                    return False
            else:
                print("❌ No PNG files found in export directory")
                return False
        else:
            print(f"❌ Save Image operation failed: {result.message}")
            return False
        
    except Exception as e:
        print(f"💥 Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_export_service_directly():
    """Test the export service directly to isolate issues."""
    print("\n🔧 Testing Export Service Directly")
    print("=" * 50)
    
    try:
        from domain.models.sequence_data import SequenceData
        from domain.models.beat_data import BeatData
        from application.services.workbench.workbench_export_service import WorkbenchExportService
        
        # Create test sequence
        beat1 = BeatData(beat_number=1, is_blank=False)
        beat2 = BeatData(beat_number=2, is_blank=False)
        sequence = SequenceData(name="Direct Test", word="DIRECT", beats=[beat1, beat2])
        
        # Create export service
        export_service = WorkbenchExportService()
        
        # Test direct export with specific file path
        test_file = Path(export_service.get_export_directory()) / "direct_test.png"
        
        print(f"📁 Testing direct export to: {test_file}")
        
        success, message = export_service.export_sequence_image(sequence, str(test_file))
        
        print(f"📊 Direct export result: success={success}")
        print(f"📊 Message: {message}")
        
        if success and test_file.exists():
            print(f"✅ Direct export successful! File size: {test_file.stat().st_size} bytes")
            return True
        else:
            print(f"❌ Direct export failed or file not created")
            return False
            
    except Exception as e:
        print(f"💥 Direct export test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🎯 Save Image Full Workflow Test")
    
    # Test 1: Full workflow
    success1 = test_full_save_image_workflow()
    
    # Test 2: Direct export service
    success2 = test_export_service_directly()
    
    overall_success = success1 and success2
    
    print(f"\n{'🎉 ALL TESTS PASSED' if overall_success else '💥 SOME TESTS FAILED'}")
    
    if overall_success:
        print("\n✅ Save Image functionality is working correctly!")
        print("✅ The button should now work in the application")
        print("✅ Images will be saved to the exports directory")
    else:
        print("\n❌ Issues found with Save Image functionality")
        if not success1:
            print("❌ Full workflow has issues")
        if not success2:
            print("❌ Direct export has issues")
    
    sys.exit(0 if overall_success else 1)
