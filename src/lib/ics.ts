import type { ReminderRule } from "./types";

export function generateIcs(rules: ReminderRule[], startDate: string, endDate: string): string {
  const enabled = rules.filter((rule) => rule.enabled);
  const dates = dateRange(startDate, endDate);
  const events = dates.flatMap((date) => enabled.map((rule) => eventFor(rule, date)));
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Daily Floor//Local PWA//JA",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-TIMEZONE:Asia/Tokyo",
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Tokyo",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0900",
    "TZOFFSETTO:+0900",
    "TZNAME:JST",
    "END:STANDARD",
    "END:VTIMEZONE",
    ...events,
    "END:VCALENDAR"
  ].join("\r\n");
}

function eventFor(rule: ReminderRule, date: string): string {
  const stamp = compactUtc(new Date());
  const start = `${date.replaceAll("-", "")}T${rule.time.replace(":", "")}00`;
  const endDate = new Date(`${date}T${rule.time}:00+09:00`);
  endDate.setMinutes(endDate.getMinutes() + 15);
  const end = localCompact(endDate);
  return [
    "BEGIN:VEVENT",
    `UID:${rule.id}-${date}@daily-floor.local`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Asia/Tokyo:${start}`,
    `DTEND;TZID=Asia/Tokyo:${end}`,
    `SUMMARY:${escapeIcs(rule.title)}`,
    `DESCRIPTION:${escapeIcs(`Daily Floor: ${rule.targetRoute}`)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT5M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcs(rule.title)}`,
    "END:VALARM",
    "END:VEVENT"
  ].join("\r\n");
}

function dateRange(startDate: string, endDate: string): string[] {
  const result: string[] = [];
  const current = new Date(`${startDate}T00:00:00+09:00`);
  const end = new Date(`${endDate}T00:00:00+09:00`);
  while (current <= end) {
    result.push(localDate(current));
    current.setDate(current.getDate() + 1);
  }
  return result;
}

function localDate(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function localCompact(date: Date): string {
  const parts = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(date);
  return parts.replaceAll("-", "").replaceAll(":", "").replace(" ", "T");
}

function compactUtc(date: Date): string {
  return date.toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcs(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll(",", "\\,").replaceAll(";", "\\;").replaceAll("\n", "\\n");
}
