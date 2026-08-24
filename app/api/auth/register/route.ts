import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  signToken,
  authCookieOptions,
  AUTH_COOKIE,
} from "@/lib/auth";
import { ok, fail, readJson, parse, handle } from "@/lib/api";

const schema = z.object({
  username: z
    .string()
    .min(2, "用户名至少 2 个字符")
    .max(30, "用户名最多 30 个字符")
    .regex(
      /^[\w\u4e00-\u9fa5-]+$/,
      "用户名只能包含中英文、数字、下划线和连字符",
    ),
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(6, "密码至少 6 位").max(100, "密码过长"),
});

export async function POST(req: Request) {
  return handle(async () => {
    const body = await readJson(req);
    const parsed = parse(schema, body);
    if (!parsed.success) return fail(parsed.error, 422);

    const { username, email, password } = parsed.data;

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (exists) return fail("用户名或邮箱已被使用", 409);

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username, email, passwordHash },
    });

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
