import { FormEvent, useEffect, useState } from "react";
import { Field, Select, TextArea, TextInput } from "../components/Fields";
import { db } from "../lib/db";
import type { EnergyLevel, PurposeCategory, PurposeGoal } from "../lib/types";
import { emptyPurposeDraft, normalizePurposeDraft, reflectPurpose, updatePurposeFromDraft } from "../lib/purposes";

const categories: Array<[PurposeCategory, string]> = [
  ["life", "生活"],
  ["work", "仕事"],
  ["study", "学習"],
  ["health", "からだ・こころ"],
  ["relationship", "人との関わり"],
  ["home", "家"],
  ["other", "その他"]
];

export function PurposePage({ route }: { route: string }) {
  const params = new URLSearchParams(route.split("?")[1] ?? "");
  const editId = params.get("id");
  const mode = params.get("mode") === "review" ? "review" : "edit";
  const [goal, setGoal] = useState<PurposeGoal | null>(null);
  const [loaded, setLoaded] = useState(!editId);

  useEffect(() => {
    if (!editId) return;
    db.purposeGoals.get(editId).then((found) => {
      setGoal(found ?? null);
      setLoaded(true);
    });
  }, [editId]);

  if (!loaded) return <main className="boot">目的を読み込んでいます</main>;
  if (editId && !goal) return <main className="boot">目的が見つかりません</main>;

  return (
    <div className="editor-screen purpose-editor">
      <header className="editor-bar glass-editor-bar">
        <a href="#/today">戻る</a>
        <strong>{mode === "review" ? "振り返り" : goal ? "目的を編集" : "目的を作る"}</strong>
        <button form={mode === "review" ? "review-form" : "purpose-form"} className="link-button">保存</button>
      </header>
      {mode === "review" && goal ? <ReviewForm goal={goal} /> : <PurposeForm goal={goal} />}
    </div>
  );
}

function PurposeForm({ goal }: { goal: PurposeGoal | null }) {
  const draft = goal ?? emptyPurposeDraft();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get("title") || ""),
      why: String(form.get("why") || ""),
      category: String(form.get("category") || "life") as PurposeCategory,
      targetDate: String(form.get("targetDate") || ""),
      nextAction: String(form.get("nextAction") || ""),
      floorAction: String(form.get("floorAction") || ""),
      ifTrigger: String(form.get("ifTrigger") || ""),
      thenAction: String(form.get("thenAction") || ""),
      shareCandidate: form.get("shareCandidate") === "on"
    };
    const saved = goal ? updatePurposeFromDraft(goal, payload) : normalizePurposeDraft(payload);
    await db.purposeGoals.put(saved);
    sessionStorage.setItem("daily-floor-message", `${saved.title}をTodayの目的に保存しました。`);
    location.hash = "#/today";
  }

  return (
    <form id="purpose-form" className="editor-form" onSubmit={submit} key={goal?.id ?? "new-purpose"}>
      <p className="small-text">目的は「大きな到達点」ではなく、今日の行動を迷わないための置き場です。</p>
      <Field label="目的名"><TextInput name="title" defaultValue={draft.title} placeholder="例: 生活を整える / 仕事の不安を小さくする" /></Field>
      <Field label="なぜ大事か 任意"><TextArea name="why" defaultValue={draft.why ?? ""} placeholder="あとで自分が読み返すための理由" /></Field>
      <Field label="種類">
        <Select name="category" defaultValue={draft.category}>
          {categories.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </Select>
      </Field>
      <Field label="目安の日付 任意"><TextInput type="date" name="targetDate" defaultValue={draft.targetDate ?? ""} /></Field>
      <Field label="今日の1歩"><TextInput name="nextAction" defaultValue={draft.nextAction} placeholder="例: 資料を1つ開く / 机の上を1か所だけ片付ける" /></Field>
      <Field label="floorアクション"><TextInput name="floorAction" defaultValue={draft.floorAction} placeholder="例: アプリを開く / ファイル名だけ見る" /></Field>
      <Field label="もし"><TextInput name="ifTrigger" defaultValue={draft.ifTrigger} placeholder="例: 迷ったら / 体が重かったら" /></Field>
      <Field label="その時は"><TextInput name="thenAction" defaultValue={draft.thenAction} placeholder="例: floorアクションだけやる" /></Field>
      <label className="check"><input type="checkbox" name="shareCandidate" defaultChecked={draft.shareCandidate} /> 共有候補として印を付ける</label>
    </form>
  );
}

function ReviewForm({ goal }: { goal: PurposeGoal }) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = reflectPurpose(goal, {
      planned: String(form.get("planned") || ""),
      happened: String(form.get("happened") || ""),
      learned: String(form.get("learned") || ""),
      nextAction: String(form.get("nextAction") || ""),
      energy: String(form.get("energy") || "") as EnergyLevel,
      shareCandidate: form.get("shareCandidate") === "on"
    });
    await db.transaction("rw", [db.purposeGoals, db.purposeEvents, db.lifelogEntries], async () => {
      await db.purposeGoals.put(result.goal);
      await db.purposeEvents.add(result.event);
      await db.lifelogEntries.add(result.entry);
    });
    sessionStorage.setItem("daily-floor-message", `${goal.title}の振り返りを保存しました。ジャーナルにも残しました。`);
    location.hash = "#/today";
  }

  return (
    <form id="review-form" className="editor-form" onSubmit={submit} key={`review-${goal.id}`}>
      <p className="small-text">振り返りは責めるためではなく、次の1歩を軽くするための記録です。</p>
      <Field label="予定していたこと"><TextArea name="planned" defaultValue={goal.nextAction} /></Field>
      <Field label="実際に起きたこと"><TextArea name="happened" placeholder="できたこと、止まったこと、休んだことを事実として書きます" /></Field>
      <Field label="学び"><TextArea name="learned" placeholder="次に役立ちそうなことを1つだけ" /></Field>
      <Field label="次の1歩"><TextInput name="nextAction" defaultValue={goal.nextAction} /></Field>
      <Field label="その時のエネルギー">
        <Select name="energy" defaultValue="B">
          <option value="A">A 軽い</option>
          <option value="B">B 普通</option>
          <option value="C">C 重い</option>
          <option value="D">D かなり重い</option>
          <option value="R">R 休養優先</option>
        </Select>
      </Field>
      <label className="check"><input type="checkbox" name="shareCandidate" /> 共有候補として印を付ける</label>
    </form>
  );
}

