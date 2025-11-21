# Agent 4: Edge Case Warnings (3 warnings)

## Your Mission
Fix the remaining edge case warnings that need individual attention.

## Warnings to Fix

### 1. await-thenable (2 warnings)
These are awaiting non-Promise values unnecessarily.

**ConstructCoordinator.ts - Line 79**
```
Unexpected `await` of a non-Promise (non-"Thenable") value.
```
- **Fix**: Remove the `await` keyword - the value is not async

**CreateModuleInitializationService.ts - Line 109**
```
Unexpected `await` of a non-Promise (non-"Thenable") value.
```
- **Fix**: Remove the `await` keyword - the value is not async

### 2. no-unsafe-call (1 warning)
Location TBD - check the full ESLint output for specifics
- **Fix**: Add proper typing to the function being called

### 3. no-unsafe-member-access (1 warning)
Location TBD - check the full ESLint output for specifics
- **Fix**: Add proper typing to the object whose member is being accessed

## Instructions
1. Get the full ESLint JSON output to find exact locations
2. For `await-thenable`: Simply remove unnecessary `await` keywords
3. For `no-unsafe-call` and `no-unsafe-member-access`: Add proper types to eliminate `any`
4. Test that async behavior still works correctly after removing awaits

## Success Criteria
All 3 edge case warnings resolved with proper fixes.
