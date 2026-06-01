import { FormEvent, useState } from "react";
import { Card, Field, TextArea, TextInput } from "../components/Fields";
import { db } from "../lib/db";
import { decideEnergyLevel, nowIso, todayString } from "../lib/logic";

export function CheckinPage() {
  const [saved, setSaved] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const sleepHours = num(form.get("sleepHours"));
    const input = {
      sleepHours,
      sleepiness: num(form.get("sleepiness")) ?? 0,
      moodHeaviness: num(form.get("moodHeaviness")) ?? 0,
      anxiety: num(form.get("anxiety")) ?? 0,
      bodyHeaviness: num(form.get("bodyHeaviness")) ?? 0
    };
    const now = nowIso();
    await db.checkins.put({
      id: todayString(),
      date: String(form.get("date") || todayString()),
      wakeTime: str(form.get("wakeTime")),
      ...input,
      energyLevel: decideEnergyLevel(input),
      likelyAvoidTask: str(form.get("likelyAvoidTask")),
      usableReward: str(form.get("usableReward")),
      note: str(form.get("note")),
      createdAt: now,
      updatedAt: now
    });
    setSaved("保存しました。今日の目標は状態に合わせて小さくできます。");
  }

  return (
    <Card title="朝チェックイン">
      <form className="form-grid" onSubmit={submit}>
        <Field label="日付"><TextInput type="date" name="date" defaultValue={todayString()} /></Field>
        <Field label="起床時刻"><TextInput type="time" name="wakeTime" /></Field>
        <Field label="睡眠時間"><TextInput type="number" step="0.1" min="0" name="sleepHours" /></Field>
        <Field label="眠気 0-5"><TextInput type="range" min="0" max="5" name="sleepiness" defaultValue="2" /></Field>
        <Field label="気分の重さ 0-5"><TextInput type="range" min="0" max="5" name="moodHeaviness" defaultValue="2" /></Field>
        <Field label="不安 0-5"><TextInput type="range" min="0" max="5" name="anxiety" defaultValue="2" /></Field>
        <Field label="身体の重さ 0-5"><TextInput type="range" min="0" max="5" name="bodyHeaviness" defaultValue="2" /></Field>
        <Field label="避けそうなこと"><TextInput name="likelyAvoidTask" /></Field>
        <Field label="今日使えそうな報酬"><TextInput name="usableReward" /></Field>
        <Field label="メモ"><TextArea name="note" /></Field>
        <button className="primary">保存</button>
      </form>
      {saved && <p className="success">{saved}</p>}
    </Card>
  );
}

function num(value: FormDataEntryValue | null): number | undefined {
  if (value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function str(value: FormDataEntryValue | null): string | undefined {
  const text = String(value ?? "").trim();
  return text || undefined;
}
