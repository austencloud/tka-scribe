const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../serviceAccountKey.json'), 'utf8')
);
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

async function main() {
  // Get ALL new bugs regardless of priority
  const snapshot = await db.collection('feedback')
    .where('type', '==', 'bug')
    .where('status', '==', 'new')
    .get();

  const items = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    items.push({
      id: doc.id,
      type: data.type,
      priority: data.priority || 'unset',
      title: (data.title || data.feedback || '').substring(0, 70),
      module: data.module || 'N/A'
    });
  });

  // Sort by priority (low first = quick wins)
  const priorityOrder = { low: 0, medium: 1, high: 2, unset: 3 };
  items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  console.log('=== ALL NEW BUGS BY PRIORITY ===\n');
  let currentPriority = null;
  items.forEach(item => {
    if (item.priority !== currentPriority) {
      currentPriority = item.priority;
      console.log(`\n--- ${currentPriority.toUpperCase()} PRIORITY ---`);
    }
    console.log(`${item.id} | ${item.module} | ${item.title}`);
  });
}
main().then(() => process.exit(0));
