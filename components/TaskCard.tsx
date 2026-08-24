"use client";

import Link from "next/link";
import { Badge } from "./ui";
import type { Task } from "@/lib/client";

const DIFF_COLOR: Record<string, "neon" | "green" | "gold" | "purple"> = {
  easy: "green",
  medium: "neon",
  hard: "gold",
  expert: "purple",
};

export function TaskCard({ task }: { task: Task }) {
  return (
    <Link
      href={`/task/${task.id}`}
      className="panel block transition hover:-translate-y-0.5 hover:shadow-glow"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-bold text-white">{task.title}</div>
          <div className="mt-1 text-sm text-slate-400">{task.description}</div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm font-semibold text-neon">+{task.xp} XP</div>
          <div className="text-xs text-neon-gold">+{task.gold} 🪙</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge color={DIFF_COLOR[task.difficulty] ?? "gray"}>
          {task.difficulty}
        </Badge>
        <Badge color="gray">{task.topic}</Badge>
        {task.career && (
          <Badge color="purple">
            {task.career.emoji} {task.career.name}
          </Badge>
        )}
        {task.isAiGenerated && <Badge color="neon">🤖 AI 生成</Badge>}
        {task.completed && <Badge color="green">✅ 已完成</Badge>}
      </div>
    </Link>
  );
}
