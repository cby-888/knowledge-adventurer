// 每日签到 —— 纯函数, 无外部依赖。

export const DAILY_XP = 20;
export const DAILY_GOLD = 10;

export interface StreakMilestone {
  streak: number;
  xp: number;
  gold: number;
  label: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { streak: 3, xp: 50, gold: 30, label: "连续 3 天" },
  { streak: 7, xp: 100, gold: 60, label: "连续 7 天" },
  { streak: 14, xp: 200, gold: 120, label: "连续 14 天" },
  { streak: 30, xp: 500, gold: 300, label: "连续 30 天" },
  { streak: 100, xp: 2000, gold: 1000, label: "连续 100 天" },
];

export interface CheckInReward {
  xp: number;
  gold: number;
  milestone: StreakMilestone | null;
}

/** 根据当前连续天数计算签到奖励 */
export function checkInReward(streak: number): CheckInReward {
  const milestone =
    STREAK_MILESTONES.find((m) => m.streak === streak) ?? null;
  return {
    xp: DAILY_XP + (milestone?.xp ?? 0),
    gold: DAILY_GOLD + (milestone?.gold ?? 0),
    milestone,
  };
}

/** 生成本地日期键 "YYYY-MM-DD" */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 日期键偏移 days 天 */
export function addDaysKey(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return dateKey(dt);
}

/**
 * 计算下一次签到的连续天数。
 * - 上次签到是今天: 连续天数不变(重复签到)
 * - 上次签到是昨天: 连续 +1
 * - 否则: 重置为 1
 */
export function nextStreak(
  lastDateKey: string | null,
  todayKey: string,
  currentStreak: number,
): number {
  if (!lastDateKey) return 1;
  if (lastDateKey === todayKey) return currentStreak;
  if (lastDateKey === addDaysKey(todayKey, -1)) return currentStreak + 1;
  return 1;
}
