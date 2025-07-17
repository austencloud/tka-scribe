#!/usr/bin/env python3
"""
TKA Application Orchestrator Performance Analyzer

This script instruments the ApplicationOrchestrator to provide detailed timing
analysis of each initialization phase to identify specific bottlenecks.
"""

import sys
import time
from contextlib import contextmanager
from pathlib import Path
from typing import Dict, List, Tuple

import psutil

# Add the modern src directory to Python path
modern_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(modern_src_path))


class OrchestratorProfiler:
    """Profiles ApplicationOrchestrator initialization phases."""

    def __init__(self):
        self.start_time = time.perf_counter()
        self.phases: List[Tuple[str, float, float, float]] = []
        self.process = psutil.Process()
        self.initial_memory = self.process.memory_info().rss / 1024 / 1024

    @contextmanager
    def profile_phase(self, phase_name: str):
        """Context manager to profile a phase."""
        phase_start = time.perf_counter()
        memory_start = self.process.memory_info().rss / 1024 / 1024

        elapsed = phase_start - self.start_time
        print(f"🔄 [{elapsed:.1f}s] Starting: {phase_name}")

        try:
            yield
        finally:
            phase_end = time.perf_counter()
            memory_end = self.process.memory_info().rss / 1024 / 1024

            duration = phase_end - phase_start
            memory_delta = memory_end - memory_start
            elapsed_total = phase_end - self.start_time

            self.phases.append((phase_name, elapsed_total, duration, memory_delta))

            print(
                f"✅ [{elapsed_total:.1f}s] Completed: {phase_name} ({duration*1000:.1f}ms, {memory_delta:.1f}MB)"
            )

    def print_summary(self):
        """Print detailed summary."""
        total_time = time.perf_counter() - self.start_time
        final_memory = self.process.memory_info().rss / 1024 / 1024
        total_memory = final_memory - self.initial_memory

        print("\n" + "=" * 100)
        print("🚀 APPLICATION ORCHESTRATOR PERFORMANCE ANALYSIS")
        print("=" * 100)
        print(f"Total time: {total_time:.2f} seconds")
        print(f"Total memory: {total_memory:.1f}MB")
        print()

        print("📊 Phase Breakdown:")
        print("-" * 100)
        print(
            f"{'Phase':<50} {'Start':<8} {'Duration':<12} {'Memory':<10} {'% Total':<8}"
        )
        print("-" * 100)

        for phase_name, elapsed_total, duration, memory_delta in self.phases:
            percentage = (duration / total_time) * 100
            print(
                f"{phase_name:<50} {elapsed_total:>6.1f}s {duration*1000:>8.1f}ms {memory_delta:>6.1f}MB {percentage:>6.1f}%"
            )

        print("-" * 100)

        # Identify bottlenecks
        print("\n🔍 Performance Bottlenecks (>500ms or >5%):")
        bottlenecks = [
            (name, duration)
            for name, _, duration, _ in self.phases
            if duration > 0.5 or (duration / total_time) * 100 > 5.0
        ]

        if bottlenecks:
            for i, (phase_name, duration) in enumerate(
                sorted(bottlenecks, key=lambda x: x[1], reverse=True)
            ):
                percentage = (duration / total_time) * 100
                print(f"  {i+1}. {phase_name}: {duration:.2f}s ({percentage:.1f}%)")


def monkey_patch_orchestrator_for_profiling(profiler):
    """Monkey patch the ApplicationOrchestrator to add timing instrumentation."""

    # Import the classes we need to patch
    from application.services.core.application_orchestrator import (
        ApplicationOrchestrator,
    )
    from application.services.pictograph_pool_manager import PictographPoolManager
    from application.services.ui.ui_setup_manager import UISetupManager

    # Store original methods
    original_initialize_application = ApplicationOrchestrator.initialize_application
    original_setup_main_ui = UISetupManager.setup_main_ui
    original_initialize_pool = PictographPoolManager.initialize_pool

    def instrumented_initialize_application(
        self,
        main_window,
        splash_screen=None,
        target_screen=None,
        parallel_mode=False,
        parallel_geometry=None,
    ):
        """Instrumented version of initialize_application."""

        with profiler.profile_phase("Create progress callback"):
            progress_callback = self._create_progress_callback(splash_screen)

        with profiler.profile_phase("Application lifecycle initialization"):
            self.lifecycle_manager.initialize_application(
                main_window,
                target_screen,
                parallel_mode,
                parallel_geometry,
                progress_callback,
            )

        with profiler.profile_phase("Dependency injection setup"):
            from core.dependency_injection.di_container import get_container

            if progress_callback:
                progress_callback(45, "Configuring dependency injection...")
            self.container = get_container()

        with profiler.profile_phase("Service registration"):
            if progress_callback:
                progress_callback(50, "Registering application services...")
            self.service_manager.register_all_services(self.container)
            if progress_callback:
                progress_callback(55, "Services configured")

        with profiler.profile_phase("Pictograph pool initialization"):
            try:
                pool_manager = self.container.resolve(PictographPoolManager)
                pool_manager.initialize_pool(progress_callback=progress_callback)
            except Exception as e:
                print(f"❌ Failed to initialize pictograph pool: {e}")
                if progress_callback:
                    progress_callback(59, "❌ Pictograph pool initialization failed")

        with profiler.profile_phase("UI setup (complete)"):
            if progress_callback:
                progress_callback(60, "Initializing user interface...")
            self.tab_widget = self.ui_manager.setup_main_ui(
                main_window,
                self.container,
                progress_callback,
                self.lifecycle_manager.session_service,
            )

        with profiler.profile_phase("Session restoration"):
            if progress_callback:
                progress_callback(85, "Restoring session state...")
            self.lifecycle_manager.trigger_deferred_session_restoration()

        with profiler.profile_phase("Background setup"):
            if progress_callback:
                progress_callback(90, "Setting up background...")
            self.background_widget = self.background_manager.setup_background(
                main_window, self.container, progress_callback
            )

        with profiler.profile_phase("Post-layout sizing"):
            if progress_callback:
                progress_callback(100, "Application ready!")
            self._trigger_post_layout_sizing(main_window)

        return self.tab_widget

    def instrumented_setup_main_ui(
        self, main_window, container, progress_callback=None, session_service=None
    ):
        """Instrumented version of setup_main_ui."""

        with profiler.profile_phase("UI - Create central widget"):
            if progress_callback:
                progress_callback(65, "Creating central widget...")
            from PyQt6.QtWidgets import QVBoxLayout, QWidget

            central_widget = QWidget()
            central_widget.setStyleSheet("background: transparent;")
            main_window.setCentralWidget(central_widget)

        with profiler.profile_phase("UI - Setup main layout"):
            if progress_callback:
                progress_callback(67, "Setting up main layout...")
            layout = QVBoxLayout(central_widget)
            layout.setContentsMargins(0, 0, 0, 0)
            layout.setSpacing(0)

        with profiler.profile_phase("UI - Create menu bar"):
            if progress_callback:
                progress_callback(68, "Creating menu bar...")
            from presentation.components.menu_bar.menu_bar_widget import MenuBarWidget

            size_provider = lambda: main_window.size()
            self.menu_bar = MenuBarWidget(
                parent=central_widget, size_provider=size_provider
            )
            layout.addWidget(self.menu_bar)

        with profiler.profile_phase("UI - Create tab widget"):
            if progress_callback:
                progress_callback(70, "Creating tab interface...")
            self.tab_widget = self.create_tab_widget()
            layout.addWidget(self.tab_widget)

        with profiler.profile_phase("UI - Initialize tab management"):
            if progress_callback:
                progress_callback(72, "Initializing tab management...")
            self.tab_management_service.initialize_tabs(self.tab_widget, container)

        with profiler.profile_phase("UI - Load construct tab"):
            if progress_callback:
                progress_callback(75, "Preparing construct tab (lazy loading)...")
            self._setup_lazy_construct_tab(
                container, progress_callback, session_service
            )

        with profiler.profile_phase("UI - Connect menu bar signals"):
            if progress_callback:
                progress_callback(90, "Connecting menu bar signals...")
            self._connect_menu_bar_signals()

        with profiler.profile_phase("UI - Finalize interface"):
            if progress_callback:
                progress_callback(95, "Finalizing interface...")

        return self.tab_widget

    def instrumented_initialize_pool(self, progress_callback=None):
        """Instrumented version of initialize_pool."""
        with profiler.profile_phase("Pool - Initialization"):
            self._progress_callback = progress_callback
            with self._lock:
                self._initialize_pool_internal()

    # Apply monkey patches
    ApplicationOrchestrator.initialize_application = instrumented_initialize_application
    UISetupManager.setup_main_ui = instrumented_setup_main_ui
    PictographPoolManager.initialize_pool = instrumented_initialize_pool


def analyze_orchestrator_performance():
    """Run orchestrator performance analysis."""
    profiler = OrchestratorProfiler()

    try:
        # Basic setup
        with profiler.profile_phase("PyQt6 imports"):
            from PyQt6.QtGui import QGuiApplication
            from PyQt6.QtWidgets import QApplication

        with profiler.profile_phase("QApplication creation"):
            app = QApplication.instance()
            if not app:
                app = QApplication(sys.argv)
                app.setStyle("Fusion")

        with profiler.profile_phase("Application factory setup"):
            from core.application.application_factory import (
                ApplicationFactory,
                ApplicationMode,
            )

            container = ApplicationFactory.create_app(ApplicationMode.PRODUCTION)

        with profiler.profile_phase("Service locator initialization"):
            try:
                from core.service_locator import initialize_services

                initialize_services()
            except Exception as e:
                print(f"Warning: Service initialization failed: {e}")

        with profiler.profile_phase("Screen detection"):
            screens = QGuiApplication.screens()
            target_screen = (
                screens[1] if len(screens) > 1 else QGuiApplication.primaryScreen()
            )

        with profiler.profile_phase("Splash screen creation"):
            from presentation.components.ui.splash_screen import SplashScreen

            splash = SplashScreen(target_screen=target_screen)

        # Apply monkey patches for detailed instrumentation
        monkey_patch_orchestrator_for_profiling(profiler)

        with profiler.profile_phase("TKAMainWindow creation"):
            from src.desktop.modern.main import TKAMainWindow

            window = TKAMainWindow(
                container=container,
                splash_screen=splash,
                target_screen=target_screen,
                parallel_mode=False,
                parallel_geometry=None,
            )

        print("🎉 Orchestrator analysis complete!")

    except Exception as e:
        print(f"❌ Error during orchestrator analysis: {e}")
        import traceback

        traceback.print_exc()

    finally:
        profiler.print_summary()


if __name__ == "__main__":
    print("🔍 Starting TKA Application Orchestrator performance analysis...")
    print("This will provide detailed timing of each orchestrator phase.")
    print()

    analyze_orchestrator_performance()
