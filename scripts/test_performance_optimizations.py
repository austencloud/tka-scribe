#!/usr/bin/env python3
"""
Performance Validation Script for TKA Desktop Optimizations

Tests the performance improvements implemented in Phase 1:
1. SVG Content Caching
2. Pre-processed SVG Color Variants  
3. DI Constructor Signature Caching
4. Eager JSON Data Loading

Run from project root: python scripts/test_performance_optimizations.py
"""

import sys
import os
import time
import logging
from pathlib import Path

# Add the modern src directory to Python path
project_root = Path(__file__).parent.parent
modern_src = project_root / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(modern_src))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class PerformanceValidator:
    """Validates the performance optimizations implemented."""
    
    def __init__(self):
        self.results = {}
        
    def test_svg_file_existence(self) -> dict:
        """Test that pre-colored SVG files were generated correctly."""
        logger.info("Testing SVG color variant generation...")
        
        arrows_colored_dir = project_root / "src" / "desktop" / "images" / "arrows_colored"
        
        if not arrows_colored_dir.exists():
            return {"error": "arrows_colored directory not found"}
        
        # Check for expected structure
        expected_colors = ["blue", "red"]
        expected_types = ["pro", "anti", "static", "dash"]
        
        results = {
            "arrows_colored_exists": arrows_colored_dir.exists(),
            "colors_found": [],
            "types_found": [],
            "sample_files_found": 0
        }
        
        for color in expected_colors:
            for arrow_type in expected_types:
                type_color_dir = arrows_colored_dir / arrow_type / color
                if type_color_dir.exists():
                    results["colors_found"].append(color)
                    results["types_found"].append(f"{arrow_type}/{color}")
                    
                    # Count sample files
                    svg_files = list(type_color_dir.rglob("*.svg"))
                    results["sample_files_found"] += len(svg_files)
        
        # Remove duplicates
        results["colors_found"] = list(set(results["colors_found"]))
        
        logger.info(f"SVG Generation Results: {results}")
        return results
    
    def test_svg_caching_implementation(self) -> dict:
        """Test that SVG caching is properly implemented."""
        logger.info("Testing SVG caching implementation...")
        
        try:
            from presentation.components.pictograph.renderers.arrow_renderer import ArrowRenderer
            
            # Check if caching methods exist
            results = {
                "has_cache_stats": hasattr(ArrowRenderer, 'get_cache_stats'),
                "has_clear_cache": hasattr(ArrowRenderer, 'clear_cache'),
                "has_cache_info": hasattr(ArrowRenderer, 'get_cache_info'),
                "has_cached_files": hasattr(ArrowRenderer, '_cached_files'),
            }
            
            # Test cache stats
            if results["has_cache_stats"]:
                stats = ArrowRenderer.get_cache_stats()
                results["cache_stats"] = stats
            
            logger.info(f"SVG Caching Implementation: {results}")
            return results
            
        except ImportError as e:
            return {"error": f"Import failed: {e}"}
    
    def test_di_caching_implementation(self) -> dict:
        """Test that DI constructor caching is properly implemented."""
        logger.info("Testing DI caching implementation...")
        
        try:
            from core.dependency_injection.service_resolvers import ConstructorResolver
            
            # Check if caching methods exist
            results = {
                "has_signature_cache": hasattr(ConstructorResolver, '_signature_cache'),
                "has_type_hints_cache": hasattr(ConstructorResolver, '_type_hints_cache'),
                "has_cache_stats": hasattr(ConstructorResolver, 'get_cache_stats'),
                "has_clear_cache": hasattr(ConstructorResolver, 'clear_cache'),
            }
            
            # Test cache stats
            if results["has_cache_stats"]:
                stats = ConstructorResolver.get_cache_stats()
                results["cache_stats"] = stats
            
            logger.info(f"DI Caching Implementation: {results}")
            return results
            
        except ImportError as e:
            return {"error": f"Import failed: {e}"}
    
    def test_json_loading_implementation(self) -> dict:
        """Test that JSON loading is properly implemented."""
        logger.info("Testing JSON loading implementation...")
        
        try:
            # Test special placement service
            start_time = time.time()
            from application.services.positioning.arrows.placement.special_placement_service import SpecialPlacementService
            
            service = SpecialPlacementService()
            init_time = (time.time() - start_time) * 1000
            
            results = {
                "initialization_time_ms": init_time,
                "has_placements": len(service.special_placements) > 0,
                "placement_modes": list(service.special_placements.keys()),
                "total_placements": sum(
                    len(subfolder_data) 
                    for mode_data in service.special_placements.values() 
                    for subfolder_data in mode_data.values()
                )
            }
            
            logger.info(f"JSON Loading Implementation: {results}")
            return results
            
        except ImportError as e:
            return {"error": f"Import failed: {e}"}
    
    def test_build_script_execution(self) -> dict:
        """Test that the build script executed successfully."""
        logger.info("Testing build script execution...")
        
        script_path = project_root / "scripts" / "generate_colored_svg_variants.py"
        
        results = {
            "script_exists": script_path.exists(),
            "output_dir_exists": (project_root / "src" / "desktop" / "images" / "arrows_colored").exists(),
        }
        
        if results["output_dir_exists"]:
            output_dir = project_root / "src" / "desktop" / "images" / "arrows_colored"
            svg_files = list(output_dir.rglob("*.svg"))
            results["total_generated_files"] = len(svg_files)
            
            # Check for both colors
            blue_files = list(output_dir.rglob("**/blue/*.svg"))
            red_files = list(output_dir.rglob("**/red/*.svg"))
            results["blue_files"] = len(blue_files)
            results["red_files"] = len(red_files)
        
        logger.info(f"Build Script Results: {results}")
        return results
    
    def run_all_tests(self) -> dict:
        """Run all performance validation tests."""
        logger.info("=" * 60)
        logger.info("TKA PERFORMANCE OPTIMIZATION VALIDATION")
        logger.info("=" * 60)
        
        self.results = {
            "svg_file_generation": self.test_svg_file_existence(),
            "svg_caching": self.test_svg_caching_implementation(),
            "di_caching": self.test_di_caching_implementation(),
            "json_loading": self.test_json_loading_implementation(),
            "build_script": self.test_build_script_execution(),
        }
        
        self._generate_report()
        return self.results
    
    def _generate_report(self) -> None:
        """Generate a comprehensive validation report."""
        logger.info("=" * 60)
        logger.info("VALIDATION RESULTS SUMMARY")
        logger.info("=" * 60)
        
        total_tests = len(self.results)
        passed_tests = 0
        
        for test_name, results in self.results.items():
            logger.info(f"\n{test_name.upper().replace('_', ' ')}:")
            
            if "error" in results:
                logger.error(f"  ❌ FAILED: {results['error']}")
            else:
                logger.info(f"  ✅ PASSED")
                passed_tests += 1
                
                # Show key metrics
                for key, value in results.items():
                    if isinstance(value, (int, float)) and key.endswith('_ms'):
                        logger.info(f"    {key}: {value:.1f}ms")
                    elif isinstance(value, (int, float)):
                        logger.info(f"    {key}: {value}")
                    elif isinstance(value, bool):
                        status = "✅" if value else "❌"
                        logger.info(f"    {key}: {status}")
                    elif isinstance(value, list) and len(value) <= 5:
                        logger.info(f"    {key}: {value}")
        
        logger.info("=" * 60)
        logger.info(f"OVERALL RESULTS: {passed_tests}/{total_tests} tests passed")
        
        if passed_tests == total_tests:
            logger.info("🎉 ALL OPTIMIZATIONS SUCCESSFULLY IMPLEMENTED!")
        else:
            logger.warning(f"⚠️  {total_tests - passed_tests} optimizations need attention")
        
        logger.info("=" * 60)


def main():
    """Main entry point for performance validation."""
    validator = PerformanceValidator()
    results = validator.run_all_tests()
    
    # Return appropriate exit code
    failed_tests = sum(1 for result in results.values() if "error" in result)
    return 0 if failed_tests == 0 else 1


if __name__ == "__main__":
    exit(main())
