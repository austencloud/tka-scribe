"""
TKA Desktop Structured Logging Module

A+ Enhancement: Production-ready structured logging system with JSON output,
contextual information, and centralized log management.

ARCHITECTURE: Provides structured logging with JSON formatting, contextual
information tracking, and centralized logger management for production
observability and debugging.

EXPORTS:
- StructuredLogger: Main structured logger class
- LogContext: Structured context for log entries
- LogLevel: Log level enumeration
- LoggerManager: Centralized logger management
- get_logger: Convenience function for getting loggers
"""

# Structured Logging Components
from .structured_logger import (
    StructuredLogger,
    LogContext,
    LogLevel,
    StructuredFormatter,
    LoggerManager,
    get_logger,
)

__all__ = [
    "StructuredLogger",
    "LogContext", 
    "LogLevel",
    "StructuredFormatter",
    "LoggerManager",
    "get_logger",
]
