import { test } from "node:test";
import assert from "node:assert/strict";
import {
  difficultyMultiplier,
  scaleTaskReward,
  clampScore,
  rewardForScore,
} from "../../lib/game/rewards";

test("难度倍率", () => {
  assert.equal(difficultyMultiplier("easy"), 1);
  assert.equal(difficultyMultiplier("medium"), 1.5);
  assert.equal(difficultyMultiplier("hard"), 2);
  assert.equal(difficultyMultiplier("expert"), 3);
});

test("任务奖励按难度缩放", () => {
  assert.deepEqual(scaleTaskReward(50, 20, "easy"), { xp: 50, gold: 20 });
  assert.deepEqual(scaleTaskReward(50, 20, "hard"), { xp: 100, gold: 40 });
  assert.deepEqual(scaleTaskReward(50, 20, "expert"), { xp: 150, gold: 60 });
});

test("分数限制在 0..100", () => {
  assert.equal(clampScore(-5), 0);
  assert.equal(clampScore(150), 100);
  assert.equal(clampScore(85), 85);
  assert.equal(clampScore(Number.NaN), 0);
});

test("按得分折算奖励", () => {
  assert.deepEqual(rewardForScore({ xp: 100, gold: 40 }, 50), {
    xp: 50,
    gold: 20,
  });
  assert.deepEqual(rewardForScore({ xp: 100, gold: 40 }, 100), {
    xp: 100,
    gold: 40,
  });
  assert.deepEqual(rewardForScore({ xp: 100, gold: 40 }, 0), {
    xp: 0,
    gold: 0,
  });
});
