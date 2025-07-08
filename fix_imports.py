#!/usr/bin/env python3
"""
Quick script to fix all remaining core_models imports.
"""

import os
import re
from pathlib import Path


def fix_file(file_path):
    """Fix imports in a single file."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Replace the import statements
        original_content = content

        # Pattern 1: Simple single-line imports
        content = re.sub(
            r"from domain\.models\.core_models import ([^()\n]+)",
            r"from domain.models import \1",
            content,
        )

        # Pattern 2: Multi-line imports with parentheses
        content = re.sub(
            r"from domain\.models\.core_models import \(\s*\n(.*?)\n\s*\)",
            r"from domain.models import (\n\1\n)",
            content,
            flags=re.DOTALL,
        )

        if content != original_content:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"✅ Fixed: {file_path}")
            return True
        return False

    except Exception as e:
        print(f"❌ Error fixing {file_path}: {e}")
        return False


def main():
    """Fix all files."""
    # List of files from the grep output (including test files)
    files_to_fix = [
        # Test files
        "tests/end_to_end/test_enhanced_comprehensive_workflow.py",
        "tests/end_to_end/test_production_like_workflow.py",
        "tests/end_to_end/test_signal_based_workflow.py",
        "tests/fixtures/domain_fixtures.py",
        "tests/fixtures/graph_editor/mock_beat_data.py",
        "tests/framework/tka_workflow_tester.py",
        "tests/manual/test_clear_sequence_transition.py",
        "tests/regression/bugs/test_dash_classification_prevention.py",
        "tests/regression/bugs/test_glyph_visibility_type2_prevention.py",
        "tests/regression/test_beta_prop_placement_orientation_enum.py",
        "tests/specification/domain/test_glyph_visibility_contract.py",
        "tests/specification/workflows/test_beat_manipulation_contract.py",
        "tests/specification/workflows/test_option_selection_contract.py",
        "tests/specification/workflows/test_pictograph_generation_contract.py",
        "tests/specification/workflows/test_sequence_creation_contract.py",
        # Original source files
        "src/application/services/data/glyph_data_service.py",
        "src/application/services/data/glyph_generation_service.py",
        "src/application/services/data/pictograph_analysis_service.py",
        "src/application/services/positioning/arrows/calculation/arrow_location_calculator.py",
        "src/application/services/positioning/arrows/calculation/arrow_rotation_calculator.py",
        "src/application/services/positioning/arrows/calculation/dash_location_calculator.py",
        "src/application/services/positioning/arrows/calculation/directional_tuple_calculator.py",
        "src/application/services/positioning/arrows/calculation/orientation_calculator.py",
        "src/application/services/positioning/arrows/calculation/quadrant_adjustment_service.py",
        "src/application/services/positioning/arrows/calculation/quadrant_index_service.py",
        "src/application/services/positioning/arrows/coordinate_system/arrow_coordinate_system_service.py",
        "src/application/services/positioning/arrows/keys/attribute_key_generation_service.py",
        "src/application/services/positioning/arrows/keys/placement_key_service.py",
        "src/application/services/positioning/arrows/placement/default_placement_service.py",
        "src/application/services/positioning/arrows/placement/special_placement_orientation_service.py",
        "src/application/services/positioning/arrows/placement/special_placement_service.py",
        "src/application/services/positioning/arrows/utilities/position_matching_service.py",
        "src/application/services/positioning/props/calculation/direction_calculation_service.py",
        "src/application/services/positioning/props/calculation/prop_classification_service.py",
        "src/application/services/positioning/props/orchestration/prop_management_service.py",
        "src/application/services/positioning/props/orchestration/prop_orchestrator.py",
        "src/presentation/components/graph_editor/components/adjustment_panel.py",
        "src/presentation/components/graph_editor/components/detailed_info_panel.py",
        "src/presentation/components/graph_editor/components/dual_orientation_picker.py",
        "src/presentation/components/graph_editor/components/main_adjustment_panel.py",
        "src/presentation/components/graph_editor/components/orientation_picker.py",
        "src/presentation/components/graph_editor/components/pictograph_display_section.py",
        "src/presentation/components/graph_editor/components/turn_adjustment_controls/turn_adjustment_controls.py",
        "src/presentation/components/graph_editor/utils/validation.py",
        "src/presentation/components/option_picker/components/frames/clickable_pictograph_frame.py",
        "src/presentation/components/option_picker/core/option_picker.py",
        "src/presentation/components/option_picker/services/data/beat_loader.py",
        "src/presentation/components/option_picker/services/data/position_matcher.py",
        "src/presentation/components/option_picker/services/layout/display_service.py",
        "src/presentation/components/pictograph/border_manager.py",
        "src/presentation/components/pictograph/pictograph_component.py",
        "src/presentation/components/pictograph/pictograph_scene.py",
        "src/presentation/components/pictograph/renderers/arrow_renderer.py",
        "src/presentation/components/pictograph/renderers/elemental_glyph_renderer.py",
        "src/presentation/components/pictograph/renderers/prop_renderer.py",
        "src/presentation/components/pictograph/renderers/tka_glyph_renderer.py",
        "src/presentation/components/pictograph/renderers/vtg_glyph_renderer.py",
        "src/presentation/components/ui/settings/visibility/visibility_pictograph_preview.py",
        "src/presentation/components/workbench/beat_frame/beat_frame.py",
        "src/presentation/components/workbench/event_controller.py",
        "src/presentation/components/workbench/sequence_beat_frame/pictograph_view_base.py",
        "src/presentation/components/workbench/sequence_beat_frame/start_position_view.py",
        "src/presentation/components/workbench/workbench.py",
        "src/presentation/tabs/construct/sequence_manager.py",
        "src/presentation/tabs/construct/signal_coordinator.py",
        "src/presentation/tabs/construct/start_position_handler.py",
    ]

    fixed_count = 0
    for file_path in files_to_fix:
        full_path = Path(file_path)
        if full_path.exists():
            if fix_file(full_path):
                fixed_count += 1
        else:
            print(f"⚠️ File not found: {file_path}")

    print(f"\n🎉 Fixed {fixed_count} files!")


if __name__ == "__main__":
    main()
