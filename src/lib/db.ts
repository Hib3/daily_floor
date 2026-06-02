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
  lifelogJournals!: Table<import("./types").LifelogJournal, string>;
  lifelogEntries!: Table<import("./types").LifelogEntry, string>;

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
    this.version(2).stores({
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
      backupMeta: "id,exportedAt",
      lifelogJournals: "id,name",
      lifelogEntries: "id,journalId,kind,happenedAt,createdAt,mood,shareCandidate"
    });
  }
}

export const db = new DailyFloorDb();

export async function seedIfNeeded(database = db): Promise<void> {
  const settings = await database.settings.get("app");
  if (settings) {
    await ensureGeneralLifeSeed(database);
    await seedLifelogIfNeeded(database);
    return;
  }
  await database.transaction("rw", [database.tasks, database.intentions, database.reminderRules, database.settings, database.lifelogJournals, database.lifelogEntries], async () => {
    await database.tasks.bulkPut(defaultTasks());
    await database.intentions.bulkPut(defaultIntentions());
    await database.reminderRules.bulkPut(defaultReminderRules());
    await database.settings.put(defaultSettings());
    await seedLifelogIfNeeded(database);
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

async function seedLifelogIfNeeded(database: DailyFloorDb): Promise<void> {
  const existing = await database.lifelogJournals.get("life");
  if (existing) return;
  const now = new Date().toISOString();
  await database.lifelogJournals.bulkPut([
    { id: "life", name: "ライフログ", description: "日々の出来事、気分、写真、添付をまとめる場所", color: "#4fc3f7", createdAt: now, updatedAt: now },
    { id: "health", name: "からだ・こころ", description: "睡眠、休養、エネルギー、相談候補の事実ログ", color: "#78d6a3", createdAt: now, updatedAt: now }
  ]);
  await database.lifelogEntries.add({
    id: "guide-entry",
    journalId: "life",
    kind: "text",
    title: "Daily Floor Lifeへようこそ",
    body: "ここは長い日記だけでなく、1行、気分、写真、ファイル、休養ログを時系列で残す場所です。書けない日も、短い記録として扱います。",
    tags: ["guide"],
    attachments: [],
    happenedAt: now,
    createdAt: now,
    updatedAt: now,
    shareCandidate: false
  });
}

export async function clearAllLocalData(database = db): Promise<void> {
  await database.transaction("rw", database.tables, async () => {
    await Promise.all(database.tables.map((table) => table.clear()));
  });
}
