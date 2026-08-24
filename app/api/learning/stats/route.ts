import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { ok, fail, handle } from "@/lib/api";

export async function GET(req: Request) {
  return handle(async () => {
    const userId = await getCurrentUserId();
    if (!userId) return fail("未登录", 401);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const [aiTasksCompleted, recent, perCareer] = await Promise.all([
      prisma.learningRecord.count({ where: { userId, activityType: "ai_task" } }),
      prisma.learningRecord.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.learningRecord.groupBy({
        by: ["careerId"],
        where: { userId, careerId: { not: null } },
        _sum: { xpEarned: true },
      }),
    ]);

    const careers = await prisma.career.findMany({
      where: { id: { in: perCareer.map((p) => p.careerId as string) } },
      select: { id: true, slug: true, name: true, emoji: true },
    });
    const careerMap = new Map(careers.map((c) => [c.id, c]));

    return ok({
      level: user.level,
      xp: user.xp,
      gold: user.gold,
      hp: user.hp,
      streakDays: user.streakDays,
      totalStudyMinutes: user.totalStudyMinutes,
      tasksCompleted: user.tasksCompleted,
      aiTasksCompleted,
      careerXp: perCareer
        .map((p) => ({
          career: careerMap.get(p.careerId as string) ?? null,
          xp: p._sum.xpEarned ?? 0,
        }))
        .filter((x) => x.career),
      recent: recent.map((r) => ({
        activityType: r.activityType,
        xpEarned: r.xpEarned,
        goldEarned: r.goldEarned,
        minutesSpent: r.minutesSpent,
        createdAt: r.createdAt,
      })),
    });
  }, req);
}
