"""
Option Picker Service Registration

Registers all option picker microservices with the DI container.
Provides clean dependency injection setup for option picker components.
"""

from application.services.option_picker.option_configuration_service import (
    OptionConfigurationService,
)
from application.services.option_picker.option_picker_size_calculator import (
    OptionPickerSizeCalculator,
)
from application.services.option_picker.option_pool_service import OptionPoolService
from application.services.option_picker.sequence_option_service import (
    SequenceOptionService,
)
from application.services.pictograph_pool_manager import PictographPoolManager
from application.services.positioning.arrows.utilities.pictograph_position_matcher import (
    PictographPositionMatcher,
)
from core.dependency_injection.di_container import DIContainer


def register_option_picker_services(container: DIContainer) -> None:
    """
    Register all option picker microservices with the DI container.

    Sets up clean dependency injection for:
    - SequenceOptionService (business logic for option generation)
    - OptionPoolService (pool management logic)
    - OptionSizingService (sizing calculation logic)
    - OptionConfigurationService (configuration management)
    """
    try:
        # Register configuration service first (no dependencies)
        container.register_singleton(
            OptionConfigurationService, OptionConfigurationService
        )

        # Register pool service (no dependencies)
        container.register_singleton(OptionPoolService, OptionPoolService)

        # Register sizing service (no dependencies)
        container.register_singleton(
            OptionPickerSizeCalculator, OptionPickerSizeCalculator
        )

        # Register sequence option service (depends on PictographPositionMatcher)
        container.register_factory(
            SequenceOptionService,
            lambda c: SequenceOptionService(
                position_matcher=c.resolve(PictographPositionMatcher)
            ),
        )

    except Exception as e:
        print(
            f"❌ [SERVICE_REGISTRATION] Error registering option picker services: {e}"
        )
        raise


def register_option_picker_components(container: DIContainer) -> None:
    """
    Register option picker presentation components with the DI container.

    Note: This may not be needed if components are created directly by the UI layer.
    """
    try:
        # These registrations are optional since components are typically created by UI layer
        # But can be useful for testing or factory pattern usage

        from presentation.components.option_picker.components.option_picker_scroll import (
            OptionPickerScroll,
        )
        from presentation.components.option_picker.components.option_picker_widget import (
            OptionPickerWidget,
        )

        # Register OptionPickerScroll with all its service dependencies
        container.register_factory(
            OptionPickerScroll,
            lambda c: OptionPickerScroll(
                sequence_option_service=c.resolve(SequenceOptionService),
                option_pool_service=c.resolve(OptionPoolService),
                option_sizing_service=c.resolve(OptionPickerSizeCalculator),
                option_config_service=c.resolve(OptionConfigurationService),
                pictograph_pool_manager=c.resolve(PictographPoolManager),
            ),
        )

        # Register OptionPickerWidget (which uses OptionPickerScroll)
        container.register_factory(
            OptionPickerWidget, lambda c: OptionPickerWidget(container=c)
        )

        print("✅ [SERVICE_REGISTRATION] Registered option picker components")

    except Exception as e:
        print(
            f"❌ [SERVICE_REGISTRATION] Error registering option picker components: {e}"
        )
        # Don't raise - component registration is optional


def validate_option_picker_registrations(container: DIContainer) -> bool:
    """
    Validate that all option picker services are properly registered and resolvable.

    Returns True if all services can be resolved, False otherwise.
    """
    try:
        # Test resolution of all services
        services_to_test = [
            OptionConfigurationService,
            OptionPoolService,
            OptionPickerSizeCalculator,
            SequenceOptionService,
        ]

        for service_type in services_to_test:
            service = container.resolve(service_type)
            if service is None:
                print(f"❌ [VALIDATION] Failed to resolve {service_type.__name__}")
                return False
            print(f"✅ [VALIDATION] Successfully resolved {service_type.__name__}")

        print("🎯 [VALIDATION] All option picker services validated successfully")
        return True

    except Exception as e:
        print(f"❌ [VALIDATION] Error validating option picker services: {e}")
        return False
