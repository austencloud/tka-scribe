"""
Clean Import Migration Guide for TKA Design System
=================================================

## ❌ Avoid These Relative Import Patterns

### Bad Examples:
```python
# Ugly relative imports - hard to read and maintain
from ....styles.mixins import StyleMixin
from ....styles.core.types import StyleVariant
from ...styles.mixins import StyleMixin

# Inline imports scattered throughout code
def setup_header(self):
    from ....styles.mixins import apply_style_to_widget
    from ....styles.core.types import ComponentType
    apply_style_to_widget(widget, ComponentType.LABEL)
```

## ✅ Use These Clean Absolute Import Patterns

### Recommended Approach:
```python
# Clean, readable absolute imports at the top of the file
from desktop.modern.presentation.styles.mixins import StyleMixin, apply_style_to_widget
from desktop.modern.presentation.styles.core.types import StyleVariant, ComponentType

class MyWidget(QWidget, StyleMixin):
    def __init__(self):
        super().__init__()
        # Use imported functions directly
        apply_style_to_widget(self.label, ComponentType.LABEL, StyleVariant.ACCENT)
```

## 🔄 Migration Steps for Existing Components

### Step 1: Update Imports
Replace relative imports with absolute imports:

```python
# BEFORE:
from ....styles.mixins import StyleMixin
from ....styles.core.types import StyleVariant

# AFTER:
from desktop.modern.presentation.styles.mixins import StyleMixin
from desktop.modern.presentation.styles.core.types import StyleVariant, ComponentType
```

### Step 2: Remove Inline Imports
Move all imports to the top of the file:

```python
# BEFORE:
def _setup_header(self):
    from ....styles.mixins import apply_style_to_widget
    apply_style_to_widget(widget, ComponentType.LABEL)

# AFTER:
# (import at top of file)
from desktop.modern.presentation.styles.mixins import apply_style_to_widget

def _setup_header(self):
    apply_style_to_widget(widget, ComponentType.LABEL)
```

### Step 3: Add StyleMixin to Class
```python
# BEFORE:
class MyWidget(QWidget):

# AFTER:
class MyWidget(QWidget, StyleMixin):
```

### Step 4: Replace Inline Styles
```python
# BEFORE:
widget.setStyleSheet('''
    QLabel {
        color: rgba(255, 255, 255, 0.9);
        background: transparent;
    }
''')

# AFTER:
apply_style_to_widget(widget, ComponentType.LABEL, StyleVariant.DEFAULT)
# OR using mixin:
widget.apply_label_style(StyleVariant.DEFAULT)
```

## 📋 Standard Import Patterns by Component Type

### For Basic Components:
```python
from desktop.modern.presentation.styles.mixins import StyleMixin
from desktop.modern.presentation.styles.core.types import StyleVariant

class MyBasicWidget(QWidget, StyleMixin):
    def __init__(self):
        super().__init__()
        self.apply_panel_style(StyleVariant.DEFAULT)
```

### For Components Styling Other Widgets:
```python
from desktop.modern.presentation.styles.mixins import apply_style_to_widget
from desktop.modern.presentation.styles.core.types import StyleVariant, ComponentType

class MyComplexWidget(QWidget):
    def setup_children(self):
        apply_style_to_widget(self.label, ComponentType.LABEL, StyleVariant.ACCENT)
        apply_style_to_widget(self.button, ComponentType.BUTTON, StyleVariant.DEFAULT)
```

### For Components Using Colors Directly:
```python
from desktop.modern.presentation.styles.core.colors import ColorPalette

class MyStyledWidget(QWidget):
    def __init__(self):
        super().__init__()
        colors = ColorPalette()
        custom_style = f"border: 1px solid {colors.ACCENT_BORDER};"
        self.setStyleSheet(custom_style)
```

## 🎯 Import Organization Best Practices

### Group Imports Logically:
```python
# Standard library imports
from typing import Optional

# Third-party imports  
from PyQt6.QtWidgets import QWidget, QLabel
from PyQt6.QtCore import pyqtSignal

# Local application imports
from desktop.modern.domain.models.sequence_data import SequenceData

# Design system imports (keep together)
from desktop.modern.presentation.styles.mixins import StyleMixin, apply_style_to_widget
from desktop.modern.presentation.styles.core.types import StyleVariant, ComponentType
from desktop.modern.presentation.styles.core.colors import ColorPalette
```

### Import What You Need:
```python
# ✅ GOOD - Specific imports
from desktop.modern.presentation.styles.mixins import StyleMixin, apply_style_to_widget
from desktop.modern.presentation.styles.core.types import StyleVariant, ComponentType

# ❌ AVOID - Wildcard imports
from desktop.modern.presentation.styles.mixins import *
from desktop.modern.presentation.styles.core.types import *
```

## 🛠️ IDE Configuration

### VS Code Settings:
Add these to your workspace settings for better import management:
```json
{
    "python.analysis.extraPaths": ["./src"],
    "python.defaultInterpreterPath": "./.venv/Scripts/python.exe",
    "python.analysis.autoImportCompletions": true
}
```

### PyCharm Settings:
- Mark `src` directory as "Sources Root"
- Enable "Optimize imports on the fly"
- Configure import organization to group design system imports

## 📊 Migration Checklist

For each component file:
- [ ] Replace relative imports with absolute imports
- [ ] Move all imports to top of file
- [ ] Group design system imports together
- [ ] Add StyleMixin to component classes
- [ ] Replace inline setStyleSheet calls
- [ ] Test component still works
- [ ] Verify no import errors

## 🔍 Common Issues and Solutions

### Issue: Import not found
```
ModuleNotFoundError: No module named 'desktop.modern.presentation.styles'
```

**Solution**: Ensure your Python path includes the `src` directory and you're running from the correct working directory.

### Issue: Circular imports
```
ImportError: cannot import name 'StyleMixin' from partially initialized module
```

**Solution**: Move design system imports after local imports, or restructure to avoid circular dependencies.

### Issue: Type hints not working
```
Name 'StyleVariant' is not defined in type hint
```

**Solution**: Import types used in hints at module level, not in function scope.

This guide ensures clean, maintainable imports throughout the TKA codebase.
"""
