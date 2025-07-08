"""
DEPRECATED: Core Domain Models - Backward Compatibility Module

This file is deprecated and will be removed in a future release.

All models and enums have been moved to their respective modules:
- Enums: domain.models.enums
- MotionData: domain.models.motion_models
- GlyphData: domain.models.glyph_models
- BeatData: domain.models.beat_models
- SequenceData: domain.models.sequence_models

Update your imports to use the new module paths directly.
"""

import warnings

warnings.warn(
    "domain.models.core_models is deprecated. Import models and enums from their new modules.",
    DeprecationWarning,
    stacklevel=2,
)
