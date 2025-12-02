#!/bin/bash
# Comprehensive script to fix all pictograph barrel imports after barrel file deletion

cd "F:\_THE KINETIC ALPHABET\_TKA-STUDIO"

echo "Fixing pictograph barrel imports..."

# Fix tka-glyph/utils barrel
sed -i 's|from "\$lib/shared/pictograph/tka-glyph/utils"|from "$lib/shared/pictograph/tka-glyph/utils/letter-image-getter"|g' src/lib/features/animate/services/implementations/GifExportOrchestrator.ts
sed -i 's|from "\.\./\.\./\.\./pictograph/tka-glyph/utils"|from "../../../pictograph/tka-glyph/utils/letter-image-getter"|g' src/lib/shared/render/services/implementations/GlyphCacheService.ts

# Fix prop/services/contracts barrel
sed -i 's|from "\$lib/shared/pictograph/prop/services/contracts"|from "$lib/shared/pictograph/prop/services/contracts/IOrientationCalculationService"|g' src/lib/features/create/generate/shared/services/contracts/index.ts
sed -i 's|from "\$lib/shared/pictograph/prop/services/contracts/IOrientationCalculator"|from "$lib/shared/pictograph/prop/services/contracts/IOrientationCalculationService"|g' src/lib/features/create/shared/services/implementations/CreateModuleEventService.ts

# Fix main pictograph barrel
sed -i 's|from "\.\./\.\./pictograph"|from "../../pictograph/grid/domain/enums/grid-enums"|g' src/lib/shared/application/state/app-state.svelte.ts
sed -i 's|from "\.\./\.\./pictograph"|from "../../pictograph/shared/services/implementations/CSVPictographParser"|g' src/lib/shared/inversify/modules/data.module.ts

# Fix shared/domain/schemas barrel
sed -i 's|from "\.\./\.\./pictograph/shared/domain/schemas"|from "../../pictograph/shared/domain/schemas/pictograph-schemas"|g' src/lib/shared/foundation/domain/schemas.ts

# Fix arrow orchestration domain barrel
sed -i 's|from "\.\./\.\./domain"|from "../../domain/arrow-models"|g' src/lib/shared/pictograph/arrow/orchestration/services/contracts/IArrowLifecycleManager.ts
sed -i 's|from "\.\./\.\./domain"|from "../../domain/arrow-factories"|g' src/lib/shared/pictograph/arrow/orchestration/services/implementations/ArrowLifecycleManager.ts

# Fix grid barrel
sed -i 's|from "\.\./\.\./\.\./\.\./grid"|from "../../../../grid/domain/enums/grid-enums"|g' src/lib/shared/pictograph/arrow/orchestration/services/implementations/ArrowAdjustmentProcessor.ts
sed -i 's|from "\.\./\.\./\.\./\.\./\.\./grid"|from "../../../../../grid/domain/enums/grid-enums"|g' src/lib/shared/pictograph/arrow/positioning/placement/services/implementations/RotationOverrideManager.ts
sed -i 's|from "\.\./\.\./\.\./\.\./\.\./grid"|from "../../../../../grid/domain/enums/grid-enums"|g' src/lib/shared/pictograph/arrow/positioning/placement/services/implementations/SpecialPlacementService.ts

# Fix shared barrel
sed -i 's|from "\.\./\.\./\.\./\.\./shared"|from "../../../../shared/domain/enums/pictograph-enums"|g' src/lib/shared/pictograph/arrow/orchestration/services/implementations/ArrowAdjustmentProcessor.ts

# Fix positioning barrel
sed -i 's|from "\.\./\.\./\.\./positioning"|from "../../../positioning/calculation/services/contracts/IArrowLocationCalculator"|g' src/lib/shared/pictograph/arrow/orchestration/services/implementations/ArrowAdjustmentProcessor.ts

# Fix contracts barrel in arrow orchestration
sed -i 's|from "\.\./contracts"|from "../contracts/IArrowAdjustmentProcessor"|g' src/lib/shared/pictograph/arrow/orchestration/services/implementations/ArrowAdjustmentProcessor.ts

# Fix rendering barrel
sed -i 's|from "\.\./\.\./\.\./rendering"|from "../../../rendering/services/contracts/IArrowRenderer"|g' src/lib/shared/pictograph/arrow/orchestration/services/implementations/ArrowLifecycleManager.ts

# Fix positioning services barrel
sed -i 's|from "\.\./\.\./\.\./positioning/services"|from "../../../positioning/services/contracts/IArrowPositioningOrchestrator"|g' src/lib/shared/pictograph/arrow/orchestration/services/implementations/ArrowLifecycleManager.ts

# Fix key-generation barrel
sed -i 's|from "\.\./\.\./\.\./key-generation"|from "../../../key-generation/services/implementations/SpecialPlacementOriKeyGenerator"|g' src/lib/shared/pictograph/arrow/positioning/placement/services/implementations/RotationOverrideManager.ts
sed -i 's|from "\.\./\.\./\.\./key-generation"|from "../../../key-generation/services/implementations/SpecialPlacementOriKeyGenerator"|g' src/lib/shared/pictograph/arrow/positioning/placement/services/implementations/SpecialPlacementService.ts

# Fix placement domain barrel
sed -i 's|from "\.\./\.\./domain"|from "../../domain/ArrowPlacementData"|g' src/lib/shared/pictograph/arrow/positioning/placement/services/implementations/ArrowPlacementService.ts

echo "All pictograph barrel imports fixed!"
