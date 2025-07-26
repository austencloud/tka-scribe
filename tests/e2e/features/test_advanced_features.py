"""
Advanced Features Test - Demonstrating Modern E2E Framework Capabilities

This test demonstrates the advanced features of the modern E2E testing framework:
- Custom assertions
- Builder patterns
- Fluent interfaces
- Utility functions
- Performance monitoring
- Error handling

This showcases the full power and flexibility of the new framework.
"""

import pytest
import logging
from tests.e2e.framework.utils import (
    TKAAssertions,
    assert_basic_sequence_workflow,
    WaitConditions,
    LoggingHelpers,
    PerformanceHelpers,
)
from tests.e2e.framework.builders import SequenceBuilder, WorkflowBuilder

logger = logging.getLogger(__name__)


class TestAdvancedFeatures:
    """
    Advanced feature tests demonstrating the full capabilities of the modern framework.

    These tests showcase:
    - Builder pattern usage
    - Fluent interface workflows
    - Custom assertions
    - Performance monitoring
    - Error handling and recovery
    """

    def test_sequence_builder_pattern(self, workflow_steps):
        """
        Test using the SequenceBuilder pattern for flexible test configuration.
        """
        LoggingHelpers.log_test_start("Sequence Builder Pattern")

        # Create sequence configuration using builder pattern
        sequence_config = (
            SequenceBuilder()
            .with_start_position("alpha1_alpha1")
            .with_length(3)
            .with_validation_rules(
                {"min_length": 2, "max_length": 5, "must_be_valid": True}
            )
            .clear_before_build(True)
            .build()
        )

        # Execute the configuration
        success = sequence_config.execute(workflow_steps)

        # Use custom assertions
        TKAAssertions.assert_workflow_successful(success, "Sequence builder execution")
        TKAAssertions.assert_sequence_length(workflow_steps["validation"].workbench, 3)
        TKAAssertions.assert_sequence_valid(workflow_steps["validation"].workbench)

        LoggingHelpers.log_test_end("Sequence Builder Pattern", True)

    def test_fluent_workflow_interface(self, workflow_steps):
        """
        Test using the fluent WorkflowBuilder interface for readable workflows.
        """
        LoggingHelpers.log_test_start("Fluent Workflow Interface")

        # Create and execute workflow using fluent interface
        result = (
            WorkflowBuilder(workflow_steps)
            .navigate_to_position("alpha1_alpha1")
            .build_sequence(length=4)
            .validate_length(4)
            .validate_is_valid()
            .validate_not_empty()
            .execute()
        )

        # Verify workflow execution
        assert result.successful, f"Workflow failed: {result.error_message}"

        LoggingHelpers.log_test_end("Fluent Workflow Interface", result.successful)

    def test_complex_workflow_with_operations(self, workflow_steps):
        """
        Test complex workflow with multiple operations and validations.
        """
        LoggingHelpers.log_test_start("Complex Workflow Operations")

        # Complex workflow: build, extend, clear, rebuild
        result = (
            WorkflowBuilder(workflow_steps)
            .navigate_to_position("alpha1_alpha1")
            .build_sequence(length=2)
            .validate_length(2)
            .extend_sequence(additional_length=2)
            .validate_length(4)
            .clear_sequence()
            .validate_empty()
            .build_sequence(length=3)
            .validate_length(3)
            .validate_is_valid()
            .execute()
        )

        assert result.successful, f"Complex workflow failed: {result.error_message}"

        LoggingHelpers.log_test_end("Complex Workflow Operations", result.successful)

    def test_custom_assertions_comprehensive(self, workflow_steps):
        """
        Test comprehensive custom assertions functionality.
        """
        LoggingHelpers.log_test_start("Custom Assertions Comprehensive")

        navigation = workflow_steps["navigation"]
        sequence = workflow_steps["sequence"]
        validation = workflow_steps["validation"]

        # Use convenience assertion function
        assert_basic_sequence_workflow(
            navigation, sequence, validation, "alpha1_alpha1", 3
        )

        # Test individual custom assertions
        TKAAssertions.assert_sequence_length_in_range(validation.workbench, 1, 10)
        TKAAssertions.assert_sequence_not_empty(validation.workbench)
        TKAAssertions.assert_component_loaded(
            validation.workbench, "Sequence Workbench"
        )

        # Test state validation
        TKAAssertions.assert_state_matches(
            validation.workbench, {"length": 3, "valid": True}
        )

        LoggingHelpers.log_test_end("Custom Assertions Comprehensive", True)

    def test_wait_conditions_and_helpers(self, workflow_steps):
        """
        Test wait conditions and helper utilities.
        """
        LoggingHelpers.log_test_start("Wait Conditions and Helpers")

        navigation = workflow_steps["navigation"]
        sequence = workflow_steps["sequence"]
        validation = workflow_steps["validation"]

        # Ensure components are ready using wait conditions
        assert WaitConditions.wait_for_component_loaded(validation.workbench)

        # Build sequence and wait for specific length
        assert navigation.select_start_position("alpha1_alpha1")
        assert sequence.build_sequence(length=2)

        # Wait for sequence to reach expected length
        assert WaitConditions.wait_for_sequence_length(validation.workbench, 2)

        LoggingHelpers.log_test_end("Wait Conditions and Helpers", True)

    def test_performance_monitoring(self, workflow_steps):
        """
        Test performance monitoring capabilities.
        """
        LoggingHelpers.log_test_start("Performance Monitoring")

        # Create workflow for performance testing
        workflow = (
            WorkflowBuilder(workflow_steps)
            .navigate_to_position("alpha1_alpha1")
            .build_sequence(length=5)
            .validate_length(5)
        )

        # Measure workflow performance
        metrics = PerformanceHelpers.measure_workflow_performance(workflow)

        # Verify performance metrics
        assert metrics["successful"], "Performance test workflow failed"
        assert metrics["total_duration"] > 0, "Duration should be positive"
        assert metrics["operations_count"] > 0, "Should have operations"

        logger.info(f"Performance metrics: {metrics}")

        LoggingHelpers.log_test_end("Performance Monitoring", True)

    def test_builder_convenience_methods(self, workflow_steps):
        """
        Test builder convenience methods for common patterns.
        """
        LoggingHelpers.log_test_start("Builder Convenience Methods")

        # Test simple sequence builder
        simple_config = SequenceBuilder.simple_sequence("alpha1_alpha1", 3)
        assert simple_config.execute(workflow_steps)

        # Test test sequence builder
        test_config = SequenceBuilder.test_sequence(2)
        assert test_config.execute(workflow_steps)

        # Test workflow convenience methods
        simple_workflow = WorkflowBuilder.simple_sequence_workflow(
            workflow_steps, "alpha1_alpha1", 4
        )
        result = simple_workflow.execute()
        assert result.successful

        LoggingHelpers.log_test_end("Builder Convenience Methods", True)

    def test_workflow_with_custom_operations(self, workflow_steps):
        """
        Test workflow with custom operations and validations.
        """
        LoggingHelpers.log_test_start("Custom Operations and Validations")

        validation = workflow_steps["validation"]

        # Custom operation: log current sequence state
        def log_sequence_state():
            LoggingHelpers.log_component_state(
                validation.workbench, "Sequence Workbench"
            )
            return True

        # Custom validation: check sequence length is even
        def validate_even_length():
            length = validation.workbench.get_sequence_length()
            return length % 2 == 0

        # Build workflow with custom operations
        result = (
            WorkflowBuilder(workflow_steps)
            .navigate_to_position("alpha1_alpha1")
            .build_sequence(length=4)
            .custom_operation(log_sequence_state, "Log sequence state")
            .custom_validation(validate_even_length, "Validate even length")
            .execute()
        )

        assert (
            result.successful
        ), f"Custom operations workflow failed: {result.error_message}"

        LoggingHelpers.log_test_end("Custom Operations and Validations", True)

    @pytest.mark.parametrize(
        "config",
        [
            {"position": "alpha1_alpha1", "length": 2},
            {"position": "alpha1_alpha1", "length": 3},
            {"position": "alpha1_alpha1", "length": 4},
        ],
    )
    def test_parameterized_with_builders(self, workflow_steps, config):
        """
        Test parameterized testing with builder patterns.
        """
        LoggingHelpers.log_test_start("Parameterized with Builders", config)

        # Create configuration from parameters
        sequence_config = (
            SequenceBuilder()
            .with_start_position(config["position"])
            .with_length(config["length"])
            .clear_before_build(True)
            .build()
        )

        # Execute and validate
        success = sequence_config.execute(workflow_steps)
        TKAAssertions.assert_workflow_successful(
            success, "Parameterized sequence building"
        )
        TKAAssertions.assert_sequence_length(
            workflow_steps["validation"].workbench, config["length"]
        )

        LoggingHelpers.log_test_end("Parameterized with Builders", True)

    def test_comprehensive_framework_integration(self, workflow_steps):
        """
        Test comprehensive integration of all framework features.

        This test demonstrates the full power of the modern framework by
        combining all advanced features in a single, complex workflow.
        """
        LoggingHelpers.log_test_start("Comprehensive Framework Integration")

        # Phase 1: Use builder pattern for initial configuration
        initial_config = (
            SequenceBuilder()
            .with_start_position("alpha1_alpha1")
            .with_length(3)
            .with_validation_rules({"must_be_valid": True})
            .clear_before_build(True)
            .build()
        )

        assert initial_config.execute(workflow_steps)

        # Phase 2: Use fluent interface for complex operations
        workflow_result = (
            WorkflowBuilder(workflow_steps)
            .extend_sequence(additional_length=2)
            .validate_length(5)
            .clear_sequence()
            .validate_empty()
            .navigate_to_position("alpha1_alpha1")
            .build_sequence(length=4)
            .validate_length_in_range(3, 6)
            .validate_is_valid()
            .execute()
        )

        # Phase 3: Use custom assertions for final validation
        TKAAssertions.assert_workflow_successful(
            workflow_result, "Comprehensive workflow"
        )
        TKAAssertions.assert_sequence_length(workflow_steps["validation"].workbench, 4)
        TKAAssertions.assert_sequence_valid(workflow_steps["validation"].workbench)

        # Phase 4: Performance and state monitoring
        summary = workflow_steps["validation"].get_validation_summary()
        assert summary["is_valid"]
        assert summary["length"] == 4
        assert summary["workbench_functional"]

        LoggingHelpers.log_test_end("Comprehensive Framework Integration", True)
        logger.info("🎉 All advanced features working perfectly together!")
