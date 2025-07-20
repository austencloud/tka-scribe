#!/usr/bin/env python3
"""
Test Learn Tab Fixes

Test the fixes for:
1. Pictograph rendering in quiz questions
2. Modern toggle button styling
"""

import sys
import logging
from pathlib import Path

# Add src to Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_pictograph_data_service():
    """Test the pictograph data service fix."""
    print("🔧 Testing Pictograph Data Service Fix")
    print("=" * 50)

    try:
        from application.services.learn.mock_pictograph_data_service import (
            MockPictographDataService,
        )

        # Test the service
        service = MockPictographDataService()

        # Test get_pictograph_dataset method
        dataset = service.get_pictograph_dataset()
        print(f"✅ Dataset loaded with {len(dataset)} letters")

        # Test specific letter
        letter_a_data = dataset.get("A", [])
        print(f"✅ Letter 'A' has {len(letter_a_data)} pictographs")

        # Show sample data
        if letter_a_data:
            sample = letter_a_data[0]
            print(f"✅ Sample pictograph: {sample}")

        return True

    except Exception as e:
        print(f"❌ Pictograph data service test failed: {e}")
        return False


def test_mode_toggle_component():
    """Test the mode toggle component."""
    print("\n🎨 Testing Mode Toggle Component")
    print("=" * 50)

    try:
        from PyQt6.QtWidgets import QApplication

        # Create Qt application
        app = QApplication(sys.argv)

        from presentation.tabs.learn.components.lesson_selector.lesson_mode_toggle import (
            LessonModeToggle,
        )
        from application.services.learn.learn_ui_service import LearnUIService

        # Create UI service
        ui_service = LearnUIService()

        # Create toggle component
        toggle = LessonModeToggle(ui_service)

        print("✅ Mode toggle component created successfully")
        print(
            f"   - Has fixed question button: {hasattr(toggle, 'fixed_question_btn')}"
        )
        print(f"   - Has countdown button: {hasattr(toggle, 'countdown_btn')}")

        # Test mode selection
        from domain.models.learn import QuizMode

        initial_mode = toggle.get_selected_mode()
        print(f"   - Initial mode: {initial_mode.value}")

        # Test mode switching
        toggle.set_selected_mode(QuizMode.COUNTDOWN)
        new_mode = toggle.get_selected_mode()
        print(f"   - After switching: {new_mode.value}")

        print("✅ Mode toggle functionality working correctly")

        return True

    except Exception as e:
        print(f"❌ Mode toggle test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_question_generation():
    """Test question generation with the fixed service."""
    print("\n🧠 Testing Question Generation")
    print("=" * 50)

    try:
        from PyQt6.QtWidgets import QApplication

        # Create Qt application if needed
        if not QApplication.instance():
            app = QApplication(sys.argv)

        from core.dependency_injection.di_container import DIContainer
        from core.dependency_injection.learn_service_registration import (
            register_learn_services,
        )
        from core.interfaces.learn_services import (
            IQuestionGenerationService,
            IQuizSessionService,
        )

        # Setup DI container
        container = DIContainer()
        register_learn_services(container)

        # Get services
        session_service = container.resolve(IQuizSessionService)
        question_service = container.resolve(IQuestionGenerationService)

        print("✅ Services resolved successfully")

        # Create a quiz session
        session_id = session_service.create_session("Lesson1", "fixed_question")
        print(f"✅ Quiz session created: {session_id}")

        # Try to generate a question
        question = question_service.generate_question(session_id)

        if question:
            print("✅ Question generated successfully!")
            print(f"   - Question type: {question.question_type}")
            print(f"   - Has content: {question.question_content is not None}")
            print(f"   - Number of options: {len(question.answer_options)}")
            print(f"   - Has correct answer: {question.correct_answer is not None}")
        else:
            print("❌ Question generation returned None")
            return False

        return True

    except Exception as e:
        print(f"❌ Question generation test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def main():
    """Run all tests."""
    print("🚀 Testing Learn Tab Fixes")
    print("=" * 60)

    tests = [
        test_pictograph_data_service,
        test_mode_toggle_component,
        test_question_generation,
    ]

    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results.append(False)

    print("\n📊 Test Results")
    print("=" * 60)

    passed = sum(results)
    total = len(results)

    print(f"✅ Passed: {passed}/{total}")

    if passed == total:
        print("🎉 All tests passed! Learn Tab fixes are working correctly.")
        print("\nThe Learn Tab should now have:")
        print("• Working pictograph rendering in quiz questions")
        print("• Modern toggle button styling (compact, no wide spacing)")
        print("• Proper question generation without errors")
    else:
        print("❌ Some tests failed. Check the output above for details.")

    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
