# Complete Code Agent Prompt: Option Picker Hierarchical Restructuring

## 🎯 OBJECTIVE
Transform the flat option picker directory structure at `C:\TKA\src\desktop\modern\src\presentation\components\option_picker\` into a hierarchical, clean architecture organization. You will reorganize 16 files, split 3 oversized files (300+ lines), update internal imports, and maintain full backward compatibility.

**CRITICAL ARCHITECTURE UNDERSTANDING:**
Your codebase follows clean architecture with absolute imports across domains:
- `domain.*` - Core business models and logic
- `application.*` - Application services and orchestrators  
- `presentation.*` - UI components and views
- `core.*` - Infrastructure and dependency injection

**NEVER modify these absolute imports.** Only reorganize internal option_picker structure and its relative imports.

## 📍 CURRENT STATE ANALYSIS

### Files to Reorganize (16 total):
```
option_picker/
├── beat_data_loader.py                           ❌ 332 lines (SPLIT)
├── clickable_pictograph_frame.py                ✅ 183 lines (MOVE)
├── dimension_analyzer.py                        ✅ 120 lines (MOVE)
├── display_manager.py                           ✅ 264 lines (MOVE)
├── letter_types.py                              ✅ 66 lines (MOVE)
├── option_picker.py                             ✅ 239 lines (MOVE)
├── option_picker_filter.py                     ✅ 69 lines (MOVE)
├── option_picker_section.py                    ❌ 376 lines (SPLIT)
├── option_picker_section_header.py             ✅ ~150 lines (MOVE)
├── option_picker_section_pictograph_container.py ✅ ~200 lines (MOVE)
├── option_picker_widget.py                     ✅ 62 lines (MOVE)
├── pictograph_pool_manager.py                  ✅ 178 lines (MOVE)
├── responsive_section_button.py                ✅ ~100 lines (MOVE)
├── responsive_sizing_manager.py                ❌ 332 lines (SPLIT)
├── section_button.py                           ✅ 225 lines (MOVE)
├── __init__.py                                  ✅ 17 lines (UPDATE)
└── __pycache__/                                 ❌ REMOVE (20 files)
```

### Current Import Patterns to Preserve:
```python
# ABSOLUTE IMPORTS - NEVER CHANGE THESE
from domain.models.core_models import BeatData, SequenceData
from application.services.option_picker.option_picker_orchestrator import OptionPickerOrchestrator
from presentation.components.pictograph.pictograph_component import PictographComponent
from core.dependency_injection.di_container import DIContainer
from ..component_base import ViewableComponentBase

# RELATIVE IMPORTS - THESE WILL BE UPDATED
from .beat_data_loader import BeatDataLoader
from .display_manager import OptionPickerDisplayManager
from .option_picker_section import OptionPickerSection
from .letter_types import LetterType
```

## 🏗️ TARGET HIERARCHICAL STRUCTURE

```
option_picker/
├── __init__.py                                  # Updated public API
├── core/                                        # Orchestration & main logic
│   ├── __init__.py
│   ├── option_picker.py                        # Main orchestrator
│   └── option_picker_widget.py                 # Widget wrapper
├── components/                                  # Reusable UI components
│   ├── __init__.py
│   ├── frames/
│   │   ├── __init__.py
│   │   └── clickable_pictograph_frame.py
│   ├── filters/
│   │   ├── __init__.py
│   │   └── option_filter.py                    # Renamed from option_picker_filter.py
│   └── sections/
│       ├── __init__.py
│       ├── section_widget.py                   # Split from option_picker_section.py
│       ├── section_layout_manager.py           # Split from option_picker_section.py
│       ├── section_header.py                   # Renamed from option_picker_section_header.py
│       ├── section_container.py                # Renamed from option_picker_section_pictograph_container.py
│       └── buttons/
│           ├── __init__.py
│           ├── section_button.py
│           └── responsive_button.py            # Renamed from responsive_section_button.py
├── services/                                    # Business logic services
│   ├── __init__.py
│   ├── data/
│   │   ├── __init__.py
│   │   ├── beat_loader.py                      # Split from beat_data_loader.py
│   │   ├── position_matcher.py                 # Split from beat_data_loader.py
│   │   └── pool_manager.py                     # Renamed from pictograph_pool_manager.py
│   └── layout/
│       ├── __init__.py
│       ├── display_service.py                  # Renamed from display_manager.py
│       ├── sizing_service.py                   # Split from responsive_sizing_manager.py
│       └── dimension_calculator.py             # Merged dimension_analyzer.py + split from responsive_sizing_manager.py
└── types/
    ├── __init__.py
    └── letter_types.py
```

## 📋 IMPLEMENTATION STEPS

### STEP 1: SAFETY & PREPARATION

**1.1 Create Backup:**
```bash
cd C:\TKA\src\desktop\modern\src\presentation\components\
cp -r option_picker option_picker_backup_$(date +%Y%m%d_%H%M%S)
```

**1.2 Clean Temporary Files:**
```bash
cd option_picker
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true
find . -name "*.pyc.old*" -delete 2>/dev/null || true
```

**1.3 Create New Directory Structure:**
```bash
mkdir -p {core,components/{frames,filters,sections/buttons},services/{data,layout},types}
```

**1.4 Create __init__.py Files:**
```bash
# Create empty __init__.py files
touch core/__init__.py
touch components/__init__.py components/frames/__init__.py components/filters/__init__.py
touch components/sections/__init__.py components/sections/buttons/__init__.py
touch services/__init__.py services/data/__init__.py services/layout/__init__.py
touch types/__init__.py
```

### STEP 2: MOVE SIMPLE FILES (No Modifications)

**2.1 Core Files:**
```bash
mv option_picker.py core/
mv option_picker_widget.py core/
```

**2.2 Component Files:**
```bash
mv clickable_pictograph_frame.py components/frames/
mv option_picker_filter.py components/filters/option_filter.py
mv option_picker_section_header.py components/sections/section_header.py
mv option_picker_section_pictograph_container.py components/sections/section_container.py
mv section_button.py components/sections/buttons/
mv responsive_section_button.py components/sections/buttons/responsive_button.py
```

**2.3 Service Files:**
```bash
mv display_manager.py services/layout/display_service.py
mv pictograph_pool_manager.py services/data/pool_manager.py
```

**2.4 Type Files:**
```bash
mv letter_types.py types/
```

### STEP 3: SPLIT OVERSIZED FILES

#### 3.1 Split `option_picker_section.py` (376 lines)

**Create `components/sections/section_widget.py`:**
```python
"""
Option Picker Section Widget - Main UI Component
Split from option_picker_section.py - contains core section widget logic
"""

from typing import List
from PyQt6.QtWidgets import QWidget, QVBoxLayout
from PyQt6.QtCore import Qt
from ...types.letter_types import LetterType
from .section_header import OptionPickerSectionHeader
from .section_container import OptionPickerSectionPictographContainer


class OptionPickerSection(QWidget):
    """
    Main option picker section widget.
    Contains UI setup and basic event handling.
    """

    def __init__(self, letter_type: str, parent=None, mw_size_provider=None):
        super().__init__(parent)
        self.letter_type = letter_type
        self.mw_size_provider = mw_size_provider
        self.is_groupable = letter_type in [
            LetterType.TYPE4,
            LetterType.TYPE5,
            LetterType.TYPE6,
        ]
        
        # Initialize layout manager
        from .section_layout_manager import SectionLayoutManager
        self.layout_manager = SectionLayoutManager(self)
        
        self._setup_ui()
        self._register_for_sizing_updates()

    def _setup_ui(self):
        """Setup UI using clean separation of concerns."""
        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignmentFlag.AlignVCenter)
        layout.setSpacing(0)
        layout.setContentsMargins(0, 0, 0, 0)

        # Create header component
        self.header = OptionPickerSectionHeader(self)
        layout.addWidget(self.header)

        # Create pictograph container component
        self.section_pictograph_container = OptionPickerSectionPictographContainer(self)
        layout.addWidget(self.section_pictograph_container)

        # Set transparent background
        self.setStyleSheet("background-color: transparent; border: none;")
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)

        # Compatibility aliases
        self.pictograph_layout = self.section_pictograph_container.layout
        self.pictographs = self.section_pictograph_container.pictographs
        self.header_button = self.header.type_button

    def add_pictograph_from_pool(self, pictograph_frame):
        """Add pictograph from pool using layout manager."""
        self.layout_manager.add_pictograph_from_pool(pictograph_frame)

    def clear_pictographs(self):
        """Clear pictographs using container component."""
        self.section_pictograph_container.clear_pictographs()

    def clear_pictographs_pool_style(self):
        """Clear pictographs using pool style."""
        self.section_pictograph_container.clear_pictographs_pool_style()

    def toggle_section(self):
        """Toggle section visibility."""
        is_visible = not self.section_pictograph_container.isVisible()
        self.section_pictograph_container.setVisible(is_visible)

    def _register_for_sizing_updates(self):
        """Register for sizing updates from option picker."""
        self.layout_manager.register_for_sizing_updates()

    def resizeEvent(self, event):
        """Handle resize events."""
        self.layout_manager.handle_resize_event(event)
        super().resizeEvent(event)

    # Properties for compatibility
    @property
    def pictographs(self):
        return self.section_pictograph_container.pictographs

    @pictographs.setter
    def pictographs(self, value):
        self.section_pictograph_container.pictographs = value
```

**Create `components/sections/section_layout_manager.py`:**
```python
"""
Section Layout Manager - Layout and Sizing Logic
Split from option_picker_section.py - contains layout calculations and resize handling
"""

class SectionLayoutManager:
    """Handles layout calculations and sizing for option picker sections."""
    
    def __init__(self, section_widget):
        self.section = section_widget
        self._last_width = None
        self._resize_in_progress = False
        self._debug_logged = False
        self._option_picker_width = 0

    def add_pictograph_from_pool(self, pictograph_frame):
        """Add pictograph with proper container sizing."""
        self._ensure_container_ready()
        self.section.section_pictograph_container.sync_width_with_section()
        self.section.section_pictograph_container.add_pictograph(pictograph_frame)
        self._update_size()

    def _get_global_pictograph_size(self) -> int:
        """Calculate consistent pictograph size using layout algorithm."""
        if self.section.mw_size_provider:
            main_window_width = self.section.mw_size_provider().width()
            frame_width = (
                self.section.section_pictograph_container.width()
                if self.section.section_pictograph_container.width() > 0
                else self.section.width()
            )

            if frame_width <= 0:
                frame_width = self.section.width() if self.section.width() > 0 else main_window_width

            size = max(main_window_width // 16, frame_width // 8)
            border_width = max(1, int(size * 0.015))
            spacing = self.section.section_pictograph_container.main_layout.spacing()
            final_size = size - (2 * border_width) - spacing
            final_size = max(60, min(final_size, 200))
            return final_size
        else:
            return 100

    def _update_size(self):
        """Update section size using layout calculation."""
        try:
            self.section.section_pictograph_container.sync_width_with_section()
            pictograph_size = self._get_global_pictograph_size()
            self.section.section_pictograph_container.resize_pictographs(pictograph_size)

            header_height = self.section.header.get_calculated_height()
            pictograph_height = (
                self.section.section_pictograph_container.calculate_required_height(pictograph_size)
            )
            total_height = header_height + pictograph_height
            self.section.setMinimumHeight(total_height)

            if hasattr(self.section.header, "type_button"):
                self.section.header.type_button._resizing = True
                try:
                    calculated_height = self.section.header.get_calculated_height()
                    self.section.header.setFixedHeight(calculated_height)

                    if hasattr(self.section, "mw_size_provider") and self.section.mw_size_provider:
                        parent_height = self.section.mw_size_provider().height()
                        font_size = max(parent_height // 70, 10)
                        label_height = max(int(font_size * 3), 20)
                        label_width = max(int(label_height * 6), 100)

                        from PyQt6.QtCore import QSize
                        self.section.header.type_button.setFixedSize(QSize(label_width, label_height))
                finally:
                    self.section.header.type_button._resizing = False

            self.section.updateGeometry()

        except Exception as e:
            print(f"⚠️ [ERROR] Size update failed for {self.section.letter_type}: {e}")

    def handle_resize_event(self, event):
        """Handle resize events."""
        if self._resize_in_progress:
            return

        self._resize_in_progress = True
        try:
            if self.section.mw_size_provider:
                full_width = self.section.mw_size_provider().width()

                if self.section.letter_type in [
                    LetterType.TYPE4,
                    LetterType.TYPE5,
                    LetterType.TYPE6,
                ]:
                    section_width = full_width // 3
                else:
                    section_width = full_width

                if (
                    self._last_width is None
                    or abs(self._last_width - section_width) > 5
                ):
                    self._last_width = section_width
                    self.section.setFixedWidth(section_width)
                    self.section.section_pictograph_container.sync_width_with_section()

        except Exception as e:
            print(f"⚠️ [ERROR] Resize failed for {self.section.letter_type}: {e}")
        finally:
            self._resize_in_progress = False

    def register_for_sizing_updates(self):
        """Register this section to receive sizing updates."""
        widget = self.section.parent()
        while widget:
            if (
                hasattr(widget, "__class__")
                and "ModernOptionPickerWidget" in widget.__class__.__name__
            ):
                widget.add_sizing_callback(self._on_option_picker_resize)
                print(f"🔗 Section {self.section.letter_type} registered for sizing updates")
                break
            widget = widget.parent()

    def _on_option_picker_resize(self, option_picker_width: int):
        """Handle option picker width changes."""
        self._option_picker_width = option_picker_width
        if hasattr(self.section, "section_pictograph_container"):
            self.section.section_pictograph_container.update_sizing_reference(option_picker_width)

    def _ensure_container_ready(self):
        """Ensure the option picker container is properly sized."""
        if self.section.parent():
            widget = self.section.parent()
            while widget:
                if (
                    hasattr(widget, "__class__")
                    and "ModernOptionPickerWidget" in widget.__class__.__name__
                ):
                    widget.updateGeometry()
                    widget.update()
                    from PyQt6.QtWidgets import QApplication
                    QApplication.processEvents()
                    break
                elif (
                    hasattr(widget, "layout")
                    and widget.layout()
                    and widget.layout().__class__.__name__ == "QVBoxLayout"
                    and widget.width() > 500
                ):
                    widget.updateGeometry()
                    widget.update()
                    from PyQt6.QtWidgets import QApplication
                    QApplication.processEvents()
                    break
                widget = widget.parent()
```

#### 3.2 Split `responsive_sizing_manager.py` (332 lines)

**Create `services/layout/sizing_service.py`:**
```python
"""
Responsive Sizing Service - Dynamic Sizing Management
Split from responsive_sizing_manager.py - contains core sizing coordination
"""

from typing import Dict, List, Callable, Optional, Tuple
from PyQt6.QtWidgets import QWidget, QApplication
from PyQt6.QtCore import QSize, QTimer, pyqtSignal, QObject


class ResponsiveSizingService(QObject):
    """
    Dynamic sizing service that ensures option picker never requires scrolling.
    Coordinates sizing across all components.
    """

    sizing_changed = pyqtSignal()

    def __init__(
        self,
        option_picker_widget: QWidget,
        sections_container: QWidget,
        filter_widget: Optional[QWidget] = None,
    ):
        super().__init__()
        self.option_picker_widget = option_picker_widget
        self.sections_container = sections_container
        self.filter_widget = filter_widget
        
        # Initialize dimension calculator
        from .dimension_calculator import DimensionCalculator
        self.dimension_calculator = DimensionCalculator()

        # Sizing parameters
        self.sections: Dict[str, QWidget] = {}
        self.section_headers: Dict[str, QWidget] = {}
        self._current_sizing: Optional[Dict] = None

        # Resize timer for performance
        self.resize_timer = QTimer()
        self.resize_timer.timeout.connect(self._recalculate_sizing)
        self.resize_timer.setSingleShot(True)

    def register_section(self, section_type: str, section_widget: QWidget, header_widget: QWidget):
        """Register a section for dynamic sizing management."""
        self.sections[section_type] = section_widget
        self.section_headers[section_type] = header_widget
        original_resize = section_widget.resizeEvent
        section_widget.resizeEvent = self._create_resize_handler(original_resize)

    def calculate_dynamic_sizing(self) -> Dict:
        """Calculate comprehensive sizing for all elements."""
        optimal_size = self.dimension_calculator.calculate_optimal_size(
            self.option_picker_widget
        )
        container_width = optimal_size.width()
        container_height = optimal_size.height()

        section_count = len(self.sections) if self.sections else 6
        filter_height = 40 if self.filter_widget else 0

        sizing_config = self.dimension_calculator.calculate_component_sizing(
            container_width, container_height, section_count, filter_height
        )

        self._current_sizing = sizing_config
        return sizing_config

    def apply_sizing_to_sections(self):
        """Apply calculated sizing to all registered sections."""
        if not self._current_sizing:
            self.calculate_dynamic_sizing()

        sizing = self._current_sizing
        if not sizing:
            return

        for section_type, section_widget in self.sections.items():
            self._apply_section_sizing(section_widget, section_type, sizing)

        for section_type, header_widget in self.section_headers.items():
            self._apply_header_sizing(header_widget, sizing)

        self.sizing_changed.emit()

    def _apply_section_sizing(self, section_widget: QWidget, section_type: str, sizing: Dict):
        """Apply sizing to individual section."""
        if section_type in ["Type1", "Type2", "Type3"]:
            width = sizing["individual_section_width"]
        else:
            width = sizing["shared_section_width"]

        section_widget.setFixedWidth(width)
        max_section_height = (
            sizing["header_height"]
            + sizing["pictograph_space_per_section"]
            + sizing["section_margins"] * 2
        )
        section_widget.setMaximumHeight(max_section_height)

    def _apply_header_sizing(self, header_widget: QWidget, sizing: Dict):
        """Apply dynamic sizing to section header."""
        if hasattr(header_widget, "setFixedHeight"):
            header_widget.setFixedHeight(sizing["header_height"])

        if hasattr(header_widget, "set_dynamic_sizing"):
            header_widget.set_dynamic_sizing(sizing)

    def get_dynamic_size_provider(self) -> Callable[[], QSize]:
        """Returns a size provider for optimal dimensions."""
        def size_provider():
            if self._current_sizing:
                return QSize(
                    self._current_sizing["container_width"],
                    self._current_sizing["container_height"],
                )
            return self.dimension_calculator.calculate_optimal_size(self.option_picker_widget)
        return size_provider

    def schedule_resize_recalculation(self):
        """Schedule a resize recalculation (debounced for performance)."""
        self.resize_timer.start(100)

    def _recalculate_sizing(self):
        """Recalculate and apply sizing after resize."""
        self.calculate_dynamic_sizing()
        self.apply_sizing_to_sections()

    def _create_resize_handler(self, original_resize_event):
        """Create a resize event handler that triggers recalculation."""
        def new_resize_event(event):
            original_resize_event(event)
            self.schedule_resize_recalculation()
        return new_resize_event

    def get_sizing_info(self) -> Dict:
        """Get current sizing information for debugging."""
        if not self._current_sizing:
            self.calculate_dynamic_sizing()
        return self._current_sizing.copy() if self._current_sizing else {}
```

**Create `services/layout/dimension_calculator.py`:**
```python
"""
Dimension Calculator - Pure Calculation Functions
Merged from responsive_sizing_manager.py and dimension_analyzer.py
"""

from typing import Tuple, Dict
from PyQt6.QtWidgets import QWidget, QApplication
from PyQt6.QtCore import QSize


class DimensionCalculator:
    """Handles all dimension calculations for option picker layout."""

    def __init__(self):
        # Sizing constraints
        self.min_header_height = 20
        self.max_header_height = 60
        self.min_pictograph_size = 40
        self.max_pictograph_size = 120
        self.section_margins = 5
        self.header_margins = 10
        
        # Grid parameters
        self.default_pictograph_size = 160
        self.min_pictograph_size = 60
        self.max_pictograph_size = 200
        self.grid_spacing = 8
        self.container_margins = 10

    def calculate_optimal_size(self, option_picker_widget: QWidget) -> QSize:
        """Calculate optimal size based on available screen space."""
        screen = QApplication.primaryScreen()
        if not screen:
            return QSize(800, 600)

        screen_geometry = screen.availableGeometry()
        screen_width = screen_geometry.width()
        screen_height = screen_geometry.height()

        if option_picker_widget and option_picker_widget.parent():
            parent = option_picker_widget.parent()
            container_width = min(
                parent.width() if parent.width() > 0 else screen_width // 2,
                screen_width // 2,
            )
            container_height = min(
                parent.height() if parent.height() > 0 else screen_height - 100,
                screen_height - 100,
            )
        else:
            container_width = screen_width // 2
            container_height = screen_height - 100

        return QSize(container_width, container_height)

    def calculate_component_sizing(
        self, container_width: int, container_height: int, 
        section_count: int, filter_height: int
    ) -> Dict:
        """Calculate sizing for all components."""
        total_margins = self.section_margins * 2 * section_count
        header_space_needed = self.header_margins * section_count
        available_height = container_height - filter_height - total_margins - header_space_needed

        header_height = self._calculate_optimal_header_height(available_height, section_count)
        total_header_height = header_height * section_count
        pictograph_space = available_height - total_header_height
        pictograph_height_per_section = pictograph_space // section_count
        pictograph_size = self._calculate_optimal_pictograph_size(
            container_width, pictograph_height_per_section
        )

        full_width_sections = min(3, section_count)
        shared_width_sections = max(0, section_count - 3)
        individual_section_width = container_width
        shared_section_width = container_width // 3 if shared_width_sections > 0 else container_width

        return {
            "container_width": container_width,
            "container_height": container_height,
            "header_height": header_height,
            "pictograph_size": pictograph_size,
            "pictograph_space_per_section": pictograph_height_per_section,
            "individual_section_width": individual_section_width,
            "shared_section_width": shared_section_width,
            "section_margins": self.section_margins,
            "filter_height": filter_height,
            "max_rows_per_section": self._calculate_max_rows(
                pictograph_height_per_section, pictograph_size
            ),
            "columns_per_section": 8,
        }

    def _calculate_optimal_header_height(self, available_height: int, section_count: int) -> int:
        """Calculate header height that fits proportionally."""
        ideal_header_space = available_height * 0.15
        header_height = int(ideal_header_space / section_count)
        return max(self.min_header_height, min(self.max_header_height, header_height))

    def _calculate_optimal_pictograph_size(self, container_width: int, height_per_section: int) -> int:
        """Calculate pictograph size that maximizes space usage."""
        columns = 8
        available_width = container_width - (self.section_margins * 2)
        width_based_size = available_width // columns
        max_rows = 3
        height_based_size = height_per_section // max_rows
        optimal_size = min(width_based_size, height_based_size)
        return max(self.min_pictograph_size, min(self.max_pictograph_size, optimal_size))

    def _calculate_max_rows(self, height_per_section: int, pictograph_size: int) -> int:
        """Calculate maximum rows that can fit."""
        if pictograph_size <= 0:
            return 1
        return max(1, height_per_section // pictograph_size)

    def calculate_optimal_pictograph_size_for_width(
        self, available_width: int, column_count: int = 8
    ) -> int:
        """Calculate optimal pictograph size based on available width."""
        total_spacing = self.grid_spacing * (column_count - 1)
        available_for_pictographs = (
            available_width - (2 * self.container_margins) - total_spacing
        )
        optimal_size = available_for_pictographs // column_count
        return max(self.min_pictograph_size, min(self.max_pictograph_size, optimal_size))

    def calculate_container_dimensions(
        self, pictograph_count: int, pictograph_size: int, column_count: int = 8
    ) -> Tuple[int, int]:
        """Calculate container dimensions for given pictograph count and size."""
        rows_needed = (pictograph_count - 1) // column_count + 1

        width = (
            (column_count * pictograph_size)
            + (self.grid_spacing * (column_count - 1))
            + (2 * self.container_margins)
        )
        height = (
            (rows_needed * pictograph_size)
            + (self.grid_spacing * (rows_needed - 1))
            + (2 * self.container_margins)
        )

        return width, height

    def analyze_layout_efficiency(self, available_width: int, pictograph_count: int) -> dict:
        """Analyze layout efficiency for different configurations."""
        results = {}
        for columns in [6, 7, 8, 9, 10]:
            pictograph_size = self.calculate_optimal_pictograph_size_for_width(available_width, columns)
            container_width, container_height = self.calculate_container_dimensions(
                pictograph_count, pictograph_size, columns
            )
            used_width = container_width
            width_efficiency = used_width / available_width if available_width > 0 else 0

            results[columns] = {
                "pictograph_size": pictograph_size,
                "container_width": container_width,
                "container_height": container_height,
                "width_efficiency": width_efficiency,
                "rows_needed": (pictograph_count - 1) // columns + 1,
            }
        return results
```

#### 3.3 Split `beat_data_loader.py` (332 lines)

**Create `services/data/beat_loader.py`:**
```python
"""
Beat Data Loader - Main Loading Orchestration
Split from beat_data_loader.py - contains high-level loading logic
"""

from typing import TYPE_CHECKING, Any, Callable, Dict, List, Optional
from PyQt6.QtCore import QObject

from domain.models.core_models import BeatData
from application.services.data.data_conversion_service import DataConversionService
from application.services.option_picker.option_orientation_update_service import (
    OptionOrientationUpdateService,
)
from .position_matcher import PositionMatcher

if TYPE_CHECKING:
    from domain.models.core_models import SequenceData


class BeatDataLoader(QObject):
    """Handles loading beat options and orchestrates position matching logic."""

    def __init__(self):
        super().__init__()
        self._beat_options: List[BeatData] = []
        self.position_matcher = PositionMatcher()
        
        try:
            from application.services.positioning.arrows.utilities.position_matching_service import (
                PositionMatchingService,
            )
            self.position_service = PositionMatchingService()
            self.conversion_service = DataConversionService()
            self.orientation_update_service = OptionOrientationUpdateService()
        except Exception:
            self.position_service = None
            self.conversion_service = None
            self.orientation_update_service = None

    def load_motion_combinations(self, sequence_data: List[Dict[str, Any]]) -> List[BeatData]:
        """Load motion combinations using data-driven position matching."""
        try:
            if not self.position_service or not self.conversion_service:
                return self._load_sample_beat_options()

            if not sequence_data or len(sequence_data) < 2:
                return self._load_sample_beat_options()

            last_beat = sequence_data[-1]
            last_end_pos = self.position_matcher.extract_end_position(
                last_beat, self.position_service
            )
            
            if not last_end_pos:
                return self._load_sample_beat_options()

            next_options = self.position_service.get_next_options(last_end_pos)
            if not next_options:
                return self._load_sample_beat_options()

            beat_options = self._batch_convert_options(next_options)

            if self.orientation_update_service and len(sequence_data) >= 2:
                beat_options = self._apply_orientation_updates(sequence_data, beat_options)

            self._beat_options = beat_options
            return beat_options

        except Exception:
            return self._load_sample_beat_options()

    def refresh_options_from_sequence(self, sequence_data: List[Dict[str, Any]]) -> List[BeatData]:
        """Refresh options based on provided sequence data (Legacy-compatible)."""
        if not sequence_data or len(sequence_data) <= 1:
            return self._load_sample_beat_options()

        last_beat = sequence_data[-1]

        try:
            if not self.position_service or not self.conversion_service:
                return self._load_sample_beat_options()

            end_position = self.position_matcher.extract_end_position(
                last_beat, self.position_service
            )

            if not end_position:
                return self._load_sample_beat_options()

            next_options = self.position_service.get_next_options(end_position)
            if not next_options:
                return self._load_sample_beat_options()

            beat_options = self._batch_convert_options(next_options)
            return beat_options

        except Exception:
            return self._load_sample_beat_options()

    def refresh_options_from_modern_sequence(self, sequence: "SequenceData") -> List[BeatData]:
        """PURE Modern: Refresh options based on Modern SequenceData."""
        try:
            if not sequence or sequence.length == 0:
                return self._load_sample_beat_options()

            last_beat = sequence.beats[-1] if sequence.beats else None
            if not last_beat or last_beat.is_blank:
                return self._load_sample_beat_options()

            end_position = self.position_matcher.extract_modern_end_position(last_beat)
            if not end_position:
                return self._load_sample_beat_options()

            if not self.position_service:
                return self._load_sample_beat_options()

            next_options = self.position_service.get_next_options(end_position)
            if not next_options:
                return self._load_sample_beat_options()

            if self.orientation_update_service:
                next_options = self.orientation_update_service.update_option_orientations(
                    sequence, next_options
                )

            return next_options

        except Exception:
            return self._load_sample_beat_options()

    def _batch_convert_options(self, options_list: List[Any]) -> List[BeatData]:
        """Optimized batch conversion of options to BeatData format."""
        from domain.models.core_models import BeatData

        beat_options = []
        beat_data_objects = []
        dict_objects = []
        other_objects = []

        for option_data in options_list:
            if isinstance(option_data, BeatData):
                beat_data_objects.append(option_data)
            elif hasattr(option_data, "get"):
                dict_objects.append(option_data)
            elif hasattr(option_data, "letter"):
                other_objects.append(option_data)

        beat_options.extend(beat_data_objects)

        if dict_objects:
            try:
                for option_data in dict_objects:
                    beat_data = self.conversion_service.convert_external_pictograph_to_beat_data(
                        option_data
                    )
                    beat_options.append(beat_data)
            except Exception:
                pass

        beat_options.extend(other_objects)
        return beat_options

    def _apply_orientation_updates(
        self, sequence_data: List[Dict[str, Any]], beat_options: List[BeatData]
    ) -> List[BeatData]:
        """Apply orientation updates to beat options."""
        try:
            start_position_dict = sequence_data[-1]
            if isinstance(start_position_dict, dict) and "letter" in start_position_dict:
                start_beat = self.conversion_service.convert_external_pictograph_to_beat_data(
                    start_position_dict
                )
                from domain.models.core_models import SequenceData
                temp_sequence = SequenceData.empty().update(beats=[start_beat])
                beat_options = self.orientation_update_service.update_option_orientations(
                    temp_sequence, beat_options
                )
        except Exception:
            pass
        return beat_options

    def _load_sample_beat_options(self) -> List[BeatData]:
        """Load sample beat options as fallback."""
        self._beat_options = []
        return self._beat_options

    def get_beat_options(self) -> List[BeatData]:
        """Get current beat options."""
        return self._beat_options

    def refresh_options(self) -> List[BeatData]:
        """Refresh beat options."""
        self._beat_options = []
        return self._beat_options
```

**Create `services/data/position_matcher.py`:**
```python
"""
Position Matcher - Position Matching Logic
Split from beat_data_loader.py - contains position matching and calculation logic
"""

from typing import TYPE_CHECKING, Any, Dict, Optional

if TYPE_CHECKING:
    from application.services.positioning.arrows.utilities.position_matching_service import (
        PositionMatchingService,
    )
    from domain.models.core_models import BeatData


class PositionMatcher:
    """Handles position matching logic and calculations."""

    POSITIONS_MAP = {
        ("s", "n"): "alpha1",
        ("sw", "ne"): "alpha2",
        ("w", "e"): "alpha3",
        ("nw", "se"): "alpha4",
        ("n", "s"): "alpha5",
        ("ne", "sw"): "alpha6",
        ("e", "w"): "alpha7",
        ("se", "nw"): "alpha8",
        ("n", "n"): "beta1",
        ("ne", "ne"): "beta2",
        ("e", "e"): "beta3",
        ("se", "se"): "beta4",
        ("s", "s"): "beta5",
        ("sw", "sw"): "beta6",
        ("w", "w"): "beta7",
        ("nw", "nw"): "beta8",
        ("w", "n"): "gamma1",
        ("nw", "ne"): "gamma2",
        ("n", "e"): "gamma3",
        ("ne", "se"): "gamma4",
        ("e", "s"): "gamma5",
        ("se", "sw"): "gamma6",
        ("s", "w"): "gamma7",
        ("sw", "nw"): "gamma8",
        ("e", "n"): "gamma9",
        ("se", "ne"): "gamma10",
        ("s", "e"): "gamma11",
        ("sw", "se"): "gamma12",
        ("w", "s"): "gamma13",
        ("nw", "sw"): "gamma14",
        ("n", "w"): "gamma15",
        ("ne", "nw"): "gamma16",
    }

    def __init__(self):
        self._location_to_position_map = self.POSITIONS_MAP.copy()

    def extract_end_position(
        self, last_beat: Dict[str, Any], position_service: "PositionMatchingService"
    ) -> Optional[str]:
        """Extract end position from last beat data using Legacy-compatible logic."""
        if "end_pos" in last_beat:
            return last_beat.get("end_pos")

        if "metadata" in last_beat and "end_pos" in last_beat["metadata"]:
            return last_beat["metadata"].get("end_pos")

        if self._has_motion_attributes(last_beat):
            end_pos = self._calculate_end_position_from_motions(last_beat)
            if end_pos:
                return end_pos

        try:
            available_positions = position_service.get_available_start_positions()
            if available_positions:
                return available_positions[0]
            else:
                alpha1_options = position_service.get_alpha1_options()
                return "alpha1" if alpha1_options else None
        except Exception:
            return None

    def extract_modern_end_position(self, beat_data: "BeatData") -> Optional[str]:
        """Extract end position directly from Modern BeatData."""
        if beat_data.metadata and "end_pos" in beat_data.metadata:
            return beat_data.metadata["end_pos"]

        if beat_data.blue_motion and beat_data.red_motion:
            blue_end = (
                beat_data.blue_motion.end_loc.value
                if beat_data.blue_motion.end_loc
                else "s"
            )
            red_end = (
                beat_data.red_motion.end_loc.value
                if beat_data.red_motion.end_loc
                else "s"
            )
            position_key = (blue_end, red_end)
            end_pos = self._location_to_position_map.get(position_key, "beta5")
            return end_pos

        return "beta5"

    def _has_motion_attributes(self, beat_data: Dict[str, Any]) -> bool:
        """Check if beat data has motion attributes for end position calculation."""
        return (
            "blue_attributes" in beat_data
            and "red_attributes" in beat_data
            and "end_loc" in beat_data["blue_attributes"]
            and "end_loc" in beat_data["red_attributes"]
        )

    def _calculate_end_position_from_motions(self, beat_data: Dict[str, Any]) -> Optional[str]:
        """Calculate end position from motion data using positions mapping."""
        try:
            blue_attrs = beat_data.get("blue_attributes", {})
            red_attrs = beat_data.get("red_attributes", {})

            blue_end_loc = blue_attrs.get("end_loc")
            red_end_loc = red_attrs.get("end_loc")

            if blue_end_loc and red_end_loc:
                position_key = (blue_end_loc, red_end_loc)
                end_position = self._location_to_position_map.get(position_key)
                return end_position if end_position else None
        except Exception:
            pass

        return None
```

### STEP 4: UPDATE INTERNAL IMPORTS

**4.1 In moved files, update ONLY relative imports within option_picker:**

```bash
# Update imports in all moved files
find . -name "*.py" -exec sed -i.bak 's/from \.beat_data_loader import/from ..services.data.beat_loader import/g' {} \;
find . -name "*.py" -exec sed -i.bak 's/from \.display_manager import/from ..services.layout.display_service import/g' {} \;
find . -name "*.py" -exec sed -i.bak 's/from \.pictograph_pool_manager import/from ..services.data.pool_manager import/g' {} \;
find . -name "*.py" -exec sed -i.bak 's/from \.responsive_sizing_manager import/from ..services.layout.sizing_service import/g' {} \;
find . -name "*.py" -exec sed -i.bak 's/from \.dimension_analyzer import/from ..services.layout.dimension_calculator import/g' {} \;
find . -name "*.py" -exec sed -i.bak 's/from \.option_picker_section import/from ..components.sections.section_widget import/g' {} \;
find . -name "*.py" -exec sed -i.bak 's/from \.clickable_pictograph_frame import/from ..components.frames.clickable_pictograph_frame import/g' {} \;
find . -name "*.py" -exec sed -i.bak 's/from \.option_picker_filter import/from ..components.filters.option_filter import/g' {} \;
find . -name "*.py" -exec sed -i.bak 's/from \.section_button import/from ..components.sections.buttons.section_button import/g' {} \;
find . -name "*.py" -exec sed -i.bak 's/from \.letter_types import/from ..types.letter_types import/g' {} \;

# Handle special case: full path import in display_service.py
sed -i.bak 's/from presentation\.components\.option_picker\.clickable_pictograph_frame import/from ..components.frames.clickable_pictograph_frame import/g' services/layout/display_service.py

# Clean up backup files
find . -name "*.py.bak" -delete
```

**4.2 Add imports in split files:**

In `components/sections/section_widget.py`:
```python
# Add at top after existing imports
from ...types.letter_types import LetterType
from .section_header import OptionPickerSectionHeader
from .section_container import OptionPickerSectionPictographContainer
```

In `services/layout/sizing_service.py`:
```python
# Add at top after existing imports
from .dimension_calculator import DimensionCalculator
```

In `services/data/beat_loader.py`:
```python
# Add at top after existing imports
from .position_matcher import PositionMatcher
```

### STEP 5: UPDATE MAIN __init__.py

Replace the root `__init__.py`:

```python
"""
Modern Option Picker Package - Hierarchical Structure

This package contains the Modern option picker implementation with
improved hierarchical organization for better maintainability.

Architecture follows clean separation:
- core/ - Main orchestration and widget coordination
- components/ - Reusable UI widgets organized by purpose
- services/ - Business logic separated by domain (data/layout)
- types/ - Type definitions and constants

All domain/application/presentation absolute imports are preserved.
"""

# Core components (primary public API)
from .core.option_picker import OptionPicker
from .core.option_picker_widget import ModernOptionPickerWidget

# Services (for advanced usage)
from .services.data.beat_loader import BeatDataLoader
from .services.layout.display_service import OptionPickerDisplayManager
from .services.data.pool_manager import PictographPoolManager

# Types
from .types.letter_types import LetterType

# Backward compatibility exports (maintain old interface)
__all__ = [
    "OptionPicker",
    "ModernOptionPickerWidget", 
    "BeatDataLoader",
    "OptionPickerDisplayManager", 
    "PictographPoolManager",
    "LetterType",
]

__version__ = "2.0.0"
__restructured__ = True
```

### STEP 6: CREATE BACKWARD COMPATIBILITY

Create compatibility imports for external code:

**Create `beat_data_loader.py` (compatibility file):**
```python
"""
DEPRECATED: Backward compatibility import
Use option_picker.services.data.beat_loader instead
"""
import warnings
warnings.warn(
    "Importing from option_picker.beat_data_loader is deprecated. "
    "Use option_picker.services.data.beat_loader instead.",
    DeprecationWarning, stacklevel=2
)
from .services.data.beat_loader import BeatDataLoader
__all__ = ['BeatDataLoader']
```

**Create compatibility files for all moved components:**
```bash
# Create compatibility imports for main moved files
cat > display_manager.py << 'EOF'
"""DEPRECATED: Use option_picker.services.layout.display_service instead"""
import warnings
warnings.warn("Use option_picker.services.layout.display_service instead", DeprecationWarning, stacklevel=2)
from .services.layout.display_service import OptionPickerDisplayManager
__all__ = ['OptionPickerDisplayManager']
EOF

cat > pictograph_pool_manager.py << 'EOF'
"""DEPRECATED: Use option_picker.services.data.pool_manager instead"""
import warnings
warnings.warn("Use option_picker.services.data.pool_manager instead", DeprecationWarning, stacklevel=2)
from .services.data.pool_manager import PictographPoolManager
__all__ = ['PictographPoolManager']
EOF

cat > option_picker_section.py << 'EOF'
"""DEPRECATED: Use option_picker.components.sections.section_widget instead"""
import warnings
warnings.warn("Use option_picker.components.sections.section_widget instead", DeprecationWarning, stacklevel=2)
from .components.sections.section_widget import OptionPickerSection
__all__ = ['OptionPickerSection']
EOF
```

### STEP 7: VALIDATION

**7.1 Test Core Functionality:**
```python
# Test that main classes import correctly
python -c "
from option_picker import OptionPicker, BeatDataLoader, OptionPickerDisplayManager
print('✅ Main imports successful')
"

# Test new hierarchical imports
python -c "
from option_picker.services.data.beat_loader import BeatDataLoader
from option_picker.components.sections.section_widget import OptionPickerSection
print('✅ Hierarchical imports successful')
"

# Test domain imports unchanged
python -c "
import sys; sys.path.append('C:/TKA/src/desktop/modern/src')
from domain.models.core_models import BeatData
print('✅ Domain imports unchanged')
"

# Test backward compatibility
python -c "
from option_picker.beat_data_loader import BeatDataLoader
print('✅ Backward compatibility maintained')
"
```

**7.2 Test File Splits Work:**
```python
# Test section widget split
python -c "
from option_picker.components.sections.section_widget import OptionPickerSection
from option_picker.components.sections.section_layout_manager import SectionLayoutManager
print('✅ Section split successful')
"

# Test sizing service split
python -c "
from option_picker.services.layout.sizing_service import ResponsiveSizingService
from option_picker.services.layout.dimension_calculator import DimensionCalculator
print('✅ Sizing service split successful')
"

# Test beat loader split
python -c "
from option_picker.services.data.beat_loader import BeatDataLoader
from option_picker.services.data.position_matcher import PositionMatcher
print('✅ Beat loader split successful')
"
```

**7.3 Test Structure Integrity:**
```bash
# Verify all expected files exist
echo "Checking core files..."
test -f core/option_picker.py && echo "✅ core/option_picker.py"
test -f core/option_picker_widget.py && echo "✅ core/option_picker_widget.py"

echo "Checking component files..."
test -f components/frames/clickable_pictograph_frame.py && echo "✅ components/frames/clickable_pictograph_frame.py"
test -f components/sections/section_widget.py && echo "✅ components/sections/section_widget.py"

echo "Checking service files..."
test -f services/data/beat_loader.py && echo "✅ services/data/beat_loader.py"
test -f services/layout/display_service.py && echo "✅ services/layout/display_service.py"

echo "Checking types..."
test -f types/letter_types.py && echo "✅ types/letter_types.py"

# Verify no oversized files
echo "Checking file sizes..."
find . -name "*.py" -exec wc -l {} \; | awk '$1 > 250 {print "⚠️ " $2 " has " $1 " lines (exceeds 250)"}' 
```

## ✅ SUCCESS CRITERIA

1. **✅ Structure Complete**: All 16 files correctly placed in hierarchical structure
2. **✅ File Sizes**: No file exceeds 250 lines (3 large files successfully split into 6 focused files)
3. **✅ Imports Preserved**: All domain/application/presentation absolute imports unchanged
4. **✅ Internal Imports**: All option_picker relative imports updated to new structure
5. **✅ Compatibility**: Legacy imports work with deprecation warnings
6. **✅ Functionality**: All existing functionality preserved
7. **✅ Clean**: No temporary files remaining
8. **✅ Documentation**: All directories have proper `__init__.py` files

## ⚠️ CRITICAL REQUIREMENTS

1. **NEVER modify domain/application/core/presentation absolute imports**
2. **ONLY update relative imports within option_picker (starting with `.`)**
3. **PRESERVE all existing class and function names exactly**
4. **MAINTAIN all original functionality during transition**
5. **TEST imports after each major step**
6. **CREATE backup before starting**

## 🔄 ROLLBACK PROCEDURE

If anything fails during implementation:
```bash
cd C:\TKA\src\desktop\modern\src\presentation\components\
rm -rf option_picker
mv option_picker_backup_* option_picker
```

Execute this restructuring systematically, validating each step before proceeding. The goal is a cleaner, more maintainable codebase while preserving all existing functionality and respecting your clean architecture import patterns.

