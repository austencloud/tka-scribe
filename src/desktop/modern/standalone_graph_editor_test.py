"""
Simple Graph Editor Beat Selection Test

Tests the core issue: beat selection → graph editor update → pictograph display
"""

import sys
from pathlib import Path
from PyQt6.QtWidgets import (
    QApplication,
    QMainWindow,
    QVBoxLayout,
    QWidget,
    QLabel,
    QPushButton,
)
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QFont

# Add modern/src to path for imports
modern_src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(modern_src_path))

from domain.models.core_models import (
    BeatData,
    MotionData,
    MotionType,
    Location,
    RotationDirection,
    Orientation,
)
from presentation.components.workbench.graph_editor.components.adjustment_panel import (
    AdjustmentPanel,
)


class SimpleBeatSelectionTest(QMainWindow):
    """Simple test for beat selection and panel mode detection"""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("TKA Beat Selection Test")
        self.setGeometry(100, 100, 800, 600)

        # Create test data
        self._start_position_data = self._create_start_position()
        self._regular_beat_data = self._create_regular_beat()

        # Setup UI
        self._setup_ui()

        print("🧪 Simple Beat Selection Test initialized")
        print("🎯 Testing start position vs regular beat detection")

    def _setup_ui(self):
        """Setup the simple test UI"""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(15)

        # Title
        title = QLabel("Beat Selection Panel Mode Test")
        title.setFont(QFont("Inter", 16, QFont.Weight.Bold))
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(title)

        # Create adjustment panels for testing
        self._blue_panel = AdjustmentPanel(self, side="left")  # left = blue
        self._red_panel = AdjustmentPanel(self, side="right")  # right = red

        layout.addWidget(QLabel("Blue Arrow Panel:"))
        layout.addWidget(self._blue_panel)

        layout.addWidget(QLabel("Red Arrow Panel:"))
        layout.addWidget(self._red_panel)

        # Test buttons
        start_btn = QPushButton("Test Start Position (Should show Orientation)")
        start_btn.clicked.connect(self._test_start_position)
        layout.addWidget(start_btn)

        beat_btn = QPushButton("Test Regular Beat (Should show Turns)")
        beat_btn.clicked.connect(self._test_regular_beat)
        layout.addWidget(beat_btn)

        # Status label
        self._status_label = QLabel("Click buttons to test panel mode detection")
        self._status_label.setFont(QFont("Inter", 12))
        layout.addWidget(self._status_label)

    def _test_start_position(self):
        """Test start position detection"""
        print("\n🧪 Testing Start Position Detection:")

        # Update both panels with start position data
        self._blue_panel.set_beat(self._start_position_data)
        self._red_panel.set_beat(self._start_position_data)

        self._status_label.setText(
            "✅ Start position loaded - panels should show ORIENTATION controls"
        )
        print(f"   Beat number: {self._start_position_data.beat_number}")
        print(f"   Letter: {self._start_position_data.letter}")
        print(f"   Metadata: {self._start_position_data.metadata}")
        print(f"   Motion type: {self._start_position_data.blue_motion.motion_type}")

    def _test_regular_beat(self):
        """Test regular beat detection"""
        print("\n🧪 Testing Regular Beat Detection:")

        # Update both panels with regular beat data
        self._blue_panel.set_beat(self._regular_beat_data)
        self._red_panel.set_beat(self._regular_beat_data)

        self._status_label.setText(
            "✅ Regular beat loaded - panels should show TURNS controls"
        )
        print(f"   Beat number: {self._regular_beat_data.beat_number}")
        print(f"   Letter: {self._regular_beat_data.letter}")
        print(f"   Metadata: {self._regular_beat_data.metadata}")
        print(f"   Motion type: {self._regular_beat_data.blue_motion.motion_type}")

    def _create_start_position(self) -> BeatData:
        """Create start position data for testing"""
        return BeatData(
            beat_number=1,  # Use 1 but mark as start position in metadata
            letter="α",
            duration=1.0,
            blue_motion=MotionData(
                motion_type=MotionType.STATIC,
                prop_rot_dir=RotationDirection.NO_ROTATION,
                start_loc=Location.SOUTH,
                end_loc=Location.SOUTH,
                start_ori=Orientation.IN,
                end_ori=Orientation.IN,
                turns=0.0,
            ),
            red_motion=MotionData(
                motion_type=MotionType.STATIC,
                prop_rot_dir=RotationDirection.NO_ROTATION,
                start_loc=Location.NORTH,
                end_loc=Location.NORTH,
                start_ori=Orientation.IN,
                end_ori=Orientation.IN,
                turns=0.0,
            ),
            metadata={"is_start_position": True, "sequence_start_position": "alpha"},
        )

    def _create_regular_beat(self) -> BeatData:
        """Create regular beat data for testing"""
        return BeatData(
            beat_number=2,
            letter="A",
            duration=1.0,
            blue_motion=MotionData(
                motion_type=MotionType.PRO,
                prop_rot_dir=RotationDirection.CLOCKWISE,
                start_loc=Location.SOUTH,
                end_loc=Location.WEST,
                start_ori=Orientation.IN,
                end_ori=Orientation.IN,
                turns=0.0,
            ),
            red_motion=MotionData(
                motion_type=MotionType.PRO,
                prop_rot_dir=RotationDirection.CLOCKWISE,
                start_loc=Location.NORTH,
                end_loc=Location.EAST,
                start_ori=Orientation.IN,
                end_ori=Orientation.IN,
                turns=0.0,
            ),
            metadata={},  # No special markers - this is a regular beat
        )


def main():
    """Main entry point for standalone test"""
    app = QApplication.instance()
    if not app:
        app = QApplication(sys.argv)

    # Create and show test window
    test_window = SimpleBeatSelectionTest()
    test_window.show()

    return app.exec()


if __name__ == "__main__":
    sys.exit(main())
