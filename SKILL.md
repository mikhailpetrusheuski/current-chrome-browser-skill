---
name: current-chrome-browser
description: Operate websites only through the user's currently running Chrome and selected tab using the extension-backed Playwright MCP bridge. Use when the user asks Claude Code to inspect, navigate, fill, edit, or perform an explicitly authorized action in their current Chrome session.
disable-model-invocation: true
argument-hint: "[browser task]"
---

# Current Chrome Browser

Perform `$ARGUMENTS` using only the user's already-running Chrome session
exposed by the extension-backed Playwright MCP bridge.

## Browser Boundary

Use only normal browser tools exposed by the extension-backed Playwright MCP
server: tab listing and selection, navigation, accessibility snapshots, find,
click, type, key presses, waiting, file drop, dialogs, and screenshots.

Never:

- launch Chrome, Chromium, or another browser;
- call Playwright scripts from the shell;
- create, read, or reuse a Playwright `storageState` file;
- extract or copy cookies, tokens, local storage, passwords, or session data;
- connect through CDP or a remote-debugging port;
- use a different profile or browser session;
- fall back to HTTP requests, scraping libraries, or another browser MCP;
- use arbitrary browser-code execution when normal MCP tools are sufficient;
- bypass login, CAPTCHA, rate limits, moderation, or platform protections.

If the extension-backed MCP tools or intended current Chrome tab are not
available, stop and state the missing prerequisite. Do not silently substitute
a different browser path.

## Connection Recovery

If a normal browser tool reports that the target page, context, or browser has
been closed:

1. Do not launch a browser or switch to another automation path.
2. Call the MCP tab-listing tool again. The extension bridge may restore the
   current Chrome connection on the next normal tool call.
3. If the first retry fails, wait briefly and retry tab listing one more time.
4. If tabs reappear, select the intended existing tab, take a fresh snapshot,
   verify its URL and title, and continue from the last confirmed browser state.
5. If both retries fail, stop and ask the user to reconnect a Chrome tab through
   the Playwright MCP extension.

Never reuse element references from before a disconnect. Recovery restores the
transport, not proof that the previous page state or side effect persisted.

## Diagnostic Ladder

When a browser action fails:

1. Confirm the MCP server still runs in extension mode.
2. Confirm the failing call used the verified server prefix and not a
   same-named tool from another browser MCP server.
3. List tabs and verify the selected URL is not an extension connect page.
4. Take a fresh snapshot and discard every previous element ref.
5. Retry only a reversible read or navigation step once.
6. Reduce to one client, one browser agent, and one selected tab.
7. Stop rather than retry if an external side effect may already have happened.

A page that loads but shows the wrong content is a failure too. Single-page
consoles answer an unknown path with a silent redirect to a default view, so a
hand-constructed URL can succeed at the transport level and land somewhere
else. Navigate by clicking the application's own links where possible, and
after any navigation confirm the page identity by its heading or title, never
by the tool's success response alone.

Use `TROUBLESHOOTING.md` from this skill repository for symptom-specific
diagnosis. Never fix transport or UI failures by weakening the Browser Boundary.

## Start Every Task

1. Identify the concrete browser goal and any external side effect.
2. List the tabs exposed by Playwright MCP.
3. Verify the tab list proves the extension bridge, not a clean profile. A real
   current-Chrome session shows the user's own tabs. A single `about:blank`, a
   lone new-tab page, or an extension connect page means the call reached a
   launched-profile server. Stop and switch to the extension-backed server
   rather than continuing.
4. Select the existing tab matching the request. Preserve unrelated tabs. When
   no tab matches, open a new tab. Never navigate an unrelated existing tab
   away from what the user left there.
5. Read an accessibility snapshot of the selected tab.
6. Confirm the URL, title, account or login state, and relevant visible UI.
7. If the companion guard from this repository is installed, create a tab lease
   with the verified tab index, URL, title, and account.

When multiple tabs are plausible, ask which tab to use before an action that
can send, submit, publish, purchase, delete, or modify remote data.

When several browser MCP servers are configured, every tool exists under more
than one server prefix and the wrong one fails silently by returning a blank
page instead of an error. Read the server prefix on each browser tool call and
keep using the one whose tab list was verified in step 3.

## Read-Only Fast Path

Listing tabs, navigating, snapshotting, finding text, hovering, and taking
screenshots are reversible. They need the verification in Start Every Task and
nothing more: no authorization, no tab lease, no permit.

Escalate to the full External Side Effects procedure as soon as the task
reaches a control that sends, submits, publishes, purchases, deletes, approves,
or changes remote state. Preparing that control is still reversible; operating
it is not.

## Interaction Method

1. Prefer accessibility-tree `find` operations over full snapshots when the
   target text is known.
2. Use the exact element reference from the latest snapshot or find result.
3. Refresh the snapshot after navigation, modal changes, submission, or DOM
   replacement. Never rely on a stale reference.
4. Prefer roles, visible labels, and accessible names over CSS selectors.
5. Prefer keyboard flow when it is more resilient than UI-specific selectors.
6. Fill one logical field at a time and verify its value.
7. Wait for previews, autosave, validation, or loading indicators.
8. Use screenshots for visual verification, not coordinate-based interaction.
9. When a snapshot or screenshot is written to a file, direct it to a scratch
   or temporary directory and delete it when the task ends. Playwright MCP
   resolves a bare filename against its own output directory, which is often
   the working repository, so an unqualified name leaves untracked files in the
   user's project.

## External Side Effects

Reading, navigating, opening menus, and filling an unsent form are reversible
preparation. Sending, publishing, posting, purchasing, deleting, approving, or
submitting creates an external side effect.

On platforms that restrict automated or bot-like activity, automation may
prepare the form but the user must review and perform the final submission
manually. A successful UI action does not guarantee that a later anti-abuse
classification will not occur.

Before a side effect:

1. Require explicit authorization in the current conversation.
2. Verify the exact account, destination, recipient, item, and payload in the
   visible UI.
3. Verify previews and public versus private URLs where relevant.
4. If the companion guard is installed, verify the tab lease and prepare a
   one-time action permit. Never pass `--authorized` without explicit current-
   conversation authorization.
5. Perform the action exactly once.
6. Capture the resulting confirmation and result URL or identifier.
7. Commit the guard permit only after confirmation. If the action was not
   performed, abort it with a reason. Leave ambiguous outcomes uncommitted.

Never retry an ambiguous submission. Inspect the UI for evidence that the first
attempt succeeded. If certainty is not possible, stop to avoid duplicates.

## Editors And Autosave

- Insert long content in small logical batches.
- Wait for autosave between batches.
- Use separate trusted `Enter` key presses when paragraph, list, or code-block
  semantics depend on keyboard events.
- Verify server-persisted content after a full reload when persistence matters.
- Do not treat an MCP tool's success response as proof that the web application
  accepted or saved the change.

## Mandatory Stop Conditions

Stop without bypass or retry when the page shows:

- login or reauthentication requiring the user;
- CAPTCHA or another platform challenge;
- rate, posting, or usage limit;
- moderation or approval that already confirms submission;
- an account restriction, community ban, or bot-classification notice;
- an unexpected destination or account;
- an ambiguous result that could cause a duplicate side effect.

## Completion Report

Report the selected tab, final URL, completed actions, confirmation text, result
URLs or IDs, and anything blocked or intentionally not attempted.

Do not claim completion based only on successful MCP calls. Confirm the final
browser state.
