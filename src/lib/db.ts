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
  if (settings) return;
  await database.transaction("rw", database.tasks, database.intentions, database.reminderRules, database.settings, async () => {
    await database.tasks.bulkPut(defaultTasks());
    await database.intentions.bulkPut(defaultIntentions());
    await database.reminderRules.bulkPut(defaultReminderRules());
    await database.settings.put(defaultSettings());
  });
}

export async function clearAllLocalData(database = db): Promise<void> {
  await database.transaction("rw", database.tables, async () => {
    await Promise.all(database.tables.map((table) => table.clear()));
  });
}
