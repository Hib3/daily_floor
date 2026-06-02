import type { EnergyLevel, LifelogEntry, LifelogKind, LifelogStats } from "./types";

export function nowLocalInputValue(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function isoFromLocalInput(value: string): string {
  return value ? new Date(value).toISOString() : new Date().toISOString();
}

export function formatDateJa(value: string): string {
  return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(new Date(value));
}

export function formatTime(value: string): string {
  return new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function monthKey(value: string): string {
  return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long" }).format(new Date(value));
}

export function dayKey(value: string): string {
  const d = new Date(value);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function groupEntriesByMonth(entries: LifelogEntry[]): Array<{ month: string; entries: LifelogEntry[] }> {
  const groups = new Map<string, LifelogEntry[]>();
  for (const entry of [...entries].sort((a, b) => b.happenedAt.localeCompare(a.happenedAt))) {
    const key = monthKey(entry.happenedAt);
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }
  return [...groups.entries()].map(([month, items]) => ({ month, entries: items }));
}

export function getEntryPreview(entry: LifelogEntry): string {
  if (entry.body.trim()) return entry.body.trim().replace(/\s+/g, " ").slice(0, 90);
  if (entry.kind === "photo") return "写真を保存しました";
  if (entry.kind === "file") return "添付ファイルを保存しました";
  if (entry.kind === "rest") return "休養ログを保存しました";
  if (entry.kind === "later") return "後で書く枠を作りました";
  return "短い記録";
}

export function kindLabel(kind: LifelogKind): string {
  return {
    text: "日記",
    mood: "気分",
    photo: "写真",
    file: "添付",
    health: "状態",
    rest: "休養",
    later: "後で"
  }[kind];
}

export function estimateEnergyFromMood(input: { mood?: string; body?: string }): EnergyLevel | undefined {
  const text = `${input.mood ?? ""} ${input.body ?? ""}`;
  if (/休|無理|寝|疲|重い|しんど/.test(text)) return "D";
  if (/不安|焦|怖/.test(text)) return "C";
  if (/普通|淡々|まあ/.test(text)) return "B";
  if (/良|できた|楽/.test(text)) return "A";
  return undefined;
}

export function summarizeStats(entries: LifelogEntry[], today = new Date()): LifelogStats {
  const todayKey = dayKey(today.toISOString());
  const monthEntryDays: Record<string, number> = {};
  for (const entry of entries) {
    const key = dayKey(entry.happenedAt);
    monthEntryDays[key] = (monthEntryDays[key] ?? 0) + 1;
  }
  return {
    todayEntries: entries.filter((entry) => dayKey(entry.happenedAt) === todayKey).length,
    totalEntries: entries.length,
    restEntries: entries.filter((entry) => entry.kind === "rest").length,
    latestAt: [...entries].sort((a, b) => b.happenedAt.localeCompare(a.happenedAt))[0]?.happenedAt,
    monthEntryDays
  };
}

export function assertNoDiagnosticLanguage(text: string): void {
  const forbidden = ["診断", "躁", "うつ病", "服薬", "治療判断"];
  for (const word of forbidden) {
    if (text.includes(word)) throw new Error(`Forbidden diagnostic wording: ${word}`);
  }
}
