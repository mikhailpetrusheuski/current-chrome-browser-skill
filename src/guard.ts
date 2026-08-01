import { createHash, randomUUID } from "node:crypto";
import type { GuardStore } from "./store.js";
import type { ActionRecord, TabLease } from "./types.js";

export class GuardError extends Error {}

export function createLease(input: {
  tab: string;
  url: string;
  title: string;
  account?: string;
}): TabLease {
  const tab = Number.parseInt(input.tab, 10);
  if (!Number.isInteger(tab) || tab < 0) throw new GuardError("tab must be a non-negative integer");
  assertHttpUrl(input.url);
  if (!input.title.trim()) throw new GuardError("title is required");
  return { tab, url: input.url, title: input.title, account: clean(input.account), createdAt: new Date().toISOString() };
}

export function verifyLease(lease: TabLease | undefined, current: {
  tab: string;
  url: string;
  account?: string;
}): void {
  if (!lease || lease.tab < 0) throw new GuardError("no active tab lease");
  if (lease.tab !== Number.parseInt(current.tab, 10)) throw new GuardError("selected tab no longer matches lease");
  if (normalizeUrl(lease.url) !== normalizeUrl(current.url)) throw new GuardError("current URL no longer matches lease");
  if (lease.account && lease.account !== current.account) throw new GuardError("current account no longer matches lease");
}

export async function prepareAction(store: GuardStore, input: {
  authorized: boolean;
  action: string;
  destination: string;
  payload: string;
  tab: string;
  url: string;
  account?: string;
}): Promise<ActionRecord> {
  if (!input.authorized) throw new GuardError("explicit current-conversation authorization is required");
  if (!input.action.trim() || !input.destination.trim()) throw new GuardError("action and destination are required");
  verifyLease(await store.readLease(), input);

  const payloadHash = createHash("sha256").update(input.payload).digest("hex");
  const records = await store.records();
  const committedIds = new Set(records.filter((record) => record.state === "committed").map((record) => record.id));
  const duplicate = records.find((record) =>
    record.state === "prepared" &&
    committedIds.has(record.id) &&
    record.action === input.action &&
    record.destination === input.destination &&
    record.payloadHash === payloadHash
  );
  if (duplicate) throw new GuardError(`matching action already committed as ${duplicate.id}`);

  const record: ActionRecord = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    state: "prepared",
    action: input.action,
    account: clean(input.account),
    destination: input.destination,
    url: input.url,
    payloadHash
  };
  await store.append(record);
  return record;
}

export async function finishAction(store: GuardStore, input: {
  id: string;
  state: "committed" | "aborted";
  confirmation?: string;
  resultUrl?: string;
  reason?: string;
}): Promise<ActionRecord> {
  const records = await store.records();
  const prepared = records.find((record) => record.id === input.id && record.state === "prepared");
  const finished = records.find((record) => record.id === input.id && record.state !== "prepared");
  if (finished) throw new GuardError("action is already finalized");
  if (!prepared) throw new GuardError("prepared action not found");
  if (input.state === "committed" && !input.confirmation?.trim()) {
    throw new GuardError("confirmation is required to commit an action");
  }
  const record: ActionRecord = {
    id: input.id,
    timestamp: new Date().toISOString(),
    state: input.state,
    confirmation: clean(input.confirmation),
    resultUrl: clean(input.resultUrl),
    reason: clean(input.reason)
  };
  await store.append(record);
  return record;
}

function assertHttpUrl(value: string): void {
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new GuardError("URL must use http or https");
}

function normalizeUrl(value: string): string {
  const url = new URL(value);
  url.hash = "";
  return url.toString();
}

function clean(value: string | undefined): string | undefined {
  const result = value?.trim();
  return result || undefined;
}
