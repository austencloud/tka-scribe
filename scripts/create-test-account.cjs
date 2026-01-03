/**
 * Create a test account for Google Play reviewers
 * Usage: node scripts/create-test-account.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

// Use a gmail you control, or create one for this purpose
const TEST_EMAIL = 'tkascribe.review@gmail.com';
const TEST_PASSWORD = 'TKAReview2026!';
const TEST_DISPLAY_NAME = 'Google Play Reviewer';

async function createTestAccount() {
  try {
    // Check if user already exists
    let user;
    try {
      user = await auth.getUserByEmail(TEST_EMAIL);
      console.log('User already exists:', user.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        user = await auth.createUser({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          displayName: TEST_DISPLAY_NAME,
          emailVerified: true, // Skip email verification for test account
        });
        console.log('Created new user:', user.uid);
      } else {
        throw error;
      }
    }

    // Set admin role in Firestore
    await db.collection('users').doc(user.uid).set({
      email: TEST_EMAIL,
      displayName: TEST_DISPLAY_NAME,
      role: 'admin', // Full access for reviewers
      isAdmin: true, // Backwards compatibility
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Mark as test account
      isTestAccount: true,
      testAccountPurpose: 'Google Play Review',
    }, { merge: true });

    console.log('\n========================================');
    console.log('TEST ACCOUNT CREATED SUCCESSFULLY');
    console.log('========================================');
    console.log('Email:', TEST_EMAIL);
    console.log('Password:', TEST_PASSWORD);
    console.log('Role: admin (full access)');
    console.log('========================================');
    console.log('\nUse these credentials in Google Play Console');
    console.log('under App Access > Add instructions\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating test account:', error);
    process.exit(1);
  }
}

createTestAccount();
