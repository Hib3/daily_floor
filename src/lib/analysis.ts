import type { AvoidanceSession, DailyCheckin, EmotionLabel, RestLog, RiskFlag, SleepLog, WeeklyAnalysis } from "./types";
import { makeId, nowIso, todayString } from "./logic";

const steps = ["emotion_label", "if_then", "temptation_bundle", "five_min_timer", "open_only", "rest_log"] as const;
const forbiddenDiagnosticWords = ["躁", "うつ病", "双極", "診断", "服薬", "薬を", "治療判断"];

export function analyzeWeek(input: {
  checkins: DailyCheckin[];
  sessions: AvoidanceSession[];
  restLogs: RestLog[];
  sleepLogs: SleepLog[];
  riskFlags?: RiskFlag[];
}): WeeklyAnalysis {
  const emotionCounts = new Map<EmotionLabel, number>();
  const cascadeStepDistribution = Object.fromEntries(steps.map((step) => [step, 0])) as WeeklyAnalysis["cascadeStepDistribution"];
  for (const session of input.sessions) {
    cascadeStepDistribution[session.cascadeStepReached] += 1;
    if (session.emotionLabel) emotionCounts.set(session.emotionLabel, (emotionCounts.get(session.emotionLabel) ?? 0) + 1);
  }
  const sleepValues = input.sleepLogs.map((log) => log.sleepHours).filter((value): value is number => typeof value === "number");
  const riskFlags = [...(input.riskFlags ?? []), ...deriveRiskFlags(input.restLogs, input.sleepLogs, input.sessions)];
  return {
    checkinDays: new Set(input.checkins.map((item) => item.date)).size,
    taskContactDays: new Set(input.sessions.filter((s) => s.outcome !== "abandoned").map((s) => `${s.date}:${s.taskId}`)).size,
    normalCompletions: input.sessions.filter((s) => s.outcome === "normal_done").length,
    lowEnergyCompletions: input.sessions.filter((s) => s.outcome === "low_energy_done").length,
    floorCompletions: input.sessions.filter((s) => s.outcome === "floor_done").length,
    contactOnlyCompletions: input.sessions.filter((s) => s.outcome === "contact_done").length,
    restLogs: input.restLogs.length,
    mostCommonEmotion: mostCommon(emotionCounts),
    cascadeStepDistribution,
    selfCriticismCount: input.sessions.filter((s) => s.selfCriticism).length,
    averageSleepHours: sleepValues.length ? round(sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length) : null,
    sleepUnder6Days: input.sleepLogs.filter((log) => typeof log.sleepHours === "number" && log.sleepHours < 6).length,
    longNapDays: input.sleepLogs.filter((log) => (log.napMinutes ?? 0) > 30).length,
    lateCaffeineEntries: input.sleepLogs.filter((log) => isLateCaffeine(log.caffeineLastTime)).length,
    riskFlags
  };
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function mostCommon(counts: Map<EmotionLabel, number>): EmotionLabel | "none" {
  let result: EmotionLabel | "none" = "none";
  let max = 0;
  for (const [key, value] of counts) {
    if (value > max) {
      result = key;
      max = value;
    }
  }
  return result;
}

export function isLateCaffeine(time?: string): boolean {
  if (!time) return false;
  const hour = Number(time.slice(0, 2));
  return Number.isFinite(hour) && hour >= 14;
}

export function deriveRiskFlags(restLogs: RestLog[], sleepLogs: SleepLog[], sessions: AvoidanceSession[]): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const dates = [...new Set(restLogs.map((log) => log.date))].sort();
  for (let i = 1; i < dates.length; i += 1) {
    const prev = new Date(`${dates[i - 1]}T00:00:00`);
    const current = new Date(`${dates[i]}T00:00:00`);
    if ((current.getTime() - prev.getTime()) / 86400000 === 1) {
      flags.push({
        id: makeId("risk"),
        date: dates[i],
        type: "two_day_rest_log",
        severity: "notice",
        message: "休養ログが2日連続しています。カウンセラー共有候補として記録できます。",
        createdAt: nowIso()
      });
    }
  }
  for (const log of sleepLogs) {
    if ((log.sleepHours ?? 99) < 6) {
      flags.push({ id: makeId("risk"), date: log.date, type: "sleep_short", severity: "info", message: "睡眠6時間未満の日です。事実ログとして残します。", createdAt: nowIso() });
    }
    if ((log.napMinutes ?? 0) > 30) {
      flags.push({ id: makeId("risk"), date: log.date, type: "long_nap", severity: "info", message: "昼寝が長めでした。夜の睡眠との関係を見るために記録します。", createdAt: nowIso() });
    }
    if (isLateCaffeine(log.caffeineLastTime)) {
      flags.push({ id: makeId("risk"), date: log.date, type: "late_caffeine", severity: "info", message: "カフェイン時刻が遅めでした。入眠との関係を見るために記録します。", createdAt: nowIso() });
    }
  }
  const today = todayString();
  if (sessions.filter((s) => s.date === today && s.outcome !== "abandoned").length >= 3) {
    flags.push({ id: makeId("risk"), date: today, type: "activity_spike_with_low_sleep", severity: "info", message: "睡眠6時間未満の日に活動量が増えています。事実ログとして残します。", createdAt: nowIso() });
  }
  return flags;
}

export function counselorMarkdown(analysis: WeeklyAnalysis): string {
  return sanitizeReport(`# カウンセラー共有用メモ

## 事実
- 生活/作業タスクに接触できた日数: ${analysis.taskContactDays}
- 休養ログになった日数: ${analysis.restLogs}
- 多かった回避感情: ${analysis.mostCommonEmotion}
- 自己批判が出た回数: ${analysis.selfCriticismCount}
- 睡眠不足だった日数: ${analysis.sleepUnder6Days}

## 感情
- タスク前に多かった感情: ${analysis.mostCommonEmotion}
- 実行後に変化した感情: 記録がある場合のみ次回確認

## 相談したいこと
- どの感情が回避につながりやすいか
- 自己批判が出た後の戻り方
- 2日連続で休養ログになった時の扱い`);
}

export function doctorMarkdown(analysis: WeeklyAnalysis): string {
  return sanitizeReport(`# 主治医共有用メモ

## 事実
- 睡眠時間: 平均 ${analysis.averageSleepHours ?? "不明"} 時間
- 日中眠気: チェックイン記録を参照
- 昼寝: 長めの日 ${analysis.longNapDays} 日
- カフェイン: 遅めの記録 ${analysis.lateCaffeineEntries} 件
- 活動量: 接触日 ${analysis.taskContactDays} 日
- 生活/作業タスクへの接触状況: 通常 ${analysis.normalCompletions} / 低エネルギー ${analysis.lowEnergyCompletions} / floor ${analysis.floorCompletions} / 接触 ${analysis.contactOnlyCompletions}

## 注意して見たい変化
- 睡眠不足なのに活動量が増えた日
- 夜間活動が増えた日
- 連続して起床困難だった日
- 日中眠気が強かった日`);
}

export function workMarkdown(analysis: WeeklyAnalysis): string {
  return sanitizeReport(`# 業務影響共有用メモ

## 事実
- 起床/開始困難があった日数: ${analysis.restLogs}
- 作業接触できた日数: ${analysis.taskContactDays}
- 低エネルギー対応が必要だった日数: ${analysis.lowEnergyCompletions + analysis.floorCompletions + analysis.contactOnlyCompletions}

## 業務上の影響
- 開始までに時間がかかる
- 午前中の安定性に波がある
- 短い着手単位だと接触しやすい

## 相談したい配慮
- タスク開始前の小さい確認
- 進捗を時間ではなく接触/完了単位で共有
- 午前の不調時の代替時間帯`);
}

export function sanitizeReport(markdown: string): string {
  for (const word of forbiddenDiagnosticWords) {
    if (markdown.includes(word)) throw new Error(`Forbidden medical wording: ${word}`);
  }
  return markdown;
}
