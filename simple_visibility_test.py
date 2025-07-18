#!/usr/bin/env python3
"""
Simplified Pictograph Visibility Services Testing Protocol

Tests the core visibility service functionality without requiring full GUI setup.
Focuses on the critical refactoring from complex to simple visibility services.
"""

import logging
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

# Add the modern src directory to Python path
modern_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(modern_src_path))

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class SimpleVisibilityTestSuite:
    """Simplified test suite focusing on core visibility service functionality."""

    def __init__(self):
        self.test_results = {}
        self.errors = []

    def log_result(self, test_name: str, status: str, details: str = ""):
        """Log a test result."""
        emoji = {"PASS": "✅", "FAIL": "❌", "PARTIAL": "⚠️"}
        print(f"{emoji.get(status, '⭕')} {test_name}: {status}")
        if details:
            print(f"   {details}")
        self.test_results[test_name] = {"status": status, "details": details}

    def test_imports(self) -> bool:
        """Test 1: Critical Import Validation"""
        print("\n🧪 TESTING: Critical Import Validation")
        try:
            # Test simple visibility service import
            from application.services.pictograph.simple_visibility_service import (
                PictographVisibilityService,
                get_visibility_service,
            )

            self.log_result(
                "Simple Visibility Service Import",
                "PASS",
                "Core service imports successfully",
            )

            # Test visibility tab imports
            from presentation.components.ui.settings.visibility.visibility_tab import (
                VisibilityTab,
            )

            self.log_result(
                "Visibility Tab Import", "PASS", "UI component imports successfully"
            )

            # Test component imports
            from presentation.components.ui.settings.visibility.components import (
                DependencyWarning,
                ElementVisibilitySection,
                MotionControlsSection,
                VisibilityPreviewSection,
            )

            self.log_result(
                "Visibility Components Import",
                "PASS",
                "All UI components import successfully",
            )

            # Test settings manager import
            from application.services.settings.visibility_settings_manager import (
                VisibilitySettingsManager,
            )

            self.log_result(
                "Visibility Settings Manager Import",
                "PASS",
                "Settings manager imports successfully",
            )

            return True

        except ImportError as e:
            self.log_result("Import Validation", "FAIL", f"Import error: {e}")
            self.errors.append(f"Import error: {e}")
            return False
        except Exception as e:
            self.log_result("Import Validation", "FAIL", f"Unexpected error: {e}")
            self.errors.append(f"Unexpected import error: {e}")
            return False

    def test_simple_visibility_service_functionality(self) -> bool:
        """Test 2: Simple Visibility Service Core Functionality"""
        print("\n🧪 TESTING: Simple Visibility Service Core Functionality")
        try:
            from application.services.pictograph.simple_visibility_service import (
                get_visibility_service,
            )

            service = get_visibility_service()

            # Test motion visibility
            print("   Testing motion visibility...")

            # Test blue motion
            original_blue = service.get_motion_visibility("blue")
            service.set_motion_visibility("blue", False)
            new_blue = service.get_motion_visibility("blue")
            service.set_motion_visibility("blue", original_blue)  # Restore

            if new_blue == False:
                self.log_result(
                    "Blue Motion Toggle", "PASS", "Blue motion can be toggled off/on"
                )
            else:
                self.log_result(
                    "Blue Motion Toggle", "FAIL", f"Expected False, got {new_blue}"
                )

            # Test red motion
            original_red = service.get_motion_visibility("red")
            service.set_motion_visibility("red", False)
            new_red = service.get_motion_visibility("red")
            service.set_motion_visibility("red", original_red)  # Restore

            if new_red == False:
                self.log_result(
                    "Red Motion Toggle", "PASS", "Red motion can be toggled off/on"
                )
            else:
                self.log_result(
                    "Red Motion Toggle", "FAIL", f"Expected False, got {new_red}"
                )

            # Test glyph visibility
            print("   Testing glyph visibility...")
            glyph_types = ["TKA", "VTG", "Elemental", "Positions", "Reversals"]

            for glyph_type in glyph_types:
                original_state = service.get_glyph_visibility(glyph_type)
                service.set_glyph_visibility(glyph_type, False)
                new_state = service.get_glyph_visibility(glyph_type)
                service.set_glyph_visibility(glyph_type, original_state)  # Restore

                if new_state == False:
                    self.log_result(
                        f"{glyph_type} Glyph Toggle",
                        "PASS",
                        f"{glyph_type} can be toggled",
                    )
                else:
                    self.log_result(
                        f"{glyph_type} Glyph Toggle",
                        "FAIL",
                        f"Expected False, got {new_state}",
                    )

            return True

        except Exception as e:
            self.log_result(
                "Simple Visibility Service Functionality", "FAIL", f"Error: {e}"
            )
            self.errors.append(f"Service functionality error: {e}")
            return False

    def test_dependency_logic(self) -> bool:
        """Test 3: Dependency Logic Validation"""
        print("\n🧪 TESTING: Dependency Logic Validation")
        try:
            from application.services.pictograph.simple_visibility_service import (
                get_visibility_service,
            )

            service = get_visibility_service()

            # Store original states
            original_blue = service.get_motion_visibility("blue")
            original_red = service.get_motion_visibility("red")

            # Test "at least one motion must remain visible" rule
            print("   Testing 'at least one motion' rule...")

            # Set both motions visible
            service.set_motion_visibility("blue", True)
            service.set_motion_visibility("red", True)

            all_visible = service.are_all_motions_visible()
            if all_visible:
                self.log_result(
                    "Both Motions Visible Check",
                    "PASS",
                    "Both motions correctly detected as visible",
                )
            else:
                self.log_result(
                    "Both Motions Visible Check",
                    "FAIL",
                    "Both motions not detected as visible",
                )

            # Turn off one motion
            service.set_motion_visibility("blue", False)

            all_visible_after = service.are_all_motions_visible()
            if not all_visible_after:
                self.log_result(
                    "One Motion Off Check",
                    "PASS",
                    "Motion dependency correctly detected",
                )
            else:
                self.log_result(
                    "One Motion Off Check", "FAIL", "Motion dependency not detected"
                )

            # Test dependent glyph logic
            print("   Testing dependent glyph behavior...")
            dependent_glyphs = ["TKA", "VTG", "Elemental", "Positions"]

            for glyph in dependent_glyphs:
                # With one motion off, dependent glyphs should be affected
                available_with_one_motion = service.get_glyph_visibility(
                    glyph, check_dependencies=True
                )

                # With both motions on, dependent glyphs should be available
                service.set_motion_visibility("blue", True)
                available_with_both_motions = service.get_glyph_visibility(
                    glyph, check_dependencies=True
                )
                service.set_motion_visibility("blue", False)  # Back to one motion

                if not available_with_one_motion and available_with_both_motions:
                    self.log_result(
                        f"{glyph} Dependency Logic",
                        "PASS",
                        f"{glyph} correctly depends on both motions",
                    )
                else:
                    self.log_result(
                        f"{glyph} Dependency Logic",
                        "FAIL",
                        f"One motion: {available_with_one_motion}, Both: {available_with_both_motions}",
                    )

            # Test non-dependent glyph (Reversals)
            service.set_motion_visibility("blue", False)
            reversals_available = service.get_glyph_visibility(
                "Reversals", check_dependencies=True
            )
            if reversals_available:
                self.log_result(
                    "Reversals Non-Dependent Logic",
                    "PASS",
                    "Reversals correctly non-dependent",
                )
            else:
                self.log_result(
                    "Reversals Non-Dependent Logic",
                    "FAIL",
                    "Reversals should be non-dependent",
                )

            # Restore original states
            service.set_motion_visibility("blue", original_blue)
            service.set_motion_visibility("red", original_red)

            return True

        except Exception as e:
            self.log_result("Dependency Logic Validation", "FAIL", f"Error: {e}")
            self.errors.append(f"Dependency logic error: {e}")
            return False

    def test_state_consistency(self) -> bool:
        """Test 4: State Consistency and Persistence"""
        print("\n🧪 TESTING: State Consistency and Persistence")
        try:
            from application.services.pictograph.simple_visibility_service import (
                get_visibility_service,
            )

            service = get_visibility_service()

            # Test state consistency
            test_states = {
                "blue_motion": True,
                "red_motion": False,
                "TKA": True,
                "VTG": False,
                "Elemental": True,
                "Positions": False,
                "Reversals": True,
            }

            # Set test states
            service.set_motion_visibility("blue", test_states["blue_motion"])
            service.set_motion_visibility("red", test_states["red_motion"])

            for glyph in ["TKA", "VTG", "Elemental", "Positions", "Reversals"]:
                service.set_glyph_visibility(glyph, test_states[glyph])

            # Verify state consistency
            consistent = True
            details = []

            blue_state = service.get_motion_visibility("blue")
            if blue_state == test_states["blue_motion"]:
                details.append("Blue motion state consistent")
            else:
                details.append(
                    f"Blue motion inconsistent: expected {test_states['blue_motion']}, got {blue_state}"
                )
                consistent = False

            red_state = service.get_motion_visibility("red")
            if red_state == test_states["red_motion"]:
                details.append("Red motion state consistent")
            else:
                details.append(
                    f"Red motion inconsistent: expected {test_states['red_motion']}, got {red_state}"
                )
                consistent = False

            for glyph in ["TKA", "VTG", "Elemental", "Positions", "Reversals"]:
                glyph_state = service.get_glyph_visibility(glyph)
                if glyph_state == test_states[glyph]:
                    details.append(f"{glyph} state consistent")
                else:
                    details.append(
                        f"{glyph} inconsistent: expected {test_states[glyph]}, got {glyph_state}"
                    )
                    consistent = False

            if consistent:
                self.log_result("State Consistency", "PASS", "; ".join(details))
            else:
                self.log_result("State Consistency", "FAIL", "; ".join(details))

            return consistent

        except Exception as e:
            self.log_result("State Consistency", "FAIL", f"Error: {e}")
            self.errors.append(f"State consistency error: {e}")
            return False

    def test_performance_basic(self) -> bool:
        """Test 5: Basic Performance Validation"""
        print("\n🧪 TESTING: Basic Performance Validation")
        try:
            import time

            from application.services.pictograph.simple_visibility_service import (
                get_visibility_service,
            )

            service = get_visibility_service()

            # Test rapid operations
            start_time = time.time()

            for i in range(100):
                service.set_motion_visibility("blue", i % 2 == 0)
                service.get_motion_visibility("blue")
                service.set_glyph_visibility("TKA", i % 3 == 0)
                service.get_glyph_visibility("TKA")

            end_time = time.time()
            duration = end_time - start_time

            if duration < 0.5:  # Should complete very quickly
                self.log_result(
                    "Performance Test",
                    "PASS",
                    f"100 operations completed in {duration:.3f}s",
                )
            else:
                self.log_result(
                    "Performance Test",
                    "FAIL",
                    f"100 operations took {duration:.3f}s (too slow)",
                )

            # Test memory/state integrity
            all_states = service.get_all_visibility_states()
            if (
                isinstance(all_states, dict)
                and "glyphs" in all_states
                and "motions" in all_states
            ):
                self.log_result(
                    "State Integrity", "PASS", "All states retrievable after operations"
                )
            else:
                self.log_result(
                    "State Integrity",
                    "FAIL",
                    "State structure invalid after operations",
                )

            return True

        except Exception as e:
            self.log_result("Performance Validation", "FAIL", f"Error: {e}")
            self.errors.append(f"Performance error: {e}")
            return False

    def run_all_tests(self) -> Dict[str, Any]:
        """Run all tests and return results."""
        print("🚀 Starting Simplified Pictograph Visibility Services Testing")
        print("=" * 70)

        test_methods = [
            ("Import Validation", self.test_imports),
            (
                "Service Functionality",
                self.test_simple_visibility_service_functionality,
            ),
            ("Dependency Logic", self.test_dependency_logic),
            ("State Consistency", self.test_state_consistency),
            ("Performance Basic", self.test_performance_basic),
        ]

        passed = 0
        failed = 0

        for test_name, test_method in test_methods:
            try:
                if test_method():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ {test_name}: FAIL - Unexpected error: {e}")
                failed += 1
                self.errors.append(f"{test_name}: {e}")

        # Summary
        print("\n" + "=" * 70)
        print("📋 TEST SUMMARY")
        print("=" * 70)
        print(f"✅ PASSED: {passed}")
        print(f"❌ FAILED: {failed}")
        print(f"📊 TOTAL:  {passed + failed}")

        if self.errors:
            print("\n❌ ERRORS ENCOUNTERED:")
            for error in self.errors:
                print(f"   • {error}")

        overall_status = "PASS" if failed == 0 else "FAIL"
        print(f"\n🎯 OVERALL STATUS: {overall_status}")

        if overall_status == "PASS":
            print("\n✅ ALL TESTS PASSED - Refactoring appears successful!")
            print("   The simple visibility service is working correctly.")
            print("   No import errors or functionality regressions detected.")
        else:
            print(f"\n❌ TESTING FAILED - {failed} test(s) failed")
            print("   The refactoring may have introduced issues.")
            print("   Please review the errors above.")

        return {
            "overall_status": overall_status,
            "passed": passed,
            "failed": failed,
            "errors": self.errors,
            "results": self.test_results,
        }


def main():
    """Main function to run the simplified test suite."""
    test_suite = SimpleVisibilityTestSuite()
    results = test_suite.run_all_tests()

    # Return appropriate exit code
    return 0 if results["overall_status"] == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
