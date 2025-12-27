/**
 * Library Module - InversifyJS DI Container Configuration
 *
 * Registers all library services with the dependency injection container.
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";

// Contracts
import type { ILibraryRepository } from "../../../features/library/services/contracts/ILibraryRepository";
import type { ILibrarySaveService } from "../../../features/library/services/contracts/ILibrarySaveService";
import type { ICollectionManager } from "../../../features/library/services/contracts/ICollectionManager";
// import type { ILibraryActManager } from "../../../features/library/services/contracts/ILibraryActManager";
// import type { IForkService } from "../../../features/library/services/contracts/IForkService";
// import type { ILibraryMigrationService } from "../../../features/library/services/contracts/ILibraryMigrationService";

// Implementations
import { LibraryRepository } from "../../../features/library/services/implementations/LibraryRepository";
import { LibrarySaveService } from "../../../features/library/services/implementations/LibrarySaveService";
import { CollectionManager } from "../../../features/library/services/implementations/CollectionManager";
// import { LibraryActManager } from "../../../features/library/services/implementations/LibraryActManager";
// import { ForkService } from "../../../features/library/services/implementations/ForkService";
// import { LibraryMigrationService } from "../../../features/library/services/implementations/LibraryMigrationService";

/**
 * Library Module
 *
 * Provides:
 * - ILibraryRepository: Core sequence CRUD operations
 * - ICollectionManager: Collection management (including Favorites)
 * - ILibraryActManager: Act/playlist management (TODO)
 * - IForkService: Forking sequences from other users (TODO)
 * - ILibraryMigrationService: IndexedDB to Firestore migration (TODO)
 */
export const libraryModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // Core Library Service
    options
      .bind<ILibraryRepository>(TYPES.ILibraryRepository)
      .to(LibraryRepository)
      .inSingletonScope();

    // Library Save Service (orchestrates multi-step save workflow)
    options
      .bind<ILibrarySaveService>(TYPES.ILibrarySaveService)
      .to(LibrarySaveService)
      .inSingletonScope();

    // Collection Service (includes system collections like Favorites)
    options
      .bind<ICollectionManager>(TYPES.ICollectionManager)
      .to(CollectionManager)
      .inSingletonScope();

    // Act Service (TODO: Implement)
    // options
    //   .bind<ILibraryActManager>(TYPES.ILibraryActManager)
    //   .to(LibraryActManager)
    //   .inSingletonScope();

    // Fork Service (TODO: Implement)
    // options
    //   .bind<IForkService>(TYPES.IForkService)
    //   .to(ForkService)
    //   .inSingletonScope();

    // Migration Service (TODO: Implement)
    // options
    //   .bind<ILibraryMigrationService>(TYPES.ILibraryMigrationService)
    //   .to(LibraryMigrationService)
    //   .inSingletonScope();
  }
);
