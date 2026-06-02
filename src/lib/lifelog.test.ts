import { describe, expect, it } from "vitest";
import { assertNoDiagnosticLanguage, getEntryPreview, groupEntriesByMonth, summarizeStats } from "./lifelog";
import type { LifelogEntry } from "./types";

function entry(id: string, happenedAt: string, body: string, kind: LifelogEntry["kind"] = "text"): LifelogEntry {
  return {
    id,
    journalId: "life",
    kind,
    body,
    tags: [],
    attachments: [],
    happenedAt,
    createdAt: happenedAt,
    updatedAt: happenedAt,
    shareCandidate: false
  };
}

describe("lifelog", () => {
  it("groups entries newest first by month", () => {
    const groups = groupEntriesByMonth([
      entry("old", "2026-05-01T00:00:00.000Z", "old"),
      entry("new", "2026-06-02T00:00:00.000Z", "new")
    ]);
    expect(groups[0].entries[0].id).toBe("new");
  });

  it("summarizes timeline facts without judging blank days", () => {
    const stats = summarizeStats([
      entry("1", "2026-06-02T00:00:00.000Z", "a"),
      entry("2", "2026-06-02T01:00:00.000Z", "b", "rest")
    ], new Date("2026-06-02T12:00:00.000Z"));
    expect(stats.todayEntries).toBe(2);
    expect(stats.restEntries).toBe(1);
    expect(stats.monthEntryDays["2026-06-02"]).toBe(2);
  });

  it("creates useful previews and blocks diagnostic wording", () => {
    expect(getEntryPreview(entry("p", "2026-06-02T00:00:00.000Z", ""))).toBe("短い記録");
    expect(() => assertNoDiagnosticLanguage("診断")).toThrow();
  });
});
