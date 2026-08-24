// 奖励计算 —— 纯函数, 无外部依赖。
// 服务端统一据此重算奖励, 前端不可直接修改 XP / Gold。

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1,
  medium: 1.5,
  hard: 2,
  expert: 3,
};

export function difficultyMultiplier(difficulty: Difficulty): number {
  return DIFFICULTY_MULTIPLIER[difficulty] ?? 1;
}

export interface Reward {
  xp: number;
  gold: number;
}

/** 按难度缩放任务基础奖励 */
export function scaleTaskReward(
  baseXp: number,
  baseGold: number,
  difficulty: Difficulty,
): Reward {
  const m = difficultyMultiplier(difficulty);
  return {
    xp: Math.round(baseXp * m),
    gold: Math.round(baseGold * m),
  };
}

/** 分数限制在 0..100 */
export function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** 根据得分(0-100) 按比例折算奖励, 未满分只能拿部分奖励 */
export function rewardForScore(reward: Reward, score: number): Reward {
  const ratio = clampScore(score) / 100;
  return {
    xp: Math.round(reward.xp * ratio),
    gold: Math.round(reward.gold * ratio),
  };
}
