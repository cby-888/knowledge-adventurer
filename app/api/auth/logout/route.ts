import { ok, handle } from "@/lib/api";
import { AUTH_COOKIE, authCookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  return handle(async () => {
    const res = ok({ loggedOut: true });
    res.cookies.set(AUTH_COOKIE, "", { ...authCookieOptions(), maxAge: 0 });
    return res;
  }, req);
}
