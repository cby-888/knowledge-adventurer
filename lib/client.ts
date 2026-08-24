// 前端 API 客户端 —— 统一解析 { ok, data, error } 响应
export interface ApiEnvelope<T> {
  ok: boolean;
  data: T;
  error?: string;
}

export async function api<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...init,
  });
  const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!res.ok || !json || !json.ok) {
    throw new Error(json?.error ?? `请求失败 (${res.status})`);
  }
  return json.data;
}

// ───────────── 类型 ─────────────
export interface PublicUser {
  id: string;
  username: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  gold: number;
  hp: number;
  streakDays: number;
  totalStudyMinutes: number;
  tasksCompleted: number;
  createdAt: string;
  careers: {
    slug: string;
    name: string;
    emoji: string;
    color: string;
    level: number;
    xp: number;
    isActive: boolean;
  }[];
  achievements: { slug: string; name: string; emoji: string; unlockedAt: string }[];
}

export interface Career {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  topics: string[];
  skillCount: number;
  taskCount: number;
  progress: { level: number; xp: number; isActive: boolean } | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  question: string;
  options: string[] | null;
  xp: number;
  gold: number;
  topic: string;
  isAiGenerated: boolean;
  career: { slug: string; name: string; emoji: string } | null;
  completed?: boolean;
  explanation?: string;
}

export interface Skill {
  id: string;
  slug: string;
  name: string;
  description: string;
  tier: number;
  levelRequirement: number;
  xpReward: number;
  prerequisites: string[];
  positionX: number;
  positionY: number;
  career: { slug: string; name: string; emoji: string };
  unlocked: boolean;
}
