import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { ok, fail, readJson, parse, handle, HttpError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { chatWithNPC, isConfigured } from "@/services/deepseek";
import type { ChatMessage } from "@/services/deepseek";

const schema = z.object({
  npcId: z.string().min(1),
  message: z.string().min(1).max(2000),
  conversationId: z.string().optional(),
});

export async function POST(req: Request) {
  return handle(async () => {
    const userId = await getCurrentUserId();
    if (!userId) return fail("未登录", 401);

    const rl = rateLimit(`chat:${userId}`, 20, 60_000);
    if (!rl.allowed) return fail("对话过于频繁，请稍后再试", 429);

    if (!isConfigured()) {
      throw new HttpError("DeepSeek API 未配置，请在 .env 设置 DEEPSEEK_API_KEY", 503);
    }

    const body = await readJson(req);
    const parsed = parse(schema, body);
    if (!parsed.success) return fail(parsed.error, 422);

    const npc = await prisma.nPC.findUnique({ where: { id: parsed.data.npcId } });
    if (!npc) return fail("NPC 不存在", 404);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    // 复用或新建会话
    let conversation;
    if (parsed.data.conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: { id: parsed.data.conversationId, userId },
      });
      if (!conversation) return fail("会话不存在", 404);
    } else {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          npcId: npc.id,
          careerId: npc.careerId,
          title: `${npc.emoji} ${npc.name}`,
        },
      });
    }

    // 历史消息(不含本次)
    const history = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const historyForPrompt: ChatMessage[] = history.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    // 保存用户消息
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: parsed.data.message,
      },
    });

    const reply = await chatWithNPC({
      npc: {
        name: npc.name,
        emoji: npc.emoji,
        title: npc.title,
        systemPrompt: npc.systemPrompt,
      },
      playerLevel: user.level,
      careerName: npc.careerId
        ? ((await prisma.career.findUnique({ where: { id: npc.careerId } }))
            ?.name ?? undefined)
        : undefined,
      history: historyForPrompt,
      userMessage: parsed.data.message,
    });

    // 保存助手消息
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: reply,
      },
    });

    // 对话也计入学习时长(用于成就/统计)
    await prisma.user.update({
      where: { id: userId },
      data: { totalStudyMinutes: { increment: 1 } },
    });

    return ok({ conversationId: conversation.id, reply });
  }, req);
}
