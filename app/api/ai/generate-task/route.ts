import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { ok, fail, readJson, parse, handle, HttpError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { generateTask } from "@/services/deepseek/generateTask";
import { isConfigured } from "@/services/deepseek/client";

const schema = z.object({
  career: z.string().min(1),
  level: z.number().int().min(1).max(100).optional(),
  topic: z.string().max(120).optional(),
  difficulty: z.enum(["easy", "medium", "hard", "expert"]).optional(),
});

export async function POST(req: Request) {
  return handle(async () => {
    const userId = await getCurrentUserId();
    if (!userId) return fail("未登录", 401);

    const rl = rateLimit(`ai:${userId}`, 10, 60_000);
    if (!rl.allowed) return fail("AI 请求过于频繁，请稍后再试", 429);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const apiKey = user.deepseekApiKey ?? undefined;

    if (!isConfigured(apiKey)) {
      throw new HttpError("请先在「设置」页配置你自己的 DeepSeek API Key", 503);
    }

    const body = await readJson(req);
    const parsed = parse(schema, body);
    if (!parsed.success) return fail(parsed.error, 422);

    const career = await prisma.career.findUnique({
      where: { slug: parsed.data.career },
    });
    if (!career) return fail("职业不存在", 404);

    const level = parsed.data.level ?? user.level;

    const generated = await generateTask(
      {
        career: career.name,
        level,
        topic: parsed.data.topic,
        difficulty: parsed.data.difficulty,
      },
      apiKey,
    );

    // 落库, 便于后续提交评分
    const task = await prisma.task.create({
      data: {
        careerId: career.id,
        title: generated.title,
        description: generated.description,
        type: generated.type,
        difficulty: generated.difficulty,
        question: generated.question,
        options: generated.options ?? Prisma.JsonNull,
        answer: generated.answer,
        explanation: generated.explanation,
        xp: generated.xp,
        gold: generated.gold,
        topic: generated.topic,
        isAiGenerated: true,
      },
    });

    // 答案不下发
    return ok({
      id: task.id,
      title: task.title,
      description: task.description,
      type: task.type,
      difficulty: task.difficulty,
      question: task.question,
      options: task.options,
      xp: task.xp,
      gold: task.gold,
      topic: task.topic,
      isAiGenerated: true,
      career: { slug: career.slug, name: career.name, emoji: career.emoji },
    });
  }, req);
}
