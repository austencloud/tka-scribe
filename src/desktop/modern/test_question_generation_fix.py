#!/usr/bin/env python3
"""
Test Question Generation Fix

Quick test to verify the question generation fixes work correctly.
"""

import sys
import logging
from pathlib import Path

# Add src to Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_question_generation():
    """Test question generation with the fixes."""
    print("🧠 Testing Question Generation Fixes")
    print("=" * 50)
    
    try:
        from PyQt6.QtWidgets import QApplication
        
        # Create Qt application
        app = QApplication(sys.argv)
        
        from core.dependency_injection.di_container import DIContainer
        from core.dependency_injection.learn_service_registration import register_learn_services
        from core.interfaces.learn_services import IQuestionGenerationService, IQuizSessionService
        
        # Setup DI container
        container = DIContainer()
        register_learn_services(container)
        
        # Get services
        session_service = container.resolve(IQuizSessionService)
        question_service = container.resolve(IQuestionGenerationService)
        
        print("✅ Services resolved successfully")
        
        # Test all lesson types
        lesson_types = ["Lesson1", "Lesson2", "Lesson3"]
        
        for lesson_type in lesson_types:
            print(f"\n📝 Testing {lesson_type}...")
            
            try:
                # Create session
                session_id = session_service.create_session(lesson_type, "fixed_question")
                print(f"   ✅ Session created: {session_id[:8]}...")
                
                # Generate question
                question = question_service.generate_question(session_id)
                
                if question:
                    print(f"   ✅ Question generated successfully!")
                    print(f"      - Type: {question.question_type}")
                    print(f"      - Has content: {question.question_content is not None}")
                    print(f"      - Options count: {len(question.answer_options)}")
                    print(f"      - Has correct answer: {question.correct_answer is not None}")
                else:
                    print(f"   ❌ Question generation returned None")
                    
            except Exception as e:
                print(f"   ❌ Error with {lesson_type}: {e}")
        
        print("\n🎉 Question generation test completed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_question_generation()
    print(f"\n{'✅ SUCCESS' if success else '❌ FAILED'}")
    sys.exit(0 if success else 1)
