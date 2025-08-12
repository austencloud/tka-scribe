# Modern E2E Testing Framework for TKA

This directory contains the modern end-to-end testing framework for the TKA application, designed to replace the legacy testing approach with a more maintainable, scalable solution.

## Key Benefits

- **80-90% less boilerplate code** compared to legacy tests
- **Page Object Model** for clean UI interaction encapsulation
- **Pytest fixtures** for consistent test setup and teardown
- **Reusable step definitions** for common workflows
- **Custom assertions** for TKA-specific validations
- **Builder patterns** for flexible test data creation
- **pytest-qt integration** for enhanced Qt testing capabilities
- **Performance monitoring** with automatic slow test detection
- **Professional reporting** with HTML output and coverage
- **Test markers** for organized test execution (smoke, performance, regression)

## Directory Structure

```
tests/e2e/
├── framework/                     # Core testing framework
│   ├── page_objects/             # Page Object Model implementation
│   ├── fixtures/                 # Reusable test fixtures
│   ├── steps/                    # Reusable step definitions
│   ├── utils/                    # Utility functions
│   └── builders/                 # Test data builders
├── workflows/                     # High-level workflow tests
├── features/                      # Feature-specific tests
└── regression/                    # Regression tests
```

## Usage

### Running Tests

```bash
# Run all modern E2E tests
pytest tests/e2e/

# Run specific workflow tests
pytest tests/e2e/workflows/

# Run with verbose output
pytest tests/e2e/ -v

# Run with enhanced features
pytest tests/e2e/ --html=reports/test_report.html --cov=framework

# Run by markers
pytest tests/e2e/ -m "smoke"          # Quick smoke tests
pytest tests/e2e/ -m "performance"    # Performance tests
pytest tests/e2e/ -m "not slow"       # Exclude slow tests

# Run demo
python tests/e2e/demo_enhanced_framework.py
```

### Writing New Tests

1. Use existing page objects from `framework/page_objects/`
2. Leverage fixtures from `conftest.py` for setup
3. Compose workflows using step definitions from `framework/steps/`
4. Add custom assertions as needed

### Example Test

```python
def test_basic_sequence_creation(workflow_steps):
    """Test basic sequence creation workflow."""
    navigation = workflow_steps['navigation']
    sequence = workflow_steps['sequence']
    validation = workflow_steps['validation']

    # Act
    assert navigation.select_start_position("alpha1_alpha1")
    assert sequence.build_sequence(length=3)

    # Assert
    assert validation.sequence_has_length(3)
    assert validation.sequence_is_valid()
```

### Enhanced Features Examples

#### Builder Pattern

```python
# Simple sequence
sequence_spec = simple_sequence(length=3, position="alpha1_alpha1")

# Complex sequence with validation
sequence_spec = (SequenceBuilder()
                .with_start_position("beta5_beta5")
                .with_length(4)
                .with_validation_rules({"valid": True, "min_length": 3})
                .with_metadata({"test_type": "integration"})
                .build())
```

#### Custom Assertions

```python
from framework.utils.assertions import assert_tka

# Domain-specific assertions with rich error messages
assert_tka.sequence_has_length(workbench, 3)
assert_tka.sequence_is_valid(workbench)
assert_tka.options_available(option_picker, min_count=5)
```

#### Performance Monitoring

```python
# Automatic performance tracking via fixtures
@pytest.mark.performance
def test_performance_sequence(workflow_steps):
    # This test will be automatically monitored
    # Warnings for tests > 10s, alerts for tests > 30s
    pass
```

#### Enhanced qtbot Integration

```python
def test_with_enhanced_qtbot(qtbot_enhanced):
    # qtbot with TKA-specific enhancements
    qtbot_enhanced.wait_for_tka_component("construct_tab")
    qtbot_enhanced.screenshot_on_failure("my_test")
```

## Migration from Legacy Tests

This framework is designed to gradually replace the legacy `tests/e2e/` tests. The migration follows these phases:

1. **Phase 1**: Foundation setup (framework structure)
2. **Phase 2**: Core page objects implementation
3. **Phase 3**: Step definitions and fixtures
4. **Phase 4**: Proof of concept test conversion
5. **Phase 5**: Advanced features and full migration

## Architecture Principles

- **Single Responsibility**: Each component has one clear purpose
- **Reusability**: Common functionality is shared across tests
- **Maintainability**: Changes to UI require minimal test updates
- **Readability**: Tests focus on behavior, not implementation details
