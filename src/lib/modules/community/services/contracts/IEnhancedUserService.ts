/**
 * IEnhancedUserService
 * Service contract for enhanced user profiles with gamification data
 */

import type {
  CreatorQueryOptions,
  EnhancedUserProfile,
} from "../../domain/models/enhanced-user-profile";

export interface IEnhancedUserService {
  /**
   * Get enhanced user profile by ID
   */
  getEnhancedUserProfile(userId: string): Promise<EnhancedUserProfile | null>;

  /**
   * Get multiple enhanced user profiles (for creator browsing)
   */
  getEnhancedUsers(
    options?: CreatorQueryOptions
  ): Promise<EnhancedUserProfile[]>;

  /**
   * Get featured creators
   */
  getFeaturedCreators(limit?: number): Promise<EnhancedUserProfile[]>;

  /**
   * Subscribe to enhanced user profiles (for creator browsing)
   */
  subscribeToEnhancedUsers(
    callback: (users: EnhancedUserProfile[]) => void,
    options?: CreatorQueryOptions
  ): () => void;

  /**
   * Search users by username or display name
   */
  searchUsers(query: string, limit?: number): Promise<EnhancedUserProfile[]>;
}
