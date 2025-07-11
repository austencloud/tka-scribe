"""
Arrow Adjustment Calculator Service - Refactored with Result Types

Clean, focused coordinator service that delegates to specialized components.
Implements proper error handling with Result types instead of silent failures.

ARCHITECTURE:
- ArrowAdjustmentLookupService: Handles special/default placement lookups
- DirectionalTupleProcessor: Handles tuple generation and selection
- This service: Coordinates the pipeline with proper error propagation

USAGE:
    calculator = ArrowAdjustmentCalculatorService(lookup_service, tuple_processor)
    result = calculator.calculate_adjustment(arrow_data, pictograph_data)
    if result.is_success():
        adjustment = result.value
    else:
        logger.error(f"Calculation failed: {result.error}")
"""

import logging

from core.interfaces.positioning_services import IArrowAdjustmentCalculator
from core.types.coordinates import PositionResult, get_default_point
from core.types.geometry import Point
from core.types.result import ErrorType, app_error, failure, success
from domain.models.arrow_data import ArrowData
from domain.models.enums import Location
from domain.models.motion_models import MotionData
from domain.models.pictograph_data import PictographData

from ...arrows.calculation.directional_tuple_calculator import (
    DirectionalTupleCalculator,
)
from ...arrows.calculation.quadrant_index_service import QuadrantIndexService
from ...arrows.keys.attribute_key_generation_service import (
    AttributeKeyGenerationService,
)
from ...arrows.keys.placement_key_service import PlacementKeyService
from ...arrows.keys.turns_tuple_generation_service import TurnsTupleGenerationService

# Legacy service imports for backward compatibility
from ...arrows.placement.default_placement_service import DefaultPlacementService
from ...arrows.placement.special_placement_service import SpecialPlacementService
from ..placement.special_placement_ori_key_generator import (
    SpecialPlacementOriKeyGenerator,
)

# Import the focused services
from .arrow_adjustment_lookup_service import ArrowAdjustmentLookupService
from .directional_tuple_processor import DirectionalTupleProcessor

logger = logging.getLogger(__name__)


class ArrowAdjustmentCalculatorService(IArrowAdjustmentCalculator):
    """
    Clean coordinator service for arrow positioning with proper error handling.

    Delegates to focused services:
    - ArrowAdjustmentLookupService: Special/default placement lookups
    - DirectionalTupleProcessor: Tuple generation and selection

    Provides both new Result-based API and legacy Point-based API for compatibility.
    """

    def __init__(
        self,
        lookup_service: ArrowAdjustmentLookupService = None,
        tuple_processor: DirectionalTupleProcessor = None,
    ):
        """
        Initialize with focused services.

        Args:
            lookup_service: Service for adjustment lookups
            tuple_processor: Service for directional tuple processing
        """
        # Use provided services or create with default dependencies
        if lookup_service is None:
            lookup_service = self._create_default_lookup_service()
        if tuple_processor is None:
            tuple_processor = self._create_default_tuple_processor()

        self.lookup_service = lookup_service
        self.tuple_processor = tuple_processor

    def _create_default_lookup_service(self) -> ArrowAdjustmentLookupService:
        """Create lookup service with default dependencies."""
        return ArrowAdjustmentLookupService(
            special_placement_service=SpecialPlacementService(),
            default_placement_service=DefaultPlacementService(),
            orientation_key_service=SpecialPlacementOriKeyGenerator(),
            placement_key_service=PlacementKeyService(),
            turns_tuple_service=TurnsTupleGenerationService(),
            attribute_key_service=AttributeKeyGenerationService(),
        )

    def _create_default_tuple_processor(self) -> DirectionalTupleProcessor:
        """Create tuple processor with default dependencies."""
        return DirectionalTupleProcessor(
            directional_tuple_service=DirectionalTupleCalculator(),
            quadrant_index_service=QuadrantIndexService(),
        )

    def calculate_adjustment(
        self,
        pictograph_data: PictographData,
        motion_data: MotionData,
        letter: str,
        location: Location,
    ) -> Point:
        """
        Calculate arrow position adjustment with streamlined parameters.

        Args:
            motion_data: Motion data containing type, rotation, and location info
            letter: Letter for special placement lookup
            location: Pre-calculated arrow location

        Returns:
            Final position adjustment as Point (to be added to initial position)
        """
        result = self.calculate_adjustment_result(
            pictograph_data, motion_data, letter, location
        )
        if result.is_success():
            return result.value

        # Log error and return default for backward compatibility
        logger.error(f"Adjustment calculation failed: {result.error}")
        return get_default_point()

    def calculate_adjustment_result(
        self,
        pictograph_data: PictographData,
        motion_data: MotionData,
        letter: str,
        location: Location,
    ) -> PositionResult:
        """
        Calculate arrow position adjustment with proper error handling.

        Args:
            motion_data: Motion data containing type, rotation, and location info
            letter: Letter for special placement lookup
            location: Pre-calculated arrow location

        Returns:
            Result containing Point adjustment or AppError
        """

        try:
            # STEP 1: Look up base adjustment (special → default)
            lookup_result = self.lookup_service.get_base_adjustment(
                pictograph_data, motion_data, letter
            )
            if lookup_result.is_failure():
                return failure(lookup_result.error)

            base_adjustment = lookup_result.value

            # STEP 2: Process directional tuples
            tuple_result = self.tuple_processor.process_directional_tuples(
                base_adjustment, motion_data, location
            )
            if tuple_result.is_failure():
                return failure(tuple_result.error)

            final_adjustment = tuple_result.value

            return success(final_adjustment)

        except Exception as e:
            return failure(
                app_error(
                    ErrorType.POSITIONING_ERROR,
                    f"Unexpected error in adjustment calculation: {e}",
                    {"letter": letter},
                    e,
                )
            )
