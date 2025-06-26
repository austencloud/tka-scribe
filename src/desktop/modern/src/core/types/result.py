"""
TKA Result Types

Provides Result[T, E] types for proper error handling throughout the TKA codebase.
Replaces silent failures with explicit error propagation.

USAGE:
    from core.types.result import Result, Success, Failure, AppError, ErrorType

    def risky_operation() -> Result[str, AppError]:
        try:
            # ... operation logic
            return Success("operation result")
        except Exception as e:
            return Failure(AppError(
                ErrorType.POSITIONING_ERROR,
                f"Operation failed: {e}",
                {"context": "additional_info"},
                e
            ))

    # Usage
    result = risky_operation()
    if result.is_success():
        value = result.value
    else:
        error = result.error
        logger.error(f"Error: {error.message}")
"""

from typing import TypeVar, Generic, Union, Optional, Any, Dict
from dataclasses import dataclass
from enum import Enum

T = TypeVar("T")
E = TypeVar("E")


@dataclass(frozen=True)
class Success(Generic[T]):
    """Represents a successful operation result."""

    value: T

    def is_success(self) -> bool:
        """Check if this is a success result."""
        return True

    def is_failure(self) -> bool:
        """Check if this is a failure result."""
        return False

    def unwrap(self) -> T:
        """Get the success value."""
        return self.value

    def unwrap_or(self, default: T) -> T:
        """Get the success value or return default."""
        _ = default  # Success always returns the value, not the default
        return self.value


@dataclass(frozen=True)
class Failure(Generic[E]):
    """Represents a failed operation result."""

    error: E
    context: Optional[Dict[str, Any]] = None

    def is_success(self) -> bool:
        """Check if this is a success result."""
        return False

    def is_failure(self) -> bool:
        """Check if this is a failure result."""
        return True

    def unwrap(self) -> Any:
        """Raise an exception when trying to unwrap a failure."""
        raise RuntimeError(f"Called unwrap() on Failure: {self.error}")

    def unwrap_or(self, default: T) -> T:
        """Return the default value for failures."""
        return default


# Result type alias
Result = Union[Success[T], Failure[E]]


class ErrorType(Enum):
    """Standard error categories for TKA operations."""

    POSITIONING_ERROR = "positioning_error"
    DATA_ERROR = "data_error"
    CONFIG_ERROR = "config_error"
    VALIDATION_ERROR = "validation_error"
    DEPENDENCY_INJECTION_ERROR = "dependency_injection_error"
    SERVICE_OPERATION_ERROR = "service_operation_error"
    FILE_SYSTEM_ERROR = "file_system_error"
    NETWORK_ERROR = "network_error"
    INITIALIZATION_ERROR = "initialization_error"
    PERFORMANCE_ERROR = "performance_error"
    SHUTDOWN_ERROR = "shutdown_error"
    STORAGE_ERROR = "storage_error"
    PROFILING_ERROR = "profiling_error"
    CONFIGURATION_ERROR = "configuration_error"


@dataclass(frozen=True)
class AppError:
    """Standard error type for TKA application errors."""

    error_type: ErrorType
    message: str
    details: Optional[Dict[str, Any]] = None
    cause: Optional[Exception] = None

    def __str__(self) -> str:
        """Return formatted error message."""
        if self.details:
            details_str = ", ".join(f"{k}={v}" for k, v in self.details.items())
            return f"{self.error_type.value}: {self.message} (Details: {details_str})"
        return f"{self.error_type.value}: {self.message}"


# Convenience functions for common Result patterns
def success(value: T) -> Success[T]:
    """Create a Success result."""
    return Success(value)


def failure(error: E, context: Optional[Dict[str, Any]] = None) -> Failure[E]:
    """Create a Failure result."""
    return Failure(error, context)


def app_error(
    error_type: ErrorType,
    message: str,
    details: Optional[Dict[str, Any]] = None,
    cause: Optional[Exception] = None,
) -> AppError:
    """Create an AppError."""
    return AppError(error_type, message, details, cause)


# Common Result type aliases will be defined in specific modules
# to avoid circular imports
