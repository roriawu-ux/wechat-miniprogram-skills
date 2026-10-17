---
name: wechat-subscription-message-ledger
description: Design, implement, or audit reliable WeChat Mini Program one-time subscription messages using explicit user authorization, per-recipient template quotas, atomic claims, failure compensation, and business-event audit records. Use when notifications must follow bookings, cancellations, or similar events.
---

# WeChat Subscription Message Ledger

Treat a one-time subscription authorization as a consumable entitlement for one recipient and one template. It is not a permanent switch.

## Confirm platform and product constraints

1. Inspect the Mini Program category and template library in the current WeChat console. Template availability and long-term subscription eligibility can change.
2. Identify the exact recipient, triggering business event, template ID, template fields, destination page, and fallback channel.
3. Keep authorization requests behind a direct user gesture. Never simulate acceptance or silently increment quota.
4. Request only templates relevant to that gesture. When several template IDs are requested together, each accepted template adds one usable authorization for that template, not an unlimited balance.

Read [references/quota-ledger.md](references/quota-ledger.md) before implementing the database and send flow.

## Implement the lifecycle

- Keep template IDs in configuration and keep client and cloud configuration synchronized.
- Interpret each template result independently: only `accept` increments that template's quota; `reject`, `ban`, failure, or missing result does not.
- Record accepted authorizations through an authenticated cloud action. Do not let the client provide an arbitrary recipient or absolute balance.
- Atomically claim one quota immediately before sending. A concurrent event must not consume the same authorization.
- Send only after the core business transaction has committed. Notification failure should normally be recorded without rolling back a valid appointment or cancellation.
- On successful send, leave the claimed quota consumed. On a permanent subscription/permission rejection, clear the stale local quota. On a transient platform failure, restore the claimed quota.
- Store the send outcome on the business event or a notification log with kind, status, request ID or error code, and update time.

## Verify

Test separate accepted and rejected templates, zero quota, two concurrent sends, successful consumption, transient restoration, permanent invalidation, repeated cancellation, missing recipient, and message-field length limits. Live-test with the real receiving account because mocked `wx.requestSubscribeMessage` cannot prove that WeChat will deliver the message.

If the business requires persistent delivery without repeated employee authorization and the account lacks an eligible long-term template, propose an independent channel such as Enterprise WeChat or SMS. Do not recommend enabling unrelated payment capability solely to work around notification limits.
