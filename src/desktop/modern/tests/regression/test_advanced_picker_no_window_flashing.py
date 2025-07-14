"""
Regression test to ensure Advanced Start Position Picker never creates
pictograph components as separate top-level windows.

This test prevents the window flashing issue from reoccurring.
"""

import pytest
import sys
from unittest.mock import Mock
from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import QTimer


class TestAdvancedPickerNoWindowFlashing:
    """Regression tests for window flashing prevention."""

    @pytest.fixture(autouse=True)
    def setup_qt_app(self):
        """Ensure QApplication exists for Qt widget tests."""
        if not QApplication.instance():
            self.app = QApplication(sys.argv)
        else:
            self.app = QApplication.instance()
        yield
        # Don't quit the app as it might be used by other tests

    @pytest.fixture
    def pool_manager(self):
        """Create a pool manager for testing."""
        sys.path.insert(0, 'src')
        from application.services.pictograph_pool_manager import PictographPoolManager
        return PictographPoolManager()

    def test_advanced_picker_creation_no_window_flashing(self, pool_manager):
        """
        REGRESSION TEST: Ensure advanced picker creation doesn't create
        pictograph components as separate top-level windows.
        
        This test prevents the window flashing bug from returning.
        """
        # Import required components
        from presentation.components.start_position_picker.advanced_start_position_picker import AdvancedStartPositionPicker
        
        # Get baseline window count
        initial_windows = self.app.topLevelWidgets()
        initial_count = len(initial_windows)
        initial_pictograph_windows = [w for w in initial_windows if "PictographComponent" in str(type(w))]
        
        # Create advanced picker
        advanced_picker = AdvancedStartPositionPicker(pool_manager, "diamond")
        
        # Process events to allow any window creation
        self.app.processEvents()
        
        # Check windows after creation
        final_windows = self.app.topLevelWidgets()
        final_count = len(final_windows)
        final_pictograph_windows = [w for w in final_windows if "PictographComponent" in str(type(w))]
        
        # CRITICAL ASSERTION: No new pictograph windows should be created
        new_pictograph_windows = len(final_pictograph_windows) - len(initial_pictograph_windows)
        
        assert new_pictograph_windows == 0, (
            f"REGRESSION FAILURE: {new_pictograph_windows} pictograph components "
            f"appeared as separate windows during advanced picker creation. "
            f"This indicates the window flashing bug has returned!"
        )
        
        # Verify advanced picker was created successfully
        assert advanced_picker is not None
        assert len(advanced_picker.position_options) == 16
        
        # Verify all pictograph components are properly parented
        orphaned_components = []
        for i, option in enumerate(advanced_picker.position_options):
            if hasattr(option, '_pictograph_component') and option._pictograph_component:
                comp = option._pictograph_component
                if comp.parent() != option:
                    orphaned_components.append(f"Option {i}: component parent is {comp.parent()}, expected {option}")
        
        assert len(orphaned_components) == 0, (
            f"REGRESSION FAILURE: {len(orphaned_components)} pictograph components "
            f"are not properly parented: {orphaned_components}"
        )

    def test_enhanced_picker_variations_transition_no_flashing(self, pool_manager):
        """
        REGRESSION TEST: Ensure the enhanced picker -> advanced picker transition
        doesn't create window flashing.
        
        This tests the exact user scenario where the bug occurred.
        """
        # Import required components
        from presentation.components.start_position_picker.enhanced_start_position_picker import EnhancedStartPositionPicker
        
        # Create enhanced picker
        enhanced_picker = EnhancedStartPositionPicker(pool_manager)
        enhanced_picker.show()
        self.app.processEvents()
        
        # Get baseline window count
        initial_windows = self.app.topLevelWidgets()
        initial_pictograph_windows = [w for w in initial_windows if "PictographComponent" in str(type(w))]
        
        # Perform the critical transition that caused window flashing
        enhanced_picker._handle_variations_clicked()
        self.app.processEvents()
        
        # Check windows after transition
        final_windows = self.app.topLevelWidgets()
        final_pictograph_windows = [w for w in final_windows if "PictographComponent" in str(type(w))]
        
        # CRITICAL ASSERTION: No new pictograph windows should be created
        new_pictograph_windows = len(final_pictograph_windows) - len(initial_pictograph_windows)
        
        assert new_pictograph_windows == 0, (
            f"REGRESSION FAILURE: {new_pictograph_windows} pictograph components "
            f"appeared as separate windows during variations transition. "
            f"The window flashing bug has returned!"
        )
        
        # Verify transition was successful
        assert enhanced_picker.advanced_picker is not None
        assert len(enhanced_picker.advanced_picker.position_options) == 16

    def test_pictograph_components_proper_containment(self, pool_manager):
        """
        REGRESSION TEST: Ensure all pictograph components are properly contained
        within their parent widgets and never appear as top-level windows.
        """
        from presentation.components.start_position_picker.advanced_start_position_picker import AdvancedStartPositionPicker
        
        # Create advanced picker
        advanced_picker = AdvancedStartPositionPicker(pool_manager, "diamond")
        self.app.processEvents()
        
        # Check each pictograph component
        for i, option in enumerate(advanced_picker.position_options):
            if hasattr(option, '_pictograph_component') and option._pictograph_component:
                comp = option._pictograph_component
                
                # Component should have proper parent
                assert comp.parent() == option, (
                    f"Component {i} has wrong parent: {comp.parent()}, expected: {option}"
                )
                
                # Component should NOT be a top-level widget
                assert comp not in self.app.topLevelWidgets(), (
                    f"REGRESSION FAILURE: Component {i} is a top-level widget! "
                    f"This causes window flashing."
                )
                
                # Component should be visible (not hidden)
                assert comp.isVisible(), (
                    f"Component {i} is not visible - this breaks the picker display"
                )

    def test_pool_components_never_become_top_level(self, pool_manager):
        """
        REGRESSION TEST: Ensure pool components never become top-level windows
        during checkout/checkin operations.
        """
        # Get initial window state
        initial_windows = self.app.topLevelWidgets()
        initial_pictograph_windows = [w for w in initial_windows if "PictographComponent" in str(type(w))]
        
        # Checkout multiple components (simulating rapid creation)
        components = []
        for i in range(10):
            comp = pool_manager.checkout_pictograph(parent=None)  # No parent initially
            components.append(comp)
            self.app.processEvents()
            
            # Check that no new top-level pictograph windows were created
            current_windows = self.app.topLevelWidgets()
            current_pictograph_windows = [w for w in current_windows if "PictographComponent" in str(type(w))]
            new_pictograph_windows = len(current_pictograph_windows) - len(initial_pictograph_windows)
            
            assert new_pictograph_windows == 0, (
                f"REGRESSION FAILURE: Pool checkout {i} created {new_pictograph_windows} "
                f"top-level pictograph windows!"
            )
        
        # Return components to pool
        for comp in components:
            if comp:
                pool_manager.return_pictograph(comp)
        
        self.app.processEvents()
        
        # Verify no lingering top-level pictograph windows
        final_windows = self.app.topLevelWidgets()
        final_pictograph_windows = [w for w in final_windows if "PictographComponent" in str(type(w))]
        final_new_windows = len(final_pictograph_windows) - len(initial_pictograph_windows)
        
        assert final_new_windows == 0, (
            f"REGRESSION FAILURE: {final_new_windows} pictograph windows remain "
            f"after pool operations!"
        )
