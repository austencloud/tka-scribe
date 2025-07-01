def apply_modern_panel_styling(panel, color):
    if color == "blue":
        gradient_start = "rgba(74, 144, 226, 0.5)"
        gradient_end = "rgba(74, 144, 226, 0.2)"
        border_color = "rgba(74, 144, 226, 0.6)"
    else:
        gradient_start = "rgba(231, 76, 60, 0.5)"
        gradient_end = "rgba(231, 76, 60, 0.2)"
        border_color = "rgba(231, 76, 60, 0.6)"
    panel.setStyleSheet(
        f"""
        QGroupBox {{
            background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                stop:0 {gradient_start},
                stop:1 {gradient_end});
            border: 2px solid {border_color};
            border-radius: 12px;
            margin-top: 0px;
            padding-top: 8px;
        }}
        """
    )


def apply_turn_button_styling(button, color, turn_value):
    if color == "blue":
        base_color = "74, 144, 226"
        hover_color = "94, 164, 246"
    else:
        base_color = "231, 76, 60"
        hover_color = "251, 96, 80"
    button.setStyleSheet(
        f"""
        QPushButton {{
            background: rgba({base_color}, 0.4);
            border: 2px solid rgba({base_color}, 0.6);
            border-radius: 10px;
            color: rgba(255, 255, 255, 0.95);
            font-size: 14px;
            font-weight: bold;
            padding: 8px;
        }}
        QPushButton:hover {{
            background: rgba({hover_color}, 0.5);
            border-color: rgba({hover_color}, 0.8);
            color: rgba(255, 255, 255, 1.0);
        }}
        QPushButton:pressed {{
            background: rgba({base_color}, 0.6);
            border-color: rgba({base_color}, 1.0);
        }}
        QPushButton:checked {{
            background: rgba({base_color}, 0.8);
            border-color: rgba({base_color}, 1.0);
            color: rgba(255, 255, 255, 1.0);
            font-weight: bold;
        }}
        """
    )
