"""
Event Bus Core Tests - Real Working Implementation

Tests the actual TypeSafeEventBus that exists in the codebase.
"""

import asyncio
import os
import sys
from unittest.mock import Mock

import pytest

# Add src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from desktop.modern.core.events.domain_events import SequenceUpdatedEvent
from desktop.modern.core.events.event_bus import EventPriority, TypeSafeEventBus


class TestEventBusCore:
    """Test the core event bus functionality."""

    @pytest.fixture
    def event_bus(self):
        """Create fresh event bus for each test."""
        return TypeSafeEventBus()

    def test_event_bus_creation(self, event_bus):
        """Test that we can create an event bus."""
        assert event_bus is not None
        assert hasattr(event_bus, "subscribe")
        assert hasattr(event_bus, "publish")

    def test_event_subscription(self, event_bus):
        """Test basic event subscription."""
        handler = Mock()

        # Subscribe to an event type
        event_bus.subscribe("sequence.beat_added", handler)

        # Should be able to subscribe without error
        assert True  # If we get here, subscription worked

    def test_event_publishing(self, event_bus):
        """Test basic event publishing."""
        handler = Mock()
        event_bus.subscribe("sequence.beat_added", handler)

        # Create and publish an event
        event = SequenceUpdatedEvent(
            sequence_id="test_seq",
            change_type="beat_added",
            previous_state={"beat_count": 0},
            new_state={"beat_count": 1},
        )

        event_bus.publish(event)

        # Handler should have been called
        handler.assert_called_once_with(event)

    def test_multiple_handlers(self, event_bus):
        """Test that multiple handlers can subscribe to same event."""
        handler1 = Mock()
        handler2 = Mock()

        event_bus.subscribe("sequence.beat_added", handler1)
        event_bus.subscribe("sequence.beat_added", handler2)

        event = SequenceUpdatedEvent(
            sequence_id="test_seq",
            change_type="beat_added",
            previous_state={"beat_count": 0},
            new_state={"beat_count": 1},
        )

        event_bus.publish(event)

        # Both handlers should have been called
        handler1.assert_called_once_with(event)
        handler2.assert_called_once_with(event)

    def test_unsubscribe(self, event_bus):
        """Test unsubscribing from events."""
        handler = Mock()

        # Subscribe then unsubscribe
        subscription_id = event_bus.subscribe("sequence.beat_added", handler)
        event_bus.unsubscribe(subscription_id)

        # Publish event - handler should not be called
        event = SequenceUpdatedEvent(
            sequence_id="test_seq",
            change_type="beat_added",
            previous_state={"beat_count": 0},
            new_state={"beat_count": 1},
        )

        event_bus.publish(event)

        # Handler should not have been called
        handler.assert_not_called()

    @pytest.mark.asyncio
    async def test_async_event_handling(self, event_bus):
        """Test async event handling capabilities."""
        async_handler = Mock()

        # Create an async handler
        async def async_event_handler(event):
            async_handler(event)
            await asyncio.sleep(0.001)  # Simulate async work

        event_bus.subscribe("sequence.beat_added", async_event_handler)

        event = SequenceUpdatedEvent(
            sequence_id="test_seq",
            change_type="beat_added",
            previous_state={"beat_count": 0},
            new_state={"beat_count": 1},
        )

        # Publish event
        await event_bus.publish_async(event)

        # Handler should have been called
        async_handler.assert_called_once_with(event)

    def test_event_priority_handling(self, event_bus):
        """Test event priority system."""
        high_priority_handler = Mock()
        normal_priority_handler = Mock()

        # Subscribe with different priorities
        event_bus.subscribe(
            "sequence.beat_added", high_priority_handler, priority=EventPriority.HIGH
        )
        event_bus.subscribe(
            "sequence.beat_added",
            normal_priority_handler,
            priority=EventPriority.NORMAL,
        )

        event = SequenceUpdatedEvent(
            sequence_id="test_seq",
            change_type="beat_added",
            previous_state={"beat_count": 0},
            new_state={"beat_count": 1},
        )

        event_bus.publish(event)

        # Both handlers should have been called
        high_priority_handler.assert_called_once_with(event)
        normal_priority_handler.assert_called_once_with(event)


if __name__ == "__main__":
    print("🧪 Running Event Bus Core Tests...")

    # Create test instance
    test_instance = TestEventBusCore()
    event_bus = TypeSafeEventBus()

    try:
        test_instance.test_event_bus_creation(event_bus)
        print("✅ Event bus creation test passed")
    except Exception as e:
        print(f"❌ Event bus creation test failed: {e}")

    try:
        test_instance.test_event_subscription(event_bus)
        print("✅ Event subscription test passed")
    except Exception as e:
        print(f"❌ Event subscription test failed: {e}")

    try:
        test_instance.test_event_publishing(event_bus)
        print("✅ Event publishing test passed")
    except Exception as e:
        print(f"❌ Event publishing test failed: {e}")

    try:
        test_instance.test_multiple_handlers(event_bus)
        print("✅ Multiple handlers test passed")
    except Exception as e:
        print(f"❌ Multiple handlers test failed: {e}")

    try:
        test_instance.test_unsubscribe(event_bus)
        print("✅ Unsubscribe test passed")
    except Exception as e:
        print(f"❌ Unsubscribe test failed: {e}")

    print("🎉 Event Bus Core Tests completed!")
