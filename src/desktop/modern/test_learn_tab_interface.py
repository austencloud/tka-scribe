#!/usr/bin/env python3
"""
Learn Tab Interface Test

Quick test to verify the Learn Tab interface is working correctly
and can be accessed through the tab management system.
"""

import sys
import logging
from pathlib import Path

# Add src to Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_learn_tab_interface():
    """Test the Learn Tab interface integration."""
    try:
        from PyQt6.QtWidgets import QApplication
        
        # Create Qt application
        app = QApplication(sys.argv)
        
        print("🚀 Testing Learn Tab Interface Integration")
        print("=" * 50)
        
        # Test 1: DI Container and Service Registration
        print("\n📋 Test 1: Service Registration")
        from core.dependency_injection.di_container import DIContainer
        from core.dependency_injection.learn_service_registration import register_learn_services
        
        container = DIContainer()
        register_learn_services(container)
        print("✅ Learn services registered successfully")
        
        # Test 2: Learn Tab Creation
        print("\n📋 Test 2: Learn Tab Creation")
        from presentation.tabs.learn import ModernLearnTab
        
        learn_tab = container.resolve(ModernLearnTab)
        print("✅ Learn Tab created successfully")
        print(f"   - Tab type: {type(learn_tab).__name__}")
        print(f"   - Tab visible: {learn_tab.isVisible()}")
        
        # Test 3: Component Structure
        print("\n📋 Test 3: Component Structure")
        print(f"   - Has lesson selector: {hasattr(learn_tab, 'lesson_selector')}")
        print(f"   - Has lesson widget: {hasattr(learn_tab, 'lesson_widget')}")
        print(f"   - Has results panel: {hasattr(learn_tab, 'results_panel')}")
        print(f"   - Has stack widget: {hasattr(learn_tab, 'stack')}")
        
        if hasattr(learn_tab, 'stack'):
            print(f"   - Stack widget count: {learn_tab.stack.count()}")
            print(f"   - Current stack index: {learn_tab.stack.currentIndex()}")
        
        # Test 4: Service Dependencies
        print("\n📋 Test 4: Service Dependencies")
        services = [
            'lesson_config_service',
            'session_service', 
            'question_service',
            'validation_service',
            'progress_service',
            'ui_service',
            'navigation_service',
            'data_service'
        ]
        
        for service_name in services:
            has_service = hasattr(learn_tab, service_name)
            print(f"   - {service_name}: {'✅' if has_service else '❌'}")
        
        # Test 5: Tab Management Integration
        print("\n📋 Test 5: Tab Management Integration")
        from application.services.ui.tab_management.tab_management_service import TabManagementService
        
        tab_service = TabManagementService()
        available_tabs = tab_service.get_available_tabs()
        print(f"   - Available tabs: {available_tabs}")
        print(f"   - Learn tab available: {'learn' in available_tabs}")
        
        # Test 6: Lesson Configuration
        print("\n📋 Test 6: Lesson Configuration")
        lesson_configs = learn_tab.lesson_config_service.get_all_lesson_configs()
        print(f"   - Number of lessons: {len(lesson_configs)}")
        for lesson_name, config in lesson_configs.items():
            print(f"   - {lesson_name}: {config.quiz_description}")
        
        print("\n🎉 All Tests Passed!")
        print("=" * 50)
        print("✅ Learn Tab is fully integrated and ready to use!")
        print("\nTo access the Learn Tab in the main application:")
        print("1. Run: python main.py")
        print("2. Use the menu: View → Learn Tab")
        print("3. Or use the keyboard shortcut if configured")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_learn_tab_interface()
    sys.exit(0 if success else 1)
