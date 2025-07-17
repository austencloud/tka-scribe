"""
Interface definitions for scaling and rendering services in TKA.

These interfaces define contracts for context-aware scaling calculations,
rendering context management, and visual presentation operations.
"""

from abc import ABC, abstractmethod
from enum import Enum
from typing import Tuple

from core.types import Size


class ScalingContext(Enum):
    """Different contexts where pictographs are displayed, each with specific scaling needs."""

    OPTION_VIEW = "option_view"
    START_POS_PICKER = "start_pos_picker"
    ADVANCED_START_POS = "advanced_start_pos"
    CODEX_VIEW = "codex_view"
    BEAT_VIEW = "beat_view"
    GRAPH_EDITOR_VIEW = "graph_editor_view"
    DEFAULT = "default"


class RenderingContext(Enum):
    """Different contexts where pictographs are rendered, affecting arrow behavior."""

    GRAPH_EDITOR = "graph_editor"
    BEAT_FRAME = "beat_frame"
    OPTION_PICKER = "option_picker"
    PREVIEW = "preview"
    SEQUENCE_VIEWER = "sequence_viewer"
    UNKNOWN = "unknown"


class IPictographScaler(ABC):
    """Interface for context-aware pictograph scaling operations."""

    @abstractmethod
    def calculate_scale(
        self,
        context: ScalingContext,
        container_size: Size,
        scene_size: Size,
        **context_params,
    ) -> Tuple[float, float]:
        """
        Calculate scale factors for a pictograph in a specific context.

        Args:
            context: The scaling context (enum)
            container_size: Size of the container widget
            scene_size: Size of the pictograph scene
            **context_params: Additional context-specific parameters

        Returns:
            Tuple of (scale_x, scale_y) factors
        """

    @abstractmethod
    def get_responsive_border_width(self, target_size: int) -> int:
        """
        Calculate responsive border width based on target size.

        Args:
            target_size: The target size for the element

        Returns:
            int: Calculated border width
        """

    @abstractmethod
    def validate_scaling_context(self, context: ScalingContext) -> bool:
        """
        Validate that the scaling context is supported.

        Args:
            context: The scaling context to validate

        Returns:
            bool: True if context is valid, False otherwise
        """

    @abstractmethod
    def get_minimum_size_for_context(self, context: ScalingContext) -> int:
        """
        Get the minimum size for a specific context.

        Args:
            context: The scaling context

        Returns:
            int: Minimum size for the context
        """


class IContextAwareRenderer(ABC):
    """Interface for context-aware rendering operations."""

    @abstractmethod
    def set_rendering_context(self, context: RenderingContext) -> None:
        """
        Set the current rendering context.

        Args:
            context: The rendering context to set
        """

    @abstractmethod
    def get_rendering_context(self) -> RenderingContext:
        """
        Get the current rendering context.

        Returns:
            RenderingContext: Current rendering context
        """

    @abstractmethod
    def is_context_supported(self, context: RenderingContext) -> bool:
        """
        Check if a rendering context is supported.

        Args:
            context: The context to check

        Returns:
            bool: True if supported, False otherwise
        """

    @abstractmethod
    def get_context_specific_settings(self, context: RenderingContext) -> dict:
        """
        Get settings specific to a rendering context.

        Args:
            context: The rendering context

        Returns:
            dict: Context-specific settings
        """


class IScalingCalculator(ABC):
    """Interface for general scaling calculations."""

    @abstractmethod
    def calculate_proportional_scale(
        self, source_size: Tuple[int, int], target_size: Tuple[int, int]
    ) -> float:
        """
        Calculate proportional scaling factor between sizes.

        Args:
            source_size: Original size (width, height)
            target_size: Target size (width, height)

        Returns:
            float: Scaling factor to apply
        """

    @abstractmethod
    def calculate_fit_scale(
        self, content_size: Tuple[int, int], container_size: Tuple[int, int]
    ) -> Tuple[float, float]:
        """
        Calculate scaling to fit content within container.

        Args:
            content_size: Size of content to scale
            container_size: Size of target container

        Returns:
            Tuple of (scale_x, scale_y) factors
        """

    @abstractmethod
    def calculate_fill_scale(
        self, content_size: Tuple[int, int], container_size: Tuple[int, int]
    ) -> Tuple[float, float]:
        """
        Calculate scaling to fill container with content.

        Args:
            content_size: Size of content to scale
            container_size: Size of target container

        Returns:
            Tuple of (scale_x, scale_y) factors
        """

    @abstractmethod
    def clamp_scale_factor(
        self, scale: float, min_scale: float, max_scale: float
    ) -> float:
        """
        Clamp scale factor within bounds.

        Args:
            scale: Scale factor to clamp
            min_scale: Minimum allowed scale
            max_scale: Maximum allowed scale

        Returns:
            float: Clamped scale factor
        """


class IVisualPresenter(ABC):
    """Interface for visual presentation operations."""

    @abstractmethod
    def calculate_presentation_size(
        self, base_size: Tuple[int, int], context: ScalingContext
    ) -> Tuple[int, int]:
        """
        Calculate presentation size for visual elements.

        Args:
            base_size: Base size of the element
            context: Presentation context

        Returns:
            Tuple of (width, height) for presentation
        """

    @abstractmethod
    def apply_visual_enhancements(
        self, scale_factor: float, context: ScalingContext
    ) -> float:
        """
        Apply visual enhancements to scale factor based on context.

        Args:
            scale_factor: Base scale factor
            context: Visual context

        Returns:
            float: Enhanced scale factor
        """

    @abstractmethod
    def get_context_enhancement_factor(self, context: ScalingContext) -> float:
        """
        Get enhancement factor for a specific context.

        Args:
            context: The scaling context

        Returns:
            float: Enhancement factor (1.0 = no enhancement)
        """

    @abstractmethod
    def calculate_optimal_viewing_scale(
        self,
        content_size: Tuple[int, int],
        viewer_size: Tuple[int, int],
        context: ScalingContext,
    ) -> float:
        """
        Calculate optimal scale for viewing content in context.

        Args:
            content_size: Size of content
            viewer_size: Size of viewer area
            context: Viewing context

        Returns:
            float: Optimal scale factor
        """
