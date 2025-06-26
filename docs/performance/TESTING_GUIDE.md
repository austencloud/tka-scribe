# Performance Framework Testing Guide

Comprehensive guide for testing the TKA Performance Framework implementation. Covers unit tests, integration tests, benchmarks, and validation procedures.

## 🧪 Test Structure

### Test Organization

```
tests/performance/
├── conftest.py                    # Test configuration and fixtures
├── test_performance_framework.py  # Core framework tests
├── benchmarks/
│   └── test_performance_benchmarks.py  # Performance benchmarks
└── integration/
    └── test_integration.py        # Integration tests
```

### Test Categories

- **Unit Tests**: Individual component testing
- **Integration Tests**: End-to-end workflow testing
- **Benchmarks**: Performance target validation
- **Regression Tests**: Performance regression detection
- **Stress Tests**: Concurrent load testing

## 🚀 Running Tests

### Quick Test Commands

```bash
# Run all performance tests
pytest tests/performance/ -v

# Run specific test categories
pytest tests/performance/ -m "performance" -v
pytest tests/performance/ -m "benchmark" -v
pytest tests/performance/ -m "regression" -v
pytest tests/performance/ -m "integration" -v

# Run with coverage
pytest tests/performance/ --cov=core.performance --cov-report=html

# Run validation script
python scripts/performance/validate_framework.py
```

### Test Configuration

```bash
# Set test environment
export TKA_ENV=test
export TKA_PROFILING_ENABLED=true
export TKA_MONITORING_ENABLED=true

# Run tests with specific configuration
TKA_PROFILING_OVERHEAD_THRESHOLD=5.0 pytest tests/performance/
```

## 📊 Performance Benchmarks

### Overhead Validation

Tests that profiler overhead stays within acceptable limits:

```python
def test_profiler_overhead_benchmark():
    """Validates profiler overhead <1%"""
    # Measures baseline vs profiled execution time
    # Asserts overhead percentage within threshold
```

**Expected Results:**
- Profiler overhead: <1%
- Typical actual: ~0.5%

### Service Resolution Performance

Tests DI container service resolution speed:

```python
def test_service_resolution_performance():
    """Validates service resolution <1ms"""
    # Benchmarks container.resolve() performance
    # Tests with complex dependency graphs
```

**Expected Results:**
- Average resolution time: <1ms
- Typical actual: ~0.3ms

### Arrow Rendering Simulation

Tests arrow rendering performance targets:

```python
def test_arrow_rendering_performance_simulation():
    """Validates arrow rendering <5ms"""
    # Simulates SVG loading, color transformation, Qt rendering
    # Measures end-to-end rendering time
```

**Expected Results:**
- Average rendering time: <5ms
- Typical actual: ~2ms

### Memory Tracking Performance

Tests memory tracking overhead:

```python
def test_memory_tracking_performance():
    """Validates memory tracking overhead <5%"""
    # Compares memory operations with/without tracking
    # Measures performance impact
```

**Expected Results:**
- Memory tracking overhead: <5%
- Typical actual: ~2%

## 🔧 Test Fixtures

### Performance Configuration

```python
@pytest.fixture
def performance_config():
    """Provides test performance configuration"""
    config = PerformanceConfig.create_default()
    config.profiling.overhead_threshold_percent = 5.0  # More lenient for tests
    return config
```

### Isolated Profiler

```python
@pytest.fixture
def isolated_profiler(performance_config, temp_performance_storage):
    """Provides isolated profiler for testing"""
    profiler = AdvancedProfiler(performance_config)
    yield profiler
    # Automatic cleanup
```

### Mock Qt Environment

```python
@pytest.fixture
def mock_qt_environment():
    """Mocks Qt environment for testing without PyQt6"""
    with patch('core.performance.qt_profiler.QT_AVAILABLE', True):
        # Mock Qt classes and methods
        yield mock_objects
```

### Performance Assertions

```python
@pytest.fixture
def performance_assertion_helper():
    """Helper for performance assertions"""
    class Helper:
        @staticmethod
        def assert_execution_time_within_threshold(time, threshold, name):
            assert time <= threshold, f"{name} time exceeds threshold"
    return Helper()
```

## 📈 Benchmark Validation

### Performance Targets

| Component | Target | Test Method | Validation |
|-----------|--------|-------------|------------|
| Profiler Overhead | <1% | Baseline vs Profiled | `test_profiler_overhead_benchmark` |
| Service Resolution | <1ms | DI Container Timing | `test_service_resolution_performance` |
| Arrow Rendering | <5ms | Rendering Simulation | `test_arrow_rendering_performance_simulation` |
| Memory Tracking | <5% overhead | Memory Operations | `test_memory_tracking_performance` |
| Qt Event Processing | <16ms (60fps) | Event Simulation | `test_qt_event_profiling_performance` |

### Regression Detection

```python
def test_regression_detection_accuracy():
    """Tests regression detection algorithm accuracy"""
    # Creates baseline and regressed metrics
    # Validates detection of performance regressions
    # Tests false positive/negative rates
```

**Validation Criteria:**
- Detects 50% performance regression
- No false positives for stable functions
- Configurable threshold sensitivity

## 🔍 Integration Testing

### End-to-End Workflow

```python
def test_end_to_end_profiling_workflow():
    """Tests complete profiling workflow"""
    # Start session → Profile functions → Stop session
    # Validates data collection and storage
    # Tests session management
```

### Framework Integration

```python
def test_framework_integration():
    """Tests integration with existing TKA components"""
    # Tests DI container integration
    # Tests arrow renderer integration
    # Tests Qt component integration
```

### Storage Integration

```python
def test_storage_integration():
    """Tests performance data storage"""
    # Tests session save/retrieve
    # Tests data persistence
    # Tests cleanup operations
```

## 🧩 Component Testing

### Core Profiler Tests

```python
class TestAdvancedProfiler:
    def test_session_lifecycle(self):
        """Tests profiling session start/stop"""
    
    def test_function_profiling_decorator(self):
        """Tests @profile decorator"""
    
    def test_profile_block_context_manager(self):
        """Tests profile_block context manager"""
    
    def test_thread_safety(self):
        """Tests concurrent profiling"""
```

### Memory Tracker Tests

```python
class TestMemoryTracker:
    def test_memory_tracking_lifecycle(self):
        """Tests memory tracking start/stop"""
    
    def test_leak_detection(self):
        """Tests memory leak detection"""
    
    def test_memory_summary_generation(self):
        """Tests memory summary creation"""
```

### Qt Profiler Tests

```python
class TestQtProfiler:
    def test_qt_profiling_lifecycle(self):
        """Tests Qt profiling start/stop"""
    
    def test_event_monitoring(self):
        """Tests Qt event monitoring"""
    
    def test_paint_operation_tracking(self):
        """Tests paint operation profiling"""
```

## 🔧 Test Utilities

### Performance Data Generation

```python
@pytest.fixture
def performance_data_generator():
    """Generates realistic test performance data"""
    class Generator:
        @staticmethod
        def generate_function_metrics(name, call_count=100):
            # Creates realistic function metrics
            return FunctionMetrics(...)
    return Generator()
```

### Mock System Resources

```python
@pytest.fixture
def mock_system_resources():
    """Mocks system resource monitoring"""
    with patch('psutil.Process') as mock_process:
        # Mock memory info, CPU usage, etc.
        yield mock_objects
```

## 📋 Test Checklist

### Pre-Test Setup

- [ ] Environment variables configured
- [ ] Test database isolated
- [ ] Mock objects properly configured
- [ ] Temporary directories created

### Core Functionality

- [ ] Profiler session lifecycle
- [ ] Function profiling accuracy
- [ ] Memory tracking functionality
- [ ] Qt profiling (if available)
- [ ] Configuration loading/validation

### Performance Validation

- [ ] Profiler overhead within limits
- [ ] Service resolution performance
- [ ] Memory tracking overhead
- [ ] Thread safety under load
- [ ] Regression detection accuracy

### Integration Testing

- [ ] DI container integration
- [ ] Arrow renderer integration
- [ ] Storage system functionality
- [ ] API endpoints (if available)
- [ ] Framework initialization/shutdown

### Error Handling

- [ ] Graceful error handling
- [ ] Invalid configuration handling
- [ ] Resource cleanup on failure
- [ ] Thread safety with errors

## 🚨 Troubleshooting Tests

### Common Test Issues

**Tests Failing Due to Overhead**
```bash
# Increase overhead threshold for tests
TKA_PROFILING_OVERHEAD_THRESHOLD=5.0 pytest tests/performance/
```

**Qt Tests Failing**
```bash
# Skip Qt tests if PyQt6 not available
pytest tests/performance/ -k "not qt"
```

**Memory Tests Unstable**
```bash
# Run with garbage collection
pytest tests/performance/ --forked
```

### Test Environment Issues

**Database Conflicts**
- Use isolated test databases
- Clean up after each test
- Use in-memory databases for speed

**Resource Leaks**
- Implement proper fixture cleanup
- Monitor test memory usage
- Use context managers

**Timing Issues**
- Use appropriate sleep intervals
- Account for system load
- Use relative timing comparisons

## 📊 Test Reporting

### Coverage Reports

```bash
# Generate HTML coverage report
pytest tests/performance/ --cov=core.performance --cov-report=html

# View coverage
open htmlcov/index.html
```

### Performance Reports

```bash
# Run validation with detailed reporting
python scripts/performance/validate_framework.py > validation_report.txt

# Benchmark results
pytest tests/performance/benchmarks/ -v --tb=short > benchmark_results.txt
```

### Continuous Integration

```yaml
# Example CI configuration
test_performance:
  script:
    - export TKA_ENV=test
    - pytest tests/performance/ --cov=core.performance
    - python scripts/performance/validate_framework.py
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml
```

## 🎯 Best Practices

### Writing Performance Tests

1. **Use Realistic Data**: Test with realistic data sizes and patterns
2. **Isolate Tests**: Each test should be independent
3. **Mock External Dependencies**: Use mocks for system resources
4. **Validate Targets**: Always test against specific performance targets
5. **Handle Variability**: Account for system performance variability

### Test Maintenance

1. **Regular Updates**: Update tests when performance targets change
2. **Monitor Trends**: Track test performance over time
3. **Review Failures**: Investigate and fix flaky tests
4. **Documentation**: Keep test documentation current
5. **Automation**: Automate test execution in CI/CD

This testing guide ensures comprehensive validation of the performance framework while maintaining test reliability and performance.
