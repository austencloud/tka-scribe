/**
 * Persistence Domain Models
 *
 * Barrel export for all data models used in the persistence domain.
 */

export * from "./FilteringModels";
export {
  createUserProject,
  isUserProject,
  type UserProject,
} from "./UserProject";
export {
  createUserWorkData,
  isUserWorkData,
  type UserWorkData,
} from "./UserWorkData";
