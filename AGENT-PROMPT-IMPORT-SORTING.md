# Agent Task: Fix All Import Sorting Issues

## Objective

Fix all `simple-import-sort/imports` warnings in the codebase.

## Instructions

1. Run `npm run lint:fix` first - this will auto-fix most import sorting issues
2. Run `npm run lint` to see remaining errors
3. Focus ONLY on errors with rule ID: `simple-import-sort/imports`
4. For any remaining import sort issues, manually reorganize imports according to the pattern

## Import Order Pattern

Imports should be organized in this order:

1. Node built-ins (e.g., `fs`, `path`)
2. External packages (e.g., `firebase`, `svelte`)
3. Internal absolute imports (e.g., `$lib/...`)
4. Relative imports from parent directories (e.g., `../../`)
5. Relative imports from current directory (e.g., `./`)
6. Type imports (if separated)

Within each group, sort alphabetically.

## Example

```typescript
// BEFORE (incorrect order)
import { someUtil } from "./utils";
import type { User } from "$lib/types";
import { getFirestore } from "firebase/firestore";
import Container from "$lib/di/container";
import path from "path";

// AFTER (correct order)
import path from "path";

import { getFirestore } from "firebase/firestore";

import Container from "$lib/di/container";
import type { User } from "$lib/types";

import { someUtil } from "./utils";
```

## Success Criteria

- All `simple-import-sort/imports` errors are resolved
- Imports are clean and well-organized
- No new errors were introduced
