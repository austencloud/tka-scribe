"""
Comprehensive Test Runner for Enhanced Start Position Picker

This script runs all tests for the enhanced start position picker system
and provides detailed reports for debugging and validation.
"""
import sys
import os
import subprocess
import json
import time
from pathlib import Path
from typing import Dict, List, Any, Optional
import importlib.util


class TestRunner:
    """Enhanced test runner with comprehensive reporting."""
    
    def __init__(self, project_root: Optional[str] = None):
        self.project_root = Path(project_root) if project_root else Path(__file__).parent.parent.parent.parent
        self.test_results = {}
        self.errors = []
        self.warnings = []
        
    def setup_environment(self) -> bool:
        """Set up the test environment."""
        try:
            # Add project root to Python path
            sys.path.insert(0, str(self.project_root))
            
            # Verify critical modules can be imported
            required_modules = [
                "PyQt6.QtWidgets",
                "PyQt6.QtCore", 
                "PyQt6.QtGui",
                "PyQt6.QtTest",
                "pytest"
            ]
            
            missing_modules = []
            for module in required_modules:
                try:
                    importlib.import_module(module)
                except ImportError:
                    missing_modules.append(module)
            
            if missing_modules:
                self.errors.append(f"Missing required modules: {missing_modules}")
                return False
                
            return True
            
        except Exception as e:
            self.errors.append(f"Environment setup failed: {e}")
            return False
    
    def check_file_structure(self) -> bool:
        """Check that all required files exist."""
        required_files = [
            "src/presentation/components/start_position_picker/enhanced_start_position_picker.py",
            "src/presentation/components/start_position_picker/variations_button.py", 
            "src/presentation/components/start_position_picker/advanced_start_position_picker.py",
            "src/presentation/components/start_position_picker/enhanced_start_position_option.py",
            "tests/unit/presentation/start_position_picker/test_enhanced_start_position_picker.py",
            "tests/unit/presentation/start_position_picker/test_integration.py"
        ]
        
        missing_files = []
        for file_path in required_files:
            full_path = self.project_root / file_path
            if not full_path.exists():
                missing_files.append(str(file_path))
        
        if missing_files:
            self.errors.append(f"Missing required files: {missing_files}")
            return False
            
        return True
    
    def run_syntax_checks(self) -> Dict[str, Any]:
        """Run syntax checks on all Python files."""
        results = {"passed": 0, "failed": 0, "errors": []}
        
        source_files = [
            "src/presentation/components/start_position_picker/enhanced_start_position_picker.py",
            "src/presentation/components/start_position_picker/variations_button.py",
            "src/presentation/components/start_position_picker/advanced_start_position_picker.py", 
            "src/presentation/components/start_position_picker/enhanced_start_position_option.py"
        ]
        
        for file_path in source_files:
            full_path = self.project_root / file_path
            if full_path.exists():
                try:
                    with open(full_path, 'r', encoding='utf-8') as f:
                        code = f.read()
                    compile(code, str(full_path), 'exec')
                    results["passed"] += 1
                except SyntaxError as e:
                    results["failed"] += 1
                    results["errors"].append(f"{file_path}: {e}")
                except Exception as e:
                    results["failed"] += 1
                    results["errors"].append(f"{file_path}: {e}")
        
        return results
    
    def run_import_checks(self) -> Dict[str, Any]:
        """Check that all modules can be imported."""
        results = {"passed": 0, "failed": 0, "errors": []}
        
        modules_to_test = [
            "presentation.components.start_position_picker.enhanced_start_position_picker",
            "presentation.components.start_position_picker.variations_button",
            "presentation.components.start_position_picker.advanced_start_position_picker",
            "presentation.components.start_position_picker.enhanced_start_position_option"
        ]
        
        for module_name in modules_to_test:
            try:
                importlib.import_module(module_name)
                results["passed"] += 1
            except ImportError as e:
                results["failed"] += 1
                results["errors"].append(f"{module_name}: {e}")
            except Exception as e:
                results["failed"] += 1
                results["errors"].append(f"{module_name}: {e}")
        
        return results
    
    def run_unit_tests(self) -> Dict[str, Any]:
        """Run unit tests using pytest."""
        results = {"passed": 0, "failed": 0, "errors": [], "warnings": [], "output": ""}
        
        test_dir = self.project_root / "tests" / "unit" / "presentation" / "start_position_picker"
        
        if not test_dir.exists():
            results["errors"].append(f"Test directory not found: {test_dir}")
            return results
        
        try:
            # Run pytest with detailed output
            cmd = [
                sys.executable, "-m", "pytest", 
                str(test_dir),
                "-v", "--tb=short", "--no-header",
                "--disable-warnings"
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=str(self.project_root),
                timeout=300  # 5 minute timeout
            )
            
            results["output"] = result.stdout + result.stderr
            results["return_code"] = result.returncode
            
            # Parse pytest output
            if result.returncode == 0:
                results["passed"] = len([line for line in result.stdout.split('\n') if "PASSED" in line])
            else:
                results["failed"] = len([line for line in result.stdout.split('\n') if "FAILED" in line])
                results["errors"].append(f"Pytest failed with return code {result.returncode}")
            
        except subprocess.TimeoutExpired:
            results["errors"].append("Tests timed out after 5 minutes")
        except Exception as e:
            results["errors"].append(f"Failed to run tests: {e}")
        
        return results
    
    def run_integration_tests(self) -> Dict[str, Any]:
        """Run integration tests specifically."""
        results = {"passed": 0, "failed": 0, "errors": [], "output": ""}
        
        test_file = self.project_root / "tests" / "unit" / "presentation" / "start_position_picker" / "test_integration.py"
        
        if not test_file.exists():
            results["errors"].append(f"Integration test file not found: {test_file}")
            return results
        
        try:
            cmd = [
                sys.executable, "-m", "pytest",
                str(test_file),
                "-v", "--tb=short", "--no-header"
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=str(self.project_root),
                timeout=180  # 3 minute timeout
            )
            
            results["output"] = result.stdout + result.stderr
            results["return_code"] = result.returncode
            
            if result.returncode == 0:
                results["passed"] = len([line for line in result.stdout.split('\n') if "PASSED" in line])
            else:
                results["failed"] = len([line for line in result.stdout.split('\n') if "FAILED" in line])
                results["errors"].append(f"Integration tests failed with return code {result.returncode}")
                
        except subprocess.TimeoutExpired:
            results["errors"].append("Integration tests timed out after 3 minutes")
        except Exception as e:
            results["errors"].append(f"Failed to run integration tests: {e}")
        
        return results
    
    def analyze_dependencies(self) -> Dict[str, Any]:
        """Analyze component dependencies."""
        results = {"issues": [], "recommendations": []}
        
        try:
            # Check for circular imports (basic check)
            source_dir = self.project_root / "src" / "presentation" / "components" / "start_position_picker"
            
            if source_dir.exists():
                python_files = list(source_dir.glob("*.py"))
                
                for file_path in python_files:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Check for relative imports that might cause issues
                    if "from ." in content and "__init__" not in file_path.name:
                        results["issues"].append(
                            f"{file_path.name}: Uses relative imports which may cause issues"
                        )
                    
                    # Check for missing TYPE_CHECKING imports
                    if "TYPE_CHECKING" in content and "from typing import TYPE_CHECKING" not in content:
                        results["issues"].append(
                            f"{file_path.name}: Uses TYPE_CHECKING but doesn't import it"
                        )
            
        except Exception as e:
            results["issues"].append(f"Dependency analysis failed: {e}")
        
        return results
    
    def check_code_quality(self) -> Dict[str, Any]:
        """Basic code quality checks."""
        results = {"issues": [], "suggestions": []}
        
        try:
            source_dir = self.project_root / "src" / "presentation" / "components" / "start_position_picker"
            
            if source_dir.exists():
                python_files = list(source_dir.glob("*.py"))
                
                for file_path in python_files:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                    
                    # Check for basic issues
                    for i, line in enumerate(lines, 1):
                        line_stripped = line.strip()
                        
                        # Check for long lines
                        if len(line.rstrip()) > 120:
                            results["suggestions"].append(
                                f"{file_path.name}:{i}: Line too long ({len(line.rstrip())} chars)"
                            )
                        
                        # Check for TODO/FIXME comments
                        if "TODO" in line_stripped or "FIXME" in line_stripped:
                            results["issues"].append(
                                f"{file_path.name}:{i}: Contains TODO/FIXME: {line_stripped}"
                            )
                        
                        # Check for print statements (should use logging)
                        if line_stripped.startswith("print(") and "logger" not in ''.join(lines[:i+5]):
                            results["suggestions"].append(
                                f"{file_path.name}:{i}: Consider using logging instead of print"
                            )
            
        except Exception as e:
            results["issues"].append(f"Code quality check failed: {e}")
        
        return results
    
    def generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive test report."""
        report = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "project_root": str(self.project_root),
            "summary": {
                "overall_status": "UNKNOWN",
                "total_tests": 0,
                "passed_tests": 0,
                "failed_tests": 0,
                "critical_errors": len(self.errors),
                "warnings": len(self.warnings)
            },
            "detailed_results": {},
            "errors": self.errors,
            "warnings": self.warnings,
            "recommendations": []
        }
        
        try:
            # Environment setup
            if not self.setup_environment():
                report["summary"]["overall_status"] = "SETUP_FAILED"
                return report
            
            # File structure check
            if not self.check_file_structure():
                report["summary"]["overall_status"] = "FILES_MISSING"
                return report
            
            # Syntax checks
            syntax_results = self.run_syntax_checks()
            report["detailed_results"]["syntax_check"] = syntax_results
            
            # Import checks
            import_results = self.run_import_checks()
            report["detailed_results"]["import_check"] = import_results
            
            # Unit tests
            unit_test_results = self.run_unit_tests()
            report["detailed_results"]["unit_tests"] = unit_test_results
            
            # Integration tests
            integration_results = self.run_integration_tests()
            report["detailed_results"]["integration_tests"] = integration_results
            
            # Dependency analysis
            dependency_results = self.analyze_dependencies()
            report["detailed_results"]["dependencies"] = dependency_results
            
            # Code quality
            quality_results = self.check_code_quality()
            report["detailed_results"]["code_quality"] = quality_results
            
            # Calculate summary
            total_passed = (
                syntax_results.get("passed", 0) +
                import_results.get("passed", 0) +
                unit_test_results.get("passed", 0) +
                integration_results.get("passed", 0)
            )
            
            total_failed = (
                syntax_results.get("failed", 0) +
                import_results.get("failed", 0) +
                unit_test_results.get("failed", 0) +
                integration_results.get("failed", 0)
            )
            
            report["summary"]["total_tests"] = total_passed + total_failed
            report["summary"]["passed_tests"] = total_passed
            report["summary"]["failed_tests"] = total_failed
            
            # Determine overall status
            if total_failed == 0 and len(self.errors) == 0:
                report["summary"]["overall_status"] = "PASSED"
            elif total_failed > 0:
                report["summary"]["overall_status"] = "TESTS_FAILED"
            else:
                report["summary"]["overall_status"] = "ERRORS"
            
            # Generate recommendations
            if total_failed > 0:
                report["recommendations"].append("Review failed tests and fix underlying issues")
            
            if len(dependency_results.get("issues", [])) > 0:
                report["recommendations"].append("Address dependency issues to prevent runtime errors")
            
            if len(quality_results.get("issues", [])) > 0:
                report["recommendations"].append("Address code quality issues for maintainability")
            
            if syntax_results.get("failed", 0) > 0:
                report["recommendations"].append("Fix syntax errors before proceeding")
                
        except Exception as e:
            report["summary"]["overall_status"] = "RUNNER_ERROR"
            report["errors"].append(f"Test runner error: {e}")
        
        return report
    
    def save_report(self, report: Dict[str, Any], filename: str = "test_report.json") -> None:
        """Save report to file."""
        try:
            report_path = self.project_root / filename
            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
            print(f"Report saved to: {report_path}")
        except Exception as e:
            print(f"Failed to save report: {e}")
    
    def print_summary(self, report: Dict[str, Any]) -> None:
        """Print a human-readable summary."""
        print("\n" + "="*80)
        print("ENHANCED START POSITION PICKER - TEST RESULTS")
        print("="*80)
        
        summary = report["summary"]
        print(f"Overall Status: {summary['overall_status']}")
        print(f"Total Tests: {summary['total_tests']}")
        print(f"Passed: {summary['passed_tests']}")
        print(f"Failed: {summary['failed_tests']}")
        print(f"Critical Errors: {summary['critical_errors']}")
        print(f"Warnings: {summary['warnings']}")
        
        if report["errors"]:
            print("\nCRITICAL ERRORS:")
            for error in report["errors"]:
                print(f"  - {error}")
        
        if report["warnings"]:
            print("\nWARNINGS:")
            for warning in report["warnings"]:
                print(f"  - {warning}")
        
        if report["recommendations"]:
            print("\nRECOMMENDATIONS:")
            for rec in report["recommendations"]:
                print(f"  - {rec}")
        
        # Detailed results
        for test_type, results in report["detailed_results"].items():
            if isinstance(results, dict) and ("passed" in results or "failed" in results):
                print(f"\n{test_type.upper().replace('_', ' ')}:")
                print(f"  Passed: {results.get('passed', 0)}")
                print(f"  Failed: {results.get('failed', 0)}")
                
                if results.get("errors"):
                    print("  Errors:")
                    for error in results["errors"][:5]:  # Show first 5 errors
                        print(f"    - {error}")
        
        print("\n" + "="*80)


def main():
    """Main entry point for test runner."""
    print("Starting Enhanced Start Position Picker Test Suite...")
    
    # Determine project root
    project_root = None
    if len(sys.argv) > 1:
        project_root = sys.argv[1]
    
    # Create and run test runner
    runner = TestRunner(project_root)
    report = runner.generate_report()
    
    # Print summary
    runner.print_summary(report)
    
    # Save detailed report
    runner.save_report(report)
    
    # Exit with appropriate code
    if report["summary"]["overall_status"] == "PASSED":
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
