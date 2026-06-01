import type { ActivationTask, AppSettings, ImplementationIntention, ReminderRule } from "./types";
import { nowIso } from "./logic";

export const schemaVersion = 1;

export function defaultTasks(): ActivationTask[] {
  const now = nowIso();
  return [
    {
      id: "daily-life-task",
      title: "今日の生活タスク",
      category: "home",
      normalGoal: "今日いちばん気になる用事を25分進める",
      lowEnergyGoal: "用事を1つだけ小さく分けて進める",
      floorGoal: "用事に関係するものを1つだけ見る",
      contactGoal: "用事の画面・メモ・場所を開くだけ",
      defaultTrigger: "朝チェックインを保存したら",
      defaultTime: "10:00",
      taskUrl: "",
      temptationBundle: {
        enabled: true,
        rewardType: "drink",
        rewardName: "好きな飲み物",
        rewardUrl: "",
        ruleText: "好きな飲み物を用意して、タスクに触れている間だけ一緒に使う。"
      },
      active: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "admin-contact",
      title: "連絡・手続き",
      category: "work",
      normalGoal: "連絡や手続きを1件終わらせる",
      lowEnergyGoal: "送る文面や必要情報を1つだけ用意する",
      floorGoal: "相手の名前・窓口・必要書類だけ確認する",
      contactGoal: "連絡先や手続きページを開くだけ",
      defaultTrigger: "10:00になったら",
      defaultTime: "10:00",
      taskUrl: "",
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
      normalGoal: "今日の実行ログと明日のfloorを決める",
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
      id: "intent_life_default",
      taskId: "daily-life-task",
      ifTrigger: "朝チェックインを保存したら",
      thenAction: "今日の生活タスクのメモを開く",
      exampleText: "もし朝チェックインを保存したら、今日の生活タスクのメモを開く。",
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
    { id: "rem_1000", title: "今日のfloor / 生活タスク", time: "10:00", enabled: true, kind: "task", targetRoute: "/cascade/daily-life-task" },
    { id: "rem_1300", title: "昼寝するなら20分まで", time: "13:00", enabled: true, kind: "nap", targetRoute: "/sleep" },
    { id: "rem_1400", title: "カフェイン終了", time: "14:00", enabled: true, kind: "caffeine", targetRoute: "/sleep" },
    { id: "rem_2200", title: "夜レビュー / 明日のfloorを決める", time: "22:00", enabled: true, kind: "review", targetRoute: "/night-review" }
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
