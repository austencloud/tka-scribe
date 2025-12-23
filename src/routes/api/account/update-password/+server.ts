import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";
import { requireFirebaseUser } from "$lib/server/auth/requireFirebaseUser";
import { getAdminAuth } from "$lib/server/firebaseAdmin";
import { requireStepUpOrRecentAuth } from "$lib/server/security/requireStepUp";

const STEP_UP_COOKIE = "tka_step_up";

export const POST: RequestHandler = async (event) => {
  try {
    const user = await requireFirebaseUser(event);
    requireStepUpOrRecentAuth(event, {
      uid: user.uid,
      authTime: user.authTime,
    });

    const body = (await event.request.json()) as { newPassword?: unknown };
    const newPassword =
      typeof body.newPassword === "string" ? body.newPassword : "";

    if (newPassword.length < 8) {
      return json(
        {
          error: "Password must be at least 8 characters",
          code: "weak_password",
        },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();
    await auth.updateUser(user.uid, { password: newPassword });
    await auth.revokeRefreshTokens(user.uid);

    event.cookies.delete(STEP_UP_COOKIE, { path: "/" });

    return json({ ok: true });
  } catch (err: unknown) {
    const status =
      typeof err === "object" && err && "status" in err
        ? Number((err as { status: unknown }).status)
        : 500;
    const code =
      typeof err === "object" && err && "code" in err
        ? String((err as { code: unknown }).code)
        : "internal_error";
    const message =
      err instanceof Error ? err.message : "Failed to update password";
    return json({ error: message, code }, { status });
  }
};
