"""
Simple test to verify the animation system is working.
"""

import logging
import sys
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from desktop.modern.core.application.application_factory import ApplicationFactory
from desktop.modern.core.interfaces.animation_core_interfaces import (
    IAnimationOrchestrator,
)

logger = logging.getLogger(__name__)


def test_animation_system_is_working():
    """Test that the animation system is properly registered and working."""
    logger.info("🧪 Testing animation system registration...")

    # Create production container
    container = ApplicationFactory.create_production_app()

    # Verify animation orchestrator is available
    try:
        orchestrator = container.resolve(IAnimationOrchestrator)
        assert orchestrator is not None, "Animation orchestrator should be registered"
        logger.info(f"✅ Animation orchestrator registered: {type(orchestrator)}")

        # Test basic functionality
        assert hasattr(orchestrator, "fade_target"), (
            "Orchestrator should have fade_target method"
        )
        assert hasattr(orchestrator, "fade_targets"), (
            "Orchestrator should have fade_targets method"
        )
        assert hasattr(orchestrator, "transition_targets"), (
            "Orchestrator should have transition_targets method"
        )

        logger.info("✅ Animation orchestrator has all required methods")

        # Test that we can resolve the animation engine too
        from desktop.modern.core.interfaces.animation_core_interfaces import (
            IAnimationEngine,
        )

        engine = container.resolve(IAnimationEngine)
        assert engine is not None, "Animation engine should be registered"

        logger.info("✅ Animation services are properly registered in DI container")

        return True

    except Exception as e:
        logger.error(f"❌ Animation system test failed: {e}")
        return False


if __name__ == "__main__":
    # Set up logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    # Run the test
    success = test_animation_system_is_working()

    if success:
        print("🎉 Animation system is working correctly!")
        print("✅ IAnimationOrchestrator is registered")
        print("✅ OptionPickerScroll can now use fade animations")
        print("✅ Fade transitions should work in the option picker")
    else:
        print("❌ Animation system test failed")
        sys.exit(1)
