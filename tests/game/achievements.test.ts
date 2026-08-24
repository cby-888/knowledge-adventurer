import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isConditionMet,
  newlyUnlocked,
  type AchievementDef,
  type UserStats,
} from "../../lib/game/achievements";

const stats: UserStats = {
  tasksCompleted: 10,
  streakDays: 7,
  level: 5,
  careerCount: 2,
  aiTasksCompleted: 3,
  bugFixesCompleted: 1,
  chatCount: 1,
  investProfit: 10,
};

test("各类条件判定", () => {
  assert.equal(isConditionMet({ slug: "a", conditionType: "task_count", conditionValue: 10 }, stats), true);
  assert.equal(isConditionMet({ slug: "a", conditionType: "task_count", conditionValue: 11 }, stats), false);
  assert.equal(isConditionMet({ slug: "a", conditionType: "streak_days", conditionValue: 7 }, stats), true);
  assert.equal(isConditionMet({ slug: "a", conditionType: "level_reach", conditionValue: 5 }, stats), true);
  assert.equal(isConditionMet({ slug: "a", conditionType: "career_count", conditionValue: 4 }, stats), false);
  assert.equal(isConditionMet({ slug: "a", conditionType: "invest_profit", conditionValue: 10 }, stats), true);
  assert.equal(isConditionMet({ slug: "a", conditionType: "unknown_type", conditionValue: 1 }, stats), false);
});

test("newlyUnlocked 只返回新成就", () => {
  const defs: AchievementDef[] = [
    { slug: "first", conditionType: "task_count", conditionValue: 1 },
    { slug: "ten", conditionType: "task_count", conditionValue: 10 },
    { slug: "hundred", conditionType: "task_count", conditionValue: 100 },
  ];
  const result = newlyUnlocked(defs, stats, new Set(["first"]));
  assert.deepEqual(result.map((d) => d.slug), ["ten"]);
});
