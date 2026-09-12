"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus, RefreshCw, SearchX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type ResourceItem = { id: number; title?: string; name?: string; type?: string; position?: string | null; isPublished?: boolean; sortOrder?: number; category?: { name?: string } | null; websiteUrl?: string | null; presentationSlot?: string };
export type ResourceConfig = { title: string; description: string; resource: string; createHref: string; editPrefix: string; columns: string[]; fields: (item: ResourceItem) => React.ReactNode[] };

async function request(url: string, init?: RequestInit) {
  const response = await fetch(url, { cache: "no-store", ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.error?.message ?? "Permintaan gagal.");
  return result;
}

export function ResourcePage({ config, children }: { config: ResourceConfig; children?: React.ReactNode }) {
  const router = useRouter();
  const [items, setItems] = useState<ResourceItem[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  async function load() {
    setError("");
    try { setItems((await request(`/api/${config.resource}?page=1&limit=50`)).data); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Data tidak dapat dimuat."); }
  }
  useEffect(() => { void load(); }, [config.resource]);
  const filtered = (items ?? []).filter((item) => (item.title ?? item.name ?? "").toLowerCase().includes(query.toLowerCase()));
  async function deactivate(id: number) {
    setPending(true);
    try { await request(`/api/${config.resource}/${id}`, { method: "DELETE" }); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Perubahan gagal."); }
    finally { setPending(false); }
  }
  return <div className="mx-auto max-w-[1440px] space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-semibold text-slate-400">Admin / {config.title}</p><h1 className="text-2xl font-bold tracking-[-.03em]">{config.title}</h1><p className="mt-2 text-sm text-slate-500">{config.description}</p></div><Link href={config.createHref} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#1D4F98] px-2.5 text-sm font-medium text-white hover:bg-[#0B3477]"><Plus className="size-4" />Tambah</Link></div>
    {children}
    <div className="flex flex-col gap-3 sm:flex-row"><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari di halaman ini..." className="max-w-sm bg-white" /><Button variant="outline" onClick={() => void load()} disabled={pending}><RefreshCw className="size-4" />Refresh</Button></div>
    {error ? <Card><CardContent className="flex items-center justify-between gap-4 p-6"><p className="text-sm text-red-700" role="alert">{error}</p><Button variant="outline" onClick={() => void load()}>Coba lagi</Button></CardContent></Card> : items === null ? <Skeleton className="h-72 w-full rounded-xl" /> : filtered.length === 0 ? <Card><CardContent className="grid min-h-64 place-items-center p-8 text-center"><div><SearchX className="mx-auto size-8 text-slate-400" /><h2 className="mt-3 font-semibold">Belum ada data</h2><p className="mt-1 text-sm text-slate-500">Buat data pertama untuk ditampilkan di situs sekolah.</p></div></CardContent></Card> : <Card className="overflow-hidden"><CardHeader className="border-b bg-slate-50/70"><CardTitle className="text-sm font-semibold">{filtered.length} data</CardTitle></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow>{config.columns.map((column) => <TableHead key={column}>{column}</TableHead>)}<TableHead className="w-16" /></TableRow></TableHeader><TableBody>{filtered.map((item) => <TableRow key={item.id}>{config.fields(item).map((field, index) => <TableCell key={index}>{field}</TableCell>)}<TableCell><DropdownMenu><DropdownMenuTrigger><Button variant="ghost" size="icon" aria-label="Buka aksi"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => router.push(`${config.editPrefix}/${item.id}`)}>Edit</DropdownMenuItem><DropdownMenuItem disabled={pending} onClick={() => void deactivate(item.id)}>Nonaktifkan</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>}
  </div>;
}

export function StatusBadge({ published }: { published?: boolean }) { return <Badge className={published ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-700"} variant="outline">{published ? "Terbit" : "Draft"}</Badge>; }
