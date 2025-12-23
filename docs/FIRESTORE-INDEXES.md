# Firestore Index Requirements

This project requires specific composite indexes for efficient querying.

## Required Indexes

### 1. Deferred Feedback Reactivation

**Collection:** `feedback`
**Fields:**

- `status` (Ascending)
- `deferredUntil` (Ascending)

**Query:** Find archived items ready to be reactivated
**Used by:** `scripts/reactivate-deferred.js`

**Create index:**
When you run the reactivation script for the first time, Firestore will provide a URL in the error message. Click it to auto-create the index, or manually create it:

1. Go to [Firebase Console](https://console.firebase.google.com/project/the-kinetic-alphabet/firestore/indexes)
2. Click "Create Index"
3. Collection: `feedback`
4. Fields:
   - `status` → Ascending
   - `deferredUntil` → Ascending
5. Click "Create Index"

Index creation takes a few minutes. Once complete, the script will work.

## Why Indexes Are Needed

Firestore requires composite indexes for queries that:

1. Use multiple `where()` clauses
2. Combine `where()` with `orderBy()`

Our deferred feedback query uses both `status == 'archived'` AND `deferredUntil <= now`, requiring a composite index.

## Verifying Indexes

Check active indexes:

```bash
# View in Firebase Console
https://console.firebase.google.com/project/the-kinetic-alphabet/firestore/indexes

# Or query programmatically (advanced)
firebase firestore:indexes
```

## Future Indexes

As the project grows, you may need additional indexes for:

- Complex feedback filtering
- Release history queries
- User activity tracking

Firestore will always provide the creation URL in error messages when an index is missing.
