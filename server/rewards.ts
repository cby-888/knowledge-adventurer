// 奖励引擎 —— 所有 XP/Gold/Level 变更的唯一入口(服务端重算, 防刷核心)
import { Prisma, type ActivityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { levelFromXp } from "@/lib/game/xp";
import { isConditionMet, type UserStats } from "@/lib/game/achievements";

interface ApplyRewardsInput {
  userId: string;
  xp: number;
  gold: number;
  activityType: ActivityType;
  careerId?: string | null;
  taskId?: string | null;
  minutesSpent?: number;
  metadata?: Prisma.InputJsonValue;
  incrementTaskCount?: boolean;
}

export interface NewAchievement {
  slug: string;
  name: string;
  emoji: string;
  description: string;
}

export interface ApplyRewardsResult {
  newXp: number;
  newGold: number;
  newLevel: number;
  leveledUp: boolean;
  levelsGained: number;
  totalXpAwarded: number;
  totalGoldAwarded: number;
  newlyUnlockedAchievements: NewAchievement[];
}

async function collectStats(
  tx: Prisma.TransactionClient,
  userId: string,
  tasksCompleted: number,
  streakDays: number,
  level: number,
): Promise<UserStats> {
  const [careerCount, aiTasksCompleted, bugFixesCompleted, chatCount] =
    await Promise.all([
      tx.userCareer.count({ where: { userId } }),
      tx.learningRecord.count({ where: { userId, activityType: "ai_task" } }),
      tx.taskAttempt.count({
        where: { userId, correct: true, task: { type: "bug_fix" } },
      }),
      tx.conversation.count({ where: { userId } }),
    ]);

  return {
    tasksCompleted,
    streakDays,
    level,
    careerCount,
    aiTasksCompleted,
    bugFixesCompleted,
    chatCount,
    investProfit: 0, // 投资模拟为后续功能, 当前恒为 0
  };
}

/** 应用奖励并在同一事务内检查/解锁成就 */
export async function applyRewards(
  input: ApplyRewardsInput,
): Promise<ApplyRewardsResult> {
  const safeXp = Math.max(0, Math.round(input.xp));
  const safeGold = Math.max(0, Math.round(input.gold));
  const safeMinutes = Math.max(0, Math.round(input.minutesSpent ?? 0));

  return prisma.$transaction(async (tx) => {
    const before = await tx.user.findUniqueOrThrow({
      where: { id: input.userId },
    });

    const midXp = before.xp + safeXp;
    const midGold = before.gold + safeGold;
    const midLevel = levelFromXp(midXp);

    await tx.user.update({
      where: { id: input.userId },
      data: {
        xp: midXp,
        gold: midGold,
        level: midLevel,
        totalStudyMinutes: { increment: safeMinutes },
        ...(input.incrementTaskCount
          ? { tasksCompleted: { increment: 1 } }
          : {}),
      },
    });

    if (safeXp > 0 || safeGold > 0 || safeMinutes > 0) {
      await tx.learningRecord.create({
        data: {
          userId: input.userId,
          careerId: input.careerId ?? null,
          taskId: input.taskId ?? null,
          activityType: input.activityType,
          xpEarned: safeXp,
          goldEarned: safeGold,
          minutesSpent: safeMinutes,
          metadata: input.metadata ?? Prisma.JsonNull,
        },
      });
    }

    const stats = await collectStats(
      tx,
      input.userId,
      before.tasksCompleted + (input.incrementTaskCount ? 1 : 0),
      before.streakDays,
      midLevel,
    );

    const already = await tx.userAchievement.findMany({
      where: { userId: input.userId },
      select: { achievementId: true },
    });
    const alreadySet = new Set(already.map((a) => a.achievementId));

    const allAchievements = await tx.achievement.findMany();
    const newly: NewAchievement[] = [];
    let bonusXp = 0;
    let bonusGold = 0;

    for (const ach of allAchievements) {
      if (alreadySet.has(ach.id)) continue;
      const met = isConditionMet(
        {
          slug: ach.slug,
          conditionType: ach.conditionType,
          conditionValue: ach.conditionValue,
        },
        stats,
      );
      if (met) {
        await tx.userAchievement.create({
          data: { userId: input.userId, achievementId: ach.id },
        });
        newly.push({
          slug: ach.slug,
          name: ach.name,
          emoji: ach.emoji,
          description: ach.description,
        });
        bonusXp += ach.xpReward;
        bonusGold += ach.goldReward;
      }
    }

    // 成就奖励叠加(不递归触发新成就, 避免循环)
    let finalXp = midXp;
    let finalGold = midGold;
    if (bonusXp > 0 || bonusGold > 0) {
      finalXp = midXp + bonusXp;
      finalGold = midGold + bonusGold;
      await tx.user.update({
        where: { id: input.userId },
        data: {
          xp: finalXp,
          gold: finalGold,
          level: levelFromXp(finalXp),
        },
      });
    }

    const finalLevel = levelFromXp(finalXp);

    return {
      newXp: finalXp,
      newGold: finalGold,
      newLevel: finalLevel,
      leveledUp: finalLevel > before.level,
      levelsGained: finalLevel - before.level,
      totalXpAwarded: safeXp + bonusXp,
      totalGoldAwarded: safeGold + bonusGold,
      newlyUnlockedAchievements: newly,
    };
  });
}
