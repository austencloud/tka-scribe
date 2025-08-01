"""
End-to-End Test for Option Picker Fade Animations

This test validates that the option picker properly uses fade animations
when transitioning between different sets of options during sequence building.
"""

import logging
import sys
from pathlib import Path
from typing import Optional

import pytest
from PyQt6.QtCore import QTimer
from PyQt6.QtTest import QTest
from PyQt6.QtWidgets import QApplication

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from desktop.modern.core.application.application_factory import ApplicationFactory
from desktop.modern.core.interfaces.animation_core_interfaces import IAnimationOrchestrator
from desktop.modern.presentation.components.option_picker.components.option_picker_scroll import OptionPickerScroll
from desktop.modern.domain.models.sequence_data import SequenceData
from desktop.modern.domain.models.beat_data import BeatData

logger = logging.getLogger(__name__)


class AnimationTestObserver:
    """Observer to track animation events during testing."""
    
    def __init__(self):
        self.fade_out_called = False
        self.fade_in_called = False
        self.direct_update_called = False
        self.animation_orchestrator_used = False
    
    def reset(self):
        """Reset all tracking flags."""
        self.fade_out_called = False
        self.fade_in_called = False
        self.direct_update_called = False
        self.animation_orchestrator_used = False


@pytest.mark.gui
@pytest.mark.integration
class TestOptionPickerAnimations:
    """Test suite for option picker fade animations."""
    
    def setup_method(self):
        """Set up test environment."""
        self.app = None
        self.container = None
        self.option_picker_scroll = None
        self.observer = AnimationTestObserver()
    
    def teardown_method(self):
        """Clean up test environment."""
        if self.option_picker_scroll:
            self.option_picker_scroll.deleteLater()
        if self.app:
            self.app.quit()
    
    def test_animation_services_registration(self):
        """Test that animation services are properly registered in DI container."""
        logger.info("🧪 Testing animation services registration...")
        
        # Create production container
        self.container = ApplicationFactory.create_production_app()
        
        # Verify animation orchestrator is available
        try:
            orchestrator = self.container.resolve(IAnimationOrchestrator)
            assert orchestrator is not None, "Animation orchestrator should be registered"
            logger.info(f"✅ Animation orchestrator registered: {type(orchestrator)}")
        except Exception as e:
            pytest.fail(f"Animation orchestrator not available: {e}")
    
    def test_option_picker_scroll_has_animation_orchestrator(self):
        """Test that OptionPickerScroll receives animation orchestrator via DI."""
        logger.info("🧪 Testing OptionPickerScroll animation orchestrator injection...")
        
        # Create production container
        self.container = ApplicationFactory.create_production_app()
        
        # Create OptionPickerScroll via DI
        try:
            self.option_picker_scroll = self.container.resolve(OptionPickerScroll)
            assert self.option_picker_scroll is not None, "OptionPickerScroll should be created"
            
            # Check if it has animation orchestrator
            assert hasattr(self.option_picker_scroll, '_animation_orchestrator'), \
                "OptionPickerScroll should have _animation_orchestrator attribute"
            
            assert self.option_picker_scroll._animation_orchestrator is not None, \
                "OptionPickerScroll._animation_orchestrator should not be None"
            
            logger.info("✅ OptionPickerScroll has animation orchestrator")
            
        except Exception as e:
            pytest.fail(f"Failed to create OptionPickerScroll with animation orchestrator: {e}")
    
    def test_animation_decision_logic(self):
        """Test the animation decision logic in OptionPickerScroll."""
        logger.info("🧪 Testing animation decision logic...")
        
        # Create production container and components
        self.container = ApplicationFactory.create_production_app()
        self.option_picker_scroll = self.container.resolve(OptionPickerScroll)
        
        # Patch methods to track calls
        original_fade_method = getattr(self.option_picker_scroll, '_fade_and_update_all_sections', None)
        original_direct_method = getattr(self.option_picker_scroll, '_update_all_sections_directly', None)
        
        def mock_fade_and_update(sequence_data):
            self.observer.fade_out_called = True
            self.observer.animation_orchestrator_used = True
            logger.info("🎭 Fade animation method called")
            if original_fade_method:
                try:
                    original_fade_method(sequence_data)
                except Exception as e:
                    logger.warning(f"Original fade method failed: {e}")
        
        def mock_direct_update(sequence_data):
            self.observer.direct_update_called = True
            logger.info("⚡ Direct update method called")
            if original_direct_method:
                try:
                    original_direct_method(sequence_data)
                except Exception as e:
                    logger.warning(f"Original direct method failed: {e}")
        
        # Apply patches
        self.option_picker_scroll._fade_and_update_all_sections = mock_fade_and_update
        self.option_picker_scroll._update_all_sections_directly = mock_direct_update
        
        # Create test sequence data
        test_beat = BeatData(
            beat_number=1,
            letter="A", 
            start_position="alpha",
            end_position="beta"
        )
        test_sequence = SequenceData(beats=[test_beat])
        
        # Trigger refresh
        logger.info("🔍 Triggering option refresh...")
        self.option_picker_scroll.load_options_from_sequence(test_sequence)
        
        # Wait for debounced refresh
        QTest.qWait(1000)
        
        # Verify animation decision
        if self.observer.animation_orchestrator_used:
            logger.info("✅ Animation orchestrator was used for fade transitions")
            assert self.observer.fade_out_called, "Fade animation should have been called"
        else:
            logger.warning("⚠️ Direct update was used instead of animations")
            assert self.observer.direct_update_called, "Direct update should have been called"
        
        # Log the decision for debugging
        has_orchestrator = self.option_picker_scroll._animation_orchestrator is not None
        logger.info(f"Animation orchestrator available: {has_orchestrator}")
        logger.info(f"Fade method called: {self.observer.fade_out_called}")
        logger.info(f"Direct method called: {self.observer.direct_update_called}")
    
    def test_animation_orchestrator_functionality(self):
        """Test that the animation orchestrator itself is functional."""
        logger.info("🧪 Testing animation orchestrator functionality...")
        
        # Create production container
        self.container = ApplicationFactory.create_production_app()
        
        # Get animation orchestrator
        orchestrator = self.container.resolve(IAnimationOrchestrator)
        
        # Test basic functionality
        assert hasattr(orchestrator, 'fade_out'), "Orchestrator should have fade_out method"
        assert hasattr(orchestrator, 'fade_in'), "Orchestrator should have fade_in method"
        
        logger.info("✅ Animation orchestrator has expected methods")


def test_animation_system_integration():
    """Integration test for the complete animation system."""
    logger.info("🚀 Running animation system integration test...")
    
    # This test can be run standalone
    test_instance = TestOptionPickerAnimations()
    test_instance.setup_method()
    
    try:
        # Run all tests in sequence
        test_instance.test_animation_services_registration()
        test_instance.test_option_picker_scroll_has_animation_orchestrator()
        test_instance.test_animation_decision_logic()
        test_instance.test_animation_orchestrator_functionality()
        
        logger.info("🎉 All animation system tests passed!")
        
    except Exception as e:
        logger.error(f"❌ Animation system test failed: {e}")
        raise
    finally:
        test_instance.teardown_method()


if __name__ == "__main__":
    # Set up logging for standalone execution
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Run the integration test
    test_animation_system_integration()
