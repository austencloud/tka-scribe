#!/usr/bin/env python3
"""
Test script to verify Save Image button connection in modern TKA.

This script tests:
1. WorkbenchExportService instantiation and basic functionality
2. WorkbenchOperationCoordinator with export service injection
3. Save Image operation flow
4. Image export service integration
"""

import os
import sys
from pathlib import Path

# Add src to Python path
project_root = Path(__file__).parent
src_path = project_root / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))


def test_export_service():
    """Test WorkbenchExportService basic functionality."""
    print("🔧 Testing WorkbenchExportService...")

    try:
        from application.services.workbench.workbench_export_service import (
            WorkbenchExportService,
        )

        # Create export service
        export_service = WorkbenchExportService()

        # Test basic functionality
        assert (
            export_service.validate_export_directory()
        ), "Export directory validation failed"

        export_stats = export_service.get_export_stats()
        assert "directory" in export_stats, "Export stats missing directory"

        print(
            f"✅ Export service initialized with directory: {export_service.get_export_directory()}"
        )
        print(f"📊 Export stats: {export_stats}")

        return export_service

    except Exception as e:
        print(f"❌ Export service test failed: {e}")
        raise


def test_operation_coordinator():
    """Test WorkbenchOperationCoordinator with export service."""
    print("\n🔄 Testing WorkbenchOperationCoordinator...")

    try:
        from application.services.workbench.workbench_export_service import (
            WorkbenchExportService,
        )
        from application.services.workbench.workbench_operation_coordinator import (
            OperationType,
            WorkbenchOperationCoordinator,
        )

        # Create export service
        export_service = WorkbenchExportService()

        # Create coordinator with export service
        coordinator = WorkbenchOperationCoordinator(export_service=export_service)

        # Test that coordinator has export service
        assert hasattr(
            coordinator, "_export_service"
        ), "Coordinator missing export service"
        assert coordinator._export_service is not None, "Export service not injected"

        print("✅ Operation coordinator created with export service")

        # Test save_image method exists
        assert hasattr(
            coordinator, "save_image"
        ), "Coordinator missing save_image method"

        print("✅ Save image method available")

        return coordinator

    except Exception as e:
        print(f"❌ Operation coordinator test failed: {e}")
        raise


def test_image_export_service():
    """Test ModernImageExportService integration."""
    print("\n🖼️ Testing ModernImageExportService integration...")

    try:
        from core.dependency_injection.di_container import DIContainer
        from core.dependency_injection.image_export_service_registration import (
            register_image_export_services,
        )
        from core.interfaces.image_export_services import (
            IImageExportService,
            ImageExportOptions,
        )

        # Create image export service using DI container
        container = DIContainer()
        register_image_export_services(container)
        image_service = container.resolve(IImageExportService)

        # Test basic functionality
        assert hasattr(
            image_service, "export_sequence_image"
        ), "Missing export_sequence_image method"
        assert hasattr(
            image_service, "create_sequence_image"
        ), "Missing create_sequence_image method"

        print("✅ Modern image export service available")

        # Test export options creation
        options = ImageExportOptions(
            add_word=True,
            add_user_info=True,
            user_name="Test User",
            export_date="01-01-2024",
        )

        print("✅ Image export options created")

        return image_service

    except Exception as e:
        print(f"❌ Image export service test failed: {e}")
        raise


def test_sequence_data_conversion():
    """Test sequence data conversion for export."""
    print("\n📊 Testing sequence data conversion...")

    try:
        from application.services.workbench.workbench_export_service import (
            WorkbenchExportService,
        )
        from domain.models.beat_data import BeatData
        from domain.models.sequence_data import SequenceData

        # Create test sequence data
        beat1 = BeatData(beat_number=1, is_blank=False)
        beat2 = BeatData(beat_number=2, is_blank=False)

        sequence = SequenceData(name="Test Sequence", word="TEST", beats=[beat1, beat2])

        # Create export service and test conversion
        export_service = WorkbenchExportService()
        converted_data = export_service._convert_sequence_to_export_format(sequence)

        assert len(converted_data) == 2, f"Expected 2 beats, got {len(converted_data)}"
        assert converted_data[0]["beat_number"] == 1, "Beat number mismatch"
        assert converted_data[1]["beat_number"] == 2, "Beat number mismatch"

        print("✅ Sequence data conversion working")
        print(f"📊 Converted data sample: {converted_data[0]}")

        return sequence, converted_data

    except Exception as e:
        print(f"❌ Sequence data conversion test failed: {e}")
        raise


def main():
    """Run all tests."""
    print("🚀 Testing Save Image Button Connection")
    print("=" * 50)

    try:
        # Test 1: Export service
        export_service = test_export_service()

        # Test 2: Operation coordinator
        coordinator = test_operation_coordinator()

        # Test 3: Image export service
        image_service = test_image_export_service()

        # Test 4: Sequence data conversion
        sequence, converted_data = test_sequence_data_conversion()

        print("\n🎉 ALL TESTS PASSED!")
        print("=" * 50)
        print("✅ Save Image button should now be properly connected")
        print("✅ Export service is properly integrated")
        print("✅ Image export functionality is available")
        print("✅ Sequence data conversion is working")

        print(f"\n📁 Export directory: {export_service.get_export_directory()}")
        print("🔧 Ready for manual testing in the application")

        return True

    except Exception as e:
        print(f"\n💥 TESTS FAILED: {e}")
        print("❌ Save Image button connection needs debugging")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
