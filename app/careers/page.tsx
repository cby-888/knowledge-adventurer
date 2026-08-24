"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type Career } from "@/lib/client";
import { useAuth } from "@/components/AuthProvider";
import { Button, Card, Badge, Spinner, ErrorBox } from "@/components/ui";

export default function CareersPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [careers, setCareers] = useState<Career[] | null>(null);
  const [error, setError] = useState("");
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    api<Career[]>("/api/careers")
      .then(setCareers)
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"));
  }, []);

  async function select(slug: string) {
    setSelecting(slug);
    setError("");
    try {
      await api("/api/careers/select", {
        method: "POST",
        body: JSON.stringify({ slug }),
      });
      await refresh();
      router.push(`/career/${slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "选择失败");
    } finally {
      setSelecting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-black text-white">选择你的职业</h1>
        <p className="mt-2 text-slate-400">
          每个职业都有独立的技能树与学习路线，之后可以继续解锁更多职业
        </p>
      </div>

      {error && <ErrorBox message={error} />}
      {!careers && !error && <Spinner />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {careers?.map((c) => (
          <Card key={c.slug} className="flex flex-col">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{c.emoji}</div>
              <div>
                <h2 className="text-xl font-bold text-white">{c.name}</h2>
                <div className="flex flex-wrap gap-1.5">
                  {c.progress ? (
                    <Badge color="green">已解锁 Lv.{c.progress.level}</Badge>
                  ) : (
                    <Badge color="gray">未解锁</Badge>
                  )}
                  <Badge color="neon">{c.skillCount} 技能</Badge>
                  <Badge color="purple">{c.taskCount} 任务</Badge>
                </div>
              </div>
            </div>

            <p className="mt-3 flex-1 text-sm text-slate-300">{c.description}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.topics.slice(0, 6).map((t) => (
                <Badge key={t} color="gray">
                  {t}
                </Badge>
              ))}
              {c.topics.length > 6 && (
                <Badge color="gray">+{c.topics.length - 6}</Badge>
              )}
            </div>

            <Button
              variant={c.progress?.isActive ? "gold" : "primary"}
              className="mt-4 w-full"
              disabled={selecting === c.slug}
              onClick={() => select(c.slug)}
            >
              {c.progress
                ? c.progress.isActive
                  ? "✓ 当前职业"
                  : "切换到此职业"
                : "解锁职业"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
