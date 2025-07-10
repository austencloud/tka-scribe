"""
Test for Section Layout Service

Basic test to verify the service works correctly.
"""

import pytest
from application.services.layout.section_layout_service import (
    LayoutDimensions,
    SectionLayoutService,
    SizingConstraints,
)
from presentation.components.option_picker.types.letter_types import LetterType


class TestSectionLayoutService:
    """Test cases for SectionLayoutService."""

    def setup_method(self):
        """Set up test fixtures."""
        self.service = SectionLayoutService()

    def test_service_initialization(self):
        """Test that service initializes correctly."""
        assert self.service is not None
        assert self.service._current_constraints is None
        assert self.service._cached_dimensions is None

    def test_calculate_pictograph_size(self):
        """Test pictograph size calculation."""
        constraints = SizingConstraints(
            main_window_width=800,
            container_width=400,
            letter_type=LetterType.TYPE1,
            spacing=8,
        )

        size = self.service.calculate_pictograph_size(constraints)

        # Should be within reasonable bounds
        assert 60 <= size <= 200
        assert isinstance(size, int)

    def test_calculate_section_width(self):
        """Test section width calculation."""
        # Test top row section (TYPE1)
        width = self.service.calculate_section_width(LetterType.TYPE1, 900)
        assert width == 900  # Full width

        # Test bottom row section (TYPE4)
        width = self.service.calculate_section_width(LetterType.TYPE4, 900)
        assert width == 300  # One third

    def test_calculate_section_height(self):
        """Test section height calculation."""
        constraints = SizingConstraints(
            main_window_width=800,
            container_width=400,
            letter_type=LetterType.TYPE1,
            spacing=8,
        )

        dimensions = self.service.calculate_section_height(constraints, 50)

        assert isinstance(dimensions, LayoutDimensions)
        assert dimensions.header_height == 50
        assert dimensions.pictograph_size > 0
        assert dimensions.section_height > dimensions.header_height

    def test_validate_dimensions(self):
        """Test dimension validation."""
        # Valid dimensions
        valid_dimensions = LayoutDimensions(
            pictograph_size=100,
            section_width=300,
            section_height=200,
            header_height=50,
            content_height=150,
        )

        assert self.service.validate_dimensions(valid_dimensions) is True

        # Invalid dimensions (pictograph too small)
        invalid_dimensions = LayoutDimensions(
            pictograph_size=30,  # Too small
            section_width=300,
            section_height=200,
            header_height=50,
            content_height=150,
        )

        assert self.service.validate_dimensions(invalid_dimensions) is False

    def test_caching(self):
        """Test dimension caching."""
        constraints = SizingConstraints(
            main_window_width=800,
            container_width=400,
            letter_type=LetterType.TYPE1,
            spacing=8,
        )

        dimensions = LayoutDimensions(
            pictograph_size=100,
            section_width=300,
            section_height=200,
            header_height=50,
            content_height=150,
        )

        # Cache dimensions
        self.service.cache_dimensions(constraints, dimensions)

        # Should get cached dimensions
        cached = self.service.get_cached_dimensions(constraints)
        assert cached == dimensions

        # Clear cache
        self.service.clear_cache()
        cached = self.service.get_cached_dimensions(constraints)
        assert cached is None

    def test_resize_calculations(self):
        """Test resize dimension calculations."""
        current_dimensions = LayoutDimensions(
            pictograph_size=100,
            section_width=300,
            section_height=200,
            header_height=50,
            content_height=150,
        )

        # Test significant resize
        new_dimensions = self.service.calculate_resize_dimensions(
            300, 400, current_dimensions
        )

        assert new_dimensions is not None
        assert new_dimensions.section_width == 400

        # Test insignificant resize
        no_change = self.service.calculate_resize_dimensions(
            300, 302, current_dimensions
        )

        assert no_change is None  # Should return None for small changes


if __name__ == "__main__":
    pytest.main([__file__])
