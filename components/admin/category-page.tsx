"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Pencil, RefreshCw, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Category = { id: number; name: string; slug: string; description?: string | null; sortOrder?: number; isActive?: boolean };

const PAGE_SIZE = 15;

export function CategoryPage({ resource, title, description }: { resource: "post-categories" | "guru-categories"; title: string; description: string }) {
  const [items, setItems] = useState<Category[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", sortOrder: 0, isActive: true });

  async function load(targetPage = 1) {
    try {
      const params = new URLSearchParams({ page: String(targetPage), limit: String(PAGE_SIZE) });
      if (query.trim()) params.set("q", query.trim());
      if (status) params.set("status", status);
      const res = await fetch(`/api/${resource}?${params}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message ?? "Data tidak dapat dimuat.");
      setItems(data.data);
      setTotal(data.meta?.total ?? 0);
      setPage(targetPage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Data tidak dapat dimuat.");
    }
  }

  useEffect(() => { void load(1); }, [resource, status]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function start(item?: Category) {
    setEditing(item ?? null);
    setForm(item ? { name: item.name, slug: item.slug, description: item.description ?? "", sortOrder: item.sortOrder ?? 0, isActive: item.isActive ?? true } : { name: "", slug: "", description: "", sortOrder: 0, isActive: true });
    setOpen(true);
  }

  async function save() {
    const response = await fetch(editing ? `/api/${resource}/${editing.id}` : `/api/${resource}`, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const result = await response.json();
    if (!response.ok || !result.success) return setError(result.error?.message ?? "Perubahan gagal.");
    setOpen(false);
    await load(page);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-400">Admin / {title}</p>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>
        <Button className="bg-[#1D4F98] hover:bg-[#0B3477]" onClick={() => start()}><Plus />Tambah kategori</Button>
      </div>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form className="flex w-full gap-2 sm:max-w-sm" onSubmit={(e) => { e.preventDefault(); void load(1); }}>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama atau slug..." className="bg-white" />
          <Button type="submit" variant="outline">Cari</Button>
        </form>
        <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)}>
          <NativeSelectOption value="">Semua status</NativeSelectOption>
          <NativeSelectOption value="published">Aktif</NativeSelectOption>
          <NativeSelectOption value="draft">Nonaktif</NativeSelectOption>
        </NativeSelect>
        <Button variant="outline" onClick={() => void load(page)}><RefreshCw className="size-4" />Refresh</Button>
      </div>

      {items === null ? (
        <Skeleton className="h-64 w-full" />
      ) : items.length === 0 ? (
        <Card><CardContent className="grid min-h-64 place-items-center p-8 text-center"><div><SearchX className="mx-auto size-8 text-slate-400" /><h2 className="mt-3 font-semibold">Belum ada data</h2><p className="mt-1 text-sm text-slate-500">Buat kategori pertama.</p></div></CardContent></Card>
      ) : (
        <Card>
          <CardHeader className="border-b bg-slate-50/70"><CardTitle className="text-sm">{total} kategori</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Nama</TableHead><TableHead>Slug</TableHead><TableHead>Urutan</TableHead><TableHead>Status</TableHead><TableHead className="w-24" /></TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold">{item.name}</TableCell>
                    <TableCell className="text-slate-500">{item.slug}</TableCell>
                    <TableCell>{item.sortOrder ?? 0}</TableCell>
                    <TableCell><Switch checked={item.isActive} onCheckedChange={async (value) => { await fetch(`/api/${resource}/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...item, isActive: value }) }); await load(page); }} /></TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => start(item)} aria-label="Edit kategori"><Pencil /></Button></TableCell>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit kategori" : "Tambah kategori"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label htmlFor="cat-name">Nama</Label><Input id="cat-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="cat-slug">Slug</Label><Input id="cat-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="cat-desc">Deskripsi</Label><Input id="cat-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="cat-sort">Urutan</Label><Input id="cat-sort" type="number" value={String(form.sortOrder)} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={() => void save()}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
