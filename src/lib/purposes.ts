import type { EnergyLevel, LifelogEntry, PurposeEvent, PurposeGoal, PurposeStats } from "./types";
import { dayKey } from "./lifelog";

export type PurposeDraft = Pick<PurposeGoal, "title" | "why" | "category" | "targetDate" | "nextAction" | "floorAction" | "ifTrigger" | "thenAction" | "shareCandidate">;

export type ReflectionInput = {
  planned: string;
  happened: string;
  learned: string;
  nextAction: string;
  energy?: EnergyLevel;
  shareCandidate: boolean;
};

export function emptyPurposeDraft(): PurposeDraft {
  return {
    title: "",
    why: "",
    category: "life",
    targetDate: "",
    nextAction: "",
    floorAction: "",
    ifTrigger: "",
    thenAction: "",
    shareCandidate: false
  };
}

export function normalizePurposeDraft(draft: PurposeDraft, now = new Date()): PurposeGoal {
  const title = draft.title.trim() || "名前のない目的";
  const nextAction = draft.nextAction.trim() || draft.floorAction.trim() || "1行だけ記録する";
  const floorAction = draft.floorAction.trim() || "アプリを開く";
  const ifTrigger = draft.ifTrigger.trim() || "迷ったら";
  const thenAction = draft.thenAction.trim() || floorAction;
  const timestamp = now.toISOString();
  return {
    id: crypto.randomUUID(),
    title,
    why: draft.why?.trim() || undefined,
    category: draft.category,
    status: "active",
    targetDate: draft.targetDate || undefined,
    nextAction,
    floorAction,
    ifTrigger,
    thenAction,
    doneCount: 0,
    reviewCount: 0,
    shareCandidate: draft.shareCandidate,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function updatePurposeFromDraft(existing: PurposeGoal, draft: PurposeDraft, now = new Date()): PurposeGoal {
  const normalized = normalizePurposeDraft(draft, now);
  return {
    ...existing,
    title: normalized.title,
    why: normalized.why,
    category: normalized.category,
    targetDate: normalized.targetDate,
    nextAction: normalized.nextAction,
    floorAction: normalized.floorAction,
    ifTrigger: normalized.ifTrigger,
    thenAction: normalized.thenAction,
    shareCandidate: normalized.shareCandidate,
    updatedAt: now.toISOString()
  };
}

export function buildIfThenText(goal: PurposeGoal): string {
  return `もし「${goal.ifTrigger}」なら、「${goal.thenAction}」をする`;
}

export function summarizePurposeStats(goals: PurposeGoal[], events: PurposeEvent[], today = new Date()): PurposeStats {
  const todayKey = dayKey(today.toISOString());
  return {
    activeCount: goals.filter((goal) => goal.status === "active").length,
    doneToday: events.filter((event) => event.type === "step_done" && dayKey(event.happenedAt) === todayKey).length,
    totalDone: events.filter((event) => event.type === "step_done").length,
    reviewCount: events.filter((event) => event.type === "review").length
  };
}

export function completePurposeStep(goal: PurposeGoal, note = "", now = new Date()): { goal: PurposeGoal; event: PurposeEvent; entry: LifelogEntry } {
  const timestamp = now.toISOString();
  const updated: PurposeGoal = {
    ...goal,
    doneCount: goal.doneCount + 1,
    lastDoneAt: timestamp,
    updatedAt: timestamp
  };
  const title = `${goal.title}の1歩を完了`;
  const body = [
    `目的: ${goal.title}`,
    `今日の1歩: ${goal.nextAction}`,
    note.trim() ? `メモ: ${note.trim()}` : "",
    `次の合図: ${buildIfThenText(goal)}`
  ].filter(Boolean).join("\n");
  return {
    goal: updated,
    event: {
      id: crypto.randomUUID(),
      purposeId: goal.id,
      type: "step_done",
      title,
      note: note.trim() || undefined,
      nextAction: goal.nextAction,
      happenedAt: timestamp,
      createdAt: timestamp,
      shareCandidate: goal.shareCandidate
    },
    entry: purposeEntry({
      title,
      body,
      happenedAt: timestamp,
      shareCandidate: goal.shareCandidate,
      tags: ["目的", "達成"]
    })
  };
}

export function reflectPurpose(goal: PurposeGoal, input: ReflectionInput, now = new Date()): { goal: PurposeGoal; event: PurposeEvent; entry: LifelogEntry } {
  const timestamp = now.toISOString();
  const nextAction = input.nextAction.trim() || goal.nextAction;
  const updated: PurposeGoal = {
    ...goal,
    nextAction,
    reviewCount: goal.reviewCount + 1,
    shareCandidate: goal.shareCandidate || input.shareCandidate,
    updatedAt: timestamp
  };
  const title = `${goal.title}の振り返り`;
  const body = [
    `目的: ${goal.title}`,
    `予定: ${input.planned.trim() || goal.nextAction}`,
    `実際: ${input.happened.trim() || "未記入"}`,
    `学び: ${input.learned.trim() || "未記入"}`,
    `次の1歩: ${nextAction}`
  ].join("\n");
  return {
    goal: updated,
    event: {
      id: crypto.randomUUID(),
      purposeId: goal.id,
      type: "review",
      title,
      planned: input.planned.trim() || goal.nextAction,
      happened: input.happened.trim() || undefined,
      learned: input.learned.trim() || undefined,
      nextAction,
      energy: input.energy,
      happenedAt: timestamp,
      createdAt: timestamp,
      shareCandidate: input.shareCandidate
    },
    entry: purposeEntry({
      title,
      body,
      happenedAt: timestamp,
      shareCandidate: input.shareCandidate,
      tags: ["目的", "振り返り"]
    })
  };
}

function purposeEntry(input: { title: string; body: string; happenedAt: string; shareCandidate: boolean; tags: string[] }): LifelogEntry {
  return {
    id: crypto.randomUUID(),
    journalId: "life",
    kind: "text",
    title: input.title,
    body: input.body,
    tags: input.tags,
    attachments: [],
    happenedAt: input.happenedAt,
    createdAt: input.happenedAt,
    updatedAt: input.happenedAt,
    shareCandidate: input.shareCandidate
  };
}

