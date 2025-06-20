"""
Patch for fixing cyan button sizing overflow in option picker sections.

The issue: Cyan rounded sections (option picker sections) are overflowing
their purple container boundaries due to incorrect width calculations.

Root causes:
1. Section width calculations don't account for margins and borders properly
2. Responsive sizing doesn't consider container padding
3. Button sizing calculations use outdated container dimensions
"""


# File 1: display_manager.py - Fix section width calculation
def fix_display_manager_width_calculation():
    """
    Fix in: f:\CODE\TKA\tka-desktop\modern\src\presentation\components\option_picker\display_manager.py
    Around lines 60-65

    Problem: section_width = available_width // 3 doesn't account for:
    - Container margins (5px left + 5px right = 10px)
    - Section margins (3px per section * 2 sides * 3 sections = 18px)
    - Border widths (2px per section * 2 sides * 3 sections = 12px)
    - Spacing between sections (8px * 2 gaps = 16px)
    """

    original_code = """
    # Calculate proper width accounting for margins and spacing
    if self.mw_size_provider:
        full_width = self.mw_size_provider().width()
        total_margins = 10  # Left + right margins
        total_spacing = 16  # 2 spacing gaps between 3 sections
        available_width = full_width - total_margins - total_spacing
        section_width = available_width // 3
        section.setFixedWidth(section_width)
    """

    fixed_code = """
    # Calculate proper width accounting for ALL margins, borders, and spacing
    if self.mw_size_provider:
        full_width = self.mw_size_provider().width()
        
        # Account for container margins
        container_margins = 10  # Left + right margins (5px each)
        
        # Account for spacing between sections
        section_spacing = 16  # 2 gaps * 8px each
        
        # Account for section margins and borders
        section_margin_per_section = 6  # 3px margin * 2 sides
        section_border_per_section = 4  # 2px border * 2 sides
        total_section_overhead = (section_margin_per_section + section_border_per_section) * 3
        
        # Calculate available width for content
        available_width = full_width - container_margins - section_spacing - total_section_overhead
        section_width = max(100, available_width // 3)  # Ensure minimum width
        
        # Add some safety margin
        section_width = int(section_width * 0.95)  # 5% safety margin
        
        section.setFixedWidth(section_width)
    """

    print("Fix 1: Update display_manager.py section width calculation")
    print(
        "Replace the section width calculation to account for all margins and borders"
    )


# File 2: responsive_sizing_manager.py - Fix container size calculation
def fix_responsive_sizing_manager():
    """
    Fix in: f:\CODE\TKA\tka-desktop\modern\src\presentation\components\option_picker\responsive_sizing_manager.py
    Around lines 230-250 in _apply_section_sizing method

    Problem: setFixedWidth doesn't account for the actual content area needed
    """

    original_code = """
    def _apply_section_sizing(
        self, section_widget: QWidget, section_type: str, sizing: Dict
    ):
        # Determine width based on section type
        if section_type in ["Type1", "Type2", "Type3"]:
            width = sizing["individual_section_width"]
        else:
            width = sizing["shared_section_width"]

        # Set section dimensions
        section_widget.setFixedWidth(width)
        
        # Calculate and set maximum height to prevent overflow
        max_section_height = (
            sizing["header_height"]
            + sizing["pictograph_space_per_section"]
            + sizing["section_margins"] * 2
        )
        section_widget.setMaximumHeight(max_section_height)
    """

    fixed_code = """
    def _apply_section_sizing(
        self, section_widget: QWidget, section_type: str, sizing: Dict
    ):
        # Determine width based on section type
        if section_type in ["Type1", "Type2", "Type3"]:
            base_width = sizing["individual_section_width"]
        else:
            base_width = sizing["shared_section_width"]

        # Account for section's own margins, borders, and padding
        section_overhead = 20  # Conservative estimate for margins, borders, padding
        adjusted_width = max(100, base_width - section_overhead)
        
        # Set section dimensions with safety margin
        section_widget.setFixedWidth(adjusted_width)
        section_widget.setMaximumWidth(adjusted_width)  # Prevent expansion
        
        # Calculate and set maximum height to prevent overflow
        max_section_height = (
            sizing["header_height"]
            + sizing["pictograph_space_per_section"]
            + sizing["section_margins"] * 2
        )
        section_widget.setMaximumHeight(max_section_height)
    """

    print("Fix 2: Update responsive_sizing_manager.py to account for section overhead")


# File 3: option_picker_section.py - Fix container styling
def fix_option_picker_section_styling():
    """
    Fix in: f:\CODE\TKA\tka-desktop\modern\src\presentation\components\option_picker\option_picker_section.py
    Around lines 47-90 in _setup_ui method

    Problem: Section styling and margins cause overflow
    """

    original_code = """
    self.setStyleSheet(
        '''
        /* Option picker section - ORANGE border */
        OptionPickerSection {
            background: rgba(255, 245, 230, 150);
            border: 2px solid orange;
            margin: 2px;
        }
        '''
    )
    """

    fixed_code = """
    self.setStyleSheet(
        '''
        /* Option picker section - ORANGE border */
        OptionPickerSection {
            background: rgba(255, 245, 230, 150);
            border: 2px solid orange;
            margin: 1px;  /* Reduced margin */
            padding: 2px; /* Reduced padding */
        }
        '''
    )
    """

    print("Fix 3: Reduce section margins and padding to prevent overflow")


# File 4: Quick CSS fix for immediate testing
def create_quick_css_fix():
    """
    Quick CSS override that can be applied immediately for testing
    """

    css_fix = """
    /* Emergency CSS fix for cyan button overflow */
    OptionPickerSection {
        margin: 1px !important;
        padding: 2px !important;
        border-width: 1px !important;
        box-sizing: border-box !important;
    }
    
    /* Ensure sections fit in containers */
    OptionPickerSection QFrame {
        max-width: 100% !important;
        box-sizing: border-box !important;
    }
    
    /* Fix responsive button sizing */
    ResponsiveSectionButton {
        max-width: 95% !important;
        margin: 1px !important;
    }
    """

    print("Quick CSS Fix (apply to any section widget):")
    print(css_fix)

    return css_fix


def main():
    print("CYAN BUTTON SIZING FIX GUIDE")
    print("=" * 50)

    print("\nStep 1: Test the current issue")
    print("- Run the test_button_sizing.py script")
    print("- Observe cyan sections overflowing purple containers")

    print("\nStep 2: Apply fixes in order of priority")
    fix_display_manager_width_calculation()
    print()
    fix_responsive_sizing_manager()
    print()
    fix_option_picker_section_styling()
    print()

    print("\nStep 3: Quick test fix")
    create_quick_css_fix()

    print("\nStep 4: Test and verify")
    print("- Re-run test_button_sizing.py")
    print("- Cyan sections should now fit within purple containers")
    print("- Adjust container size to verify responsive behavior")


if __name__ == "__main__":
    main()
