# Companion Guard CLI

The companion guard provides local workflow checks for browser agents. It does
not connect to Chrome, call MCP, inspect cookies, or replace confirmation
prompts. The browser agent supplies values it has verified in the visible UI.

## Build And Check

```bash
npm install
npm test
node dist/cli.js preflight
```

Every command emits JSON and returns a non-zero exit code when a guard fails.
Use `--root <directory>` to place state under another working directory.

## Lease A Tab

After `browser_tabs` and a fresh snapshot, bind the task to the verified tab:

```bash
node dist/cli.js lease set \
  --tab 2 \
  --url https://example.com/editor \
  --title "Editor" \
  --account user@example.com
```

Before an external side effect, compare the current browser state with it:

```bash
node dist/cli.js lease verify \
  --tab 2 \
  --url https://example.com/editor \
  --account user@example.com
```

URL fragments are ignored, but the origin, path, and query must match. If an
account was recorded, it must also match.

## Prepare An External Side Effect

Only run `action prepare` after explicit authorization in the current
conversation and after verifying the visible destination and payload:

```bash
node dist/cli.js action prepare \
  --authorized \
  --action send \
  --destination recipient@example.com \
  --payload "Canonical payload used only to compute its hash" \
  --tab 2 \
  --url https://example.com/editor \
  --account user@example.com
```

The output contains a one-time permit ID. The ledger stores a SHA-256 payload
hash, not the payload. Avoid putting secrets in the payload or destination; the
guard is designed for identity and duplicate detection, not secret storage.

After performing the browser action exactly once, finalize the permit:

```bash
node dist/cli.js action commit \
  --id PERMIT_ID \
  --confirmation "Message sent" \
  --result-url https://example.com/messages/123
```

If the action was intentionally not performed:

```bash
node dist/cli.js action abort --id PERMIT_ID --reason "Destination changed"
```

If the browser outcome is ambiguous, do not commit and do not repeat the
action. Inspect the destination first. Abort only when there is evidence the
side effect did not occur.

## Audit State

```bash
node dist/cli.js lease show
node dist/cli.js ledger show
node dist/cli.js lease clear
```

The ledger is append-only JSON Lines. It records state transitions and can
detect an attempt to repeat the same committed action, destination, and payload
within the current state directory.
