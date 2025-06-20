"""
Result type for functional error handling.
Eliminates exceptions in business logic and provides type-safe error handling.
"""

from typing import TypeVar, Generic, Union, Callable, Optional, Any
from dataclasses import dataclass
from abc import ABC, abstractmethod

T = TypeVar('T')
E = TypeVar('E')
U = TypeVar('U')


@dataclass(frozen=True)
class Result(Generic[T, E], ABC):
    """
    Functional error handling result type.
    
    Example:
        def divide(a: int, b: int) -> Result[float, str]:
            if b == 0:
                return Result.error("Division by zero")
            return Result.ok(a / b)
            
        result = divide(10, 2)
        if result.is_ok():
            print(f"Result: {result.unwrap()}")
        else:
            print(f"Error: {result.unwrap_error()}")
    """
    
    @staticmethod
    def ok(value: T) -> 'Result[T, E]':
        """Create a successful result."""
        return _Ok(value)
    
    @staticmethod
    def error(error: E) -> 'Result[T, E]':
        """Create an error result."""
        return _Error(error)
    
    @abstractmethod
    def is_ok(self) -> bool:
        """Check if result is successful."""
        pass
    
    @abstractmethod
    def is_error(self) -> bool:
        """Check if result is an error."""
        pass
    
    @abstractmethod
    def unwrap(self) -> T:
        """Get the success value or raise exception."""
        pass
    
    @abstractmethod
    def unwrap_error(self) -> E:
        """Get the error value or raise exception."""
        pass
    
    @abstractmethod
    def unwrap_or(self, default: T) -> T:
        """Get the success value or return default."""
        pass
    
    def map(self, func: Callable[[T], U]) -> 'Result[U, E]':
        """Transform the success value if present."""
        if self.is_ok():
            try:
                return Result.ok(func(self.unwrap()))
            except Exception as e:
                return Result.error(e)  # type: ignore
        return Result.error(self.unwrap_error())
    
    def map_error(self, func: Callable[[E], U]) -> 'Result[T, U]':
        """Transform the error value if present."""
        if self.is_error():
            return Result.error(func(self.unwrap_error()))
        return Result.ok(self.unwrap())
    
    def and_then(self, func: Callable[[T], 'Result[U, E]']) -> 'Result[U, E]':
        """Chain operations that return Results."""
        if self.is_ok():
            return func(self.unwrap())
        return Result.error(self.unwrap_error())


@dataclass(frozen=True)
class _Ok(Result[T, E]):
    value: T
    
    def is_ok(self) -> bool:
        return True
    
    def is_error(self) -> bool:
        return False
    
    def unwrap(self) -> T:
        return self.value
    
    def unwrap_error(self) -> E:
        raise ValueError("Called unwrap_error on Ok value")
    
    def unwrap_or(self, default: T) -> T:
        return self.value


@dataclass(frozen=True)
class _Error(Result[T, E]):
    error: E
    
    def is_ok(self) -> bool:
        return False
    
    def is_error(self) -> bool:
        return True
    
    def unwrap(self) -> T:
        raise ValueError(f"Called unwrap on Error value: {self.error}")
    
    def unwrap_error(self) -> E:
        return self.error
    
    def unwrap_or(self, default: T) -> T:
        return default


# Convenience type aliases
Success = Result.ok
Error = Result.error


# Optional type for when you don't need specific error types
class Option(Generic[T]):
    """Optional type for null-safe operations."""
    
    @staticmethod
    def some(value: T) -> 'Option[T]':
        return _Some(value)
    
    @staticmethod
    def none() -> 'Option[T]':
        return _None()
    
    def is_some(self) -> bool:
        return isinstance(self, _Some)
    
    def is_none(self) -> bool:
        return isinstance(self, _None)
    
    def unwrap(self) -> T:
        if self.is_some():
            return self.value  # type: ignore
        raise ValueError("Called unwrap on None value")
    
    def unwrap_or(self, default: T) -> T:
        if self.is_some():
            return self.value  # type: ignore
        return default
    
    def map(self, func: Callable[[T], U]) -> 'Option[U]':
        if self.is_some():
            return Option.some(func(self.unwrap()))
        return Option.none()


@dataclass(frozen=True)
class _Some(Option[T]):
    value: T


@dataclass(frozen=True)
class _None(Option[T]):
    pass


# Helper functions for common patterns
def try_catch(func: Callable[[], T], *exceptions: type) -> Result[T, Exception]:
    """
    Convert exception-throwing function to Result.
    
    Example:
        result = try_catch(lambda: int("abc"))
        # Returns Result.error(ValueError(...))
    """
    try:
        return Result.ok(func())
    except exceptions as e:
        return Result.error(e)
    except Exception as e:
        return Result.error(e)


def collect_results(results: list[Result[T, E]]) -> Result[list[T], E]:
    """
    Convert list of Results to Result of list.
    Fails fast on first error.
    """
    values = []
    for result in results:
        if result.is_error():
            return Result.error(result.unwrap_error())
        values.append(result.unwrap())
    return Result.ok(values)
