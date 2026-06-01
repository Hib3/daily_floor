import { analyzeWeek, counselorMarkdown, doctorMarkdown, workMarkdown } from "../lib/analysis";
import type { AvoidanceSession, DailyCheckin, RestLog, SleepLog } from "../lib/types";

self.onmessage = (event: MessageEvent<{ checkins: DailyCheckin[]; sessions: AvoidanceSession[]; restLogs: RestLog[]; sleepLogs: SleepLog[] }>) => {
  const analysis = analyzeWeek(event.data);
  self.postMessage({
    analysis,
    counselor: counselorMarkdown(analysis),
    doctor: doctorMarkdown(analysis),
    work: workMarkdown(analysis)
  });
};
