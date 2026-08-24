import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { ok, fail, handle } from "@/lib/api";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: { career: { select: { slug: true, name: true, emoji: true } } },
    });
    if (!task) return fail("任务不存在", 404);

    const userId = await getCurrentUserId();
    const completedAttempt = userId
      ? await prisma.taskAttempt.findFirst({
          where: { userId, taskId: id, isFirstCorrect: true },
        })
      : null;

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
      isAiGenerated: task.isAiGenerated,
      career: task.career,
      completed: !!completedAttempt,
      // 仅在已完成时返回解析; 答案永不返回
      explanation: completedAttempt ? task.explanation : undefined,
    });
  }, req);
}
