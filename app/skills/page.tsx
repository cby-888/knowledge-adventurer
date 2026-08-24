"use client";

import { useEffect, useMemo, useState } from "react";
import { api, type Skill } from "@/lib/client";
import { useAuth } from "@/components/AuthProvider";
import { SkillTree } from "@/components/SkillTree";
import { Spinner, ErrorBox, Badge } from "@/components/ui";

export default function SkillsPage() {
  const { user, refresh } = useAuth();
  const [skills, setSkills] = useState<Skill[] | null>(null);
  const [careers, setCareers] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Skill[]>("/api/skills")
      .then((list) => {
        setSkills(list);
        const slugs = Array.from(new Set(list.map((s) => s.career.slug)));
        setCareers(slugs);
        const active = user?.careers.find((c) => c.isActive)?.slug;
        setSelected(active ?? slugs[0] ?? "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"));
  }, [user]);

  const filtered = useMemo(
    () => (skills ?? []).filter((s) => s.career.slug === selected),
    [skills, selected],
  );

  async function unlock(id: string) {
    setUnlockingId(id);
    setError("");
    try {
      const r = await api<{ xpAwarded: number; newLevel: number; leveledUp: boolean }>(
        "/api/skills/unlock",
        { method: "POST", body: JSON.stringify({ skillId: id }) },
      );
      const list = await api<Skill[]>("/api/skills");
      setSkills(list);
      await refresh();
      void r;
    } catch (e) {
      setError(e instanceof Error ? e.message : "解锁失败");
    } finally {
      setUnlockingId(null);
    }
  }

  if (error && !skills) return <ErrorBox message={error} />;
  if (!skills) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">🌳 技能树</h1>
        <p className="mt-2 text-slate-400">
          达到等级要求并解锁前置技能，即可点亮下一个技能节点
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {careers.map((slug) => {
          const info = skills.find((s) => s.career.slug === slug)?.career;
          return (
            <button
              key={slug}
              onClick={() => setSelected(slug)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                selected === slug
                  ? "border-neon bg-neon/15 text-neon"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {info?.emoji} {info?.name}
            </button>
          );
        })}
      </div>

      {error && <ErrorBox message={error} />}

      <div className="overflow-x-auto pb-4">
        <SkillTree
          skills={filtered}
          userLevel={user?.level ?? 1}
          onUnlock={unlock}
          unlockingId={unlockingId}
        />
      </div>

      <div className="text-xs text-slate-500">
        <Badge color="gray">提示</Badge> 解锁技能会获得 XP 奖励，并可能提升等级。
      </div>
    </div>
  );
}
