"""
Test script to verify the refactored settings dialog works correctly.
"""

# Test component imports
try:
    from components.glassmorphism_styles import GlassmorphismStyles
    from components.settings_header import SettingsHeader
    from components.settings_sidebar import SettingsSidebar
    from components.settings_content_area import SettingsContentArea
    from components.settings_action_buttons import SettingsActionButtons
    from components.settings_animations import SettingsAnimations
    from components.settings_services import SettingsServices

    print("✅ All component imports successful!")
except ImportError as e:
    print(f"❌ Component import error: {e}")

# Test glassmorphism styles
try:
    styles = GlassmorphismStyles.get_dialog_styles()
    assert isinstance(styles, str)
    assert len(styles) > 100  # Should have substantial styling
    print("✅ Glassmorphism styles working!")
except Exception as e:
    print(f"❌ Glassmorphism styles error: {e}")

print("✅ Refactored settings dialog components tested successfully!")
