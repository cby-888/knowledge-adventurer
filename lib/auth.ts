import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// JWT 密钥 —— 生产环境务必在 .env 中设置强随机值
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "knowledge-adventurer-dev-secret-change-me",
);

const COOKIE_NAME = "ka_token";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 天

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .sign(secret);
}

export async function verifyToken(
  token: string,
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    const sub = payload.sub;
    return typeof sub === "string" ? sub : null;
  } catch {
    return null;
  }
}

/** 从 httpOnly cookie 中读取并校验当前用户 id */
export async function getCurrentUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** 获取当前登录用户(含关联数据), 未登录返回 null */
export async function getCurrentUser() {
  const id = await getCurrentUserId();
  if (!id) return null;
  return prisma.user.findUnique({
    where: { id },
    include: {
      userCareers: { include: { career: true } },
      userAchievements: { include: { achievement: true } },
    },
  });
}

export const AUTH_COOKIE = COOKIE_NAME;

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: TOKEN_TTL_SECONDS,
  };
}
