import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { ok, fail, readJson, parse, handle, HttpError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { generateHint, isConfigured } from "@/services/deepseek";

const schema = z.object({ taskId: z.string().min(1) });

export async function POST(req: Request) {
  return handle(async () => {
    const userId = await getCurrentUserId();
    if (!userId) return fail("未登录", 401);

    const rl = rateLimit(`hint:${userId}`, 10, 60_000);
    if (!rl.allowed) return fail("请求过于频繁", 429);

    if (!isConfigured()) {
      throw new HttpError("DeepSeek API 未配置，请在 .env 设置 DEEPSEEK_API_KEY", 503);
    }

    const body = await readJson(req);
    const parsed = parse(schema, body);
    if (!parsed.success) return fail(parsed.error, 422);

    const task = await prisma.task.findUnique({
      where: { id: parsed.data.taskId },
      include: { career: true },
    });
    if (!task) return fail("任务不存在", 404);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const hint = await generateHint({
      career: task.career?.name ?? "通用",
      question: task.question,
      playerLevel: user.level,
    });

    return ok({ hint });
  }, req);
}
