"""
Arrow Adjustment Calculator Service - Legacy-Compatible Rewrite

Replicates the exact legacy arrow positioning logic:
1. Calculate initial position (grid coordinates)
2. Look up adjustment (special placement → default calculation)  
3. Apply directional tuples (rotation matrices)
4. Select via quadrant index
5. Combine with initial position

This matches the legacy flow exactly instead of the previous incorrect implementation.
"""

import logging
from typing import Optional

from core.interfaces.positioning_services import IArrowAdjustmentCalculator
from domain.models.pictograph_models import ArrowData, PictographData

# Conditional PyQt6 imports for testing compatibility
try:
    from PyQt6.QtCore import QPointF

    QT_AVAILABLE = True
except ImportError:
    # Create mock QPointF for testing when Qt is not available
    class QPointF:
        def __init__(self, x=0.0, y=0.0):
            self._x = x
            self._y = y

        def x(self):
            return self._x

        def y(self):
            return self._y

    QT_AVAILABLE = False

from core.types.geometry import Point

# Import all the services we need for the complete pipeline
from ...arrows.placement.default_placement_service import DefaultPlacementService
from ...arrows.calculation.orientation_calculator import OrientationCalculator
from ...arrows.keys.placement_key_generation_service import PlacementKeyGenerationService
from ...arrows.keys.placement_key_service import PlacementKeyService
from ...arrows.placement.special_placement_service import SpecialPlacementService
from ...arrows.placement.special_placement_orientation_service import SpecialPlacementOrientationService
from ...arrows.keys.turns_tuple_generation_service import TurnsTupleGenerationService
from ...arrows.keys.attribute_key_generation_service import AttributeKeyGenerationService
from ...arrows.calculation.directional_tuple_calculator import DirectionalTupleCalculator
from ...arrows.calculation.quadrant_index_service import QuadrantIndexService

logger = logging.getLogger(__name__)


class ArrowAdjustmentCalculatorService(IArrowAdjustmentCalculator):
    """
    Legacy-compatible arrow positioning service.
    
    Replicates the exact legacy flow:
    1. Initial position from grid coordinates
    2. Adjustment lookup (special → default)
    3. Directional tuple generation 
    4. Quadrant-based selection
    5. Final position calculation
    """

    def __init__(
        self,
        default_placement_service: Optional[DefaultPlacementService] = None,
        special_placement_service: Optional[SpecialPlacementService] = None,
        orientation_service: Optional[OrientationCalculator] = None,
        key_generation_service: Optional[PlacementKeyGenerationService] = None,
        placement_key_service: Optional[PlacementKeyService] = None,
        orientation_key_service: Optional[SpecialPlacementOrientationService] = None,
        turns_tuple_service: Optional[TurnsTupleGenerationService] = None,
        attribute_key_service: Optional[AttributeKeyGenerationService] = None,
        directional_tuple_service: Optional[DirectionalTupleCalculator] = None,
        quadrant_index_service: Optional[QuadrantIndexService] = None,
    ):
        """Initialize with all required services for the complete pipeline."""
        
        # STEP 2: Adjustment calculation services
        self.default_placement_service = (
            default_placement_service or DefaultPlacementService()
        )
        self.special_placement_service = (
            special_placement_service or SpecialPlacementService()
        )
        
        # STEP 3: Key generation services
        self.orientation_service = orientation_service or OrientationCalculator()
        self.key_generation_service = (
            key_generation_service or PlacementKeyGenerationService()
        )
        self.placement_key_service = placement_key_service or PlacementKeyService()
        self.orientation_key_service = (
            orientation_key_service or SpecialPlacementOrientationService()
        )
        self.turns_tuple_service = turns_tuple_service or TurnsTupleGenerationService()
        self.attribute_key_service = (
            attribute_key_service or AttributeKeyGenerationService()
        )
        
        # STEP 4: Directional positioning services  
        self.directional_tuple_service = (
            directional_tuple_service or DirectionalTupleCalculator()
        )
        self.quadrant_index_service = quadrant_index_service or QuadrantIndexService()

    def calculate_adjustment(
        self, arrow_data: ArrowData, pictograph_data: PictographData
    ) -> Point:
        """
        Calculate arrow position adjustment using legacy-compatible flow.
        
        Legacy Flow:
        1. Look up base adjustment (special placement → default calculation)
        2. Apply directional tuples (rotation matrices) 
        3. Select via quadrant index
        4. Return final adjustment (to be added to initial position)
        
        Args:
            arrow_data: Arrow data with motion and color information
            pictograph_data: Pictograph context with letter and sequence data
            
        Returns:
            Final position adjustment as Point (to be added to initial position)
        """
        
        logger.info(
            f"🎯 LEGACY FLOW: Calculating adjustment for {arrow_data.color} arrow in letter {pictograph_data.letter}"
        )
        
        motion = arrow_data.motion_data
        if not motion:
            logger.warning("No motion data available")
            return Point(0, 0)
        
        # STEP 1: Look up base adjustment (special → default)
        base_adjustment = self._lookup_base_adjustment(arrow_data, pictograph_data)
        logger.info(f"   Step 1 - Base adjustment: ({base_adjustment.x():.1f}, {base_adjustment.y():.1f})")
        
        # STEP 2: Generate directional tuples using base adjustment
        directional_tuples = self._generate_directional_tuples(motion, base_adjustment)
        logger.info(f"   Step 2 - Directional tuples: {directional_tuples}")
        
        # STEP 3: Get quadrant index for selection
        quadrant_index = self._get_quadrant_index(arrow_data, pictograph_data)
        logger.info(f"   Step 3 - Quadrant index: {quadrant_index}")
        
        # STEP 4: Select final adjustment from directional tuples
        if directional_tuples and 0 <= quadrant_index < len(directional_tuples):
            selected_tuple = directional_tuples[quadrant_index]
            final_adjustment = QPointF(selected_tuple[0], selected_tuple[1])
        else:
            logger.warning(f"Invalid quadrant index {quadrant_index} for {len(directional_tuples)} tuples")
            final_adjustment = QPointF(0, 0)
            
        logger.info(f"   Step 4 - Final adjustment: ({final_adjustment.x():.1f}, {final_adjustment.y():.1f})")
        
        # Return as Point to match interface
        return Point(final_adjustment.x(), final_adjustment.y())

    def _lookup_base_adjustment(
        self, arrow_data: ArrowData, pictograph_data: PictographData  
    ) -> QPointF:
        """
        Look up base adjustment using legacy logic:
        1. Try special placement lookup (stored values)
        2. Fall back to default calculation
        
        This matches legacy ArrowAdjustmentCalculator._calculate_adjustment()
        """
        motion = arrow_data.motion_data
        letter = pictograph_data.letter
        
        if not motion or not letter:
            logger.warning("Missing motion or letter data")
            return QPointF(0, 0)
            
        try:
            # Generate required keys for special placement lookup
            ori_key = self.orientation_key_service.generate_orientation_key(
                motion, pictograph_data
            )
            turns_tuple = self.turns_tuple_service.generate_turns_tuple(pictograph_data)
            attr_key = self.attribute_key_service.get_key_from_arrow(
                arrow_data, pictograph_data
            )
            
            logger.debug(f"Generated keys - ori: {ori_key}, turns: {turns_tuple}, attr: {attr_key}")
            
            # STEP 1A: Try special placement lookup (stored adjustments)
            special_adjustment = self._lookup_special_placement(
                arrow_data, pictograph_data, ori_key, turns_tuple, attr_key
            )
            
            if special_adjustment is not None:
                logger.info(f"Using special placement: ({special_adjustment.x():.1f}, {special_adjustment.y():.1f})")
                return special_adjustment
                
            # STEP 1B: Fall back to default calculation
            default_adjustment = self._calculate_default_adjustment(arrow_data)
            logger.info(f"Using default calculation: ({default_adjustment.x():.1f}, {default_adjustment.y():.1f})")
            return default_adjustment
            
        except Exception as e:
            logger.error(f"Error in base adjustment lookup: {e}")
            return QPointF(0, 0)

    def _lookup_special_placement(
        self, 
        arrow_data: ArrowData, 
        pictograph_data: PictographData,
        ori_key: str,
        turns_tuple: str, 
        attr_key: str
    ) -> Optional[QPointF]:
        """
        Look up special placement using exact legacy logic.
        
        This matches legacy get_adjustment_for_letter() method.
        Special placements contain stored values that were calculated as:
        default_adjustment + user_modifications
        """
        try:
            # This should return stored adjustment values if they exist
            adjustment = self.special_placement_service.get_special_adjustment(
                arrow_data, pictograph_data
            )
            
            if adjustment:
                return adjustment
                
            return None
            
        except Exception as e:
            logger.error(f"Error in special placement lookup: {e}")
            return None

    def _calculate_default_adjustment(self, arrow_data: ArrowData) -> QPointF:
        """
        Calculate default adjustment using placement key and motion type.
        
        This matches legacy DefaultPlacementStrategy.get_default_adjustment()
        """
        motion = arrow_data.motion_data
        
        if not motion:
            logger.warning("No motion data for default calculation")
            return QPointF(0, 0)
            
        try:
            # Generate placement key for default lookup
            placement_key = self.placement_key_service.generate_placement_key(motion)
            
            # Get adjustment from default placement service
            adjustment_point = self.default_placement_service.get_default_adjustment(
                motion, grid_mode="diamond", placement_key=placement_key
            )
            
            return QPointF(adjustment_point.x, adjustment_point.y)
            
        except Exception as e:
            logger.error(f"Error calculating default adjustment: {e}")
            return QPointF(0, 0)

    def _generate_directional_tuples(
        self, motion, base_adjustment: QPointF
    ) -> list[tuple[int, int]]:
        """
        Generate directional tuples using rotation matrices.
        
        This matches legacy DirectionalTupleGenerator.get_directional_tuples()
        """
        try:
            directional_tuples = self.directional_tuple_service.generate_directional_tuples(
                motion, base_adjustment.x(), base_adjustment.y()
            )
            return directional_tuples
            
        except Exception as e:
            logger.error(f"Error generating directional tuples: {e}")
            return [(0, 0)] * 4  # Return default 4-tuple array

    def _get_quadrant_index(
        self, arrow_data: ArrowData, pictograph_data: PictographData
    ) -> int:
        """
        Get quadrant index for directional tuple selection.
        
        This matches legacy QuadrantIndexHandler.get_quadrant_index()
        """
        try:
            # Calculate arrow location for quadrant determination
            from ...arrows.calculation.arrow_location_calculator import ArrowLocationCalculatorService
            
            location_calculator = ArrowLocationCalculatorService()
            arrow_location = location_calculator.calculate_location(
                arrow_data.motion_data, pictograph_data
            )
            
            # Get quadrant index
            quadrant_index = self.quadrant_index_service.get_quadrant_index(
                arrow_data.motion_data, arrow_location
            )
            
            return quadrant_index
            
        except Exception as e:
            logger.error(f"Error calculating quadrant index: {e}")
            return 0  # Default to first quadrant
