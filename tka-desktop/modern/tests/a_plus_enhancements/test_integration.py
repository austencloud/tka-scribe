"""
Integration tests for A+ enhancements with existing TKA Desktop architecture.
"""

import pytest
from unittest.mock import Mock, patch
from pathlib import Path

from core.integration.integration_manager import IntegrationManager
from core.integration.system_initializer import SystemInitializer
from core.integration.enhanced_component_base import EnhancedComponentBase
from core.integration.compatibility_adapter import LegacyComponentAdapter
from core.types.result import Result

from .utils import assert_result_ok, assert_result_error, create_test_component
from .fixtures import mock_event_bus, mock_container


class TestIntegrationManager:
    """Test the integration manager functionality."""
    
    def test_integration_manager_creation(self, mock_event_bus):
        """Test integration manager can be created."""
        manager = IntegrationManager(mock_event_bus)
        
        assert manager.event_bus == mock_event_bus
        assert manager.integration_status == "not_initialized"
        assert len(manager.initialized_systems) == 0
        assert len(manager.startup_errors) == 0
    
    @pytest.mark.asyncio
    async def test_system_initialization_success(self, mock_event_bus):
        """Test successful system initialization."""
        manager = IntegrationManager(mock_event_bus)
        
        # Mock all initialization methods to succeed
        with patch.object(manager, '_initialize_logging', return_value=Result.ok(None)), \
             patch.object(manager, '_initialize_monitoring', return_value=Result.ok(None)), \
             patch.object(manager, '_initialize_configuration', return_value=Result.ok(None)), \
             patch.object(manager, '_initialize_validation', return_value=Result.ok(None)), \
             patch.object(manager, '_initialize_ui_state', return_value=Result.ok(None)), \
             patch.object(manager, '_initialize_health_checks', return_value=Result.ok(None)), \
             patch.object(manager, '_initialize_api_layer', return_value=Result.ok(None)):
            
            result = manager.initialize_all_systems()
            
            assert_result_ok(result)
            assert manager.integration_status == "fully_initialized"
            assert all(manager.initialized_systems.values())
            assert len(manager.startup_errors) == 0
    
    @pytest.mark.asyncio
    async def test_system_initialization_partial_failure(self, mock_event_bus):
        """Test partial system initialization failure."""
        manager = IntegrationManager(mock_event_bus)
        
        # Mock some systems to fail
        with patch.object(manager, '_initialize_logging', return_value=Result.ok(None)), \
             patch.object(manager, '_initialize_monitoring', return_value=Result.error(Exception("Monitor failed"))), \
             patch.object(manager, '_initialize_configuration', return_value=Result.ok(None)), \
             patch.object(manager, '_initialize_validation', return_value=Result.error(Exception("Validation failed"))), \
             patch.object(manager, '_initialize_ui_state', return_value=Result.ok(None)), \
             patch.object(manager, '_initialize_health_checks', return_value=Result.ok(None)), \
             patch.object(manager, '_initialize_api_layer', return_value=Result.ok(None)):
            
            result = manager.initialize_all_systems()
            
            assert_result_ok(result)
            assert manager.integration_status == "partially_initialized"
            assert not all(manager.initialized_systems.values())
            assert len(manager.startup_errors) == 2
    
    def test_get_integration_status(self, mock_event_bus):
        """Test getting integration status."""
        manager = IntegrationManager(mock_event_bus)
        manager.initialized_systems = {
            "logging": True,
            "monitoring": False,
            "validation": True
        }
        manager.integration_status = "partially_initialized"
        manager.startup_errors = ["Monitor failed"]
        
        status = manager.get_integration_status()
        
        assert status['status'] == "partially_initialized"
        assert status['successful_systems'] == 2
        assert status['total_systems'] == 3
        assert status['success_rate'] == 2/3
        assert not status['is_fully_operational']
        assert len(status['startup_errors']) == 1


class TestSystemInitializer:
    """Test the system initializer functionality."""
    
    @pytest.mark.asyncio
    async def test_initialize_a_plus_systems_success(self, mock_event_bus):
        """Test successful A+ systems initialization."""
        with patch('core.integration.system_initializer.get_integration_manager') as mock_get_manager:
            mock_manager = Mock()
            mock_manager.initialize_all_systems.return_value = Result.ok({"logging": True})
            mock_manager.get_integration_status.return_value = {
                'status': 'fully_initialized',
                'success_rate': 1.0
            }
            mock_get_manager.return_value = mock_manager
            
            result = SystemInitializer.initialize_a_plus_systems(mock_event_bus)
            
            assert_result_ok(result)
            status = result.unwrap()
            assert status['status'] == 'fully_initialized'
            assert status['success_rate'] == 1.0
    
    @pytest.mark.asyncio
    async def test_initialize_a_plus_systems_failure(self, mock_event_bus):
        """Test A+ systems initialization failure."""
        with patch('core.integration.system_initializer.get_integration_manager') as mock_get_manager:
            mock_manager = Mock()
            mock_manager.initialize_all_systems.return_value = Result.error(Exception("Init failed"))
            mock_get_manager.return_value = mock_manager
            
            result = SystemInitializer.initialize_a_plus_systems(mock_event_bus)
            
            assert_result_error(result, Exception)


class TestEnhancedComponentBase:
    """Test the enhanced component base class."""
    
    def test_enhanced_component_creation(self, mock_container, mock_event_bus):
        """Test enhanced component can be created."""
        # Mock the container to return event bus
        mock_container.get.return_value = mock_event_bus
        
        with patch('core.integration.enhanced_component_base.get_ui_state_manager'), \
             patch('core.integration.enhanced_component_base.get_health_checker'):
            
            # Create a test component class
            class TestComponent(EnhancedComponentBase):
                def initialize(self):
                    self._initialized = True
                
                def get_widget(self):
                    return Mock()
                
                def cleanup(self):
                    pass
            
            component = TestComponent(mock_container)
            
            assert component._container == mock_container
            assert hasattr(component, '_ui_state_manager')
            assert hasattr(component, '_health_check')
    
    def test_initialize_with_monitoring(self, mock_container, mock_event_bus):
        """Test enhanced initialization with monitoring."""
        mock_container.get.return_value = mock_event_bus
        
        with patch('core.integration.enhanced_component_base.get_ui_state_manager'), \
             patch('core.integration.enhanced_component_base.get_health_checker'), \
             patch('core.integration.enhanced_component_base.enhanced_performance_monitor'):
            
            class TestComponent(EnhancedComponentBase):
                def initialize(self):
                    self._initialized = True
                
                def get_widget(self):
                    return Mock()
                
                def cleanup(self):
                    pass
            
            component = TestComponent(mock_container)
            result = component.initialize_with_monitoring()
            
            assert_result_ok(result)
            assert component._initialized
    
    def test_validate_input_success(self, mock_container, mock_event_bus):
        """Test successful input validation."""
        mock_container.get.return_value = mock_event_bus
        
        with patch('core.integration.enhanced_component_base.get_ui_state_manager'), \
             patch('core.integration.enhanced_component_base.get_health_checker'), \
             patch('core.integration.enhanced_component_base.validate_user_input') as mock_validate:
            
            # Mock successful validation
            from .utils import create_mock_validation_result
            mock_validate.return_value = create_mock_validation_result(is_valid=True)
            
            class TestComponent(EnhancedComponentBase):
                def initialize(self):
                    self._initialized = True
                
                def get_widget(self):
                    return Mock()
                
                def cleanup(self):
                    pass
            
            component = TestComponent(mock_container)
            test_data = {"name": "test", "value": 123}
            
            result = component.validate_input(test_data)
            
            assert_result_ok(result)
            assert result.unwrap() == test_data
    
    def test_validate_input_failure(self, mock_container, mock_event_bus):
        """Test input validation failure."""
        mock_container.get.return_value = mock_event_bus
        
        with patch('core.integration.enhanced_component_base.get_ui_state_manager'), \
             patch('core.integration.enhanced_component_base.get_health_checker'), \
             patch('core.integration.enhanced_component_base.validate_user_input') as mock_validate:
            
            # Mock validation failure
            from .utils import create_mock_validation_result
            mock_validate.return_value = create_mock_validation_result(
                is_valid=False,
                errors=[{"field": "name", "message": "Name is required"}]
            )
            
            class TestComponent(EnhancedComponentBase):
                def initialize(self):
                    self._initialized = True
                
                def get_widget(self):
                    return Mock()
                
                def cleanup(self):
                    pass
            
            component = TestComponent(mock_container)
            test_data = {"name": "", "value": 123}
            
            result = component.validate_input(test_data)
            
            assert_result_error(result, Exception)


class TestLegacyComponentAdapter:
    """Test the legacy component adapter."""
    
    def test_legacy_adapter_creation(self):
        """Test legacy adapter can be created."""
        mock_legacy = Mock()
        mock_legacy.__class__.__name__ = "LegacyComponent"
        
        adapter = LegacyComponentAdapter(mock_legacy)
        
        assert adapter.legacy_component == mock_legacy
        assert adapter.component_name == "LegacyComponent"
    
    def test_validate_input_success(self):
        """Test successful input validation through adapter."""
        mock_legacy = Mock()
        mock_legacy.__class__.__name__ = "LegacyComponent"
        
        with patch('core.integration.compatibility_adapter.validate_user_input') as mock_validate:
            # Mock successful validation
            from .utils import create_mock_validation_result
            mock_validate.return_value = create_mock_validation_result(is_valid=True)
            
            adapter = LegacyComponentAdapter(mock_legacy)
            test_data = {"name": "test"}
            
            result = adapter.validate_input(test_data)
            
            assert result is True
    
    def test_validate_input_failure(self):
        """Test input validation failure through adapter."""
        mock_legacy = Mock()
        mock_legacy.__class__.__name__ = "LegacyComponent"
        
        with patch('core.integration.compatibility_adapter.validate_user_input') as mock_validate:
            # Mock validation failure
            from .utils import create_mock_validation_result
            mock_validate.return_value = create_mock_validation_result(
                is_valid=False,
                errors=[{"field": "name", "message": "Name is required"}]
            )
            
            adapter = LegacyComponentAdapter(mock_legacy)
            test_data = {"name": ""}
            
            result = adapter.validate_input(test_data)
            
            assert result is False
    
    def test_ui_state_integration(self):
        """Test UI state integration through adapter."""
        mock_legacy = Mock()
        mock_legacy.__class__.__name__ = "LegacyComponent"
        
        with patch('core.integration.compatibility_adapter.get_ui_state_manager') as mock_get_state:
            mock_state_manager = Mock()
            mock_state_manager.set.return_value = Result.ok(None)
            mock_state_manager.get.return_value = "test_value"
            mock_get_state.return_value = mock_state_manager
            
            adapter = LegacyComponentAdapter(mock_legacy)
            
            # Test setting state
            result = adapter.update_ui_state("test_key", "test_value")
            assert result is True
            
            # Test getting state
            value = adapter.get_ui_state("test_key", "default")
            assert value == "test_value"


class TestBackwardCompatibility:
    """Test backward compatibility with existing TKA Desktop components."""
    
    def test_existing_component_still_works(self, mock_container):
        """Test that existing components still work without A+ features."""
        # Simulate an existing component that doesn't use A+ features
        class ExistingComponent:
            def __init__(self, container):
                self._container = container
                self._initialized = False
            
            def initialize(self):
                self._initialized = True
            
            def get_widget(self):
                return Mock()
            
            def cleanup(self):
                pass
        
        # Should work without any A+ dependencies
        component = ExistingComponent(mock_container)
        component.initialize()
        
        assert component._initialized
        assert component.get_widget() is not None
    
    def test_gradual_migration_to_enhanced_base(self, mock_container, mock_event_bus):
        """Test gradual migration from existing to enhanced base."""
        mock_container.get.return_value = mock_event_bus
        
        with patch('core.integration.enhanced_component_base.get_ui_state_manager'), \
             patch('core.integration.enhanced_component_base.get_health_checker'):
            
            # Simulate migrating an existing component to enhanced base
            class MigratedComponent(EnhancedComponentBase):
                def initialize(self):
                    # Existing initialization logic
                    self._initialized = True
                    # Can now use A+ features
                    self.update_ui_state("component_ready", True)
                
                def get_widget(self):
                    return Mock()
                
                def cleanup(self):
                    pass
            
            component = MigratedComponent(mock_container)
            result = component.initialize_with_monitoring()
            
            # Should work with both old and new patterns
            assert_result_ok(result)
            assert component._initialized
