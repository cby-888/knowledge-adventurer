"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { Badge, Spinner, ErrorBox } from "@/components/ui";

interface Achievement {
  slug: string;
  name: string;
  description: string;
  emoji: string;
  conditionType: string;
  conditionValue: number;
  xpReward: number;
  goldReward: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

interface Stats {
  tasksCompleted: number;
  streakDays: number;
  level: number;
  careerCount: number;
  aiTasksCompleted: number;
  bugFixesCompleted: number;
  chatCount: number;
  investProfit: number;
}

const CONDITION_LABEL: Record<string, string> = {
  task_count: "完成任务",
  streak_days: "连续学习天数",
  level_reach: "达到等级",
  career_count: "解锁职业数",
  ai_task_count: "完成 AI 任务",
  bug_fix_count: "修复 Bug",
  chat_count: "AI 对话次数",
  invest_profit: "投资盈利 %",
};

function progressOf(a: Achievement, s: Stats): number {
  const map: Record<string, number> = {
    task_count: s.tasksCompleted,
    streak_days: s.streakDays,
    level_reach: s.level,
    career_count: s.careerCount,
    ai_task_count: s.aiTasksCompleted,
    bug_fix_count: s.bugFixesCompleted,
    chat_count: s.chatCount,
    invest_profit: s.investProfit,
  };
  return map[a.conditionType] ?? 0;
}

export default function AchievementsPage() {
  const [data, setData] = useState<{
    stats: Stats;
    achievements: Achievement[];
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ stats: Stats; achievements: Achievement[] }>("/api/achievements")
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Spinner />;

  const unlockedCount = data.achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">🏅 成就</h1>
        <p className="mt-2 text-slate-400">
          已解锁 {unlockedCount} / {data.achievements.length} 个成就
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.achievements.map((a) => {
          const prog = progressOf(a, data.stats);
          const pct = Math.min(100, Math.round((prog / a.conditionValue) * 100));
          return (
            <div
              key={a.slug}
              className={`panel ${a.unlocked ? "" : "opacity-70"}`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-4xl ${a.unlocked ? "" : "grayscale"}`}>
                  {a.unlocked ? a.emoji : "🔒"}
                </span>
                <div className="flex-1">
                  <div className="font-bold text-white">{a.name}</div>
                  <div className="text-xs text-slate-400">{a.description}</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>
                    {CONDITION_LABEL[a.conditionType] ?? a.conditionType}{" "}
                    {Math.min(prog, a.conditionValue)}/{a.conditionValue}
                  </span>
                  <span className="text-neon-gold">
                    +{a.xpReward} XP +{a.goldReward}🪙
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${
                      a.unlocked ? "bg-neon-green" : "bg-neon"
                    }`}
                    style={{ width: `${a.unlocked ? 100 : pct}%` }}
                  />
                </div>
              </div>
              {a.unlocked && (
                <div className="mt-2">
                  <Badge color="green">✅ 已解锁</Badge>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
