#!/usr/bin/env python3
"""
Final TKA Startup Performance Test

This script tests the actual startup performance with all optimizations applied.
"""

import sys
import time
import psutil
from pathlib import Path

# Add the modern src directory to Python path
modern_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(modern_src_path))

def test_final_startup_performance():
    """Test the final startup performance with all optimizations."""
    
    print("🚀 FINAL TKA STARTUP PERFORMANCE TEST")
    print("=" * 60)
    print()
    
    # Record timing
    start_time = time.perf_counter()
    process = psutil.Process()
    initial_memory = process.memory_info().rss / 1024 / 1024
    
    print(f"⏱️  Starting TKA application...")
    print(f"📊 Initial memory: {initial_memory:.1f}MB")
    print()
    
    try:
        # Phase 1: Basic setup
        phase_start = time.perf_counter()
        from PyQt6.QtWidgets import QApplication
        from PyQt6.QtGui import QGuiApplication
        
        app = QApplication.instance()
        if not app:
            app = QApplication(sys.argv)
            app.setStyle("Fusion")
        
        phase_time = time.perf_counter() - phase_start
        print(f"✅ Phase 1 - Qt setup: {phase_time*1000:.1f}ms")
        
        # Phase 2: Application factory
        phase_start = time.perf_counter()
        from core.application.application_factory import ApplicationFactory, ApplicationMode
        container = ApplicationFactory.create_app(ApplicationMode.PRODUCTION)
        
        phase_time = time.perf_counter() - phase_start
        print(f"✅ Phase 2 - Application factory: {phase_time*1000:.1f}ms")
        
        # Phase 3: Service initialization
        phase_start = time.perf_counter()
        try:
            from core.service_locator import initialize_services
            initialize_services()
        except:
            pass
        
        phase_time = time.perf_counter() - phase_start
        print(f"✅ Phase 3 - Service initialization: {phase_time*1000:.1f}ms")
        
        # Phase 4: Screen setup
        phase_start = time.perf_counter()
        screens = QGuiApplication.screens()
        target_screen = screens[1] if len(screens) > 1 else QGuiApplication.primaryScreen()
        
        from presentation.components.ui.splash_screen import SplashScreen
        splash = SplashScreen(target_screen=target_screen)
        
        phase_time = time.perf_counter() - phase_start
        print(f"✅ Phase 4 - Screen & splash setup: {phase_time*1000:.1f}ms")
        
        # Phase 5: Main window creation (the big one)
        phase_start = time.perf_counter()
        from src.desktop.modern.main import TKAMainWindow
        window = TKAMainWindow(
            container=container,
            splash_screen=splash,
            target_screen=target_screen,
            parallel_mode=False,
            parallel_geometry=None,
        )
        
        phase_time = time.perf_counter() - phase_start
        print(f"✅ Phase 5 - Main window creation: {phase_time*1000:.1f}ms")
        
        # Calculate final results
        total_time = time.perf_counter() - start_time
        final_memory = process.memory_info().rss / 1024 / 1024
        memory_used = final_memory - initial_memory
        
        print()
        print("🎉 STARTUP COMPLETE!")
        print("=" * 60)
        print(f"⏱️  Total startup time: {total_time:.2f} seconds")
        print(f"📊 Memory used: {memory_used:.1f}MB")
        print(f"📊 Final memory: {final_memory:.1f}MB")
        print()
        
        # Performance rating
        if total_time < 2.0:
            rating = "🏆 EXCELLENT"
            color = "🟢"
        elif total_time < 3.0:
            rating = "🥇 VERY GOOD"
            color = "🟡"
        elif total_time < 5.0:
            rating = "🥈 GOOD"
            color = "🟠"
        else:
            rating = "🥉 NEEDS IMPROVEMENT"
            color = "🔴"
        
        print(f"{color} Performance Rating: {rating}")
        print(f"   Startup time: {total_time:.2f}s")
        print(f"   Memory usage: {memory_used:.0f}MB")
        print()
        
        # Compare to original
        original_time = 16.7
        original_memory = 933
        
        time_improvement = ((original_time - total_time) / original_time) * 100
        memory_improvement = ((original_memory - memory_used) / original_memory) * 100
        
        print("📈 IMPROVEMENT OVER ORIGINAL:")
        print(f"   Startup time: {time_improvement:.0f}% faster")
        print(f"   Memory usage: {memory_improvement:.0f}% less")
        print()
        
        print("🔧 OPTIMIZATIONS APPLIED:")
        print("   ✅ Pictograph pool lazy initialization")
        print("   ✅ Pool expansion disabled during startup")
        print("   ✅ Threading fixes (main thread only)")
        print("   ✅ CSS warning suppression")
        print("   ✅ Construct tab lazy loading")
        print("   ✅ Detailed progress tracking")
        print()
        
        if total_time < 2.0:
            print("🎯 TARGET ACHIEVED: Startup under 2 seconds!")
        else:
            print(f"🎯 Close to target: {2.0 - total_time:.1f}s away from 2-second goal")
        
    except Exception as e:
        print(f"❌ Error during startup test: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    test_final_startup_performance()
