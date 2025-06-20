"""
Custom API exceptions for the TKA Desktop API.
"""

from fastapi import HTTPException, status


class TKAAPIException(HTTPException):
    """Base exception for TKA API errors."""

    def __init__(
        self, detail: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    ):
        super().__init__(status_code=status_code, detail=detail)


class ServiceUnavailableException(TKAAPIException):
    """Exception for when a service is unavailable."""

    def __init__(self, service_name: str):
        super().__init__(
            detail=f"{service_name} service not available",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


class ResourceNotFoundException(TKAAPIException):
    """Exception for when a resource is not found."""

    def __init__(self, resource_type: str, resource_id: str):
        super().__init__(
            detail=f"{resource_type} with ID '{resource_id}' not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class ValidationException(TKAAPIException):
    """Exception for validation errors."""

    def __init__(self, detail: str):
        super().__init__(detail=detail, status_code=status.HTTP_400_BAD_REQUEST)
