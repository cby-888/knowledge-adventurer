"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { useAuth } from "@/components/AuthProvider";
import { Button, Card, ErrorBox } from "@/components/ui";

const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-slate-100 outline-none transition focus:border-neon";

const AVATARS = ["🧑‍🚀", "🧙", "🥷", "👩‍💻", "🧑‍🏫", "🦸", "🧝", "🤖"];

export default function SettingsPage() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "🧑‍🚀");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setAvatar(user.avatar);
    }
  }, [user]);

  async function save() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await api("/api/user", {
        method: "PATCH",
        body: JSON.stringify({ username, avatar }),
      });
      await refresh();
      setMessage("✅ 资料已更新");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {
      /* 忽略 */
    }
    await refresh();
    router.push("/");
    router.refresh();
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold text-white">⚙️ 设置</h1>

      <Card className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-300">头像</label>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={`flex h-12 w-12 items-center justify-center rounded-xl border text-2xl transition ${
                  avatar === a
                    ? "border-neon bg-neon/15"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">用户名</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputCls}
          />
        </div>

        {error && <ErrorBox message={error} />}
        {message && <p className="text-sm text-neon-green">{message}</p>}

        <Button onClick={save} disabled={saving} className="w-full">
          {saving ? "保存中…" : "保存修改"}
        </Button>
      </Card>

      <Card>
        <h2 className="panel-title">危险操作</h2>
        <Button variant="danger" onClick={logout} className="mt-3 w-full">
          退出登录
        </Button>
      </Card>
    </div>
  );
}
