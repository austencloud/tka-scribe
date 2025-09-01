# TKA Domain Reorganization Plan

## 🎯 **GOAL: Clean Separation with "Models" Terminology**

Reorganize domain layer to separate:

- **Models** (interfaces/domain objects)
- **Types** (type aliases, unions, primitives)
- **Enums** (enumerated values - keep together)

## 🏗️ **TARGET STRUCTURE**

```
domain/
├── models/              # Domain Models (interfaces)
│   ├── SequenceData.ts
│   ├── BeatData.ts
│   ├── PictographData.ts
│   ├── DeviceCapabilities.ts
│   ├── BackgroundModels.ts  # Split from BackgroundTypes.ts
│   └── [other model files]
├── types/               # Type Aliases & Unions
│   ├── LayoutTypes.ts
│   ├── BackgroundTypes.ts   # type BackgroundTypeString = ...
│   ├── CommonTypes.ts
│   └── [other type files]
├── enums.ts             # Keep ALL enums together ✅ (don't split)
└── [existing subdirectories remain]
```

## 📋 **MIGRATION STEPS**

### **Phase 1: Create New Structure**

1. Create `domain/models/` directory
2. Create `domain/types/` directory
3. Keep `enums.ts` exactly as-is (perfect size ~200 lines)

### **Phase 2: Move Pure Interface Files**

Move files that are primarily interfaces:

- `SequenceData.ts` → `models/SequenceData.ts`
- `BeatData.ts` → `models/BeatData.ts`
- `PictographData.ts` → `models/PictographData.ts`
- `DeviceCapabilities.ts` → `models/DeviceCapabilities.ts`

### **Phase 3: Split Mixed Files**

Split files that mix interfaces + types + enums:

- `BackgroundTypes.ts`:
  - Interfaces → `models/BackgroundModels.ts`
  - Type aliases → `types/BackgroundTypes.ts`
  - Enums → keep in main `enums.ts`

### **Phase 4: Update All Imports**

- Update all import statements throughout codebase
- Use context engine to find all import locations
- Verify TypeScript compilation succeeds

### **Phase 5: Clean Up**

- Remove old files after successful migration
- Update barrel exports (`index.ts` files)
- Update path aliases if needed

## 🚨 **RULES**

- **Don't over-engineer**: Keep enums together unless 500+ lines
- **Use context engine**: Always check imports before moving files
- **Validate each step**: Run TypeScript checks after each phase
- **One file at a time**: Don't bulk move - validate incrementally

## 📊 **CURRENT DATA-INTERFACES MIGRATION STATUS**

Files completed in data-interfaces migration:

- ✅ image-format-interfaces-data.ts: COMPLETE
- ✅ option-picker-interfaces-data.ts: COMPLETE
- ✅ other-types.ts: COMPLETE
- ✅ panel-interfaces-data.ts: COMPLETE
- ✅ pictograph-interfaces-data.ts: COMPLETE
- ✅ positioning-interfaces-data.ts: COMPLETE
- ✅ responsive-settings.ts: COMPLETE
- ✅ ResponsiveSettings architectural fix: COMPLETE

**COMPLETED:**

- ✅ sequence-card-export-interfaces-data.ts: COMPLETE → models/export/SequenceCardExport.ts
- ✅ svg-conversion-interfaces-data.ts: COMPLETE → models/rendering/SvgConversion.ts

## 🎉 **MIGRATION 100% COMPLETE!**

All data-interfaces files have been successfully migrated to the new structured models directory.
