"""
Web Server Manager for TKA Launcher
Handles automatic startup and management of web development servers.
"""

import subprocess
import sys
import time
import socket
import threading
from pathlib import Path
from typing import Dict, Optional, Callable
from PyQt6.QtCore import QObject, pyqtSignal, QTimer
import psutil


class WebServerManager(QObject):
    """Manages web development servers for the launcher."""

    # Signals
    server_started = pyqtSignal(str, str, int)  # app_name, url, port
    server_stopped = pyqtSignal(str)  # app_name
    server_error = pyqtSignal(str, str)  # app_name, error_message
    server_output = pyqtSignal(str, str)  # app_name, output_line

    def __init__(self):
        super().__init__()
        self.servers: Dict[str, subprocess.Popen] = {}
        self.server_ports: Dict[str, int] = {}
        self.server_urls: Dict[str, str] = {}
        self.output_threads: Dict[str, threading.Thread] = {}

        # Default ports for each app
        self.default_ports = {"web": 5173, "landing": 5174, "animator": 5175}

        # Get the monorepo root - check if we're in new or old structure
        launcher_dir = Path(__file__).parent

        # Check if we're in the new monorepo structure
        potential_monorepo_root = launcher_dir.parent.parent.parent
        if (potential_monorepo_root / "apps").exists():
            # New monorepo structure: launcher is in apps/desktop/launcher/
            self.monorepo_root = potential_monorepo_root
        else:
            # Old structure: launcher is in tka-desktop/launcher/
            # Monorepo root is one level up from tka-desktop
            self.monorepo_root = launcher_dir.parent.parent

    def find_available_port(self, preferred_port: int) -> int:
        """Find an available port, starting with the preferred port."""
        port = preferred_port
        while port < preferred_port + 100:  # Try up to 100 ports
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.bind(("localhost", port))
                    return port
            except OSError:
                port += 1

        raise RuntimeError(
            f"Could not find available port starting from {preferred_port}"
        )

    def start_server(self, app_name: str) -> bool:
        """Start a development server for the specified app."""
        if app_name in self.servers:
            # Server already running
            return True

        try:
            # Find available port
            preferred_port = self.default_ports.get(app_name, 5173)
            port = self.find_available_port(preferred_port)

            # Determine app path
            app_path = self.monorepo_root / "apps" / app_name
            if not app_path.exists():
                self.server_error.emit(app_name, f"App directory not found: {app_path}")
                return False

            # Start the development server
            env = {**subprocess.os.environ, "PORT": str(port), "HOST": "localhost"}

            # Use npm run dev for web apps
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
            self.server_urls[app_name] = f"http://localhost:{port}"

            # Start output monitoring thread
            output_thread = threading.Thread(
                target=self._monitor_server_output,
                args=(app_name, process),
                daemon=True,
            )
            output_thread.start()
            self.output_threads[app_name] = output_thread

            # Wait a moment and check if server started successfully
            QTimer.singleShot(3000, lambda: self._check_server_startup(app_name))

            return True

        except Exception as e:
            self.server_error.emit(app_name, f"Failed to start server: {str(e)}")
            return False

    def stop_server(self, app_name: str) -> bool:
        """Stop the development server for the specified app."""
        if app_name not in self.servers:
            return True

        try:
            process = self.servers[app_name]

            # Terminate the process and its children
            if sys.platform == "win32":
                # On Windows, kill the entire process tree
                subprocess.run(
                    ["taskkill", "/F", "/T", "/PID", str(process.pid)],
                    capture_output=True,
                )
            else:
                # On Unix-like systems
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()

            # Clean up
            del self.servers[app_name]
            if app_name in self.server_ports:
                del self.server_ports[app_name]
            if app_name in self.server_urls:
                del self.server_urls[app_name]

            self.server_stopped.emit(app_name)
            return True

        except Exception as e:
            self.server_error.emit(app_name, f"Failed to stop server: {str(e)}")
            return False

    def stop_all_servers(self):
        """Stop all running servers."""
        for app_name in list(self.servers.keys()):
            self.stop_server(app_name)

    def get_server_url(self, app_name: str) -> Optional[str]:
        """Get the URL for a running server."""
        return self.server_urls.get(app_name)

    def is_server_running(self, app_name: str) -> bool:
        """Check if a server is currently running."""
        if app_name not in self.servers:
            return False

        process = self.servers[app_name]
        return process.poll() is None

    def _monitor_server_output(self, app_name: str, process: subprocess.Popen):
        """Monitor server output in a separate thread."""
        try:
            for line in iter(process.stdout.readline, ""):
                if line:
                    self.server_output.emit(app_name, line.strip())
                if process.poll() is not None:
                    break
        except Exception as e:
            self.server_error.emit(app_name, f"Output monitoring error: {str(e)}")

    def _check_server_startup(self, app_name: str):
        """Check if server started successfully and emit appropriate signal."""
        if not self.is_server_running(app_name):
            self.server_error.emit(app_name, "Server failed to start")
            return

        # Try to connect to the server
        port = self.server_ports.get(app_name)
        if port:
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.settimeout(1)
                    result = s.connect_ex(("localhost", port))
                    if result == 0:
                        url = self.server_urls[app_name]
                        self.server_started.emit(app_name, url, port)
                    else:
                        # Server not ready yet, check again in a moment
                        QTimer.singleShot(
                            2000, lambda: self._check_server_startup(app_name)
                        )
            except Exception:
                # Server not ready yet, check again in a moment
                QTimer.singleShot(2000, lambda: self._check_server_startup(app_name))


# Global instance
_server_manager = None


def get_server_manager() -> WebServerManager:
    """Get the global server manager instance."""
    global _server_manager
    if _server_manager is None:
        _server_manager = WebServerManager()
    return _server_manager
