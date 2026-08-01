# Usage Examples

## Read-Only Inspection

```text
/current-chrome-browser select the current analytics tab, report the visible date range and top five rows, and do not change any filters
```

Expected behavior:

1. List existing Chrome tabs.
2. Select the matching analytics tab.
3. Confirm the URL and visible date range.
4. Read from accessibility snapshots.
5. Report findings without modifying the page.

## Prepare Without Submitting

```text
/current-chrome-browser use the current GitHub tab to fill a new issue with this title and body, verify the repository, but do not click Submit
```

Expected behavior:

1. Verify the GitHub account and repository.
2. Fill the title and body separately.
3. Confirm the visible values.
4. Stop before the external side effect.

## Explicit Submission

```text
/current-chrome-browser submit the prepared issue in the current GitHub tab, then capture the issue URL
```

Expected behavior:

1. Treat the request as authorization for one submission.
2. Recheck the repository, account, title, and body.
3. Submit once.
4. Verify the resulting issue page and report its URL.

## Long Autosaved Editor

```text
/current-chrome-browser insert the supplied article into the current editor in small batches, wait for autosave, reload, and verify the saved title, headings, and ending; do not publish
```

Expected behavior:

1. Insert content in logical batches.
2. Use trusted keyboard events when editor semantics require them.
3. Wait for autosave between batches.
4. Reload and verify server-persisted content.
5. Stop before publishing.

## Missing Bridge

If Playwright MCP launches a separate browser or cannot list the user's current
tabs, the skill must stop. It must not continue in the fallback browser.
