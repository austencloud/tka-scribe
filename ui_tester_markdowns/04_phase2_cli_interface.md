# Phase 2: Command Line Interface

## File to Create: `src/core/testing/ui_test_cli.py`

```python
"""
Command Line Interface for UI Component Testing

Provides command line access to UI component testing functionality.
"""

import argparse
import sys
import json
from pathlib import Path
from .ui_component_tester import UIComponentTester

def main():
    """Main CLI entry point for UI testing."""
    parser = argparse.ArgumentParser(description="TKA UI Component Testing CLI")
    parser.add_argument("--headless", action="store_true",
                       help="Run in headless mode (no visible UI)")
    parser.add_argument("--component", choices=["workbench", "graph_editor", "sizing", "all"],
                       default="all", help="Component to test")
    parser.add_argument("--output", help="Output file for test results (JSON)")
    parser.add_argument("--verbose", "-v", action="store_true",
                       help="Verbose output")

    args = parser.parse_args()

    # Initialize tester
    tester = UIComponentTester(use_headless_mode=args.headless)

    # Run tests based on component selection
    if args.component == "workbench":
        results = [tester.test_workbench_buttons()]
    elif args.component == "graph_editor":
        results = [tester.test_graph_editor_interactions()]
    elif args.component == "sizing":
        results = [tester.test_component_sizing()]
    else:  # all
        results = tester.run_comprehensive_ui_tests()

    # Generate report
    report = tester.generate_test_report()

    # Output results
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(report, f, indent=2)
        print(f"Test results saved to {args.output}")

    # Print summary
    summary = report["summary"]
    print(f"\n{'='*50}")
    print(f"UI COMPONENT TEST RESULTS")
    print(f"{'='*50}")
    print(f"Total Tests: {summary['total_tests']}")
    print(f"Passed: {summary['passed_tests']}")
    print(f"Failed: {summary['failed_tests']}")
    print(f"Success Rate: {summary['success_rate']:.2%}")
    print(f"Total Time: {summary['total_execution_time']:.2f}s")

    if args.verbose:
        print(f"\n{'='*50}")
        print(f"DETAILED RESULTS")
        print(f"{'='*50}")
        for result in report["detailed_results"]:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['component']}.{result['test']}")
            if result["errors"]:
                for error in result["errors"]:
                    print(f"   ERROR: {error}")
            if result["warnings"]:
                for warning in result["warnings"]:
                    print(f"   WARNING: {warning}")

    # Print error summary
    errors = report["error_summary"]
    if errors:
        print(f"\n{'='*50}")
        print(f"ERROR SUMMARY")
        print(f"{'='*50}")
        for error in errors:
            print(f"❌ {error}")

    # Exit with appropriate code
    sys.exit(0 if summary["failed_tests"] == 0 else 1)

if __name__ == "__main__":
    main()
```

## Usage Examples

```bash
# Run all UI component tests
python main.py --test-ui

# Run specific component tests
python main.py --test-ui --test-component workbench
python main.py --test-ui --test-component graph_editor
python main.py --test-ui --test-component sizing

# Run in headless mode with output file
python main.py --test-ui --headless --test-output ui_test_results.json

# Verbose output
python main.py --test-ui --verbose

# Direct CLI usage
python -m core.testing.ui_test_cli --component workbench
python -m core.testing.ui_test_cli --headless --output results.json
```
