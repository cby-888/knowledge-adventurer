import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  signToken,
  authCookieOptions,
  AUTH_COOKIE,
} from "@/lib/auth";
import { ok, fail, readJson, parse, handle } from "@/lib/api";

const schema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(1, "请输入密码"),
});

export async function POST(req: Request) {
  return handle(async () => {
    const body = await readJson(req);
    const parsed = parse(schema, body);
    if (!parsed.success) return fail(parsed.error, 422);

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return fail("邮箱或密码错误", 401);

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return fail("邮箱或密码错误", 401);

    const token = await signToken(user.id);
    const res = ok({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        level: user.level,
      },
    });
    res.cookies.set(AUTH_COOKIE, token, authCookieOptions());
    return res;
  }, req);
}
