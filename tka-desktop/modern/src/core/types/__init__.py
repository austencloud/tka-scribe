"""
TKA Desktop Core Types Module

A+ Enhancement: Comprehensive type system for functional programming patterns,
error handling, and type-safe operations across the TKA Desktop application.

ARCHITECTURE: Provides functional programming types including Result types for
error handling, Option types for null safety, and utility functions for
type-safe operations.

EXPORTS:
- Result: Functional error handling result type
- Option: Optional type for null-safe operations
- Success/Error: Convenience constructors for Result types
- try_catch: Exception-to-Result converter
- collect_results: Batch Result operations
"""

# Result Types for Functional Error Handling
from .result import (
    Result,
    Option,
    Success,
    Error,
    try_catch,
    collect_results,
)

__all__ = [
    "Result",
    "Option", 
    "Success",
    "Error",
    "try_catch",
    "collect_results",
]
