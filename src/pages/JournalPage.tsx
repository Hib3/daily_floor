import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/Fields";
import { db } from "../lib/db";
import type { LifelogEntry, LifelogView, PurposeEvent, PurposeGoal } from "../lib/types";
import { dayKey, formatDateJa, formatTime, getEntryPreview, groupEntriesByMonth, kindLabel, summarizeStats } from "../lib/lifelog";
import { buildIfThenText } from "../lib/purposes";

export function JournalPage({ route }: { route: string }) {
  const [entries, setEntries] = useState<LifelogEntry[]>([]);
  const [goals, setGoals] = useState<PurposeGoal[]>([]);
  const [events, setEvents] = useState<PurposeEvent[]>([]);
  const [query, setQuery] = useState("");
  const params = new URLSearchParams(route.split("?")[1] ?? "");
  const initialView = (params.get("view") as LifelogView | null) ?? "list";
  const [view, setView] = useState<LifelogView>(initialView);

  useEffect(() => {
    Promise.all([db.lifelogEntries.toArray(), db.purposeGoals.toArray(), db.purposeEvents.toArray()]).then(([allEntries, allGoals, allEvents]) => {
      setEntries(allEntries.sort((a, b) => b.happenedAt.localeCompare(a.happenedAt)));
      setGoals(allGoals.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
      setEvents(allEvents.sort((a, b) => b.happenedAt.localeCompare(a.happenedAt)));
    });
  }, []);

  const filtered = useMemo(() => {
    const word = query.trim().toLowerCase();
    if (!word) return entries;
    return entries.filter((entry) => `${entry.title ?? ""} ${entry.body} ${entry.tags.join(" ")}`.toLowerCase().includes(word));
  }, [entries, query]);
  const stats = summarizeStats(entries);

  return (
    <div className="screen journal-screen">
      <header className="journal-header glass-hero">
        <a className="round-button" href="#/today" aria-label="今日へ戻る">‹</a>
        <div className="search-shell">
          <input aria-label="検索" placeholder="検索" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <a className="pill-button" href="#/new?kind=text">新規日記</a>
        <h1>ジャーナル</h1>
        <p>{stats.totalEntries}件のログ / {goals.length}件の目的</p>
      </header>

      <section className="journal-panel glass-panel">
        <div className="view-tabs" role="tablist" aria-label="表示切替">
          <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>リスト</button>
          <button className={view === "calendar" ? "active" : ""} onClick={() => setView("calendar")}>カレンダー</button>
          <button className={view === "media" ? "active" : ""} onClick={() => setView("media")}>メディア</button>
          <button className={view === "purpose" ? "active" : ""} onClick={() => setView("purpose")}>目的</button>
        </div>
        {view === "list" && <ListView entries={filtered} />}
        {view === "calendar" && <CalendarView entries={filtered} />}
        {view === "media" && <MediaView entries={filtered} />}
        {view === "purpose" && <PurposeView goals={goals} events={events} />}
      </section>
    </div>
  );
}

function ListView({ entries }: { entries: LifelogEntry[] }) {
  const groups = groupEntriesByMonth(entries);
  return (
    <div className="entry-list">
      {groups.map((group) => (
        <section key={group.month}>
          <h2 className="month-bar">{group.month}</h2>
          {group.entries.map((entry) => (
            <a className="journal-row" href={`#/new?id=${entry.id}`} key={entry.id}>
              <div className="date-stamp">
                <span>{new Intl.DateTimeFormat("ja-JP", { weekday: "short" }).format(new Date(entry.happenedAt))}</span>
                <strong>{new Intl.DateTimeFormat("ja-JP", { day: "2-digit" }).format(new Date(entry.happenedAt))}</strong>
              </div>
              <div>
                <strong>{entry.title || kindLabel(entry.kind)}</strong>
                <p>{getEntryPreview(entry)}</p>
                <small>{formatTime(entry.happenedAt)}</small>
              </div>
            </a>
          ))}
        </section>
      ))}
      {entries.length === 0 && <p className="empty-state">記録がありません。＋から最初のログを作れます。</p>}
    </div>
  );
}

function PurposeView({ goals, events }: { goals: PurposeGoal[]; events: PurposeEvent[] }) {
  return (
    <div className="purpose-history">
      <div className="purpose-history-head">
        <p className="small-text">目的は、作成・達成・振り返りの流れを見返す場所です。</p>
        <a className="button primary" href="#/goal/new">目的を作る</a>
      </div>
      {goals.map((goal) => {
        const goalEvents = events.filter((event) => event.purposeId === goal.id);
        return (
          <article className="purpose-card glass-panel" key={goal.id}>
            <div>
              <strong>{goal.title}</strong>
              <p>{goal.nextAction}</p>
              <small>{buildIfThenText(goal)}</small>
            </div>
            <dl className="mini-stats">
              <div><dt>達成</dt><dd>{goal.doneCount}回</dd></div>
              <div><dt>振り返り</dt><dd>{goal.reviewCount}回</dd></div>
            </dl>
            <div className="purpose-actions">
              <a className="button" href={`#/goal?id=${goal.id}&mode=review`}>振り返る</a>
              <a className="button ghost" href={`#/goal?id=${goal.id}`}>編集</a>
            </div>
            {goalEvents.length > 0 && (
              <div className="event-strip">
                {goalEvents.slice(0, 3).map((event) => <span key={event.id}>{event.type === "review" ? "振り返り" : "達成"} {formatTime(event.happenedAt)}</span>)}
              </div>
            )}
          </article>
        );
      })}
      {goals.length === 0 && <p className="empty-state">目的はまだありません。</p>}
    </div>
  );
}

function CalendarView({ entries }: { entries: LifelogEntry[] }) {
  const counts = summarizeStats(entries).monthEntryDays;
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: startOffset + days }, (_, index) => index < startOffset ? null : index - startOffset + 1);
  return (
    <Card title={`${year}年${month + 1}月`}>
      <div className="calendar-grid header">{["日", "月", "火", "水", "木", "金", "土"].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="calendar-grid">
        {cells.map((day, index) => {
          const key = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
          return (
            <div className={`calendar-cell ${dayKey(today.toISOString()) === key ? "today" : ""}`} key={`${day}-${index}`}>
              {day && <strong>{day}</strong>}
              {day && counts[key] && <span>{counts[key]}件</span>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function MediaView({ entries }: { entries: LifelogEntry[] }) {
  const media = entries.filter((entry) => entry.attachments.length > 0);
  return (
    <div className="media-grid">
      {media.map((entry) => (
        <a className="media-tile" href={`#/new?id=${entry.id}`} key={entry.id}>
          {entry.attachments[0]?.type.startsWith("image/") ? <img src={entry.attachments[0].dataUrl} alt="" /> : <div className="file-tile">添付</div>}
          <span>{formatDateJa(entry.happenedAt)}</span>
        </a>
      ))}
      {media.length === 0 && <p className="empty-state">写真や添付の記録はまだありません。</p>}
    </div>
  );
}
