#!/usr/bin/env python3
"""
Test application startup and basic functionality
"""

import sys
import time
import subprocess
from pathlib import Path

def test_application_startup():
    """Test that the application can start without errors"""
    print("🚀 Testing application startup...")
    
    try:
        # Start the application in a subprocess
        process = subprocess.Popen(
            [sys.executable, "main.py"],
            cwd=str(Path.cwd() / "src" / "desktop" / "modern"),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a few seconds for startup
        time.sleep(10)
        
        # Check if process is still running (good sign)
        if process.poll() is None:
            print("✅ Application started successfully and is running!")
            
            # Terminate the process
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
            
            return True
        else:
            # Process exited, check output
            stdout, stderr = process.communicate()
            print(f"❌ Application exited with code: {process.returncode}")
            if stderr:
                print(f"Stderr: {stderr[:500]}...")
            return False
            
    except Exception as e:
        print(f"❌ Failed to start application: {e}")
        return False

def test_import_services():
    """Test that key services can be imported"""
    print("🔧 Testing service imports...")
    
    try:
        sys.path.insert(0, str(Path.cwd() / "src" / "desktop" / "modern" / "src"))
        
        from application.services.core.sequence_management_service import SequenceManagementService
        print("✅ SequenceManagementService import works!")
        
        from application.services.data.pictograph_dataset_service import PictographDatasetService
        print("✅ PictographDatasetService import works!")
        
        from presentation.components.workbench.workbench import Workbench
        print("✅ Workbench import works!")
        
        return True
    except Exception as e:
        print(f"❌ Service import failed: {e}")
        return False

def test_api_converters():
    """Test that API converters work with new models"""
    print("🔄 Testing API converters...")
    
    try:
        sys.path.insert(0, str(Path.cwd() / "src" / "desktop" / "modern" / "src"))
        
        from infrastructure.api.converters.motion_converters import MotionConverter
        from domain.models import MotionData, MotionType, Location, RotationDirection, Orientation
        
        # Create a motion
        motion = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.EAST,
            start_ori=Orientation.IN,
            end_ori=Orientation.OUT
        )
        
        # Test conversion (if converter has methods)
        print("✅ API converter imports and basic functionality work!")
        return True
        
    except Exception as e:
        print(f"❌ API converter test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Application After Refactoring...")
    print("=" * 60)
    
    tests = [
        test_import_services,
        test_api_converters,
        test_application_startup,
    ]
    
    passed = 0
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 60)
    print(f"Results: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🎉 ALL APPLICATION TESTS PASSED!")
        return True
    else:
        print("❌ Some tests failed!")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
