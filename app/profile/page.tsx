"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/client";
import { Card, Badge, Spinner, ErrorBox } from "@/components/ui";

interface Stats {
  level: number;
  xp: number;
  gold: number;
  hp: number;
  streakDays: number;
  totalStudyMinutes: number;
  tasksCompleted: number;
  aiTasksCompleted: number;
  careerXp: { career: { slug: string; name: string; emoji: string } | null; xp: number }[];
  recent: { activityType: string; xpEarned: number; goldEarned: number; createdAt: string }[];
}

const ACTIVITY_LABEL: Record<string, string> = {
  task_completed: "📜 完成任务",
  ai_task: "🤖 AI 任务",
  chat: "💬 对话",
  checkin: "📅 签到",
  achievement: "🏅 成就",
  skill_unlock: "🌳 解锁技能",
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Stats>("/api/learning/stats")
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"));
  }, []);

  if (!user) return <Spinner />;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center gap-5">
          <div className="text-6xl">{user.avatar}</div>
          <div className="flex-1">
            <h1 className="text-3xl font-black text-white">{user.username}</h1>
            <p className="text-sm text-slate-400">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge color="neon">Lv.{user.level}</Badge>
              <Badge color="gold">🪙 {user.gold}</Badge>
              <Badge color="gray">📅 注册于 {new Date(user.createdAt).toLocaleDateString()}</Badge>
            </div>
          </div>
          <Link
            href="/settings"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
          >
            编辑资料
          </Link>
        </div>
      </Card>

      {error && <ErrorBox message={error} />}
      {!stats && !error && <Spinner />}

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "累计经验", value: `${stats.xp} XP` },
              { label: "完成任务", value: `${stats.tasksCompleted}` },
              { label: "AI 任务", value: `${stats.aiTasksCompleted}` },
              { label: "学习时长", value: `${Math.round(stats.totalStudyMinutes / 60)} 小时` },
            ].map((s) => (
              <div key={s.label} className="panel !p-4 text-center">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="mt-1 text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>

          <Card>
            <h2 className="panel-title">🎖️ 各职业经验分布</h2>
            <div className="mt-4 space-y-2">
              {stats.careerXp.map((c) => (
                <div key={c.career?.slug ?? "x"} className="flex items-center justify-between text-sm">
                  <span className="text-slate-200">
                    {c.career?.emoji} {c.career?.name ?? "未知"}
                  </span>
                  <span className="text-neon-gold">{c.xp} XP</span>
                </div>
              ))}
              {stats.careerXp.length === 0 && (
                <p className="text-sm text-slate-400">还没有职业经验记录</p>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="panel-title">🕐 最近动态</h2>
            <div className="mt-4 space-y-2">
              {stats.recent.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-200">
                    {ACTIVITY_LABEL[r.activityType] ?? r.activityType}
                  </span>
                  <span className="text-slate-400">
                    +{r.xpEarned} XP · {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
              {stats.recent.length === 0 && (
                <p className="text-sm text-slate-400">暂无动态</p>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
