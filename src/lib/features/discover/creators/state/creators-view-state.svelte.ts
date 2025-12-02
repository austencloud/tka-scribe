/**
 * Creators View State (for Discover module)
 * Manages the current view state of the creators tab
 * Handles navigation between creators list and user profiles
 */

interface CreatorsViewState {
  currentView: "list" | "user-profile";
  viewingUserId: string | null;
}

function createCreatorsViewState() {
  const state = $state<CreatorsViewState>({
    currentView: "list",
    viewingUserId: null,
  });

  return {
    get currentView() {
      return state.currentView;
    },
    get viewingUserId() {
      return state.viewingUserId;
    },

    /**
     * View a user's profile
     */
    viewUserProfile(userId: string) {
      state.viewingUserId = userId;
      state.currentView = "user-profile";
      console.log(`[CreatorsViewState] Viewing user profile: ${userId}`);
    },

    /**
     * Go back to the creators list
     */
    goBack() {
      state.currentView = "list";
      state.viewingUserId = null;
      console.log(`[CreatorsViewState] Returned to creators list`);
    },

    /**
     * Reset to default state
     */
    reset() {
      state.currentView = "list";
      state.viewingUserId = null;
    },
  };
}

export const creatorsViewState = createCreatorsViewState();
