// 技能解锁业务逻辑
import { prisma } from "@/lib/prisma";
import { applyRewards } from "@/server/rewards";
import { HttpError } from "@/lib/api";

export async function unlockSkill(userId: string, skillId: string) {
  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
    include: { career: true },
  });
  if (!skill) throw new HttpError("技能不存在", 404);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  if (user.level < skill.levelRequirement) {
    throw new HttpError(
      `需要达到 Lv.${skill.levelRequirement} 才能解锁该技能`,
      403,
    );
  }

  const existing = await prisma.userSkill.findUnique({
    where: { userId_skillId: { userId, skillId } },
  });
  if (existing) throw new HttpError("该技能已解锁", 409);

  // 校验前置技能
  if (skill.prerequisites.length > 0) {
    const unlocked = await prisma.userSkill.findMany({
      where: { userId, skill: { slug: { in: skill.prerequisites } } },
      include: { skill: true },
    });
    const unlockedSlugs = new Set(unlocked.map((u) => u.skill.slug));
    const missing = skill.prerequisites.filter((p) => !unlockedSlugs.has(p));
    if (missing.length > 0) {
      throw new HttpError("前置技能未解锁", 403);
    }
  }

  await prisma.userSkill.create({ data: { userId, skillId } });

  const result = await applyRewards({
    userId,
    xp: skill.xpReward,
    gold: 10,
    activityType: "skill_unlock",
    careerId: skill.careerId,
    metadata: { skillId: skill.id, skillName: skill.name },
  });

  return {
    skill: { slug: skill.slug, name: skill.name },
    xpAwarded: result.totalXpAwarded,
    goldAwarded: result.totalGoldAwarded,
    newLevel: result.newLevel,
    leveledUp: result.leveledUp,
    newlyUnlockedAchievements: result.newlyUnlockedAchievements,
  };
}
