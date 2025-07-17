#!/usr/bin/env python3
"""
Detailed TKA Startup Performance Analyzer

This script provides granular timing analysis of the main window initialization
to identify specific bottlenecks within the startup process.
"""

import sys
import time
import psutil
from pathlib import Path
from typing import Dict, List, Tuple
from contextlib import contextmanager

# Add the modern src directory to Python path
modern_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(modern_src_path))

class DetailedStartupProfiler:
    """Provides granular profiling of TKA startup phases."""
    
    def __init__(self):
        self.start_time = time.perf_counter()
        self.phases: List[Tuple[str, float, float, float]] = []
        self.process = psutil.Process()
        self.initial_memory = self.process.memory_info().rss / 1024 / 1024
        
    @contextmanager
    def profile_phase(self, phase_name: str):
        """Context manager to profile a startup phase."""
        phase_start = time.perf_counter()
        memory_start = self.process.memory_info().rss / 1024 / 1024
        
        print(f"🔄 [{time.perf_counter() - self.start_time:.1f}s] Starting: {phase_name}")
        
        try:
            yield
        finally:
            phase_end = time.perf_counter()
            memory_end = self.process.memory_info().rss / 1024 / 1024
            
            duration = phase_end - phase_start
            memory_delta = memory_end - memory_start
            elapsed_total = phase_end - self.start_time
            
            self.phases.append((phase_name, elapsed_total, duration, memory_delta))
            
            print(f"✅ [{elapsed_total:.1f}s] Completed: {phase_name} ({duration*1000:.1f}ms, {memory_delta:.1f}MB)")
    
    def print_summary(self):
        """Print detailed summary focusing on bottlenecks."""
        total_time = time.perf_counter() - self.start_time
        final_memory = self.process.memory_info().rss / 1024 / 1024
        total_memory = final_memory - self.initial_memory
        
        print("\n" + "=" * 100)
        print("🚀 DETAILED TKA STARTUP PERFORMANCE ANALYSIS")
        print("=" * 100)
        print(f"Total startup time: {total_time:.2f} seconds")
        print(f"Total memory usage: {total_memory:.1f}MB")
        print()
        
        # Show all phases with timing
        print("📊 Detailed Phase Breakdown:")
        print("-" * 100)
        print(f"{'Phase':<50} {'Start':<8} {'Duration':<12} {'Memory':<10} {'% Total':<8}")
        print("-" * 100)
        
        for phase_name, elapsed_total, duration, memory_delta in self.phases:
            percentage = (duration / total_time) * 100
            print(f"{phase_name:<50} {elapsed_total:>6.1f}s {duration*1000:>8.1f}ms {memory_delta:>6.1f}MB {percentage:>6.1f}%")
        
        print("-" * 100)
        
        # Identify major bottlenecks (>1 second or >5% of total time)
        print("\n🔍 Major Performance Bottlenecks (>1s or >5%):")
        bottlenecks = [(name, duration, percentage) for name, _, duration, _ in self.phases 
                      if duration > 1.0 or (duration / total_time) * 100 > 5.0]
        
        if bottlenecks:
            for i, (phase_name, duration, percentage) in enumerate(sorted(bottlenecks, key=lambda x: x[1], reverse=True)):
                percentage = (duration / total_time) * 100
                print(f"  {i+1}. {phase_name}: {duration:.2f}s ({percentage:.1f}%)")
        else:
            print("  No major bottlenecks identified (all phases <1s and <5%)")


def analyze_detailed_startup():
    """Run detailed startup analysis with granular timing."""
    profiler = DetailedStartupProfiler()
    
    try:
        # Basic setup phases
        with profiler.profile_phase("PyQt6 imports"):
            from PyQt6.QtWidgets import QApplication
            from PyQt6.QtGui import QGuiApplication
            
        with profiler.profile_phase("QApplication creation"):
            app = QApplication.instance()
            if not app:
                app = QApplication(sys.argv)
                app.setStyle("Fusion")
        
        with profiler.profile_phase("Application factory setup"):
            from core.application.application_factory import ApplicationFactory, ApplicationMode
            container = ApplicationFactory.create_app(ApplicationMode.PRODUCTION)
        
        with profiler.profile_phase("Service locator initialization"):
            try:
                from core.service_locator import initialize_services
                initialize_services()
            except Exception as e:
                print(f"Warning: Service initialization failed: {e}")
        
        with profiler.profile_phase("Screen detection and setup"):
            screens = QGuiApplication.screens()
            target_screen = screens[1] if len(screens) > 1 else QGuiApplication.primaryScreen()
        
        with profiler.profile_phase("Splash screen creation"):
            from presentation.components.ui.splash_screen import SplashScreen
            splash = SplashScreen(target_screen=target_screen)
        
        # Now break down the main window creation into detailed phases
        with profiler.profile_phase("TKAMainWindow import"):
            from src.desktop.modern.main import TKAMainWindow
        
        with profiler.profile_phase("TKAMainWindow instantiation"):
            # This will trigger the heavy initialization
            window = TKAMainWindow(
                container=container,
                splash_screen=splash,
                target_screen=target_screen,
                parallel_mode=False,
                parallel_geometry=None,
            )
        
        print("🎉 Detailed startup analysis complete!")
        
    except Exception as e:
        print(f"❌ Error during detailed startup analysis: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        profiler.print_summary()


if __name__ == "__main__":
    print("🔍 Starting detailed TKA startup performance analysis...")
    print("This will provide granular timing of each startup phase.")
    print()
    
    analyze_detailed_startup()
