/**
 * Disable legacy authenticator-app MFA (TOTP) for a user (or all users).
 *
 * Usage:
 *   node scripts/disable-authenticator-mfa.js <uid>
 *   node scripts/disable-authenticator-mfa.js <email>
 *   node scripts/disable-authenticator-mfa.js all --confirm
 */

import admin from "firebase-admin";
import { existsSync, readFileSync } from "node:fs";

function initAdmin() {
  if (admin.apps.length) return;

  const fromEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (fromEnv) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(fromEnv)),
    });
    return;
  }

  if (!existsSync("serviceAccountKey.json")) {
    throw new Error(
      "Missing Firebase Admin credentials (set FIREBASE_SERVICE_ACCOUNT_JSON or provide serviceAccountKey.json)"
    );
  }

  const serviceAccount = JSON.parse(readFileSync("serviceAccountKey.json", "utf8"));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function disableMfaForUid(uid) {
  await admin.auth().updateUser(uid, { multiFactor: { enrolledFactors: null } });
}

async function resolveUid(arg) {
  if (arg.includes("@")) {
    const user = await admin.auth().getUserByEmail(arg);
    return user.uid;
  }
  return arg;
}

async function disableAllUsers(confirm) {
  if (!confirm) {
    throw new Error('Refusing to run without "--confirm"');
  }

  let nextPageToken = undefined;
  let total = 0;
  do {
    const page = await admin.auth().listUsers(1000, nextPageToken);
    nextPageToken = page.pageToken;

    for (const user of page.users) {
      await disableMfaForUid(user.uid);
      total++;
      if (total % 50 === 0) {
        process.stdout.write(`Disabled MFA for ${total} users...\n`);
      }
    }
  } while (nextPageToken);

  process.stdout.write(`Done. Disabled MFA for ${total} users.\n`);
}

async function main() {
  initAdmin();

  const arg = process.argv[2];
  const confirm = process.argv.includes("--confirm");

  if (!arg) {
    throw new Error("Missing argument: <uid|email|all>");
  }

  if (arg === "all") {
    await disableAllUsers(confirm);
    return;
  }

  const uid = await resolveUid(arg);
  await disableMfaForUid(uid);
  process.stdout.write(`Disabled authenticator MFA for ${uid}\n`);
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});

