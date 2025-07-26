"""
Page Object Model implementation for TKA E2E testing.

This package contains page objects that encapsulate UI interactions
for different components of the TKA application, following the
Page Object Model pattern for maintainable test automation.

Available Page Objects:
- BasePage: Abstract base class for all page objects
- ConstructTabPage: Main construct tab interface
- StartPositionPickerPage: Start position selection component
- OptionPickerPage: Option selection component
- SequenceWorkbenchPage: Sequence building workbench
"""

from .base_page import BasePage
from .construct_tab import ConstructTabPage
from .option_picker import OptionPickerPage
from .sequence_workbench import SequenceWorkbenchPage
from .start_position_picker import StartPositionPickerPage

__all__ = [
    "BasePage",
    "ConstructTabPage",
    "StartPositionPickerPage",
    "OptionPickerPage",
    "SequenceWorkbenchPage",
]
