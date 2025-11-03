/**
 * User Explore Service Interface
 *
 * Service for fetching and managing user data in the Explore module.
 */

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  email?: string;
  sequenceCount: number;
  collectionCount: number;
  followerCount: number;
  joinedDate: string;
  isFollowing?: boolean;
}

export interface IUserExploreService {
  /**
   * Fetch all users from Firestore (one-time fetch)
   */
  getAllUsers(): Promise<UserProfile[]>;

  /**
   * Subscribe to real-time user updates
   * @param callback Function to call when users are updated
   * @returns Unsubscribe function to stop listening
   */
  subscribeToUsers(callback: (users: UserProfile[]) => void): () => void;

  /**
   * Fetch a specific user by ID
   */
  getUserById(userId: string): Promise<UserProfile | null>;

  /**
   * Search users by username or display name
   */
  searchUsers(query: string): Promise<UserProfile[]>;
}
