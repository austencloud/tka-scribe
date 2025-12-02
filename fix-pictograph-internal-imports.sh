#!/bin/bash
# Fix all internal pictograph barrel imports

cd "F:\_THE KINETIC ALPHABET\_TKA-STUDIO"

echo "Fixing internal pictograph module barrel imports..."

# Fix arrow orchestration domain imports
find src/lib/shared/pictograph/arrow/orchestration -name "*.ts" -exec sed -i 's|from "\.\./\.\./domain"|from "../../domain/arrow-models"|g' {} +

# Fix arrow orchestration contracts imports  
find src/lib/shared/pictograph/arrow/orchestration/services/implementations -name "*.ts" -exec sed -i 's|from "\.\./contracts"|from "../contracts/IArrowAdjustmentProcessor"|g' {} +

# Fix grid barrel imports (4 levels deep)
find src/lib/shared/pictograph/arrow -name "*.ts" -exec sed -i 's|from "\.\./\.\./\.\./\.\./grid"|from "../../../../grid/domain/enums/grid-enums"|g' {} +
find src/lib/shared/pictograph/arrow -name "*.ts" -exec sed -i 's|from "\.\./\.\./\.\./\.\./\.\./grid"|from "../../../../../grid/domain/enums/grid-enums"|g' {} +

# Fix shared barrel imports
find src/lib/shared/pictograph/arrow -name "*.ts" -exec sed -i 's|from "\.\./\.\./\.\./\.\./shared"|from "../../../../shared/domain/enums/pictograph-enums"|g' {} +

# Fix positioning barrel imports
find src/lib/shared/pictograph/arrow/orchestration -name "*.ts" -exec sed -i 's|from "\.\./\.\./\.\./positioning"|from "../../../positioning/calculation/services/contracts/IArrowLocationCalculator"|g' {} +
find src/lib/shared/pictograph/arrow/orchestration -name "*.ts" -exec sed -i 's|from "\.\./\.\./\.\./positioning/services"|from "../../../positioning/services/contracts/IArrowPositioningOrchestrator"|g' {} +

# Fix rendering barrel imports
find src/lib/shared/pictograph/arrow/orchestration -name "*.ts" -exec sed -i 's|from "\.\./\.\./\.\./rendering"|from "../../../rendering/services/contracts/IArrowRenderer"|g' {} +

# Fix key-generation barrel imports
find src/lib/shared/pictograph/arrow/positioning/placement -name "*.ts" -exec sed -i 's|from "\.\./\.\./\.\./key-generation"|from "../../../key-generation/services/implementations/SpecialPlacementOriKeyGenerator"|g' {} +

# Fix placement domain barrel imports
find src/lib/shared/pictograph/arrow/positioning/placement -name "*.ts" -exec sed -i 's|from "\.\./\.\./domain"|from "../../domain/ArrowPlacementData"|g' {} +

# Fix calculation contracts barrel imports
find src/lib/shared/pictograph/arrow/positioning -name "*.ts" -exec sed -i 's|from "\.\./\.\./\.\./positioning/calculation/services/contracts"|from "../../../positioning/calculation/services/contracts/IArrowLocationCalculator"|g' {} +
find src/lib/shared/pictograph/arrow/positioning -name "*.ts" -exec sed -i 's|from "\.\./contracts"|from "../contracts/IArrowLocationCalculator"|g' {} +

# Fix placement services contracts barrel imports
find src/lib/shared/pictograph/arrow/positioning -name "*.ts" -exec sed -i 's|from "\.\./\.\./\.\./placement/services/contracts"|from "../../../placement/services/contracts/ISpecialPlacementService"|g' {} +
find src/lib/shared/pictograph/arrow/positioning -name "*.ts" -exec sed -i 's|from "\.\./\.\./placement/services/contracts"|from "../../placement/services/contracts/ISpecialPlacementService"|g' {} +

echo "Internal pictograph barrel imports fixed!"
