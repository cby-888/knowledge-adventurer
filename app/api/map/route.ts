import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { ok, handle } from "@/lib/api";

export async function GET(req: Request) {
  return handle(async () => {
    const areas = await prisma.mapArea.findMany({
      orderBy: { order: "asc" },
    });

    const userId = await getCurrentUserId();
    let playerLevel = 1;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { level: true },
      });
      playerLevel = user?.level ?? 1;
    }

    return ok(
      areas.map((a) => ({
        slug: a.slug,
        name: a.name,
        emoji: a.emoji,
        description: a.description,
        minLevel: a.minLevel,
        order: a.order,
        locked: a.locked,
        unlocked: playerLevel >= a.minLevel,
      })),
    );
  }, req);
}
