---
title: "Idempotency in Transaction-Based Systems"
slug: "idempotency-in-transaction-based-systems"
coverImage: "/media/blog/idempotency-transactions.png"
excerpt: "Retries are inevitable in distributed systems. Without idempotency, they turn into double charges and duplicate rows."
date: "2026-04-22"
---

A client times out waiting for a response and retries the request. The first request actually succeeded, the response just never made it back. Now the same "charge this card" or "create this order" call is about to run twice. This isn't an edge case, it's a guarantee in any system that talks over a network, and the only thing that makes it safe is whether the operation is idempotent.

## An idempotency key is the client's promise, not the server's

The pattern that makes retries safe is simple to state: the client generates a unique key for the operation (a UUID, usually) before the first attempt, and sends it with every retry of that same logical request. The server's job is to make sure that key can only ever produce one result, no matter how many times it shows up.

```js
// Client generates the key once, reuses it on every retry
const idempotencyKey = crypto.randomUUID();

await chargeCard({ amount, cardToken, idempotencyKey });
// on timeout, retry with the same idempotencyKey
```

The key itself does nothing on its own. It's only useful once the server enforces it.

## Enforcing it means a unique constraint, not an if-check

The tempting first version is "check if this key has been processed, and if not, process it." That's a race condition waiting to happen. Two retries arriving close together can both pass the check before either has written a result, and both proceed to charge the card. The check has to be backed by something the database itself enforces.

```sql
CREATE TABLE charges (
  id UUID PRIMARY KEY,
  idempotency_key TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL
);
```

With a unique constraint on `idempotency_key`, the second insert attempt fails at the database level instead of silently succeeding twice. The application catches that constraint violation and returns the original result instead of erroring out, which is the actual point: a retry should look like success from the client's side, not like a conflict.

## Wrap the check and the side effect in the same transaction

Where this breaks in practice is when the "did we already do this" check and the actual side effect happen as separate steps that aren't transactionally tied together. Insert the idempotency record and perform the write in the same transaction, so either both happen or neither does. If the record gets inserted but the transaction rolls back before the charge is actually made, a retry needs to see that nothing succeeded and be safe to run again, not get silently swallowed because a stale key already exists.

## Make the write itself tolerate being repeated

Idempotency keys handle "this exact request happened before." A separate, complementary habit is making the underlying write naturally safe to repeat, using `INSERT ... ON CONFLICT DO NOTHING` or an upsert instead of a plain insert for state that should converge to the same result regardless of how many times it's applied. This doesn't replace idempotency keys for things like payments, where the second attempt genuinely shouldn't do anything at all, but for things like "mark this record as processed," an upsert removes an entire category of retry bugs for free.

## Partial failure is where this actually gets tested

The easy case is a full retry after a clean timeout. The harder case is a request that succeeded partway, the charge went through but the confirmation email step failed, and now a retry has to know precisely which parts to skip and which to redo. This is usually where an outbox pattern earns its keep: the transaction that performs the charge also writes an event to an outbox table, and a separate process reads from that outbox to trigger the email, decoupling "did the transaction commit" from "did every downstream effect happen." Idempotency at the API boundary and idempotency of each downstream side effect end up being two different problems, and conflating them is where retry logic that looked correct in testing starts misbehaving in production.
