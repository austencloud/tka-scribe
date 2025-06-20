"""
Unified Web Server Manager for TKA Launcher
Manages all web applications through a single interface with auto-resolution.
"""

import subprocess
import sys
import time
import socket
import threading
import webbrowser
from pathlib import Path
from typing import Dict, Optional, List
import json
import tempfile
import os


class UnifiedWebServer:
    """Manages all web applications through a single unified interface."""

    def __init__(self):
        self.servers: Dict[str, subprocess.Popen] = {}
        self.server_ports: Dict[str, int] = {}
        self.unified_port = None
        self.unified_server = None

        # Default ports for each app
        self.default_ports = {
            "web": 5173,
            "landing": 5174,
            "animator": 5175,
            "unified": 8080,
        }

        # Get the monorepo root
        launcher_dir = Path(__file__).parent
        potential_monorepo_root = launcher_dir.parent.parent.parent
        if (potential_monorepo_root / "apps").exists():
            self.monorepo_root = potential_monorepo_root
        else:
            self.monorepo_root = launcher_dir.parent.parent

        self.apps_dir = self.monorepo_root / "apps"

    def find_available_port(self, preferred_port: int) -> int:
        """Find an available port, starting with the preferred port."""
        port = preferred_port
        while port < preferred_port + 100:
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.bind(("localhost", port))
                    return port
            except OSError:
                port += 1
        raise RuntimeError(
            f"Could not find available port starting from {preferred_port}"
        )

    def is_server_running(self, app_name: str) -> bool:
        """Check if a server is running."""
        if app_name not in self.servers:
            return False
        process = self.servers[app_name]
        return process.poll() is None

    def start_individual_server(self, app_name: str) -> Optional[int]:
        """Start an individual web app server."""
        if self.is_server_running(app_name):
            return self.server_ports.get(app_name)

        app_path = self.apps_dir / app_name
        if not app_path.exists():
            print(f"❌ App directory not found: {app_path}")
            return None

        try:
            # Find available port
            preferred_port = self.default_ports.get(app_name, 5173)
            port = self.find_available_port(preferred_port)

            # Start the development server
            env = {**os.environ, "PORT": str(port), "HOST": "localhost"}

            process = subprocess.Popen(
                ["npm", "run", "dev", "--", "--port", str(port), "--host", "localhost"],
                cwd=app_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                env=env,
                creationflags=(
                    subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0
                ),
            )

            self.servers[app_name] = process
            self.server_ports[app_name] = port

            print(f"✅ Started {app_name} server on port {port}")
            return port

        except Exception as e:
            print(f"❌ Failed to start {app_name} server: {e}")
            return None

    def create_unified_interface(self) -> str:
        """Create a unified HTML interface that embeds all web apps."""
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TKA - The Kinetic Constructor</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }}
        
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        
        .header h1 {{
            font-size: 1.5rem;
            font-weight: 600;
        }}
        
        .nav-tabs {{
            display: flex;
            background: white;
            border-bottom: 1px solid #e0e0e0;
            padding: 0 2rem;
        }}
        
        .nav-tab {{
            padding: 1rem 1.5rem;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            transition: all 0.3s ease;
            font-weight: 500;
        }}
        
        .nav-tab:hover {{
            background: #f8f9fa;
        }}
        
        .nav-tab.active {{
            border-bottom-color: #667eea;
            color: #667eea;
        }}
        
        .content {{
            flex: 1;
            position: relative;
            overflow: hidden;
        }}
        
        .app-frame {{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
            display: none;
        }}
        
        .app-frame.active {{
            display: block;
        }}
        
        .loading {{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: #666;
        }}
        
        .status {{
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            font-size: 0.8rem;
            color: #666;
        }}
        
        .status.success {{ color: #4CAF50; }}
        .status.error {{ color: #f44336; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🎭 The Kinetic Constructor</h1>
    </div>
    
    <div class="nav-tabs">
        <div class="nav-tab active" data-app="web">🌐 Web App</div>
        <div class="nav-tab" data-app="landing">🏠 Landing Page</div>
        <div class="nav-tab" data-app="animator">🎬 Animator</div>
    </div>
    
    <div class="content">
        <iframe id="web-frame" class="app-frame active" src="http://localhost:{self.server_ports.get('web', 5173)}"></iframe>
        <iframe id="landing-frame" class="app-frame" src="http://localhost:{self.server_ports.get('landing', 5174)}"></iframe>
        <iframe id="animator-frame" class="app-frame" src="http://localhost:{self.server_ports.get('animator', 5175)}"></iframe>
        
        <div class="loading" id="loading">
            <div>🔄 Loading applications...</div>
            <div style="margin-top: 1rem; font-size: 0.8rem;">
                Web: {self.server_ports.get('web', 'Starting...')}<br>
                Landing: {self.server_ports.get('landing', 'Starting...')}<br>
                Animator: {self.server_ports.get('animator', 'Starting...')}
            </div>
        </div>
    </div>
    
    <div class="status" id="status">Initializing...</div>
    
    <script>
        // Tab switching
        document.querySelectorAll('.nav-tab').forEach(tab => {{
            tab.addEventListener('click', () => {{
                // Remove active class from all tabs and frames
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.app-frame').forEach(f => f.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding frame
                tab.classList.add('active');
                const appName = tab.dataset.app;
                document.getElementById(appName + '-frame').classList.add('active');
            }});
        }});
        
        // Hide loading after a delay
        setTimeout(() => {{
            document.getElementById('loading').style.display = 'none';
            document.getElementById('status').textContent = 'Ready';
            document.getElementById('status').className = 'status success';
        }}, 3000);
        
        // Auto-refresh iframes if they fail to load
        document.querySelectorAll('.app-frame').forEach(frame => {{
            frame.addEventListener('error', () => {{
                setTimeout(() => {{
                    frame.src = frame.src;
                }}, 5000);
            }});
        }});
    </script>
</body>
</html>
"""

        # Save to temporary file with UTF-8 encoding
        temp_file = tempfile.NamedTemporaryFile(
            mode="w", suffix=".html", delete=False, encoding="utf-8"
        )
        temp_file.write(html_content)
        temp_file.close()

        return temp_file.name

    def start_unified_server(self) -> Optional[str]:
        """Start all servers and create unified interface."""
        print("🚀 Starting TKA unified web interface...")

        # Start all individual servers
        for app_name in ["web", "landing", "animator"]:
            print(f"Starting {app_name}...")
            port = self.start_individual_server(app_name)
            if port:
                print(f"✅ {app_name} running on port {port}")
            else:
                print(f"⚠️  {app_name} failed to start")

        # Wait a moment for servers to initialize
        time.sleep(2)

        # Create unified interface
        html_file = self.create_unified_interface()

        # Open in browser
        url = f"file://{html_file}"
        print(f"🌐 Opening unified interface: {url}")

        return url

    def stop_all_servers(self):
        """Stop all running servers."""
        print("🛑 Stopping all web servers...")

        for app_name, process in self.servers.items():
            if process.poll() is None:
                try:
                    if sys.platform == "win32":
                        subprocess.run(
                            ["taskkill", "/F", "/T", "/PID", str(process.pid)],
                            capture_output=True,
                        )
                    else:
                        process.terminate()
                        process.wait(timeout=5)
                    print(f"✅ Stopped {app_name} server")
                except Exception as e:
                    print(f"⚠️  Error stopping {app_name}: {e}")

        self.servers.clear()
        self.server_ports.clear()

    def open_individual_app(self, app_name: str) -> bool:
        """Open an individual app in the browser."""
        port = self.start_individual_server(app_name)
        if port:
            url = f"http://localhost:{port}"
            print(f"🌐 Opening {app_name}: {url}")
            webbrowser.open(url)
            return True
        return False


# Global instance
_unified_server = None


def get_unified_server() -> UnifiedWebServer:
    """Get the global unified server instance."""
    global _unified_server
    if _unified_server is None:
        _unified_server = UnifiedWebServer()
    return _unified_server
