import { useEffect, useState } from "react";
import { Card } from "../components/Fields";
import { db } from "../lib/db";
import type { WeeklyAnalysis } from "../lib/types";
import { counselorMarkdown, doctorMarkdown, workMarkdown } from "../lib/analysis";
import { downloadText } from "../lib/backup";

export function ReportsPage() {
  const [analysis, setAnalysis] = useState<WeeklyAnalysis | null>(null);
  const [markdown, setMarkdown] = useState({ counselor: "", doctor: "", work: "" });

  useEffect(() => {
    Promise.all([db.checkins.toArray(), db.avoidanceSessions.toArray(), db.restLogs.toArray(), db.sleepLogs.toArray()]).then(([checkins, sessions, restLogs, sleepLogs]) => {
      const worker = new Worker(new URL("../workers/reportWorker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (event: MessageEvent<{ analysis: WeeklyAnalysis; counselor: string; doctor: string; work: string }>) => {
        setAnalysis(event.data.analysis);
        setMarkdown({ counselor: event.data.counselor, doctor: event.data.doctor, work: event.data.work });
        worker.terminate();
      };
      worker.onerror = () => {
        import("../lib/analysis").then(({ analyzeWeek }) => {
          const result = analyzeWeek({ checkins, sessions, restLogs, sleepLogs });
          setAnalysis(result);
          setMarkdown({ counselor: counselorMarkdown(result), doctor: doctorMarkdown(result), work: workMarkdown(result) });
        });
      };
      worker.postMessage({ checkins, sessions, restLogs, sleepLogs });
    });
  }, []);

  if (!analysis) return <Card title="レポート">集計しています</Card>;

  return (
    <div className="stack">
      <Card title="週間レビュー">
        <dl className="metrics">
          <div><dt>チェックイン日数</dt><dd>{analysis.checkinDays}</dd></div>
          <div><dt>接触日数</dt><dd>{analysis.taskContactDays}</dd></div>
          <div><dt>通常/低/floor/接触</dt><dd>{analysis.normalCompletions}/{analysis.lowEnergyCompletions}/{analysis.floorCompletions}/{analysis.contactOnlyCompletions}</dd></div>
          <div><dt>休養ログ</dt><dd>{analysis.restLogs}</dd></div>
          <div><dt>多かった感情</dt><dd>{analysis.mostCommonEmotion}</dd></div>
          <div><dt>平均睡眠</dt><dd>{analysis.averageSleepHours ?? "不明"}</dd></div>
          <div><dt>睡眠6h未満</dt><dd>{analysis.sleepUnder6Days}</dd></div>
          <div><dt>長め昼寝/遅めカフェイン</dt><dd>{analysis.longNapDays}/{analysis.lateCaffeineEntries}</dd></div>
        </dl>
        {analysis.riskFlags.map((flag) => <p className="notice small" key={flag.id}>{flag.message}</p>)}
      </Card>
      <ReportBlock title="カウンセラー共有用メモ" text={markdown.counselor} filename="counselor-summary.md" />
      <ReportBlock title="主治医共有用メモ" text={markdown.doctor} filename="doctor-summary.md" />
      <ReportBlock title="業務影響共有用メモ" text={markdown.work} filename="work-summary.md" />
    </div>
  );
}

function ReportBlock({ title, text, filename }: { title: string; text: string; filename: string }) {
  return (
    <Card title={title}>
      <textarea className="report-box" readOnly value={text} />
      <div className="button-row">
        <button onClick={() => navigator.clipboard?.writeText(text)}>コピー</button>
        <button onClick={() => downloadText(filename, text, "text/markdown;charset=utf-8")}>Markdown出力</button>
      </div>
    </Card>
  );
}
