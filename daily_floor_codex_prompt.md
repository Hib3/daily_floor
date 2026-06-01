# Codex Prompt: Daily Floor PWA — Goal-State Implementation

You are Codex working on a GitHub repository. Build the complete target version of a GitHub Pages-only PWA called **Daily Floor**.

This is not a minimal MVP request. The goal is to implement the best practical version that can run entirely on GitHub Pages without a backend. Do not stop at a prototype if a feature can be implemented locally in the browser. Use progressive enhancement and fallbacks where browser/PWA support differs.

---

## 0. Core Product Understanding

Daily Floor is a local-first PWA for behavioral activation, emotional-avoidance procrastination, low-energy days, sleep-aware routines, and study/work continuity.

The user’s mental-health and behavioral model for this app is:

1. Procrastination is not treated as laziness.
2. Procrastination is treated as emotional avoidance:
   - task cue
   - negative emotion such as anxiety, shame, boredom, fatigue, fear of failure, sleepiness, or body heaviness
   - automatic avoidance
   - self-criticism
   - more avoidance
3. The app must interrupt this loop gently and structurally.
4. The app must not use streak-shaming, harsh failure language, guilt, or productivity maximalism.
5. A floor-level action counts as success.
6. Opening the target page only also counts as success.
7. Rest-day logging also counts as useful data, not failure.
8. Sleep protection is more important than maximizing daily output.
9. If sleep is short or the user’s energy level is low, the app should downshift goals instead of pushing normal goals.
10. The app must not provide diagnosis, medical advice, medication advice, or treatment decisions.
11. The app may generate factual logs and Markdown summaries for a doctor/counselor, but must not infer medical conclusions.

This product is designed for a Japanese user. The UI text should be Japanese by default, but the codebase, identifiers, and comments can be English.

---

## 1. Hard Technical Constraints

Implement the app under these constraints:

- No backend.
- No server-side code.
- No Firebase.
- No Supabase.
- No FastAPI.
- No external database.
- No external analytics.
- No external logging service.
- No CDN dependencies.
- No tracking.
- No user data leaves the browser unless the user explicitly exports a file.
- All records must be stored locally in IndexedDB.
- All analysis must run in browser-side TypeScript.
- Use Web Workers for heavier weekly/monthly analysis and report generation when appropriate.
- The app must be deployable to GitHub Pages.
- The app must work offline after first successful load.
- Use Hash Router or equivalent hash-based routing for GitHub Pages compatibility.
- Use a correct Vite `base` configuration for GitHub Pages subpath deployment.
- Add GitHub Actions deployment workflow for GitHub Pages.
- Do not claim reliable background scheduled notifications from PWA alone.
- For reliable reminders, implement `.ics` calendar export as the primary workaround.

---

## 2. Preferred Stack

Use this stack unless the existing repository already has a compatible stack:

- React
- TypeScript
- Vite
- PWA support via `vite-plugin-pwa` or an equivalent explicit Service Worker setup
- IndexedDB via Dexie or a small typed wrapper around IndexedDB
- Web Worker for analysis/report generation
- Plain CSS, CSS Modules, or a lightweight local styling approach
- No external UI framework unless it materially improves maintainability
- No external network calls at runtime

If dependencies are added, prefer stable and small packages. Keep the app maintainable.

---

## 3. PWA Features to Implement

Implement PWA features as much as possible within browser and GitHub Pages constraints.

### 3.1 Web App Manifest

Add a complete manifest:

- app name: `Daily Floor`
- short name: `Floor`
- standalone display mode
- proper icons
- theme color
- background color
- start URL: `/#/today` under GitHub Pages base path
- scope matching the GitHub Pages base path
- portrait-friendly layout

Manifest shortcuts:

- 今日の床 → `/#/today`
- チェックイン → `/#/checkin`
- カスケード開始 → `/#/cascade`
- 夜レビュー → `/#/night-review`
- レポート → `/#/reports`
- バックアップ → `/#/backup`

Use feature support gracefully. If shortcuts are not supported by a browser, the app must still work.

### 3.2 Service Worker + Offline Support

Implement offline support:

- cache the app shell
- cache icons and static assets
- allow the app to open offline after first load
- store user data in IndexedDB, not Cache Storage
- show an offline-ready indicator in settings or about page
- implement an update-available flow if possible:
  - “新しいバージョンがあります”
  - “更新する”
  - avoid silently breaking local data

Recommended caching strategy:

- App shell: cache-first
- hashed JS/CSS assets: cache-first or stale-while-revalidate
- manifest/icons: cache-first
- runtime data: IndexedDB only

### 3.3 IndexedDB Local Database

Use IndexedDB as the primary database. Provide schema versioning and migration readiness.

The database must support:

- daily check-ins
- activation tasks
- avoidance sessions
- implementation intentions
- timer sessions
- rest logs
- sleep logs
- reminder rules
- risk flags
- weekly reports
- app settings
- backups metadata
- shared notes/imported notes if Share Target is implemented

### 3.4 Persistent Storage Request

Implement a settings action that calls `navigator.storage.persist()` when available.

Display:

- whether persistent storage is supported
- whether it has been granted
- estimated storage usage if available
- clear explanation in Japanese:
  - “ブラウザ都合の自動削除リスクを下げます。ただしバックアップは別途必要です。”

### 3.5 Notification API

Implement Notification API only for app-session reminders and timer notifications.

Required behavior:

- ask permission only after user action, not immediately on first load
- support reminders while the app is open
- support 5-minute timer completion notification while possible
- do not claim or imply that background scheduled notifications are reliable
- provide a visible explanation:
  - “PWA単体の通知は端末・ブラウザに依存します。確実な時刻通知はカレンダー出力を使ってください。”

### 3.6 Calendar `.ics` Export

Implement `.ics` calendar export as the reliable reminder workaround.

User must be able to generate:

- today’s reminders
- this week’s reminders
- custom date range reminders

Default reminder schedule:

- 09:00 朝チェックイン
- 10:00 今日の床 / AZ-900
- 13:00 昼寝するなら20分まで
- 14:00 カフェイン終了
- 22:00 夜レビュー / 明日の床を決める

Allow the user to edit reminder rules.

The `.ics` output should include:

- event title
- description
- start/end time
- timezone: Asia/Tokyo
- optional alarms if feasible
- unique UID
- generated timestamp

### 3.7 Badging API

If supported, show badge count for incomplete items:

- 0: no badge or clear badge
- 1: check-in missing
- 2: check-in + floor task missing
- 3: check-in + floor task + night review missing

If unsupported, show in-app badge/dot only.

### 3.8 Web Share Target / Share Import

If reasonably feasible, implement Manifest `share_target` or at least a share/import route.

Use case:

- user shares a Microsoft Learn URL, note, or text into Daily Floor
- app saves it as a note or task reference
- app can associate shared URL with a task such as AZ-900

Support fallback:

- manual “URL/メモを追加” form

Do not make the whole app depend on Share Target support.

---

## 4. Behavioral Product Model

The central flow is a six-step cascade.

### 4.1 Six-Step Cascade

For each target task, the app should guide the user through:

1. Emotion labeling
2. Implementation intention
3. Temptation bundling
4. Five-minute timer
5. Open-only zero-second commitment
6. Rest-day log

The cascade must be usable from `/tap/cascade/:taskId` or `/#/cascade/:taskId`.

If no task is selected, show task picker.

### 4.2 Step 1: Emotion Labeling

UI question:

> 今、何を避けようとしている？

Options:

- 不安
- 恥ずかしさ
- 退屈
- 倦怠感
- 失敗しそう
- うまくできない気がする
- 眠い
- 身体が重い
- わからない

Rules:

- selecting “わからない” is valid
- no long explanation required
- user can add a short note
- after saving, move to implementation intention

### 4.3 Step 2: Implementation Intention

Show a preconfigured if-then plan for the task.

Default for AZ-900:

> もし Google Homeで音楽が流れ始めたら、PCでMicrosoft Learnのタブを開く。

Other examples:

- もしコーヒーを机に置いたら、Microsoft Learnを開く。
- もし10:00になったら、Daily FloorのToday画面を開く。
- もしLearnを見て嫌な感じが来たら、1段落だけ読む。

Buttons:

- 実行できた
- 実行できなかったので次へ
- 編集する

Log success/failure count.

### 4.4 Step 3: Temptation Bundling

Support reward bundling.

Default AZ-900 bundle:

> 勉強用プレイリストはAZ-900を開いている時だけ聴ける。Learnを閉じたら音楽も止める。

Features:

- save reward type: music, drink, walk, video, other
- save reward name
- optional reward URL
- open reward URL
- open task URL
- log whether bundle helped

The app must not try to control Spotify/YouTube/Apple Music directly unless impossible to avoid. Use links and user confirmation.

### 4.5 Step 4: Five-Minute Timer

Implement a 5-minute timer.

Requirements:

- timer UI
- pause/cancel
- completion state
- optional notification on completion
- after completion ask:
  - 5分で終了した
  - 続けた
  - 途中で止まった
- log before/after mood if user wants

Text:

> 5分でやめてよい。続けてもよい。5分できたら成功。

### 4.6 Step 5: Open-Only Commitment

This is a valid success path.

UI:

> 読まなくていい。理解しなくていい。開いたら成功。

Buttons:

- ページを開いた
- 開けなかったので休養ログへ

For AZ-900:

- store Microsoft Learn URL if configured
- provide “Microsoft Learnを開く” button
- then let the user confirm contact success

### 4.7 Step 6: Rest-Day Log

This is not failure.

UI:

> 今日は休養ログ。これは失敗ではなく、パターン分析用のデータです。

Record:

- attempted time
- blocking emotion
- previous sleep hours if known
- physical state
- note
- mark as counselor-share candidate yes/no

Rules:

- saving a rest log is counted as useful data
- do not show shame messages
- if rest log occurs two days in a row, generate a neutral “相談候補” flag:
  - “2日連続で休養ログになりました。カウンセラー共有メモに追加できます。”

---

## 5. Goal Levels

Every activation task must support four goal levels:

1. `normalGoal`
2. `lowEnergyGoal`
3. `floorGoal`
4. `contactGoal`

Definitions:

- normalGoal: full ordinary target
- lowEnergyGoal: reduced target
- floorGoal: minimum action that still counts
- contactGoal: open/touch only, zero-second commitment

All four can count as success.

The UI must never imply that floor/contact/rest data is failure.

---

## 6. Default Seed Data

Seed these default tasks on first launch only.

### 6.1 AZ-900

```ts
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
  }
}
```

### 6.2 朝チェックイン

```ts
{
  id: "morning-checkin",
  title: "朝チェックイン",
  category: "health",
  normalGoal: "睡眠・眠気・気分・今日の予定を入力する",
  lowEnergyGoal: "睡眠時間と眠気だけ入力する",
  floorGoal: "起床時刻だけ入力する",
  contactGoal: "Daily Floorを開くだけ",
  defaultTime: "09:00"
}
```

### 6.3 夜レビュー

```ts
{
  id: "night-review",
  title: "夜レビュー",
  category: "health",
  normalGoal: "今日の実行ログと明日の床を決める",
  lowEnergyGoal: "今日できたことを1つだけ記録する",
  floorGoal: "明日の最低ラインだけ決める",
  contactGoal: "夜レビュー画面を開くだけ",
  defaultTime: "22:00"
}
```

---

## 7. Daily Check-In

Implement `/checkin`.

Fields:

- date
- wakeTime
- sleepHours
- sleepiness 0–5
- moodHeaviness 0–5
- anxiety 0–5
- bodyHeaviness 0–5
- note
- optional “today likely avoid task”
- optional “usable reward today”

After save, compute energy level.

Energy levels:

- A: normal
- B: low energy
- C: floor preferred
- D: contact only preferred
- R: rest/logging priority

Energy scoring example:

```ts
function decideEnergyLevel(input: {
  sleepHours?: number;
  sleepiness: number;
  moodHeaviness: number;
  anxiety: number;
  bodyHeaviness: number;
}): "A" | "B" | "C" | "D" | "R" {
  let score = 0;

  if (input.sleepHours !== undefined) {
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
```

Goal selection:

```ts
function selectGoal(task: ActivationTask, energyLevel: EnergyLevel): string {
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
```

The algorithm should be configurable later in settings. For now, implement the above.

---

## 8. Sleep, Nap, and Caffeine Logs

Implement sleep-aware routine logging.

Fields:

- bedtime
- wakeTime
- sleepHours
- napStart
- napEnd
- napMinutes
- caffeineLastTime
- note

Rules:

- if sleep is very short, avoid showing normal goals
- if nap is long, mark neutral flag:
  - “昼寝が長めでした。夜の睡眠との関係を見るために記録します。”
- if caffeine is late, mark neutral flag:
  - “カフェイン時刻が遅めでした。入眠との関係を見るために記録します。”

No medical advice. No diagnosis.

---

## 9. Today Screen

Implement `/today`.

This is the primary home screen.

Must show:

- today’s check-in status
- today’s energy level
- today’s recommended goal for each active task
- quick start cascade button
- quick “open-only contact” button
- quick “rest log” button
- reminder of current non-shaming rule:
  - “今日の成功条件は、通常量ではなく接触を切らないことです。”
  - adapt based on energy level

Example sections:

- 今日の状態
- 今日の床
- AZ-900
- 次の小さい一歩
- 通知/予定
- 夜レビュー状態

---

## 10. Night Review

Implement `/night-review`.

Questions:

- 今日チェックインしたか
- 今日の床に接触したか
- どの段階で動けたか
- 自己批判が来たか
- 明日の最低ラインは何か
- 明日のif-then triggerは何か

Night review should be short and low-friction.

---

## 11. Self-Criticism Handling

When a task is not completed or becomes a rest log, ask:

> 今、自己批判が来ている？

Options:

- 自分が弱いと思った
- 怠けたと思った
- またダメだったと思った
- 何も感じない
- わからない

Then show:

> 今日は開けなかった。これは弱さではなく、回避回路のログ。明日は一段階だけ小さく試す。

Do not randomize or over-encourage. Keep it calm and factual.

---

## 12. Reports

Implement `/reports`.

Reports must be generated locally from IndexedDB.

### 12.1 Weekly Review

Include:

- check-in days
- task contact days
- normal completions
- low-energy completions
- floor completions
- contact-only completions
- rest logs
- most common avoidance emotion
- cascade step distribution
- self-criticism log count
- average sleep hours
- days with sleep < 6h
- long nap days
- late caffeine entries
- neutral risk flags

### 12.2 Counselor Summary Markdown

Generate Markdown:

```md
# カウンセラー共有用メモ

## 事実
- AZ-900に接触できた日数:
- 休養ログになった日数:
- 多かった回避感情:
- 自己批判が出た回数:
- 睡眠不足だった日数:

## 感情
- タスク前に多かった感情:
- 実行後に変化した感情:

## 相談したいこと
- どの感情が回避につながりやすいか
- 自己批判が出た後の戻り方
- 2日連続で休養ログになった時の扱い
```

### 12.3 Doctor Summary Markdown

Generate Markdown:

```md
# 主治医共有用メモ

## 事実
- 睡眠時間:
- 日中眠気:
- 昼寝:
- カフェイン:
- 活動量:
- 勉強/作業への接触状況:

## 注意して見たい変化
- 睡眠不足なのに活動量が増えた日
- 夜間活動が増えた日
- 連続して起床困難だった日
- 日中眠気が強かった日
```

The app must not say “this indicates hypomania/mania/depression.” It must only say “注意して見たい変化” or “共有候補”.

### 12.4 Work/HR Summary Optional

Generate a work-impact oriented summary without medical detail.

```md
# 業務影響共有用メモ

## 事実
- 起床/開始困難があった日数:
- 作業接触できた日数:
- 低エネルギー対応が必要だった日数:

## 業務上の影響
- 開始までに時間がかかる
- 午前中の安定性に波がある
- 短い着手単位だと接触しやすい

## 相談したい配慮
- タスク開始前の小さい確認
- 進捗を時間ではなく接触/完了単位で共有
- 午前の不調時の代替時間帯
```

---

## 13. Backup and Export

Implement `/backup`.

Required:

- export all IndexedDB data as JSON
- import JSON backup
- validate backup schema/version before import
- warn before overwrite
- CSV export for major tables
- Markdown export for reports
- `.ics` export for reminders
- copy-to-clipboard for report Markdown if supported
- download file fallback

Backup JSON should include:

- app name
- schema version
- export timestamp
- timezone
- all table data
- app settings

---

## 14. Data Models

Implement typed models similar to the following.

```ts
export type EnergyLevel = "A" | "B" | "C" | "D" | "R";

export type EmotionLabel =
  | "anxiety"
  | "shame"
  | "boredom"
  | "fatigue"
  | "fear_of_failure"
  | "not_good_enough"
  | "sleepiness"
  | "body_heaviness"
  | "unknown";

export type GoalLevel =
  | "normal"
  | "low_energy"
  | "floor"
  | "contact";

export type CascadeStep =
  | "emotion_label"
  | "if_then"
  | "temptation_bundle"
  | "five_min_timer"
  | "open_only"
  | "rest_log";

export type TaskOutcome =
  | "normal_done"
  | "low_energy_done"
  | "floor_done"
  | "contact_done"
  | "rest_logged"
  | "abandoned";

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
  type:
    | "sleep_short"
    | "missed_floor"
    | "long_nap"
    | "late_caffeine"
    | "activity_spike_with_low_sleep"
    | "night_activity"
    | "two_day_rest_log";
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
```

---

## 15. Routes

Implement routes:

- `/#/today`
- `/#/checkin`
- `/#/cascade`
- `/#/cascade/:taskId`
- `/#/tasks`
- `/#/intentions`
- `/#/bundles`
- `/#/timers`
- `/#/sleep`
- `/#/night-review`
- `/#/review`
- `/#/reports`
- `/#/backup`
- `/#/settings`
- `/#/share`
- fallback route to `/today`

---

## 16. UI/UX Requirements

The UI must be:

- mobile-first
- usable on iPhone
- usable on desktop
- clear
- low cognitive load
- Japanese text by default
- non-shaming
- calm and functional
- accessible enough:
  - labels on inputs
  - keyboard navigable buttons
  - high contrast
  - no tiny tap targets
  - no reliance on color alone

Recommended main navigation:

- 今日
- 記録
- カスケード
- レポート
- 設定

Use cards for major sections.

Avoid:

- gamified shame
- red failure screens
- “連続記録が途切れました”
- “もっと頑張りましょう”
- pushy productivity copy
- medical claims

Use language like:

- “今日の成功条件”
- “接触できた”
- “floor達成”
- “休養ログ”
- “共有候補”
- “事実ログ”
- “明日は一段階だけ小さく”

---

## 17. Analysis Engine

Implement analysis in browser-side TypeScript, optionally in a Web Worker.

Reports should compute:

- check-in count by date range
- active task contact days
- normal/low/floor/contact/rest counts
- most common avoidance emotions
- cascade step distribution
- self-criticism count
- before/after mood deltas where data exists
- average sleep
- days with sleep under 6 hours
- long nap days
- late caffeine entries
- two-day rest log flag
- sleep-short + activity-spike neutral flag

Do not overinterpret. Return descriptive summaries only.

Example neutral outputs:

- “休養ログが2日連続しています。カウンセラー共有候補として記録できます。”
- “睡眠6時間未満の日に活動量が増えています。事実ログとして残します。”
- “自己批判ログが複数回あります。次回の相談メモに含められます。”

---

## 18. Tests

Add tests where practical.

At minimum test:

- energy level calculation
- goal selection
- cascade next-step logic
- weekly analysis aggregation
- backup export/import validation
- `.ics` generation shape
- report generation does not include forbidden diagnostic language

If no test framework exists, add Vitest.

---

## 19. Build and Deployment

Set up:

- Vite build
- TypeScript check
- tests
- GitHub Actions for Pages deployment

GitHub Actions should:

- checkout
- setup Node
- install dependencies using `npm ci`
- run type check if script exists
- run tests if script exists
- run build
- upload `dist`
- deploy to GitHub Pages

Vite config must support GitHub Pages base path. Make base configurable:

- default `/daily-floor/`
- allow override via environment variable if reasonable

---

## 20. Documentation

Add or update:

- `README.md`
- `AGENTS.md`
- `docs/product-spec.md`
- `docs/privacy.md`
- `docs/pwa-notification-limits.md`

README should include:

- what the app does
- local development commands
- build commands
- deploy instructions
- backup warning
- PWA notification limitations
- no medical advice statement

AGENTS.md should include the product principles so future Codex sessions preserve them.

---

## 21. Privacy and Safety Requirements

The app handles sensitive life and mental-health logs.

Rules:

- no external tracking
- no external telemetry
- no automatic upload
- no hidden network calls
- no medical diagnosis
- no medication advice
- no claims of detecting bipolar episodes
- no “you are manic/depressed” language
- only neutral flags and shareable logs
- local data must be exportable
- user must be able to delete all local data

Add a “データ削除” action in settings:

- export backup first recommendation
- confirm destructive action
- clear IndexedDB after explicit confirmation

---

## 22. Final Definition of Done

The task is complete only when:

1. The app builds successfully.
2. The app runs locally.
3. The app can be deployed to GitHub Pages.
4. The app installs as a PWA where supported.
5. The app opens offline after first load.
6. The user can complete daily check-in.
7. The app calculates energy level A/B/C/D/R.
8. The app shows recommended goal based on energy level.
9. The user can run the six-step cascade.
10. The user can log:
    - emotion label
    - if-then result
    - temptation bundle result
    - 5-minute timer result
    - open-only contact
    - rest-day log
11. Floor/contact/rest logs are treated as useful success/data, not failure.
12. The user can record sleep/nap/caffeine logs.
13. The user can generate weekly analysis.
14. The user can generate counselor/doctor/work Markdown summaries.
15. The user can export/import JSON backup.
16. The user can export CSV.
17. The user can generate `.ics` reminders.
18. The app uses non-shaming Japanese UI language.
19. The app contains no diagnostic or medication advice.
20. Tests pass.
21. README and AGENTS.md are updated.
22. GitHub Actions deployment workflow exists.

---

## 23. Work Style for Codex

Proceed as follows:

1. Inspect the repository.
2. Identify existing stack and files.
3. If the repository is empty or unsuitable, create a new Vite React TypeScript PWA.
4. Implement the app in coherent modules.
5. Keep components and logic separated.
6. Add tests for core logic.
7. Run install/build/test commands.
8. Fix errors.
9. Provide a final summary:
   - files changed
   - commands run
   - features implemented
   - any browser/PWA limitations
   - deployment instructions
   - remaining optional enhancements

Do not ask for clarification unless blocked by missing repository permissions or impossible commands. If a browser feature is unsupported, implement feature detection and fallback rather than removing the feature.

Remember: the goal is not a compromise MVP. The goal is the best GitHub Pages-only PWA that can realistically reach the product goal.
