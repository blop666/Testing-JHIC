"use client";

import { useEffect, useState } from "react";
import { BarChart3, Eye, FileCheck2, Files } from "lucide-react";

import { ResourcePage, StatusBadge } from "@/components/admin/resource-page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Analytics = { total: number; published: number; drafts: number; views: number; activity: number[] };

const typeLabel: Record<string, string> = { berita: "Berita", pengumuman: "Pengumuman", prestasi: "Prestasi", agenda: "Agenda" };
const typeBadge: Record<string, string> = { berita: "border-blue-200 bg-blue-50 text-blue-700", pengumuman: "border-violet-200 bg-violet-50 text-violet-700", prestasi: "border-emerald-200 bg-emerald-50 text-emerald-700", agenda: "border-amber-200 bg-amber-50 text-amber-700" };

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${30 - (value / max) * 26}`).join(" ");
  return <svg viewBox="0 0 100 32" className="h-12 w-full" preserveAspectRatio="none" aria-label="Aktivitas konten 14 hari terakhir" role="img"><defs><linearGradient id="content-chart" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#2563eb" stopOpacity=".25" /><stop offset="1" stopColor="#2563eb" stopOpacity="0" /></linearGradient></defs><polygon points={`0,32 ${points} 100,32`} fill="url(#content-chart)" /><polyline points={points} fill="none" stroke="#2563eb" strokeWidth="1.8" vectorEffect="non-scaling-stroke" /></svg>;
}

function ContentAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/posts/analytics");
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error?.message ?? "Analytics gagal dimuat.");
        if (!cancelled) setData(result.data);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Analytics gagal dimuat.");
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);
  if (error) return <p className="text-sm text-red-700" role="alert">{error}</p>;
  if (!data) return <Skeleton className="h-48 w-full rounded-xl" />;
  const stats = [["Total konten", data.total, Files], ["Sudah terbit", data.published, FileCheck2], ["Draft", data.drafts, BarChart3], ["Total views", data.views, Eye]] as const;
  return <Card><CardHeader className="border-b"><CardTitle>Analytics konten</CardTitle><p className="text-xs text-slate-500">Ringkasan konten dan aktivitas 14 hari terakhir.</p></CardHeader><CardContent className="grid gap-0 p-0 md:grid-cols-[1.35fr_1fr]"><div className="border-b p-5 md:border-r md:border-b-0"><div className="mb-3 flex items-end justify-between"><div><p className="text-xs text-slate-500">Konten baru</p><p className="mt-1 text-2xl font-bold tabular-nums">{data.activity.reduce((sum, value) => sum + value, 0)}</p></div><span className="text-xs font-medium text-[#1D4F98]">14 hari</span></div><Sparkline values={data.activity} /></div><div className="grid grid-cols-2 divide-x divide-y">{stats.map(([label, value, Icon]) => <div key={label} className="p-4"><div className="flex items-center justify-between gap-2"><p className="text-xs text-slate-500">{label}</p><Icon className="size-4 text-[#1D4F98]" /></div><p className="mt-2 text-xl font-bold tabular-nums">{value.toLocaleString("id-ID")}</p></div>)}</div></CardContent></Card>;
}

export default function ContentPage() {
  const [categories, setCategories] = useState<Array<{ slug: string; name: string }>>([]);
  useEffect(() => {
    void fetch("/api/post-categories?limit=100").then((r) => r.json()).then((d) => { if (d.success) setCategories(d.data ?? []); }).catch(() => {});
  }, []);
  return (
    <ResourcePage
      config={{
        title: "Konten",
        description: "Kelola berita, pengumuman, prestasi, dan agenda.",
        resource: "posts",
        createHref: "/admin/konten/baru",
        editPrefix: "/admin/konten",
        columns: ["Konten", "Tipe", "Kategori", "Status"],
        filters: [
          { key: "type", label: "Semua tipe", options: Object.entries(typeLabel).map(([value, label]) => ({ value, label })) },
          { key: "category", label: "Semua kategori", options: categories.map((c) => ({ value: c.slug, label: c.name })) },
        ],
        fields: (item) => [
          <span className="font-semibold">{item.title}</span>,
          <Badge variant="outline" className={typeBadge[item.type ?? ""] ?? ""}>{typeLabel[item.type ?? ""] ?? item.type ?? "Konten"}</Badge>,
          <span className="text-slate-500">{item.category?.name ?? "Tanpa kategori"}</span>,
          <StatusBadge published={item.isPublished} />,
        ],
      }}
    >
      <ContentAnalytics />
    </ResourcePage>
  );
}
