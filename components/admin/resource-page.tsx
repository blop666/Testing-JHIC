"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api-response";
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus, RefreshCw, SearchX, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type ResourceItem = { id: number; title?: string; name?: string; type?: string; position?: string | null; isPublished?: boolean; sortOrder?: number; category?: { name?: string } | null; websiteUrl?: string | null; presentationSlot?: string; label?: string; description?: string | null; tefaName?: string | null; jurusan?: { code?: string; name?: string } | null };

export type FilterOption = { value: string; label: string };
export type FilterDef = { key: string; label: string; options: FilterOption[]; placeholder?: string };
export type ResourceConfig = {
  title: string;
  description: string;
  resource: string;
  createHref: string;
  editPrefix: string;
  columns: string[];
  fields: (item: ResourceItem) => React.ReactNode[];
  filters?: FilterDef[];
  statusKey?: "isPublished" | "isActive";
  itemLabel?: (item: ResourceItem) => string;
};

const PAGE_SIZE = 15;

async function request(url: string, init?: RequestInit) {
  const response = await fetch(url, { cache: "no-store", ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(apiErrorMessage(result.error, "Permintaan gagal."));
  return result;
}

function PageControl({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  if (totalPages <= 1) return null;
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let p = start; p <= end; p++) pages.push(p);
  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
      <p className="text-xs text-slate-500">Halaman {page} dari {totalPages}</p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Halaman sebelumnya"><ChevronLeft className="size-4" /></Button>
        {start > 1 && <Button variant="ghost" size="sm" onClick={() => onPage(1)}>1</Button>}
        {start > 2 && <span className="px-1 text-xs text-slate-400">…</span>}
        {pages.map((p) => <Button key={p} size="sm" variant={p === page ? "default" : "ghost"} className={p === page ? "bg-[#1D4F98] hover:bg-[#0B3477]" : ""} onClick={() => onPage(p)}>{p}</Button>)}
        {end < totalPages - 1 && <span className="px-1 text-xs text-slate-400">…</span>}
        {end < totalPages && <Button variant="ghost" size="sm" onClick={() => onPage(totalPages)}>{totalPages}</Button>}
        <Button variant="outline" size="sm" onClick={() => onPage(page + 1)} disabled={page >= totalPages} aria-label="Halaman berikutnya"><ChevronRight className="size-4" /></Button>
      </div>
    </div>
  );
}

export function ResourcePage({ config, children }: { config: ResourceConfig; children?: React.ReactNode }) {
  const router = useRouter();
  const [items, setItems] = useState<ResourceItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ResourceItem | null>(null);

  async function load(targetPage = 1) {
    setError("");
    try {
      const params = new URLSearchParams({ page: String(targetPage), limit: String(PAGE_SIZE) });
      if (query.trim()) params.set("q", query.trim());
      if (status) params.set("status", status);
      for (const filter of config.filters ?? []) {
        const value = filterValues[filter.key];
        if (value) params.set(filter.key, value);
      }
      const result = await request(`/api/${config.resource}?${params}`);
      setItems(result.data);
      setTotal(result.meta?.total ?? 0);
      setPage(targetPage);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Data tidak dapat dimuat.");
    }
  }

  useEffect(() => { void load(1); }, [config.resource, status, filterValues]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function label(item: ResourceItem) {
    return config.itemLabel?.(item) ?? item.title ?? item.name ?? String(item.id);
  }

  async function setPublish(item: ResourceItem, isPublished: boolean) {
    setPending(true);
    try {
      await request(`/api/${config.resource}/${item.id}`, { method: "PATCH", body: JSON.stringify({ isPublished }) });
      toast.success(isPublished ? `"${label(item)}" diterbitkan.` : `"${label(item)}" dinonaktifkan.`);
      await load(page);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Perubahan gagal.");
    } finally {
      setPending(false);
    }
  }

  async function hardDelete() {
    if (!deleteTarget) return;
    setPending(true);
    try {
      await request(`/api/${config.resource}/${deleteTarget.id}`, { method: "DELETE" });
      toast.success(`"${label(deleteTarget)}" dihapus permanen.`);
      setDeleteTarget(null);
      await load(page);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Penghapusan gagal.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-400">Admin / {config.title}</p>
          <h1 className="text-2xl font-bold tracking-[-.03em]">{config.title}</h1>
          <p className="mt-2 text-sm text-slate-500">{config.description}</p>
        </div>
        <Link href={config.createHref} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1D4F98] px-6 text-sm font-semibold text-white hover:bg-[#0B3477]"><Plus className="size-5" />Tambah</Link>
      </div>

      {children}

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <form className="flex w-full gap-2 lg:max-w-sm" onSubmit={(e) => { e.preventDefault(); void load(1); }}>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari..." className="bg-white" />
          <Button type="submit" variant="outline" disabled={pending}>Cari</Button>
        </form>
        <div className="flex flex-wrap items-center gap-2">
          {(config.filters ?? []).map((filter) => (
            <NativeSelect key={filter.key} value={filterValues[filter.key] ?? ""} onChange={(e) => setFilterValues((prev) => ({ ...prev, [filter.key]: e.target.value }))}>
              <NativeSelectOption value="">{filter.label}</NativeSelectOption>
              {filter.options.map((option) => <NativeSelectOption key={option.value} value={option.value}>{option.label}</NativeSelectOption>)}
            </NativeSelect>
          ))}
          <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)}>
            <NativeSelectOption value="">Semua status</NativeSelectOption>
            <NativeSelectOption value="published">Terbit</NativeSelectOption>
            <NativeSelectOption value="draft">Draft</NativeSelectOption>
          </NativeSelect>
          <Button variant="outline" onClick={() => void load(page)} disabled={pending}><RefreshCw className="size-4" />Refresh</Button>
        </div>
      </div>

      {error ? (
        <Card><CardContent className="flex items-center justify-between gap-4 p-6"><p className="text-sm text-red-700" role="alert">{error}</p><Button variant="outline" onClick={() => void load(page)}>Coba lagi</Button></CardContent></Card>
      ) : items === null ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : items.length === 0 ? (
        <Card><CardContent className="grid min-h-64 place-items-center p-8 text-center"><div><SearchX className="mx-auto size-8 text-slate-400" /><h2 className="mt-3 font-semibold">Belum ada data</h2><p className="mt-1 text-sm text-slate-500">Buat data pertama untuk ditampilkan di situs sekolah.</p></div></CardContent></Card>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-slate-50/70"><CardTitle className="text-sm font-semibold">{total} data</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {config.columns.map((column) => <TableHead key={column}>{column}</TableHead>)}
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    {config.fields(item).map((field, index) => <TableCell key={index}>{field}</TableCell>)}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Buka aksi"><MoreHorizontal className="size-4" /></Button>} />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`${config.editPrefix}/${item.id}`)}>Edit</DropdownMenuItem>
                          {item.isPublished
                            ? <DropdownMenuItem disabled={pending} onClick={() => void setPublish(item, false)}>Nonaktifkan</DropdownMenuItem>
                            : <DropdownMenuItem disabled={pending} onClick={() => void setPublish(item, true)}>Aktifkan</DropdownMenuItem>}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" disabled={pending} onClick={() => setDeleteTarget(item)}><Trash2 className="size-4" />Hapus permanen</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <PageControl page={page} totalPages={totalPages} onPage={(p) => void load(p)} />
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus permanen?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? <>Apakah yakin menghapus <span className="font-semibold text-foreground">{label(deleteTarget)}</span>? Tindakan ini tidak dapat dibatalkan.</> : "Apakah yakin menghapus konten ini? Tindakan ini tidak dapat dibatalkan."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={pending} onClick={() => void hardDelete()}>Ya, hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function StatusBadge({ published }: { published?: boolean }) { return <Badge className={published ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-700"} variant="outline">{published ? "Terbit" : "Draft"}</Badge>; }
