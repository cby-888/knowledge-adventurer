import { Prisma, Difficulty, TaskType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { ok, handle } from "@/lib/api";

const DIFFICULTIES = new Set(["easy", "medium", "hard", "expert"]);
const TYPES = new Set(["quiz", "short_answer", "scenario", "bug_fix", "conversation"]);

export async function GET(req: Request) {
  return handle(async () => {
    const sp = new URL(req.url).searchParams;
    const careerSlug = sp.get("career") ?? undefined;
    const difficulty = sp.get("difficulty") ?? undefined;
    const type = sp.get("type") ?? undefined;
    const limit = Math.min(50, Math.max(1, Number(sp.get("limit")) || 20));

    const where: Prisma.TaskWhereInput = {};
    if (careerSlug) where.career = { slug: careerSlug };
    if (difficulty && DIFFICULTIES.has(difficulty)) {
      where.difficulty = difficulty as Difficulty;
    }
    if (type && TYPES.has(type)) {
      where.type = type as TaskType;
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { career: { select: { slug: true, name: true, emoji: true } } },
    });

    const userId = await getCurrentUserId();
    let completed = new Set<string>();
    if (userId) {
      const attempts = await prisma.taskAttempt.findMany({
        where: { userId, isFirstCorrect: true },
        select: { taskId: true },
      });
      completed = new Set(attempts.map((a) => a.taskId));
    }

    // 不下发答案与解析, 防止作弊
    return ok(
      tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        type: t.type,
        difficulty: t.difficulty,
        question: t.question,
        options: t.options,
        xp: t.xp,
        gold: t.gold,
        topic: t.topic,
        isAiGenerated: t.isAiGenerated,
        career: t.career,
        completed: completed.has(t.id),
      })),
    );
  }, req);
}
