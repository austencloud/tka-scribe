#!/usr/bin/env python3
"""
TKA Startup Performance Analyzer

This script instruments the TKA startup process to identify performance bottlenecks
and provide detailed timing analysis of each startup phase.
"""

import sys
import time
import psutil
import threading
from pathlib import Path
from typing import Dict, List, Tuple
from contextlib import contextmanager

# Add the modern src directory to Python path
modern_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(modern_src_path))

class StartupProfiler:
    """Profiles TKA startup performance with detailed timing analysis."""
    
    def __init__(self):
        self.start_time = time.perf_counter()
        self.phases: List[Tuple[str, float, float, float]] = []  # name, start, duration, memory
        self.current_phase = None
        self.current_phase_start = None
        self.process = psutil.Process()
        self.initial_memory = self.process.memory_info().rss / 1024 / 1024
        
    @contextmanager
    def profile_phase(self, phase_name: str):
        """Context manager to profile a startup phase."""
        phase_start = time.perf_counter()
        memory_start = self.process.memory_info().rss / 1024 / 1024
        
        print(f"🔄 Starting phase: {phase_name}")
        
        try:
            yield
        finally:
            phase_end = time.perf_counter()
            memory_end = self.process.memory_info().rss / 1024 / 1024
            
            duration = phase_end - phase_start
            memory_delta = memory_end - memory_start
            elapsed_total = phase_end - self.start_time
            
            self.phases.append((phase_name, elapsed_total, duration, memory_delta))
            
            print(f"✅ Completed phase: {phase_name}")
            print(f"   Duration: {duration*1000:.1f}ms")
            print(f"   Memory delta: {memory_delta:.1f}MB")
            print(f"   Total elapsed: {elapsed_total:.1f}s")
            print()
    
    def print_summary(self):
        """Print a detailed summary of startup performance."""
        total_time = time.perf_counter() - self.start_time
        final_memory = self.process.memory_info().rss / 1024 / 1024
        total_memory = final_memory - self.initial_memory
        
        print("=" * 80)
        print("🚀 TKA STARTUP PERFORMANCE ANALYSIS")
        print("=" * 80)
        print(f"Total startup time: {total_time:.2f} seconds")
        print(f"Total memory usage: {total_memory:.1f}MB")
        print()
        
        print("📊 Phase Breakdown:")
        print("-" * 80)
        print(f"{'Phase':<30} {'Duration':<12} {'Memory':<12} {'% of Total':<12}")
        print("-" * 80)
        
        for phase_name, elapsed_total, duration, memory_delta in self.phases:
            percentage = (duration / total_time) * 100
            print(f"{phase_name:<30} {duration*1000:>8.1f}ms {memory_delta:>8.1f}MB {percentage:>8.1f}%")
        
        print("-" * 80)
        
        # Identify bottlenecks
        print("\n🔍 Performance Bottlenecks:")
        sorted_phases = sorted(self.phases, key=lambda x: x[2], reverse=True)
        for i, (phase_name, _, duration, _) in enumerate(sorted_phases[:5]):
            percentage = (duration / total_time) * 100
            if percentage > 10:  # Phases taking more than 10% of total time
                print(f"  {i+1}. {phase_name}: {duration*1000:.1f}ms ({percentage:.1f}%)")


def analyze_startup_performance():
    """Run TKA startup with detailed performance analysis."""
    profiler = StartupProfiler()
    
    try:
        # Phase 1: Import and setup
        with profiler.profile_phase("Python imports and path setup"):
            from PyQt6.QtWidgets import QApplication
            from PyQt6.QtGui import QGuiApplication
            
        # Phase 2: QApplication creation
        with profiler.profile_phase("QApplication creation"):
            app = QApplication.instance()
            if not app:
                app = QApplication(sys.argv)
                app.setStyle("Fusion")
        
        # Phase 3: Dependency injection setup
        with profiler.profile_phase("Dependency injection setup"):
            from core.application.application_factory import ApplicationFactory, ApplicationMode
            container = ApplicationFactory.create_app(ApplicationMode.PRODUCTION)
        
        # Phase 4: Service initialization
        with profiler.profile_phase("Service initialization"):
            try:
                from core.service_locator import initialize_services
                initialize_services()
            except Exception as e:
                print(f"Warning: Could not initialize services: {e}")
        
        # Phase 5: Screen detection
        with profiler.profile_phase("Screen detection"):
            screens = QGuiApplication.screens()
            target_screen = screens[1] if len(screens) > 1 else QGuiApplication.primaryScreen()
        
        # Phase 6: Splash screen creation
        with profiler.profile_phase("Splash screen creation"):
            from presentation.components.ui.splash_screen import SplashScreen
            splash = SplashScreen(target_screen=target_screen)
        
        # Phase 7: Main window creation (this is where the heavy lifting happens)
        with profiler.profile_phase("Main window creation and initialization"):
            from src.desktop.modern.main import TKAMainWindow
            window = TKAMainWindow(
                container=container,
                splash_screen=splash,
                target_screen=target_screen,
                parallel_mode=False,
                parallel_geometry=None,
            )
        
        print("🎉 Startup analysis complete!")
        
    except Exception as e:
        print(f"❌ Error during startup analysis: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        profiler.print_summary()


if __name__ == "__main__":
    print("🔍 Starting TKA startup performance analysis...")
    print("This will instrument the startup process to identify bottlenecks.")
    print()
    
    analyze_startup_performance()
