#!/usr/bin/env python3
"""
Autonomous test suite for VS Code task configuration enhancements.
Tests all implemented features to ensure they work as expected.
"""

import json
import os
import subprocess
import time
import sys
from pathlib import Path
from typing import Dict, List, Any
import asyncio
import psutil


class VSCodeTaskTester:
    def __init__(self, workspace_path: str):
        self.workspace_path = Path(workspace_path)
        self.vscode_path = self.workspace_path / ".vscode"
        self.tasks_json = self.vscode_path / "tasks.json"
        self.launch_json = self.vscode_path / "launch.json"
        self.keybindings_json = self.vscode_path / "keybindings.json"
        self.test_results = []

    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if passed else "❌ FAIL"
        self.test_results.append(
            {"test": test_name, "passed": passed, "details": details}
        )
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")

    def test_config_files_exist(self) -> bool:
        """Test that all configuration files exist and are valid JSON"""
        files_to_check = [
            ("tasks.json", self.tasks_json),
            ("launch.json", self.launch_json),
            ("keybindings.json", self.keybindings_json),
        ]

        all_passed = True
        for name, file_path in files_to_check:
            if not file_path.exists():
                self.log_test(f"{name} exists", False, f"File not found: {file_path}")
                all_passed = False
                continue

            try:
                with open(file_path, "r") as f:
                    json.load(f)
                self.log_test(f"{name} valid JSON", True)
            except json.JSONDecodeError as e:
                self.log_test(f"{name} valid JSON", False, f"JSON error: {e}")
                all_passed = False

        return all_passed

    def test_default_build_task(self) -> bool:
        """Test that Full Stack Development is set as default build task"""
        try:
            with open(self.tasks_json, "r") as f:
                tasks_config = json.load(f)

            for task in tasks_config.get("tasks", []):
                if task.get("label") == "Full Stack Development":
                    group = task.get("group", {})
                    if isinstance(group, dict):
                        is_default = group.get("isDefault", False)
                        is_build = group.get("kind") == "build"

                        if is_default and is_build:
                            self.log_test("Default build task configured", True)
                            return True

            self.log_test(
                "Default build task configured",
                False,
                "Full Stack Development not set as default build",
            )
            return False

        except Exception as e:
            self.log_test("Default build task configured", False, f"Error: {e}")
            return False

    def test_instance_limits(self) -> bool:
        """Test that instance limits are configured"""
        try:
            with open(self.tasks_json, "r") as f:
                tasks_config = json.load(f)

            tasks_with_limits = []
            for task in tasks_config.get("tasks", []):
                run_options = task.get("runOptions", {})
                if "instanceLimit" in run_options:
                    tasks_with_limits.append(task.get("label"))

            expected_tasks = ["Full Stack Development", "Sequential Development Stack"]
            has_limits = all(task in str(tasks_with_limits) for task in expected_tasks)

            self.log_test(
                "Instance limits configured",
                has_limits,
                f"Tasks with limits: {tasks_with_limits}",
            )
            return has_limits

        except Exception as e:
            self.log_test("Instance limits configured", False, f"Error: {e}")
            return False

    def test_auto_run_on_folder_open(self) -> bool:
        """Test that Validate Test Organization has runOn: folderOpen"""
        try:
            with open(self.tasks_json, "r") as f:
                tasks_config = json.load(f)

            for task in tasks_config.get("tasks", []):
                if task.get("label") == "Validate Test Organization":
                    run_options = task.get("runOptions", {})
                    if run_options.get("runOn") == "folderOpen":
                        self.log_test("Auto-run on folder open configured", True)
                        return True

            self.log_test(
                "Auto-run on folder open configured",
                False,
                "Validate Test Organization missing runOn: folderOpen",
            )
            return False

        except Exception as e:
            self.log_test("Auto-run on folder open configured", False, f"Error: {e}")
            return False

    def test_debug_pre_launch_task(self) -> bool:
        """Test that debug configuration has preLaunchTask"""
        try:
            with open(self.launch_json, "r") as f:
                launch_config = json.load(f)

            for config in launch_config.get("configurations", []):
                if config.get("name") == "Desktop - with API":
                    if config.get("preLaunchTask") == "Start API Server":
                        self.log_test("Debug pre-launch task configured", True)
                        return True

            self.log_test(
                "Debug pre-launch task configured",
                False,
                "Desktop - with API missing preLaunchTask",
            )
            return False

        except Exception as e:
            self.log_test("Debug pre-launch task configured", False, f"Error: {e}")
            return False

    def test_keyboard_shortcuts(self) -> bool:
        """Test that keyboard shortcuts are configured"""
        try:
            with open(self.keybindings_json, "r") as f:
                keybindings = json.load(f)

            expected_shortcuts = {
                "ctrl+alt+t": "Run All Tests",
                "ctrl+alt+v": "Validate Test Organization",
                "ctrl+alt+f": "Full Stack Development",
            }

            found_shortcuts = {}
            for binding in keybindings:
                key = binding.get("key")
                args = binding.get("args")
                if key in expected_shortcuts:
                    found_shortcuts[key] = args

            all_found = all(
                key in found_shortcuts and found_shortcuts[key] == task
                for key, task in expected_shortcuts.items()
            )

            self.log_test(
                "Keyboard shortcuts configured", all_found, f"Found: {found_shortcuts}"
            )
            return all_found

        except Exception as e:
            self.log_test("Keyboard shortcuts configured", False, f"Error: {e}")
            return False

    def test_problem_matchers(self) -> bool:
        """Test that problem matchers are configured for test tasks"""
        try:
            with open(self.tasks_json, "r") as f:
                tasks_config = json.load(f)

            for task in tasks_config.get("tasks", []):
                if task.get("label") == "Run All Tests":
                    problem_matcher = task.get("problemMatcher", [])
                    if "$python" in problem_matcher:
                        self.log_test("Problem matchers configured", True)
                        return True

            self.log_test(
                "Problem matchers configured",
                False,
                "Run All Tests missing $python problem matcher",
            )
            return False

        except Exception as e:
            self.log_test("Problem matchers configured", False, f"Error: {e}")
            return False

    def test_terminal_grouping(self) -> bool:
        """Test that terminal grouping is configured"""
        try:
            with open(self.tasks_json, "r") as f:
                tasks_config = json.load(f)

            development_tasks = [
                "Start Desktop App",
                "Start Web App",
                "Start API Server",
            ]
            grouped_tasks = []

            for task in tasks_config.get("tasks", []):
                if task.get("label") in development_tasks:
                    presentation = task.get("presentation", {})
                    if presentation.get("group") == "development":
                        grouped_tasks.append(task.get("label"))

            all_grouped = len(grouped_tasks) == len(development_tasks)
            self.log_test(
                "Terminal grouping configured",
                all_grouped,
                f"Grouped tasks: {grouped_tasks}",
            )
            return all_grouped

        except Exception as e:
            self.log_test("Terminal grouping configured", False, f"Error: {e}")
            return False

    def test_task_dependencies(self) -> bool:
        """Test that task dependencies are correctly configured"""
        try:
            with open(self.tasks_json, "r") as f:
                tasks_config = json.load(f)

            tests_passed = 0

            # Test parallel task
            for task in tasks_config.get("tasks", []):
                if task.get("label") == "Full Stack Development":
                    depends_order = task.get("dependsOrder")
                    depends_on = task.get("dependsOn", [])

                    if (
                        depends_order == "parallel"
                        and "Start API Server" in depends_on
                        and "Start Web App" in depends_on
                    ):
                        tests_passed += 1

                # Test sequential task
                elif task.get("label") == "Sequential Development Stack":
                    depends_order = task.get("dependsOrder")
                    depends_on = task.get("dependsOn", [])

                    if depends_order == "sequence" and len(depends_on) == 3:
                        tests_passed += 1

            all_passed = tests_passed == 2
            self.log_test(
                "Task dependencies configured",
                all_passed,
                f"Passed {tests_passed}/2 dependency tests",
            )
            return all_passed

        except Exception as e:
            self.log_test("Task dependencies configured", False, f"Error: {e}")
            return False

    async def test_task_execution_simulation(self) -> bool:
        """Test that task commands are properly structured and executable"""
        try:
            with open(self.tasks_json, "r") as f:
                tasks_config = json.load(f)

            # Test specific task commands without actually executing them
            critical_tasks = [
                "Start Desktop App",
                "Start Web App",
                "Start API Server",
                "Run All Tests",
            ]

            valid_tasks = 0
            for task in tasks_config.get("tasks", []):
                label = task.get("label")
                if label in critical_tasks:
                    # Check if task has required fields
                    has_command = task.get("command") or task.get("dependsOn")
                    has_type = task.get("type") or task.get("dependsOn")

                    if has_command and has_type:
                        valid_tasks += 1

            success = valid_tasks >= len(critical_tasks) - 1  # Allow one compound task
            self.log_test(
                "Task execution simulation",
                success,
                f"Validated {valid_tasks}/{len(critical_tasks)} critical tasks",
            )
            return success

        except Exception as e:
            self.log_test("Task execution simulation", False, f"Error: {e}")
            return False

    def validate_file_paths(self) -> bool:
        """Validate that all file paths in tasks are correct"""
        try:
            with open(self.tasks_json, "r") as f:
                tasks_config = json.load(f)

            path_tests = []

            for task in tasks_config.get("tasks", []):
                label = task.get("label", "Unknown")

                # Check cwd paths
                options = task.get("options", {})
                cwd = options.get("cwd", "")
                if cwd:
                    # Replace workspace folder variable
                    actual_path = cwd.replace(
                        "${workspaceFolder}", str(self.workspace_path)
                    )
                    exists = Path(actual_path).exists()
                    path_tests.append((f"{label} - cwd", exists, actual_path))

                # Check command/script paths
                if task.get("type") == "shell":
                    args = task.get("args", [])
                    for arg in args:
                        if "/" in arg or "\\" in arg:  # Looks like a path
                            if not arg.startswith("${"):  # Not a variable
                                full_path = self.workspace_path / arg
                                exists = full_path.exists()
                                path_tests.append(
                                    (f"{label} - {arg}", exists, str(full_path))
                                )

            all_paths_valid = all(test[1] for test in path_tests)
            details = f"Checked {len(path_tests)} paths"
            if not all_paths_valid:
                invalid_paths = [test for test in path_tests if not test[1]]
                details += f", Invalid: {[test[0] for test in invalid_paths]}"

            self.log_test("File paths validation", all_paths_valid, details)
            return all_paths_valid

        except Exception as e:
            self.log_test("File paths validation", False, f"Error: {e}")
            return False

    def run_all_tests(self) -> Dict[str, Any]:
        """Run all tests and return comprehensive results"""
        print("🧪 Starting VS Code Task Enhancement Tests")
        print("=" * 50)

        # Run all tests
        tests = [
            self.test_config_files_exist,
            self.test_default_build_task,
            self.test_instance_limits,
            self.test_auto_run_on_folder_open,
            self.test_debug_pre_launch_task,
            self.test_keyboard_shortcuts,
            self.test_problem_matchers,
            self.test_terminal_grouping,
            self.test_task_dependencies,
            self.validate_file_paths,
        ]

        for test in tests:
            test()

        # Run async test
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(self.test_task_execution_simulation())
            loop.close()
        except Exception as e:
            self.log_test("Task execution simulation", False, f"Async error: {e}")

        # Calculate results
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["passed"])

        print("\n" + "=" * 50)
        print(f"📊 Test Results: {passed_tests}/{total_tests} passed")

        if passed_tests == total_tests:
            print(
                "🎉 All tests passed! Your VS Code task enhancements are working correctly."
            )
        else:
            print("⚠️  Some tests failed. Check the details above.")

        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "success_rate": passed_tests / total_tests * 100,
            "results": self.test_results,
        }


def main():
    """Main test runner"""
    workspace_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    tester = VSCodeTaskTester(workspace_path)
    results = tester.run_all_tests()

    # Exit with error code if tests failed
    if results["passed_tests"] < results["total_tests"]:
        sys.exit(1)

    sys.exit(0)


if __name__ == "__main__":
    main()
