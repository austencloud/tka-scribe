"""
Animation Size Calculator
========================

Handles all size calculations and workbench tracking for graph editor animations.
Extracted from the original animation controller to provide focused, single-responsibility
size management without animation interference.

This class is responsible for:
- Calculating preferred height based on workbench dimensions
- Tracking workbench size changes
- Providing size calculations without animation state dependencies
"""

import logging
from typing import TYPE_CHECKING

from ..config import LayoutConfig, UIConfig, AnimationConfig

logger = logging.getLogger(__name__)

if TYPE_CHECKING:
    from ..graph_editor import GraphEditor


class AnimationSizeCalculator:
    """Handles all size calculations and workbench tracking"""

    def __init__(self, graph_editor: "GraphEditor"):
        self._graph_editor = graph_editor
        self._workbench_width = UIConfig.DEFAULT_WORKBENCH_WIDTH
        self._workbench_height = UIConfig.DEFAULT_WORKBENCH_HEIGHT

    def update_workbench_size(self, width: int, height: int) -> None:
        """Update workbench size reference for height calculations"""
        old_width, old_height = self._workbench_width, self._workbench_height
        self._workbench_width = width
        self._workbench_height = height

        # Log size change for debugging
        is_visible = (
            hasattr(self._graph_editor, "_state_manager")
            and self._graph_editor.state_manager.is_visible()
        )

        logger.debug(
            "Workbench size update: %dx%d -> %dx%d (visible=%s)",
            old_width,
            old_height,
            width,
            height,
            is_visible,
        )

    def get_preferred_height(self) -> int:
        """Calculate preferred height based on workbench dimensions"""
        return min(
            int(self._workbench_height // LayoutConfig.PREFERRED_HEIGHT_DIVISOR),
            self._workbench_width // LayoutConfig.PREFERRED_WIDTH_DIVISOR,
        )

    def should_recalculate_size(
        self, is_animating: bool, is_cooldown_active: bool
    ) -> bool:
        """Determine if size should be recalculated based on animation state"""
        is_visible = (
            hasattr(self._graph_editor, "_state_manager")
            and self._graph_editor.state_manager.is_visible()
        )

        if not is_visible:
            logger.debug(
                "Blocking workbench size recalculation - visible=%s, animating=%s, cooldown=%s",
                is_visible,
                is_animating,
                is_cooldown_active,
            )
            return False

        if is_animating or is_cooldown_active:
            logger.debug("Blocking size recalculation during animation/cooldown")
            return False

        return True

    def recalculate_and_apply_size(
        self, is_animating: bool, is_cooldown_active: bool
    ) -> None:
        """Recalculate and apply new size if needed (only when not animating)"""
        if not self.should_recalculate_size(is_animating, is_cooldown_active):
            return

        new_height = self.get_preferred_height()
        current_height = self._graph_editor.height()

        is_visible = (
            hasattr(self._graph_editor, "_state_manager")
            and self._graph_editor.state_manager.is_visible()
        )

        logger.debug(
            "Recalculate check: current=%dpx, new=%dpx, visible=%s",
            current_height,
            new_height,
            is_visible,
        )

        if abs(new_height - current_height) > AnimationConfig.HEIGHT_TOLERANCE_PX:
            logger.debug(
                "Applying height change: %d -> %d (visible=%s)",
                current_height,
                new_height,
                is_visible,
            )

            if not is_visible and new_height > 0:
                logger.warning(
                    "Attempting to set height %dpx when graph editor should be collapsed!",
                    new_height,
                )
                logger.warning("Call stack trace needed - this should not happen!")
                return

            self._graph_editor.setFixedHeight(new_height)
        else:
            logger.debug(
                "Skipping height change: difference %dpx too small",
                abs(new_height - current_height),
            )

    def get_workbench_dimensions(self) -> tuple[int, int]:
        """Get current workbench dimensions"""
        return self._workbench_width, self._workbench_height
