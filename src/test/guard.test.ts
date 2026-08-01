import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createLease, finishAction, GuardError, prepareAction, verifyLease } from "../guard.js";
import { GuardStore } from "../store.js";

async function fixture(): Promise<GuardStore> {
  return new GuardStore(await mkdtemp(path.join(os.tmpdir(), "browser-guard-")));
}

test("creates and verifies an exact tab lease", async () => {
  const store = await fixture();
  const lease = createLease({ tab: "2", url: "https://example.com/edit#section", title: "Edit", account: "alice" });
  await store.writeLease(lease);
  verifyLease(await store.readLease(), { tab: "2", url: "https://example.com/edit", account: "alice" });
  assert.throws(() => verifyLease(lease, { tab: "3", url: lease.url, account: "alice" }), GuardError);
});

test("requires authorization and prevents duplicate committed payloads", async () => {
  const store = await fixture();
  await store.writeLease(createLease({ tab: "0", url: "https://example.com/new", title: "New", account: "alice" }));
  const input = { authorized: true, action: "post", destination: "team", payload: "hello", tab: "0", url: "https://example.com/new", account: "alice" };
  await assert.rejects(() => prepareAction(store, { ...input, authorized: false }), /authorization/);
  const prepared = await prepareAction(store, input);
  await finishAction(store, { id: prepared.id, state: "committed", confirmation: "Posted", resultUrl: "https://example.com/p/1" });
  await assert.rejects(
    () => finishAction(store, { id: prepared.id, state: "committed", confirmation: "Posted" }),
    /already finalized/
  );
  await assert.rejects(() => prepareAction(store, input), /already committed/);
});

test("does not persist raw payload text", async () => {
  const store = await fixture();
  await store.writeLease(createLease({ tab: "1", url: "https://example.com", title: "Example" }));
  await prepareAction(store, { authorized: true, action: "send", destination: "recipient", payload: "private body", tab: "1", url: "https://example.com" });
  assert.equal(JSON.stringify(await store.records()).includes("private body"), false);
});
