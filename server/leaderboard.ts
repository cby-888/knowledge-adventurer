// 排行榜聚合
import { prisma } from "@/lib/prisma";

export type LeaderboardRange = "global" | "weekly" | "monthly";

const RANGE_DAYS: Record<LeaderboardRange, number | null> = {
  global: null,
  weekly: 7,
  monthly: 30,
};

export async function getLeaderboard(
  range: LeaderboardRange,
  limit = 50,
) {
  const days = RANGE_DAYS[range];
  const take = Math.min(100, Math.max(1, limit));

  if (days === null) {
    // 全球榜: 按累计 XP 排序
    const users = await prisma.user.findMany({
      orderBy: [
        { xp: "desc" },
        { level: "desc" },
        { streakDays: "desc" },
        { tasksCompleted: "desc" },
      ],
      take,
      select: {
        id: true,
        username: true,
        avatar: true,
        level: true,
        xp: true,
        streakDays: true,
        tasksCompleted: true,
      },
    });
    return users.map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      username: u.username,
      avatar: u.avatar,
      level: u.level,
      totalXp: u.xp,
      periodXp: u.xp,
      streakDays: u.streakDays,
      tasksCompleted: u.tasksCompleted,
    }));
  }

  // 周/月榜: 按时间段内获得的 XP 聚合
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const groups = await prisma.learningRecord.groupBy({
    by: ["userId"],
    where: { createdAt: { gte: since } },
    _sum: { xpEarned: true },
    orderBy: { _sum: { xpEarned: "desc" } },
    take,
  });

  const userIds = groups.map((g) => g.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      username: true,
      avatar: true,
      level: true,
      xp: true,
      streakDays: true,
      tasksCompleted: true,
    },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  return groups
    .map((g, i) => {
      const u = userMap.get(g.userId);
      if (!u) return null;
      return {
        rank: i + 1,
        userId: u.id,
        username: u.username,
        avatar: u.avatar,
        level: u.level,
        totalXp: u.xp,
        periodXp: g._sum.xpEarned ?? 0,
        streakDays: u.streakDays,
        tasksCompleted: u.tasksCompleted,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}
