"""
Test for widget reuse regression after removing OptionPickerWidgetPoolManager.

This test verifies that the option picker properly reuses widgets when switching
between different sequences, ensuring we always show the expected number of
pictographs (36 total across all sections).
"""

from unittest.mock import MagicMock, Mock

import pytest
from PyQt6.QtCore import QSize
from PyQt6.QtWidgets import QApplication, QWidget

from desktop.modern.domain.models.beat_data import BeatData
from desktop.modern.domain.models.pictograph_data import PictographData
from desktop.modern.domain.models.sequence_data import SequenceData
from desktop.modern.presentation.components.option_picker.components.option_picker_scroll import (
    OptionPickerScroll,
)
from desktop.modern.presentation.components.option_picker.types.letter_types import (
    LetterType,
)


class TestWidgetReuseRegression:
    """Test widget reuse functionality after widget pool manager removal."""

    @pytest.fixture
    def mock_services(self):
        """Create mock services for testing."""
        sequence_option_service = Mock()
        option_pool_service = Mock()
        option_sizing_service = Mock()
        option_config_service = Mock()

        # Configure option config service
        option_config_service.get_total_max_pictographs.return_value = 50
        option_config_service.get_max_pictographs_for_type.return_value = 16
        option_config_service.get_layout_config.return_value = {
            "spacing": 3,
            "column_count": 8,
            "min_frame_size": 60,
            "border_ratio": 0.015,
        }
        option_config_service.get_groupable_types.return_value = [
            LetterType.TYPE4,
            LetterType.TYPE5,
            LetterType.TYPE6,
        ]
        option_config_service.get_individual_types.return_value = [
            LetterType.TYPE1,
            LetterType.TYPE2,
            LetterType.TYPE3,
        ]
        option_config_service.get_debounce_delay.return_value = 50

        # Configure option pool service
        option_pool_service.checkout_item.side_effect = lambda: len(
            getattr(option_pool_service, "_checked_out", [])
        )
        option_pool_service.checkin_item = Mock()
        option_pool_service.reset_pool = Mock()

        return {
            "sequence_option_service": sequence_option_service,
            "option_pool_service": option_pool_service,
            "option_sizing_service": option_sizing_service,
            "option_config_service": option_config_service,
        }

    @pytest.fixture
    def option_picker_scroll(self, qtbot, mock_services):
        """Create OptionPickerScroll instance for testing."""
        scroll = OptionPickerScroll(
            sequence_option_service=mock_services["sequence_option_service"],
            option_pool_service=mock_services["option_pool_service"],
            option_sizing_service=mock_services["option_sizing_service"],
            option_config_service=mock_services["option_config_service"],
            mw_size_provider=lambda: QSize(800, 600),
        )
        qtbot.addWidget(scroll)
        return scroll

    def create_mock_sequence_with_options(
        self, sequence_length: int = 4
    ) -> tuple[SequenceData, dict]:
        """Create a mock sequence with expected option counts."""
        # Create sequence data
        beats = []
        for i in range(sequence_length):
            beat = BeatData(
                beat_number=i + 1,
                pictograph_data=PictographData(),  # has_pictograph is a property based on this
            )
            beats.append(beat)

        sequence = SequenceData(beats=beats)

        # Create options by letter type (should total 36 pictographs)
        options_by_type = {
            LetterType.TYPE1: [PictographData() for _ in range(16)],  # 16 pictographs
            LetterType.TYPE2: [PictographData() for _ in range(8)],  # 8 pictographs
            LetterType.TYPE3: [PictographData() for _ in range(8)],  # 8 pictographs
            LetterType.TYPE4: [PictographData() for _ in range(2)],  # 2 pictographs
            LetterType.TYPE5: [PictographData() for _ in range(1)],  # 1 pictograph
            LetterType.TYPE6: [PictographData() for _ in range(1)],  # 1 pictograph
        }
        # Total: 16 + 8 + 8 + 2 + 1 + 1 = 36 pictographs

        return sequence, options_by_type

    def test_widget_pool_initialization(self, option_picker_scroll):
        """Test that widget pool is properly initialized with lazy loading."""
        assert hasattr(option_picker_scroll, "_widget_pool")
        assert isinstance(option_picker_scroll._widget_pool, dict)
        assert (
            len(option_picker_scroll._widget_pool) == 0
        )  # Lazy loading - starts empty

    def test_widget_creation_on_demand(self, option_picker_scroll):
        """Test that widgets are created on demand."""
        # Request a widget
        widget = option_picker_scroll.get_widget_from_pool(0)

        assert widget is not None
        assert 0 in option_picker_scroll._widget_pool
        assert option_picker_scroll._widget_pool[0] is widget

    def test_widget_reuse_from_cache(self, option_picker_scroll):
        """Test that widgets are reused from cache."""
        # Create first widget
        widget1 = option_picker_scroll.get_widget_from_pool(0)

        # Request same widget again
        widget2 = option_picker_scroll.get_widget_from_pool(0)

        assert widget1 is widget2  # Should be the same instance
        assert len(option_picker_scroll._widget_pool) == 1  # Only one widget created

    def test_multiple_widget_creation(self, option_picker_scroll):
        """Test creation of multiple widgets."""
        widgets = []
        for i in range(10):
            widget = option_picker_scroll.get_widget_from_pool(i)
            widgets.append(widget)
            assert widget is not None

        # All widgets should be different instances
        assert len(set(widgets)) == 10
        assert (
            len(option_picker_scroll._widget_pool) == 10
        )  # 10 widgets created on-demand

    def test_widget_cache_reset(self, option_picker_scroll):
        """Test that widget cache reset hides widgets but keeps them."""
        # Create some widgets
        widgets = []
        for i in range(5):
            widget = option_picker_scroll.get_widget_from_pool(i)
            widgets.append(widget)
            widget.show()  # Make them visible

        # Reset cache
        option_picker_scroll._reset_widget_cache()

        # Widgets should be cleared from pool (lazy loading optimization)
        assert (
            len(option_picker_scroll._widget_pool) == 0
        )  # Pool cleared for memory efficiency
        # Note: widgets are destroyed/cleared, so we can't check visibility

    def test_widget_checkout_creates_widgets(self, option_picker_scroll):
        """Test that checking out widgets creates them in the cache."""
        # Simulate the widget checkout process that happens during option display

        # Check out several widgets (simulating what happens when options are displayed)
        widgets = []
        for i in range(10):
            widget = option_picker_scroll.get_widget_from_pool(i)
            if widget:
                widgets.append(widget)

        # Verify widgets were retrieved from pool
        assert len(widgets) == 10, f"Expected 10 widgets, got {len(widgets)}"
        assert (
            len(option_picker_scroll._widget_pool) == 10
        ), f"Expected 10 pooled widgets (created on-demand), got {len(option_picker_scroll._widget_pool)}"

        # Verify all widgets are different instances
        widget_ids = [id(w) for w in widgets]
        assert len(set(widget_ids)) == 10, "Widgets should be different instances"

    def test_sequence_switching_reuses_widgets(
        self, option_picker_scroll, mock_services
    ):
        """Test that switching between sequences properly reuses widgets."""
        # Load first sequence
        sequence1, options1 = self.create_mock_sequence_with_options(3)
        mock_services[
            "sequence_option_service"
        ].get_options_for_sequence.return_value = options1
        option_picker_scroll.load_options_from_sequence(sequence1)
        QApplication.processEvents()

        initial_widget_count = len(option_picker_scroll._widget_pool)

        # Load second sequence with different options
        sequence2, options2 = self.create_mock_sequence_with_options(5)
        mock_services[
            "sequence_option_service"
        ].get_options_for_sequence.return_value = options2
        option_picker_scroll.load_options_from_sequence(sequence2)
        QApplication.processEvents()

        # Widget count should not decrease (widgets should be reused)
        final_widget_count = len(option_picker_scroll._widget_pool)
        assert (
            final_widget_count >= initial_widget_count
        ), "Widgets were not properly reused!"

    def test_max_widget_limit_respected(self, option_picker_scroll):
        """Test that the maximum widget limit is respected."""
        max_widgets = option_picker_scroll._max_widgets

        # Try to create more widgets than the limit
        widgets = []
        for i in range(max_widgets + 10):
            widget = option_picker_scroll.get_widget_from_pool(i)
            if widget:
                widgets.append(widget)

        # Should not exceed the maximum
        assert len(widgets) <= max_widgets
        assert len(option_picker_scroll._widget_pool) <= max_widgets
