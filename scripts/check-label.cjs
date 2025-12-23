const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(path.join(__dirname, "..", "serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkLabel() {
  const query = await db.collection('cap-labels').where('word', '==', 'BBLF').get();
  if (!query.empty) {
    console.log('BBLF label:', JSON.stringify(query.docs[0].data(), null, 2));
  } else {
    console.log('BBLF not found');
  }
}

checkLabel().then(() => process.exit(0));
