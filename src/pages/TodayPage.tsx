import { useEffect, useState } from "react";
import { Card } from "../components/Fields";
import { db } from "../lib/db";
import type { LifelogEntry } from "../lib/types";
import { formatDateJa, formatTime, getEntryPreview, kindLabel, summarizeStats } from "../lib/lifelog";

export function TodayPage() {
  const [entries, setEntries] = useState<LifelogEntry[]>([]);
  const [message, setMessage] = useState("");
  const today = new Date();

  useEffect(() => {
    const saved = sessionStorage.getItem("daily-floor-message");
    if (saved) {
      setMessage(saved);
      sessionStorage.removeItem("daily-floor-message");
    }
    db.lifelogEntries.toArray().then((all) => setEntries(all.sort((a, b) => b.happenedAt.localeCompare(a.happenedAt))));
  }, []);

  const stats = summarizeStats(entries, today);
  const todayEntries = entries.filter((entry) => new Date(entry.happenedAt).toDateString() === today.toDateString());

  return (
    <div className="screen today-screen">
      <header className="hero">
        <div>
          <h1>今日</h1>
          <p>{formatDateJa(today.toISOString())}</p>
        </div>
        <a className="pill-button" href="#/journal?view=calendar">カレンダー</a>
      </header>

      {message && (
        <section className="action-feedback" aria-live="polite">
          <strong>保存しました</strong>
          <p>{message}</p>
          <button onClick={() => setMessage("")}>閉じる</button>
        </section>
      )}

      <a className="wide-link" href="#/journal">
        <span>{stats.todayEntries}件のエントリー</span>
        <span>›</span>
      </a>

      <Card title="クイックスタート">
        <p className="small-text">長く書けなくても、1行・気分・写真・休養ログのどれかで十分です。</p>
        <div className="quick-grid">
          <a href="#/new?kind=text">1行を書く</a>
          <a href="#/new?kind=mood">気分だけ</a>
          <a href="#/new?kind=photo">写真</a>
          <a href="#/new?kind=rest">休養ログ</a>
        </div>
      </Card>

      <Card title="今日のタイムライン">
        {todayEntries.length === 0 && <p className="muted">まだ今日の記録はありません。右下の＋から作れます。</p>}
        <Timeline entries={todayEntries} />
      </Card>

      <Card title="ヘルスケアの意図">
        <p>このアプリは、書けない日や休む日を失敗にしません。短い事実ログを残し、あとで生活全体を見返すための場所です。</p>
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
