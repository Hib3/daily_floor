import { describe, expect, it } from "vitest";
import { buildIfThenText, completePurposeStep, normalizePurposeDraft, reflectPurpose, summarizePurposeStats } from "./purposes";

describe("purpose logic", () => {
  it("normalizes a purpose into a small actionable plan", () => {
    const goal = normalizePurposeDraft({
      title: " 生活を整える ",
      why: "",
      category: "life",
      targetDate: "",
      nextAction: "",
      floorAction: "アプリを開く",
      ifTrigger: "迷ったら",
      thenAction: "",
      shareCandidate: false
    }, new Date("2026-06-02T00:00:00.000Z"));

    expect(goal.title).toBe("生活を整える");
    expect(goal.nextAction).toBe("アプリを開く");
    expect(buildIfThenText(goal)).toBe("もし「迷ったら」なら、「アプリを開く」をする");
  });

  it("completes a step and creates a journal entry", () => {
    const goal = normalizePurposeDraft({
      title: "提出準備",
      why: "",
      category: "work",
      targetDate: "",
      nextAction: "ファイルを1つ開く",
      floorAction: "ファイル名を見る",
      ifTrigger: "重く感じたら",
      thenAction: "ファイル名だけ見る",
      shareCandidate: true
    }, new Date("2026-06-02T00:00:00.000Z"));

    const result = completePurposeStep(goal, "短くできた", new Date("2026-06-02T01:00:00.000Z"));
    expect(result.goal.doneCount).toBe(1);
    expect(result.event.type).toBe("step_done");
    expect(result.entry.title).toContain("提出準備");
    expect(result.entry.tags).toContain("達成");
    expect(result.entry.shareCandidate).toBe(true);
  });

  it("reflects without blame and updates the next action", () => {
    const goal = normalizePurposeDraft({
      title: "朝の支度",
      why: "",
      category: "life",
      targetDate: "",
      nextAction: "机に座る",
      floorAction: "立つ",
      ifTrigger: "止まったら",
      thenAction: "立つ",
      shareCandidate: false
    }, new Date("2026-06-02T00:00:00.000Z"));

    const result = reflectPurpose(goal, {
      planned: "机に座る",
      happened: "少し遅れた",
      learned: "先に水を置くと始めやすい",
      nextAction: "水を置く",
      energy: "B",
      shareCandidate: false
    }, new Date("2026-06-02T02:00:00.000Z"));

    expect(result.goal.reviewCount).toBe(1);
    expect(result.goal.nextAction).toBe("水を置く");
    expect(result.event.type).toBe("review");
    expect(result.entry.body).toContain("次の1歩: 水を置く");
  });

  it("summarizes purpose facts for today", () => {
    const goal = normalizePurposeDraft({
      title: "x",
      why: "",
      category: "life",
      targetDate: "",
      nextAction: "x",
      floorAction: "x",
      ifTrigger: "x",
      thenAction: "x",
      shareCandidate: false
    }, new Date("2026-06-02T00:00:00.000Z"));
    const done = completePurposeStep(goal, "", new Date("2026-06-02T01:00:00.000Z"));
    const reviewed = reflectPurpose(done.goal, { planned: "", happened: "", learned: "", nextAction: "", shareCandidate: false }, new Date("2026-06-02T02:00:00.000Z"));

    expect(summarizePurposeStats([reviewed.goal], [done.event, reviewed.event], new Date("2026-06-02T03:00:00.000Z"))).toEqual({
      activeCount: 1,
      doneToday: 1,
      totalDone: 1,
      reviewCount: 1
    });
  });
});

