/**
 * Library Service Type Identifiers
 *
 * Services for managing user sequence libraries and collections.
 */

export const LibraryTypes = {
  ILibraryRepository: Symbol.for("ILibraryRepository"),
  ILibrarySaveService: Symbol.for("ILibrarySaveService"),
  ICollectionManager: Symbol.for("ICollectionManager"),
  ILibraryActManager: Symbol.for("ILibraryActManager"),
  ILibraryQueryService: Symbol.for("ILibraryQueryService"),
  IForkService: Symbol.for("IForkService"),
  ILibraryMigrationService: Symbol.for("ILibraryMigrationService"),
} as const;
