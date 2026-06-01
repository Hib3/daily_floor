import { describe, expect, it } from "vitest";
import { decideEnergyLevel, nextCascadeStep, selectGoal } from "./logic";
import type { ActivationTask } from "./types";

const task: ActivationTask = {
  id: "t",
  title: "T",
  category: "study",
  normalGoal: "normal",
  lowEnergyGoal: "low",
  floorGoal: "floor",
  contactGoal: "contact",
  active: true,
  createdAt: "",
  updatedAt: ""
};

describe("core logic", () => {
  it("calculates energy levels", () => {
    expect(decideEnergyLevel({ sleepHours: 7, sleepiness: 0, moodHeaviness: 0, anxiety: 0, bodyHeaviness: 0 })).toBe("A");
    expect(decideEnergyLevel({ sleepHours: 6, sleepiness: 2, moodHeaviness: 2, anxiety: 2, bodyHeaviness: 1 })).toBe("B");
    expect(decideEnergyLevel({ sleepHours: 5.5, sleepiness: 3, moodHeaviness: 3, anxiety: 2, bodyHeaviness: 2 })).toBe("C");
    expect(decideEnergyLevel({ sleepHours: 4, sleepiness: 4, moodHeaviness: 3, anxiety: 4, bodyHeaviness: 2 })).toBe("D");
    expect(decideEnergyLevel({ sleepHours: 3, sleepiness: 5, moodHeaviness: 4, anxiety: 5, bodyHeaviness: 3 })).toBe("R");
  });

  it("selects goals by energy", () => {
    expect(selectGoal(task, "A")).toBe("normal");
    expect(selectGoal(task, "B")).toBe("low");
    expect(selectGoal(task, "C")).toBe("floor");
    expect(selectGoal(task, "D")).toBe("contact");
    expect(selectGoal(task, "R")).toBe("contact");
  });

  it("advances cascade without treating rest as failure", () => {
    expect(nextCascadeStep("emotion_label", "continue")).toBe("if_then");
    expect(nextCascadeStep("five_min_timer", "rest")).toBe("rest_log");
  });
});
