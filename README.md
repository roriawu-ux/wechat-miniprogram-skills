# WeChat Mini Program Skills

Reusable Codex skills extracted from a production WeChat Mini Program and CloudBase development workflow. Project-specific AppIDs, cloud environment IDs, template IDs, phone numbers, and test accounts are excluded.

## Skills

- `wechat-cloudbase-feature-engineering`: implement and debug client-to-cloud features, permissions, transactions, time rules, media lifecycles, and mirrored cloud functions.
- `wechat-subscription-message-ledger`: implement one-time subscription authorization quotas, atomic claims, delivery auditing, and failure compensation.
- `wechat-devtools-release`: run release preflight checks, deploy CloudBase functions, generate previews, and upload experience versions without conflating upload with review submission.

## Install

Copy any skill directory into your Codex skills directory:

```text
~/.codex/skills/<skill-name>/
```

Restart or refresh Codex so the skill catalog is reloaded. The complete validated bundle is also available under `dist/`.

## Validation

Each skill includes `SKILL.md` and UI metadata. The bundle has been checked with Codex's `quick_validate.py`; the included project-audit and cloud-function comparison scripts were also executed against the source project.
