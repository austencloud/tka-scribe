const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(path.join(__dirname, "..", "serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateLabels() {
  // Update BBLF from 'none' to 'rotated+swapped'
  const bblfQuery = await db.collection('cap-labels')
    .where('word', '==', 'BBLF')
    .get();

  if (!bblfQuery.empty) {
    await bblfQuery.docs[0].ref.update({
      'label.components': ['rotated', 'swapped'],
      'label.capType': 'rotated_swapped'
    });
    console.log('Updated BBLF: none -> rotated+swapped');
  } else {
    console.log('BBLF not found in cap-labels');
  }
}

updateLabels()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
