"""
Comprehensive tests for the modern animation system.
Tests both the framework-agnostic core and Qt adapters.
"""

import pytest
import asyncio
from unittest.mock import Mock, MagicMock, patch
from PyQt6.QtWidgets import QWidget, QStackedWidget, QApplication
from PyQt6.QtCore import QTimer

from core.interfaces.animation_core_interfaces import (
    AnimationTarget,
    AnimationConfig,
    AnimationType,
    EasingType,
    AnimationState,
    FadeCommand,
    TransitionCommand
)
from core.animation.animation_engine import (
    CoreAnimationEngine,
    SimpleEventBus,
    DefaultSettingsProvider,
    EasingFunctions
)
from application.services.ui.animation.adapters.qt_adapters import (
    QtTargetAdapter,
    QtAnimationRenderer,
    QtGraphicsEffectManager
)
from application.services.ui.animation.animation_orchestrator import (
    ModernAnimationOrchestrator,
    LegacyFadeManagerWrapper,
    create_modern_animation_system
)


class TestEasingFunctions:
    """Test easing function calculations."""
    
    def test_linear_easing(self):
        """Test linear easing function."""
        assert EasingFunctions.linear(0.0) == 0.0
        assert EasingFunctions.linear(0.5) == 0.5
        assert EasingFunctions.linear(1.0) == 1.0
    
    def test_ease_in_out(self):
        """Test ease in-out function."""
        assert EasingFunctions.ease_in_out(0.0) == 0.0
        assert EasingFunctions.ease_in_out(1.0) == 1.0
        # Middle should be smooth
        mid = EasingFunctions.ease_in_out(0.5)
        assert 0.4 < mid < 0.6
    
    def test_spring_easing(self):
        """Test spring easing function."""
        assert EasingFunctions.spring(0.0) == 0.0
        assert EasingFunctions.spring(1.0) == 1.0
        # Spring might overshoot
        spring_val = EasingFunctions.spring(0.8)
        assert spring_val > 0.0


class TestSimpleEventBus:
    """Test the event bus implementation."""
    
    def setup_method(self):
        self.event_bus = SimpleEventBus()
    
    def test_subscribe_and_emit(self):
        """Test basic subscription and emission."""
        received_events = []
        
        def handler(data):
            received_events.append(data)
        
        sub_id = self.event_bus.subscribe("test.event", handler)
        assert sub_id.startswith("test.event_")
        
        self.event_bus.emit("test.event", "test_data")
        assert len(received_events) == 1
        assert received_events[0] == "test_data"
    
    def test_multiple_subscribers(self):
        """Test multiple subscribers to same event."""
        received_data1 = []
        received_data2 = []
        
        self.event_bus.subscribe("test.event", lambda data: received_data1.append(data))
        self.event_bus.subscribe("test.event", lambda data: received_data2.append(data))
        
        self.event_bus.emit("test.event", "test_data")
        
        assert received_data1 == ["test_data"]
        assert received_data2 == ["test_data"]
    
    def test_unsubscribe(self):
        """Test unsubscribing from events."""
        received_events = []
        
        sub_id = self.event_bus.subscribe("test.event", lambda data: received_events.append(data))
        self.event_bus.emit("test.event", "before_unsub")
        
        self.event_bus.unsubscribe(sub_id)
        self.event_bus.emit("test.event", "after_unsub")
        
        assert received_events == ["before_unsub"]


class TestAnimationTarget:
    """Test AnimationTarget functionality."""
    
    def test_animation_target_creation(self):
        """Test creating animation targets."""
        target = AnimationTarget(
            id="test_target",
            element_type="widget",
            properties={"x": 100, "y": 200}
        )
        
        assert target.id == "test_target"
        assert target.element_type == "widget"
        assert target.properties["x"] == 100
    
    def test_target_hashing(self):
        """Test that targets can be hashed (for sets/dicts)."""
        target1 = AnimationTarget("test1", "widget", {})
        target2 = AnimationTarget("test2", "widget", {})
        target3 = AnimationTarget("test1", "widget", {})
        
        target_set = {target1, target2, target3}
        assert len(target_set) == 2  # target1 and target3 should be same


class TestQtTargetAdapter:
    """Test Qt widget to AnimationTarget adaptation."""
    
    def setup_method(self):
        # Create Qt application if it doesn't exist
        import sys
        if not QApplication.instance():
            self.app = QApplication(sys.argv)
        
        self.adapter = QtTargetAdapter()
        self.mock_widget = Mock(spec=QWidget)
        self.mock_widget.x.return_value = 10
        self.mock_widget.y.return_value = 20
        self.mock_widget.width.return_value = 100
        self.mock_widget.height.return_value = 50
        self.mock_widget.isVisible.return_value = True
        self.mock_widget.isEnabled.return_value = True
        self.mock_widget.objectName.return_value = "test_widget"
        self.mock_widget.__class__.__name__ = "QWidget"
    
    def test_adapt_qt_widget(self):
        """Test adapting Qt widget to AnimationTarget."""
        target = self.adapter.adapt_target(self.mock_widget)
        
        assert target.id.startswith("qt_widget_")
        assert target.element_type == "qt_widget"
        assert target.properties["class_name"] == "QWidget"
        assert target.properties["geometry"]["x"] == 10
        assert target.properties["geometry"]["y"] == 20
        assert target.properties["_qt_widget_ref"] == self.mock_widget
    
    def test_adapt_non_widget_fails(self):
        """Test that adapting non-widget raises error."""
        with pytest.raises(ValueError, match="Expected QWidget"):
            self.adapter.adapt_target("not_a_widget")
    
    def test_apply_opacity(self):
        """Test applying opacity to widget."""
        target = self.adapter.adapt_target(self.mock_widget)
        
        # Mock graphics effect methods
        self.mock_widget.graphicsEffect.return_value = None
        self.mock_widget.setGraphicsEffect = Mock()
        
        success = self.adapter.apply_animation(target, "opacity", 0.5)
        assert success
        self.mock_widget.setGraphicsEffect.assert_called_once()
    
    def test_apply_position(self):
        """Test applying position changes."""
        target = self.adapter.adapt_target(self.mock_widget)
        self.mock_widget.move = Mock()
        
        success = self.adapter.apply_animation(target, "x", 50)
        assert success
        self.mock_widget.move.assert_called_with(50, 20)  # new x, current y


@pytest.mark.asyncio
class TestCoreAnimationEngine:
    """Test the core animation engine."""
    
    def setup_method(self):
        self.event_bus = SimpleEventBus()
        self.scheduler = Mock()
        self.scheduler.get_current_time.return_value = 0.0
        self.settings_provider = DefaultSettingsProvider()
        
        self.engine = CoreAnimationEngine(
            self.event_bus,
            self.scheduler,
            self.settings_provider
        )
    
    async def test_animate_target_disabled(self):
        """Test animation when animations are disabled."""
        self.settings_provider.set_animations_enabled(False)
        
        target = AnimationTarget("test", "widget", {})
        config = AnimationConfig(duration=1.0)
        
        animation_id = await self.engine.animate_target(target, config)
        assert animation_id  # Should return an ID even when disabled
    
    async def test_animate_target_enabled(self):
        """Test animation when animations are enabled."""
        # Mock scheduler to simulate animation completion
        async def mock_schedule(anim_id, config, callback):
            callback(1.0)  # Complete immediately
        
        self.scheduler.schedule_animation = mock_schedule
        
        target = AnimationTarget("test", "widget", {})
        config = AnimationConfig(duration=1.0)
        
        animation_id = await self.engine.animate_target(target, config)
        assert animation_id
        
        # Animation should be completed and cleaned up
        assert animation_id not in self.engine.active_animations
    
    def test_pause_resume_animation(self):
        """Test pausing and resuming animations."""
        # Create a mock active animation
        from core.animation.animation_engine import ActiveAnimation
        
        animation = ActiveAnimation(
            id="test_anim",
            target=AnimationTarget("test", "widget", {}),
            config=AnimationConfig(),
            start_time=0.0,
            state=AnimationState.RUNNING
        )
        
        self.engine.active_animations["test_anim"] = animation
        
        # Test pause
        success = self.engine.pause_animation("test_anim")
        assert success
        assert animation.state == AnimationState.PAUSED
        
        # Test resume
        success = self.engine.resume_animation("test_anim")
        assert success
        assert animation.state == AnimationState.RUNNING
    
    def test_cancel_animation(self):
        """Test cancelling animations."""
        from core.animation.animation_engine import ActiveAnimation
        
        animation = ActiveAnimation(
            id="test_anim",
            target=AnimationTarget("test", "widget", {}),
            config=AnimationConfig(),
            start_time=0.0,
            state=AnimationState.RUNNING
        )
        
        self.engine.active_animations["test_anim"] = animation
        
        success = self.engine.cancel_animation("test_anim")
        assert success
        assert "test_anim" not in self.engine.active_animations


@pytest.mark.asyncio
class TestFadeCommand:
    """Test fade command implementation."""
    
    def setup_method(self):
        self.mock_engine = Mock()
        self.target = AnimationTarget("test", "widget", {})
        self.config = AnimationConfig(duration=1.0)
    
    async def test_fade_in_command(self):
        """Test fade in command execution."""
        self.mock_engine.animate_target.return_value = "anim_123"
        
        command = FadeCommand(
            target=self.target,
            fade_in=True,
            config=self.config,
            engine=self.mock_engine
        )
        
        success = await command.execute()
        assert success
        assert command._animation_id == "anim_123"
        
        # Check that engine was called with correct config
        self.mock_engine.animate_target.assert_called_once()
        call_args = self.mock_engine.animate_target.call_args
        assert call_args[0][0] == self.target  # target
        config_arg = call_args[0][1]  # config
        assert config_arg.start_value == 0.0  # fade in starts from 0
        assert config_arg.end_value == 1.0    # fade in ends at 1
    
    async def test_fade_out_command(self):
        """Test fade out command execution."""
        self.mock_engine.animate_target.return_value = "anim_456"
        
        command = FadeCommand(
            target=self.target,
            fade_in=False,
            config=self.config,
            engine=self.mock_engine
        )
        
        success = await command.execute()
        assert success
        
        # Check fade out values
        call_args = self.mock_engine.animate_target.call_args
        config_arg = call_args[0][1]
        assert config_arg.start_value == 1.0  # fade out starts from 1
        assert config_arg.end_value == 0.0    # fade out ends at 0
    
    async def test_command_undo(self):
        """Test command undo functionality."""
        self.mock_engine.animate_target.return_value = "anim_789"
        
        command = FadeCommand(
            target=self.target,
            fade_in=True,
            config=self.config,
            engine=self.mock_engine
        )
        
        await command.execute()
        assert command.can_undo()
        
        # Reset mock to track undo call
        self.mock_engine.reset_mock()
        self.mock_engine.animate_target.return_value = "undo_anim"
        
        success = await command.undo()
        assert success
        
        # Undo should create reverse animation
        call_args = self.mock_engine.animate_target.call_args
        config_arg = call_args[0][1]
        assert config_arg.start_value == 1.0  # undo fade in: start from 1
        assert config_arg.end_value == 0.0    # undo fade in: end at 0


class TestModernAnimationOrchestrator:
    """Test the main animation orchestrator."""
    
    def setup_method(self):
        # Create mocks for all dependencies
        self.mock_engine = Mock()
        self.mock_adapter = Mock(spec=QtTargetAdapter)
        self.mock_renderer = Mock()
        self.mock_event_bus = Mock()
        self.mock_stack_adapter = Mock()
        self.mock_effect_manager = Mock()
        self.mock_settings = Mock()
        
        self.orchestrator = ModernAnimationOrchestrator(
            animation_engine=self.mock_engine,
            target_adapter=self.mock_adapter,
            renderer=self.mock_renderer,
            event_bus=self.mock_event_bus,
            stack_adapter=self.mock_stack_adapter,
            effect_manager=self.mock_effect_manager,
            settings_integration=self.mock_settings
        )
    
    @pytest.mark.asyncio
    async def test_fade_target(self):
        """Test fading a single target."""
        mock_widget = Mock()
        mock_target = AnimationTarget("test", "widget", {})
        
        self.mock_adapter.adapt_target.return_value = mock_target
        
        result = await self.orchestrator.fade_target(mock_widget, fade_in=True)
        
        self.mock_adapter.adapt_target.assert_called_once_with(mock_widget)
        # Command should be added to history
        assert len(self.orchestrator._command_history) == 1
    
    @pytest.mark.asyncio
    async def test_fade_multiple_targets(self):
        """Test fading multiple targets."""
        mock_widgets = [Mock(), Mock()]
        mock_targets = [
            AnimationTarget("test1", "widget", {}),
            AnimationTarget("test2", "widget", {})
        ]
        
        self.mock_adapter.adapt_target.side_effect = mock_targets
        
        result = await self.orchestrator.fade_targets(mock_widgets, fade_in=False)
        
        assert self.mock_adapter.adapt_target.call_count == 2
        assert len(self.orchestrator._command_history) == 2
    
    @pytest.mark.asyncio
    async def test_transition_targets(self):
        """Test fade out, update, fade in pattern."""
        mock_widgets = [Mock()]
        mock_target = AnimationTarget("test", "widget", {})
        callback_called = False
        
        def test_callback():
            nonlocal callback_called
            callback_called = True
        
        self.mock_adapter.adapt_target.return_value = mock_target
        
        await self.orchestrator.transition_targets(
            mock_widgets,
            test_callback
        )
        
        assert callback_called
        # Should have 2 commands: fade out + fade in
        assert len(self.orchestrator._command_history) == 2
    
    @pytest.mark.asyncio
    async def test_undo_command(self):
        """Test undoing the last command."""
        mock_widget = Mock()
        mock_target = AnimationTarget("test", "widget", {})
        
        self.mock_adapter.adapt_target.return_value = mock_target
        
        # Execute a command
        await self.orchestrator.fade_target(mock_widget, fade_in=True)
        assert len(self.orchestrator._command_history) == 1
        
        # Mock the undo method
        self.orchestrator._command_history[0].undo = Mock(return_value=True)
        
        # Undo should work
        success = await self.orchestrator.undo_last_command()
        assert success
        assert len(self.orchestrator._command_history) == 0


class TestLegacyWrapper:
    """Test the legacy compatibility wrapper."""
    
    def setup_method(self):
        self.mock_orchestrator = Mock(spec=ModernAnimationOrchestrator)
        self.wrapper = LegacyFadeManagerWrapper(self.mock_orchestrator)
    
    def test_fades_enabled(self):
        """Test legacy fades_enabled method."""
        self.mock_orchestrator.get_animations_enabled.return_value = True
        assert self.wrapper.fades_enabled() is True
    
    def test_widget_fader_interface(self):
        """Test widget fader legacy interface."""
        mock_widgets = [Mock(), Mock()]
        
        # This should work without throwing errors
        self.wrapper.widget_fader.fade_widgets(mock_widgets, True, duration=300)
        
        # The actual async call verification would require more complex mocking
        # but the interface should be compatible
    
    def test_stack_fader_interface(self):
        """Test stack fader legacy interface."""
        mock_stack = Mock()
        
        # Should work without errors
        self.wrapper.stack_fader.fade_stack(mock_stack, 1, duration=400)


class TestSystemIntegration:
    """Integration tests for the complete system."""
    
    def setup_method(self):
        # Create the complete system
        self.orchestrator, self.legacy_wrapper = create_modern_animation_system()
    
    def test_system_creation(self):
        """Test that the complete system can be created."""
        assert self.orchestrator is not None
        assert self.legacy_wrapper is not None
        assert isinstance(self.orchestrator, ModernAnimationOrchestrator)
        assert isinstance(self.legacy_wrapper, LegacyFadeManagerWrapper)
    
    def test_settings_integration(self):
        """Test settings integration."""
        # Should have default settings
        assert self.orchestrator.get_animations_enabled() is True
    
    @pytest.mark.asyncio
    async def test_mock_widget_animation(self):
        """Test animation with mock Qt widgets."""
        # Create a mock widget
        mock_widget = Mock()
        mock_widget.__class__.__name__ = "QWidget"
        mock_widget.x.return_value = 0
        mock_widget.y.return_value = 0
        mock_widget.width.return_value = 100
        mock_widget.height.return_value = 50
        mock_widget.isVisible.return_value = True
        mock_widget.isEnabled.return_value = True
        mock_widget.objectName.return_value = "test"
        mock_widget.setGraphicsEffect = Mock()
        mock_widget.graphicsEffect.return_value = None
        
        # Should work without errors (though mock won't show visual result)
        animation_id = await self.orchestrator.fade_target(mock_widget, fade_in=True)
        assert animation_id  # Should return some ID


def run_all_tests():
    """Run all tests for the modern animation system."""
    print("Running modern animation system tests...")
    
    try:
        # Test core easing functions
        test_easing = TestEasingFunctions()
        test_easing.test_linear_easing()
        test_easing.test_ease_in_out()
        test_easing.test_spring_easing()
        print("✓ Easing functions work correctly")
        
        # Test event bus
        test_events = TestSimpleEventBus()
        test_events.setup_method()
        test_events.test_subscribe_and_emit()
        test_events.test_multiple_subscribers()
        test_events.test_unsubscribe()
        print("✓ Event bus works correctly")
        
        # Test animation target
        test_target = TestAnimationTarget()
        test_target.test_animation_target_creation()
        test_target.test_target_hashing()
        print("✓ Animation targets work correctly")
        
        # Test system creation
        test_integration = TestSystemIntegration()
        test_integration.setup_method()
        test_integration.test_system_creation()
        test_integration.test_settings_integration()
        print("✓ System integration works")
        
        print("\n✅ All basic tests passed!")
        print("\nTo run full pytest suite:")
        print("pytest application/services/ui/animation/test_modern_animation_system.py -v")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    run_all_tests()
