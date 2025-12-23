# Subscription System Testing Guide

## Prerequisites

Before testing, ensure:
1. ✅ Firebase Stripe Extension is installed
2. ✅ Stripe account is configured (test mode)
3. ✅ 3 price IDs created in Stripe Dashboard (see below)
4. ✅ Cloud Functions deployed
5. ✅ Webhook configured in Stripe

---

## Setup: Create Stripe Price ID

In [Stripe Dashboard > Products](https://dashboard.stripe.com/products):

1. Create a new product: "TKA Premium"
2. Add a recurring price (monthly): **$10/mo**
3. Copy the price ID (format: `price_xxxxxxxxxxxxx`)
4. Add to `.env.development`:

```bash
PUBLIC_STRIPE_PRICE_ID=price_YOUR_PRICE_ID
```

---

## Deployment Steps

### 1. Deploy Cloud Functions

```bash
cd functions
npm install
npm run deploy
```

This deploys:
- `syncSubscriptionRole` - Syncs subscription status → user role
- `cleanupExpiredCheckoutSessions` - Daily cleanup (scheduled function)

### 2. Verify Firestore Security Rules

Ensure `deployment/firestore.rules` allows:
- Extension to write to `customers/{uid}/subscriptions`
- Client to read their own subscription status

### 3. Configure Stripe Webhook (if not auto-configured by extension)

In [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks):
- Endpoint: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-stripe-payments-handleWebhookEvents`
- Events: Already configured by Firebase extension

---

## Testing Flow

### Test 1: New Subscription (user → premium)

1. **Sign in as test user** (role = "user")
2. **Navigate to Settings > Profile tab**
3. **Click "Go Premium - $10/mo"**
4. **Complete Stripe Checkout** (use test card: `4242 4242 4242 4242`)
5. **Verify:**
   - ✅ Redirected back to app with `?subscription=success`
   - ✅ SubscriptionCard shows "TKA Premium - Active"
   - ✅ Console log: `🔄 [authState] Subscription changed, refreshing token...`
   - ✅ Console log: `✅ [authState] Role synced: user → premium`
   - ✅ User can access premium features (check `isPremiumOrAbove()`)

**Expected Flow:**
1. Stripe extension creates subscription doc in `customers/{uid}/subscriptions`
2. Cloud function `syncSubscriptionRole` triggers
3. Updates `users/{uid}/role` to "premium"
4. Updates Firebase Auth custom claims
5. Client-side subscription listener detects change
6. Forces token refresh
7. Auth state updates with new role

### Test 2: Subscription Cancellation (premium → user)

1. **Click "Manage Subscription"** → Redirected to Stripe portal
2. **Cancel subscription** (confirm cancellation)
3. **Verify:**
   - ✅ Subscription doc updated with `status: "canceled"` and `cancel_at_period_end: true`
   - ✅ SubscriptionCard shows "Cancels on [date]"
   - ✅ Role remains "premium" until period ends (no downgrade yet)

### Test 3: Subscription Expiration (premium → user)

1. **Wait for subscription period to end** (or use Stripe test clock)
2. **Verify:**
   - ✅ Cloud function triggers when `status` changes from "active" to "canceled"
   - ✅ Role reverted from "premium" to "user"
   - ✅ Auth state syncs automatically
   - ✅ User loses access to premium features

### Test 4: Admin/Tester Protection

1. **Sign in as user with role = "admin" or "tester"**
2. **Subscribe to premium**
3. **Cancel subscription and wait for expiration**
4. **Verify:**
   - ✅ Role stays "admin" or "tester" (no downgrade to "user")
   - ✅ Cloud function logic: only downgrades if `currentRole === "premium"`

---

## Manual Cloud Function Testing

### Test syncSubscriptionRole directly:

```bash
# Simulate subscription created (active)
firebase functions:shell
> syncSubscriptionRole({params: {userId: "TEST_USER_ID", subscriptionId: "sub_test123"}}, {after: {data: () => ({status: "active"})}})

# Simulate subscription canceled
> syncSubscriptionRole({params: {userId: "TEST_USER_ID", subscriptionId: "sub_test123"}}, {after: {data: () => ({status: "canceled"})}})
```

### Check Cloud Function logs:

```bash
firebase functions:log --only syncSubscriptionRole
```

Expected logs:
- `Upgrading user {uid} from user to premium`
- `Reverting user {uid} from premium to user`

---

## Troubleshooting

### Issue: Role doesn't sync after subscribe
**Fix:** Check Firestore rules allow extension to write subscriptions:
```
match /customers/{uid}/subscriptions/{id} {
  allow write: if request.auth != null; // Extension needs write access
}
```

### Issue: "Checkout session creation timed out"
**Fix:** Check extension configuration in Firebase Console:
- Stripe secret key is correct
- Webhook signing secret is configured

### Issue: Auth state doesn't update
**Fix:** Check browser console for:
- `🔄 [authState] Subscription changed, refreshing token...`
- If missing, subscription listener may not be initialized

### Issue: User stays "user" after subscribing
**Fix:**
1. Check cloud function deployed: `firebase functions:list`
2. Check function triggered: `firebase functions:log`
3. Verify custom claims updated: `firebase auth:export` or check Firebase Console

---

## Production Checklist

Before going live:
- [ ] Switch Stripe to live mode (not test mode)
- [ ] Update Stripe keys in environment variables
- [ ] Create live price ID ($10/mo)
- [ ] Update `PUBLIC_STRIPE_PRICE_ID` in production env
- [ ] Deploy cloud functions to production: `firebase deploy --only functions --project prod`
- [ ] Test with real payment (subscribe + cancel)
- [ ] Set up Stripe webhook for production environment
- [ ] Monitor Stripe webhooks for failed deliveries
- [ ] Set up alerts for cloud function errors

---

## Monitoring

**Key metrics to track:**
- Subscription conversion rate (checkouts → successful subscriptions)
- Cancellation rate
- Monthly recurring revenue (MRR)
- Webhook delivery success rate
- Cloud function execution time & errors

**Firebase Console:**
- Functions > syncSubscriptionRole > Logs
- Firestore > customers/{uid}/subscriptions (check status updates)

**Stripe Dashboard:**
- Webhooks > Recent deliveries
- Payments > Subscriptions
