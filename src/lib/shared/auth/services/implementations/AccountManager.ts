import { inject, injectable } from "inversify";
import { updatePassword, signOut } from "firebase/auth";
import { TYPES } from "../../../inversify/types";
import { auth } from "../../firebase";
import { nuclearCacheClear } from "../../utils/nuclearCacheClear";
import type { IAccountManager } from "../contracts/IAccountManager";
import type { IProfileApiClient } from "../contracts/IProfileApiClient";
import type { IStepUpAuthCoordinator } from "../contracts/IStepUpAuthCoordinator";
import type { IHapticFeedback } from "../../../application/services/contracts/IHapticFeedback";

/**
 * Manages user account operations (password changes, deletion, cache clearing)
 */
@injectable()
export class AccountManager implements IAccountManager {
  constructor(
    @inject(TYPES.IProfileApiClient) private apiClient: IProfileApiClient,
    @inject(TYPES.IStepUpAuthCoordinator)
    private stepUpCoordinator: IStepUpAuthCoordinator,
    @inject(TYPES.IHapticFeedback) private haptics: IHapticFeedback
  ) {}

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    this.haptics.trigger("selection");

    // Validate
    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    await this.stepUpCoordinator.executeSensitive(
      async () => {
        await this.apiClient.request("/api/account/update-password", {
          newPassword,
        });

        // Update client auth password so Firebase doesn't immediately desync
        if (auth.currentUser) {
          await updatePassword(auth.currentUser, newPassword).catch(() => {});
        }

        this.haptics.trigger("success");
        alert(
          "Password updated. For security, you may be signed out on other devices."
        );
      },
      { allowPasswordReauth: true, password: currentPassword }
    );
  }

  async deleteAccount(): Promise<void> {
    this.haptics.trigger("warning");

    await this.stepUpCoordinator.executeSensitive(async () => {
      await this.apiClient.request("/api/account/delete");
      await signOut(auth).catch(() => {});
      alert("Account deleted successfully.");
    }, { allowPasswordReauth: true });
  }

  async clearCache(): Promise<void> {
    this.haptics.trigger("selection");

    try {
      await nuclearCacheClear();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Failed to clear cache:", error);
      this.haptics.trigger("error");
      throw new Error("Failed to clear cache. Please try again.");
    }
  }
}
