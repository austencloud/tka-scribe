#!/usr/bin/env python3
"""
Measure Existing Application Centering

This script connects to an already running TKA application and measures
the centering of Option Picker header buttons without launching a new instance.

Usage:
    1. Start the TKA application normally: python main.py
    2. Select a start position to populate the Option Picker
    3. Run this script: python measure_existing_app.py

The script will find the running application and perform geometric measurements.
"""

import sys
from pathlib import Path
from typing import Optional

# Add the src directory to Python path for imports
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

try:
    from PyQt6.QtWidgets import QApplication, QWidget
    from presentation.components.option_picker.geometric_measurement_logger import GeometricMeasurementLogger
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're running this from the tka-desktop/modern directory")
    sys.exit(2)


class ExistingAppMeasurer:
    """
    Measures centering in an existing running TKA application.
    
    This class connects to the currently running QApplication instance
    and performs geometric measurements on the Option Picker components.
    """
    
    def __init__(self):
        self.app: Optional[QApplication] = None
        self.option_picker = None
        self.logger = GeometricMeasurementLogger()
        
    def measure_existing_app(self) -> bool:
        """
        Measure centering in the existing running application.
        
        Returns:
            bool: True if all sections are perfectly centered, False otherwise
        """
        print("🔍 MEASURING EXISTING APPLICATION CENTERING")
        print("="*60)
        
        try:
            # Step 1: Connect to existing application
            if not self._connect_to_existing_app():
                print("❌ No running TKA application found")
                return False
            
            # Step 2: Find Option Picker component
            if not self._find_option_picker():
                print("❌ Could not find Option Picker component")
                return False
            
            # Step 3: Check if Option Picker is populated
            if not self._check_option_picker_populated():
                print("❌ Option Picker is not populated with pictographs")
                print("   Please select a start position first")
                return False
            
            # Step 4: Capture measurements
            if not self._capture_measurements():
                print("❌ Failed to capture measurements")
                return False
            
            # Step 5: Analyze centering
            success = self._analyze_centering()
            
            # Step 6: Generate report
            self._generate_report()
            
            return success
            
        except Exception as e:
            print(f"❌ Measurement failed: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def _connect_to_existing_app(self) -> bool:
        """Connect to the existing QApplication instance."""
        try:
            self.app = QApplication.instance()
            if not self.app:
                print("❌ No QApplication instance found")
                return False
            
            print("✅ Connected to existing application")
            return True
            
        except Exception as e:
            print(f"❌ Failed to connect to existing app: {e}")
            return False
    
    def _find_option_picker(self) -> bool:
        """Find the Option Picker widget in the running application."""
        try:
            print("🔍 Searching for Option Picker component...")
            
            # Search through all widgets to find Option Picker
            for widget in self.app.allWidgets():
                widget_name = type(widget).__name__
                if 'OptionPicker' in widget_name:
                    self.option_picker = widget
                    print(f"✅ Found Option Picker: {widget_name}")
                    return True
            
            print("❌ Option Picker not found in widget hierarchy")
            return False
            
        except Exception as e:
            print(f"❌ Error finding Option Picker: {e}")
            return False
    
    def _check_option_picker_populated(self) -> bool:
        """Check if the Option Picker has populated sections."""
        try:
            sections_with_pictographs = 0
            
            # Find all Option Picker sections
            for widget in self.option_picker.findChildren(QWidget):
                if 'OptionPickerSection' in type(widget).__name__:
                    if hasattr(widget, 'pictographs') and len(widget.pictographs) > 0:
                        sections_with_pictographs += 1
            
            if sections_with_pictographs > 0:
                print(f"✅ Found {sections_with_pictographs} populated sections")
                return True
            else:
                print("❌ No populated sections found")
                return False
                
        except Exception as e:
            print(f"❌ Error checking population: {e}")
            return False
    
    def _capture_measurements(self) -> bool:
        """Capture geometric measurements for all sections."""
        try:
            print("📏 Capturing geometric measurements...")
            
            self.logger.clear_measurements()
            sections_measured = 0
            
            # Process events to ensure accurate measurements
            self.app.processEvents()
            
            # Find and measure all Option Picker sections
            for widget in self.option_picker.findChildren(QWidget):
                if 'OptionPickerSection' in type(widget).__name__:
                    if hasattr(widget, 'capture_geometric_measurements'):
                        widget.capture_geometric_measurements(self.logger)
                        sections_measured += 1
                    else:
                        # Manual measurement if method not available
                        self._manual_section_measurement(widget)
                        sections_measured += 1
            
            if sections_measured == 0:
                print("❌ No sections found for measurement")
                return False
            
            print(f"✅ Captured measurements for {sections_measured} sections")
            return True
            
        except Exception as e:
            print(f"❌ Failed to capture measurements: {e}")
            return False
    
    def _manual_section_measurement(self, section_widget) -> None:
        """Manually measure a section if the method is not available."""
        try:
            section_name = getattr(section_widget, 'letter_type', 'Unknown')
            
            # Capture section container
            container_name = f"{section_name}_container"
            self.logger.capture_widget_geometry(section_widget, container_name)
            
            # Find and capture header button
            for child in section_widget.findChildren(QWidget):
                if 'Button' in type(child).__name__ and hasattr(child, 'text'):
                    button_name = f"{section_name}_button"
                    self.logger.capture_widget_geometry(child, button_name)
                    break
                    
        except Exception as e:
            print(f"⚠️  Manual measurement failed for section: {e}")
    
    def _analyze_centering(self) -> bool:
        """Analyze centering for all measured sections."""
        try:
            print("🎯 Analyzing centering...")
            
            sections_analyzed = 0
            perfectly_centered = 0
            
            # Find all Option Picker sections and analyze
            for widget in self.option_picker.findChildren(QWidget):
                if 'OptionPickerSection' in type(widget).__name__:
                    if hasattr(widget, 'analyze_button_centering'):
                        widget.analyze_button_centering(self.logger)
                        sections_analyzed += 1
                    else:
                        # Manual analysis if method not available
                        self._manual_centering_analysis(widget)
                        sections_analyzed += 1
            
            # Count perfectly centered sections
            perfectly_centered = sum(1 for result in self.logger.centering_analyses 
                                   if result.is_perfectly_centered)
            
            print(f"✅ Analyzed {sections_analyzed} sections")
            print(f"📊 Perfectly centered: {perfectly_centered}/{sections_analyzed}")
            
            return perfectly_centered == sections_analyzed
            
        except Exception as e:
            print(f"❌ Failed to analyze centering: {e}")
            return False
    
    def _manual_centering_analysis(self, section_widget) -> None:
        """Manually analyze centering if the method is not available."""
        try:
            section_name = getattr(section_widget, 'letter_type', 'Unknown')
            container_name = f"{section_name}_container"
            button_name = f"{section_name}_button"
            
            analysis = self.logger.analyze_button_centering(
                container_name, button_name, section_name
            )
            
            if analysis:
                self.logger.log_centering_analysis(analysis)
                
        except Exception as e:
            print(f"⚠️  Manual analysis failed for section: {e}")
    
    def _generate_report(self) -> None:
        """Generate comprehensive measurement report."""
        print("\n" + "="*60)
        print("📊 EXISTING APPLICATION MEASUREMENT REPORT")
        print("="*60)
        
        self.logger.log_summary_report()
        
        # Additional reporting
        if self.logger.centering_analyses:
            print(f"\n🎯 MEASUREMENT RESULTS:")
            all_perfect = all(result.is_perfectly_centered for result in self.logger.centering_analyses)
            if all_perfect:
                print("✅ SUCCESS: All section header buttons are perfectly centered!")
            else:
                print("❌ ISSUES FOUND: Some section header buttons are not perfectly centered")
                
                print(f"\n🔧 SECTIONS REQUIRING FIXES:")
                for result in self.logger.centering_analyses:
                    if not result.is_perfectly_centered:
                        direction = "RIGHT" if result.centering_offset > 0 else "LEFT"
                        print(f"   • {result.section_name}: {abs(result.centering_offset):.1f}px too far {direction}")
        
        print("="*60)


def main():
    """Main entry point for the measurement script."""
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] in ['-h', '--help']:
            print(__doc__)
            return 0
    
    # Check if we're in the right directory
    if not (Path.cwd() / "main.py").exists():
        print("❌ Error: Please run this script from the tka-desktop/modern directory")
        print("   Current directory:", Path.cwd())
        print("   Expected to find: main.py")
        return 2
    
    # Run the measurement
    measurer = ExistingAppMeasurer()
    success = measurer.measure_existing_app()
    
    return 0 if success else 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
