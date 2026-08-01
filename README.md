# Current Chrome Browser Skill for Claude Code

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
software. It requires the official Playwright MCP server and browser extension.

## Prerequisites

- Claude Code CLI
- Node.js 20 or newer
- Google Chrome or Microsoft Edge
- Official Playwright MCP browser extension
- Official `@playwright/mcp` server configured with `--extension`

## Configure Playwright MCP

Install the extension using the official Playwright documentation, then add the
server to Claude Code.

Windows:

```powershell
claude mcp add playwright -- cmd /c npx -y @playwright/mcp@latest --extension
```

macOS or Linux:

```bash
claude mcp add playwright -- npx -y @playwright/mcp@latest --extension
```

Restart Claude Code and verify the connection:

```bash
claude mcp list
```

Use `/mcp` inside Claude Code to approve the server when prompted.

## Install The Skill

Personal installation makes the skill available in every project.

PowerShell:

```powershell
$target = Join-Path $HOME ".claude\skills\current-chrome-browser"
New-Item $target -ItemType Directory -Force | Out-Null
Copy-Item .\SKILL.md (Join-Path $target "SKILL.md") -Force
```

Bash:

```bash
mkdir -p ~/.claude/skills/current-chrome-browser
cp SKILL.md ~/.claude/skills/current-chrome-browser/SKILL.md
```

For one project, copy `SKILL.md` to:

```text
<project>/.claude/skills/current-chrome-browser/SKILL.md
```

Restart Claude Code if `.claude/skills` did not exist when the current session
started.

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

See [EXAMPLES.md](EXAMPLES.md) for more prompts and expected behavior.

## Security

The skill is not a sandbox. Playwright MCP can interact with authenticated
websites available in the selected browser tab. Keep Claude Code confirmation
prompts enabled and read [SECURITY.md](SECURITY.md) before using sensitive
accounts.

## License

MIT
