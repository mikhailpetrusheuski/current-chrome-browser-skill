#!/usr/bin/env node
import process from "node:process";
import { createLease, finishAction, GuardError, prepareAction, verifyLease } from "./guard.js";
import { GuardStore } from "./store.js";

type Flags = Record<string, string | boolean>;

async function main(): Promise<void> {
  const [command, subcommand, ...rest] = process.argv.slice(2);
  const flags = parseFlags(rest);
  const store = new GuardStore(flag(flags, "root", false) ?? process.cwd());

  if (command === "preflight") {
    const major = Number.parseInt(process.versions.node.split(".")[0], 10);
    output({ ok: major >= 20, node: process.version, stateDirectory: store.directory });
    if (major < 20) process.exitCode = 1;
    return;
  }
  if (command === "lease" && subcommand === "set") {
    const lease = createLease({
      tab: required(flags, "tab"), url: required(flags, "url"), title: required(flags, "title"), account: flag(flags, "account", false)
    });
    await store.writeLease(lease);
    output({ ok: true, lease });
    return;
  }
  if (command === "lease" && subcommand === "show") {
    output({ ok: true, lease: await store.readLease() });
    return;
  }
  if (command === "lease" && subcommand === "verify") {
    verifyLease(await store.readLease(), {
      tab: required(flags, "tab"), url: required(flags, "url"), account: flag(flags, "account", false)
    });
    output({ ok: true });
    return;
  }
  if (command === "lease" && subcommand === "clear") {
    await store.clearLease();
    output({ ok: true });
    return;
  }
  if (command === "action" && subcommand === "prepare") {
    const record = await prepareAction(store, {
      authorized: flags.authorized === true,
      action: required(flags, "action"), destination: required(flags, "destination"), payload: required(flags, "payload"),
      tab: required(flags, "tab"), url: required(flags, "url"), account: flag(flags, "account", false)
    });
    output({ ok: true, permit: record.id, payloadHash: record.payloadHash });
    return;
  }
  if (command === "action" && (subcommand === "commit" || subcommand === "abort")) {
    const record = await finishAction(store, {
      id: required(flags, "id"), state: subcommand === "commit" ? "committed" : "aborted",
      confirmation: flag(flags, "confirmation", false), resultUrl: flag(flags, "result-url", false), reason: flag(flags, "reason", false)
    });
    output({ ok: true, record });
    return;
  }
  if (command === "ledger" && subcommand === "show") {
    output({ ok: true, records: await store.records() });
    return;
  }
  throw new GuardError("unknown command; use preflight, lease set/show/verify/clear, action prepare/commit/abort, or ledger show");
}

function parseFlags(args: string[]): Flags {
  const flags: Flags = {};
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (!token.startsWith("--")) throw new GuardError(`unexpected argument: ${token}`);
    const key = token.slice(2);
    const next = args[index + 1];
    if (!next || next.startsWith("--")) flags[key] = true;
    else { flags[key] = next; index += 1; }
  }
  return flags;
}

function required(flags: Flags, name: string): string {
  const value = flag(flags, name, false);
  if (!value) throw new GuardError(`--${name} is required`);
  return value;
}

function flag(flags: Flags, name: string, allowBoolean: false): string | undefined {
  const value = flags[name];
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    if (allowBoolean) return String(value);
    throw new GuardError(`--${name} requires a value`);
  }
  return value;
}

function output(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${JSON.stringify({ ok: false, error: message })}\n`);
  process.exitCode = error instanceof GuardError ? 2 : 1;
});
