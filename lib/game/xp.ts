// 经验 / 等级系统 —— 纯函数, 无外部依赖, 可独立测试。
// 升级曲线: 升到 2 级需 100 XP, 之后每级递增 50 XP。
//   Lv1→2 = 100, Lv2→3 = 150, Lv3→4 = 200, ...

export const BASE_XP = 100; // 升到 2 级所需 XP
export const XP_GROWTH = 50; // 每级递增 XP

/** 从 level 升到 level+1 所需 XP */
export function xpForNextLevel(level: number): number {
  const l = Math.max(1, Math.floor(level));
  return BASE_XP + (l - 1) * XP_GROWTH;
}

/** 累计达到某等级所需总 XP (level >= 1) */
export function totalXpForLevel(level: number): number {
  const l = Math.max(1, Math.floor(level));
  let total = 0;
  for (let i = 1; i < l; i++) total += xpForNextLevel(i);
  return total;
}

/** 根据总 XP 计算当前等级 */
export function levelFromXp(xp: number): number {
  const x = Math.max(0, Math.floor(xp));
  let level = 1;
  while (x >= totalXpForLevel(level + 1)) level++;
  return level;
}

export interface LevelProgress {
  level: number;
  currentLevelXp: number; // 当前等级起点对应的累计 XP
  nextLevelXp: number; // 下一等级起点对应的累计 XP
  xpIntoLevel: number; // 当前等级内已积累的 XP
  xpForNext: number; // 距下一级还需的 XP
  progress: number; // 0..1
  isMaxLevel: boolean;
}

/** 等级进度详情, 供 HUD / 资料页展示 */
export function levelProgress(xp: number, maxLevel = 100): LevelProgress {
  const level = Math.min(levelFromXp(xp), maxLevel);
  const currentLevelXp = totalXpForLevel(level);
  const nextLevelXp = totalXpForLevel(level + 1);
  const xpIntoLevel = Math.max(0, Math.floor(xp) - currentLevelXp);
  const xpForNext = Math.max(0, nextLevelXp - currentLevelXp);
  const progress = xpForNext === 0 ? 1 : Math.min(1, xpIntoLevel / xpForNext);
  return {
    level,
    currentLevelXp,
    nextLevelXp,
    xpIntoLevel,
    xpForNext,
    progress,
    isMaxLevel: level >= maxLevel,
  };
}

/** 新增 XP 后可能跨越多级, 返回升级前后等级 */
export function levelsGained(oldXp: number, newXp: number): number {
  return Math.max(0, levelFromXp(newXp) - levelFromXp(oldXp));
}
