"use client";

import { useAuth } from "./AuthProvider";
import { levelProgress } from "@/lib/game/xp";
import { ProgressBar } from "./ui";

export function HUD() {
  const { user } = useAuth();
  if (!user) return null;

  const p = levelProgress(user.xp);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div className="rounded-2xl border border-white/10 bg-ink-800/80 p-4">
        <div className="text-xs text-slate-400">等级</div>
        <div className="text-2xl font-bold text-neon">Lv.{p.level}</div>
        <div className="mt-1 text-xs text-slate-400">
          {p.xpIntoLevel}/{p.xpForNext} XP
        </div>
        <div className="mt-2">
          <ProgressBar value={p.xpIntoLevel} max={p.xpForNext} />
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-ink-800/80 p-4">
        <div className="text-xs text-slate-400">金币</div>
        <div className="text-2xl font-bold text-neon-gold">🪙 {user.gold}</div>
        <div className="mt-1 text-xs text-slate-400">累计经验 {user.xp} XP</div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-ink-800/80 p-4">
        <div className="text-xs text-slate-400">生命值</div>
        <div className="text-2xl font-bold text-rose-400">❤️ {user.hp}</div>
        <div className="mt-1 text-xs text-slate-400">已完成 {user.tasksCompleted} 任务</div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-ink-800/80 p-4">
        <div className="text-xs text-slate-400">连续学习</div>
        <div className="text-2xl font-bold text-orange-400">🔥 {user.streakDays} 天</div>
        <div className="mt-1 text-xs text-slate-400">
          学习 {Math.round(user.totalStudyMinutes / 60)} 小时
        </div>
      </div>
    </div>
  );
}
