# Quota ledger reference

## Suggested document

Use one document per receiving user when the number of templates is small:

```js
{
  _id: "<server-derived user id>",
  userId: "...",
  staffId: "...",
  quotas: {
    appointmentConfirmed: 2,
    appointmentCancelled: 1
  },
  updatedAt: "<server date>"
}
```

For many templates, use one document per `userId + templateKey`. Keep template IDs in configuration and use stable internal keys in data.

## Authorization recording

The client sends booleans derived from the result of `wx.requestSubscribeMessage`. The cloud function:

1. Resolves the current user from `openid`.
2. Verifies that the user may receive the requested staff/customer notification.
3. Increments each accepted template by exactly one inside a transaction.
4. Returns a nonnegative view of the new quota.

Never accept an absolute quota value or another user's ID from the client.

## Atomic send state machine

```text
business event commits
  -> transaction claims one quota
     -> no quota: record skipped/not_authorized
     -> quota claimed: call subscribeMessage.send
        -> sent: keep quota consumed and record request ID
        -> permanent auth failure: set that quota to zero
        -> transient failure: increment one back
```

Permanent failures include explicit user refusal, missing subscription, or permission-denied responses. Classify by the current official error contract and keep raw platform codes in the audit record. Unknown network/service errors are transient unless evidence says otherwise.

## Idempotency

- The business operation owns the idempotency key. A cancellation that is already cancelled should not emit another notification.
- If message delivery itself must be exactly-once from the application's perspective, add a notification job document with a deterministic ID such as `<eventId>:<kind>` and claim it transactionally.
- WeChat delivery is external; design for at-least-once attempts and observable outcomes rather than assuming an atomic database-and-message transaction.

## Message data

- Validate template field names against the selected template; similar public templates can expose different keyword IDs.
- Truncate text to each field's platform limit before sending.
- Keep customer name, service, appointment time, status, phone, and destination page appropriate for the recipient. Avoid placing sensitive data in a template that does not require it.
