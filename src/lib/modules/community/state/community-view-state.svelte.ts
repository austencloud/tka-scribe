/**
 * Community View State
 * Manages the current view state of the community module
 * Handles navigation between creators list and user profiles
 */

import type { CommunitySection } from "../domain/types/community-types";

interface CommunityViewState {
  currentView: "section" | "user-profile";
  activeSection: CommunitySection;
  viewingUserId: string | null;
}

function createCommunityViewState() {
  let state = $state<CommunityViewState>({
    currentView: "section",
    activeSection: "leaderboards",
    viewingUserId: null,
  });

  return {
    get currentView() {
      return state.currentView;
    },
    get activeSection() {
      return state.activeSection;
    },
    get viewingUserId() {
      return state.viewingUserId;
    },

    /**
     * Navigate to a specific section
     */
    setActiveSection(section: CommunitySection) {
      state.activeSection = section;
      state.currentView = "section";
      state.viewingUserId = null;
    },

    /**
     * View a user's profile
     */
    viewUserProfile(userId: string) {
      state.viewingUserId = userId;
      state.currentView = "user-profile";
      console.log(`📱 [CommunityViewState] Viewing user profile: ${userId}`);
    },

    /**
     * Go back to the previous view (usually creators list)
     */
    goBack() {
      state.currentView = "section";
      state.viewingUserId = null;
      console.log(`📱 [CommunityViewState] Returned to ${state.activeSection}`);
    },

    /**
     * Reset to default state
     */
    reset() {
      state.currentView = "section";
      state.activeSection = "leaderboards";
      state.viewingUserId = null;
    },
  };
}

export const communityViewState = createCommunityViewState();
