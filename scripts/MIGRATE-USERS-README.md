# Firebase Auth to Firestore User Migration

## Problem

Your Firebase Authentication has users, but they don't have corresponding documents in the Firestore `users` collection. The Users Explore panel displays users from Firestore, so it's showing empty or placeholder data.

## Solution

We've implemented **automatic user document creation** in the auth system. Now, whenever a user signs in (or is already signed in when the app loads), their Firestore user document will be automatically created or updated.

## Option 1: Automatic Migration (Easiest)

### For Currently Signed-In Users

Simply **reload the app**. The `authStore` will detect the authenticated user and automatically create/update their Firestore document.

### For Users Not Currently Signed In

Users will get their Firestore documents automatically created the next time they sign in. No action needed!

## Option 2: Manual Batch Migration (Fastest)

If you want to migrate all Firebase Auth users to Firestore immediately, use the migration script:

### Prerequisites

1. **Install Firebase Admin SDK**

   ```bash
   npm install firebase-admin
   ```

2. **Get Service Account Key**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `the-kinetic-alphabet`
   - Go to **Project Settings** > **Service Accounts**
   - Click **"Generate New Private Key"**
   - Save the downloaded JSON file as `serviceAccountKey.json` in the project root
   - ⚠️ **NEVER commit this file!** (already in `.gitignore`)

### Run Migration

```bash
node scripts/migrate-auth-users-to-firestore.mjs
```

The script will:

- ✨ Create Firestore documents for users who don't have one
- 🔄 Update existing Firestore documents with latest auth data
- 📊 Show statistics about created/updated users

### Migration Output

```
🚀 Starting Firebase Auth to Firestore migration...

✨ Created Firestore document for: user1@example.com
✨ Created Firestore document for: user2@example.com
🔄 Updated Firestore document for: admin@example.com

✅ Migration completed!

📊 Statistics:
   Total users: 15
   Created: 12
   Updated: 3
   Errors: 0
```

## What Gets Created

Each user document in Firestore includes:

```javascript
{
  email: "user@example.com",
  displayName: "User Name",
  username: "user",
  photoURL: "https://...",
  avatar: "https://...",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  sequenceCount: 0,
  collectionCount: 0,
  followerCount: 0,
  isAdmin: false
}
```

## Verifying the Migration

1. Go to the **Explore** module in your app
2. Click on the **Users** tab
3. You should now see all your users instead of just "Anonymous User"

## Code Changes Made

### Modified Files

- [`src/lib/shared/auth/stores/authStore.svelte.ts`](../src/lib/shared/auth/stores/authStore.svelte.ts#L106-L162)
  - Added `createOrUpdateUserDocument()` function
  - Automatically called when user signs in/up

### Created Files

- [`scripts/migrate-auth-users-to-firestore.mjs`](./migrate-auth-users-to-firestore.mjs)
  - One-time migration script for existing users

- [`.gitignore`](../.gitignore#L24-L26)
  - Added Firebase service account key patterns

## Security Notes

⚠️ **IMPORTANT**: The service account key gives full admin access to your Firebase project.

- NEVER commit `serviceAccountKey.json` to git
- NEVER share it publicly
- Delete it after migration if you don't need it
- Consider rotating the key after use

## Troubleshooting

### "Could not load service account key file"

- Make sure you've downloaded the key from Firebase Console
- Save it as `serviceAccountKey.json` in the project root (same level as `package.json`)
- Check that the file is valid JSON

### "Permission denied" errors

- Make sure your service account has the necessary permissions
- The default Firebase Admin SDK service account should have all permissions

### Users still not showing

- Check browser console for errors
- Verify Firestore security rules allow reading the `users` collection
- Check that the user documents were actually created in Firestore Console

## Next Steps

After migration, you can:

- Delete `serviceAccountKey.json` (optional, but recommended for security)
- Uninstall `firebase-admin` if not needed: `npm uninstall firebase-admin`
- All future users will be automatically created when they sign up!
