import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { serializeUser } from "@/lib/serialize";
import { ok, fail, readJson, parse, handle } from "@/lib/api";

export async function GET(req: Request) {
  return handle(async () => {
    const user = await getCurrentUser();
    if (!user) return fail("未登录", 401);
    return ok(serializeUser(user));
  }, req);
}

const updateSchema = z.object({
  username: z
    .string()
    .min(2, "用户名至少 2 个字符")
    .max(30, "用户名最多 30 个字符")
    .regex(/^[\w\u4e00-\u9fa5-]+$/, "用户名只能包含中英文、数字、下划线和连字符")
    .optional(),
  avatar: z.string().min(1).max(8).optional(),
});

export async function PATCH(req: Request) {
  return handle(async () => {
    const user = await getCurrentUser();
    if (!user) return fail("未登录", 401);

    const body = await readJson(req);
    const parsed = parse(updateSchema, body);
    if (!parsed.success) return fail(parsed.error, 422);

    const { username, avatar } = parsed.data;
    if (!username && !avatar) return fail("没有可更新的内容", 422);

    if (username) {
      const taken = await prisma.user.findUnique({ where: { username } });
      if (taken && taken.id !== user.id) return fail("用户名已被使用", 409);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(username ? { username } : {}),
        ...(avatar ? { avatar } : {}),
      },
      include: {
        userCareers: { include: { career: true } },
        userAchievements: { include: { achievement: true } },
      },
    });

    return ok(serializeUser(updated));
  }, req);
}
