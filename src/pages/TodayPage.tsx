import { useEffect, useState } from "react";
import { db } from "../lib/db";
import type { ActivationTask, DailyCheckin, EnergyLevel } from "../lib/types";
import { energyMessage, selectGoal, todayString } from "../lib/logic";
import { Card } from "../components/Fields";
import { updateBadge } from "../lib/notifications";

export function TodayPage() {
  const [checkin, setCheckin] = useState<DailyCheckin | undefined>();
  const [tasks, setTasks] = useState<ActivationTask[]>([]);
  const [nightDone, setNightDone] = useState(false);
  const [message, setMessage] = useState("");
  const today = todayString();
  const energy: EnergyLevel = checkin?.energyLevel ?? "C";

  async function refreshToday() {
    const [daily, activeTasks, night, hasTaskContact] = await Promise.all([
      db.checkins.where("date").equals(today).first(),
      db.tasks.toArray().then((all) => all.filter((task) => task.active && task.id !== "morning-checkin" && task.id !== "night-review")),
      db.avoidanceSessions.where("date").equals(today).and((s) => s.taskId === "night-review").first(),
      db.avoidanceSessions.where("date").equals(today).and((s) => s.taskId !== "morning-checkin" && s.taskId !== "night-review" && s.outcome !== "abandoned").first()
    ]);
    setCheckin(daily);
    setTasks(activeTasks);
    setNightDone(Boolean(night));
    const missing = Number(!daily) + Number(!hasTaskContact) + Number(!night);
    updateBadge(missing).catch(() => undefined);
  }

  useEffect(() => {
    const savedMessage = sessionStorage.getItem("daily-floor-message");
    if (savedMessage) {
      setMessage(savedMessage);
      sessionStorage.removeItem("daily-floor-message");
    }
    refreshToday();
  }, [today]);

  return (
    <div className="stack">
      <Card title="今日の状態">
        <p className="lead">{energyMessage(energy)}</p>
        <p>状態メモ: {checkin ? `済み / エネルギー ${checkin.energyLevel}` : "未記録。空欄があっても使えます。"}</p>
        <div className="button-row">
          <a className="button primary" href="#/checkin">状態メモ</a>
          <a className="button" href="#/cascade">今すぐ開始</a>
          <a className="button" href="#/sleep">睡眠ログ</a>
        </div>
      </Card>

      <Card title="迷ったらここから">
        <ol className="guide-list">
          <li>記録できる時だけ「状態メモ」を押します。起床時でなければ空欄でOKです。</li>
          <li>記録が重い時は、そのまま「細かく開始」か「接触を記録」を押します。</li>
          <li>夜に「夜レビュー」で明日のfloorを1つだけ決めます。</li>
        </ol>
        <p className="small-text">入口は1つではありません。状態メモ、細かく開始、接触を記録、休養を記録、タスク追加のどれからでも使えます。</p>
      </Card>

      {message && (
        <section className="action-feedback" aria-live="polite">
          <strong>記録しました</strong>
          <p>{message}</p>
          <button onClick={() => setMessage("")}>閉じる</button>
        </section>
      )}

      <Card title="今日のfloor">
        <p className="lead">この中のどれか1つを記録できたら、今日のゴールとして扱います。</p>
        {tasks.length === 0 && <p>生活タスクを追加すると、ここに今日の小さい一歩が出ます。</p>}
        {tasks.map((task) => (
          <article className="task-line" key={task.id}>
            <div>
              <strong>{task.title}</strong>
              <p>{selectGoal(task, energy)}</p>
              <p className="small-text">迷ったら「細かく開始」。もう触れたなら「接触を記録」。今日は無理なら「休養を記録」。</p>
            </div>
            <div className="button-row compact">
              <a className="button primary" href={`#/cascade/${task.id}`}>細かく開始</a>
              <button onClick={() => logContact(task.id, task.title, setMessage, refreshToday)}>接触を記録</button>
              <button onClick={() => logRest(task.id, task.title, setMessage, refreshToday)}>休養を記録</button>
            </div>
          </article>
        ))}
        <a className="button" href="#/tasks">タスクを追加・編集</a>
      </Card>

      <Card title="通知/予定">
        <p>PWA単体の通知は端末・ブラウザに依存します。確実な時刻通知はカレンダー出力を使ってください。</p>
        <a className="button" href="#/backup">.icsを出力</a>
      </Card>

      <Card title="夜レビュー状態">
        <p>{nightDone ? "夜レビューを記録済みです。" : "短く、今日できた接触だけ残せます。"}</p>
        <a className="button" href="#/night-review">夜レビュー</a>
      </Card>
    </div>
  );
}

async function logContact(taskId: string, title: string, setMessage: (value: string) => void, refreshToday: () => Promise<void>) {
  const now = new Date().toISOString();
  await db.avoidanceSessions.add({
    id: crypto.randomUUID(),
    date: todayString(),
    taskId,
    startedAt: now,
    endedAt: now,
    cascadeStepReached: "open_only",
    outcome: "contact_done"
  });
  setMessage(`${title} に接触した記録を保存しました。作業が0秒でも、今日の接触ゴールは完了です。`);
  await refreshToday();
}

async function logRest(taskId: string, title: string, setMessage: (value: string) => void, refreshToday: () => Promise<void>) {
  const now = new Date().toISOString();
  await db.restLogs.add({ id: crypto.randomUUID(), date: todayString(), taskId, counselorShareCandidate: false, createdAt: now });
  await db.avoidanceSessions.add({ id: crypto.randomUUID(), date: todayString(), taskId, startedAt: now, endedAt: now, cascadeStepReached: "rest_log", outcome: "rest_logged" });
  setMessage(`${title} を休養ログとして保存しました。これは失敗ではなく、今日の状態を残すゴールです。`);
  await refreshToday();
}
