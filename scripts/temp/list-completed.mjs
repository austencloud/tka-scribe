import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

const snapshot = await db.collection('feedback').where('status', '==', 'completed').get();
console.log('=== ALL COMPLETED FEEDBACK ===\n');
snapshot.docs.forEach((doc, i) => {
  const d = doc.data();
  console.log(`[${i+1}] ID: ${doc.id}`);
  console.log(`    Type: ${d.type} | Internal: ${d.internalOnly || false}`);
  console.log(`    Title: ${d.title || '(no title)'}`);
  console.log(`    Desc: ${(d.description || '').substring(0, 150)}...`);
  console.log('');
});
