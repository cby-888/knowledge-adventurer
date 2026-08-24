"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { WorldMap, type MapArea } from "@/components/WorldMap";
import { Spinner, ErrorBox } from "@/components/ui";

export default function MapPage() {
  const [areas, setAreas] = useState<MapArea[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<MapArea[]>("/api/map")
      .then(setAreas)
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!areas) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-black text-white">🗺️ 世界地图</h1>
        <p className="mt-2 text-slate-400">
          提升等级解锁更多区域，探索属于你的知识世界
        </p>
      </div>
      <WorldMap areas={areas} />
    </div>
  );
}
