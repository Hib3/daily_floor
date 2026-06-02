import { useEffect, useState } from "react";
import { Card } from "../components/Fields";
import { db } from "../lib/db";
import type { LifelogEntry, PurposeEvent, PurposeGoal } from "../lib/types";
import { formatDateJa, formatTime, getEntryPreview, kindLabel, summarizeStats } from "../lib/lifelog";
import { buildIfThenText, completePurposeStep, summarizePurposeStats } from "../lib/purposes";

export function TodayPage() {
  const [entries, setEntries] = useState<LifelogEntry[]>([]);
  const [goals, setGoals] = useState<PurposeGoal[]>([]);
  const [events, setEvents] = useState<PurposeEvent[]>([]);
  const [message, setMessage] = useState("");
  const today = new Date();

  async function refresh() {
    const [allEntries, allGoals, allEvents] = await Promise.all([
      db.lifelogEntries.toArray(),
      db.purposeGoals.toArray(),
      db.purposeEvents.toArray()
    ]);
    setEntries(allEntries.sort((a, b) => b.happenedAt.localeCompare(a.happenedAt)));
    setGoals(allGoals.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    setEvents(allEvents.sort((a, b) => b.happenedAt.localeCompare(a.happenedAt)));
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("daily-floor-message");
    if (saved) {
      setMessage(saved);
      sessionStorage.removeItem("daily-floor-message");
    }
    refresh();
  }, []);

  const stats = summarizeStats(entries, today);
  const purposeStats = summarizePurposeStats(goals, events, today);
  const activeGoals = goals.filter((goal) => goal.status === "active");
  const todayEntries = entries.filter((entry) => new Date(entry.happenedAt).toDateString() === today.toDateString());

  async function handleComplete(goal: PurposeGoal) {
    const result = completePurposeStep(goal);
    await db.transaction("rw", [db.purposeGoals, db.purposeEvents, db.lifelogEntries], async () => {
      await db.purposeGoals.put(result.goal);
      await db.purposeEvents.add(result.event);
      await db.lifelogEntries.add(result.entry);
    });
    setMessage(`${goal.title}の1歩を保存しました。ジャーナルにも記録しました。`);
    await refresh();
  }

  return (
    <div className="screen today-screen">
      <header className="hero glass-hero">
        <div>
          <h1>今日</h1>
          <p>{formatDateJa(today.toISOString())}</p>
        </div>
        <a className="pill-button" href="#/journal?view=calendar">カレンダーを見る</a>
      </header>

      {message && (
        <section className="action-feedback" aria-live="polite">
          <strong>保存しました</strong>
          <p>{message}</p>
          <button onClick={() => setMessage("")}>閉じる</button>
        </section>
      )}

      <a className="wide-link glass-link" href="#/journal">
        <span>今日の記録 {stats.todayEntries}件 / 目的の1歩 {purposeStats.doneToday}件</span>
        <span>›</span>
      </a>

      <Card title="今日の目的">
        <p className="small-text">目的は大きくなくて大丈夫です。完了を押すと、その場で保存され、ジャーナルにも残ります。</p>
        <div className="purpose-list">
          {activeGoals.map((goal) => (
            <article className="purpose-card glass-panel" key={goal.id}>
              <div>
                <strong>{goal.title}</strong>
                <p>{goal.nextAction}</p>
                <small>{buildIfThenText(goal)}</small>
              </div>
              <div className="purpose-actions">
                <button className="primary" onClick={() => handleComplete(goal)}>今日の1歩を完了</button>
                <a className="button" href={`#/goal?id=${goal.id}&mode=review`}>振り返る</a>
                <a className="button ghost" href={`#/goal?id=${goal.id}`}>編集</a>
              </div>
            </article>
          ))}
          {activeGoals.length === 0 && <p className="muted">進行中の目的はありません。新しい目的を作るとTodayに表示されます。</p>}
        </div>
        <a className="button primary wide-button" href="#/goal/new">新しい目的を作る</a>
      </Card>

      <Card title="目的なしで記録">
        <p className="small-text">日記だけ、状態だけ、休養だけでも保存できます。押した先は編集画面です。</p>
        <div className="quick-grid">
          <a href="#/new?kind=text"><strong>日記を書く</strong><span>本文入力へ</span></a>
          <a href="#/new?kind=mood"><strong>気分だけ残す</strong><span>状態メモへ</span></a>
          <a href="#/new?kind=photo"><strong>写真を残す</strong><span>添付入力へ</span></a>
          <a href="#/new?kind=rest"><strong>休養ログ</strong><span>休みを記録へ</span></a>
        </div>
      </Card>

      <Card title="今日のタイムライン">
        {todayEntries.length === 0 && <p className="muted">まだ今日の記録はありません。右下の＋から作れます。</p>}
        <Timeline entries={todayEntries} />
      </Card>

      <Card title="ヘルスケアの意図">
        <p>このアプリは、書けない日や休む日を失敗にしません。目的を小さくし、実行した事実と振り返りを残して、あとで生活全体を見返すための場所です。</p>
      </Card>
    </div>
  );
}

function Timeline({ entries }: { entries: LifelogEntry[] }) {
  return (
    <div className="timeline">
      {entries.map((entry) => (
        <article className="timeline-entry" key={entry.id}>
          <time>{formatTime(entry.happenedAt)}</time>
          <div>
            <strong>{entry.title || kindLabel(entry.kind)}</strong>
            <p>{getEntryPreview(entry)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
