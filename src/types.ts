export interface TabLease {
  tab: number;
  url: string;
  title: string;
  account?: string;
  createdAt: string;
}

export type ActionState = "prepared" | "committed" | "aborted";

export interface ActionRecord {
  id: string;
  timestamp: string;
  state: ActionState;
  action?: string;
  account?: string;
  destination?: string;
  url?: string;
  payloadHash?: string;
  confirmation?: string;
  resultUrl?: string;
  reason?: string;
}
