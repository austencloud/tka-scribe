#!/bin/bash

cd "F:\_THE KINETIC ALPHABET\_TKA-STUDIO"

# Fix arrow rendering contracts
sed -i 's|from "\.\./contracts"|from "../contracts/IArrowPathResolver"|g' src/lib/shared/pictograph/arrow/rendering/services/implementations/ArrowPathResolver.ts
sed -i 's|from "\.\./contracts"|from "../contracts/IArrowRenderer"|g' src/lib/shared/pictograph/arrow/rendering/services/implementations/ArrowRenderer.ts

# Fix arrow rendering positioning imports
sed -i 's|from "\.\./\.\./\.\./positioning"|from "../../../positioning/placement/domain/ArrowPlacementData"|g' src/lib/shared/pictograph/arrow/rendering/services/implementations/ArrowPathResolver.ts

# Fix arrow rendering orchestration imports
sed -i 's|from "\.\./\.\./\.\./orchestration"|from "../../../orchestration/domain/arrow-models"|g' src/lib/shared/pictograph/arrow/rendering/services/implementations/ArrowRenderer.ts
sed -i 's|from "\.\./\.\./\.\./positioning"|from "../../../positioning/placement/domain/ArrowPlacementData"|g' src/lib/shared/pictograph/arrow/rendering/services/implementations/ArrowRenderer.ts

# Fix grid domain imports
sed -i 's|from "\.\./\.\./domain"|from "../../domain/enums/grid-enums"|g' src/lib/shared/pictograph/grid/services/contracts/IGridRenderingService.ts
sed -i 's|from "\.\./domain"|from "../domain/enums/grid-enums"|g' src/lib/shared/pictograph/grid/utils/grid-coordinate-utils.ts
sed -i 's|from "\.\./domain"|from "../domain/enums/grid-enums"|g' src/lib/shared/pictograph/grid/utils/grid-data-utils.ts

# Fix grid services contracts
sed -i 's|from "\.\./contracts"|from "../contracts/IGridModeDeriver"|g' src/lib/shared/pictograph/grid/services/implementations/GridModeDeriver.ts
sed -i 's|from "\.\./contracts"|from "../contracts/IGridPositionDeriver"|g' src/lib/shared/pictograph/grid/services/implementations/GridPositionDeriver.ts

# Fix prop domain imports
sed -i 's|from "\.\./\.\./\.\./grid"|from "../../../grid/domain/enums/grid-enums"|g' src/lib/shared/pictograph/prop/services/implementations/OrientationCalculator.ts
sed -i 's|from "\.\./\.\./domain"|from "../../domain/enums/PropType"|g' src/lib/shared/pictograph/prop/services/implementations/OrientationCalculator.ts
sed -i 's|from "\.\./domain/models"|from "../domain/models/PropPlacementData"|g' src/lib/shared/pictograph/prop/state/PropState.svelte.ts

# Fix shared domain imports
sed -i 's|from "\.\./models"|from "../models/PictographData"|g' src/lib/shared/pictograph/shared/domain/factories/createPictographData.ts
sed -i 's|from "\.\./enums"|from "../enums/pictograph-enums"|g' src/lib/shared/pictograph/shared/domain/models/MotionData.ts
sed -i 's|from "\.\./enums"|from "../enums/pictograph-enums"|g' src/lib/shared/pictograph/shared/domain/utils/vtg-calculator.ts

# Fix shared domain schemas imports
sed -i 's|from "\.\./\.\./\.\./grid/domain"|from "../../../grid/domain/enums/grid-enums"|g' src/lib/shared/pictograph/shared/domain/schemas/pictograph-schemas.ts
sed -i 's|from "\.\./\.\./\.\./prop/domain"|from "../../../prop/domain/enums/PropType"|g' src/lib/shared/pictograph/shared/domain/schemas/pictograph-schemas.ts

# Fix shared services imports
sed -i 's|from "\.\./\.\./domain/models"|from "../../domain/models/PictographData"|g' src/lib/shared/pictograph/shared/services/implementations/DataTransformer.ts
sed -i 's|from "\.\./\.\./\.\./arrow/orchestration/services/contracts"|from "../../../arrow/orchestration/services/contracts/IArrowLifecycleManager"|g' src/lib/shared/pictograph/shared/services/implementations/PictographCoordinator.ts

# Fix shared state imports
sed -i 's|from "\.\./\.\./prop/domain/models"|from "../../prop/domain/models/PropPlacementData"|g' src/lib/shared/pictograph/shared/state/pictograph-state.old.svelte.ts
sed -i 's|from "\.\./\.\./prop/domain/models"|from "../../prop/domain/models/PropPlacementData"|g' src/lib/shared/pictograph/shared/state/pictograph-state.svelte.ts
sed -i 's|from "\.\./\.\./\.\./prop/domain/models"|from "../../../prop/domain/models/PropPlacementData"|g' src/lib/shared/pictograph/shared/state/sub-states/PictographPropState.svelte.ts

# Fix shared utils imports
sed -i 's|from "\.\./\.\./arrow/rendering/services/contracts"|from "../../arrow/rendering/services/contracts/IArrowRenderer"|g' src/lib/shared/pictograph/shared/utils/pictograph-rendering-utils.ts
sed -i 's|from "\.\./\.\./grid"|from "../../grid/domain/enums/grid-enums"|g' src/lib/shared/pictograph/shared/utils/pictograph-rendering-utils.ts

# Fix tka-glyph imports
sed -i 's|from "\.\./\.\./\.\./grid"|from "../../../grid/domain/enums/grid-enums"|g' src/lib/shared/pictograph/tka-glyph/services/implementations/LetterDeriver.ts

# Fix arrow positioning calculation contracts
sed -i 's|from "\.\./\.\./\.\./positioning/calculation/services/contracts"|from "../../../positioning/calculation/services/contracts/IArrowAdjustmentCalculator"|g' src/lib/shared/pictograph/arrow/orchestration/services/implementations/ArrowPositioningOrchestrator.ts

# Fix arrow placement key service contracts
sed -i 's|from "\.\./contracts/IArrowLocationCalculator"|from "../contracts/IArrowKeyGenerationService"|g' src/lib/shared/pictograph/arrow/positioning/key-generation/services/implementations/ArrowPlacementKeyService.ts

# Fix arrow placement service contracts
sed -i 's|from "\.\./contracts/IArrowLocationCalculator"|from "../contracts/IArrowPlacementService"|g' src/lib/shared/pictograph/arrow/positioning/placement/services/implementations/ArrowPlacementService.ts
sed -i 's|from "\.\./contracts/IArrowLocationCalculator"|from "../contracts/ISpecialPlacementService"|g' src/lib/shared/pictograph/arrow/positioning/placement/services/implementations/SpecialPlacementService.ts

echo "Remaining imports fixed!"
