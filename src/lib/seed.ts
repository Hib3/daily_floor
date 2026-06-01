import type { ActivationTask, AppSettings, ImplementationIntention, ReminderRule } from "./types";
import { nowIso } from "./logic";

export const schemaVersion = 1;

export function defaultTasks(): ActivationTask[] {
  const now = nowIso();
  return [
    {
      id: "az900",
      title: "AZ-900",
      category: "study",
      normalGoal: "Microsoft Learnを25分進める",
      lowEnergyGoal: "Microsoft Learnを1ユニットだけ読む",
      floorGoal: "Microsoft Learnを1段落だけ読む",
      contactGoal: "Microsoft Learnのページを開くだけ",
      defaultTrigger: "Google Homeで音楽が流れ始めたら",
      defaultTime: "10:00",
      taskUrl: "",
      temptationBundle: {
        enabled: true,
        rewardType: "music",
        rewardName: "勉強中だけ聴けるプレイリスト",
        rewardUrl: "",
        ruleText: "この音楽はAZ-900を開いている時だけ聴く。Learnを閉じたら音楽も止める。"
      },
      active: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "morning-checkin",
      title: "朝チェックイン",
      category: "health",
      normalGoal: "睡眠・眠気・気分・今日の予定を入力する",
      lowEnergyGoal: "睡眠時間と眠気だけ入力する",
      floorGoal: "起床時刻だけ入力する",
      contactGoal: "Daily Floorを開くだけ",
      defaultTime: "09:00",
      active: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "night-review",
      title: "夜レビュー",
      category: "health",
      normalGoal: "今日の実行ログと明日の床を決める",
      lowEnergyGoal: "今日できたことを1つだけ記録する",
      floorGoal: "明日の最低ラインだけ決める",
      contactGoal: "夜レビュー画面を開くだけ",
      defaultTime: "22:00",
      active: true,
      createdAt: now,
      updatedAt: now
    }
  ];
}

export function defaultIntentions(): ImplementationIntention[] {
  const now = nowIso();
  return [
    {
      id: "intent_az900_default",
      taskId: "az900",
      ifTrigger: "Google Homeで音楽が流れ始めたら",
      thenAction: "PCでMicrosoft Learnのタブを開く",
      exampleText: "もし Google Homeで音楽が流れ始めたら、PCでMicrosoft Learnのタブを開く。",
      enabled: true,
      successCount: 0,
      failCount: 0,
      createdAt: now,
      updatedAt: now
    }
  ];
}

export function defaultReminderRules(): ReminderRule[] {
  return [
    { id: "rem_0900", title: "朝チェックイン", time: "09:00", enabled: true, kind: "checkin", targetRoute: "/checkin" },
    { id: "rem_1000", title: "今日の床 / AZ-900", time: "10:00", enabled: true, kind: "task", targetRoute: "/cascade/az900" },
    { id: "rem_1300", title: "昼寝するなら20分まで", time: "13:00", enabled: true, kind: "nap", targetRoute: "/sleep" },
    { id: "rem_1400", title: "カフェイン終了", time: "14:00", enabled: true, kind: "caffeine", targetRoute: "/sleep" },
    { id: "rem_2200", title: "夜レビュー / 明日の床を決める", time: "22:00", enabled: true, kind: "review", targetRoute: "/night-review" }
  ];
}

export function defaultSettings(): AppSettings {
  const now = nowIso();
  return {
    id: "app",
    schemaVersion,
    timezone: "Asia/Tokyo",
    githubPagesBasePath: import.meta.env.BASE_URL,
    notificationEnabled: false,
    badgeEnabled: true,
    persistentStorageRequested: false,
    theme: "system",
    createdAt: now,
    updatedAt: now
  };
}
