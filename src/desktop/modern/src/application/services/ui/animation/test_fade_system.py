"""
Comprehensive tests for the modern fade animation system.

Run these tests to verify the fade system implementation works correctly.
"""

import asyncio
import pytest
from unittest.mock import Mock, MagicMock, patch
from PyQt6.QtWidgets import QWidget, QStackedWidget, QApplication
from PyQt6.QtCore import QPropertyAnimation, QParallelAnimationGroup

from core.interfaces.animation_interfaces import (
    IFadeOrchestrator,
    IAnimationService,
    IStackAnimationService,
    IGraphicsEffectManager,
    IAnimationFactory,
    IFadeSettingsProvider,
    FadeOptions,
    StackFadeOptions,
    ParallelStackOperation,
    EasingType
)

from application.services.ui.animation import (
    FadeOrchestrator,
    AnimationService,
    StackAnimationService,
    GraphicsEffectManager,
    AnimationFactory,
    FadeSettingsProvider,
    LegacyFadeManagerAdapter,
    setup_animation_services
)


class MockSettingsCoordinator:
    """Mock settings coordinator for testing."""
    
    def __init__(self):
        self.settings = {
            "ui.animations.fades_enabled": True,
            "ui.animations.default_duration": 250,
            "ui.animations.default_easing": "IN_OUT_QUAD"
        }
    
    def get_setting(self, key, default=None):
        return self.settings.get(key, default)
    
    def set_setting(self, key, value):
        self.settings[key] = value


class TestGraphicsEffectManager:
    """Test graphics effect management."""
    
    def setup_method(self):
        self.manager = GraphicsEffectManager()
        self.mock_widget = Mock(spec=QWidget)
    
    def test_apply_fade_effect(self):
        """Test applying fade effect to widget."""
        # Mock the graphics effect behavior
        self.mock_widget.graphicsEffect.return_value = None
        
        effect = self.manager.apply_fade_effect(self.mock_widget)
        
        assert effect is not None
        self.mock_widget.setGraphicsEffect.assert_called_once()
    
    def test_remove_effects(self):
        """Test removing effects from widgets."""
        widgets = [self.mock_widget]
        self.manager._managed_effects[self.mock_widget] = Mock()
        
        self.manager.remove_effects(widgets)
        
        self.mock_widget.setGraphicsEffect.assert_called_with(None)
        assert self.mock_widget not in self.manager._managed_effects
    
    def test_cleanup_all(self):
        """Test cleaning up all effects."""
        self.manager._managed_effects[self.mock_widget] = Mock()
        
        self.manager.cleanup_all()
        
        assert len(self.manager._managed_effects) == 0


class TestAnimationFactory:
    """Test animation factory."""
    
    def setup_method(self):
        self.factory = AnimationFactory()
        self.mock_effect = Mock()
    
    def test_create_opacity_animation(self):
        """Test creating opacity animation."""
        options = FadeOptions(duration=300, easing=EasingType.IN_OUT_CUBIC)
        
        with patch('PyQt6.QtCore.QPropertyAnimation') as mock_animation_class:
            mock_animation = Mock()
            mock_animation_class.return_value = mock_animation
            
            animation = self.factory.create_opacity_animation(
                self.mock_effect, options, 0.0, 1.0
            )
            
            mock_animation.setDuration.assert_called_with(300)
            mock_animation.setStartValue.assert_called_with(0.0)
            mock_animation.setEndValue.assert_called_with(1.0)
    
    def test_create_parallel_group(self):
        """Test creating parallel animation group."""
        with patch('PyQt6.QtCore.QParallelAnimationGroup') as mock_group_class:
            group = self.factory.create_parallel_group()
            mock_group_class.assert_called_once()


class TestFadeSettingsProvider:
    """Test fade settings provider."""
    
    def setup_method(self):
        self.mock_settings = MockSettingsCoordinator()
        self.provider = FadeSettingsProvider(self.mock_settings)
    
    def test_get_fades_enabled(self):
        """Test getting fades enabled setting."""
        assert self.provider.get_fades_enabled() is True
        
        self.mock_settings.settings["ui.animations.fades_enabled"] = False
        assert self.provider.get_fades_enabled() is False
    
    def test_get_default_duration(self):
        """Test getting default duration."""
        assert self.provider.get_default_duration() == 250
    
    def test_get_default_easing(self):
        """Test getting default easing."""
        assert self.provider.get_default_easing() == EasingType.IN_OUT_QUAD


class TestAnimationService:
    """Test core animation service."""
    
    def setup_method(self):
        self.mock_effect_manager = Mock(spec=IGraphicsEffectManager)
        self.mock_animation_factory = Mock(spec=IAnimationFactory)
        self.mock_settings = Mock(spec=IFadeSettingsProvider)
        
        self.service = AnimationService(
            self.mock_effect_manager,
            self.mock_animation_factory,
            self.mock_settings
        )
    
    @pytest.mark.asyncio
    async def test_fade_widget_with_fades_disabled(self):
        """Test fade widget when fades are disabled."""
        self.mock_settings.get_fades_enabled.return_value = False
        mock_widget = Mock(spec=QWidget)
        mock_effect = Mock()
        self.mock_effect_manager.apply_fade_effect.return_value = mock_effect
        
        await self.service.fade_widget(mock_widget, fade_in=True)
        
        mock_effect.setOpacity.assert_called_with(1.0)
    
    @pytest.mark.asyncio
    async def test_fade_widget_with_fades_enabled(self):
        """Test fade widget when fades are enabled."""
        self.mock_settings.get_fades_enabled.return_value = True
        self.mock_settings.get_default_duration.return_value = 250
        self.mock_settings.get_default_easing.return_value = EasingType.IN_OUT_QUAD
        
        mock_widget = Mock(spec=QWidget)
        mock_effect = Mock()
        mock_effect.opacity.return_value = 0.0
        mock_animation = Mock()
        
        self.mock_effect_manager.apply_fade_effect.return_value = mock_effect
        self.mock_animation_factory.create_opacity_animation.return_value = mock_animation
        
        # Mock the animation completion
        def trigger_finished():
            # Simulate animation finished signal
            mock_animation.finished.connect.call_args[0][0]()
        
        mock_animation.start.side_effect = trigger_finished
        
        await self.service.fade_widget(mock_widget, fade_in=True)
        
        mock_animation.start.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_fade_widgets_multiple(self):
        """Test fading multiple widgets."""
        self.mock_settings.get_fades_enabled.return_value = True
        self.mock_settings.get_default_duration.return_value = 250
        self.mock_settings.get_default_easing.return_value = EasingType.IN_OUT_QUAD
        
        mock_widgets = [Mock(spec=QWidget) for _ in range(3)]
        mock_effect = Mock()
        mock_effect.opacity.return_value = 0.0
        mock_animation_group = Mock()
        
        self.mock_effect_manager.apply_fade_effect.return_value = mock_effect
        self.mock_animation_factory.create_parallel_group.return_value = mock_animation_group
        self.mock_animation_factory.create_opacity_animation.return_value = Mock()
        
        # Mock the animation completion
        def trigger_finished():
            mock_animation_group.finished.connect.call_args[0][0]()
        
        mock_animation_group.start.side_effect = trigger_finished
        
        await self.service.fade_widgets(mock_widgets, fade_in=True)
        
        mock_animation_group.start.assert_called_once()
        assert mock_animation_group.addAnimation.call_count == 3


class TestStackAnimationService:
    """Test stack animation service."""
    
    def setup_method(self):
        self.mock_animation_service = Mock(spec=IAnimationService)
        self.mock_layout_service = Mock()
        
        self.service = StackAnimationService(
            self.mock_animation_service,
            self.mock_layout_service
        )
    
    @pytest.mark.asyncio
    async def test_fade_stack(self):
        """Test stack fade transition."""
        mock_stack = Mock(spec=QStackedWidget)
        mock_current_widget = Mock(spec=QWidget)
        mock_next_widget = Mock(spec=QWidget)
        
        mock_stack.currentWidget.return_value = mock_current_widget
        mock_stack.widget.return_value = mock_next_widget
        mock_stack.currentIndex.return_value = 0
        
        await self.service.fade_stack(mock_stack, 1)
        
        # Verify fade out, stack change, fade in sequence
        assert self.mock_animation_service.fade_widget.call_count == 2
        mock_stack.setCurrentIndex.assert_called_with(1)
    
    @pytest.mark.asyncio
    async def test_fade_parallel_stacks(self):
        """Test parallel stack fade transition."""
        left_stack = Mock(spec=QStackedWidget)
        right_stack = Mock(spec=QStackedWidget)
        
        # Set up mock widgets
        left_old = Mock(spec=QWidget)
        left_new = Mock(spec=QWidget)
        right_old = Mock(spec=QWidget)
        right_new = Mock(spec=QWidget)
        
        left_stack.currentWidget.return_value = left_old
        left_stack.widget.return_value = left_new
        right_stack.currentWidget.return_value = right_old
        right_stack.widget.return_value = right_new
        
        operation = ParallelStackOperation(
            left_stack=left_stack,
            left_new_index=1,
            right_stack=right_stack,
            right_new_index=2,
            layout_ratio=(2, 1),
            options=StackFadeOptions()
        )
        
        await self.service.fade_parallel_stacks(operation)
        
        # Verify fade operations and stack changes
        assert self.mock_animation_service.fade_widgets.call_count == 2
        left_stack.setCurrentIndex.assert_called_with(1)
        right_stack.setCurrentIndex.assert_called_with(2)


class TestFadeOrchestrator:
    """Test high-level fade orchestrator."""
    
    def setup_method(self):
        self.mock_animation_service = Mock(spec=IAnimationService)
        self.mock_stack_service = Mock(spec=IStackAnimationService)
        self.mock_settings = Mock(spec=IFadeSettingsProvider)
        
        self.orchestrator = FadeOrchestrator(
            self.mock_animation_service,
            self.mock_stack_service,
            self.mock_settings
        )
    
    @pytest.mark.asyncio
    async def test_fade_widgets_and_update(self):
        """Test fade and update operation."""
        mock_widgets = [Mock(spec=QWidget) for _ in range(2)]
        callback_called = False
        
        def update_callback():
            nonlocal callback_called
            callback_called = True
        
        await self.orchestrator.fade_widgets_and_update(mock_widgets, update_callback)
        
        # Verify fade out, callback, fade in sequence
        assert self.mock_animation_service.fade_widgets.call_count == 2
        assert callback_called is True
    
    @pytest.mark.asyncio
    async def test_convenience_methods(self):
        """Test convenience methods."""
        mock_widget = Mock(spec=QWidget)
        
        await self.orchestrator.fade_widget_in(mock_widget)
        await self.orchestrator.fade_widget_out(mock_widget)
        
        assert self.mock_animation_service.fade_widget.call_count == 2
    
    def test_get_fades_enabled(self):
        """Test getting fades enabled status."""
        self.mock_settings.get_fades_enabled.return_value = True
        assert self.orchestrator.get_fades_enabled() is True


class TestLegacyAdapter:
    """Test legacy adapter for migration."""
    
    def setup_method(self):
        self.mock_orchestrator = Mock(spec=IFadeOrchestrator)
        self.adapter = LegacyFadeManagerAdapter(self.mock_orchestrator)
    
    def test_fades_enabled(self):
        """Test legacy fades_enabled method."""
        self.mock_orchestrator.get_fades_enabled.return_value = True
        assert self.adapter.fades_enabled() is True
    
    def test_widget_fader_adapter(self):
        """Test widget fader adapter."""
        mock_widgets = [Mock(spec=QWidget)]
        
        # This should work without throwing errors
        self.adapter.widget_fader.fade_widgets(mock_widgets, True, duration=300)
        
        # Note: The actual async call verification would require more complex mocking


class TestIntegration:
    """Integration tests for the complete system."""
    
    def setup_method(self):
        self.mock_settings_coordinator = MockSettingsCoordinator()
        
        # Create the full service stack
        self.effect_manager = GraphicsEffectManager()
        self.animation_factory = AnimationFactory()
        self.settings_provider = FadeSettingsProvider(self.mock_settings_coordinator)
        
        self.animation_service = AnimationService(
            self.effect_manager,
            self.animation_factory,
            self.settings_provider
        )
        
        self.stack_service = StackAnimationService(self.animation_service)
        
        self.orchestrator = FadeOrchestrator(
            self.animation_service,
            self.stack_service,
            self.settings_provider
        )
    
    def test_service_creation(self):
        """Test that all services can be created without errors."""
        assert self.orchestrator is not None
        assert isinstance(self.orchestrator, FadeOrchestrator)
    
    def test_settings_integration(self):
        """Test settings integration works."""
        assert self.orchestrator.get_fades_enabled() is True
        
        self.mock_settings_coordinator.set_setting("ui.animations.fades_enabled", False)
        assert self.orchestrator.get_fades_enabled() is False
    
    @pytest.mark.asyncio
    async def test_full_fade_operation_with_mocks(self):
        """Test complete fade operation with mocked Qt components."""
        # Create mock widget with minimal Qt behavior
        mock_widget = Mock()
        mock_widget.setGraphicsEffect = Mock()
        mock_widget.graphicsEffect = Mock(return_value=None)
        
        # This should complete without errors when fades are disabled
        self.mock_settings_coordinator.set_setting("ui.animations.fades_enabled", False)
        
        await self.orchestrator.fade_widget_in(mock_widget)
        
        # Verify the effect was applied
        assert mock_widget.setGraphicsEffect.called


def run_all_tests():
    """Run all tests and report results."""
    print("Running fade system tests...")
    
    # Note: In a real test environment, you would use pytest.main()
    # For now, we'll run a simplified version
    
    try:
        # Test service creation
        settings_coordinator = MockSettingsCoordinator()
        effect_manager = GraphicsEffectManager()
        animation_factory = AnimationFactory()
        settings_provider = FadeSettingsProvider(settings_coordinator)
        
        animation_service = AnimationService(
            effect_manager,
            animation_factory,
            settings_provider
        )
        
        stack_service = StackAnimationService(animation_service)
        orchestrator = FadeOrchestrator(animation_service, stack_service, settings_provider)
        
        print("✓ All services created successfully")
        
        # Test basic functionality
        assert orchestrator.get_fades_enabled() is True
        print("✓ Settings integration works")
        
        # Test legacy adapter
        adapter = LegacyFadeManagerAdapter(orchestrator)
        assert adapter.fades_enabled() is True
        print("✓ Legacy adapter works")
        
        print("\nAll basic tests passed! ✅")
        print("\nTo run full pytest suite:")
        print("pytest src/application/services/ui/animation/test_fade_system.py -v")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        raise


if __name__ == "__main__":
    run_all_tests()
