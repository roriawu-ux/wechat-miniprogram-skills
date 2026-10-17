---
name: wechat-devtools-release
description: Inspect, preview, deploy CloudBase functions for, and upload a WeChat Mini Program with the WeChat DevTools CLI. Use for QR previews, experience-version uploads, pre-release audits, CLI port failures, or verifying what was actually deployed. Submission for review remains a separate explicit action.
---

# WeChat DevTools Release

Operate from evidence discovered in the project and the currently running WeChat DevTools. Do not embed AppIDs, cloud environment IDs, function names, CLI paths, ports, or version numbers from another project.

## Establish the target

1. Read `project.config.json` for the Mini Program root, cloud-function root, AppID, and project name.
2. Read the application's environment configuration for the active cloud environment and function name.
3. Inspect existing version conventions and the user's requested endpoint: local preview, preview QR, experience-version upload, or review submission.
4. Keep these actions distinct. An instruction to upload an experience version does not authorize review submission or production promotion.

## Run the gate

Use `node scripts/preflight.js --project <project-root>` as a baseline, then run the repository's own tests and build/bundle steps. Read [references/devtools-cli.md](references/devtools-cli.md) for deployment and CLI troubleshooting.

Before any external mutation, verify:

- changed JavaScript and JSON parse;
- all declared pages have required files;
- referenced local assets exist;
- main package and subpackages fit the currently applicable WeChat limits;
- development and production cloud sources are in the intended state;
- the cloud bundle contains the newly added actions and constants;
- relevant rule, permission, and regression tests pass;
- the version and description identify the actual changes.

## Deploy and preview/upload

- Deploy only the function and environment requested or implied by the target. Development and production are separate targets.
- Capture the CLI's success output and query function status when possible.
- Generate a QR preview when the user asks to open or inspect a preview. A browser mockup is useful for layout but does not replace a WeChat runtime check.
- Upload the requested version only after the gate passes. Report the exact version, target function/environment, and checks run.
- Never call the review-submission command unless the user explicitly asks to submit for review.

Stop if the project AppID, active cloud environment, or requested release target is ambiguous and cannot be derived safely. Do not guess live identifiers.
