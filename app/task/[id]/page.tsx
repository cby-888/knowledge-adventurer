"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, type Task } from "@/lib/client";
import { useAuth } from "@/components/AuthProvider";
import { Button, Card, Badge, Spinner, ErrorBox } from "@/components/ui";

interface SubmitResult {
  correct: boolean;
  score: number;
  feedback: string;
  explanation: string;
  xpAwarded: number;
  goldAwarded: number;
  isFirstCorrect: boolean;
  alreadyCompleted: boolean;
  newLevel: number;
  leveledUp: boolean;
  newlyUnlockedAchievements: { name: string; emoji: string }[];
}

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { refresh } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [hint, setHint] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<Task>(`/api/tasks/${id}`)
      .then(setTask)
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"));
  }, [id]);

  async function submit() {
    if (!answer.trim()) {
      setError("请先作答");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const r = await api<SubmitResult>(`/api/tasks/${id}/submit`, {
        method: "POST",
        body: JSON.stringify({ answer }),
      });
      setResult(r);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败");
    } finally {
      setLoading(false);
    }
  }

  async function askHint() {
    setError("");
    try {
      const r = await api<{ hint: string }>("/api/ai/hint", {
        method: "POST",
        body: JSON.stringify({ taskId: id }),
      });
      setHint(r.hint);
    } catch (e) {
      setError(e instanceof Error ? e.message : "获取提示失败");
    }
  }

  if (error && !task) return <ErrorBox message={error} />;
  if (!task) return <Spinner />;

  return (
    <div className="space-y-4">
      <div>
        <Link href="/tasks" className="text-sm text-neon hover:underline">
          ← 返回任务中心
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">{task.title}</h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {task.career && (
            <Badge color="purple">
              {task.career.emoji} {task.career.name}
            </Badge>
          )}
          <Badge color="neon">{task.difficulty}</Badge>
          <Badge color="gray">{task.topic}</Badge>
          <Badge color="gold">+{task.xp} XP</Badge>
          {task.completed && <Badge color="green">✅ 已完成</Badge>}
        </div>
      </div>

      <Card>
        <p className="whitespace-pre-wrap text-slate-200">{task.question}</p>

        {task.type === "quiz" && task.options ? (
          <div className="mt-4 space-y-2">
            {task.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setAnswer(opt)}
                className={`block w-full rounded-xl border px-4 py-3 text-left transition ${
                  answer === opt
                    ? "border-neon bg-neon/15 text-white"
                    : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            placeholder="在这里输入你的答案…"
            className="mt-4 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-slate-100 outline-none focus:border-neon"
          />
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={submit} disabled={loading || result?.isFirstCorrect}>
            {loading ? "提交中…" : result?.isFirstCorrect ? "已完成" : "提交答案"}
          </Button>
          <Button variant="ghost" onClick={askHint}>
            💡 获取提示
          </Button>
        </div>
        {error && <div className="mt-3"><ErrorBox message={error} /></div>}
        {hint && (
          <p className="mt-3 rounded-xl border border-neon/30 bg-neon/10 px-4 py-3 text-sm text-cyan-200">
            💡 {hint}
          </p>
        )}
      </Card>

      {result && (
        <Card
          className={
            result.correct ? "border-neon-green/40" : "border-rose-500/40"
          }
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{result.correct ? "✅" : "❌"}</span>
            <div>
              <div className="text-lg font-bold text-white">
                {result.correct ? "回答正确！" : "还需努力"}（{result.score} 分）
              </div>
              {result.isFirstCorrect ? (
                <div className="text-sm text-neon-green">
                  +{result.xpAwarded} XP +{result.goldAwarded} 🪙
                  {result.leveledUp && ` · ⬆️ 升级到 Lv.${result.newLevel}`}
                </div>
              ) : result.alreadyCompleted ? (
                <div className="text-sm text-slate-400">重复作答，不再发放奖励</div>
              ) : (
                <div className="text-sm text-slate-400">未达到及格线，暂无奖励</div>
              )}
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-300">{result.feedback}</p>
          {result.explanation && (
            <div className="mt-3 rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-300">
              <span className="font-semibold text-neon">📖 解析：</span>
              {result.explanation}
            </div>
          )}
          {result.newlyUnlockedAchievements.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {result.newlyUnlockedAchievements.map((a) => (
                <Badge key={a.name} color="gold">
                  🏅 {a.emoji} {a.name}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
