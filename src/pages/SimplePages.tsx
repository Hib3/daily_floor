import { FormEvent, useEffect, useState } from "react";
import { Card, Field, TextArea, TextInput } from "../components/Fields";
import { db } from "../lib/db";
import type { ActivationTask, ReminderRule } from "../lib/types";
import { makeId, nowIso, todayString } from "../lib/logic";

export function SimplePages({ route }: { route: string }) {
  if (route.startsWith("/tasks")) return <TasksPage />;
  if (route.startsWith("/intentions")) return <IntentionsPage />;
  if (route.startsWith("/bundles")) return <BundlesPage />;
  if (route.startsWith("/timers")) return <TimersPage />;
  if (route.startsWith("/sleep")) return <SleepPage />;
  if (route.startsWith("/night-review") || route.startsWith("/review")) return <NightReviewPage />;
  if (route.startsWith("/share")) return <SharePage />;
  return <TasksPage />;
}

function TasksPage() {
  const [tasks, setTasks] = useState<ActivationTask[]>([]);
  useEffect(() => { db.tasks.toArray().then(setTasks); }, []);
  async function save(task: ActivationTask, key: keyof ActivationTask, value: string | boolean) {
    await db.tasks.update(task.id, { [key]: value, updatedAt: nowIso() });
    setTasks(await db.tasks.toArray());
  }
  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    if (!title) return;
    const now = nowIso();
    const floorGoal = String(form.get("floorGoal") || `${title}に1回だけ触れる`);
    await db.tasks.add({
      id: makeId("task"),
      title,
      category: "other",
      normalGoal: String(form.get("normalGoal") || `${title}を25分進める`),
      lowEnergyGoal: String(form.get("lowEnergyGoal") || `${title}を5分だけ進める`),
      floorGoal,
      contactGoal: String(form.get("contactGoal") || `${title}のメモ・画面・場所を開くだけ`),
      defaultTrigger: String(form.get("defaultTrigger") || "チェックイン後"),
      defaultTime: "10:00",
      taskUrl: String(form.get("taskUrl") || ""),
      active: true,
      createdAt: now,
      updatedAt: now
    });
    event.currentTarget.reset();
    setTasks(await db.tasks.toArray());
  }
  return (
    <div className="stack">
      <Card title="生活タスクを追加">
        <p className="small-text">勉強だけでなく、家事、連絡、手続き、片付け、体調管理など何でも入れられます。</p>
        <form className="form-grid" onSubmit={addTask}>
          <Field label="名前"><TextInput name="title" placeholder="例: 洗濯、メール返信、書類手続き" /></Field>
          <Field label="普通にできる日の目標"><TextInput name="normalGoal" placeholder="例: 25分進める / 1件終わらせる" /></Field>
          <Field label="低エネルギー日の目標"><TextInput name="lowEnergyGoal" placeholder="例: 5分だけ進める" /></Field>
          <Field label="floor"><TextInput name="floorGoal" placeholder="例: 画面を開く / 物を1つだけ動かす" /></Field>
          <Field label="接触だけ"><TextInput name="contactGoal" placeholder="例: メモを見るだけ" /></Field>
          <Field label="きっかけ"><TextInput name="defaultTrigger" placeholder="例: 朝食後 / 10:00になったら" /></Field>
          <Field label="URL任意"><TextInput name="taskUrl" /></Field>
          <button className="primary">追加</button>
        </form>
      </Card>
      <Card title="タスク">
        {tasks.map((task) => (
          <article className="edit-card" key={task.id}>
            <Field label="タイトル"><TextInput defaultValue={task.title} onBlur={(e) => save(task, "title", e.target.value)} /></Field>
            <Field label="通常目標"><TextInput defaultValue={task.normalGoal} onBlur={(e) => save(task, "normalGoal", e.target.value)} /></Field>
            <Field label="低エネルギー"><TextInput defaultValue={task.lowEnergyGoal} onBlur={(e) => save(task, "lowEnergyGoal", e.target.value)} /></Field>
            <Field label="floor"><TextInput defaultValue={task.floorGoal} onBlur={(e) => save(task, "floorGoal", e.target.value)} /></Field>
            <Field label="接触"><TextInput defaultValue={task.contactGoal} onBlur={(e) => save(task, "contactGoal", e.target.value)} /></Field>
            <Field label="URL"><TextInput defaultValue={task.taskUrl} onBlur={(e) => save(task, "taskUrl", e.target.value)} /></Field>
            <label className="check"><input type="checkbox" defaultChecked={task.active} onChange={(e) => save(task, "active", e.target.checked)} /> 有効</label>
          </article>
        ))}
      </Card>
    </div>
  );
}

function IntentionsPage() {
  const [tasks, setTasks] = useState<ActivationTask[]>([]);
  useEffect(() => { db.tasks.toArray().then(setTasks); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const now = nowIso();
    const ifTrigger = String(form.get("ifTrigger") || "");
    const thenAction = String(form.get("thenAction") || "");
    await db.intentions.put({
      id: makeId("intent"),
      taskId: String(form.get("taskId")),
      ifTrigger,
      thenAction,
      exampleText: `もし ${ifTrigger}、${thenAction}。`,
      enabled: true,
      successCount: 0,
      failCount: 0,
      createdAt: now,
      updatedAt: now
    });
    event.currentTarget.reset();
  }
  return (
    <Card title="if-then設定">
      <form className="form-grid" onSubmit={submit}>
        <Field label="タスク"><select name="taskId">{tasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}</select></Field>
        <Field label="もし"><TextInput name="ifTrigger" placeholder="10:00になったら" /></Field>
        <Field label="その時"><TextInput name="thenAction" placeholder="Daily Floorを開く" /></Field>
        <button className="primary">保存</button>
      </form>
    </Card>
  );
}

function BundlesPage() {
  const [tasks, setTasks] = useState<ActivationTask[]>([]);
  useEffect(() => { db.tasks.toArray().then(setTasks); }, []);
  async function save(task: ActivationTask, field: "rewardName" | "rewardUrl" | "ruleText", value: string) {
    await db.tasks.update(task.id, { temptationBundle: { ...(task.temptationBundle ?? { enabled: true, rewardType: "other", rewardName: "", ruleText: "" }), [field]: value }, updatedAt: nowIso() });
    setTasks(await db.tasks.toArray());
  }
  return (
    <Card title="報酬バンドル">
      {tasks.map((task) => <article className="edit-card" key={task.id}><h3>{task.title}</h3><Field label="報酬名"><TextInput defaultValue={task.temptationBundle?.rewardName} onBlur={(e) => save(task, "rewardName", e.target.value)} /></Field><Field label="報酬URL"><TextInput defaultValue={task.temptationBundle?.rewardUrl} onBlur={(e) => save(task, "rewardUrl", e.target.value)} /></Field><Field label="ルール"><TextArea defaultValue={task.temptationBundle?.ruleText} onBlur={(e) => save(task, "ruleText", e.target.value)} /></Field></article>)}
    </Card>
  );
}

function TimersPage() {
  return <Card title="タイマー"><p>5分タイマーは各タスクのカスケード内で使えます。</p><a className="button primary" href="#/cascade">カスケードを開始</a></Card>;
}

function SleepPage() {
  const [saved, setSaved] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const now = nowIso();
    const date = String(form.get("date") || todayString());
    const napMinutes = Number(form.get("napMinutes")) || undefined;
    const caffeineLastTime = String(form.get("caffeineLastTime") || "");
    await db.sleepLogs.put({
      id: date,
      date,
      bedtime: String(form.get("bedtime") || ""),
      wakeTime: String(form.get("wakeTime") || ""),
      sleepHours: Number(form.get("sleepHours")) || undefined,
      napStart: String(form.get("napStart") || ""),
      napEnd: String(form.get("napEnd") || ""),
      napMinutes,
      caffeineLastTime,
      note: String(form.get("note") || ""),
      createdAt: now,
      updatedAt: now
    });
    const messages = [];
    if ((napMinutes ?? 0) > 30) messages.push("昼寝が長めでした。夜の睡眠との関係を見るために記録します。");
    if (caffeineLastTime >= "14:00") messages.push("カフェイン時刻が遅めでした。入眠との関係を見るために記録します。");
    setSaved(messages.join(" ") || "保存しました。");
  }
  return (
    <Card title="睡眠・昼寝・カフェイン">
      <form className="form-grid" onSubmit={submit}>
        <Field label="日付"><TextInput type="date" name="date" defaultValue={todayString()} /></Field>
        <Field label="就寝"><TextInput type="time" name="bedtime" /></Field>
        <Field label="起床"><TextInput type="time" name="wakeTime" /></Field>
        <Field label="睡眠時間"><TextInput type="number" step="0.1" name="sleepHours" /></Field>
        <Field label="昼寝開始"><TextInput type="time" name="napStart" /></Field>
        <Field label="昼寝終了"><TextInput type="time" name="napEnd" /></Field>
        <Field label="昼寝分数"><TextInput type="number" name="napMinutes" /></Field>
        <Field label="最後のカフェイン"><TextInput type="time" name="caffeineLastTime" /></Field>
        <Field label="メモ"><TextArea name="note" /></Field>
        <button className="primary">保存</button>
      </form>
      {saved && <p className="success">{saved}</p>}
    </Card>
  );
}

function NightReviewPage() {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const now = nowIso();
    await db.avoidanceSessions.add({
      id: makeId("session"),
      date: todayString(),
      taskId: "night-review",
      startedAt: now,
      endedAt: now,
      cascadeStepReached: "open_only",
      outcome: "contact_done",
      selfCriticism: form.get("selfCriticism") === "on",
      note: `接触:${form.get("contact")}; 段階:${form.get("stage")}; 明日のfloor:${form.get("tomorrowFloor")}; trigger:${form.get("trigger")}`
    });
    location.hash = "#/today";
  }
  return (
    <Card title="夜レビュー">
      <form className="form-grid" onSubmit={submit}>
        <label className="check"><input type="checkbox" name="checkin" /> 今日チェックインした</label>
        <label className="check"><input type="checkbox" name="contact" /> 今日のfloorに接触した</label>
        <Field label="どの段階で動けたか"><TextInput name="stage" /></Field>
        <label className="check"><input type="checkbox" name="selfCriticism" /> 自己批判が来た</label>
        <Field label="明日の最低ライン"><TextInput name="tomorrowFloor" /></Field>
        <Field label="明日のif-then trigger"><TextInput name="trigger" /></Field>
        <button className="primary">保存</button>
      </form>
    </Card>
  );
}

function SharePage() {
  const params = new URLSearchParams(location.hash.split("?")[1] ?? location.search);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await db.sharedNotes.add({ id: makeId("share"), title: String(form.get("title") || ""), text: String(form.get("text") || ""), url: String(form.get("url") || ""), taskId: String(form.get("taskId") || "daily-life-task"), createdAt: nowIso() });
    location.hash = "#/today";
  }
  return (
    <Card title="URL/メモを追加">
      <form className="form-grid" onSubmit={submit}>
        <Field label="タイトル"><TextInput name="title" defaultValue={params.get("title") ?? ""} /></Field>
        <Field label="URL"><TextInput name="url" defaultValue={params.get("url") ?? ""} /></Field>
        <Field label="メモ"><TextArea name="text" defaultValue={params.get("text") ?? ""} /></Field>
        <Field label="関連タスク"><TextInput name="taskId" defaultValue="daily-life-task" /></Field>
        <button className="primary">保存</button>
      </form>
    </Card>
  );
}
