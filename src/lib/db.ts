import Dexie, { type Table } from "dexie";
import type {
  ActivationTask,
  AppSettings,
  AvoidanceSession,
  DailyCheckin,
  ImplementationIntention,
  ReminderRule,
  RestLog,
  RiskFlag,
  SharedNote,
  SleepLog,
  TimerSession
} from "./types";
import { defaultIntentions, defaultReminderRules, defaultSettings, defaultTasks } from "./seed";

export class DailyFloorDb extends Dexie {
  checkins!: Table<DailyCheckin, string>;
  tasks!: Table<ActivationTask, string>;
  avoidanceSessions!: Table<AvoidanceSession, string>;
  intentions!: Table<ImplementationIntention, string>;
  timerSessions!: Table<TimerSession, string>;
  restLogs!: Table<RestLog, string>;
  sleepLogs!: Table<SleepLog, string>;
  reminderRules!: Table<ReminderRule, string>;
  riskFlags!: Table<RiskFlag, string>;
  settings!: Table<AppSettings, string>;
  sharedNotes!: Table<SharedNote, string>;
  weeklyReports!: Table<{ id: string; markdown: string; createdAt: string }, string>;
  backupMeta!: Table<{ id: string; exportedAt: string; note?: string }, string>;

  constructor() {
    super("DailyFloorDB");
    this.version(1).stores({
      checkins: "id,date,energyLevel",
      tasks: "id,category,active",
      avoidanceSessions: "id,date,taskId,outcome,cascadeStepReached",
      intentions: "id,taskId,enabled",
      timerSessions: "id,date,taskId",
      restLogs: "id,date,taskId,counselorShareCandidate",
      sleepLogs: "id,date",
      reminderRules: "id,enabled,kind",
      riskFlags: "id,date,type",
      settings: "id",
      sharedNotes: "id,taskId",
      weeklyReports: "id,createdAt",
      backupMeta: "id,exportedAt"
    });
  }
}

export const db = new DailyFloorDb();

export async function seedIfNeeded(database = db): Promise<void> {
  const settings = await database.settings.get("app");
  if (settings) {
    await ensureGeneralLifeSeed(database);
    return;
  }
  await database.transaction("rw", database.tasks, database.intentions, database.reminderRules, database.settings, async () => {
    await database.tasks.bulkPut(defaultTasks());
    await database.intentions.bulkPut(defaultIntentions());
    await database.reminderRules.bulkPut(defaultReminderRules());
    await database.settings.put(defaultSettings());
  });
}

async function ensureGeneralLifeSeed(database: DailyFloorDb): Promise<void> {
  const hasLifeTask = await database.tasks.get("daily-life-task");
  if (!hasLifeTask) {
    const tasks = defaultTasks().filter((task) => task.id === "daily-life-task" || task.id === "admin-contact");
    await database.tasks.bulkPut(tasks);
  }
  const hasLifeIntention = await database.intentions.get("intent_life_default");
  if (!hasLifeIntention) {
    await database.intentions.bulkPut(defaultIntentions());
  }
  const oldReminder = await database.reminderRules.get("rem_1000");
  if (oldReminder?.targetRoute === "/cascade/az900") {
    await database.reminderRules.update("rem_1000", {
      title: "今日のfloor / 生活タスク",
      targetRoute: "/cascade/daily-life-task"
    });
  }
  const morningTask = await database.tasks.get("morning-checkin");
  if (morningTask?.title === "朝チェックイン") {
    await database.tasks.update("morning-checkin", {
      title: "状態メモ",
      normalGoal: "眠気・気分・不安・身体の重さを入力する",
      lowEnergyGoal: "今の眠気と身体の重さだけ入力する",
      floorGoal: "今の状態を一言だけメモする",
      updatedAt: new Date().toISOString()
    });
  }
  const checkinReminder = await database.reminderRules.get("rem_0900");
  if (checkinReminder?.title === "朝チェックイン") {
    await database.reminderRules.update("rem_0900", { title: "状態メモ" });
  }
}

export async function clearAllLocalData(database = db): Promise<void> {
  await database.transaction("rw", database.tables, async () => {
    await Promise.all(database.tables.map((table) => table.clear()));
  });
}
