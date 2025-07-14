"""
Animation service interfaces for TKA modern desktop app.
These interfaces define the contracts for fade and animation services.
"""

from abc import ABC, abstractmethod
from typing import Optional, List, Callable, Union, Dict, Any
from dataclasses import dataclass
from enum import Enum
from PyQt6.QtWidgets import QWidget, QStackedWidget, QGraphicsOpacityEffect
from PyQt6.QtCore import QPropertyAnimation, QParallelAnimationGroup, QEasingCurve


class EasingType(Enum):
    """Animation easing types."""
    LINEAR = QEasingCurve.Type.Linear
    IN_OUT_QUAD = QEasingCurve.Type.InOutQuad
    IN_OUT_CUBIC = QEasingCurve.Type.InOutCubic
    IN_OUT_QUART = QEasingCurve.Type.InOutQuart


@dataclass
class FadeOptions:
    """Configuration options for fade animations."""
    duration: int = 250
    easing: EasingType = EasingType.IN_OUT_QUAD
    callback: Optional[Callable[[], None]] = None
    start_opacity: Optional[float] = None
    end_opacity: Optional[float] = None


@dataclass
class StackFadeOptions(FadeOptions):
    """Configuration options for stack fade animations."""
    resize_layout: bool = False
    layout_ratio: Optional[tuple[int, int]] = None


@dataclass
class ParallelStackOperation:
    """Configuration for parallel stack fade operations."""
    left_stack: QStackedWidget
    left_new_index: int
    right_stack: QStackedWidget
    right_new_index: int
    layout_ratio: tuple[int, int]
    options: StackFadeOptions


class IGraphicsEffectManager(ABC):
    """Interface for managing graphics effects lifecycle."""
    
    @abstractmethod
    def apply_fade_effect(self, widget: QWidget) -> QGraphicsOpacityEffect:
        """Apply a fade effect to a widget."""
        pass
    
    @abstractmethod
    def remove_effects(self, widgets: List[QWidget]) -> None:
        """Remove graphics effects from widgets."""
        pass
    
    @abstractmethod
    def cleanup_all(self) -> None:
        """Cleanup all managed effects."""
        pass


class IAnimationFactory(ABC):
    """Interface for creating animations."""
    
    @abstractmethod
    def create_opacity_animation(
        self, 
        effect: QGraphicsOpacityEffect, 
        options: FadeOptions,
        start_value: float,
        end_value: float
    ) -> QPropertyAnimation:
        """Create an opacity animation."""
        pass
    
    @abstractmethod
    def create_parallel_group(self) -> QParallelAnimationGroup:
        """Create a parallel animation group."""
        pass


class IFadeSettingsProvider(ABC):
    """Interface for fade animation settings."""
    
    @abstractmethod
    def get_fades_enabled(self) -> bool:
        """Check if fade animations are enabled."""
        pass
    
    @abstractmethod
    def get_default_duration(self) -> int:
        """Get default animation duration."""
        pass
    
    @abstractmethod
    def get_default_easing(self) -> EasingType:
        """Get default easing type."""
        pass


class IAnimationService(ABC):
    """Core animation service interface."""
    
    @abstractmethod
    async def fade_widget(
        self, 
        widget: QWidget, 
        fade_in: bool, 
        options: Optional[FadeOptions] = None
    ) -> None:
        """Fade a single widget in or out."""
        pass
    
    @abstractmethod
    async def fade_widgets(
        self, 
        widgets: List[QWidget], 
        fade_in: bool, 
        options: Optional[FadeOptions] = None
    ) -> None:
        """Fade multiple widgets in or out."""
        pass
    
    @abstractmethod
    async def fade_to_opacity(
        self, 
        widget: QWidget, 
        opacity: float, 
        options: Optional[FadeOptions] = None
    ) -> None:
        """Fade widget to specific opacity."""
        pass
    
    @abstractmethod
    async def cross_fade(
        self, 
        out_widget: QWidget, 
        in_widget: QWidget, 
        options: Optional[FadeOptions] = None
    ) -> None:
        """Cross-fade between two widgets."""
        pass
    
    @abstractmethod
    def fade_widget_sync(
        self, 
        widget: QWidget, 
        fade_in: bool, 
        options: Optional[FadeOptions] = None
    ) -> None:
        """Synchronous fade for backward compatibility."""
        pass


class IStackAnimationService(ABC):
    """Interface for stack widget animations."""
    
    @abstractmethod
    async def fade_stack(
        self, 
        stack: QStackedWidget, 
        new_index: int, 
        options: Optional[StackFadeOptions] = None
    ) -> None:
        """Fade transition between stack widgets."""
        pass
    
    @abstractmethod
    async def fade_parallel_stacks(
        self, 
        operation: ParallelStackOperation
    ) -> None:
        """Fade transition for parallel stacks with layout changes."""
        pass


class IFadeOrchestrator(ABC):
    """High-level fade orchestration interface - replaces legacy FadeManager."""
    
    @abstractmethod
    async def fade_widgets_and_update(
        self,
        widgets: List[QWidget],
        update_callback: Callable[[], None],
        options: Optional[FadeOptions] = None
    ) -> None:
        """Fade out, execute callback, fade in (legacy fade_and_update replacement)."""
        pass
    
    @abstractmethod
    async def fade_stack_transition(
        self,
        stack: QStackedWidget,
        new_index: int,
        options: Optional[StackFadeOptions] = None
    ) -> None:
        """High-level stack transition."""
        pass
    
    @abstractmethod
    async def fade_parallel_stack_transition(
        self,
        operation: ParallelStackOperation
    ) -> None:
        """High-level parallel stack transition."""
        pass
    
    @abstractmethod
    def get_fades_enabled(self) -> bool:
        """Check if fades are enabled (legacy compatibility)."""
        pass
