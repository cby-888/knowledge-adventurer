import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { ok, fail, readJson, parse, handle } from "@/lib/api";
import { unlockSkill } from "@/server/skills";

const schema = z.object({ skillId: z.string().min(1) });

export async function POST(req: Request) {
  return handle(async () => {
    const userId = await getCurrentUserId();
    if (!userId) return fail("未登录", 401);

    const body = await readJson(req);
    const parsed = parse(schema, body);
    if (!parsed.success) return fail(parsed.error, 422);

    const result = await unlockSkill(userId, parsed.data.skillId);
    return ok(result);
  }, req);
}
