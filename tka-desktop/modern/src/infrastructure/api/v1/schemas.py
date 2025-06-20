"""
Enhanced API schemas with comprehensive validation and response models.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Any, Dict, Union
from datetime import datetime
from enum import Enum


class APIVersion(str, Enum):
    """API version enumeration."""
    V1 = "1.0"
    V2 = "2.0"


class ResponseStatus(str, Enum):
    """Response status enumeration."""
    SUCCESS = "success"
    ERROR = "error"
    WARNING = "warning"


class BaseResponse(BaseModel):
    """Base response model for all API responses."""
    success: bool
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    version: APIVersion = APIVersion.V1
    request_id: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() + 'Z'
        }


class ErrorResponse(BaseResponse):
    """Error response model with detailed error information."""
    success: bool = False
    error_code: str
    error_message: str
    details: Optional[Dict[str, Any]] = None
    stack_trace: Optional[str] = None
    
    @validator('error_code')
    def validate_error_code(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Error code cannot be empty')
        return v.upper()


class ValidationErrorResponse(ErrorResponse):
    """Validation error response with field-specific errors."""
    error_code: str = "VALIDATION_ERROR"
    validation_errors: List[Dict[str, Any]] = Field(default_factory=list)
    
    def add_field_error(self, field: str, message: str, value: Any = None):
        """Add a field-specific validation error."""
        self.validation_errors.append({
            "field": field,
            "message": message,
            "value": str(value) if value is not None else None
        })


class SuccessResponse(BaseResponse):
    """Success response model with optional data payload."""
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[Dict[str, Any]] = None


class SequenceResponse(SuccessResponse):
    """Response model for sequence operations."""
    data: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None
    
    @validator('data')
    def validate_sequence_data(cls, v):
        required_fields = ['id', 'name', 'beats']
        for field in required_fields:
            if field not in v:
                raise ValueError(f'Sequence data must contain {field}')
        return v


class HealthCheckResponse(BaseResponse):
    """Health check response model."""
    success: bool = True
    status: str = "healthy"
    checks: Dict[str, bool] = Field(default_factory=dict)
    uptime_seconds: float = 0.0
    services: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    
    @validator('status')
    def validate_status(cls, v):
        valid_statuses = ['healthy', 'degraded', 'unhealthy']
        if v not in valid_statuses:
            raise ValueError(f'Status must be one of: {valid_statuses}')
        return v


class PerformanceMetricsResponse(SuccessResponse):
    """Performance metrics response model."""
    data: Dict[str, Any]
    summary: Dict[str, Union[int, float, str]] = Field(default_factory=dict)
    
    @validator('data')
    def validate_metrics_data(cls, v):
        if not isinstance(v, dict):
            raise ValueError('Metrics data must be a dictionary')
        return v


class CreateSequenceRequest(BaseModel):
    """Request model for creating a new sequence."""
    name: str = Field(..., min_length=1, max_length=100)
    length: int = Field(default=16, ge=1, le=64)
    word: Optional[str] = Field(None, max_length=64)
    start_position: Optional[str] = Field(None, regex=r'^(alpha|beta|gamma)$')
    metadata: Optional[Dict[str, Any]] = None
    
    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Sequence name cannot be empty or whitespace')
        return v.strip()
    
    @validator('word')
    def validate_word(cls, v):
        if v is not None:
            v = v.strip().upper()
            if not v.isalpha():
                raise ValueError('Word must contain only alphabetic characters')
        return v


class UpdateSequenceRequest(BaseModel):
    """Request model for updating an existing sequence."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    metadata: Optional[Dict[str, Any]] = None
    
    @validator('name')
    def validate_name(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Sequence name cannot be empty or whitespace')
        return v.strip() if v else None


class BeatRequest(BaseModel):
    """Request model for beat operations."""
    beat_number: int = Field(..., ge=1)
    letter: Optional[str] = Field(None, min_length=1, max_length=1)
    duration: float = Field(default=1.0, gt=0.0, le=10.0)
    metadata: Optional[Dict[str, Any]] = None
    
    @validator('letter')
    def validate_letter(cls, v):
        if v is not None:
            v = v.upper()
            if not v.isalpha():
                raise ValueError('Letter must be a single alphabetic character')
        return v


class MotionRequest(BaseModel):
    """Request model for motion data."""
    motion_type: str = Field(..., regex=r'^(pro|anti|static|dash|shift)$')
    prop_rot_dir: str = Field(..., regex=r'^(cw|ccw)$')
    start_loc: str = Field(..., regex=r'^(alpha|beta|gamma)$')
    end_loc: str = Field(..., regex=r'^(alpha|beta|gamma)$')
    turns: int = Field(default=1, ge=0, le=4)
    start_ori: str = Field(default="in", regex=r'^(in|out|clock|counter)$')
    end_ori: str = Field(default="in", regex=r'^(in|out|clock|counter)$')
    
    @validator('start_loc', 'end_loc')
    def validate_locations(cls, v):
        return v.lower()
    
    @validator('motion_type')
    def validate_motion_type(cls, v):
        return v.lower()
    
    @validator('prop_rot_dir')
    def validate_rotation_direction(cls, v):
        return v.lower()


# Request/Response type unions for OpenAPI documentation
APIRequest = Union[
    CreateSequenceRequest,
    UpdateSequenceRequest,
    BeatRequest,
    MotionRequest,
]

APIResponse = Union[
    SuccessResponse,
    ErrorResponse,
    ValidationErrorResponse,
    SequenceResponse,
    HealthCheckResponse,
    PerformanceMetricsResponse,
]
