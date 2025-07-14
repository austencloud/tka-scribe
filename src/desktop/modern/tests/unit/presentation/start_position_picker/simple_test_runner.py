"""
Simple test runner script for Copilot agent.

This script provides an easy entry point for running all tests
and getting actionable feedback for fixing issues.
"""
import os
import sys
import subprocess
from pathlib import Path


def main():
    """Simple test runner for the enhanced start position picker."""
    
    print("🚀 Enhanced Start Position Picker - Test Runner")
    print("=" * 60)
    
    # Find project root
    current_dir = Path(__file__).parent
    project_root = current_dir.parent.parent.parent.parent.parent
    
    print(f"📁 Project Root: {project_root}")
    print(f"🧪 Test Directory: {current_dir}")
    
    # Change to project root
    os.chdir(project_root)
    
    # Run comprehensive tests
    test_script = current_dir / "run_comprehensive_tests.py"
    
    print("\n🔍 Running comprehensive test suite...")
    print("-" * 40)
    
    try:
        result = subprocess.run([
            sys.executable, str(test_script), str(project_root)
        ], capture_output=False, text=True)
        
        if result.returncode == 0:
            print("\n✅ All tests passed! The enhanced start position picker is ready.")
        else:
            print("\n❌ Some tests failed. Check the output above for details.")
            print("\n💡 Next steps:")
            print("   1. Review the test_report.json file for detailed results")
            print("   2. Fix any critical errors first")
            print("   3. Address failing tests one by one")
            print("   4. Re-run tests after each fix")
        
        return result.returncode
        
    except Exception as e:
        print(f"\n💥 Test runner failed: {e}")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
