"""
Image Export Service Registration

This module registers all image export services with the dependency injection container.
"""

import logging
from core.dependency_injection.di_container import DIContainer
from core.interfaces.image_export_services import (
    IImageExportService,
    IImageRenderer,
    ISequenceMetadataExtractor,
    IImageLayoutCalculator,
)
from application.services.image_export.modern_image_export_service import (
    ModernImageExportService,
)
from application.services.image_export.modern_image_renderer import ModernImageRenderer
from application.services.image_export.modern_metadata_extractor import (
    ModernMetadataExtractor,
)
from application.services.image_export.modern_layout_calculator import (
    ModernLayoutCalculator,
)

logger = logging.getLogger(__name__)


def register_image_export_services(container: DIContainer) -> None:
    """
    Register all image export services with the DI container.

    Args:
        container: The dependency injection container
    """
    logger.info("Registering image export services...")

    try:
        # First register pictograph services that image export depends on
        _register_pictograph_services(container)

        # Register core image export services as singletons
        # Pass container to image renderer so it can access pictograph services
        container.register_factory(
            IImageRenderer, lambda: ModernImageRenderer(container=container)
        )
        container.register_singleton(
            ISequenceMetadataExtractor, ModernMetadataExtractor
        )
        container.register_singleton(IImageLayoutCalculator, ModernLayoutCalculator)

        # Register main export service as singleton
        container.register_singleton(IImageExportService, ModernImageExportService)

        logger.info("Image export services registration completed successfully")

    except Exception as e:
        logger.error(f"Failed to register image export services: {e}", exc_info=True)
        raise


def _register_pictograph_services(container: DIContainer) -> None:
    """Register pictograph services needed for real pictograph rendering."""
    try:
        logger.info("Registering pictograph services for image export...")

        # Import and register the pictograph service registrar
        from application.services.core.registrars.pictograph_service_registrar import (
            PictographServiceRegistrar,
        )

        # Create and use the pictograph service registrar
        pictograph_registrar = PictographServiceRegistrar()
        pictograph_registrar.register_services(container)

        logger.info("Pictograph services registered for image export")

    except Exception as e:
        logger.warning(f"Failed to register pictograph services: {e}")
        logger.info("Image export will fall back to simplified pictograph rendering")
