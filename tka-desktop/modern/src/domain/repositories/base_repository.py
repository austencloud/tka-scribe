"""
Base repository pattern implementation with Result types and validation.
"""

from abc import ABC, abstractmethod
from typing import TypeVar, Generic, List, Optional, Dict, Any, Union
from dataclasses import dataclass
from datetime import datetime

from core.types.result import Result
from core.exceptions import ValidationError, DataProcessingError

T = TypeVar('T')  # Entity type
ID = TypeVar('ID')  # ID type


@dataclass
class QueryCriteria:
    """Query criteria for repository operations."""
    filters: Dict[str, Any] = None
    sort_by: Optional[str] = None
    sort_order: str = "asc"  # "asc" or "desc"
    limit: Optional[int] = None
    offset: int = 0
    
    def __post_init__(self):
        if self.filters is None:
            self.filters = {}


@dataclass
class RepositoryResult(Generic[T]):
    """Repository operation result with metadata."""
    data: T
    metadata: Dict[str, Any] = None
    total_count: Optional[int] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


class IRepository(Generic[T, ID], ABC):
    """
    Generic repository interface for data persistence operations.
    
    Provides type-safe CRUD operations with Result types for error handling
    and comprehensive validation support.
    """
    
    @abstractmethod
    async def get_by_id(self, id: ID) -> Result[Optional[T], Exception]:
        """
        Retrieve entity by ID.
        
        Args:
            id: Entity identifier
            
        Returns:
            Result containing entity or None if not found
        """
        pass
    
    @abstractmethod
    async def get_all(self, criteria: Optional[QueryCriteria] = None) -> Result[List[T], Exception]:
        """
        Retrieve all entities matching criteria.
        
        Args:
            criteria: Optional query criteria for filtering and sorting
            
        Returns:
            Result containing list of entities
        """
        pass
    
    @abstractmethod
    async def save(self, entity: T) -> Result[T, Exception]:
        """
        Save entity (create or update).
        
        Args:
            entity: Entity to save
            
        Returns:
            Result containing saved entity with updated metadata
        """
        pass
    
    @abstractmethod
    async def delete(self, id: ID) -> Result[bool, Exception]:
        """
        Delete entity by ID.
        
        Args:
            id: Entity identifier
            
        Returns:
            Result indicating success/failure
        """
        pass
    
    @abstractmethod
    async def exists(self, id: ID) -> Result[bool, Exception]:
        """
        Check if entity exists.
        
        Args:
            id: Entity identifier
            
        Returns:
            Result indicating existence
        """
        pass
    
    @abstractmethod
    async def count(self, criteria: Optional[QueryCriteria] = None) -> Result[int, Exception]:
        """
        Count entities matching criteria.
        
        Args:
            criteria: Optional query criteria for filtering
            
        Returns:
            Result containing count
        """
        pass
    
    @abstractmethod
    async def find_by_criteria(self, criteria: QueryCriteria) -> Result[RepositoryResult[List[T]], Exception]:
        """
        Find entities by criteria with metadata.
        
        Args:
            criteria: Query criteria
            
        Returns:
            Result containing entities with metadata (total count, etc.)
        """
        pass


class BaseRepository(IRepository[T, ID], ABC):
    """
    Base repository implementation with common functionality.
    
    Provides validation, error handling, and common operations
    that can be shared across concrete repository implementations.
    """
    
    def __init__(self, entity_type: type):
        self.entity_type = entity_type
        self._validators: List[callable] = []
    
    def add_validator(self, validator: callable):
        """Add a validation function for entities."""
        self._validators.append(validator)
    
    def validate_entity(self, entity: T) -> Result[None, ValidationError]:
        """
        Validate entity using registered validators.
        
        Args:
            entity: Entity to validate
            
        Returns:
            Result indicating validation success/failure
        """
        try:
            for validator in self._validators:
                validation_result = validator(entity)
                if isinstance(validation_result, Result) and validation_result.is_error():
                    return validation_result
                elif validation_result is False:
                    return Result.error(
                        ValidationError(
                            f"Validation failed for {self.entity_type.__name__}",
                            context={"entity": str(entity)}
                        )
                    )
            
            return Result.ok(None)
            
        except Exception as e:
            return Result.error(
                ValidationError(
                    f"Validation error for {self.entity_type.__name__}: {str(e)}",
                    context={"entity": str(entity), "error": str(e)}
                )
            )
    
    def validate_id(self, id: ID) -> Result[None, ValidationError]:
        """
        Validate entity ID.
        
        Args:
            id: ID to validate
            
        Returns:
            Result indicating validation success/failure
        """
        if id is None:
            return Result.error(
                ValidationError("Entity ID cannot be None")
            )
        
        if isinstance(id, str) and not id.strip():
            return Result.error(
                ValidationError("Entity ID cannot be empty string")
            )
        
        return Result.ok(None)
    
    def validate_criteria(self, criteria: QueryCriteria) -> Result[None, ValidationError]:
        """
        Validate query criteria.
        
        Args:
            criteria: Criteria to validate
            
        Returns:
            Result indicating validation success/failure
        """
        if criteria.limit is not None and criteria.limit <= 0:
            return Result.error(
                ValidationError("Limit must be positive")
            )
        
        if criteria.offset < 0:
            return Result.error(
                ValidationError("Offset must be non-negative")
            )
        
        if criteria.sort_order not in ["asc", "desc"]:
            return Result.error(
                ValidationError("Sort order must be 'asc' or 'desc'")
            )
        
        return Result.ok(None)
    
    async def safe_operation(self, operation_name: str, operation: callable, *args, **kwargs) -> Result[Any, Exception]:
        """
        Execute repository operation safely with error handling.
        
        Args:
            operation_name: Name of the operation for logging
            operation: Operation function to execute
            *args: Operation arguments
            **kwargs: Operation keyword arguments
            
        Returns:
            Result of the operation
        """
        try:
            result = await operation(*args, **kwargs)
            return Result.ok(result)
        except ValidationError as e:
            return Result.error(e)
        except Exception as e:
            return Result.error(
                DataProcessingError(
                    f"Repository operation '{operation_name}' failed: {str(e)}",
                    processing_stage=operation_name,
                    context={"args": str(args), "kwargs": str(kwargs)}
                )
            )


# Utility functions for common validation patterns
def validate_required_fields(entity: Any, required_fields: List[str]) -> Result[None, ValidationError]:
    """Validate that entity has all required fields."""
    for field in required_fields:
        if not hasattr(entity, field):
            return Result.error(
                ValidationError(f"Missing required field: {field}", field=field)
            )
        
        value = getattr(entity, field)
        if value is None or (isinstance(value, str) and not value.strip()):
            return Result.error(
                ValidationError(f"Required field cannot be empty: {field}", field=field, value=value)
            )
    
    return Result.ok(None)


def validate_field_types(entity: Any, field_types: Dict[str, type]) -> Result[None, ValidationError]:
    """Validate that entity fields have correct types."""
    for field, expected_type in field_types.items():
        if hasattr(entity, field):
            value = getattr(entity, field)
            if value is not None and not isinstance(value, expected_type):
                return Result.error(
                    ValidationError(
                        f"Field '{field}' must be of type {expected_type.__name__}",
                        field=field,
                        value=value
                    )
                )
    
    return Result.ok(None)
