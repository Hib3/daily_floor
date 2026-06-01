import type { DailyFloorDb } from "./db";
import { schemaVersion } from "./seed";

export type BackupPayload = {
  appName: "Daily Floor";
  schemaVersion: number;
  exportedAt: string;
  timezone: "Asia/Tokyo";
  tables: Record<string, unknown[]>;
};

export async function exportBackup(database: DailyFloorDb): Promise<BackupPayload> {
  const tables: Record<string, unknown[]> = {};
  for (const table of database.tables) {
    tables[table.name] = await table.toArray();
  }
  return {
    appName: "Daily Floor",
    schemaVersion,
    exportedAt: new Date().toISOString(),
    timezone: "Asia/Tokyo",
    tables
  };
}

export function validateBackup(value: unknown): value is BackupPayload {
  const payload = value as BackupPayload;
  return Boolean(
    payload &&
      payload.appName === "Daily Floor" &&
      payload.schemaVersion === schemaVersion &&
      payload.timezone === "Asia/Tokyo" &&
      payload.tables &&
      typeof payload.tables === "object"
  );
}

export async function importBackup(database: DailyFloorDb, payload: BackupPayload): Promise<void> {
  if (!validateBackup(payload)) throw new Error("バックアップ形式が一致しません。");
  await database.transaction("rw", database.tables, async () => {
    for (const table of database.tables) {
      await table.clear();
      const rows = payload.tables[table.name] ?? [];
      if (rows.length) await table.bulkPut(rows as never[]);
    }
  });
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return [headers.join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\n");
}

function csvCell(value: unknown): string {
  if (value === undefined || value === null) return "";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function downloadText(filename: string, text: string, type = "text/plain;charset=utf-8"): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
