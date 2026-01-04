/**
 * One-time script to sync existing Firebase users to Stripe
 * Run this for users created before the Stripe extension was installed
 */

const admin = require("firebase-admin");
const Stripe = require("stripe");

// Initialize Firebase Admin
const serviceAccount = require("../serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// Initialize Stripe - key must be provided via environment variable
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error("Error: STRIPE_SECRET_KEY environment variable is required");
  console.error(
    "Usage: STRIPE_SECRET_KEY=sk_test_xxx node scripts/sync-stripe-customer.cjs"
  );
  process.exit(1);
}
const stripe = new Stripe(stripeKey);

async function syncCustomer(uid) {
  const customerRef = db.collection("customers").doc(uid);
  const customerSnap = await customerRef.get();

  if (!customerSnap.exists) {
    console.log(`No customer document found for ${uid}`);
    return;
  }

  const data = customerSnap.data();

  if (data.stripeId) {
    console.log(`Customer ${uid} already has stripeId: ${data.stripeId}`);
    return;
  }

  console.log(`Creating Stripe customer for ${uid} (${data.email})...`);

  // Create Stripe customer
  const customer = await stripe.customers.create({
    email: data.email,
    metadata: {
      firebaseUID: uid,
    },
  });

  console.log(`Created Stripe customer: ${customer.id}`);

  // Update Firestore with stripeId
  await customerRef.update({
    stripeId: customer.id,
    stripeLink: `https://dashboard.stripe.com/test/customers/${customer.id}`,
  });

  console.log(`Updated Firestore document with stripeId`);
}

// Sync all customers without stripeId
async function syncAllCustomers() {
  const customers = await db.collection("customers").get();

  for (const doc of customers.docs) {
    await syncCustomer(doc.id);
  }

  console.log("\nDone!");
}

syncAllCustomers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
