# TKA Horizontal Launcher

A modern horizontal taskbar launcher that overlays your system taskbar for quick application access.

## Quick Start

### Windows
Double-click `start_horizontal_launcher.bat`

### Python
```bash
python start_horizontal_launcher.py
```

## Features

### 🎯 **Horizontal Taskbar Overlay**
- Overlays your system taskbar at the bottom of the screen
- Horizontal layout flowing left to right
- Desktop controls on the left (Start, Desktop, Files)
- Application strip in the center (scrollable)
- System info on the right (clock, status)

### 🎨 **Modern Design**
- Glassmorphism effects with transparency
- Smooth animations and hover effects
- Always-on-top behavior
- Responsive sizing

### 🔄 **Multi-Mode Support**
- **Horizontal Mode** (default): Taskbar overlay
- **Window Mode**: Traditional vertical window
- **System Tray**: Right-click tray icon to switch modes

### ⚙️ **Configuration**
- Persistent mode preferences
- Auto-hide support (configurable)
- Taskbar overlay toggle
- Theme customization

## Usage

### System Tray Integration
After starting, look for the TKA icon in your system tray:
- **Double-click**: Toggle launcher visibility
- **Right-click**: Access mode switching and options

### Mode Switching
Right-click the system tray icon and select:
- **Horizontal Taskbar**: Bottom overlay mode (default)
- **Vertical Window**: Traditional launcher window

### Desktop Controls (Left Side)
- **⊞ (Start)**: TKA Menu access
- **🖥 (Desktop)**: Show desktop
- **📁 (Files)**: File manager

### Application Strip (Center)
- **Scroll**: Use mouse wheel or drag to scroll through apps
- **Click**: Launch application
- **Hover**: See application name

### System Tray (Right Side)
- **Clock**: Current time and date
- **Status**: System status indicator

## Configuration Files

The launcher uses JSON configuration stored in:
```
launcher/config/launcher_config.json
```

### Key Settings
```json
{
  "window": {
    "mode": "horizontal",
    "launcher_type": "horizontal", 
    "taskbar_overlay": true,
    "auto_hide": false
  },
  "theme": {
    "theme": "dark",
    "transparency": 0.95,
    "glassmorphism_enabled": true
  }
}
```

## Architecture

### Main Components
- **`horizontal_launcher.py`**: Core horizontal launcher implementation
- **`unified_launcher.py`**: Multi-mode launcher coordinator  
- **`launcher_config.py`**: Configuration management
- **`start_horizontal_launcher.py`**: Entry point script

### Class Structure
```
TKAUnifiedLauncher
├── TKAHorizontalLauncher (horizontal mode)
│   ├── DesktopControlPanel (left side)
│   ├── HorizontalApplicationStrip (center)
│   └── SystemTrayArea (right side)
└── TKAModernWindow (vertical mode)
```

## Customization

### Changing Default Mode
Edit `launcher_config.py`:
```python
mode: str = "horizontal"  # "window", "docked", or "horizontal"
launcher_type: str = "horizontal"  # "vertical" or "horizontal"
```

### Styling Customization
Modify glassmorphism effects in `horizontal_launcher.py`:
```python
background: qlineargradient(
    x1: 0, y1: 0, x2: 1, y2: 0,
    stop: 0 rgba(0, 0, 0, 0.8),     # Left transparency
    stop: 0.5 rgba(20, 20, 30, 0.85), # Center
    stop: 1 rgba(0, 0, 0, 0.8)      # Right transparency
);
```

### Adding Applications
The launcher automatically detects applications through the TKA integration system. Applications appear as square buttons in the center strip.

## Development

### Testing
```bash
# Test horizontal launcher only
python horizontal_launcher.py

# Test unified launcher with mode switching
python unified_launcher.py
```

### Adding New Modes
1. Create new launcher class implementing the interface
2. Add mode option to `launcher_config.py`
3. Integrate into `unified_launcher.py`

## Troubleshooting

### Launcher Not Appearing
- Check system tray for TKA icon
- Try right-click → "Show Launcher"
- Verify Python dependencies are installed

### Performance Issues
- Disable animations: Set `animations_enabled: false` in config
- Reduce transparency: Lower `transparency` value in config
- Disable glassmorphism: Set `glassmorphism_enabled: false`

### Always-On-Top Issues
The launcher uses these Qt flags for overlay behavior:
```python
Qt.WindowType.FramelessWindowHint |
Qt.WindowType.WindowStaysOnTopHint |
Qt.WindowType.Tool |
Qt.WindowType.X11BypassWindowManagerHint
```

If it doesn't stay on top, your window manager may need adjustment.

## Requirements

- Python 3.8+
- PyQt6
- TKA application integration system

## License

Part of the TKA (The Kinetic Armory) application suite.
