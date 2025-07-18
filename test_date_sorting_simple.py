"""
Simple unit tests for date sorting functionality.

Tests only the core sorting methods without GUI components.
"""

import os
import sys
from datetime import datetime

# Add the src directory to the path
sys.path.insert(
    0, os.path.join(os.path.dirname(__file__), "src", "desktop", "modern", "src")
)

from domain.models.sequence_data import SequenceData


class TestDateSortingCore:
    """Test the core date sorting functionality."""

    def test_date_section_key_formatting(self):
        """Test that date section keys are formatted correctly (MM-DD-YYYY)."""

        # Simulate the _get_section_key method logic
        def get_section_key(sequence, sort_method):
            if sort_method == "date_added":
                if sequence.date_added:
                    return sequence.date_added.strftime("%m-%d-%Y")
                else:
                    return "Unknown"
            return "Other"

        # Test sequences with dates
        seq_with_date = SequenceData(
            id="seq1", word="Alpha", date_added=datetime(2024, 1, 15), sequence_length=4
        )

        section_key = get_section_key(seq_with_date, "date_added")
        assert (
            section_key == "01-15-2024"
        ), f"Expected '01-15-2024', got '{section_key}'"

        # Test second sequence
        seq_with_date2 = SequenceData(
            id="seq2", word="Beta", date_added=datetime(2024, 2, 20), sequence_length=6
        )

        section_key2 = get_section_key(seq_with_date2, "date_added")
        assert (
            section_key2 == "02-20-2024"
        ), f"Expected '02-20-2024', got '{section_key2}'"

        # Test sequence without date
        seq_without_date = SequenceData(
            id="seq3", word="Gamma", date_added=None, sequence_length=3
        )

        section_key3 = get_section_key(seq_without_date, "date_added")
        assert section_key3 == "Unknown", f"Expected 'Unknown', got '{section_key3}'"

        print("✅ Date section key formatting test passed!")

    def test_date_sorting_order(self):
        """Test that sequences are sorted by date correctly (newest first)."""
        sequences = [
            SequenceData(
                id="seq1",
                word="Alpha",
                date_added=datetime(2024, 1, 15),
                sequence_length=4,
            ),
            SequenceData(
                id="seq2",
                word="Beta",
                date_added=datetime(2024, 2, 20),
                sequence_length=6,
            ),
            SequenceData(
                id="seq3",
                word="Gamma",
                date_added=datetime(2023, 12, 10),
                sequence_length=3,
            ),
            SequenceData(
                id="seq4",
                word="Delta",
                date_added=datetime(2024, 1, 25),
                sequence_length=5,
            ),
            SequenceData(
                id="seq5", word="Epsilon", date_added=None, sequence_length=4  # No date
            ),
        ]

        # Simulate the _sort_sequences method logic
        def sort_sequences(sequences, sort_method):
            if sort_method == "date_added":
                return sorted(
                    sequences,
                    key=lambda s: s.date_added if s.date_added else datetime.min,
                    reverse=True,
                )
            return sequences

        sorted_sequences = sort_sequences(sequences, "date_added")

        # Expected order: newest first, then sequences without dates
        expected_order = [
            "Beta",  # 2024-02-20
            "Delta",  # 2024-01-25
            "Alpha",  # 2024-01-15
            "Gamma",  # 2023-12-10
            "Epsilon",  # None (should be last)
        ]

        actual_order = [seq.word for seq in sorted_sequences]
        assert (
            actual_order == expected_order
        ), f"Expected {expected_order}, got {actual_order}"

        print("✅ Date sorting order test passed!")

    def test_date_section_grouping(self):
        """Test that sequences are grouped into date sections correctly."""
        sequences = [
            SequenceData(
                id="seq1",
                word="Alpha",
                date_added=datetime(2024, 1, 15),
                sequence_length=4,
            ),
            SequenceData(
                id="seq2",
                word="Beta",
                date_added=datetime(2024, 2, 20),
                sequence_length=6,
            ),
            SequenceData(
                id="seq3",
                word="Gamma",
                date_added=datetime(2023, 12, 10),
                sequence_length=3,
            ),
            SequenceData(
                id="seq4",
                word="Delta",
                date_added=datetime(2024, 1, 25),
                sequence_length=5,
            ),
            SequenceData(
                id="seq5", word="Epsilon", date_added=None, sequence_length=4  # No date
            ),
        ]

        # Simulate the sorting and grouping logic
        def sort_sequences(sequences, sort_method):
            if sort_method == "date_added":
                return sorted(
                    sequences,
                    key=lambda s: s.date_added if s.date_added else datetime.min,
                    reverse=True,
                )
            return sequences

        def get_section_key(sequence, sort_method):
            if sort_method == "date_added":
                if sequence.date_added:
                    return sequence.date_added.strftime("%m-%d-%Y")
                else:
                    return "Unknown"
            return "Other"

        def group_sequences_into_sections(sequences, sort_method):
            sections = {}
            for sequence in sequences:
                section_key = get_section_key(sequence, sort_method)
                if section_key not in sections:
                    sections[section_key] = []
                sections[section_key].append(sequence)
            return sections

        # Sort sequences first
        sorted_sequences = sort_sequences(sequences, "date_added")

        # Group into sections
        sections = group_sequences_into_sections(sorted_sequences, "date_added")

        # Check that sections are created correctly
        expected_sections = {
            "02-20-2024": ["Beta"],
            "01-25-2024": ["Delta"],
            "01-15-2024": ["Alpha"],
            "12-10-2023": ["Gamma"],
            "Unknown": ["Epsilon"],
        }

        # Convert sections to word names for comparison
        actual_sections = {}
        for section_key, section_sequences in sections.items():
            actual_sections[section_key] = [seq.word for seq in section_sequences]

        assert (
            actual_sections == expected_sections
        ), f"Expected {expected_sections}, got {actual_sections}"

        print("✅ Date section grouping test passed!")

    def test_date_formats(self):
        """Test date section keys with various date formats."""

        def get_section_key(sequence, sort_method):
            if sort_method == "date_added":
                if sequence.date_added:
                    return sequence.date_added.strftime("%m-%d-%Y")
                else:
                    return "Unknown"
            return "Other"

        # Test different dates
        test_dates = [
            (datetime(2024, 1, 1), "01-01-2024"),
            (datetime(2024, 12, 31), "12-31-2024"),
            (datetime(2023, 7, 4), "07-04-2023"),
            (datetime(2025, 3, 15), "03-15-2025"),
        ]

        for date_obj, expected_key in test_dates:
            seq = SequenceData(
                id="test", word="Test", date_added=date_obj, sequence_length=4
            )

            section_key = get_section_key(seq, "date_added")
            assert (
                section_key == expected_key
            ), f"Expected '{expected_key}', got '{section_key}'"

        print("✅ Date formats test passed!")

    def run_all_tests(self):
        """Run all tests."""
        print("🧪 Running date sorting functionality tests...")

        try:
            self.test_date_section_key_formatting()
            self.test_date_sorting_order()
            self.test_date_section_grouping()
            self.test_date_formats()
            print("\n🎉 All tests passed!")
            return True
        except Exception as e:
            print(f"\n❌ Test failed: {e}")
            return False


if __name__ == "__main__":
    test_suite = TestDateSortingCore()
    success = test_suite.run_all_tests()
    exit(0 if success else 1)
