---
name: wechat-cloudbase-feature-engineering
description: Implement, debug, and verify end-to-end WeChat Mini Program features backed by CloudBase, especially when client pages, cloud functions, database rules, permissions, transactions, time boundaries, or cloud-file lifecycles must stay consistent. Do not use for release-only work.
---

# WeChat CloudBase Feature Engineering

Build the smallest complete client-to-cloud change that satisfies the requested behavior. Preserve the project's existing architecture, naming, and authorization model.

## Start from the real contract

1. Locate `project.config.json`, the Mini Program root, cloud-function root, environment configuration, and any mirrored development/production function directories.
2. Trace the request from page event through service wrapper, cloud action router, handler, database mutation, and returned view model.
3. Identify the source of truth for each rule. UI visibility is never authorization; validate protected writes in the cloud function using the caller's `openid` and server-side account record.
4. Write down the business invariants before editing. Include boundary values, role exceptions, idempotency keys, timezone, and what must remain committed if a notification or other side effect fails.

Read [references/engineering-patterns.md](references/engineering-patterns.md) when the change involves permissions, bookings, money-like balances, media, identity, or mirrored cloud functions.

## Implement the full path

- Keep page code responsible for interaction and display, service modules responsible for transport, and cloud handlers responsible for authoritative validation and writes.
- Recheck client-side constraints in the cloud function immediately before the write. Client checks improve feedback but can be bypassed.
- Use transactions for related counters, locks, balances, ledgers, and status changes. Use deterministic document IDs for operations that must be idempotent.
- Keep optional external side effects after the successful business transaction unless the product explicitly requires them to determine success.
- Store durable cloud-file IDs. Resolve temporary URLs when reading; never persist expiring URLs as the canonical value.
- If the project maintains matching development and production cloud-function sources, update both or deliberately document why they differ. Do not deploy production merely because sources were synchronized.

Run `node scripts/compare_cloud_functions.js <left-function-dir> <right-function-dir>` when mirrored cloud functions should match.

## Verify behavior

- Add focused tests around observable invariants, including exact boundary values and repeated submissions. Avoid tests that only search for implementation text.
- Mock CloudBase at the handler boundary when a live environment is unnecessary. Test both authorized and unauthorized roles.
- Check changed JavaScript with `node --check` and parse changed JSON.
- Exercise the real Mini Program or DevTools when behavior depends on `wx.*`, page lifecycle, image rendering, authorization prompts, or navigation.
- Report which layers were verified and which still require a logged-in account, real cloud data, or a physical device.

Keep live deployment and version upload separate. Use the release skill when the user asks to preview, deploy, or upload.
