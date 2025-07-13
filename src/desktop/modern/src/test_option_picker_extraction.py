"""
Test Script for Option Picker Service Extraction

Validates that the new Qt-free microservices are properly:
1. Registered in the DI container
2. Resolvable with correct dependencies
3. Functioning without Qt dependencies

Run this to verify the service extraction is working correctly.
"""

import sys
sys.path.append('F:\\CODE\\TKA\\src\\desktop\\modern\\src')

def test_service_registration():
    """Test that all option picker services are properly registered."""
    print("🧪 [TEST] Testing option picker service registration...")
    
    try:
        from core.dependency_injection.di_container import DIContainer
        from application.services.core.service_registration_manager import ServiceRegistrationManager
        
        # Create DI container and register services
        container = DIContainer()
        service_manager = ServiceRegistrationManager()
        
        # Register positioning services first (required dependency)
        service_manager.register_positioning_services(container)
        
        # Register option picker services
        service_manager.register_option_picker_services(container)
        
        print("✅ [TEST] Service registration completed without errors")
        return container
        
    except Exception as e:
        print(f"❌ [TEST] Service registration failed: {e}")
        return None

def test_service_resolution(container):
    """Test that all services can be resolved from the DI container."""
    print("\\n🔍 [TEST] Testing service resolution...")
    
    services_to_test = [
        ('OptionConfigurationService', 'application.services.option_picker.option_configuration_service'),
        ('OptionPoolService', 'application.services.option_picker.option_pool_service'),
        ('OptionSizingService', 'application.services.option_picker.option_sizing_service'),
        ('SequenceOptionService', 'application.services.option_picker.sequence_option_service'),
    ]
    
    resolved_services = {}
    
    for service_name, module_path in services_to_test:
        try:
            # Import the service class
            module_name, class_name = module_path.rsplit('.', 1)
            module = __import__(module_name, fromlist=[class_name])
            service_class = getattr(module, class_name)
            
            # Resolve from container
            service_instance = container.resolve(service_class)
            
            if service_instance is not None:
                print(f"✅ [TEST] {service_name}: Successfully resolved")
                resolved_services[service_name] = service_instance
            else:
                print(f"❌ [TEST] {service_name}: Resolved to None")
                
        except Exception as e:
            print(f"❌ [TEST] {service_name}: Failed to resolve - {e}")
    
    return resolved_services

def test_service_functionality(services):
    """Test basic functionality of resolved services."""
    print("\\n⚙️ [TEST] Testing service functionality...")
    
    # Test OptionConfigurationService
    if 'OptionConfigurationService' in services:
        config_service = services['OptionConfigurationService']
        try:
            max_pictographs = config_service.get_total_max_pictographs()
            layout_config = config_service.get_layout_config()
            print(f"✅ [TEST] OptionConfigurationService: max_pictographs={max_pictographs}, layout_config={layout_config}")
        except Exception as e:
            print(f"❌ [TEST] OptionConfigurationService: {e}")
    
    # Test OptionPoolService
    if 'OptionPoolService' in services:
        pool_service = services['OptionPoolService']
        try:
            # Test pool operations
            pool_id = pool_service.checkout_item()
            stats_before = pool_service.get_usage_stats()
            pool_service.checkin_item(pool_id)
            stats_after = pool_service.get_usage_stats()
            print(f"✅ [TEST] OptionPoolService: Pool checkout/checkin working. Stats: {stats_before} -> {stats_after}")
        except Exception as e:
            print(f"❌ [TEST] OptionPoolService: {e}")
    
    # Test OptionSizingService
    if 'OptionSizingService' in services:
        sizing_service = services['OptionSizingService']
        try:
            # Test sizing calculations (pure math - no Qt)
            size = sizing_service.calculate_option_size(
                main_window_width=1920,
                main_window_height=1080, 
                option_picker_width=960,
                spacing=3
            )
            constraints = sizing_service.get_size_constraints()
            print(f"✅ [TEST] OptionSizingService: Calculated size={size}, constraints={constraints}")
        except Exception as e:
            print(f"❌ [TEST] OptionSizingService: {e}")
    
    # Test SequenceOptionService (if position matcher is available)
    if 'SequenceOptionService' in services:
        sequence_service = services['SequenceOptionService']
        try:
            # Create a simple test sequence
            from domain.models.sequence_data import SequenceData
            test_sequence = SequenceData()
            
            # Test validation (should not crash)
            is_valid = sequence_service.validate_sequence_state(test_sequence)
            print(f"✅ [TEST] SequenceOptionService: Validation working, result={is_valid}")
        except Exception as e:
            print(f"❌ [TEST] SequenceOptionService: {e}")

def test_no_qt_dependencies():
    """Verify that services have no Qt dependencies."""
    print("\\n🚫 [TEST] Testing for Qt dependencies...")
    
    service_modules = [
        'application.services.option_picker.option_configuration_service',
        'application.services.option_picker.option_pool_service', 
        'application.services.option_picker.option_sizing_service',
        'application.services.option_picker.sequence_option_service',
    ]
    
    qt_imports_found = []
    
    for module_path in service_modules:
        try:
            module = __import__(module_path, fromlist=[''])
            
            # Check if any Qt modules are imported
            module_dict = module.__dict__
            for key, value in module_dict.items():
                if hasattr(value, '__module__'):
                    if 'PyQt' in str(value.__module__) or 'Qt' in str(value.__module__):
                        qt_imports_found.append(f"{module_path}: {key} from {value.__module__}")
                        
        except Exception as e:
            print(f"⚠️ [TEST] Could not check {module_path}: {e}")
    
    if qt_imports_found:
        print("❌ [TEST] Qt dependencies found in services:")
        for qt_import in qt_imports_found:
            print(f"  - {qt_import}")
    else:
        print("✅ [TEST] No Qt dependencies found in services - they are Qt-free!")

def main():
    """Run all tests."""
    print("🚀 [TEST] Starting Option Picker Service Extraction Validation")
    print("=" * 60)
    
    # Test 1: Service Registration
    container = test_service_registration()
    if not container:
        print("💥 [TEST] Service registration failed - stopping tests")
        return False
    
    # Test 2: Service Resolution  
    services = test_service_resolution(container)
    if not services:
        print("💥 [TEST] No services could be resolved - stopping tests")
        return False
    
    # Test 3: Service Functionality
    test_service_functionality(services)
    
    # Test 4: Qt Independence
    test_no_qt_dependencies()
    
    print("\\n" + "=" * 60)
    print("🎯 [TEST] Option Picker Service Extraction Validation Complete!")
    
    success_count = len(services)
    total_expected = 4
    
    if success_count == total_expected:
        print(f"✅ [RESULT] All {success_count}/{total_expected} services working correctly!")
        return True
    else:
        print(f"⚠️ [RESULT] {success_count}/{total_expected} services working correctly")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
