"use client";

import { Button, Badge } from "./ui";
import type { Skill } from "@/lib/client";

export function SkillTree({
  skills,
  userLevel,
  onUnlock,
  unlockingId,
}: {
  skills: Skill[];
  userLevel: number;
  onUnlock: (id: string) => void;
  unlockingId: string | null;
}) {
  const sorted = [...skills].sort((a, b) => a.tier - b.tier);
  const bySlug = new Map(sorted.map((s) => [s.slug, s]));

  return (
    <div className="flex flex-wrap items-stretch gap-2">
      {sorted.map((s, i) => {
        const prereqsMet = s.prerequisites.every(
          (p) => bySlug.get(p)?.unlocked,
        );
        const levelOk = userLevel >= s.levelRequirement;
        const canUnlock = !s.unlocked && levelOk && prereqsMet;

        return (
          <div key={s.id} className="flex items-center gap-2">
            {i > 0 && (
              <span className="text-xl text-slate-600" aria-hidden>
                →
              </span>
            )}
            <div
              className={`w-44 rounded-2xl border p-4 text-center transition ${
                s.unlocked
                  ? "border-neon/40 bg-neon/10"
                  : "border-white/10 bg-ink-800/80"
              }`}
            >
              <div className="text-2xl">
                {s.unlocked ? "✅" : "🔒"}
              </div>
              <div className="mt-1 font-bold text-white">{s.name}</div>
              <div className="mt-1 text-xs text-slate-400">{s.description}</div>
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                <Badge color="gray">Lv.{s.levelRequirement}</Badge>
                <Badge color="gold">+{s.xpReward} XP</Badge>
              </div>
              {!s.unlocked && (
                <Button
                  className="mt-3 w-full"
                  variant={canUnlock ? "primary" : "ghost"}
                  disabled={!canUnlock || unlockingId === s.id}
                  onClick={() => onUnlock(s.id)}
                >
                  {unlockingId === s.id
                    ? "解锁中…"
                    : levelOk
                      ? prereqsMet
                        ? "解锁"
                        : "前置未解锁"
                      : `需 Lv.${s.levelRequirement}`}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
