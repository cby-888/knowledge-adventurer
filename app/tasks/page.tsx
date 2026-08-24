"use client";

import { useEffect, useMemo, useState } from "react";
import { api, type Career, type Task } from "@/lib/client";
import { TaskCard } from "@/components/TaskCard";
import { Spinner, ErrorBox } from "@/components/ui";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [careers, setCareers] = useState<Career[]>([]);
  const [career, setCareer] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // 读取 ?career=slug
    const sp = new URLSearchParams(window.location.search);
    const initialCareer = sp.get("career") ?? "";
    setCareer(initialCareer);

    Promise.all([api<Task[]>("/api/tasks?limit=50"), api<Career[]>("/api/careers")])
      .then(([t, c]) => {
        setTasks(t);
        setCareers(c);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"));
  }, []);

  const filtered = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(
      (t) =>
        (!career || t.career?.slug === career) &&
        (!difficulty || t.difficulty === difficulty),
    );
  }, [tasks, career, difficulty]);

  if (error && !tasks) return <ErrorBox message={error} />;
  if (!tasks) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">📜 任务中心</h1>
        <p className="mt-2 text-slate-400">
          完成任务获得 XP 与金币，答对还能解锁成就
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={career}
          onChange={(e) => setCareer(e.target.value)}
          className="rounded-xl border border-white/15 bg-ink-800 px-3 py-2 text-sm text-slate-200"
        >
          <option value="">全部职业</option>
          {careers.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-xl border border-white/15 bg-ink-800 px-3 py-2 text-sm text-slate-200"
        >
          <option value="">全部难度</option>
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
          <option value="expert">专家</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {filtered.map((t) => (
          <TaskCard key={t.id} task={t} />
        ))}
        {filtered.length === 0 && (
          <p className="text-slate-400">没有符合条件的任务</p>
        )}
      </div>
    </div>
  );
}
