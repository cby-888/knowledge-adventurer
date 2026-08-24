// 每日签到业务逻辑
import { prisma } from "@/lib/prisma";
import {
  dateKey,
  nextStreak,
  checkInReward,
  type StreakMilestone,
} from "@/lib/game/checkin";
import { applyRewards } from "@/server/rewards";

export interface CheckInResult {
  alreadyCheckedIn: boolean;
  streak: number;
  xpAwarded: number;
  goldAwarded: number;
  milestone: StreakMilestone | null;
  newLevel: number;
  leveledUp: boolean;
  newlyUnlockedAchievements: { slug: string; name: string; emoji: string }[];
}

export async function performCheckIn(userId: string): Promise<CheckInResult> {
  const today = dateKey(new Date());

  const existing = await prisma.dailyCheckIn.findUnique({
    where: { userId_dateKey: { userId, dateKey: today } },
  });

  if (existing) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return {
      alreadyCheckedIn: true,
      streak: existing.streak,
      xpAwarded: 0,
      goldAwarded: 0,
      milestone: null,
      newLevel: user.level,
      leveledUp: false,
      newlyUnlockedAchievements: [],
    };
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const last = await prisma.dailyCheckIn.findFirst({
    where: { userId },
    orderBy: { dateKey: "desc" },
  });

  const streak = nextStreak(last?.dateKey ?? null, today, user.streakDays);
  const reward = checkInReward(streak);

  // 先更新连续天数(供成就统计使用)
  await prisma.user.update({
    where: { id: userId },
    data: { streakDays: streak },
  });

  await prisma.dailyCheckIn.create({
    data: {
      userId,
      dateKey: today,
      streak,
      xpReward: reward.xp,
      goldReward: reward.gold,
    },
  });

  const result = await applyRewards({
    userId,
    xp: reward.xp,
    gold: reward.gold,
    activityType: "checkin",
    minutesSpent: 0,
  });

  return {
    alreadyCheckedIn: false,
    streak,
    xpAwarded: result.totalXpAwarded,
    goldAwarded: result.totalGoldAwarded,
    milestone: reward.milestone,
    newLevel: result.newLevel,
    leveledUp: result.leveledUp,
    newlyUnlockedAchievements: result.newlyUnlockedAchievements,
  };
}
