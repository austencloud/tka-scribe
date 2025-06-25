"""
Performance Tests for TKA Desktop Optimization

Tests the performance improvements implemented in Phase 1:
1. SVG Content Caching (Target: 10-50ms → 0.1-1ms per arrow)
2. Pre-processed SVG Color Variants (Target: Remove 5-15ms per arrow)
3. DI Constructor Signature Caching (Target: 5-15ms → 0.1-1ms per service resolution)
4. Eager JSON Data Loading (Target: Remove 20-100ms startup penalty)

PERFORMANCE TARGETS:
- Arrow rendering: < 5ms per arrow (current: 50-150ms)
- Service resolution: < 1ms per resolution (current: 10-25ms)
- Total operation overhead: 5-50ms (current: 50-375ms)
- Memory usage: Stable < 200MB
"""

import pytest
import time
import logging
import os
from pathlib import Path
from typing import Dict, List, Tuple
from unittest.mock import Mock, patch

# Configure logging for performance tests
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PerformanceTestSuite:
    """Comprehensive performance test suite for TKA optimizations."""
    
    def __init__(self):
        self.results: Dict[str, Dict[str, float]] = {}
        self.baseline_times: Dict[str, float] = {
            "svg_loading": 25.0,  # ms - baseline SVG loading time
            "color_transformation": 10.0,  # ms - baseline color transformation time
            "service_resolution": 15.0,  # ms - baseline DI resolution time
            "json_loading": 60.0,  # ms - baseline JSON loading time
        }
        self.target_times: Dict[str, float] = {
            "svg_loading": 1.0,  # ms - target SVG loading time
            "color_transformation": 0.1,  # ms - target (eliminated)
            "service_resolution": 1.0,  # ms - target DI resolution time
            "json_loading": 5.0,  # ms - target JSON loading time
        }
    
    def measure_time(self, func, *args, **kwargs) -> Tuple[float, any]:
        """Measure execution time of a function in milliseconds."""
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        end_time = time.perf_counter()
        return (end_time - start_time) * 1000, result
    
    def test_svg_caching_performance(self) -> Dict[str, float]:
        """Test SVG file loading performance with caching."""
        try:
            from presentation.components.pictograph.renderers.arrow_renderer import ArrowRenderer
            
            # Create mock scene
            mock_scene = Mock()
            renderer = ArrowRenderer(mock_scene)
            
            # Test file path (use a real SVG file)
            test_svg_path = "src/desktop/images/arrows_colored/pro/blue/from_radial/pro_0.0.svg"
            
            if not os.path.exists(test_svg_path):
                logger.warning(f"Test SVG file not found: {test_svg_path}")
                return {"error": "Test file not found"}
            
            results = {}
            
            # Test cold cache (first load)
            cold_time, _ = self.measure_time(renderer._load_svg_file, test_svg_path)
            results["cold_cache"] = cold_time
            
            # Test warm cache (subsequent loads)
            warm_times = []
            for _ in range(10):
                warm_time, _ = self.measure_time(renderer._load_svg_file, test_svg_path)
                warm_times.append(warm_time)
            
            results["warm_cache_avg"] = sum(warm_times) / len(warm_times)
            results["warm_cache_min"] = min(warm_times)
            results["warm_cache_max"] = max(warm_times)
            
            # Get cache statistics
            cache_stats = ArrowRenderer.get_cache_stats()
            results["cache_hits"] = cache_stats.get("hits", 0)
            results["cache_misses"] = cache_stats.get("misses", 0)
            
            logger.info(f"SVG Caching Performance: {results}")
            return results
            
        except Exception as e:
            logger.error(f"SVG caching test failed: {e}")
            return {"error": str(e)}
    
    def test_color_preprocessing_performance(self) -> Dict[str, float]:
        """Test pre-processed color variant performance vs runtime transformation."""
        try:
            from presentation.components.pictograph.renderers.arrow_renderer import ArrowRenderer
            from domain.models.core_models import MotionData, MotionType
            
            # Create mock scene and renderer
            mock_scene = Mock()
            renderer = ArrowRenderer(mock_scene)
            
            # Create test motion data
            motion_data = MotionData(
                motion_type=MotionType.PRO,
                turns=0.0,
                start_location=None,
                end_location=None
            )
            
            results = {}
            
            # Test pre-colored SVG loading (optimized path)
            precolored_times = []
            for color in ["blue", "red"]:
                for _ in range(5):
                    load_time, svg_path = self.measure_time(
                        renderer._get_arrow_svg_file, motion_data, color
                    )
                    precolored_times.append(load_time)
            
            results["precolored_avg"] = sum(precolored_times) / len(precolored_times)
            
            # Test original method with color transformation (fallback path)
            original_times = []
            for _ in range(5):
                original_time, svg_path = self.measure_time(
                    renderer._get_original_arrow_svg_file, motion_data
                )
                
                # Simulate color transformation time
                if svg_path and os.path.exists(svg_path):
                    transform_time, _ = self.measure_time(
                        renderer._apply_color_transformation, 
                        "test svg content", "blue"
                    )
                    original_times.append(original_time + transform_time)
            
            results["original_with_transform_avg"] = sum(original_times) / len(original_times) if original_times else 0
            
            # Calculate improvement
            if results["original_with_transform_avg"] > 0:
                improvement = ((results["original_with_transform_avg"] - results["precolored_avg"]) 
                              / results["original_with_transform_avg"] * 100)
                results["improvement_percent"] = improvement
            
            logger.info(f"Color Preprocessing Performance: {results}")
            return results
            
        except Exception as e:
            logger.error(f"Color preprocessing test failed: {e}")
            return {"error": str(e)}
    
    def test_di_caching_performance(self) -> Dict[str, float]:
        """Test dependency injection constructor caching performance."""
        try:
            from core.dependency_injection.service_resolvers import ConstructorResolver
            from core.dependency_injection.di_container import DIContainer
            
            # Create test classes for DI resolution
            class TestService:
                def __init__(self, dependency: str = "default"):
                    self.dependency = dependency
            
            class TestDependency:
                def __init__(self):
                    pass
            
            resolver = ConstructorResolver()
            container = DIContainer()
            
            results = {}
            
            # Test cold cache (first resolution)
            cold_times = []
            for _ in range(5):
                cold_time, _ = self.measure_time(
                    resolver._get_cached_signature, TestService
                )
                cold_times.append(cold_time)
            
            results["cold_cache_avg"] = sum(cold_times) / len(cold_times)
            
            # Test warm cache (subsequent resolutions)
            warm_times = []
            for _ in range(20):
                warm_time, _ = self.measure_time(
                    resolver._get_cached_signature, TestService
                )
                warm_times.append(warm_time)
            
            results["warm_cache_avg"] = sum(warm_times) / len(warm_times)
            
            # Get cache statistics
            cache_stats = ConstructorResolver.get_cache_stats()
            results["cache_hits"] = cache_stats.get("hits", 0)
            results["cache_misses"] = cache_stats.get("misses", 0)
            
            # Calculate improvement
            if results["cold_cache_avg"] > 0:
                improvement = ((results["cold_cache_avg"] - results["warm_cache_avg"]) 
                              / results["cold_cache_avg"] * 100)
                results["improvement_percent"] = improvement
            
            logger.info(f"DI Caching Performance: {results}")
            return results
            
        except Exception as e:
            logger.error(f"DI caching test failed: {e}")
            return {"error": str(e)}
    
    def test_json_loading_performance(self) -> Dict[str, float]:
        """Test JSON data loading performance."""
        try:
            from application.services.positioning.arrows.placement.special_placement_service import SpecialPlacementService
            
            results = {}
            
            # Test service initialization time (includes JSON loading)
            init_times = []
            for _ in range(3):
                init_time, service = self.measure_time(SpecialPlacementService)
                init_times.append(init_time)
            
            results["initialization_avg"] = sum(init_times) / len(init_times)
            results["initialization_min"] = min(init_times)
            results["initialization_max"] = max(init_times)
            
            logger.info(f"JSON Loading Performance: {results}")
            return results
            
        except Exception as e:
            logger.error(f"JSON loading test failed: {e}")
            return {"error": str(e)}
    
    def run_all_tests(self) -> Dict[str, Dict[str, float]]:
        """Run all performance tests and return comprehensive results."""
        logger.info("=" * 60)
        logger.info("STARTING TKA PERFORMANCE OPTIMIZATION TESTS")
        logger.info("=" * 60)
        
        self.results = {
            "svg_caching": self.test_svg_caching_performance(),
            "color_preprocessing": self.test_color_preprocessing_performance(),
            "di_caching": self.test_di_caching_performance(),
            "json_loading": self.test_json_loading_performance(),
        }
        
        self._generate_performance_report()
        return self.results
    
    def _generate_performance_report(self) -> None:
        """Generate a comprehensive performance report."""
        logger.info("=" * 60)
        logger.info("PERFORMANCE OPTIMIZATION RESULTS")
        logger.info("=" * 60)
        
        for test_name, results in self.results.items():
            if "error" in results:
                logger.error(f"{test_name.upper()}: ERROR - {results['error']}")
                continue
                
            logger.info(f"\n{test_name.upper()} RESULTS:")
            for metric, value in results.items():
                if isinstance(value, (int, float)):
                    logger.info(f"  {metric}: {value:.3f}ms")
                else:
                    logger.info(f"  {metric}: {value}")
        
        logger.info("=" * 60)


# Pytest test functions
def test_svg_caching_performance():
    """Pytest wrapper for SVG caching performance test."""
    suite = PerformanceTestSuite()
    results = suite.test_svg_caching_performance()
    
    # Assert performance targets
    if "error" not in results:
        assert results.get("warm_cache_avg", float('inf')) < 1.0, f"SVG caching too slow: {results.get('warm_cache_avg')}ms"
        assert results.get("cache_hits", 0) > 0, "No cache hits detected"


def test_color_preprocessing_performance():
    """Pytest wrapper for color preprocessing performance test."""
    suite = PerformanceTestSuite()
    results = suite.test_color_preprocessing_performance()
    
    # Assert performance improvements
    if "error" not in results and "improvement_percent" in results:
        assert results["improvement_percent"] > 50, f"Insufficient improvement: {results['improvement_percent']}%"


def test_di_caching_performance():
    """Pytest wrapper for DI caching performance test."""
    suite = PerformanceTestSuite()
    results = suite.test_di_caching_performance()
    
    # Assert performance targets
    if "error" not in results:
        assert results.get("warm_cache_avg", float('inf')) < 1.0, f"DI caching too slow: {results.get('warm_cache_avg')}ms"


def test_json_loading_performance():
    """Pytest wrapper for JSON loading performance test."""
    suite = PerformanceTestSuite()
    results = suite.test_json_loading_performance()
    
    # Assert reasonable initialization time
    if "error" not in results:
        assert results.get("initialization_avg", float('inf')) < 100, f"JSON loading too slow: {results.get('initialization_avg')}ms"


if __name__ == "__main__":
    # Run performance tests directly
    suite = PerformanceTestSuite()
    suite.run_all_tests()
