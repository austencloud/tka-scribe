# Phase 3: Integration with Main Application

## File to Modify: `main.py`

Add these lines to the argument parser section:

```python
# Add to existing argument parser
parser.add_argument("--test-ui", action="store_true",
                   help="Run UI component tests")
parser.add_argument("--test-component", choices=["workbench", "graph_editor", "sizing", "all"],
                   default="all", help="Specific component to test")
parser.add_argument("--test-output", help="Output file for test results")

# Add UI testing mode handling
if args.test_ui:
    from core.testing.ui_test_cli import main as ui_test_main
    # Replace sys.argv with UI test arguments
    ui_test_args = []
    if args.headless:
        ui_test_args.append("--headless")
    if args.test_component:
        ui_test_args.extend(["--component", args.test_component])
    if args.test_output:
        ui_test_args.extend(["--output", args.test_output])

    sys.argv = ["ui_test"] + ui_test_args
    ui_test_main()
    return
```

## Integration Examples

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
```

## Alternative Direct CLI Usage

```bash
# Direct CLI usage
python -m core.testing.ui_test_cli --component workbench
python -m core.testing.ui_test_cli --headless --output results.json
```

## Integration Benefits

1. **Seamless Integration**: UI tests run as part of the main application
2. **Consistent Interface**: Same command-line interface as other features
3. **Easy Access**: Can be run alongside other application functions
4. **Flexible Output**: Can save results to files or display in console
5. **Automated Testing**: Can be integrated into CI/CD pipelines
