import { injectable } from "inversify";
import { auth } from "../../firebase";
import type { IProfileApiClient } from "../contracts/IProfileApiClient";

/**
 * Client for making authenticated API calls to /api/account/* endpoints
 */
@injectable()
export class ProfileApiClient implements IProfileApiClient {
  async request<T = unknown>(path: string, body?: unknown): Promise<T> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Not signed in");
    }

    const token = await user.getIdToken();
    const res = await fetch(path, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : "{}",
    });

    const data = (await res.json().catch(() => ({}))) as any;
    if (!res.ok) {
      const err = new Error(data?.error || `Request failed: ${res.status}`);
      (err as any).status = res.status;
      (err as any).code = data?.code;
      throw err;
    }
    return data as T;
  }
}
