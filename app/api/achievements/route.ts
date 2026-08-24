import { getCurrentUserId } from "@/lib/auth";
import { ok, fail, handle } from "@/lib/api";
import { getAchievements } from "@/server/achievements";

export async function GET(req: Request) {
  return handle(async () => {
    const userId = await getCurrentUserId();
    if (!userId) return fail("未登录", 401);
    return ok(await getAchievements(userId));
  }, req);
}
