# Modern Browse Tab Control Panel - Analysis & Implementation Plan

## Legacy Control Panel Architecture Analysis

### Components Overview

The Legacy Browse tab has a **SequencePickerControlPanel** that sits above the sequence browser area with:

1. **SequencePickerGoBackButton** - Returns to filter selection
2. **CurrentlyDisplayingLabel** - Shows current filter description
3. **SequencePickerCountLabel** - Shows number of sequences displayed
4. **SequencePickerSortWidget** - The main sort controls

### Sort Widget Deep Dive

#### SequencePickerSortWidget Structure:

- **SortButtonsBar** - Horizontal bar with "Sort:" label + sort buttons
- **SortOption** - Data model for each sort option
- **SortButton** - Individual sort button with selection state
- **SequencePickerSortController** - Handles sort logic and state persistence

#### Sort Options Available:

1. **Sequence Length** - Groups by 2, 3, 4, 5, 6, etc.
2. **Alphabetical** - Groups by A, B, C, D, etc.
3. **Date Added** - Groups by date ranges
4. **Level** - Groups by difficulty levels

#### Key Functionality:

- **Sort Button Selection** - Visual feedback for active sort
- **Navigation Panel Update** - Sort choice determines sidebar sections
- **State Persistence** - Remembers sort choice across sessions
- **Responsive Layout** - Font sizes adjust to window width
- **Cursor Management** - Shows wait cursor during sort operations

### Sort Controller Logic:

```python
def on_sort(self, method: str):
    # Show wait cursor
    QApplication.setOverrideCursor(Qt.CursorShape.WaitCursor)

    # Save sort method to settings
    self.settings_manager.browse_settings.set_sort_method(method)

    # Re-sort and display sequences
    self.sequence_picker.sorter.sort_and_display_currently_filtered_sequences_by_method(method)

    # Reset scroll position
    self.browse_tab.sequence_picker.scroll_widget.scroll_area.verticalScrollBar().setValue(0)

    # Update thumbnail sizes
    self.browse_tab.ui_updater.resize_thumbnails_top_to_bottom()

    # Restore cursor
    QApplication.restoreOverrideCursor()
```

## Modern Implementation Strategy

### 1. Create ModernBrowseControlPanel

A complete control panel that sits above the browser area with:

- **Back Button** - Returns to filter selection
- **Filter Description Label** - Shows current filter
- **Sort Widget** - Main sort controls (horizontal button bar)
- **Results Count Label** - Shows number of sequences

### 2. Create ModernSortWidget

The main sort component with:

- **Sort Button Bar** - Horizontal layout with "Sort:" label + buttons
- **Sort Button** - Individual sort buttons with modern styling
- **Sort Controller** - Modern service for sort logic
- **State Integration** - Uses BrowseStateService for persistence

### 3. Integration Points

- **Navigation Sidebar** - Sort choice updates sidebar sections
- **Sequence Browser** - Sort choice affects sequence display order
- **State Service** - Persists sort choice across sessions
- **Filter System** - Sort applies to current filter results

### 4. Visual Design

- **Glassmorphism Style** - Consistent with modern design system
- **Responsive Layout** - Adjusts to window width
- **Smooth Transitions** - Animated sort button selection
- **Modern Typography** - Clean, readable font hierarchy

## Implementation Files Needed

### Core Components:

1. `modern_browse_control_panel.py` - Main control panel container
2. `modern_sort_widget.py` - Sort button bar and logic
3. `modern_sort_button.py` - Individual sort button component
4. `modern_sort_controller.py` - Sort logic and state management

### Integration Updates:

1. `sequence_browser_panel.py` - Add control panel above browser area
2. `browse_state_service.py` - Handle sort state persistence
3. `modern_browse_tab.py` - Connect control panel signals

### Layout Structure:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browse Tab                               │
├─────────────────────────────────────────────────────────────────┤
│ [← Back to Filters]  |  Sequence Browser  |  Sort: [A] [Len] [Lvl] │  ← CONTROL PANEL
├─────────────────────────────────────────────────────────────────┤
│ Currently displaying: sequences starting with A-D (24 sequences)  │
├─────────────┬───────────────────────────────────────────────────┤
│ Navigation  │                                                   │
│ Sidebar     │              Thumbnail Grid                       │
│ ┌─────────┐ │  ┌─────┐ ┌─────┐ ┌─────┐                         │
│ │ Letter  │ │  │ IMG │ │ IMG │ │ IMG │                         │
│ ├─────────┤ │  └─────┘ └─────┘ └─────┘                         │
│ │   A     │ │  ┌─────┐ ┌─────┐ ┌─────┐                         │
│ │   B     │ │  │ IMG │ │ IMG │ │ IMG │                         │
│ │   C     │ │  └─────┘ └─────┘ └─────┘                         │
│ │   D     │ │                                                   │
│ └─────────┘ │                                                   │
└─────────────┴───────────────────────────────────────────────────┘
```

## Key Features to Implement

### 1. Sort Button Bar

- **Horizontal Layout** - "Sort:" label + sort buttons
- **Button Selection** - Visual feedback for active sort
- **Responsive Sizing** - Font sizes adjust to window width

### 2. Sort Options

- **Alphabetical** - A, B, C, D navigation
- **Length** - 2, 3, 4, 5, 6 navigation
- **Level** - 1, 2, 3, 4 navigation
- **Date Added** - Date range navigation

### 3. State Management

- **Persistence** - Remember sort choice across sessions
- **Navigation Update** - Sort choice updates sidebar sections
- **Filter Integration** - Sort applies to filtered results

### 4. User Experience

- **Loading States** - Show wait cursor during sort
- **Smooth Transitions** - Animated button selection
- **Accessibility** - Proper ARIA labels and keyboard navigation

This control panel will complete the Browse tab by providing the missing sort functionality that determines how sequences are organized and what appears in the navigation sidebar.
