#!/usr/bin/env python3
"""
Integration test for arrow rendering to verify the complete render_arrow method works.

Run from project root: python scripts/test_arrow_rendering_integration.py
"""

import sys
import os
import logging
from pathlib import Path

# Add the modern src directory to Python path
project_root = Path(__file__).parent.parent
modern_src = project_root / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(modern_src))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def test_complete_arrow_rendering():
    """Test the complete arrow rendering pipeline."""
    logger.info("Testing complete arrow rendering pipeline...")
    
    try:
        from presentation.components.pictograph.renderers.arrow_renderer import ArrowRenderer
        from domain.models.core_models import MotionData, MotionType, RotationDirection, Location
        from domain.models.pictograph_models import PictographData, ArrowData
        from unittest.mock import Mock
        
        # Create mock scene that tracks added items
        mock_scene = Mock()
        added_items = []
        
        def mock_add_item(item):
            added_items.append(item)
            logger.info(f"Mock scene: Added item {type(item).__name__}")
        
        mock_scene.addItem = mock_add_item
        
        # Create renderer
        renderer = ArrowRenderer(mock_scene)
        
        # Create test motion data
        motion_data = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            turns=0.0
        )
        
        # Create test pictograph data
        arrow_data = ArrowData(
            motion_data=motion_data,
            color="blue"
        )
        
        pictograph_data = PictographData(
            arrows={"blue": arrow_data}
        )
        
        # Test arrow rendering
        logger.info("Calling render_arrow method...")
        
        try:
            renderer.render_arrow(
                color="blue",
                motion_data=motion_data,
                full_pictograph_data=pictograph_data
            )
            
            # Check if an item was added to the scene
            if added_items:
                logger.info(f"✅ Arrow rendering successful! Added {len(added_items)} item(s) to scene")
                
                # Check the type of added item
                for i, item in enumerate(added_items):
                    logger.info(f"  Item {i+1}: {type(item).__name__}")
                
                return {
                    "success": True,
                    "items_added": len(added_items),
                    "item_types": [type(item).__name__ for item in added_items]
                }
            else:
                logger.warning("⚠️  Arrow rendering completed but no items were added to scene")
                return {
                    "success": False,
                    "error": "No items added to scene"
                }
                
        except Exception as e:
            logger.error(f"❌ Arrow rendering failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
        
    except Exception as e:
        logger.error(f"❌ Test setup failed: {e}")
        return {
            "success": False,
            "error": f"Setup failed: {e}"
        }


def test_multiple_arrow_types():
    """Test rendering different arrow types."""
    logger.info("Testing multiple arrow types...")
    
    try:
        from presentation.components.pictograph.renderers.arrow_renderer import ArrowRenderer
        from domain.models.core_models import MotionData, MotionType, RotationDirection, Location
        from unittest.mock import Mock
        
        # Create mock scene
        mock_scene = Mock()
        added_items = []
        mock_scene.addItem = lambda item: added_items.append(item)
        
        # Create renderer
        renderer = ArrowRenderer(mock_scene)
        
        # Test different motion types
        motion_types = [
            MotionType.PRO,
            MotionType.ANTI,
            MotionType.STATIC,
            MotionType.DASH,
            MotionType.FLOAT
        ]
        
        results = {}
        
        for motion_type in motion_types:
            added_items.clear()
            
            # Create motion data
            motion_data = MotionData(
                motion_type=motion_type,
                prop_rot_dir=RotationDirection.CLOCKWISE,
                start_loc=Location.NORTH,
                end_loc=Location.SOUTH,
                turns=0.0 if motion_type in [MotionType.STATIC, MotionType.FLOAT] else 1.0
            )
            
            try:
                # Test both colors
                for color in ["blue", "red"]:
                    renderer.render_arrow(
                        color=color,
                        motion_data=motion_data,
                        full_pictograph_data=None
                    )
                
                results[motion_type.value] = {
                    "success": True,
                    "items_added": len(added_items)
                }
                logger.info(f"  {motion_type.value}: ✅ ({len(added_items)} items)")
                
            except Exception as e:
                results[motion_type.value] = {
                    "success": False,
                    "error": str(e)
                }
                logger.error(f"  {motion_type.value}: ❌ {e}")
        
        return results
        
    except Exception as e:
        logger.error(f"❌ Multiple arrow types test failed: {e}")
        return {"error": str(e)}


def main():
    """Run integration tests for arrow rendering."""
    logger.info("=" * 60)
    logger.info("ARROW RENDERING INTEGRATION TESTS")
    logger.info("=" * 60)
    
    # Test 1: Complete arrow rendering pipeline
    logger.info("\n1. Testing complete arrow rendering pipeline...")
    result1 = test_complete_arrow_rendering()
    
    # Test 2: Multiple arrow types
    logger.info("\n2. Testing multiple arrow types...")
    result2 = test_multiple_arrow_types()
    
    # Summary
    logger.info("=" * 60)
    logger.info("INTEGRATION TEST RESULTS")
    logger.info("=" * 60)
    
    # Check Test 1
    if result1.get("success"):
        logger.info("✅ Complete Arrow Rendering: PASSED")
        logger.info(f"   Items added: {result1.get('items_added', 0)}")
        logger.info(f"   Item types: {result1.get('item_types', [])}")
    else:
        logger.error(f"❌ Complete Arrow Rendering: FAILED - {result1.get('error', 'Unknown error')}")
    
    # Check Test 2
    if isinstance(result2, dict) and "error" not in result2:
        passed_types = sum(1 for r in result2.values() if r.get("success"))
        total_types = len(result2)
        logger.info(f"✅ Multiple Arrow Types: {passed_types}/{total_types} PASSED")
        
        for motion_type, result in result2.items():
            status = "✅" if result.get("success") else "❌"
            logger.info(f"   {motion_type}: {status}")
    else:
        logger.error(f"❌ Multiple Arrow Types: FAILED - {result2.get('error', 'Unknown error')}")
    
    # Overall result
    overall_success = (
        result1.get("success", False) and 
        isinstance(result2, dict) and 
        "error" not in result2 and
        all(r.get("success", False) for r in result2.values())
    )
    
    if overall_success:
        logger.info("\n🎉 ALL INTEGRATION TESTS PASSED!")
        logger.info("Arrow rendering is working correctly with optimizations!")
    else:
        logger.error("\n⚠️  SOME INTEGRATION TESTS FAILED")
        logger.error("Arrow rendering may have issues that need attention")
    
    logger.info("=" * 60)
    
    return 0 if overall_success else 1


if __name__ == "__main__":
    exit(main())
