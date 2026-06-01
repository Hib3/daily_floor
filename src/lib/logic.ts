import type { ActivationTask, CascadeStep, EnergyLevel } from "./types";

export function todayString(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function makeId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function decideEnergyLevel(input: {
  sleepHours?: number;
  sleepiness: number;
  moodHeaviness: number;
  anxiety: number;
  bodyHeaviness: number;
}): EnergyLevel {
  let score = 0;
  if (input.sleepHours !== undefined && !Number.isNaN(input.sleepHours)) {
    if (input.sleepHours < 3.5) score += 5;
    else if (input.sleepHours < 5) score += 4;
    else if (input.sleepHours < 6) score += 2;
    else if (input.sleepHours < 7) score += 1;
  }
  score += input.sleepiness;
  score += input.moodHeaviness;
  score += input.bodyHeaviness;
  score += Math.floor(input.anxiety / 2);
  if (score >= 17) return "R";
  if (score >= 14) return "D";
  if (score >= 10) return "C";
  if (score >= 6) return "B";
  return "A";
}

export function selectGoal(task: ActivationTask, energyLevel: EnergyLevel): string {
  switch (energyLevel) {
    case "A":
      return task.normalGoal;
    case "B":
      return task.lowEnergyGoal;
    case "C":
      return task.floorGoal;
    case "D":
    case "R":
      return task.contactGoal;
    default:
      return task.floorGoal;
  }
}

export function goalLevelForEnergy(energyLevel: EnergyLevel): "normal" | "low_energy" | "floor" | "contact" {
  if (energyLevel === "A") return "normal";
  if (energyLevel === "B") return "low_energy";
  if (energyLevel === "C") return "floor";
  return "contact";
}

export const cascadeOrder: CascadeStep[] = [
  "emotion_label",
  "if_then",
  "temptation_bundle",
  "five_min_timer",
  "open_only",
  "rest_log"
];

export function nextCascadeStep(step: CascadeStep, outcome: "success" | "continue" | "rest"): CascadeStep {
  if (outcome === "rest") return "rest_log";
  if (outcome === "success") return step;
  const index = cascadeOrder.indexOf(step);
  return cascadeOrder[Math.min(index + 1, cascadeOrder.length - 1)] ?? "rest_log";
}

export function energyMessage(level: EnergyLevel): string {
  if (level === "A") return "今日は通常量を選べます。接触だけでも成功です。";
  if (level === "B") return "今日は低エネルギー目標で十分です。小さく接触を残します。";
  if (level === "C") return "今日の成功条件は、通常量ではなく床を守ることです。";
  if (level === "D") return "今日の成功条件は、通常量ではなく接触を切らないことです。";
  return "今日は休養とログを優先します。記録は失敗ではありません。";
}
