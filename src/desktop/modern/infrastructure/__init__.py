"""
Modern Infrastructure Services

This module contains infrastructure services for the modern TKA desktop application.
"""

from .path_resolver import path_resolver, TKAPathResolver

__all__ = [
    "path_resolver",
    "TKAPathResolver",
]