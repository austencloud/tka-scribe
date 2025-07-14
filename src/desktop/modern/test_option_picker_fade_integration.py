#!/usr/bin/env python3
"""
Focused Option Picker Fade Integration Test

This test specifically validates that the fade animation integration works
in the option picker sections, using real pictograph data.

Test Focus:
1. OptionPickerSection fade transitions
2. Animation orchestrator integration
3. Performance validation (200ms legacy timing)
4. Fallback behavior when animation not available
"""

import asyncio
import sys
import time
from typing import List

# Add src to path for imports
sys.path.insert(0, "src")

from application.services.ui.animation.modern_service_registration import (
    setup_modern_animation_services,
)
from core.dependency_injection.di_container import DIContainer
from core.interfaces.animation_core_interfaces import IAnimationOrchestrator
from domain.models.pictograph_data import PictographData
from presentation.components.option_picker.components.option_picker_section import (
    OptionPickerSection,
)
from presentation.components.option_picker.types.letter_types import LetterType
from PyQt6.QtCore import QSize
from PyQt6.QtWidgets import (
    QApplication,
    QLabel,
    QMainWindow,
    QPushButton,
    QVBoxLayout,
    QWidget,
)


class FadeIntegrationTest(QMainWindow):
    """Focused test for option picker fade integration."""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Option Picker Fade Integration Test")
        self.setGeometry(100, 100, 800, 600)

        # Setup UI first
        self.setup_ui()

        # Initialize animation system
        self.setup_animation_system()

        # Create test data
        self.test_pictographs = self.create_test_pictographs()

        # Create test section
        self.create_test_section()

    def setup_ui(self):
        """Setup test UI."""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)

        # Status label
        self.status_label = QLabel("Initializing...")
        layout.addWidget(self.status_label)

        # Test controls
        self.test_fade_button = QPushButton("Test Fade Transition")
        self.test_fade_button.clicked.connect(self.test_fade_transition)
        layout.addWidget(self.test_fade_button)

        self.test_direct_button = QPushButton("Test Direct Update (No Animation)")
        self.test_direct_button.clicked.connect(self.test_direct_update)
        layout.addWidget(self.test_direct_button)

        # Performance label
        self.performance_label = QLabel("Performance: Not tested")
        layout.addWidget(self.performance_label)

        # Container for test section
        self.section_container = QWidget()
        layout.addWidget(self.section_container)

    def setup_animation_system(self):
        """Setup animation system."""
        try:
            self.container = DIContainer()
            setup_modern_animation_services(self.container)
            self.animation_orchestrator = self.container.resolve(IAnimationOrchestrator)
            self.status_label.setText("✅ Animation system ready")
        except Exception as e:
            self.animation_orchestrator = None
            self.status_label.setText(f"⚠️ Animation system not available: {e}")
            print(f"Animation setup failed: {e}")

    def create_test_pictographs(self) -> List[List[PictographData]]:
        """Create test pictograph sets using real CSV data."""
        pictograph_sets = []

        try:
            from application.services.data.pictograph_factory import PictographFactory
            from application.services.pictograph.pictograph_csv_manager import (
                PictographCSVManager,
            )

            csv_manager = PictographCSVManager()
            pictograph_factory = PictographFactory()

            # Load real CSV data
            csv_data = csv_manager._load_csv_data()
            if csv_data.empty:
                print("No CSV data available")
                return pictograph_sets

            # Create two different sets for transition testing
            # Set 1: First 3 A pictographs
            a_entries = csv_data[csv_data["letter"] == "A"].head(3)
            set1 = []
            for _, entry in a_entries.iterrows():
                pictograph_data = pictograph_factory.create_pictograph_data_from_entry(
                    entry.to_dict(), "diamond"
                )
                set1.append(pictograph_data)
            pictograph_sets.append(set1)

            # Set 2: First 3 B pictographs (or more A if B not available)
            b_entries = csv_data[csv_data["letter"] == "B"].head(3)
            if b_entries.empty:
                b_entries = csv_data[csv_data["letter"] == "A"].iloc[3:6]

            set2 = []
            for _, entry in b_entries.iterrows():
                pictograph_data = pictograph_factory.create_pictograph_data_from_entry(
                    entry.to_dict(), "diamond"
                )
                set2.append(pictograph_data)
            pictograph_sets.append(set2)

            print(f"Created {len(pictograph_sets)} test pictograph sets")
            for i, pset in enumerate(pictograph_sets):
                letters = [p.letter for p in pset]
                print(f"  Set {i+1}: {letters}")

        except Exception as e:
            print(f"Failed to create test pictographs: {e}")
            import traceback

            traceback.print_exc()

        return pictograph_sets

    def create_test_section(self):
        """Create a test option picker section."""
        try:
            # Create mock services (minimal for testing)
            class MockPoolService:
                def checkout_item(self):
                    return 0

                def reset_pool(self):
                    pass

            class MockConfigService:
                def is_groupable_type(self, letter_type):
                    return False

                def get_layout_config(self):
                    return {"spacing": 5}

            class MockSizeCalculator:
                def calculate_frame_dimensions(self, mw_size, picker_width, spacing):
                    return {"component_size": 100, "frame_size": 108}

                def calculate_section_dimensions(
                    self,
                    letter_type=None,
                    main_window_width=None,
                    available_container_width=None,
                    **kwargs,
                ):
                    return {"width": 400, "height": 120}

            class MockScrollArea:
                def get_widget_from_pool(self, pool_id):
                    # Create a simple mock frame
                    from presentation.components.option_picker.components.pictograph_option_frame import (
                        PictographOptionFrame,
                    )
                    from presentation.components.pictograph.pictograph_component import (
                        create_pictograph_component,
                    )

                    pictograph_component = create_pictograph_component(
                        parent=self.section_container
                    )
                    frame = PictographOptionFrame(
                        parent=self.section_container,
                        pictograph_component=pictograph_component,
                        size_calculator=MockSizeCalculator(),
                    )
                    return frame

            # Create test section with animation orchestrator
            self.test_section = OptionPickerSection(
                letter_type=LetterType.TYPE1,
                scroll_area=MockScrollArea(),
                mw_size_provider=lambda: QSize(800, 600),
                option_pool_service=MockPoolService(),
                option_config_service=MockConfigService(),
                size_calculator=MockSizeCalculator(),
                animation_orchestrator=self.animation_orchestrator,
            )

            self.test_section.setParent(self.section_container)
            self.test_section.setup_components()
            self.test_section.show()

            print("✅ Test section created successfully")

        except Exception as e:
            print(f"❌ Failed to create test section: {e}")
            import traceback

            traceback.print_exc()

    def test_fade_transition(self):
        """Test fade transition with animation."""
        if not hasattr(self, "test_section") or not self.test_pictographs:
            self.status_label.setText("❌ Test section or pictographs not available")
            return

        # Alternate between pictograph sets
        current_set = getattr(self, "_current_set", 0)
        pictograph_set = self.test_pictographs[current_set % len(self.test_pictographs)]
        self._current_set = current_set + 1

        self.status_label.setText(
            f"🔄 Testing fade transition (Set {current_set + 1})..."
        )

        # Measure performance
        start_time = time.perf_counter()

        # Trigger fade transition
        self.test_section.load_options_from_sequence(pictograph_set)

        # Record timing
        transition_time = (time.perf_counter() - start_time) * 1000

        # Update performance display
        target_time = 200  # Legacy timing
        performance_status = "✅" if transition_time <= target_time * 1.5 else "⚠️"
        self.performance_label.setText(
            f"Performance: {transition_time:.1f}ms (Target: {target_time}ms) {performance_status}"
        )

        self.status_label.setText(
            f"✅ Fade transition complete - {len(pictograph_set)} pictographs"
        )

    def test_direct_update(self):
        """Test direct update without animation."""
        if not hasattr(self, "test_section") or not self.test_pictographs:
            self.status_label.setText("❌ Test section or pictographs not available")
            return

        # Temporarily disable animation
        original_orchestrator = self.test_section._animation_orchestrator
        self.test_section._animation_orchestrator = None

        try:
            # Alternate between pictograph sets
            current_set = getattr(self, "_current_set", 0)
            pictograph_set = self.test_pictographs[
                current_set % len(self.test_pictographs)
            ]
            self._current_set = current_set + 1

            self.status_label.setText(
                f"🔄 Testing direct update (Set {current_set + 1})..."
            )

            # Measure performance
            start_time = time.perf_counter()

            # Trigger direct update
            self.test_section.load_options_from_sequence(pictograph_set)

            # Record timing
            transition_time = (time.perf_counter() - start_time) * 1000

            self.performance_label.setText(
                f"Performance: {transition_time:.1f}ms (Direct update)"
            )
            self.status_label.setText(
                f"✅ Direct update complete - {len(pictograph_set)} pictographs"
            )

        finally:
            # Restore animation orchestrator
            self.test_section._animation_orchestrator = original_orchestrator


def main():
    """Run the focused fade integration test."""
    app = QApplication(sys.argv)

    print("🎭 Option Picker Fade Integration Test")
    print("=" * 45)
    print("Testing:")
    print("• OptionPickerSection fade transitions")
    print("• Animation orchestrator integration")
    print("• Performance validation (200ms target)")
    print("• Fallback behavior")
    print()

    test_window = FadeIntegrationTest()
    test_window.show()

    print("🚀 Test window launched!")
    print("Use buttons to test fade vs direct updates")

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
