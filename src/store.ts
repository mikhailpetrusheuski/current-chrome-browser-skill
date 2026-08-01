import { appendFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ActionRecord, TabLease } from "./types.js";

export class GuardStore {
  readonly directory: string;

  constructor(root = process.cwd()) {
    this.directory = path.join(root, ".browser-guard");
  }

  private get leasePath(): string {
    return path.join(this.directory, "lease.json");
  }

  private get ledgerPath(): string {
    return path.join(this.directory, "ledger.jsonl");
  }

  async readLease(): Promise<TabLease | undefined> {
    try {
      return JSON.parse(await readFile(this.leasePath, "utf8")) as TabLease;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
      throw error;
    }
  }

  async writeLease(lease: TabLease): Promise<void> {
    await mkdir(this.directory, { recursive: true });
    const temporary = `${this.leasePath}.${process.pid}.tmp`;
    await writeFile(temporary, `${JSON.stringify(lease, null, 2)}\n`, { flag: "wx" });
    await rename(temporary, this.leasePath);
  }

  async clearLease(): Promise<void> {
    const cleared: TabLease = {
      tab: -1,
      url: "",
      title: "",
      createdAt: new Date().toISOString()
    };
    await this.writeLease(cleared);
  }

  async append(record: ActionRecord): Promise<void> {
    await mkdir(this.directory, { recursive: true });
    await appendFile(this.ledgerPath, `${JSON.stringify(record)}\n`, "utf8");
  }

  async records(): Promise<ActionRecord[]> {
    try {
      const content = await readFile(this.ledgerPath, "utf8");
      return content
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => JSON.parse(line) as ActionRecord);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }
}
