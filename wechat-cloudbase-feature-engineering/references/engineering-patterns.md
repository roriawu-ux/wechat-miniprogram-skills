# Engineering patterns

Use only the sections relevant to the current change.

## Authorization and identity

- Derive identity from the cloud runtime `openid`; never accept a caller-supplied role as proof.
- Resolve the account on the server and reject disabled accounts before protected work.
- Model capabilities separately from broad roles when a narrow operation needs stricter access. Example: a store owner may edit recorded balance while another administrator may only view it.
- Client role-preview or debug switches may change presentation, but must never grant server permissions.
- WeChat nicknames are not guaranteed to appear automatically. If a recognizable customer name is required, request profile data from an explicit user gesture, save it to the account, and block business submission when only a generic placeholder remains.

## Transactions, locks, and ledgers

- Convert money to integer minor units before persistence.
- Use an append-only ledger for value changes. Record before/after values, operator, reason, and related business ID.
- Derive a deterministic ledger or lock document ID from the business operation. Repeating the same completion or callback should return the prior result instead of applying it twice.
- For a uniqueness rule such as one active appointment per customer per calendar week, create a deterministic lock document inside the same transaction as the appointment.
- Treat stale locks as repairable: inspect the referenced record and replace a lock whose record is missing or no longer active.
- Avoid unsupported query shapes inside CloudBase transactions. Prefer deterministic document reads to broad `where` queries.

## Time rules

- State the business timezone explicitly. For mainland China shops, convert `YYYY-MM-DD` plus local time to a UTC instant with the `+08:00` offset rather than relying on the runtime's local timezone.
- Test the exact allowed boundary and one unit before it. Example: exactly 60 minutes lead time is allowed; 59 minutes 59 seconds is rejected.
- Apply opening hours, service duration, staff schedule, blocks, existing appointments, and minimum lead time in both availability output and final booking validation.
- Staff overrides must require server-side staff authorization and should bypass only the named rule, not all availability or permission checks.

## Cloud files and images

- Persist `cloud://...` file IDs and regenerate temporary download URLs on each read or refresh.
- When replacing an image, delete the old file only after the new database state is confirmed. If save success is ambiguous because the response was lost, retain the newly uploaded file until the record is reconciled.
- A failed or empty reload must intentionally clear or retain old UI state according to the product contract; avoid accidental stale banners or details.
- Prevent distortion with an explicit display mode: use aspect-fit for complete images or aspect-fill for cropped covers. Do not force both width and height without a matching fit mode.

## Cloud database failures

- Capture the complete error code, message, action, collection, document ID, caller role, and environment before changing code.
- A generic database request failure can come from permissions, invalid document data, collection state, transaction limitations, or the wrong deployed function. Do not diagnose from the numeric code alone.
- Compare the deployed function name and environment with the client configuration. Confirm the expected cloud action exists in the deployed router.

## Mirrored cloud functions

- Treat development and production function trees as separate deployment targets even when their source is intentionally identical.
- Compare normalized relative paths and file hashes before bundling. Ignore generated dependencies and deployment artifacts unless the project intentionally versions them.
- Deploy development first, run live smoke tests, and move to production only when the user requests that release step.
