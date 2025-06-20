"""
Structured logging system for production-ready logging.
"""

import logging
import json
import sys
from typing import Dict, Any, Optional, Union
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass, asdict
from enum import Enum


class LogLevel(Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


@dataclass
class LogContext:
    """Structured context for log entries."""
    operation: Optional[str] = None
    user_id: Optional[str] = None
    request_id: Optional[str] = None
    component: Optional[str] = None
    duration_ms: Optional[float] = None
    error_type: Optional[str] = None
    error_message: Optional[str] = None
    stack_trace: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {k: v for k, v in asdict(self).items() if v is not None}


class StructuredFormatter(logging.Formatter):
    """JSON formatter for structured logging."""
    
    def format(self, record: logging.LogRecord) -> str:
        # Base log entry
        log_entry = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
            'thread': record.thread,
            'process': record.process,
        }
        
        # Add context if provided
        if hasattr(record, 'context') and record.context:
            if isinstance(record.context, LogContext):
                log_entry.update(record.context.to_dict())
            elif isinstance(record.context, dict):
                log_entry.update(record.context)
        
        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_entry, ensure_ascii=False)


class StructuredLogger:
    """
    Production-ready structured logger.
    
    Usage:
        logger = StructuredLogger(__name__)
        
        # Simple logging
        logger.info("User logged in", user_id="123", operation="login")
        
        # With context object
        context = LogContext(operation="database_query", duration_ms=150.5)
        logger.info("Query completed", context=context)
        
        # Error logging with exception
        try:
            raise ValueError("Something went wrong")
        except Exception as e:
            logger.error("Operation failed", error=e, operation="data_processing")
    """
    
    def __init__(self, name: str, level: LogLevel = LogLevel.INFO):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, level.value))
        
        # Remove existing handlers to avoid duplicates
        for handler in self.logger.handlers[:]:
            self.logger.removeHandler(handler)
        
        # Add structured handler
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(StructuredFormatter())
        self.logger.addHandler(handler)
        
        # Prevent propagation to avoid duplicate logs
        self.logger.propagate = False
    
    def debug(self, message: str, context: Optional[Union[LogContext, Dict[str, Any]]] = None, **kwargs):
        """Log debug message."""
        self._log(LogLevel.DEBUG, message, context, **kwargs)
    
    def info(self, message: str, context: Optional[Union[LogContext, Dict[str, Any]]] = None, **kwargs):
        """Log info message."""
        self._log(LogLevel.INFO, message, context, **kwargs)
    
    def warning(self, message: str, context: Optional[Union[LogContext, Dict[str, Any]]] = None, **kwargs):
        """Log warning message."""
        self._log(LogLevel.WARNING, message, context, **kwargs)
    
    def error(self, message: str, 
              error: Optional[Exception] = None,
              context: Optional[Union[LogContext, Dict[str, Any]]] = None, 
              **kwargs):
        """Log error message with optional exception."""
        if error:
            kwargs['error_type'] = type(error).__name__
            kwargs['error_message'] = str(error)
        
        self._log(LogLevel.ERROR, message, context, exc_info=error is not None, **kwargs)
    
    def critical(self, message: str, 
                 error: Optional[Exception] = None,
                 context: Optional[Union[LogContext, Dict[str, Any]]] = None, 
                 **kwargs):
        """Log critical message with optional exception."""
        if error:
            kwargs['error_type'] = type(error).__name__
            kwargs['error_message'] = str(error)
        
        self._log(LogLevel.CRITICAL, message, context, exc_info=error is not None, **kwargs)
    
    def _log(self, level: LogLevel, message: str, 
             context: Optional[Union[LogContext, Dict[str, Any]]] = None,
             exc_info: bool = False,
             **kwargs):
        """Internal logging method."""
        # Merge context with kwargs
        if context:
            if isinstance(context, LogContext):
                merged_context = context.to_dict()
                merged_context.update(kwargs)
            else:
                merged_context = {**context, **kwargs}
        else:
            merged_context = kwargs
        
        # Create log context
        final_context = LogContext()
        for key, value in merged_context.items():
            if hasattr(final_context, key):
                setattr(final_context, key, value)
        
        # Log with context
        log_method = getattr(self.logger, level.value.lower())
        log_method(message, extra={'context': final_context}, exc_info=exc_info)


class LoggerManager:
    """Centralized logger management."""
    
    _loggers: Dict[str, StructuredLogger] = {}
    _default_level: LogLevel = LogLevel.INFO
    
    @classmethod
    def get_logger(cls, name: str, level: Optional[LogLevel] = None) -> StructuredLogger:
        """Get or create a logger with the given name."""
        if name not in cls._loggers:
            cls._loggers[name] = StructuredLogger(name, level or cls._default_level)
        return cls._loggers[name]
    
    @classmethod
    def set_global_level(cls, level: LogLevel):
        """Set global logging level for all loggers."""
        cls._default_level = level
        for logger in cls._loggers.values():
            logger.logger.setLevel(getattr(logging, level.value))
    
    @classmethod
    def configure_file_logging(cls, log_file: Path, level: LogLevel = LogLevel.INFO):
        """Add file logging to all loggers."""
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(StructuredFormatter())
        file_handler.setLevel(getattr(logging, level.value))
        
        for logger in cls._loggers.values():
            logger.logger.addHandler(file_handler)


# Convenience function for getting loggers
def get_logger(name: str) -> StructuredLogger:
    """Get a structured logger for the given name."""
    return LoggerManager.get_logger(name)
