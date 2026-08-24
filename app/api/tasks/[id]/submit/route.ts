import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { ok, fail, readJson, parse, handle, HttpError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { submitTask } from "@/server/tasks";

const schema = z.object({
  answer: z.string().min(1, "答案不能为空").max(4000, "答案过长"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const { id } = await params;
    const userId = await getCurrentUserId();
    if (!userId) return fail("未登录", 401);

    // 限流: 每用户每分钟最多 30 次提交, 防刷
    const rl = rateLimit(`submit:${userId}`, 30, 60_000);
    if (!rl.allowed) return fail("提交过于频繁，请稍后再试", 429);

    const body = await readJson(req);
    const parsed = parse(schema, body);
    if (!parsed.success) return fail(parsed.error, 422);

    try {
      const result = await submitTask(userId, id, parsed.data.answer);
      return ok(result);
    } catch (err) {
      if (err instanceof Error && err.message.includes("DEEPSEEK_API_KEY")) {
        throw new HttpError(err.message, 503);
      }
      if (err instanceof Error && err.message.includes("答案不能为空")) {
        throw new HttpError(err.message, 422);
      }
      throw err;
    }
  }, req);
}
