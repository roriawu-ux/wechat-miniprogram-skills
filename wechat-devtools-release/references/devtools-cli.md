# DevTools CLI workflow

Commands vary by DevTools version. Check `cli --help` and subcommand help before using an unfamiliar flag.

## Discover the CLI and active port

Run `powershell -File scripts/find_devtools.ps1`. Prefer the CLI beside the running DevTools installation. The HTTP port may differ from the historical default; use the port actually reported by the IDE or process inspection.

If a command says another IDE port is active, switch to that port rather than repeatedly forcing a stale one. Opening another visible IDE instance can disrupt the user's session, so reuse the current instance when possible.

## Typical command shapes

Use placeholders resolved from the current project:

```powershell
& '<cli>' open --project '<project-root>' --port <port>
& '<cli>' preview --project '<project-root>' --qr-output '<absolute-png-path>' --port <port>
& '<cli>' upload --project '<project-root>' --version '<version>' --desc '<description>' --port <port>
& '<cli>' cloud functions inc-deploy --env '<env-id>' --path '<bundled-function-dir>' --file 'index.js' --appid '<appid>' --port <port>
```

Check the current CLI help because some versions place global options differently.

## Function packaging

- Prefer the repository's existing bundler or dependency installation process.
- Syntax-check the generated entry file.
- Search the bundle for the new router actions and critical constants so an outdated artifact is not deployed.
- Do not assume editing `cloudfunctions/<name>` automatically updates a separate `cloud-release/<name>` directory.

## Evidence of completion

For deployment, retain function name, environment, CLI success output, and current function status. For upload, retain version, description, AppID/project, and CLI success output. For preview, retain the QR output path or visible DevTools preview.

Uploading creates a development/experience build; it does not itself prove that a tester opened the newest build. If a device shows old behavior, confirm the uploaded version, close/reopen or refresh the experience build, and verify that the client points to the newly deployed cloud function.
