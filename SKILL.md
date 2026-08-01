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

## Start Every Task

1. Identify the concrete browser goal and any external side effect.
2. List the tabs exposed by Playwright MCP.
3. Select the existing tab matching the request. Preserve unrelated tabs.
4. Read an accessibility snapshot of the selected tab.
5. Confirm the URL, title, account or login state, and relevant visible UI.

When multiple tabs are plausible, ask which tab to use before an action that
can send, submit, publish, purchase, delete, or modify remote data.

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

## External Side Effects

Reading, navigating, opening menus, and filling an unsent form are reversible
preparation. Sending, publishing, posting, purchasing, deleting, approving, or
submitting creates an external side effect.

Before a side effect:

1. Require explicit authorization in the current conversation.
2. Verify the exact account, destination, recipient, item, and payload in the
   visible UI.
3. Verify previews and public versus private URLs where relevant.
4. Perform the action exactly once.
5. Capture the resulting confirmation and result URL or identifier.

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
- an unexpected destination or account;
- an ambiguous result that could cause a duplicate side effect.

## Completion Report

Report the selected tab, final URL, completed actions, confirmation text, result
URLs or IDs, and anything blocked or intentionally not attempted.

Do not claim completion based only on successful MCP calls. Confirm the final
browser state.
