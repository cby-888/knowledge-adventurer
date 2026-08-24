"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { Spinner, ErrorBox } from "@/components/ui";

interface Entry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  level: number;
  totalXp: number;
  periodXp: number;
  streakDays: number;
  tasksCompleted: number;
}

const TABS = [
  { key: "global", label: "🌍 全球" },
  { key: "weekly", label: "📅 周榜" },
  { key: "monthly", label: "🗓️ 月榜" },
];

export default function LeaderboardPage() {
  const [range, setRange] = useState("global");
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setEntries(null);
    api<Entry[]>(`/api/leaderboard?range=${range}`)
      .then(setEntries)
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"));
  }, [range]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">🏆 排行榜</h1>
        <p className="mt-2 text-slate-400">与全球冒险家一较高下</p>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setRange(t.key)}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
              range === t.key
                ? "border-neon bg-neon/15 text-neon"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <ErrorBox message={error} />}
      {!entries && !error && <Spinner />}

      {entries && (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3">名次</th>
                <th className="px-4 py-3">玩家</th>
                <th className="px-4 py-3 text-right">等级</th>
                <th className="px-4 py-3 text-right">
                  {range === "global" ? "总 XP" : "本期 XP"}
                </th>
                <th className="px-4 py-3 text-right">连续</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.userId} className="border-t border-white/5">
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-300">
                      {e.rank <= 3 ? ["🥇", "🥈", "🥉"][e.rank - 1] : e.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="mr-2">{e.avatar}</span>
                    <span className="font-medium text-white">{e.username}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-neon">
                    Lv.{e.level}
                  </td>
                  <td className="px-4 py-3 text-right text-neon-gold">
                    {e.periodXp}
                  </td>
                  <td className="px-4 py-3 text-right text-orange-400">
                    🔥{e.streakDays}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
