"""
Unit tests for date sorting functionality in Browse tab.

Tests the date parsing, sorting, and section formatting to ensure 
it matches the legacy system exactly.
"""

import pytest
from datetime import datetime
from unittest.mock import MagicMock, patch
import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src', 'desktop', 'modern', 'src'))

from domain.models.sequence_data import SequenceData
from presentation.tabs.browse.components.sequence_browser_panel import SequenceBrowserPanel
from presentation.tabs.browse.services.browse_service import BrowseService
from presentation.tabs.browse.services.browse_state_service import BrowseStateService

class TestDateSortingFunctionality:
    """Test date sorting functionality in Browse tab."""
    
    @pytest.fixture
    def mock_services(self):
        """Create mock services for testing."""
        browse_service = MagicMock(spec=BrowseService)
        state_service = MagicMock(spec=BrowseStateService)
        return browse_service, state_service
    
    @pytest.fixture
    def sequence_browser_panel(self, mock_services):
        """Create a SequenceBrowserPanel for testing."""
        browse_service, state_service = mock_services
        
        # Mock the parent widget
        with patch('presentation.tabs.browse.components.sequence_browser_panel.QWidget.__init__'):
            panel = SequenceBrowserPanel(browse_service, state_service)
            return panel
    
    @pytest.fixture
    def test_sequences_with_dates(self):
        """Create test sequences with various dates."""
        sequences = [
            SequenceData(
                id="seq1",
                word="Alpha",
                date_added=datetime(2024, 1, 15),
                sequence_length=4
            ),
            SequenceData(
                id="seq2", 
                word="Beta",
                date_added=datetime(2024, 2, 20),
                sequence_length=6
            ),
            SequenceData(
                id="seq3",
                word="Gamma", 
                date_added=datetime(2023, 12, 10),
                sequence_length=3
            ),
            SequenceData(
                id="seq4",
                word="Delta",
                date_added=datetime(2024, 1, 25),
                sequence_length=5
            ),
            SequenceData(
                id="seq5",
                word="Epsilon",
                date_added=None,  # No date
                sequence_length=4
            )
        ]
        return sequences
    
    def test_date_section_key_formatting(self, sequence_browser_panel, test_sequences_with_dates):
        """Test that date section keys are formatted correctly (MM-DD-YYYY)."""
        sequences = test_sequences_with_dates
        
        # Test sequences with dates
        seq_with_date = sequences[0]  # Alpha, 2024-01-15
        section_key = sequence_browser_panel._get_section_key(seq_with_date, "date_added")
        assert section_key == "01-15-2024", f"Expected '01-15-2024', got '{section_key}'"
        
        # Test second sequence
        seq_with_date2 = sequences[1]  # Beta, 2024-02-20
        section_key2 = sequence_browser_panel._get_section_key(seq_with_date2, "date_added")
        assert section_key2 == "02-20-2024", f"Expected '02-20-2024', got '{section_key2}'"
        
        # Test sequence without date
        seq_without_date = sequences[4]  # Epsilon, no date
        section_key3 = sequence_browser_panel._get_section_key(seq_without_date, "date_added")
        assert section_key3 == "Unknown", f"Expected 'Unknown', got '{section_key3}'"
    
    def test_date_sorting_order(self, sequence_browser_panel, test_sequences_with_dates):
        """Test that sequences are sorted by date correctly (newest first)."""
        sequences = test_sequences_with_dates
        
        sorted_sequences = sequence_browser_panel._sort_sequences(sequences, "date_added")
        
        # Expected order: newest first, then sequences without dates
        expected_order = [
            "Beta",    # 2024-02-20
            "Delta",   # 2024-01-25
            "Alpha",   # 2024-01-15
            "Gamma",   # 2023-12-10
            "Epsilon"  # None (should be last)
        ]
        
        actual_order = [seq.word for seq in sorted_sequences]
        assert actual_order == expected_order, f"Expected {expected_order}, got {actual_order}"
    
    def test_date_section_grouping(self, sequence_browser_panel, test_sequences_with_dates):
        """Test that sequences are grouped into date sections correctly."""
        sequences = test_sequences_with_dates
        
        # Sort sequences first
        sorted_sequences = sequence_browser_panel._sort_sequences(sequences, "date_added")
        
        # Group into sections
        sections = sequence_browser_panel._group_sequences_into_sections(sorted_sequences, "date_added")
        
        # Check that sections are created correctly
        expected_sections = {
            "02-20-2024": ["Beta"],
            "01-25-2024": ["Delta"],
            "01-15-2024": ["Alpha"],
            "12-10-2023": ["Gamma"],
            "Unknown": ["Epsilon"]
        }
        
        # Convert sections to word names for comparison
        actual_sections = {}
        for section_key, section_sequences in sections.items():
            actual_sections[section_key] = [seq.word for seq in section_sequences]
        
        assert actual_sections == expected_sections, f"Expected {expected_sections}, got {actual_sections}"
    
    def test_date_section_navigation_list(self, sequence_browser_panel, test_sequences_with_dates):
        """Test that the navigation section list is generated correctly."""
        sequences = test_sequences_with_dates
        
        # Sort and group sequences
        sorted_sequences = sequence_browser_panel._sort_sequences(sequences, "date_added")
        sections = sequence_browser_panel._group_sequences_into_sections(sorted_sequences, "date_added")
        
        # Get section names (should be in order)
        section_names = list(sections.keys())
        
        expected_sections = [
            "02-20-2024",
            "01-25-2024", 
            "01-15-2024",
            "12-10-2023",
            "Unknown"
        ]
        
        assert section_names == expected_sections, f"Expected {expected_sections}, got {section_names}"
        
    def test_non_date_sorting_unaffected(self, sequence_browser_panel, test_sequences_with_dates):
        """Test that non-date sorting methods are not affected."""
        sequences = test_sequences_with_dates
        
        # Test alphabetical sorting
        alpha_sorted = sequence_browser_panel._sort_sequences(sequences, "alphabetical")
        alpha_words = [seq.word for seq in alpha_sorted]
        assert alpha_words == ["Alpha", "Beta", "Delta", "Epsilon", "Gamma"]
        
        # Test length sorting
        length_sorted = sequence_browser_panel._sort_sequences(sequences, "length")
        length_words = [seq.word for seq in length_sorted]
        assert length_words == ["Gamma", "Alpha", "Epsilon", "Delta", "Beta"]
        
    def test_date_section_key_with_different_formats(self, sequence_browser_panel):
        """Test date section keys with various date formats."""
        # Test different dates
        test_dates = [
            (datetime(2024, 1, 1), "01-01-2024"),
            (datetime(2024, 12, 31), "12-31-2024"),
            (datetime(2023, 7, 4), "07-04-2023"),
            (datetime(2025, 3, 15), "03-15-2025"),
        ]
        
        for date_obj, expected_key in test_dates:
            seq = SequenceData(
                id="test",
                word="Test",
                date_added=date_obj,
                sequence_length=4
            )
            
            section_key = sequence_browser_panel._get_section_key(seq, "date_added")
            assert section_key == expected_key, f"Expected '{expected_key}', got '{section_key}'"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
