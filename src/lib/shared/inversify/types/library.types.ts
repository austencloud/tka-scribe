/**
 * Library Service Type Identifiers
 *
 * Services for managing user sequence libraries and collections.
 */

export const LibraryTypes = {
  ILibraryService: Symbol.for("ILibraryService"),
  ICollectionService: Symbol.for("ICollectionService"),
  ILibraryActService: Symbol.for("ILibraryActService"),
  ILibraryQueryService: Symbol.for("ILibraryQueryService"),
  IForkService: Symbol.for("IForkService"),
  ILibraryMigrationService: Symbol.for("ILibraryMigrationService"),
} as const;
