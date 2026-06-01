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
  const today = todayString();
  const energy: EnergyLevel = checkin?.energyLevel ?? "C";

  useEffect(() => {
    Promise.all([
      db.checkins.where("date").equals(today).first(),
      db.tasks.toArray().then((all) => all.filter((task) => task.active && task.id !== "morning-checkin" && task.id !== "night-review")),
      db.avoidanceSessions.where("date").equals(today).and((s) => s.taskId === "night-review").first(),
      db.avoidanceSessions.where("date").equals(today).and((s) => s.taskId !== "morning-checkin" && s.taskId !== "night-review" && s.outcome !== "abandoned").first()
    ]).then(([daily, activeTasks, night, hasTaskContact]) => {
      setCheckin(daily);
      setTasks(activeTasks);
      setNightDone(Boolean(night));
      const missing = Number(!daily) + Number(!hasTaskContact) + Number(!night);
      updateBadge(missing).catch(() => undefined);
    });
  }, [today]);

  return (
    <div className="stack">
      <Card title="今日の状態">
        <p className="lead">{energyMessage(energy)}</p>
        <p>チェックイン: {checkin ? `済み / エネルギー ${checkin.energyLevel}` : "未記録"}</p>
        <div className="button-row">
          <a className="button primary" href="#/checkin">チェックイン</a>
          <a className="button" href="#/sleep">睡眠ログ</a>
        </div>
      </Card>

      <Card title="迷ったらここから">
        <ol className="guide-list">
          <li>まず「チェックイン」で今の状態を記録します。</li>
          <li>次に「開始」を押します。できそうなら進め、重ければ「開くだけ」や「休養ログ」でOKです。</li>
          <li>夜に「夜レビュー」で明日のfloorを1つだけ決めます。</li>
        </ol>
        <p className="small-text">専門用語は覚えなくて大丈夫です。画面のボタンを上から順に押せば進めます。</p>
      </Card>

      <Card title="今日のfloor">
        {tasks.length === 0 && <p>生活タスクを追加すると、ここに今日の小さい一歩が出ます。</p>}
        {tasks.map((task) => (
          <article className="task-line" key={task.id}>
            <div>
              <strong>{task.title}</strong>
              <p>{selectGoal(task, energy)}</p>
            </div>
            <div className="button-row compact">
              <a className="button primary" href={`#/cascade/${task.id}`}>開始</a>
              <button onClick={() => logContact(task.id)}>接触できた</button>
              <button onClick={() => logRest(task.id)}>休養ログ</button>
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

async function logContact(taskId: string) {
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
  location.reload();
}

async function logRest(taskId: string) {
  const now = new Date().toISOString();
  await db.restLogs.add({ id: crypto.randomUUID(), date: todayString(), taskId, counselorShareCandidate: false, createdAt: now });
  await db.avoidanceSessions.add({ id: crypto.randomUUID(), date: todayString(), taskId, startedAt: now, endedAt: now, cascadeStepReached: "rest_log", outcome: "rest_logged" });
  location.reload();
}
