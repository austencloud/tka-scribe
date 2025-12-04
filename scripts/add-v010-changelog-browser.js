/**
 * Paste this into the browser console while logged in as admin
 * to add the v0.1.0 changelog entries.
 *
 * Usage:
 * 1. Open TKA Studio in browser
 * 2. Login as admin
 * 3. Open browser DevTools (F12)
 * 4. Copy-paste this entire script into console
 * 5. Press Enter
 */

(async function addV010Changelog() {
  // Import Firebase modules from the app
  const { doc, getDoc, setDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');

  // Get the firestore instance from window (exposed by the app)
  // If not available, we'll create one
  let db;
  try {
    // Try to get from global scope
    const { firestore } = await import('/src/lib/shared/auth/firebase.ts');
    db = firestore;
  } catch (e) {
    console.error('Could not import firestore, using alternative method');
    const { initializeApp, getApps } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    const app = getApps()[0];
    db = getFirestore(app);
  }

  // Human-readable changelog for v0.1.0
  const changelogEntries = [
    // Bug Fixes
    {
      category: 'fixed',
      text: 'Sequences now load correctly when you open them from the gallery'
    },
    {
      category: 'fixed',
      text: 'The app no longer freezes when switching between modules'
    },
    {
      category: 'fixed',
      text: 'Your progress is now saved properly when you close the app'
    },

    // New Features
    {
      category: 'added',
      text: 'You can now see version history and release notes right here!'
    },
    {
      category: 'added',
      text: 'Submit feedback directly from the app - tap the Feedback tab'
    },
    {
      category: 'added',
      text: 'Track the status of your submitted feedback'
    },
    {
      category: 'added',
      text: 'Get notified when your reported issues are fixed'
    },

    // Improvements
    {
      category: 'improved',
      text: 'Navigation is smoother and more responsive'
    },
    {
      category: 'improved',
      text: 'The app loads faster on first visit'
    },
    {
      category: 'improved',
      text: 'Better error messages when something goes wrong'
    }
  ];

  try {
    const versionRef = doc(db, 'versions', '0.1.0');
    const docSnap = await getDoc(versionRef);

    if (!docSnap.exists()) {
      console.log('Creating v0.1.0 version document...');
      await setDoc(versionRef, {
        version: '0.1.0',
        releaseNotes: 'The first official beta release! This version introduces the feedback system so you can help us make the app better.',
        feedbackCount: 0,
        feedbackSummary: { bugs: 0, features: 0, general: 0 },
        changelogEntries: changelogEntries,
        releasedAt: serverTimestamp()
      });
      console.log('✅ Created v0.1.0 with changelog!');
    } else {
      console.log('Updating v0.1.0 with changelog...');
      await updateDoc(versionRef, {
        changelogEntries: changelogEntries,
        releaseNotes: 'The first official beta release! This version introduces the feedback system so you can help us make the app better.'
      });
      console.log('✅ Updated v0.1.0 with changelog!');
    }

    const fixed = changelogEntries.filter(e => e.category === 'fixed');
    const added = changelogEntries.filter(e => e.category === 'added');
    const improved = changelogEntries.filter(e => e.category === 'improved');

    console.log('\n📝 Changelog entries added:');
    console.log(`  🐛 ${fixed.length} bug fixes`);
    console.log(`  ✨ ${added.length} new features`);
    console.log(`  📈 ${improved.length} improvements`);
    console.log('\n👉 Refresh the What\'s New tab to see the changes!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
