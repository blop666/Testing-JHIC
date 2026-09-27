"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus, RefreshCw, SearchX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Knowledge = {
  id: number;
  title: string | null;
  contentText: string;
  sourceUrl: string | null;
  sourceFileName: string | null;
  sourceHash: string | null;
  effectiveUntil: string | null;
  verifiedAt: string | null;
  isActive: boolean;
  isPublished: boolean;
  updatedAt: string;
};

async function request(url: string, init?: RequestInit) {
  const response = await fetch(url, { cache: "no-store", ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.error?.message ?? "Permintaan gagal.");
  return result;
}

function StatusBadge({ item }: { item: Knowledge }) {
  if (!item.isActive) return <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-500">Diarsipkan</Badge>;
  if (!item.isPublished) return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Draft</Badge>;
  if (item.effectiveUntil && new Date(item.effectiveUntil) < new Date()) return <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Kedaluwarsa</Badge>;
  return <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">Terbit</Badge>;
}

function shortHash(hash: string | null) {
  return hash ? `${hash.slice(0, 8)}…` : "-";
}

export default function ChatbotKnowledgePage() {
  const router = useRouter();
  const [items, setItems] = useState<Knowledge[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  const PAGE_SIZE = 15;

  async function load(targetPage = 1) {
    setError("");
    setPending(true);
    try {
      const params = new URLSearchParams({ page: String(targetPage), limit: String(PAGE_SIZE) });
      if (status) params.set("status", status);
      if (query) params.set("q", query);
      const result = await request(`/api/chatbot-knowledge?${params}`);
      setItems(result.data);
      setTotal(result.meta?.total ?? 0);
      setPage(targetPage);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Data tidak dapat dimuat.");
    } finally {
      setPending(false);
    }
  }

  useEffect(() => { void load(1); }, [status]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function togglePublish(item: Knowledge) {
    setPending(true);
    try {
      await request(`/api/chatbot-knowledge/${item.id}/publish`, { method: "POST", body: JSON.stringify({ action: item.isPublished ? "unpublish" : "publish" }) });
      await load(page);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Perubahan gagal.");
    } finally {
      setPending(false);
    }
  }

  async function archive(item: Knowledge) {
    if (!window.confirm("Arsipkan knowledge ini? Data tidak dihapus permanen dan tidak akan dipakai chatbot publik.")) return;
    setPending(true);
    try {
      await request(`/api/chatbot-knowledge/${item.id}`, { method: "DELETE" });
      await load(page);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Perubahan gagal.");
    } finally {
      setPending(false);
    }
  }

  const filtered = items ?? [];

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-400">Admin / Knowledge AI</p>
          <h1 className="text-2xl font-bold tracking-[-.03em]">Knowledge AI</h1>
          <p className="mt-2 text-sm text-slate-500">Kelola basis pengetahuan chatbot. Draft tidak dipakai chatbot publik.</p>
        </div>
        <Button onClick={() => router.push("/admin/chatbot-knowledge/baru")} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#1D4F98] px-2.5 text-sm font-medium text-white hover:bg-[#0B3477]"><Plus className="size-4" />Tambah</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form className="flex w-full gap-2" onSubmit={(e) => { e.preventDefault(); void load(1); }}>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari judul atau isi..." className="max-w-sm bg-white" />
          <Button type="submit" variant="outline" disabled={pending}>Cari</Button>
        </form>
        <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)}>
          <NativeSelectOption value="">Semua status</NativeSelectOption>
          <NativeSelectOption value="draft">Draft</NativeSelectOption>
          <NativeSelectOption value="published">Terbit</NativeSelectOption>
          <NativeSelectOption value="archived">Diarsipkan</NativeSelectOption>
        </NativeSelect>
        <Button variant="outline" onClick={() => void load(page)} disabled={pending}><RefreshCw className="size-4" />Refresh</Button>
      </div>

      {error ? (
        <Card><CardContent className="flex items-center justify-between gap-4 p-6"><p className="text-sm text-red-700" role="alert">{error}</p><Button variant="outline" onClick={() => void load(page)}>Coba lagi</Button></CardContent></Card>
      ) : items === null ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : filtered.length === 0 ? (
        <Card><CardContent className="grid min-h-64 place-items-center p-8 text-center"><div><SearchX className="mx-auto size-8 text-slate-400" /><h2 className="mt-3 font-semibold">Belum ada data</h2><p className="mt-1 text-sm text-slate-500">Tambahkan knowledge pertama untuk chatbot sekolah.</p></div></CardContent></Card>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-slate-50/70"><CardTitle className="text-sm font-semibold">{total} data</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Sumber</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Berlaku hingga</TableHead>
                  <TableHead>Diperbarui</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[240px]"><span className="block truncate font-semibold">{item.title || "(tanpa judul)"}</span><span className="block max-w-[240px] truncate text-xs text-slate-400">{item.contentText.slice(0, 80)}</span></TableCell>
                    <TableCell className="text-slate-500">{item.sourceUrl ? "URL" : item.sourceFileName ?? "Manual"}</TableCell>
                    <TableCell className="text-slate-500">{shortHash(item.sourceHash)}</TableCell>
                    <TableCell><StatusBadge item={item} /></TableCell>
                    <TableCell className="text-slate-500">{item.effectiveUntil ? new Date(item.effectiveUntil).toLocaleDateString("id-ID") : "-"}</TableCell>
                    <TableCell className="text-slate-500">{new Date(item.updatedAt).toLocaleDateString("id-ID")}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Buka aksi"><MoreHorizontal className="size-4" /></Button>} />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/admin/chatbot-knowledge/${item.id}`)}>Edit</DropdownMenuItem>
                          {item.isActive && <DropdownMenuItem disabled={pending} onClick={() => void togglePublish(item)}>{item.isPublished ? "Unpublish" : "Publish"}</DropdownMenuItem>}
                          {item.isActive && <DropdownMenuItem disabled={pending} onClick={() => void archive(item)}>Arsipkan</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
                <p className="text-xs text-slate-500">Halaman {page} dari {totalPages}</p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => void load(page - 1)} disabled={page <= 1}><ChevronLeft className="size-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => void load(page + 1)} disabled={page >= totalPages}><ChevronRight className="size-4" /></Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
