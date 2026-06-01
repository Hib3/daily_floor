import { describe, expect, it } from "vitest";
import { validateBackup } from "./backup";
import { generateIcs } from "./ics";
import type { ReminderRule } from "./types";

describe("backup and ics", () => {
  it("validates backup shape", () => {
    expect(validateBackup({ appName: "Daily Floor", schemaVersion: 1, exportedAt: "", timezone: "Asia/Tokyo", tables: {} })).toBe(true);
    expect(validateBackup({ appName: "Other", schemaVersion: 1, timezone: "Asia/Tokyo", tables: {} })).toBe(false);
  });

  it("generates calendar events", () => {
    const rules: ReminderRule[] = [{ id: "r", title: "朝チェックイン", time: "09:00", enabled: true, kind: "checkin", targetRoute: "/checkin" }];
    const ics = generateIcs(rules, "2026-06-01", "2026-06-01");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("TZID:Asia/Tokyo");
    expect(ics).toContain("SUMMARY:朝チェックイン");
    expect(ics).toContain("BEGIN:VALARM");
  });
});
