# Current Chrome Browser Skill for Claude Code

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Claude Code Skill](https://img.shields.io/badge/Claude_Code-Skill-blue.svg)](SKILL.md)

A safety-focused Claude Code skill for operating the Chrome window you already
use through Microsoft's extension-backed Playwright MCP server.

It is designed for authenticated browser workflows where launching a clean
automation profile is the wrong behavior. The skill requires Claude Code to
select an existing tab, reason from accessibility snapshots, verify external
side effects, and stop on login challenges, limits, or ambiguous submissions.

## Features

- Uses only the current Chrome session and selected existing tab.
- Prefers accessibility snapshots and stable element references.
- Verifies account, destination, payload, preview, and result.
- Prevents silent fallback to another browser or profile.
- Stops on authentication challenges, platform limits, and ambiguity.
- Supports long autosaved editors with reload verification.

This repository contains an instruction layer, not browser automation
software. It also includes an optional local companion CLI that records tab
leases and guards external side effects. It requires the official Playwright
MCP server and browser extension.

## Prerequisites

- Claude Code CLI
- Node.js 20 or newer
- Google Chrome or Microsoft Edge
- [Official Playwright MCP browser extension][playwright-extension]
- Official `@playwright/mcp` server configured with `--extension`

## Configure Playwright MCP

Install the extension using the [official Playwright documentation][playwright-extension],
then add the server to Claude Code.

Give the server a distinct name such as `playwright-chrome`. Do not call it
`playwright`: plugins and marketplaces ship their own Playwright MCP servers,
those run a clean launched profile, and their tools carry the same names as
these. Two servers named alike are indistinguishable at the point of use, and
picking the wrong one does not raise an error — it returns a blank page or a
login screen from a profile that is not yours.

Windows:

```powershell
claude mcp add playwright-chrome -- cmd /c npx -y @playwright/mcp@latest --extension
```

macOS or Linux:

```bash
claude mcp add playwright-chrome -- npx -y @playwright/mcp@latest --extension
```

Restart Claude Code and verify the connection:

```bash
claude mcp list
```

Use `/mcp` inside Claude Code to approve the server when prompted.

If another browser MCP server is already configured, remove or disable it for
the duration of authenticated browser work. The skill can be told which server
to trust, but it cannot recover the time lost to a wrong call that looked like
an empty page.

## Install The Skill

Personal installation makes the skill available in every project.

PowerShell:

```powershell
$repo = Join-Path $env:TEMP "current-chrome-browser-skill"
git clone https://github.com/mikhailpetrusheuski/current-chrome-browser-skill $repo
$target = Join-Path $HOME ".claude\skills\current-chrome-browser"
New-Item $target -ItemType Directory -Force | Out-Null
Copy-Item (Join-Path $repo "SKILL.md") (Join-Path $target "SKILL.md") -Force
```

Bash:

```bash
git clone https://github.com/mikhailpetrusheuski/current-chrome-browser-skill /tmp/current-chrome-browser-skill
mkdir -p ~/.claude/skills/current-chrome-browser
cp /tmp/current-chrome-browser-skill/SKILL.md ~/.claude/skills/current-chrome-browser/SKILL.md
```

For one project, copy `SKILL.md` to:

```text
<project>/.claude/skills/current-chrome-browser/SKILL.md
```

A project installation is visible only inside that project. In a multi-repository
workspace, place it at the workspace root that Claude Code opens, not in a
nested repository, or the skill will not be listed.

Restart Claude Code if `.claude/skills` did not exist when the current session
started. Until the restart the skill is absent from the session, and asking for
it reports an unknown skill rather than a pending installation.

## Usage

Invoke the skill explicitly:

```text
/current-chrome-browser list the tabs in my current Chrome and summarize the active documentation page
```

```text
/current-chrome-browser use the current GitHub tab to prepare an issue, but do not submit it
```

```text
/current-chrome-browser update the draft in the selected editor, wait for autosave, reload, and verify persistence
```

The skill has `disable-model-invocation: true`, so Claude cannot invoke it
automatically. Access to an authenticated browser remains under explicit user
control.

This is deliberate, and it has a confusing symptom: if Claude tries to invoke
the skill on its own it is told the skill is unknown, which reads as a broken
installation. Only the user typing `/current-chrome-browser` starts it. Ask the
user to run the command rather than diagnosing the installation.

See [EXAMPLES.md](EXAMPLES.md) for more prompts and expected behavior.

## Optional Companion Guard

The TypeScript CLI adds machine-checkable workflow state without controlling
the browser or reading its session:

```bash
npm install
npm run build
node dist/cli.js preflight
```

It can bind work to a selected tab, require an explicit authorization flag,
detect a repeated committed payload, and append confirmation records. Raw
payload content is never written to its ledger. State stays in the ignored
`.browser-guard/` directory.

See [GUARD.md](GUARD.md) for the command contract and integration workflow.

For connection failures, stale refs, large snapshots, shadow DOM, file uploads,
parallel-agent interference, editor corruption, and ambiguous submissions, see
[TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Security

The skill is not a sandbox. Playwright MCP can interact with authenticated
websites available in the selected browser tab. Keep Claude Code confirmation
prompts enabled and read [SECURITY.md](SECURITY.md) before using sensitive
accounts.

Learn more in the official [Claude Code skills documentation][claude-skills]
and [Playwright MCP guide][playwright-mcp].

## License

MIT

[claude-skills]: https://code.claude.com/docs/en/slash-commands
[playwright-extension]: https://playwright.dev/mcp/configuration/browser-extension
[playwright-mcp]: https://playwright.dev/docs/getting-started-mcp
