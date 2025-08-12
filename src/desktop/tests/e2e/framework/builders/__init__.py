"""
Builder patterns for TKA Modern E2E Testing Framework

This package contains builder classes that implement the Builder pattern
for creating flexible, readable test configurations and workflows.

Available Builders:
- SequenceBuilder: Builder for sequence test configurations
- WorkflowBuilder: Fluent interface for test workflows
"""

from .sequence_builder import SequenceBuilder
from .workflow_builder import WorkflowBuilder, WorkflowResult

__all__ = [
    "SequenceBuilder",
    "WorkflowBuilder",
    "WorkflowResult",
]
