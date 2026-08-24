"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, type Career, type Task, type Skill } from "@/lib/client";
import { useAuth } from "@/components/AuthProvider";
import { Button, Card, Badge, Spinner, ErrorBox } from "@/components/ui";

export default function CareerDetailPage() {
  const params = useParams<{ id: string }>();
  const slug = params.id;
  const { user } = useAuth();

  const [career, setCareer] = useState<Career | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api<Career[]>("/api/careers"),
      api<Task[]>(`/api/tasks?career=${slug}&limit=5`),
      api<Skill[]>(`/api/skills?career=${slug}`),
    ])
      .then(([careers, taskList, skillList]) => {
        const found = careers.find((c) => c.slug === slug);
        if (!found) throw new Error("职业不存在");
        setCareer(found);
        setTasks(taskList);
        setSkills(skillList);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"));
  }, [slug]);

  if (error) return <ErrorBox message={error} />;
  if (!career) return <Spinner />;

  const myCareer = user?.careers.find((c) => c.slug === slug);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center gap-5">
          <div className="text-6xl">{career.emoji}</div>
          <div className="flex-1">
            <h1 className="text-3xl font-black text-white">{career.name}</h1>
            <p className="mt-1 text-slate-300">{career.description}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {career.topics.map((t) => (
                <Badge key={t} color="gray">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          {myCareer && (
            <Badge color={myCareer.isActive ? "gold" : "neon"}>
              已解锁 Lv.{myCareer.level}
            </Badge>
          )}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="panel-title">🌳 技能路线</h2>
            <Link href="/skills" className="text-sm text-neon hover:underline">
              查看技能树 →
            </Link>
          </div>
          <ol className="mt-4 space-y-2">
            {skills.map((s, i) => (
              <li key={s.slug} className="flex items-center gap-3 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                  {i + 1}
                </span>
                <span className={s.unlocked ? "text-white" : "text-slate-400"}>
                  {s.unlocked ? "✅" : "🔒"} {s.name}
                </span>
                {s.unlocked && <Badge color="green">已解锁</Badge>}
              </li>
            ))}
          </ol>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="panel-title">📜 推荐任务</h2>
            <Link
              href={`/tasks?career=${slug}`}
              className="text-sm text-neon hover:underline"
            >
              全部任务 →
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {tasks.map((t) => (
              <Link
                key={t.id}
                href={`/task/${t.id}`}
                className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{t.title}</span>
                  <Badge color={t.completed ? "green" : "neon"}>
                    {t.completed ? "已完成" : `+${t.xp} XP`}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {t.topic} · {t.difficulty}
                </div>
              </Link>
            ))}
            {tasks.length === 0 && (
              <p className="text-sm text-slate-400">暂无任务</p>
            )}
          </div>
        </Card>
      </div>

      <div className="flex gap-3">
        <Link href={`/tasks?career=${slug}`}>
          <Button>开始任务</Button>
        </Link>
        <Link href="/chat">
          <Button variant="ghost">找导师聊聊</Button>
        </Link>
      </div>
    </div>
  );
}
