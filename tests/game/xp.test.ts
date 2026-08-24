import { test } from "node:test";
import assert from "node:assert/strict";
import {
  xpForNextLevel,
  totalXpForLevel,
  levelFromXp,
  levelProgress,
  levelsGained,
} from "../../lib/game/xp";

test("xpForNextLevel 基础升级曲线", () => {
  assert.equal(xpForNextLevel(1), 100);
  assert.equal(xpForNextLevel(2), 150);
  assert.equal(xpForNextLevel(3), 200);
  assert.equal(xpForNextLevel(10), 550);
});

test("totalXpForLevel 累计经验", () => {
  assert.equal(totalXpForLevel(1), 0);
  assert.equal(totalXpForLevel(2), 100);
  assert.equal(totalXpForLevel(3), 250); // 100 + 150
  assert.equal(totalXpForLevel(4), 450); // 100 + 150 + 200
});

test("levelFromXp 反推等级", () => {
  assert.equal(levelFromXp(0), 1);
  assert.equal(levelFromXp(99), 1);
  assert.equal(levelFromXp(100), 2);
  assert.equal(levelFromXp(249), 2);
  assert.equal(levelFromXp(250), 3);
  assert.equal(levelFromXp(-10), 1); // 负数安全
});

test("levelProgress 进度详情", () => {
  const p = levelProgress(120);
  assert.equal(p.level, 2);
  assert.equal(p.xpIntoLevel, 20);
  assert.equal(p.xpForNext, 150);
  assert.equal(p.progress, 20 / 150);
});

test("levelsGained 跨级计算", () => {
  assert.equal(levelsGained(0, 50), 0);
  assert.equal(levelsGained(50, 150), 1); // 1→2
  assert.equal(levelsGained(0, 250), 2); // 1→3
});
