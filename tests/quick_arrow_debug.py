"""
Quick Arrow Positioning Debug

Add this code to your ArrowItem._calculate_and_apply_position() method
to see exactly what's happening with G pictograph positioning.
"""

# Add this debug code at the beginning of _calculate_and_apply_position():

logger.info(f"🔍 ARROW DEBUG - {self.arrow_color}")
logger.info(f"  Orchestrator available: {self._positioning_orchestrator is not None}")
logger.info(f"  Pictograph data available: {self.pictograph_data is not None}")

if self.pictograph_data:
    logger.info(f"  Letter: {getattr(self.pictograph_data, 'letter', 'Unknown')}")
    logger.info(f"  Available motions: {list(getattr(self.pictograph_data, 'motions', {}).keys())}")
    
    motion_data = self.pictograph_data.motions.get(self.arrow_color)
    logger.info(f"  Motion data for {self.arrow_color}: {motion_data is not None}")
    
    if motion_data:
        logger.info(f"    Motion type: {motion_data.motion_type}")
        logger.info(f"    Start loc: {motion_data.start_loc}")
        logger.info(f"    End loc: {motion_data.end_loc}")

# Add this debug code right after position calculation (around line 175):

logger.info(f"🎯 CALCULATED POSITION - {self.arrow_color}")
logger.info(f"  Position: ({position_x:.1f}, {position_y:.1f})")
logger.info(f"  Rotation: {rotation:.1f}°")

# Add this debug code in _finalize_positioning():

logger.info(f"🏁 FINAL POSITION - {self.arrow_color}")
logger.info(f"  Applied position: ({position_x:.1f}, {position_y:.1f})")
logger.info(f"  Transform: {self.transform()}")
