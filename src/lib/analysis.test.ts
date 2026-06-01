import { describe, expect, it } from "vitest";
import { analyzeWeek, counselorMarkdown, doctorMarkdown, sanitizeReport } from "./analysis";

describe("analysis", () => {
  it("aggregates weekly facts", () => {
    const analysis = analyzeWeek({
      checkins: [{ id: "1", date: "2026-06-01", sleepiness: 1, moodHeaviness: 1, anxiety: 1, bodyHeaviness: 1, energyLevel: "A", createdAt: "", updatedAt: "" }],
      sessions: [
        { id: "s1", date: "2026-06-01", taskId: "az900", startedAt: "", emotionLabel: "anxiety", cascadeStepReached: "open_only", outcome: "contact_done", selfCriticism: true }
      ],
      restLogs: [{ id: "r1", date: "2026-06-01", createdAt: "", counselorShareCandidate: false }],
      sleepLogs: [{ id: "sl1", date: "2026-06-01", sleepHours: 5.5, napMinutes: 40, caffeineLastTime: "15:00", createdAt: "", updatedAt: "" }]
    });
    expect(analysis.checkinDays).toBe(1);
    expect(analysis.contactOnlyCompletions).toBe(1);
    expect(analysis.selfCriticismCount).toBe(1);
    expect(analysis.sleepUnder6Days).toBe(1);
    expect(analysis.longNapDays).toBe(1);
    expect(analysis.lateCaffeineEntries).toBe(1);
  });

  it("report markdown avoids forbidden diagnostic language", () => {
    const analysis = analyzeWeek({ checkins: [], sessions: [], restLogs: [], sleepLogs: [] });
    expect(counselorMarkdown(analysis)).toContain("カウンセラー共有用メモ");
    expect(doctorMarkdown(analysis)).toContain("注意して見たい変化");
    expect(() => sanitizeReport("躁")).toThrow();
  });
});
