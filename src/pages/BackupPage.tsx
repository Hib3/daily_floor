import { FormEvent, useEffect, useState } from "react";
import { Card, Field, TextInput } from "../components/Fields";
import { db } from "../lib/db";
import { downloadText, exportBackup, importBackup, toCsv, validateBackup } from "../lib/backup";
import { generateIcs } from "../lib/ics";
import { todayString } from "../lib/logic";
import type { ReminderRule } from "../lib/types";

export function BackupPage() {
  const [rules, setRules] = useState<ReminderRule[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => { db.reminderRules.toArray().then(setRules); }, []);

  async function exportJson() {
    const payload = await exportBackup(db);
    await db.backupMeta.put({ id: payload.exportedAt, exportedAt: payload.exportedAt });
    downloadText("daily-floor-backup.json", JSON.stringify(payload, null, 2), "application/json");
  }

  async function exportCsv(table: "checkins" | "avoidanceSessions" | "restLogs" | "sleepLogs") {
    const rows = await db[table].toArray() as unknown as Record<string, unknown>[];
    downloadText(`daily-floor-${table}.csv`, toCsv(rows), "text/csv;charset=utf-8");
  }

  async function importJson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = (new FormData(event.currentTarget).get("file") as File | null);
    if (!file) return;
    const payload = JSON.parse(await file.text()) as unknown;
    if (!validateBackup(payload)) {
      setMessage("バックアップ形式が一致しません。");
      return;
    }
    if (!confirm("現在のローカルデータを上書きします。先にバックアップを推奨します。")) return;
    await importBackup(db, payload);
    setMessage("インポートしました。");
  }

  function exportIcs(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const start = String(form.get("start") || todayString());
    const end = String(form.get("end") || start);
    downloadText("daily-floor-reminders.ics", generateIcs(rules, start, end), "text/calendar;charset=utf-8");
  }

  return (
    <div className="stack">
      <Card title="バックアップ">
        <p>データはブラウザのIndexedDBに保存されます。端末変更やブラウザ都合に備えて定期的にJSONを保存してください。</p>
        <div className="button-row">
          <button className="primary" onClick={exportJson}>JSONバックアップ出力</button>
          <button onClick={() => exportCsv("checkins")}>チェックインCSV</button>
          <button onClick={() => exportCsv("avoidanceSessions")}>接触ログCSV</button>
          <button onClick={() => exportCsv("restLogs")}>休養CSV</button>
          <button onClick={() => exportCsv("sleepLogs")}>睡眠CSV</button>
        </div>
        <form onSubmit={importJson} className="form-grid">
          <Field label="JSONインポート"><input type="file" name="file" accept="application/json" /></Field>
          <button>上書きインポート</button>
        </form>
      </Card>
      <Card title=".ics カレンダー出力">
        <p>PWA単体の通知は端末・ブラウザに依存します。確実な時刻通知はカレンダー出力を使ってください。</p>
        <form className="form-grid" onSubmit={exportIcs}>
          <Field label="開始日"><TextInput type="date" name="start" defaultValue={todayString()} /></Field>
          <Field label="終了日"><TextInput type="date" name="end" defaultValue={todayString()} /></Field>
          <button className="primary">.icsを出力</button>
        </form>
      </Card>
      {message && <p className="success">{message}</p>}
    </div>
  );
}
