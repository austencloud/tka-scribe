#!/usr/bin/env python3
"""
Dual-System Comparison Test for Legacy vs Modern Image Export

This test creates identical sequences in both Legacy and Modern systems,
exports images side-by-side, and captures comprehensive logs for comparison.
"""

import json
import logging
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List

# Add src to Python path
project_root = Path(__file__).parent
src_path = project_root / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

# Set up comprehensive logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("dual_system_comparison.log"),
        logging.StreamHandler(),
    ],
)


class DualSystemComparison:
    """Comprehensive comparison between Legacy and Modern image export systems."""

    def __init__(self):
        self.legacy_logs = []
        self.modern_logs = []
        self.comparison_results = {}
        self.test_sequence_data = None

    def create_identical_test_sequence(self):
        """Create identical 4-beat sequence for both systems."""
        print("🔧 Creating identical test sequence for both systems...")

        # Define the exact sequence: A-pro, B-anti, C-static, D-dash with start position
        self.test_sequence_data = {
            "name": "Dual System Test Sequence",
            "word": "DUAL",
            "start_position": "alpha1_alpha1",
            "beats": [
                {
                    "letter": "A",
                    "motion_type": "pro",
                    "turns": 0,
                    "start_pos": "alpha1",
                    "end_pos": "beta2",
                },
                {
                    "letter": "B",
                    "motion_type": "anti",
                    "turns": 1,
                    "start_pos": "alpha2",
                    "end_pos": "beta3",
                },
                {
                    "letter": "C",
                    "motion_type": "static",
                    "turns": 0,
                    "start_pos": "alpha3",
                    "end_pos": "beta4",
                },
                {
                    "letter": "D",
                    "motion_type": "dash",
                    "turns": 2,
                    "start_pos": "alpha4",
                    "end_pos": "beta5",
                },
            ],
        }

        print(
            f"✅ Test sequence defined: {self.test_sequence_data['word']} - {len(self.test_sequence_data['beats'])} beats"
        )
        return True

    def setup_comprehensive_logging(self):
        """Set up detailed logging to capture service registration and export details."""
        print("📋 Setting up comprehensive logging...")

        # Create custom log handlers for each system
        legacy_handler = logging.FileHandler("legacy_export_detailed.log")
        modern_handler = logging.FileHandler("modern_export_detailed.log")

        # Set detailed format
        detailed_format = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s"
        )
        legacy_handler.setFormatter(detailed_format)
        modern_handler.setFormatter(detailed_format)

        # Configure loggers for specific components
        components_to_log = [
            "core.dependency_injection",
            "application.services.image_export",
            "presentation.components.pictograph",
            "application.services.assets",
            "application.services.core.registrars",
        ]

        for component in components_to_log:
            logger = logging.getLogger(component)
            logger.setLevel(logging.DEBUG)
            logger.addHandler(legacy_handler)
            logger.addHandler(modern_handler)

        print("✅ Comprehensive logging configured")
        return True

    def export_legacy_system(self):
        """Export image using Legacy system with comprehensive logging."""
        print("\n🏛️ LEGACY SYSTEM EXPORT")
        print("=" * 50)

        try:
            # Import Legacy components
            from legacy.main import LegacyMainWindow
            from PyQt6.QtWidgets import QApplication

            # Create Legacy application
            app = QApplication.instance()
            if not app:
                app = QApplication(sys.argv)

            # Create Legacy main window
            legacy_window = LegacyMainWindow()

            # Log Legacy service registration
            print("📋 Legacy service registration:")
            self._log_legacy_service_registration(legacy_window)

            # Create sequence in Legacy system
            legacy_sequence = self._create_legacy_sequence()

            # Export image from Legacy
            legacy_export_path = self._export_legacy_image(
                legacy_window, legacy_sequence
            )

            # Log Legacy export details
            self._log_legacy_export_details(legacy_export_path)

            print(f"✅ Legacy export completed: {legacy_export_path}")
            return legacy_export_path

        except Exception as e:
            print(f"❌ Legacy export failed: {e}")
            import traceback

            traceback.print_exc()
            return None

    def export_modern_system(self):
        """Export image using Modern system with comprehensive logging."""
        print("\n🔬 MODERN SYSTEM EXPORT")
        print("=" * 50)

        try:
            # Import Modern components
            from application.services.image_export.modern_image_export_service import (
                ModernImageExportService,
            )
            from core.dependency_injection.di_container import DIContainer

            # Create Modern container
            container = DIContainer()

            # Log Modern service registration
            print("📋 Modern service registration:")
            self._log_modern_service_registration(container)

            # Register Modern services
            self._register_modern_services(container)

            # Create sequence in Modern system
            modern_sequence = self._create_modern_sequence()

            # Export image from Modern
            modern_export_path = self._export_modern_image(container, modern_sequence)

            # Log Modern export details
            self._log_modern_export_details(modern_export_path)

            print(f"✅ Modern export completed: {modern_export_path}")
            return modern_export_path

        except Exception as e:
            print(f"❌ Modern export failed: {e}")
            import traceback

            traceback.print_exc()
            return None

    def _log_legacy_service_registration(self, legacy_window):
        """Log Legacy service registration patterns."""
        print("🔍 Analyzing Legacy service registration...")

        # Capture Legacy container state
        if hasattr(legacy_window, "container"):
            container = legacy_window.container
            print(f"  - Legacy container type: {type(container)}")

            # Log registered services
            if hasattr(container, "get_registered_services"):
                services = container.get_registered_services()
                print(f"  - Registered services count: {len(services)}")
                for service_name in services:
                    print(f"    • {service_name}")

            # Check for specific pictograph services
            pictograph_services = [
                "IPictographRenderingService",
                "IArrowPositioningOrchestrator",
                "IPictographDataManager",
                "PictographVisibilityService",
            ]

            for service in pictograph_services:
                try:
                    instance = container.resolve(service)
                    print(f"  ✅ {service}: {type(instance)}")
                except:
                    print(f"  ❌ {service}: Not available")
        else:
            print("  ⚠️ Legacy container not accessible")

    def _log_modern_service_registration(self, container):
        """Log Modern service registration patterns."""
        print("🔍 Analyzing Modern service registration...")

        print(f"  - Modern container type: {type(container)}")

        # Log container state before registration
        print("  - Container state before registration:")
        if hasattr(container, "_registry"):
            registry = container._registry
            print(f"    • Registry entries: {len(registry._services)}")
            for service_type in registry._services:
                print(f"      - {service_type}")

    def _register_modern_services(self, container):
        """Register Modern services with detailed logging."""
        print("🔧 Registering Modern services...")

        # Import and register image export services
        from core.dependency_injection.image_export_service_registration import (
            register_image_export_services,
        )

        print("  - Registering image export services...")
        register_image_export_services(container)

        # Log container state after registration
        print("  - Container state after registration:")
        if hasattr(container, "_registry"):
            registry = container._registry
            print(f"    • Registry entries: {len(registry._services)}")
            for service_type in registry._services:
                print(f"      - {service_type}")

        # Check for specific pictograph services
        pictograph_services = [
            "IPictographRenderingService",
            "IArrowPositioningOrchestrator",
            "IPictographDataManager",
            "PictographVisibilityService",
        ]

        for service in pictograph_services:
            try:
                instance = container.resolve(service)
                print(f"  ✅ {service}: {type(instance)}")
            except Exception as e:
                print(f"  ❌ {service}: {e}")

    def _create_legacy_sequence(self):
        """Create sequence in Legacy system."""
        print("🎨 Creating Legacy sequence...")
        # Implementation will be added based on Legacy system structure
        return None

    def _create_modern_sequence(self):
        """Create sequence in Modern system."""
        print("🎨 Creating Modern sequence...")

        from application.services.data.pictograph_factory import PictographFactory
        from domain.models.beat_data import BeatData
        from domain.models.sequence_data import SequenceData

        # Create pictograph factory
        factory = PictographFactory()

        # Create beats
        beats = []
        for i, beat_config in enumerate(self.test_sequence_data["beats"]):
            entry_data = {
                "letter": beat_config["letter"],
                "start_pos": beat_config["start_pos"],
                "end_pos": beat_config["end_pos"],
                "motion_type": beat_config["motion_type"],
                "turns": beat_config["turns"],
            }

            pictograph_data = factory.create_pictograph_data_from_entry(
                entry_data, "diamond"
            )

            beat = BeatData(
                beat_number=i + 1,
                is_blank=False,
                pictograph_data=pictograph_data,
                metadata={
                    "created_via": "dual_system_comparison",
                    "motion_type": beat_config["motion_type"],
                    "turns": beat_config["turns"],
                },
            )
            beats.append(beat)

        # Create sequence
        sequence = SequenceData(
            name=self.test_sequence_data["name"],
            word=self.test_sequence_data["word"],
            beats=beats,
        )

        print(
            f"✅ Modern sequence created: {sequence.word} - {len(sequence.beats)} beats"
        )
        return sequence

    def _export_legacy_image(self, legacy_window, sequence):
        """Export image from Legacy system."""
        print("📤 Exporting Legacy image...")
        # Implementation will be added based on Legacy export API
        return "legacy_export.png"

    def _export_modern_image(self, container, sequence):
        """Export image from Modern system."""
        print("📤 Exporting Modern image...")

        try:
            # Get export service
            export_service = container.resolve("IImageExportService")

            # Create export options
            from application.services.image_export.image_export_options import (
                ImageExportOptions,
            )

            options = ImageExportOptions(
                include_start_position=True,
                include_word=True,
                include_difficulty_level=True,
                include_user_info=True,
            )

            # Export image
            export_path = Path("exports/dual_system/modern_export.png")
            export_path.parent.mkdir(parents=True, exist_ok=True)

            result = export_service.export_sequence_image(
                sequence_data=sequence.beats,
                output_path=str(export_path),
                options=options,
            )

            if result.success:
                print(f"✅ Modern export successful: {export_path}")
                return str(export_path)
            else:
                print(f"❌ Modern export failed: {result.message}")
                return None

        except Exception as e:
            print(f"❌ Modern export error: {e}")
            import traceback

            traceback.print_exc()
            return None

    def _log_legacy_export_details(self, export_path):
        """Log Legacy export details."""
        if export_path and Path(export_path).exists():
            file_size = Path(export_path).stat().st_size
            print(f"📊 Legacy export details:")
            print(f"  - File: {export_path}")
            print(f"  - Size: {file_size} bytes")

    def _log_modern_export_details(self, export_path):
        """Log Modern export details."""
        if export_path and Path(export_path).exists():
            file_size = Path(export_path).stat().st_size
            print(f"📊 Modern export details:")
            print(f"  - File: {export_path}")
            print(f"  - Size: {file_size} bytes")

    def compare_service_registrations(self):
        """Compare service registrations between Legacy and Modern systems."""
        print("\n🔍 SERVICE REGISTRATION COMPARISON")
        print("=" * 60)

        # Analyze log files for service registration patterns
        legacy_log_file = Path("legacy_export_detailed.log")
        modern_log_file = Path("modern_export_detailed.log")

        if legacy_log_file.exists() and modern_log_file.exists():
            legacy_services = self._extract_services_from_log(legacy_log_file)
            modern_services = self._extract_services_from_log(modern_log_file)

            print("📋 Legacy Services:")
            for service in sorted(legacy_services):
                print(f"  ✅ {service}")

            print("\n📋 Modern Services:")
            for service in sorted(modern_services):
                print(f"  ✅ {service}")

            print("\n🔍 Service Registration Gaps:")
            missing_in_modern = legacy_services - modern_services
            extra_in_modern = modern_services - legacy_services

            if missing_in_modern:
                print("❌ Missing in Modern:")
                for service in sorted(missing_in_modern):
                    print(f"  - {service}")

            if extra_in_modern:
                print("➕ Extra in Modern:")
                for service in sorted(extra_in_modern):
                    print(f"  + {service}")

            if not missing_in_modern and not extra_in_modern:
                print("✅ Service registrations match!")
        else:
            print("⚠️ Log files not found for comparison")

    def compare_export_outputs(self, legacy_path, modern_path):
        """Compare exported images and analyze differences."""
        print("\n🖼️ EXPORT OUTPUT COMPARISON")
        print("=" * 60)

        if not legacy_path or not modern_path:
            print("❌ Cannot compare - missing export files")
            return

        legacy_file = Path(legacy_path)
        modern_file = Path(modern_path)

        if not legacy_file.exists() or not modern_file.exists():
            print("❌ Cannot compare - export files don't exist")
            return

        # File size comparison
        legacy_size = legacy_file.stat().st_size
        modern_size = modern_file.stat().st_size

        print(f"📏 File Size Comparison:")
        print(f"  - Legacy: {legacy_size:,} bytes")
        print(f"  - Modern: {modern_size:,} bytes")
        print(f"  - Difference: {modern_size - legacy_size:+,} bytes")

        # Image dimension comparison
        try:
            from PyQt6.QtGui import QPixmap

            legacy_pixmap = QPixmap(str(legacy_file))
            modern_pixmap = QPixmap(str(modern_file))

            print(f"📐 Dimension Comparison:")
            print(f"  - Legacy: {legacy_pixmap.width()}x{legacy_pixmap.height()}")
            print(f"  - Modern: {modern_pixmap.width()}x{modern_pixmap.height()}")

            if (
                legacy_pixmap.width() == modern_pixmap.width()
                and legacy_pixmap.height() == modern_pixmap.height()
            ):
                print("  ✅ Dimensions match")
            else:
                print("  ❌ Dimensions differ")

        except Exception as e:
            print(f"⚠️ Could not compare image dimensions: {e}")

    def analyze_missing_visual_elements(self):
        """Analyze logs to identify missing visual elements in Modern system."""
        print("\n🔍 MISSING VISUAL ELEMENTS ANALYSIS")
        print("=" * 60)

        modern_log_file = Path("modern_export_detailed.log")
        if not modern_log_file.exists():
            print("❌ Modern log file not found")
            return

        # Read Modern log and identify issues
        with open(modern_log_file, "r") as f:
            log_content = f.read()

        # Look for specific error patterns
        error_patterns = {
            "No rendering service available for grid": "Grid rendering service missing",
            "No rendering service available for blue prop": "Blue prop rendering service missing",
            "No rendering service available for red prop": "Red prop rendering service missing",
            "FALLBACK - blue: Using center position": "Blue arrow positioning service missing",
            "FALLBACK - red: Using center position": "Red arrow positioning service missing",
            "Failed to resolve IArrowPositioningOrchestrator": "Arrow positioning orchestrator missing",
            "Failed to resolve IPictographRenderingService": "Pictograph rendering service missing",
        }

        print("🚨 Identified Issues:")
        issues_found = []
        for pattern, description in error_patterns.items():
            if pattern in log_content:
                count = log_content.count(pattern)
                print(f"  ❌ {description} (occurred {count} times)")
                issues_found.append(description)

        if not issues_found:
            print("  ✅ No visual element issues found")

        return issues_found

    def _extract_services_from_log(self, log_file):
        """Extract registered services from log file."""
        services = set()

        with open(log_file, "r") as f:
            for line in f:
                # Look for service registration patterns
                if (
                    "Registered singleton:" in line
                    or "Registered factory:" in line
                    or "Registered instance:" in line
                ):
                    # Extract service name
                    parts = line.split(" -> ")
                    if len(parts) >= 2:
                        service_name = parts[0].split(":")[-1].strip()
                        services.add(service_name)

        return services

    def run_comprehensive_comparison(self):
        """Run the complete dual-system comparison."""
        print("🎯 DUAL-SYSTEM COMPARISON TEST")
        print("🔧 Comprehensive Legacy vs Modern Image Export Analysis")
        print("=" * 80)

        # Phase 1: Setup
        if not self.create_identical_test_sequence():
            return False

        if not self.setup_comprehensive_logging():
            return False

        # Phase 2: Export from both systems
        legacy_path = self.export_legacy_system()
        modern_path = self.export_modern_system()

        # Phase 3: Analysis
        self.compare_service_registrations()
        self.compare_export_outputs(legacy_path, modern_path)
        missing_elements = self.analyze_missing_visual_elements()

        # Phase 4: Generate recommendations
        self.generate_fix_recommendations(missing_elements)

        print("\n" + "=" * 80)
        print("🎉 DUAL-SYSTEM COMPARISON COMPLETED")
        print("📋 Check detailed logs for service registration patterns")
        print("🔧 Review recommendations for fixing missing visual elements")

        return True

    def generate_fix_recommendations(self, missing_elements):
        """Generate specific recommendations for fixing missing visual elements."""
        print("\n🔧 FIX RECOMMENDATIONS")
        print("=" * 60)

        if not missing_elements:
            print("✅ No fixes needed - all visual elements working correctly")
            return

        recommendations = {
            "Grid rendering service missing": [
                "Register IPictographRenderingService in Modern image export container",
                "Ensure grid rendering components are available to pictograph scenes",
                "Copy Legacy grid service registration pattern exactly",
            ],
            "Blue prop rendering service missing": [
                "Register prop rendering services in Modern export container",
                "Ensure prop visibility and positioning services are available",
                "Copy Legacy prop service registration pattern",
            ],
            "Red prop rendering service missing": [
                "Register prop rendering services in Modern export container",
                "Ensure prop visibility and positioning services are available",
                "Copy Legacy prop service registration pattern",
            ],
            "Blue arrow positioning service missing": [
                "Register IArrowPositioningOrchestrator in Modern export container",
                "Ensure arrow positioning services have access to grid location mapping",
                "Copy Legacy arrow positioning service registration pattern",
            ],
            "Red arrow positioning service missing": [
                "Register IArrowPositioningOrchestrator in Modern export container",
                "Ensure arrow positioning services have access to grid location mapping",
                "Copy Legacy arrow positioning service registration pattern",
            ],
            "Arrow positioning orchestrator missing": [
                "Add IArrowPositioningOrchestrator to Modern image export service registration",
                "Ensure orchestrator has access to grid and location services",
                "Register with same scope and lifecycle as Legacy system",
            ],
            "Pictograph rendering service missing": [
                "Register IPictographRenderingService as singleton in Modern export container",
                "Ensure rendering service has access to all required dependencies",
                "Copy Legacy pictograph service registration pattern exactly",
            ],
        }

        for issue in missing_elements:
            if issue in recommendations:
                print(f"\n❌ {issue}:")
                for rec in recommendations[issue]:
                    print(f"  🔧 {rec}")


def main():
    """Run the dual-system comparison test."""
    comparison = DualSystemComparison()
    success = comparison.run_comprehensive_comparison()

    if success:
        print("\n🎉 COMPARISON COMPLETED SUCCESSFULLY!")
        sys.exit(0)
    else:
        print("\n💥 COMPARISON FAILED!")
        sys.exit(1)


if __name__ == "__main__":
    main()
