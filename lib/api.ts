import { NextResponse } from "next/server";
import type { ZodType } from "zod";

/** 统一成功响应 */
export function ok(data: unknown, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

/** 统一失败响应 */
export function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/** 安全解析 JSON body */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

/** zod 校验, 失败返回可读错误 */
export function parse<T>(
  schema: ZodType<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  return {
    success: false,
    error: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
  };
}

/** 携带 HTTP 状态码的业务异常 */
export class HttpError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

/** 包装路由处理器: 统一捕获异常, 避免泄露堆栈 */
export async function handle(
  fn: (req: Request, ctx?: unknown) => Promise<NextResponse>,
  req: Request,
  ctx?: unknown,
): Promise<NextResponse> {
  try {
    return await fn(req, ctx);
  } catch (err) {
    if (err instanceof HttpError) {
      return fail(err.message, err.status);
    }
    console.error("[api error]", err);
    return fail("服务器内部错误", 500);
  }
}
