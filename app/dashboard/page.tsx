"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { HUD } from "@/components/HUD";
import { api } from "@/lib/client";
import { Button, Card, Badge } from "@/components/ui";

interface CheckInResult {
  alreadyCheckedIn: boolean;
  streak: number;
  xpAwarded: number;
  goldAwarded: number;
  milestone: { label: string } | null;
  newLevel: number;
  leveledUp: boolean;
  newlyUnlockedAchievements: { name: string; emoji: string }[];
}

export default function DashboardPage() {
  const { user, refresh } = useAuth();
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);

  async function doCheckin() {
    setChecking(true);
    setMessage("");
    try {
      const r = await api<CheckInResult>("/api/checkin", { method: "POST" });
      setResult(r);
      setMessage(
        r.alreadyCheckedIn
          ? "今天已经签到过啦，明天再来吧！"
          : `签到成功！+${r.xpAwarded} XP +${r.goldAwarded} 金币`,
      );
      await refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "签到失败");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">🏰 玩家大厅</h1>
        <span className="text-sm text-slate-400">
          {user?.avatar} {user?.username}
        </span>
      </div>

      <HUD />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="panel-title">📅 每日签到</h2>
          <p className="mt-1 text-sm text-slate-400">
            每天签到 +20 XP +10 金币，连续签到有额外奖励
          </p>
          <Button onClick={doCheckin} disabled={checking} className="mt-4 w-full">
            {checking ? "签到中…" : "今日签到"}
          </Button>
          {message && (
            <p className="mt-3 text-sm text-neon-green">{message}</p>
          )}
          {result?.milestone && (
            <p className="mt-2 text-sm text-neon-gold">
              🎉 达成里程碑「{result.milestone.label}」！
            </p>
          )}
          {result?.leveledUp && (
            <p className="mt-2 text-sm text-neon-purple">
              ⬆️ 升级到 Lv.{result.newLevel}！
            </p>
          )}
          {result?.newlyUnlockedAchievements.length ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {result.newlyUnlockedAchievements.map((a) => (
                <Badge key={a.name} color="gold">
                  {a.emoji} {a.name}
                </Badge>
              ))}
            </div>
          ) : null}
        </Card>

        <Card>
          <h2 className="panel-title">⚔️ 快捷入口</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { href: "/map", label: "🗺️ 世界地图" },
              { href: "/tasks", label: "📜 任务中心" },
              { href: "/skills", label: "🌳 技能树" },
              { href: "/chat", label: "🧙 AI 导师" },
              { href: "/achievements", label: "🏅 成就" },
              { href: "/leaderboard", label: "🏆 排行榜" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-slate-200 transition hover:bg-white/10"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {user && user.careers.length > 0 && (
        <Card>
          <h2 className="panel-title">🎖️ 我的职业</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {user.careers.map((c) => (
              <Link
                key={c.slug}
                href={`/career/${c.slug}`}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
              >
                <span className="text-2xl">{c.emoji}</span>
                <div>
                  <div className="font-semibold text-white">{c.name}</div>
                  <div className="text-xs text-slate-400">Lv.{c.level}</div>
                </div>
                {c.isActive && <Badge color="neon">当前</Badge>}
              </Link>
            ))}
          </div>
        </Card>
      )}

      {user && user.achievements.length > 0 && (
        <Card>
          <h2 className="panel-title">🏅 已解锁成就</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {user.achievements.slice(0, 12).map((a) => (
              <Badge key={a.slug} color="gold">
                {a.emoji} {a.name}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
