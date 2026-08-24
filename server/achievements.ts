// 成就查询: 返回全部成就 + 用户解锁状态 + 用户当前进度
import { prisma } from "@/lib/prisma";

export async function getAchievements(userId: string) {
  const [all, unlocked, stats] = await Promise.all([
    prisma.achievement.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    }),
    collectStats(userId),
  ]);

  const unlockedMap = new Map(
    unlocked.map((u) => [u.achievement.slug, u.unlockedAt]),
  );

  return {
    stats,
    achievements: all.map((a) => ({
      slug: a.slug,
      name: a.name,
      description: a.description,
      emoji: a.emoji,
      conditionType: a.conditionType,
      conditionValue: a.conditionValue,
      xpReward: a.xpReward,
      goldReward: a.goldReward,
      unlocked: unlockedMap.has(a.slug),
      unlockedAt: unlockedMap.get(a.slug) ?? null,
    })),
  };
}

async function collectStats(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const [careerCount, aiTasksCompleted, bugFixesCompleted, chatCount] =
    await Promise.all([
      prisma.userCareer.count({ where: { userId } }),
      prisma.learningRecord.count({ where: { userId, activityType: "ai_task" } }),
      prisma.taskAttempt.count({
        where: { userId, correct: true, task: { type: "bug_fix" } },
      }),
      prisma.conversation.count({ where: { userId } }),
    ]);

  return {
    tasksCompleted: user.tasksCompleted,
    streakDays: user.streakDays,
    level: user.level,
    careerCount,
    aiTasksCompleted,
    bugFixesCompleted,
    chatCount,
    investProfit: 0,
  };
}
