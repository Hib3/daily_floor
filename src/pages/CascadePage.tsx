import { FormEvent, useEffect, useState } from "react";
import { Card, Field, Select, TextArea, TextInput } from "../components/Fields";
import { db } from "../lib/db";
import type { ActivationTask, CascadeStep, EmotionLabel, ImplementationIntention } from "../lib/types";
import { notify } from "../lib/notifications";
import { makeId, nowIso, todayString } from "../lib/logic";

const emotionOptions: [EmotionLabel, string][] = [
  ["anxiety", "不安"],
  ["shame", "恥ずかしさ"],
  ["boredom", "退屈"],
  ["fatigue", "倦怠感"],
  ["fear_of_failure", "失敗しそう"],
  ["not_good_enough", "うまくできない気がする"],
  ["sleepiness", "眠い"],
  ["body_heaviness", "身体が重い"],
  ["unknown", "わからない"]
];

export function CascadePage({ route }: { route: string }) {
  const taskId = route.split("/")[2];
  const [tasks, setTasks] = useState<ActivationTask[]>([]);
  const [task, setTask] = useState<ActivationTask | undefined>();
  const [step, setStep] = useState<CascadeStep>("emotion_label");
  const [emotion, setEmotion] = useState<EmotionLabel>("unknown");
  const [note, setNote] = useState("");
  const [intention, setIntention] = useState<ImplementationIntention | undefined>();
  const [timerState, setTimerState] = useState<"idle" | "running" | "done">("idle");
  const [remaining, setRemaining] = useState(300);

  useEffect(() => {
    db.tasks.toArray().then((all) => {
      const active = all.filter((item) => item.active);
      setTasks(active);
      setTask(active.find((item) => item.id === taskId) ?? active[0]);
    });
  }, [taskId]);

  useEffect(() => {
    if (task) db.intentions.where("taskId").equals(task.id).first().then(setIntention);
  }, [task]);

  useEffect(() => {
    if (timerState !== "running") return undefined;
    const id = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(id);
          setTimerState("done");
          notify("5分タイマー", "5分できたら成功です。続けても止めても大丈夫です。");
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerState]);

  if (!task) return <TaskPicker tasks={tasks} />;

  return (
    <div className="stack">
      <Card title={`カスケード: ${task.title}`}>
        <p className="lead">5分でやめてよい。続けてもよい。5分できたら成功。</p>
        <div className="stepper">{["感情", "if-then", "報酬", "5分", "開く", "休養"].map((label, index) => <span key={label} className={index <= stepIndex(step) ? "on" : ""}>{label}</span>)}</div>
      </Card>

      {step === "emotion_label" && (
        <Card title="今、何を避けようとしている？">
          <Field label="近い感情"><Select value={emotion} onChange={(event) => setEmotion(event.target.value as EmotionLabel)}>{emotionOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>
          <Field label="短いメモ"><TextArea value={note} onChange={(event) => setNote(event.target.value)} /></Field>
          <button className="primary" onClick={() => setStep("if_then")}>保存して次へ</button>
        </Card>
      )}

      {step === "if_then" && (
        <Card title="実行意図">
          <p>{intention?.exampleText ?? `もし ${task.defaultTrigger ?? "予定時刻になったら"}、${task.contactGoal}。`}</p>
          <div className="button-row">
            <button className="primary" onClick={() => finish("floor_done")}>実行できた</button>
            <button onClick={() => updateIntention(false).then(() => setStep("temptation_bundle"))}>実行できなかったので次へ</button>
            <a className="button" href="#/intentions">編集する</a>
          </div>
        </Card>
      )}

      {step === "temptation_bundle" && (
        <Card title="報酬を束ねる">
          <p>{task.temptationBundle?.ruleText ?? "小さい報酬を、接触している間だけ使います。"}</p>
          <div className="button-row">
            {task.temptationBundle?.rewardUrl && <a className="button" href={task.temptationBundle.rewardUrl} target="_blank">報酬を開く</a>}
            {task.taskUrl && <a className="button" href={task.taskUrl} target="_blank">課題ページを開く</a>}
            <button className="primary" onClick={() => finish("low_energy_done")}>助けになった</button>
            <button onClick={() => setStep("five_min_timer")}>次へ</button>
          </div>
        </Card>
      )}

      {step === "five_min_timer" && (
        <Card title="5分タイマー">
          <div className="timer">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}</div>
          <div className="button-row">
            <button className="primary" onClick={() => setTimerState("running")}>開始</button>
            <button onClick={() => setTimerState("idle")}>一時停止</button>
            <button onClick={() => { setTimerState("idle"); setRemaining(300); }}>キャンセル</button>
          </div>
          {timerState === "done" && <div className="button-row"><button onClick={() => finish("floor_done")}>5分で終了した</button><button onClick={() => finish("normal_done")}>続けた</button><button onClick={() => setStep("open_only")}>途中で止まった</button></div>}
        </Card>
      )}

      {step === "open_only" && (
        <Card title="開くだけ">
          <p>読まなくていい。理解しなくていい。開いたら成功。</p>
          <div className="button-row">
            {task.taskUrl && <a className="button" href={task.taskUrl} target="_blank">{task.title}を開く</a>}
            <button className="primary" onClick={() => finish("contact_done")}>ページを開いた</button>
            <button onClick={() => setStep("rest_log")}>開けなかったので休養ログへ</button>
          </div>
        </Card>
      )}

      {step === "rest_log" && <RestForm task={task} emotion={emotion} note={note} />}
    </div>
  );

  async function updateIntention(success: boolean) {
    if (!intention) return;
    await db.intentions.update(intention.id, {
      successCount: intention.successCount + Number(success),
      failCount: intention.failCount + Number(!success),
      updatedAt: nowIso()
    });
  }

  async function finish(outcome: "normal_done" | "low_energy_done" | "floor_done" | "contact_done") {
    if (!task) return;
    await updateIntention(true);
    const now = nowIso();
    await db.avoidanceSessions.add({
      id: makeId("session"),
      date: todayString(),
      taskId: task.id,
      startedAt: now,
      endedAt: now,
      emotionLabel: emotion,
      cascadeStepReached: step,
      outcome,
      note
    });
    location.hash = "#/today";
  }
}

function TaskPicker({ tasks }: { tasks: ActivationTask[] }) {
  return <Card title="タスクを選ぶ">{tasks.map((task) => <a className="button block" key={task.id} href={`#/cascade/${task.id}`}>{task.title}</a>)}</Card>;
}

function RestForm({ task, emotion, note }: { task: ActivationTask; emotion: EmotionLabel; note: string }) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const now = nowIso();
    await db.restLogs.add({
      id: makeId("rest"),
      date: todayString(),
      taskId: task.id,
      attemptedAt: now,
      blockingEmotion: emotion,
      previousSleepHours: Number(form.get("previousSleepHours")) || undefined,
      physicalState: String(form.get("physicalState") || ""),
      note: String(form.get("note") || note),
      counselorShareCandidate: form.get("candidate") === "on",
      createdAt: now
    });
    await db.avoidanceSessions.add({ id: makeId("session"), date: todayString(), taskId: task.id, startedAt: now, endedAt: now, emotionLabel: emotion, cascadeStepReached: "rest_log", outcome: "rest_logged", note });
    location.hash = "#/today";
  }
  return (
    <Card title="休養ログ">
      <p>今日は休養ログ。これは失敗ではなく、パターン分析用のデータです。</p>
      <form className="form-grid" onSubmit={submit}>
        <Field label="前回の睡眠時間"><TextInput type="number" step="0.1" name="previousSleepHours" /></Field>
        <Field label="身体の状態"><TextInput name="physicalState" /></Field>
        <Field label="メモ"><TextArea name="note" defaultValue={note} /></Field>
        <label className="check"><input type="checkbox" name="candidate" /> カウンセラー共有候補にする</label>
        <button className="primary">休養ログを保存</button>
      </form>
      <SelfCriticism />
    </Card>
  );
}

function SelfCriticism() {
  return (
    <details className="soft-detail">
      <summary>今、自己批判が来ている？</summary>
      <div className="chips">{["自分が弱いと思った", "怠けたと思った", "またダメだったと思った", "何も感じない", "わからない"].map((item) => <button key={item}>{item}</button>)}</div>
      <p>今日は開けなかった。これは弱さではなく、回避回路のログ。明日は一段階だけ小さく試す。</p>
    </details>
  );
}

function stepIndex(step: CascadeStep): number {
  return ["emotion_label", "if_then", "temptation_bundle", "five_min_timer", "open_only", "rest_log"].indexOf(step);
}
