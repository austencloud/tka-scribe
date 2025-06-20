#!/usr/bin/env python3
"""
Run Measurement in Application

This script can be executed from within the running TKA application
to perform geometric measurements on Option Picker header buttons.

Usage:
    1. Start the TKA application: python main.py
    2. Select a start position to populate the Option Picker
    3. In the application console or a Python shell, run:
       exec(open('run_measurement_in_app.py').read())
"""

import sys
from pathlib import Path

# Add the src directory to Python path for imports
src_path = Path(__file__).parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

try:
    from PyQt6.QtWidgets import QApplication, QWidget
    from presentation.components.option_picker.geometric_measurement_logger import GeometricMeasurementLogger
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're running this from the tka-desktop/modern directory")
    exit()


def find_option_picker_sections():
    """Find all Option Picker sections in the current application."""
    app = QApplication.instance()
    if not app:
        print("❌ No QApplication instance found")
        return []
    
    sections = []
    for widget in app.allWidgets():
        if 'OptionPickerSection' in type(widget).__name__:
            sections.append(widget)
    
    return sections


def measure_header_button_centering():
    """Measure the centering of all Option Picker header buttons."""
    print("🔍 MEASURING OPTION PICKER HEADER BUTTON CENTERING")
    print("="*60)
    
    # Find all Option Picker sections
    sections = find_option_picker_sections()
    if not sections:
        print("❌ No Option Picker sections found")
        print("   Make sure the Option Picker is populated with pictographs")
        return False
    
    print(f"✅ Found {len(sections)} Option Picker sections")
    
    # Create measurement logger
    logger = GeometricMeasurementLogger()
    
    # Process events to ensure accurate measurements
    app = QApplication.instance()
    app.processEvents()
    
    # Measure each section
    measured_sections = 0
    for section in sections:
        try:
            section_name = getattr(section, 'letter_type', f'Section_{id(section)}')
            print(f"📏 Measuring section: {section_name}")
            
            # Capture section container
            container_name = f"{section_name}_container"
            logger.capture_widget_geometry(section, container_name)
            
            # Find and capture header button
            header_button = getattr(section, 'header_button', None)
            if header_button:
                button_name = f"{section_name}_button"
                logger.capture_widget_geometry(header_button, button_name)
                
                # Analyze centering
                analysis = logger.analyze_button_centering(
                    container_name, button_name, section_name
                )
                
                if analysis:
                    logger.log_centering_analysis(analysis)
                    measured_sections += 1
                else:
                    print(f"⚠️  Failed to analyze centering for {section_name}")
            else:
                print(f"⚠️  No header button found for {section_name}")
                
        except Exception as e:
            print(f"❌ Error measuring section {section_name}: {e}")
    
    # Generate summary report
    print("\n" + "="*60)
    print("📊 MEASUREMENT SUMMARY REPORT")
    print("="*60)
    
    logger.log_summary_report()
    
    # Check if all sections are perfectly centered
    if logger.centering_analyses:
        all_perfect = all(result.is_perfectly_centered for result in logger.centering_analyses)
        
        print(f"\n🎯 FINAL RESULT:")
        if all_perfect:
            print("✅ SUCCESS: All section header buttons are perfectly centered!")
        else:
            print("❌ ISSUES FOUND: Some section header buttons are not perfectly centered")
            
            print(f"\n🔧 SECTIONS REQUIRING FIXES:")
            for result in logger.centering_analyses:
                if not result.is_perfectly_centered:
                    direction = "RIGHT" if result.centering_offset > 0 else "LEFT"
                    print(f"   • {result.section_name}: {abs(result.centering_offset):.1f}px too far {direction}")
        
        print("="*60)
        return all_perfect
    else:
        print("❌ No measurements were captured")
        return False


def run_detailed_analysis():
    """Run detailed analysis with additional debugging information."""
    print("🔬 DETAILED OPTION PICKER ANALYSIS")
    print("="*50)
    
    app = QApplication.instance()
    if not app:
        print("❌ No QApplication instance found")
        return
    
    # Find Option Picker widget
    option_picker = None
    for widget in app.allWidgets():
        if 'OptionPicker' in type(widget).__name__:
            option_picker = widget
            break
    
    if not option_picker:
        print("❌ Option Picker widget not found")
        return
    
    print(f"✅ Found Option Picker: {type(option_picker).__name__}")
    print(f"   Size: {option_picker.size().width()}x{option_picker.size().height()}")
    print(f"   Position: ({option_picker.x()}, {option_picker.y()})")
    
    # Find sections
    sections = find_option_picker_sections()
    print(f"\n📊 Section Analysis:")
    print(f"   Total sections found: {len(sections)}")
    
    for i, section in enumerate(sections, 1):
        section_name = getattr(section, 'letter_type', f'Section_{i}')
        pictograph_count = len(getattr(section, 'pictographs', []))
        
        print(f"   {i}. {section_name}:")
        print(f"      - Size: {section.size().width()}x{section.size().height()}")
        print(f"      - Position: ({section.x()}, {section.y()})")
        print(f"      - Pictographs: {pictograph_count}")
        print(f"      - Visible: {section.isVisible()}")
        
        # Check header button
        header_button = getattr(section, 'header_button', None)
        if header_button:
            print(f"      - Button size: {header_button.size().width()}x{header_button.size().height()}")
            print(f"      - Button position: ({header_button.x()}, {header_button.y()})")
            print(f"      - Button text: '{header_button.text()}'")
        else:
            print(f"      - Button: Not found")
    
    print("\n" + "="*50)


# Main execution
if __name__ == "__main__":
    # Check if we're running in an application context
    app = QApplication.instance()
    if not app:
        print("❌ This script must be run within a QApplication context")
        print("   Start the TKA application first, then run this script")
    else:
        print("🚀 Running measurement analysis...")
        
        # Run detailed analysis first
        run_detailed_analysis()
        
        print("\n")
        
        # Run centering measurement
        success = measure_header_button_centering()
        
        if success:
            print("\n🎉 All header buttons are perfectly centered!")
        else:
            print("\n⚠️  Some header buttons need centering adjustments")


# If this script is being executed via exec(), run the main function
try:
    # This will only work if we're in an interactive context
    if 'get_ipython' in globals() or '__file__' not in globals():
        # Running in interactive mode (like exec())
        if QApplication.instance():
            print("🚀 Running measurement analysis...")
            run_detailed_analysis()
            print("\n")
            success = measure_header_button_centering()
            if success:
                print("\n🎉 All header buttons are perfectly centered!")
            else:
                print("\n⚠️  Some header buttons need centering adjustments")
except:
    pass
