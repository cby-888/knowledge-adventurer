import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkInReward,
  nextStreak,
  dateKey,
  addDaysKey,
} from "../../lib/game/checkin";

test("每日签到基础奖励", () => {
  assert.deepEqual(checkInReward(1), {
    xp: 20,
    gold: 10,
    milestone: null,
  });
});

test("连续签到里程碑奖励", () => {
  const r3 = checkInReward(3);
  assert.equal(r3.xp, 70); // 20 + 50
  assert.equal(r3.gold, 40); // 10 + 30
  assert.equal(r3.milestone?.label, "连续 3 天");

  const r7 = checkInReward(7);
  assert.equal(r7.xp, 120);
  assert.equal(r7.gold, 70);
});

test("nextStreak 连续天数计算", () => {
  const today = "2025-01-15";
  // 首次
  assert.equal(nextStreak(null, today, 0), 1);
  // 昨天签到过
  assert.equal(nextStreak("2025-01-14", today, 5), 6);
  // 今天已签到
  assert.equal(nextStreak(today, today, 6), 6);
  // 断签重置
  assert.equal(nextStreak("2025-01-10", today, 6), 1);
});

test("日期键工具", () => {
  assert.equal(dateKey(new Date(2025, 0, 5)), "2025-01-05");
  assert.equal(addDaysKey("2025-01-31", 1), "2025-02-01");
  assert.equal(addDaysKey("2024-02-28", 1), "2024-02-29"); // 闰年
  assert.equal(addDaysKey("2025-01-15", -1), "2025-01-14");
});
