export type EnergyLevel = "A" | "B" | "C" | "D" | "R";
export type EmotionLabel = "anxiety" | "shame" | "boredom" | "fatigue" | "fear_of_failure" | "not_good_enough" | "sleepiness" | "body_heaviness" | "unknown";
export type GoalLevel = "normal" | "low_energy" | "floor" | "contact";
export type CascadeStep = "emotion_label" | "if_then" | "temptation_bundle" | "five_min_timer" | "open_only" | "rest_log";
export type TaskOutcome = "normal_done" | "low_energy_done" | "floor_done" | "contact_done" | "rest_logged" | "abandoned";

export type DailyCheckin = {
  id: string;
  date: string;
  wakeTime?: string;
  sleepHours?: number;
  sleepiness: number;
  moodHeaviness: number;
  anxiety: number;
  bodyHeaviness: number;
  energyLevel: EnergyLevel;
  likelyAvoidTask?: string;
  usableReward?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type ActivationTask = {
  id: string;
  title: string;
  category: "study" | "work" | "health" | "home" | "relationship" | "other";
  normalGoal: string;
  lowEnergyGoal: string;
  floorGoal: string;
  contactGoal: string;
  defaultTrigger?: string;
  defaultTime?: string;
  taskUrl?: string;
  temptationBundle?: {
    enabled: boolean;
    rewardType: "music" | "drink" | "walk" | "video" | "other";
    rewardName: string;
    rewardUrl?: string;
    ruleText: string;
  };
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AvoidanceSession = {
  id: string;
  date: string;
  taskId: string;
  startedAt: string;
  endedAt?: string;
  emotionLabel?: EmotionLabel;
  cascadeStepReached: CascadeStep;
  outcome: TaskOutcome;
  beforeMood?: number;
  afterMood?: number;
  selfCriticism?: boolean;
  selfCriticismType?: string[];
  note?: string;
};

export type ImplementationIntention = {
  id: string;
  taskId: string;
  ifTrigger: string;
  thenAction: string;
  exampleText: string;
  enabled: boolean;
  successCount: number;
  failCount: number;
  createdAt: string;
  updatedAt: string;
};

export type TimerSession = {
  id: string;
  taskId: string;
  date: string;
  durationMinutes: number;
  startedAt: string;
  completedAt?: string;
  continuedAfterTimer: boolean;
  stoppedAfterTimer: boolean;
};

export type RestLog = {
  id: string;
  date: string;
  taskId?: string;
  attemptedAt?: string;
  blockingEmotion?: EmotionLabel;
  previousSleepHours?: number;
  physicalState?: string;
  note?: string;
  counselorShareCandidate: boolean;
  createdAt: string;
};

export type SleepLog = {
  id: string;
  date: string;
  bedtime?: string;
  wakeTime?: string;
  sleepHours?: number;
  napStart?: string;
  napEnd?: string;
  napMinutes?: number;
  caffeineLastTime?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type ReminderRule = {
  id: string;
  title: string;
  time: string;
  enabled: boolean;
  kind: "checkin" | "task" | "nap" | "caffeine" | "review";
  targetRoute: string;
};

export type RiskFlag = {
  id: string;
  date: string;
  type: "sleep_short" | "missed_floor" | "long_nap" | "late_caffeine" | "activity_spike_with_low_sleep" | "night_activity" | "two_day_rest_log";
  severity: "info" | "notice" | "warning";
  message: string;
  createdAt: string;
};

export type AppSettings = {
  id: "app";
  schemaVersion: number;
  timezone: "Asia/Tokyo";
  githubPagesBasePath: string;
  notificationEnabled: boolean;
  badgeEnabled: boolean;
  persistentStorageRequested: boolean;
  theme: "system" | "light" | "dark";
  createdAt: string;
  updatedAt: string;
};

export type SharedNote = {
  id: string;
  title?: string;
  text?: string;
  url?: string;
  taskId?: string;
  createdAt: string;
};

export type LifelogJournal = {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type LifelogKind = "text" | "mood" | "photo" | "file" | "health" | "rest" | "later";

export type LifelogMood = "good" | "flat" | "heavy" | "anxious" | "tired" | "unknown";

export type LifelogAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
};

export type LifelogEntry = {
  id: string;
  journalId: string;
  kind: LifelogKind;
  title?: string;
  body: string;
  mood?: LifelogMood;
  energy?: EnergyLevel;
  tags: string[];
  attachments: LifelogAttachment[];
  happenedAt: string;
  createdAt: string;
  updatedAt: string;
  shareCandidate: boolean;
};

export type LifelogView = "list" | "calendar" | "media" | "purpose";

export type PurposeCategory = "life" | "work" | "study" | "health" | "relationship" | "home" | "other";

export type PurposeStatus = "active" | "paused" | "done";

export type PurposeGoal = {
  id: string;
  title: string;
  why?: string;
  category: PurposeCategory;
  status: PurposeStatus;
  targetDate?: string;
  nextAction: string;
  floorAction: string;
  ifTrigger: string;
  thenAction: string;
  doneCount: number;
  reviewCount: number;
  lastDoneAt?: string;
  shareCandidate: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PurposeEventType = "created" | "step_done" | "review" | "paused" | "done";

export type PurposeEvent = {
  id: string;
  purposeId: string;
  type: PurposeEventType;
  title: string;
  note?: string;
  planned?: string;
  happened?: string;
  learned?: string;
  nextAction?: string;
  energy?: EnergyLevel;
  happenedAt: string;
  createdAt: string;
  shareCandidate: boolean;
};

export type PurposeStats = {
  activeCount: number;
  doneToday: number;
  totalDone: number;
  reviewCount: number;
};

export type LifelogStats = {
  todayEntries: number;
  totalEntries: number;
  restEntries: number;
  latestAt?: string;
  monthEntryDays: Record<string, number>;
};

export type WeeklyAnalysis = {
  checkinDays: number;
  taskContactDays: number;
  normalCompletions: number;
  lowEnergyCompletions: number;
  floorCompletions: number;
  contactOnlyCompletions: number;
  restLogs: number;
  mostCommonEmotion: EmotionLabel | "none";
  cascadeStepDistribution: Record<CascadeStep, number>;
  selfCriticismCount: number;
  averageSleepHours: number | null;
  sleepUnder6Days: number;
  longNapDays: number;
  lateCaffeineEntries: number;
  riskFlags: RiskFlag[];
};
