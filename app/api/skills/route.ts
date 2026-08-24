import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { ok, handle } from "@/lib/api";

export async function GET(req: Request) {
  return handle(async () => {
    const sp = new URL(req.url).searchParams;
    const careerSlug = sp.get("career") ?? undefined;

    const skills = await prisma.skill.findMany({
      where: careerSlug ? { career: { slug: careerSlug } } : {},
      orderBy: [{ careerId: "asc" }, { tier: "asc" }],
      include: { career: { select: { slug: true, name: true, emoji: true } } },
    });

    const userId = await getCurrentUserId();
    let unlocked = new Set<string>();
    if (userId) {
      const us = await prisma.userSkill.findMany({
        where: { userId },
        select: { skillId: true },
      });
      unlocked = new Set(us.map((u) => u.skillId));
    }

    return ok(
      skills.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        description: s.description,
        tier: s.tier,
        levelRequirement: s.levelRequirement,
        xpReward: s.xpReward,
        prerequisites: s.prerequisites,
        positionX: s.positionX,
        positionY: s.positionY,
        career: s.career,
        unlocked: unlocked.has(s.id),
      })),
    );
  }, req);
}
