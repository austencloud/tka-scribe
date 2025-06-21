"""
Premium 2025 Modern Styling for TKA Unified Launcher.
Implements glassmorphism, modern gradients, and premium visual design.
"""


class ModernLauncherStyles:
    """Premium 2025 styling definitions for the launcher."""

    # Premium 2025 Color Palette
    COLORS = {
        # Premium Background Gradients (Enhanced Dark Theme)
        "bg_primary": "#0a0a0f",
        "bg_secondary": "#1a1a2e",
        "bg_tertiary": "#16213e",
        "bg_gradient_primary": "qlineargradient(x1:0, y1:0, x2:1, y2:1, stop:0 #0a0a0f, stop:0.3 #1a1a2e, stop:0.7 #16213e, stop:1 #0f1419)",
        "bg_gradient_secondary": "qlineargradient(x1:0, y1:0, x2:0, y2:1, stop:0 #1e1e2e, stop:0.5 #2a2a3e, stop:1 #1a1a2e)",
        # Advanced Glassmorphic Elements
        "glass_primary": "rgba(255, 255, 255, 0.12)",
        "glass_secondary": "rgba(255, 255, 255, 0.08)",
        "glass_tertiary": "rgba(255, 255, 255, 0.04)",
        "glass_quaternary": "rgba(255, 255, 255, 0.02)",
        "glass_border": "rgba(255, 255, 255, 0.25)",
        "glass_border_subtle": "rgba(255, 255, 255, 0.15)",
        "glass_border_strong": "rgba(255, 255, 255, 0.35)",
        "glass_elevated": "rgba(255, 255, 255, 0.18)",
        # Modern Accent Colors
        "accent_primary": "#6366f1",  # Modern indigo
        "accent_primary_hover": "#7c3aed",  # Purple shift on hover
        "accent_secondary": "#8b5cf6",  # Modern purple
        "accent_success": "#10b981",  # Modern green
        "accent_warning": "#f59e0b",  # Modern amber
        "accent_danger": "#ef4444",  # Modern red
        "accent_info": "#06b6d4",  # Modern cyan
        # Text Colors (High Contrast)
        "text_primary": "#f8fafc",  # High contrast white
        "text_secondary": "#cbd5e1",  # Medium contrast
        "text_tertiary": "#64748b",  # Low contrast
        "text_muted": "#475569",  # Very low contrast
        "text_accent": "#a5b4fc",  # Accent text
        # Interactive States
        "hover_overlay": "rgba(255, 255, 255, 0.1)",
        "active_overlay": "rgba(255, 255, 255, 0.15)",
        "focus_ring": "#6366f1",
        "focus_ring_alpha": "rgba(99, 102, 241, 0.3)",
        # Status Colors
        "status_online": "#10b981",
        "status_offline": "#64748b",
        "status_error": "#ef4444",
        "status_warning": "#f59e0b",
    }

    # Premium Typography System
    FONTS = {
        # Modern font stack with Inter as primary
        "family_primary": "'Inter', 'SF Pro Display', 'Segoe UI Variable', system-ui, sans-serif",
        "family_mono": "'JetBrains Mono', 'SF Mono', 'Cascadia Code', 'Fira Code', monospace",
        # Type scale (16px base)
        "size_xs": "12px",  # 0.75rem
        "size_sm": "14px",  # 0.875rem
        "size_base": "16px",  # 1rem
        "size_lg": "18px",  # 1.125rem
        "size_xl": "20px",  # 1.25rem
        "size_2xl": "24px",  # 1.5rem
        "size_3xl": "30px",  # 1.875rem
        "size_4xl": "36px",  # 2.25rem
        # Font weights
        "weight_light": "300",
        "weight_normal": "400",
        "weight_medium": "500",
        "weight_semibold": "600",
        "weight_bold": "700",
        "weight_extrabold": "800",
    }

    # 8px Grid Spacing System
    SPACING = {
        "0": "0px",
        "1": "4px",  # 0.25rem
        "2": "8px",  # 0.5rem
        "3": "12px",  # 0.75rem
        "4": "16px",  # 1rem
        "5": "20px",  # 1.25rem
        "6": "24px",  # 1.5rem
        "8": "32px",  # 2rem
        "10": "40px",  # 2.5rem
        "12": "48px",  # 3rem
        "16": "64px",  # 4rem
        "20": "80px",  # 5rem
        "24": "96px",  # 6rem
    }

    # Modern Border Radius
    RADIUS = {
        "none": "0px",
        "sm": "6px",
        "md": "8px",
        "lg": "12px",
        "xl": "16px",
        "2xl": "20px",
        "3xl": "24px",
        "full": "9999px",
    }

    # Premium Shadow System
    SHADOWS = {
        "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        "premium": "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
        "glow": "0 0 20px rgba(99, 102, 241, 0.3)",
        "glow_accent": "0 0 30px rgba(139, 92, 246, 0.4)",
        "glass": "0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.05)",
    }

    # Modern Animation System
    ANIMATIONS = {
        "duration_fast": "150ms",
        "duration_normal": "250ms",
        "duration_slow": "350ms",
        "easing_standard": "cubic-bezier(0.4, 0, 0.2, 1)",
        "easing_decelerate": "cubic-bezier(0, 0, 0.2, 1)",
        "easing_accelerate": "cubic-bezier(0.4, 0, 1, 1)",
        "easing_bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    }

    @classmethod
    def get_premium_main_window_style(cls) -> str:
        """Get premium 2025 stylesheet for main window with glassmorphism."""
        return f"""
        QMainWindow {{
            background: {cls.COLORS['bg_gradient_primary']};
            color: {cls.COLORS['text_primary']};
            font-family: {cls.FONTS['family_primary']};
            font-size: {cls.FONTS['size_base']};
            border-radius: {cls.RADIUS['xl']};
        }}

        QWidget {{
            background-color: transparent;
            color: {cls.COLORS['text_primary']};
            font-family: {cls.FONTS['family_primary']};
        }}

        /* Menu Bar Styling */
        QMenuBar {{
            background: {cls.COLORS['glass_primary']};
            color: {cls.COLORS['text_primary']};
            border: none;
            border-bottom: 1px solid {cls.COLORS['glass_border_subtle']};
            padding: {cls.SPACING['2']};
            font-weight: {cls.FONTS['weight_medium']};
        }}

        QMenuBar::item {{
            background: transparent;
            padding: {cls.SPACING['2']} {cls.SPACING['4']};
            border-radius: {cls.RADIUS['sm']};
            margin: 0 {cls.SPACING['1']};
        }}

        QMenuBar::item:selected {{
            background: {cls.COLORS['hover_overlay']};
        }}

        QMenuBar::item:pressed {{
            background: {cls.COLORS['active_overlay']};
        }}

        /* Menu Styling */
        QMenu {{
            background: {cls.COLORS['glass_primary']};
            border: 1px solid {cls.COLORS['glass_border']};
            border-radius: {cls.RADIUS['lg']};
            padding: {cls.SPACING['2']};
            color: {cls.COLORS['text_primary']};
        }}

        QMenu::item {{
            padding: {cls.SPACING['2']} {cls.SPACING['4']};
            border-radius: {cls.RADIUS['sm']};
            margin: {cls.SPACING['1']};
        }}

        QMenu::item:selected {{
            background: {cls.COLORS['hover_overlay']};
        }}

        QMenu::separator {{
            height: 1px;
            background: {cls.COLORS['glass_border_subtle']};
            margin: {cls.SPACING['2']} {cls.SPACING['4']};
        }}
        """

    @classmethod
    def get_premium_app_card_style(cls) -> str:
        """Get premium 2025 stylesheet for application cards with glassmorphism."""
        return f"""
        QPushButton {{
            background: {cls.COLORS['glass_elevated']};
            color: {cls.COLORS['text_primary']};
            border: 1px solid {cls.COLORS['glass_border']};
            border-radius: {cls.RADIUS['2xl']};
            padding: {cls.SPACING['6']};
            font-family: {cls.FONTS['family_primary']};
            font-size: {cls.FONTS['size_base']};
            font-weight: {cls.FONTS['weight_medium']};
            text-align: center;
            min-height: 120px;
            margin: {cls.SPACING['2']};
            /* Qt-compatible styling */
        }}

        QPushButton:hover {{
            background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                stop:0 {cls.COLORS['glass_elevated']},
                stop:1 {cls.COLORS['hover_overlay']});
            border-color: {cls.COLORS['accent_primary']};
            color: {cls.COLORS['text_primary']};
            /* Qt hover effects */
        }}

        QPushButton:pressed {{
            background: {cls.COLORS['active_overlay']};
            border-color: {cls.COLORS['accent_primary_hover']};
            /* Qt pressed state */
        }}

        QPushButton:focus {{
            border: 2px solid {cls.COLORS['focus_ring']};
            outline: none;
        }}

        QPushButton:disabled {{
            background: {cls.COLORS['glass_tertiary']};
            color: {cls.COLORS['text_muted']};
            border-color: {cls.COLORS['glass_border_subtle']};
        }}
        """

    @classmethod
    def get_premium_button_style(cls, variant: str = "primary") -> str:
        """Get premium 2025 stylesheet for buttons."""
        if variant == "primary":
            bg_color = cls.COLORS["accent_primary"]
            bg_hover = cls.COLORS["accent_primary_hover"]
            text_color = cls.COLORS["text_primary"]
        elif variant == "secondary":
            bg_color = cls.COLORS["glass_primary"]
            bg_hover = cls.COLORS["hover_overlay"]
            text_color = cls.COLORS["text_primary"]
        elif variant == "ghost":
            bg_color = "transparent"
            bg_hover = cls.COLORS["hover_overlay"]
            text_color = cls.COLORS["text_secondary"]
        else:
            bg_color = cls.COLORS["glass_secondary"]
            bg_hover = cls.COLORS["hover_overlay"]
            text_color = cls.COLORS["text_primary"]

        return f"""
        QPushButton {{
            background: {bg_color};
            color: {text_color};
            border: 1px solid {cls.COLORS['glass_border_subtle']};
            border-radius: {cls.RADIUS['lg']};
            padding: {cls.SPACING['3']} {cls.SPACING['6']};
            font-family: {cls.FONTS['family_primary']};
            font-size: {cls.FONTS['size_base']};
            font-weight: {cls.FONTS['weight_medium']};
            min-height: 40px;
        }}

        QPushButton:hover {{
            background: {bg_hover};
            border-color: {cls.COLORS['glass_border']};
        }}

        QPushButton:pressed {{
            background: {cls.COLORS['active_overlay']};
        }}

        QPushButton:focus {{
            border: 2px solid {cls.COLORS['focus_ring']};
            outline: none;
        }}

        QPushButton:disabled {{
            background: {cls.COLORS['glass_tertiary']};
            color: {cls.COLORS['text_muted']};
            border-color: {cls.COLORS['glass_border_subtle']};
        }}
        """

    @classmethod
    def get_premium_search_style(cls) -> str:
        """Get premium 2025 stylesheet for search bar."""
        return f"""
        QLineEdit {{
            background: {cls.COLORS['glass_secondary']};
            color: {cls.COLORS['text_primary']};
            border: 1px solid {cls.COLORS['glass_border_subtle']};
            border-radius: {cls.RADIUS['xl']};
            padding: {cls.SPACING['4']} {cls.SPACING['6']};
            font-family: {cls.FONTS['family_primary']};
            font-size: {cls.FONTS['size_lg']};
            font-weight: {cls.FONTS['weight_normal']};
            min-height: 48px;
            margin: {cls.SPACING['6']} {cls.SPACING['8']};
        }}

        QLineEdit:focus {{
            background: {cls.COLORS['glass_primary']};
            border: 2px solid {cls.COLORS['accent_primary']};
            outline: none;
        }}

        QLineEdit::placeholder {{
            color: {cls.COLORS['text_tertiary']};
            font-style: italic;
        }}
        """

    @classmethod
    def get_premium_group_box_style(cls) -> str:
        """Get premium 2025 stylesheet for category group boxes."""
        return f"""
        QGroupBox {{
            background: transparent;
            color: {cls.COLORS['text_primary']};
            border: none;
            font-family: {cls.FONTS['family_primary']};
            font-size: {cls.FONTS['size_xl']};
            font-weight: {cls.FONTS['weight_semibold']};
            margin-top: {cls.SPACING['6']};
            padding-top: {cls.SPACING['8']};
        }}

        QGroupBox::title {{
            subcontrol-origin: margin;
            left: {cls.SPACING['4']};
            padding: 0 {cls.SPACING['3']} 0 {cls.SPACING['3']};
            color: {cls.COLORS['text_accent']};
        }}
        """

    @classmethod
    def get_premium_docked_style(cls) -> str:
        """Get premium 2025 stylesheet for docked sidebar mode."""
        return f"""
        QWidget {{
            background: {cls.COLORS['bg_gradient_secondary']};
            color: {cls.COLORS['text_primary']};
            border: none;
            border-right: 2px solid {cls.COLORS['glass_border_strong']};
            /* Qt-compatible glass effect simulation */
        }}

        QPushButton {{
            background: {cls.COLORS['glass_elevated']};
            color: {cls.COLORS['text_primary']};
            border: 1px solid {cls.COLORS['glass_border']};
            border-radius: {cls.RADIUS['xl']};
            padding: {cls.SPACING['3']};
            margin: {cls.SPACING['2']};
            font-size: {cls.FONTS['size_sm']};
            font-weight: {cls.FONTS['weight_semibold']};
            text-align: center;
            /* Qt-compatible glass effect */
        }}

        QPushButton:hover {{
            background: {cls.COLORS['hover_overlay']};
            border-color: {cls.COLORS['accent_primary']};
        }}

        QPushButton:pressed {{
            background: {cls.COLORS['active_overlay']};
        }}

        QPushButton:focus {{
            border: 2px solid {cls.COLORS['focus_ring']};
            outline: none;
        }}

        /* Active state indicator */
        QPushButton[active="true"] {{
            background: {cls.COLORS['accent_primary']};
            border-color: {cls.COLORS['accent_primary']};
        }}

        QPushButton[active="true"]:hover {{
            background: {cls.COLORS['accent_primary_hover']};
        }}
        """

    @classmethod
    def get_premium_tooltip_style(cls) -> str:
        """Get premium 2025 stylesheet for tooltips."""
        return f"""
        QToolTip {{
            background: {cls.COLORS['glass_primary']};
            color: {cls.COLORS['text_primary']};
            border: 1px solid {cls.COLORS['glass_border']};
            border-radius: {cls.RADIUS['lg']};
            padding: {cls.SPACING['2']} {cls.SPACING['4']};
            font-family: {cls.FONTS['family_primary']};
            font-size: {cls.FONTS['size_sm']};
            font-weight: {cls.FONTS['weight_medium']};
        }}
        """

    @classmethod
    def get_premium_scroll_area_style(cls) -> str:
        """Get premium 2025 stylesheet for scroll areas."""
        return f"""
        QScrollArea {{
            background: transparent;
            border: none;
        }}

        QScrollBar:vertical {{
            background: {cls.COLORS['glass_tertiary']};
            width: 8px;
            border-radius: 4px;
            margin: 0;
        }}

        QScrollBar::handle:vertical {{
            background: {cls.COLORS['glass_border']};
            border-radius: 4px;
            min-height: 20px;
        }}

        QScrollBar::handle:vertical:hover {{
            background: {cls.COLORS['hover_overlay']};
        }}

        QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
            height: 0;
            width: 0;
        }}

        QScrollBar::add-page:vertical, QScrollBar::sub-page:vertical {{
            background: transparent;
        }}
        """

    @classmethod
    def get_premium_animated_button_style(cls, variant: str = "primary") -> str:
        """Get premium 2025 animated button stylesheet with micro-interactions."""
        if variant == "primary":
            bg_color = cls.COLORS["accent_primary"]
            bg_hover = cls.COLORS["accent_primary_hover"]
            text_color = cls.COLORS["text_primary"]
            shadow = cls.SHADOWS["glow"]
        elif variant == "secondary":
            bg_color = cls.COLORS["glass_elevated"]
            bg_hover = cls.COLORS["hover_overlay"]
            text_color = cls.COLORS["text_primary"]
            shadow = cls.SHADOWS["glass"]
        else:
            bg_color = cls.COLORS["glass_secondary"]
            bg_hover = cls.COLORS["hover_overlay"]
            text_color = cls.COLORS["text_primary"]
            shadow = cls.SHADOWS["md"]

        return f"""
        QPushButton {{
            background: {bg_color};
            color: {text_color};
            border: 1px solid {cls.COLORS['glass_border']};
            border-radius: {cls.RADIUS['xl']};
            padding: {cls.SPACING['4']} {cls.SPACING['6']};
            font-family: {cls.FONTS['family_primary']};
            font-size: {cls.FONTS['size_base']};
            font-weight: {cls.FONTS['weight_semibold']};
            min-height: 48px;
        }}

        QPushButton:hover {{
            background: {bg_hover};
            border-color: {cls.COLORS['accent_primary']};
        }}

        QPushButton:pressed {{
            background: {cls.COLORS['active_overlay']};
        }}

        QPushButton:focus {{
            border: 2px solid {cls.COLORS['focus_ring']};
            outline: none;
        }}

        QPushButton:disabled {{
            background: {cls.COLORS['glass_tertiary']};
            color: {cls.COLORS['text_muted']};
            border-color: {cls.COLORS['glass_border_subtle']};
        }}
        """
