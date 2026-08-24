import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { ok, handle } from "@/lib/api";

export async function GET(req: Request) {
  return handle(async () => {
    const userId = await getCurrentUserId();

    const careers = await prisma.career.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { skills: true, tasks: true } } },
    });

    let progressMap: Record<
      string,
      { level: number; xp: number; isActive: boolean }
    > = {};
    if (userId) {
      const ucs = await prisma.userCareer.findMany({ where: { userId } });
      for (const uc of ucs) {
        progressMap[uc.careerId] = {
          level: uc.level,
          xp: uc.xp,
          isActive: uc.isActive,
        };
      }
    }

    return ok(
      careers.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        emoji: c.emoji,
        description: c.description,
        color: c.color,
        topics: c.topics,
        skillCount: c._count.skills,
        taskCount: c._count.tasks,
        progress: progressMap[c.id] ?? null,
      })),
    );
  }, req);
}
