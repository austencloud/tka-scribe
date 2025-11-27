/**
 * Library Module - InversifyJS DI Container Configuration
 *
 * Registers all library services with the dependency injection container.
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";

// Contracts
import type { ILibraryService } from "../../../modules/library/services/contracts/ILibraryService";
// import type { ICollectionService } from "../../../modules/library/services/contracts/ICollectionService";
// import type { ILibraryActService } from "../../../modules/library/services/contracts/ILibraryActService";
// import type { IForkService } from "../../../modules/library/services/contracts/IForkService";
// import type { ILibraryMigrationService } from "../../../modules/library/services/contracts/ILibraryMigrationService";

// Implementations
import { LibraryService } from "../../../modules/library/services/implementations/LibraryService";
// import { CollectionService } from "../../../modules/library/services/implementations/CollectionService";
// import { LibraryActService } from "../../../modules/library/services/implementations/LibraryActService";
// import { ForkService } from "../../../modules/library/services/implementations/ForkService";
// import { LibraryMigrationService } from "../../../modules/library/services/implementations/LibraryMigrationService";

/**
 * Library Module
 *
 * Provides:
 * - ILibraryService: Core sequence CRUD operations
 * - ICollectionService: Collection management (TODO)
 * - ILibraryActService: Act/playlist management (TODO)
 * - IForkService: Forking sequences from other users (TODO)
 * - ILibraryMigrationService: IndexedDB to Firestore migration (TODO)
 */
export const libraryModule = new ContainerModule(
	(options: ContainerModuleLoadOptions) => {
		// Core Library Service
		options
			.bind<ILibraryService>(TYPES.ILibraryService)
			.to(LibraryService)
			.inSingletonScope();

		// Collection Service (TODO: Implement)
		// options
		//   .bind<ICollectionService>(TYPES.ICollectionService)
		//   .to(CollectionService)
		//   .inSingletonScope();

		// Act Service (TODO: Implement)
		// options
		//   .bind<ILibraryActService>(TYPES.ILibraryActService)
		//   .to(LibraryActService)
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
