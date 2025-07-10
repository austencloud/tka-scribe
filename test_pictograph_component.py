#!/usr/bin/env python3
"""
Test pictograph component creation.
"""

import os
import sys

# Add the src directory to the path
sys.path.insert(
    0, os.path.join(os.path.dirname(__file__), "src", "desktop", "modern", "src")
)


def test_pictograph_component_creation():
    """Test creating a pictograph component."""
    print("🧪 Testing pictograph component creation...")

    try:
        # Create QApplication first
        from PyQt6.QtWidgets import QApplication

        app = QApplication(sys.argv)
        print("   ✅ QApplication created")

        # Test 1: Try creating pictograph component directly
        print("\n🔍 Test 1: Direct pictograph component creation...")
        try:
            from presentation.components.pictograph.pictograph_component import (
                create_pictograph_component,
            )

            component = create_pictograph_component(parent=None)
            if component:
                print("   ✅ Pictograph component created successfully")
                print(f"   📊 Component type: {type(component)}")
            else:
                print("   ❌ Pictograph component creation returned None")
                return False

        except Exception as e:
            print(f"   ❌ Pictograph component creation failed: {e}")
            import traceback

            traceback.print_exc()
            return False

        # Test 2: Try creating ClickablePictographFrame
        print("\n🔍 Test 2: ClickablePictographFrame creation...")
        try:
            # Create pictograph data like the pool manager does
            from application.services.data.dataset_quiry import DatasetQuery
            from application.services.data.position_resolver import PositionResolver
            from domain.models.pictograph_models import PictographData
            from presentation.components.option_picker.components.frames.clickable_pictograph_frame import (
                ClickablePictographFrame,
            )

            dataset_service = DatasetQuery()
            position_resolver = PositionResolver()
            start_positions = position_resolver.get_start_positions("diamond")

            # Use the same approach as pool manager
            position_key = start_positions[0]  # First position
            real_pictograph_data = dataset_service.get_start_position_pictograph_data(
                position_key, "diamond"
            )

            if real_pictograph_data is None:
                print("   ⚠️ Using fallback pictograph data")
                real_pictograph_data = PictographData(letter="A")
            else:
                print(
                    f"   ✅ Using real pictograph data: {real_pictograph_data.letter}"
                )

            # Create frame with real data (but still no parent)
            frame = ClickablePictographFrame(real_pictograph_data, parent=None)
            if frame:
                print("   ✅ ClickablePictographFrame created successfully")
                print(f"   📊 Frame type: {type(frame)}")
                print(
                    f"   📊 Has pictograph_component: {hasattr(frame, 'pictograph_component')}"
                )
                if hasattr(frame, "pictograph_component"):
                    print(
                        f"   📊 pictograph_component value: {frame.pictograph_component}"
                    )
                    if frame.pictograph_component:
                        print("   ✅ pictograph_component is not None")
                        return True
                    else:
                        print("   ❌ pictograph_component is None")
                        return False
                else:
                    print("   ❌ Frame has no pictograph_component attribute")
                    return False
            else:
                print("   ❌ ClickablePictographFrame creation returned None")
                return False

        except Exception as e:
            print(f"   ❌ ClickablePictographFrame creation failed: {e}")
            import traceback

            traceback.print_exc()
            return False

        # Test 3: Try creating frame in application context
        print("\n🔍 Test 3: Frame creation in application context...")
        try:
            from core.application.application_factory import ApplicationFactory

            # Create test application (same as orchestrator test)
            container = ApplicationFactory.create_test_app()
            print("   ✅ Test application created")

            # Create a dummy parent widget (like option_picker_widget)
            from PyQt6.QtWidgets import QWidget

            dummy_parent = QWidget()
            print(f"   📊 Created dummy parent: {dummy_parent}")

            # Create frame with parent (like pool manager does)
            frame = ClickablePictographFrame(real_pictograph_data, parent=dummy_parent)
            if frame:
                print("   ✅ ClickablePictographFrame created in app context")
                print(
                    f"   📊 Has pictograph_component: {hasattr(frame, 'pictograph_component')}"
                )
                if hasattr(frame, "pictograph_component"):
                    print(
                        f"   📊 pictograph_component value: {frame.pictograph_component}"
                    )
                    if frame.pictograph_component:
                        print("   ✅ pictograph_component is not None in app context")
                        return True
                    else:
                        print("   ❌ pictograph_component is None in app context")
                        return False
                else:
                    print(
                        "   ❌ Frame has no pictograph_component attribute in app context"
                    )
                    return False
            else:
                print(
                    "   ❌ ClickablePictographFrame creation returned None in app context"
                )
                return False

        except Exception as e:
            print(f"   ❌ Frame creation in app context failed: {e}")
            import traceback

            traceback.print_exc()
            return False

    except Exception as e:
        print(f"❌ Test setup failed: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_pictograph_component_creation()

    print(f"\n📊 Pictograph Component Test Results:")
    if success:
        print("   ✅ Test completed successfully")
    else:
        print("   ❌ Test failed")

    sys.exit(0 if success else 1)
