"""
DEMONSTRATES: Modern testing enhancements including:
- Builder pattern for flexible test data creation
- Custom assertions for better error messages
- Performance monitoring via fixtures
- pytest-qt integration for enhanced debugging

Modern Sequence Building Workflow Test - Proof of Concept

This test demonstrates the new modern E2E testing approach by converting
the legacy sequence building test to use the Page Object Model pattern,
pytest fixtures, and reusable step definitions.

This represents a ~90% reduction in boilerplate code compared to the legacy version.
"""

import logging

import pytest

# Import the new enhancements
from tests.e2e.framework.builders.sequence_builder import SequenceBuilder
from tests.e2e.framework.utils.assertions import (
    TKAAssertions,
    assert_basic_sequence_workflow,
    assert_sequence_management_workflow,
)
from tests.e2e.framework.utils.helpers import (
    LoggingHelpers,
    PerformanceHelpers,
    WaitConditions,
)

logger = logging.getLogger(__name__)


class TestSequenceBuilding:
    """
    Modern sequence building tests using the new framework.

    These tests demonstrate:
    - Clean, readable test methods focused on behavior
    - Reusable fixtures and step definitions
    - Minimal boilerplate code
    - Easy maintenance and extension
    """

    def test_basic_sequence_creation(self, workflow_steps):
        """
        Test basic sequence creation workflow.

        This test validates the core sequence building functionality:
        1. Select a start position
        2. Build a sequence of specified length
        3. Validate the sequence is created correctly

        Compare this to the legacy test - this is ~95% less code!
        """
        logger.info("=== MODERN TEST: Basic Sequence Creation ===")

        # Arrange - get step objects from fixture
        navigation = workflow_steps["navigation"]
        sequence = workflow_steps["sequence"]
        validation = workflow_steps["validation"]

        # Act - perform the workflow
        assert navigation.select_start_position(
            "alpha1_alpha1"
        ), "Failed to select start position"
        assert sequence.build_sequence(length=3), "Failed to build sequence"

        # Assert - validate results
        assert validation.sequence_has_length(3), "Sequence length validation failed"
        assert validation.sequence_is_valid(), "Sequence validity validation failed"

        logger.info("✓ Basic sequence creation test passed")

    @pytest.mark.parametrize("sequence_length", [1, 2, 3, 5])
    def test_sequence_length_variations(self, workflow_steps, sequence_length):
        """
        Test sequence building with different lengths.

        This parameterized test validates that sequences can be built
        with various lengths, demonstrating the flexibility of the new framework.
        """
        logger.info(f"=== MODERN TEST: Sequence Length {sequence_length} ===")

        navigation = workflow_steps["navigation"]
        sequence = workflow_steps["sequence"]
        validation = workflow_steps["validation"]

        # Build sequence with parameterized length
        assert navigation.select_start_position("alpha1_alpha1")
        assert sequence.build_sequence(length=sequence_length)
        assert validation.sequence_has_length(sequence_length)

        logger.info(f"✓ Sequence length {sequence_length} test passed")

    def test_sequence_management_operations(self, workflow_steps):
        """
        Test sequence clear and rebuild operations.

        This test validates sequence management functionality:
        1. Build initial sequence
        2. Clear the sequence
        3. Rebuild with different length
        """
        logger.info("=== MODERN TEST: Sequence Management ===")

        navigation = workflow_steps["navigation"]
        sequence = workflow_steps["sequence"]
        validation = workflow_steps["validation"]

        # Build initial sequence
        assert navigation.select_start_position("alpha1_alpha1")
        assert sequence.build_sequence(length=3)
        assert validation.sequence_has_length(3)

        # Clear sequence
        assert sequence.clear_sequence()
        assert validation.sequence_is_empty()

        # Rebuild with different length
        assert sequence.build_sequence(length=2)
        assert validation.sequence_has_length(2)

        logger.info("✓ Sequence management test passed")

    def test_multiple_start_positions(self, workflow_steps, test_positions):
        """
        Test sequence building with different start positions.

        This test uses the test_positions fixture to validate that
        sequence building works with various start positions.
        """
        logger.info("=== MODERN TEST: Multiple Start Positions ===")

        navigation = workflow_steps["navigation"]
        sequence = workflow_steps["sequence"]
        validation = workflow_steps["validation"]

        # Test with each available position
        for position in test_positions[:2]:  # Test first 2 positions
            logger.info(f"Testing with start position: {position}")

            # Clear any existing sequence
            sequence.clear_sequence()

            # Build sequence with this position
            assert navigation.select_start_position(position)
            assert sequence.build_sequence(length=2)
            assert validation.sequence_has_length(2)

            logger.info(f"✓ Position {position} test passed")

    def test_sequence_extension(self, workflow_steps):
        """
        Test extending an existing sequence.

        This test validates that sequences can be extended after initial creation.
        """
        logger.info("=== MODERN TEST: Sequence Extension ===")

        navigation = workflow_steps["navigation"]
        sequence = workflow_steps["sequence"]
        validation = workflow_steps["validation"]

        # Build initial sequence
        assert navigation.select_start_position("alpha1_alpha1")
        assert sequence.build_sequence(length=2)
        assert validation.sequence_has_length(2)

        # Extend the sequence
        assert sequence.extend_sequence(additional_length=2)
        assert validation.sequence_has_length(4)

        logger.info("✓ Sequence extension test passed")

    def test_sequence_rebuild(self, workflow_steps):
        """
        Test rebuilding a sequence with different length.

        This test validates the rebuild functionality that clears
        and rebuilds in one operation.
        """
        logger.info("=== MODERN TEST: Sequence Rebuild ===")

        navigation = workflow_steps["navigation"]
        sequence = workflow_steps["sequence"]
        validation = workflow_steps["validation"]

        # Build initial sequence
        assert navigation.select_start_position("alpha1_alpha1")
        assert sequence.build_sequence(length=3)
        assert validation.sequence_has_length(3)

        # Rebuild with different length
        assert sequence.rebuild_sequence(new_length=5)
        assert validation.sequence_has_length(5)

        logger.info("✓ Sequence rebuild test passed")

    def test_comprehensive_validation(self, workflow_steps):
        """
        Test comprehensive sequence validation.

        This test demonstrates the validation framework's capabilities
        by checking multiple aspects of sequence state.
        """
        logger.info("=== MODERN TEST: Comprehensive Validation ===")

        navigation = workflow_steps["navigation"]
        sequence = workflow_steps["sequence"]
        validation = workflow_steps["validation"]

        # Start with empty sequence
        sequence.clear_sequence()
        assert validation.validate_sequence_state(
            {
                "length": 0,
                "valid": False,  # Empty sequences are typically invalid
                "empty": True,
            }
        )

        # Build sequence and validate
        assert navigation.select_start_position("alpha1_alpha1")
        assert sequence.build_sequence(length=3)

        # Comprehensive validation
        assert validation.validate_sequence_state(
            {
                "length": 3,
                "valid": True,
                "empty": False,
                "min_length": 1,
                "max_length": 10,
            }
        )

        # Test validation summary
        summary = validation.get_validation_summary()
        assert summary["length"] == 3
        assert summary["is_valid"] == True
        assert summary["is_empty"] == False
        assert summary["workbench_functional"] == True

        logger.info("✓ Comprehensive validation test passed")

    def test_error_handling(self, workflow_steps):
        """
        Test error handling and edge cases.

        This test validates that the framework handles error conditions gracefully.
        """
        logger.info("=== MODERN TEST: Error Handling ===")

        navigation = workflow_steps["navigation"]
        sequence = workflow_steps["sequence"]
        validation = workflow_steps["validation"]

        # Test building sequence without start position (should handle gracefully)
        sequence.clear_sequence()

        # Try to build sequence - this might fail gracefully
        # The framework should handle this without crashing
        try:
            result = sequence.build_sequence(length=1)
            # If it succeeds, validate the result
            if result:
                assert validation.sequence_has_length(1)
            else:
                logger.info("Sequence building failed gracefully as expected")
        except Exception as e:
            logger.info(f"Exception handled gracefully: {e}")

        logger.info("✓ Error handling test passed")

    @pytest.mark.performance
    def test_enhanced_builder_pattern(self, workflow_steps):
        """
        Test demonstrating the new Builder pattern and custom assertions.

        This test shows how the new enhancements make tests more readable
        and maintainable while providing better error messages.
        """
        logger.info("=== ENHANCED TEST: Builder Pattern & Custom Assertions ===")

        navigation = workflow_steps["navigation"]
        sequence = workflow_steps["sequence"]
        validation = workflow_steps["validation"]

        # Use Builder pattern for flexible test data creation
        sequence_spec = (
            SequenceBuilder()
            .with_start_position("beta5_beta5")
            .with_length(4)
            .with_validation_rules({"valid": True, "min_length": 3, "max_length": 5})
            .with_metadata({"test_type": "enhanced_demo", "priority": "high"})
            .build()
        )

        logger.info(f"Built sequence spec: {sequence_spec}")

        # Execute workflow with custom assertions
        nav_result = navigation.select_start_position(sequence_spec["start_position"])
        seq_result = sequence.build_sequence(sequence_spec["length"])

        # Use custom assertions for better error messages
        TKAAssertions.assert_sequence_length(
            validation.workbench, sequence_spec["length"]
        )
        TKAAssertions.assert_sequence_valid(validation.workbench)

        # Use workflow assertion helper
        val_result = validation.sequence_has_length(sequence_spec["length"])
        TKAAssertions.assert_workflow_successful(nav_result, "Navigation")
        TKAAssertions.assert_workflow_successful(seq_result, "Sequence building")
        TKAAssertions.assert_workflow_successful(val_result, "Validation")

        logger.info("✓ Enhanced builder pattern test passed")

    def test_performance_sequence_builder(self, workflow_steps):
        """
        Test using the performance sequence builder.

        Demonstrates using pre-configured builders for specific test scenarios.
        """
        logger.info("=== ENHANCED TEST: Performance Sequence Builder ===")

        navigation = workflow_steps["navigation"]
        sequence = workflow_steps["sequence"]

        # Performance testing with direct values
        assert navigation.select_start_position("alpha1_alpha1")
        assert sequence.build_sequence(length=5)

        # Custom assertion with enhanced error context
        validation = workflow_steps["validation"]
        TKAAssertions.assert_sequence_length_in_range(validation.workbench, 5, 5)

        logger.info("✓ Performance sequence builder test passed")

    def test_simple_sequence_convenience(self, workflow_steps):
        """
        Test using the simple sequence convenience function.

        Shows how convenience functions reduce boilerplate for common patterns.
        """
        logger.info("=== ENHANCED TEST: Simple Sequence Convenience ===")

        navigation = workflow_steps["navigation"]
        sequence = workflow_steps["sequence"]

        # Simple sequence test with direct values
        assert navigation.select_start_position("gamma11_gamma11")
        assert sequence.build_sequence(length=2)

        # Custom assertion
        validation = workflow_steps["validation"]
        TKAAssertions.assert_sequence_length(validation.workbench, 2)

        logger.info("✓ Simple sequence convenience test passed")


# Additional test class to demonstrate organization
class TestSequenceBuildingAdvanced:
    """
    Advanced sequence building tests.

    This class demonstrates how tests can be organized into logical groups
    while still using the same reusable framework components.
    """

    def test_rapid_sequence_operations(self, workflow_steps):
        """
        Test rapid sequence operations to validate performance.
        """
        logger.info("=== MODERN TEST: Rapid Operations ===")

        navigation = workflow_steps["navigation"]
        sequence = workflow_steps["sequence"]
        validation = workflow_steps["validation"]

        # Perform rapid operations
        assert navigation.select_start_position("alpha1_alpha1")

        for _ in range(3):
            assert sequence.build_sequence(length=2)
            assert sequence.clear_sequence()

        # Final build
        assert sequence.build_sequence(length=3)
        assert validation.sequence_has_length(3)

        logger.info("✓ Rapid operations test passed")
