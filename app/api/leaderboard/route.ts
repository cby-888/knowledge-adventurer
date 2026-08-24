import { ok, handle } from "@/lib/api";
import { getLeaderboard, type LeaderboardRange } from "@/server/leaderboard";

const VALID = new Set(["global", "weekly", "monthly"]);

export async function GET(req: Request) {
  return handle(async () => {
    const sp = new URL(req.url).searchParams;
    const rangeParam = sp.get("range") ?? "global";
    const range: LeaderboardRange = VALID.has(rangeParam)
      ? (rangeParam as LeaderboardRange)
      : "global";
    const limit = Number(sp.get("limit")) || 50;

    return ok(await getLeaderboard(range, limit));
  }, req);
}
