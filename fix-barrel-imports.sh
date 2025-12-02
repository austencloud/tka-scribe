#!/bin/bash
# Script to fix all barrel imports in pictograph module

# Fix utils barrel imports
find src/lib -type f \( -name "*.ts" -o -name "*.svelte" \) -exec sed -i 's|from "\$lib/shared/pictograph/tka-glyph/utils"|from "$lib/shared/pictograph/tka-glyph/utils/letter-image-getter"|g' {} +
find src/lib -type f \( -name "*.ts" -o -name "*.svelte" \) -exec sed -i 's|from "\.\./\.\./\.\./pictograph/tka-glyph/utils"|from "../../../pictograph/tka-glyph/utils/letter-image-getter"|g' {} +

# Fix models barrel imports
find src/lib -type f \( -name "*.ts" -o -name "*.svelte" \) -exec sed -i 's|from "\$lib/shared/pictograph/shared/domain/models"|from "$lib/shared/pictograph/shared/domain/models/MotionData"|g' {} +

# Fix factories barrel imports
find src/lib -type f \( -name "*.ts" -o -name "*.svelte" \) -exec sed -i 's|from "\$lib/shared/pictograph/shared/domain/factories"|from "$lib/shared/pictograph/shared/domain/factories/createPictographData"|g' {} +

# Fix components barrel imports
find src/lib -type f \( -name "*.ts" -o -name "*.svelte" \) -exec sed -i 's|{ Pictograph } from "\$lib/shared/pictograph/shared/components"|Pictograph from "$lib/shared/pictograph/shared/components/Pictograph.svelte"|g' {} +
find src/lib -type f \( -name "*.ts" -o -name "*.svelte" \) -exec sed -i 's|{ TKAGlyph } from "\.\./\.\./tka-glyph"|TKAGlyph from "../../tka-glyph/components/TKAGlyph.svelte"|g' {} +

# Fix grid/domain barrel imports
find src/lib -type f \( -name "*.ts" -o -name "*.svelte" \) -exec sed -i 's|from "\.\./\.\./pictograph/grid/domain"|from "../../pictograph/grid/domain/enums/grid-enums"|g' {} +

# Fix prop/domain barrel imports
find src/lib -type f \( -name "*.ts" -o -name "*.svelte" \) -exec sed -i 's|from "\.\./\.\./pictograph/prop/domain"|from "../../pictograph/prop/domain/PropTypeDisplayRegistry"|g' {} +
find src/lib -type f \( -name "*.ts" -o -name "*.svelte" \) -exec sed -i 's|from "\.\./\.\./\.\./\.\./pictograph/prop/domain"|from "../../../../pictograph/prop/domain/PropTypeDisplayRegistry"|g' {} +

# Fix services/contracts barrel imports
find src/lib -type f \( -name "*.ts" -o -name "*.svelte" \) -exec sed -i 's|from "\$lib/shared/pictograph/prop/services/contracts"|from "$lib/shared/pictograph/prop/services/contracts/IOrientationCalculationService"|g' {} +
find src/lib -type f \( -name "*.ts" -o -name "*.svelte" \) -exec sed -i 's|from "\.\./\.\./grid/services/contracts"|from "../../grid/services/contracts/IGridModeDeriver"|g' {} +

# Fix implementations barrel imports
find src/lib -type f \( -name "*.ts" -o -name "*.svelte" \) -exec sed -i 's|from "\$lib/shared/pictograph/arrow/positioning/placement/services/implementations"|from "$lib/shared/pictograph/arrow/positioning/placement/services/implementations/RotationOverrideManager"|g' {} +

echo "Barrel import fixes applied!"
