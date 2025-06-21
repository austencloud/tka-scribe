#!/usr/bin/env python3
"""
Comprehensive test for the modernized TKA Unified Launcher.

Tests all the 2025 premium features:
- State persistence & smart initialization
- Responsive layout system
- Premium glassmorphism design
- Modern design system implementation
- VS Code debug session termination
"""

import sys
import time
from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import QTimer

def test_launcher_initialization():
    """Test launcher initialization and component setup."""
    print("🔧 Testing Launcher Initialization")
    print("=" * 50)
    
    try:
        # Import the launcher
        sys.path.insert(0, "launcher")
        from main import UnifiedLauncherApp
        
        # Create launcher instance
        launcher = UnifiedLauncherApp([])
        
        # Test component initialization
        components = [
            ("Settings Manager", hasattr(launcher, 'settings_manager')),
            ("App Manager", hasattr(launcher, 'app_manager')),
            ("State Manager", hasattr(launcher, 'state_manager')),
            ("Main Window", hasattr(launcher, 'main_window')),
        ]
        
        for name, exists in components:
            status = "✅" if exists else "❌"
            print(f"   {status} {name}")
        
        return launcher
        
    except Exception as e:
        print(f"❌ Initialization failed: {e}")
        return None

def test_state_persistence(launcher):
    """Test state persistence functionality."""
    print("\n🔄 Testing State Persistence")
    print("=" * 50)
    
    if not launcher:
        print("❌ No launcher instance available")
        return
    
    try:
        # Test settings manager
        settings = launcher.settings_manager
        
        # Test window state methods
        has_save_method = hasattr(settings, 'save_window_state')
        has_get_method = hasattr(settings, 'get_window_state')
        has_restore_method = hasattr(settings, 'should_restore_to_docked')
        
        print(f"   {'✅' if has_save_method else '❌'} Save window state method")
        print(f"   {'✅' if has_get_method else '❌'} Get window state method")
        print(f"   {'✅' if has_restore_method else '❌'} Restore to docked method")
        
        # Test state restoration
        window_state = settings.get_window_state()
        print(f"   ✅ Window state retrieved: {window_state['mode']}")
        
    except Exception as e:
        print(f"❌ State persistence test failed: {e}")

def test_responsive_layout(launcher):
    """Test responsive layout system."""
    print("\n📱 Testing Responsive Layout")
    print("=" * 50)
    
    if not launcher or not launcher.main_window:
        print("❌ No main window available")
        return
    
    try:
        window = launcher.main_window
        
        # Test window mode
        window.switch_to_window_mode()
        time.sleep(0.1)
        
        window_geom = window.geometry()
        print(f"   ✅ Window mode: {window_geom.width()}x{window_geom.height()}")
        
        # Test responsive methods in window widget
        if hasattr(window, 'window_widget') and window.window_widget:
            widget = window.window_widget
            
            has_responsive_margins = hasattr(widget, '_update_responsive_margins')
            has_responsive_columns = hasattr(widget, '_calculate_responsive_columns')
            has_resize_handler = hasattr(widget, '_on_resize')
            
            print(f"   {'✅' if has_responsive_margins else '❌'} Responsive margins")
            print(f"   {'✅' if has_responsive_columns else '❌'} Responsive columns")
            print(f"   {'✅' if has_resize_handler else '❌'} Resize handler")
        
    except Exception as e:
        print(f"❌ Responsive layout test failed: {e}")

def test_glassmorphism_design(launcher):
    """Test premium glassmorphism design implementation."""
    print("\n✨ Testing Glassmorphism Design")
    print("=" * 50)
    
    try:
        # Import styles
        from launcher.ui.styles import ModernLauncherStyles
        
        # Test enhanced color palette
        colors = ModernLauncherStyles.COLORS
        required_colors = [
            'glass_elevated', 'bg_gradient_primary', 'bg_gradient_secondary',
            'glass_border_strong', 'glass_quaternary'
        ]
        
        for color in required_colors:
            exists = color in colors
            print(f"   {'✅' if exists else '❌'} {color}")
        
        # Test animation system
        animations = ModernLauncherStyles.ANIMATIONS
        required_animations = [
            'duration_fast', 'duration_normal', 'easing_standard'
        ]
        
        for animation in required_animations:
            exists = animation in animations
            print(f"   {'✅' if exists else '❌'} {animation}")
        
        # Test enhanced shadows
        shadows = ModernLauncherStyles.SHADOWS
        enhanced_shadows = ['glow_accent', 'glass']
        
        for shadow in enhanced_shadows:
            exists = shadow in shadows
            print(f"   {'✅' if exists else '❌'} {shadow}")
        
    except Exception as e:
        print(f"❌ Glassmorphism design test failed: {e}")

def test_mode_switching(launcher):
    """Test mode switching functionality."""
    print("\n🔄 Testing Mode Switching")
    print("=" * 50)
    
    if not launcher or not launcher.main_window:
        print("❌ No main window available")
        return
    
    try:
        window = launcher.main_window
        
        # Test window mode
        window.switch_to_window_mode()
        time.sleep(0.1)
        window_mode_ok = window.current_mode == "window"
        print(f"   {'✅' if window_mode_ok else '❌'} Window mode switch")
        
        # Test docked mode
        window.switch_to_docked_mode()
        time.sleep(0.1)
        docked_mode_ok = window.current_mode == "docked"
        print(f"   {'✅' if docked_mode_ok else '❌'} Docked mode switch")
        
        # Test state saving
        has_save_state = hasattr(window, '_save_current_window_state')
        print(f"   {'✅' if has_save_state else '❌'} State saving method")
        
    except Exception as e:
        print(f"❌ Mode switching test failed: {e}")

def test_vs_code_termination(launcher):
    """Test VS Code debug session termination."""
    print("\n🛑 Testing VS Code Termination")
    print("=" * 50)
    
    if not launcher:
        print("❌ No launcher instance available")
        return
    
    try:
        # Test signal handlers
        has_signal_setup = hasattr(launcher, '_setup_signal_handlers')
        has_cleanup = hasattr(launcher, '_cleanup')
        has_quit_method = hasattr(launcher, 'quit')
        
        print(f"   {'✅' if has_signal_setup else '❌'} Signal handlers setup")
        print(f"   {'✅' if has_cleanup else '❌'} Cleanup method")
        print(f"   {'✅' if has_quit_method else '❌'} Graceful quit method")
        
        # Test Qt application setup
        app_name = launcher.app.applicationName()
        app_version = launcher.app.applicationVersion()
        
        print(f"   ✅ Application name: {app_name}")
        print(f"   ✅ Application version: {app_version}")
        
    except Exception as e:
        print(f"❌ VS Code termination test failed: {e}")

def main():
    """Run all modernization tests."""
    print("🚀 TKA UNIFIED LAUNCHER - MODERNIZATION TEST SUITE")
    print("=" * 60)
    
    # Initialize launcher
    launcher = test_launcher_initialization()
    
    if launcher:
        # Run all tests
        test_state_persistence(launcher)
        test_responsive_layout(launcher)
        test_glassmorphism_design(launcher)
        test_mode_switching(launcher)
        test_vs_code_termination(launcher)
        
        # Cleanup
        launcher.main_window.close()
        launcher.app.quit()
    
    print("\n🎉 MODERNIZATION TEST SUITE COMPLETE!")
    print("=" * 60)

if __name__ == "__main__":
    main()
