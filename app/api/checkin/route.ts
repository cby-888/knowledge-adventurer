import { getCurrentUserId } from "@/lib/auth";
import { ok, fail, handle } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { performCheckIn } from "@/server/checkin";

export async function POST(req: Request) {
  return handle(async () => {
    const userId = await getCurrentUserId();
    if (!userId) return fail("未登录", 401);

    const rl = rateLimit(`checkin:${userId}`, 5, 60_000);
    if (!rl.allowed) return fail("操作过于频繁", 429);

    const result = await performCheckIn(userId);
    return ok(result);
  }, req);
}
