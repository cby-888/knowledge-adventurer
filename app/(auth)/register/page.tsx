"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/client";
import { useAuth } from "@/components/AuthProvider";
import { Button, Card, ErrorBox } from "@/components/ui";

const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-slate-100 outline-none transition focus:border-neon";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });
      await refresh();
      router.push("/careers");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-md">
      <Card className="!p-8">
        <h1 className="text-2xl font-bold text-white">🧑‍🚀 创建角色</h1>
        <p className="mt-1 text-sm text-slate-400">
          注册后选择职业，开启你的知识冒险
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && <ErrorBox message={error} />}
          <div>
            <label className="mb-1 block text-sm text-slate-300">用户名</label>
            <input
              required
              minLength={2}
              maxLength={30}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputCls}
              placeholder="冒险家昵称"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">邮箱</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">密码</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="至少 6 位"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "创建中…" : "创建角色"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          已有账号？{" "}
          <Link href="/login" className="text-neon hover:underline">
            去登录
          </Link>
        </p>
      </Card>
    </div>
  );
}
