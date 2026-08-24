// 成就条件判定 —— 纯函数, 无外部依赖。

export interface AchievementDef {
  slug: string;
  conditionType: string;
  conditionValue: number;
}

export interface UserStats {
  tasksCompleted: number;
  streakDays: number;
  level: number;
  careerCount: number;
  aiTasksCompleted: number;
  bugFixesCompleted: number;
  chatCount: number;
  investProfit: number; // 百分比, 例如 10 表示盈利 10%
}

/** 判断单个成就是否满足条件 */
export function isConditionMet(def: AchievementDef, stats: UserStats): boolean {
  switch (def.conditionType) {
    case "task_count":
      return stats.tasksCompleted >= def.conditionValue;
    case "streak_days":
      return stats.streakDays >= def.conditionValue;
    case "level_reach":
      return stats.level >= def.conditionValue;
    case "career_count":
      return stats.careerCount >= def.conditionValue;
    case "ai_task_count":
      return stats.aiTasksCompleted >= def.conditionValue;
    case "bug_fix_count":
      return stats.bugFixesCompleted >= def.conditionValue;
    case "chat_count":
      return stats.chatCount >= def.conditionValue;
    case "invest_profit":
      return stats.investProfit >= def.conditionValue;
    default:
      return false;
  }
}

/** 返回尚未解锁、且已满足条件的新成就 */
export function newlyUnlocked(
  defs: AchievementDef[],
  stats: UserStats,
  alreadyUnlocked: Set<string>,
): AchievementDef[] {
  return defs.filter(
    (d) => !alreadyUnlocked.has(d.slug) && isConditionMet(d, stats),
  );
}
