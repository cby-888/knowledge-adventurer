import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { ok, fail, readJson, parse, handle } from "@/lib/api";

const schema = z.object({ slug: z.string().min(1) });

export async function POST(req: Request) {
  return handle(async () => {
    const userId = await getCurrentUserId();
    if (!userId) return fail("未登录", 401);

    const body = await readJson(req);
    const parsed = parse(schema, body);
    if (!parsed.success) return fail(parsed.error, 422);

    const career = await prisma.career.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (!career) return fail("职业不存在", 404);

    await prisma.$transaction(async (tx) => {
      // 该职业置为当前激活
      await tx.userCareer.updateMany({
        where: { userId },
        data: { isActive: false },
      });
      await tx.userCareer.upsert({
        where: { userId_careerId: { userId, careerId: career.id } },
        update: { isActive: true },
        create: { userId, careerId: career.id, level: 1, xp: 0, isActive: true },
      });
    });

    const userCareers = await prisma.userCareer.findMany({
      where: { userId },
      include: { career: true },
    });

    return ok({
      selected: career.slug,
      careers: userCareers.map((uc) => ({
        slug: uc.career.slug,
        name: uc.career.name,
        emoji: uc.career.emoji,
        level: uc.level,
        xp: uc.xp,
        isActive: uc.isActive,
      })),
    });
  }, req);
}
