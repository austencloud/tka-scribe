/**
 * Motion Tester Service Interface Definitions
 * Service interfaces for the motion testing system
 */

import { createServiceInterface } from "../types";

// Placeholder interface for animated pictograph data service
export interface IAnimatedPictographDataService {
  createAnimatedPictographData(state: any): Promise<any>;
}

// Placeholder service interface
export const IAnimatedPictographDataServiceInterface =
  createServiceInterface<IAnimatedPictographDataService>(
    "IAnimatedPictographDataService",
    class {
      async createAnimatedPictographData(state: any): Promise<any> {
        // Placeholder implementation
        return null;
      }
    }
  );
