import { FormEvent, useEffect, useState } from "react";
import { Field, TextArea, TextInput } from "../components/Fields";
import { db } from "../lib/db";
import type { LifelogAttachment, LifelogEntry, LifelogKind, LifelogMood } from "../lib/types";
import { isoFromLocalInput, nowLocalInputValue } from "../lib/lifelog";

const kindLabels: Array<[LifelogKind, string]> = [
  ["text", "日記"],
  ["mood", "気分"],
  ["photo", "写真"],
  ["file", "添付"],
  ["health", "状態"],
  ["rest", "休養"],
  ["later", "後で"]
];

export function EditorPage() {
  const params = new URLSearchParams(location.hash.split("?")[1] ?? "");
  const editId = params.get("id");
  const requestedKind = (params.get("kind") as LifelogKind | null) ?? "text";
  const [entry, setEntry] = useState<LifelogEntry | null>(null);
  const [attachments, setAttachments] = useState<LifelogAttachment[]>([]);
  const [kind, setKind] = useState<LifelogKind>(requestedKind);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!editId) return;
    db.lifelogEntries.get(editId).then((found) => {
      if (!found) return;
      setEntry(found);
      setKind(found.kind);
      setAttachments(found.attachments);
    });
  }, [editId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const now = new Date().toISOString();
    const title = String(form.get("title") || "").trim();
    const body = String(form.get("body") || "").trim();
    const payload: LifelogEntry = {
      id: entry?.id ?? crypto.randomUUID(),
      journalId: kind === "health" || kind === "rest" ? "health" : "life",
      kind,
      title: title || undefined,
      body: body || defaultBody(kind),
      mood: (String(form.get("mood") || "unknown") as LifelogMood),
      tags: String(form.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean),
      attachments,
      happenedAt: isoFromLocalInput(String(form.get("happenedAt") || "")),
      createdAt: entry?.createdAt ?? now,
      updatedAt: now,
      shareCandidate: form.get("shareCandidate") === "on"
    };
    await db.lifelogEntries.put(payload);
    sessionStorage.setItem("daily-floor-message", `${payload.title || kindLabel(kind)}を保存しました。あとで追記できます。`);
    location.hash = "#/today";
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const loaded = await Promise.all([...files].map(fileToAttachment));
    setAttachments((current) => [...current, ...loaded]);
  }

  return (
    <div className="editor-screen">
      <header className="editor-bar">
        <a href="#/today">戻る</a>
        <strong>{new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" }).format(new Date())}</strong>
        <button form="entry-form" className="link-button">完了</button>
      </header>
      {message && <p className="action-feedback">{message}</p>}
      <form id="entry-form" className="editor-form" onSubmit={submit}>
        <div className="kind-row">
          {kindLabels.map(([value, label]) => <button type="button" className={kind === value ? "active" : ""} onClick={() => setKind(value)} key={value}>{label}</button>)}
        </div>
        <Field label="日時"><TextInput type="datetime-local" name="happenedAt" defaultValue={entry ? nowLocalInputValue(new Date(entry.happenedAt)) : nowLocalInputValue()} /></Field>
        <Field label="タイトル 任意"><TextInput name="title" defaultValue={entry?.title ?? ""} placeholder="今日のこと" /></Field>
        <label className="field">
          <span>気分 任意</span>
          <select name="mood" defaultValue={entry?.mood ?? "unknown"}>
            <option value="unknown">わからない</option>
            <option value="good">軽い・よい</option>
            <option value="flat">普通</option>
            <option value="heavy">重い</option>
            <option value="anxious">不安</option>
            <option value="tired">疲れ</option>
          </select>
        </label>
        <Field label="本文"><TextArea name="body" defaultValue={entry?.body ?? ""} placeholder="1行だけでも保存できます。書けない時は空欄でも大丈夫です。" /></Field>
        <Field label="タグ カンマ区切り"><TextInput name="tags" defaultValue={entry?.tags.join(", ") ?? ""} placeholder="生活, 体調, 仕事" /></Field>
        <Field label="写真・添付"><input type="file" multiple onChange={(event) => handleFiles(event.currentTarget.files)} /></Field>
        {attachments.length > 0 && <div className="attachment-list">{attachments.map((file) => <span key={file.id}>{file.name}</span>)}</div>}
        <label className="check"><input type="checkbox" name="shareCandidate" defaultChecked={entry?.shareCandidate ?? false} /> 共有候補にする</label>
        <p className="small-text">保存したらTodayに戻り、何を保存したか表示します。画面が突然ワープしたように見えないよう、必ず保存メッセージを残します。</p>
      </form>
    </div>
  );
}

function defaultBody(kind: LifelogKind): string {
  if (kind === "rest") return "今日は休養ログ。これは失敗ではなく、生活の事実ログです。";
  if (kind === "later") return "後で書く枠を作りました。";
  if (kind === "mood") return "気分だけ記録しました。";
  return "";
}

function kindLabel(kind: LifelogKind): string {
  return kindLabels.find(([value]) => value === kind)?.[1] ?? "ログ";
}

function fileToAttachment(file: File): Promise<LifelogAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, type: file.type || "application/octet-stream", size: file.size, dataUrl: String(reader.result) });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
