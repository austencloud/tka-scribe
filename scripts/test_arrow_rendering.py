#!/usr/bin/env python3
"""
Quick test script to verify arrow rendering is working after optimizations.

Run from project root: python scripts/test_arrow_rendering.py
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
logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def test_svg_file_paths():
    """Test that SVG files exist and paths are correct."""
    logger.info("Testing SVG file paths...")

    # Test pre-colored SVG files
    arrows_colored_dir = project_root / "src" / "desktop" / "images" / "arrows_colored"

    test_files = [
        "pro/blue/from_radial/pro_0.0.svg",
        "pro/red/from_radial/pro_0.0.svg",
        "anti/blue/from_radial/anti_0.0.svg",
        "static/blue/from_radial/static_0.0.svg",
    ]

    results = {}
    for test_file in test_files:
        full_path = arrows_colored_dir / test_file
        exists = full_path.exists()
        results[test_file] = exists
        logger.info(f"  {test_file}: {'✅' if exists else '❌'} ({full_path})")

    # Test original SVG files (fallback)
    arrows_original_dir = project_root / "src" / "desktop" / "images" / "arrows"

    original_test_files = [
        "pro/from_radial/pro_0.0.svg",
        "anti/from_radial/anti_0.0.svg",
        "static/from_radial/static_0.0.svg",
    ]

    for test_file in original_test_files:
        full_path = arrows_original_dir / test_file
        exists = full_path.exists()
        results[f"original_{test_file}"] = exists
        logger.info(f"  original {test_file}: {'✅' if exists else '❌'} ({full_path})")

    return results


def test_arrow_renderer_creation():
    """Test that ArrowRenderer can be created without errors."""
    logger.info("Testing ArrowRenderer creation...")

    try:
        from presentation.components.pictograph.renderers.arrow_renderer import (
            ArrowRenderer,
        )
        from unittest.mock import Mock

        # Create mock scene
        mock_scene = Mock()

        # Create renderer
        renderer = ArrowRenderer(mock_scene)

        logger.info("✅ ArrowRenderer created successfully")

        # Test cache methods
        cache_stats = ArrowRenderer.get_cache_stats()
        logger.info(f"  Cache stats: {cache_stats}")

        cache_info = ArrowRenderer.get_cache_info()
        logger.info(f"  Cache info: {cache_info}")

        return {"success": True, "cache_stats": cache_stats}

    except Exception as e:
        logger.error(f"❌ ArrowRenderer creation failed: {e}")
        return {"success": False, "error": str(e)}


def test_svg_path_generation():
    """Test SVG path generation methods."""
    logger.info("Testing SVG path generation...")

    try:
        from presentation.components.pictograph.renderers.arrow_renderer import (
            ArrowRenderer,
        )
        from domain.models.core_models import (
            MotionData,
            MotionType,
            RotationDirection,
            Location,
        )
        from unittest.mock import Mock

        # Create renderer
        mock_scene = Mock()
        renderer = ArrowRenderer(mock_scene)

        # Create test motion data with all required parameters
        motion_data = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            turns=0.0,
        )

        results = {}

        # Test pre-colored path generation
        try:
            blue_path = renderer._get_arrow_svg_file(motion_data, "blue")
            red_path = renderer._get_arrow_svg_file(motion_data, "red")

            results["blue_path"] = blue_path
            results["red_path"] = red_path
            results["blue_exists"] = os.path.exists(blue_path)
            results["red_exists"] = os.path.exists(red_path)

            logger.info(
                f"  Blue path: {blue_path} ({'✅' if results['blue_exists'] else '❌'})"
            )
            logger.info(
                f"  Red path: {red_path} ({'✅' if results['red_exists'] else '❌'})"
            )

        except Exception as e:
            logger.error(f"  Pre-colored path generation failed: {e}")
            results["precolored_error"] = str(e)

        # Test original path generation (fallback)
        try:
            original_path = renderer._get_original_arrow_svg_file(motion_data)
            results["original_path"] = original_path
            results["original_exists"] = os.path.exists(original_path)

            logger.info(
                f"  Original path: {original_path} ({'✅' if results['original_exists'] else '❌'})"
            )

        except Exception as e:
            logger.error(f"  Original path generation failed: {e}")
            results["original_error"] = str(e)

        return results

    except Exception as e:
        logger.error(f"❌ SVG path generation test failed: {e}")
        return {"error": str(e)}


def test_svg_loading():
    """Test SVG file loading with caching."""
    logger.info("Testing SVG file loading...")

    try:
        from presentation.components.pictograph.renderers.arrow_renderer import (
            ArrowRenderer,
        )
        from unittest.mock import Mock

        # Create renderer
        mock_scene = Mock()
        renderer = ArrowRenderer(mock_scene)

        # Test with a known SVG file
        test_svg_path = (
            project_root
            / "src"
            / "desktop"
            / "images"
            / "arrows_colored"
            / "pro"
            / "blue"
            / "from_radial"
            / "pro_0.0.svg"
        )

        if test_svg_path.exists():
            # Test loading
            svg_content = renderer._load_svg_file(str(test_svg_path))

            results = {
                "file_exists": True,
                "content_loaded": len(svg_content) > 0,
                "content_length": len(svg_content),
                "has_svg_tag": "<svg" in svg_content,
                "has_blue_color": "#2E3192" in svg_content,
            }

            logger.info(f"  File exists: ✅")
            logger.info(
                f"  Content loaded: {'✅' if results['content_loaded'] else '❌'} ({results['content_length']} chars)"
            )
            logger.info(f"  Has SVG tag: {'✅' if results['has_svg_tag'] else '❌'}")
            logger.info(
                f"  Has blue color: {'✅' if results['has_blue_color'] else '❌'}"
            )

            # Test cache stats after loading
            cache_stats = ArrowRenderer.get_cache_stats()
            results["cache_stats"] = cache_stats
            logger.info(f"  Cache stats: {cache_stats}")

        else:
            results = {"file_exists": False, "test_file": str(test_svg_path)}
            logger.error(f"  Test SVG file not found: {test_svg_path}")

        return results

    except Exception as e:
        logger.error(f"❌ SVG loading test failed: {e}")
        return {"error": str(e)}


def main():
    """Run all arrow rendering tests."""
    logger.info("=" * 60)
    logger.info("ARROW RENDERING DIAGNOSTIC TESTS")
    logger.info("=" * 60)

    results = {
        "svg_paths": test_svg_file_paths(),
        "renderer_creation": test_arrow_renderer_creation(),
        "path_generation": test_svg_path_generation(),
        "svg_loading": test_svg_loading(),
    }

    logger.info("=" * 60)
    logger.info("TEST RESULTS SUMMARY")
    logger.info("=" * 60)

    all_passed = True

    for test_name, result in results.items():
        if isinstance(result, dict) and "error" in result:
            logger.error(f"❌ {test_name.upper()}: FAILED - {result['error']}")
            all_passed = False
        elif isinstance(result, dict) and "success" in result:
            if result["success"]:
                logger.info(f"✅ {test_name.upper()}: PASSED")
            else:
                logger.error(
                    f"❌ {test_name.upper()}: FAILED - {result.get('error', 'Unknown error')}"
                )
                all_passed = False
        else:
            logger.info(f"✅ {test_name.upper()}: COMPLETED")

    if all_passed:
        logger.info("🎉 ALL TESTS PASSED - Arrow rendering should be working!")
    else:
        logger.error("⚠️  SOME TESTS FAILED - Arrow rendering may have issues")

    logger.info("=" * 60)

    return 0 if all_passed else 1


if __name__ == "__main__":
    exit(main())
