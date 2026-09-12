"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Save, Send, UploadCloud } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

type Kind = "posts" | "guru" | "sarana-prasarana" | "kerjasama-industri";
const titles = { posts: "Konten", guru: "Guru & Staff", "sarana-prasarana": "Sarana & Prasarana", "kerjasama-industri": "Mitra Industri" } as const;

async function request(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!(init?.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await fetch(url, { ...init, headers, cache: "no-store" });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.error?.message ?? "Permintaan gagal.");
  return result.data;
}

export function EditorPage({ kind, id }: { kind: Kind; id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, unknown>>({ isPublished: false, sortOrder: 0, type: "berita", presentationSlot: "standard", galleryUrls: [] });
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) void request(`/api/${kind}/${id}`).then(setForm).catch((cause) => setError(cause instanceof Error ? cause.message : "Data gagal dimuat."));
    const categoryResource = kind === "posts" ? "post-categories" : kind === "guru" ? "guru-categories" : null;
    if (categoryResource) void request(`/api/${categoryResource}?limit=50`).then(setCategories).catch((cause) => setError(cause instanceof Error ? cause.message : "Kategori gagal dimuat."));
  }, [id, kind]);

  const set = (key: string, value: unknown) => setForm((previous) => ({ ...previous, [key]: value }));
  const field = (key: string, label: string, multiline = false, required = false) => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}{required ? " *" : ""}</Label>
      {multiline ? <Textarea id={key} value={String(form[key] ?? "")} onChange={(event) => set(key, event.target.value)} /> : <Input id={key} value={String(form[key] ?? "")} onChange={(event) => set(key, event.target.value)} />}
    </div>
  );

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      const result = await request("/api/uploads", { method: "POST", body });
      set(kind === "kerjasama-industri" ? "logoUrl" : "imageUrl", result.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload gagal.");
    } finally {
      setUploading(false);
    }
  }

  async function save(mode: "draft" | "publish") {
    setPending(true);
    setError("");
    try {
      const type = String(form.type ?? "berita");
      const payload = { ...form, isPublished: mode === "publish", publishedAt: mode === "publish" ? new Date().toISOString() : null, body: type === "prestasi" ? null : form.body };
      await request(id ? `/api/${kind}/${id}` : `/api/${kind}`, { method: id ? "PUT" : "POST", body: JSON.stringify(payload) });
      router.replace(`/admin/${kind === "posts" ? "konten" : kind}`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Perubahan gagal.");
    } finally {
      setPending(false);
    }
  }

  if (kind === "posts") {
    const type = String(form.type ?? "berita");
    const imageUrl = typeof form.imageUrl === "string" ? form.imageUrl : "";
    return <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-semibold text-slate-400">Admin / Konten</p><h1 className="mt-1 text-2xl font-bold">{id ? "Edit konten" : "Buat konten"}</h1></div><div className="flex gap-2"><Button variant="outline" onClick={() => void save("draft")} disabled={pending}><Save />Simpan draft</Button><Button onClick={() => void save("publish")} disabled={pending} className="bg-[#1D4F98] hover:bg-[#0B3477]">{pending ? <LoaderCircle className="animate-spin" /> : <Send />}Terbitkan</Button></div></div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <Card><CardHeader><CardTitle>Informasi konten</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>Tipe</Label><NativeSelect value={type} onChange={(event) => set("type", event.target.value)}><NativeSelectOption value="berita">Berita</NativeSelectOption><NativeSelectOption value="pengumuman">Pengumuman</NativeSelectOption><NativeSelectOption value="prestasi">Prestasi</NativeSelectOption><NativeSelectOption value="agenda">Agenda</NativeSelectOption></NativeSelect></div>
        <div className="space-y-2"><Label>Kategori</Label><NativeSelect value={String(form.categoryId ?? "")} onChange={(event) => set("categoryId", event.target.value ? Number(event.target.value) : null)}><NativeSelectOption value="">Tanpa kategori</NativeSelectOption>{categories.map((category) => <NativeSelectOption key={category.id} value={String(category.id)}>{category.name}</NativeSelectOption>)}</NativeSelect></div>
        {field("title", "Judul", false, true)}{field("slug", "Slug URL", false, true)}{field("excerpt", type === "prestasi" ? "Ringkasan prestasi" : "Ringkasan", true, type === "prestasi")}
        {type === "agenda" && field("eventDate", "Tanggal agenda", false, true)}
      </CardContent></Card>
      <Card><CardHeader><CardTitle>{type === "prestasi" ? "Media prestasi" : "Isi konten"}</CardTitle></CardHeader><CardContent className="space-y-4">{type !== "prestasi" && field("body", "Isi artikel", true)}<label className="grid min-h-28 cursor-pointer place-items-center rounded-lg border border-dashed p-4"><UploadCloud /><span className="text-sm">{uploading ? "Mengunggah..." : "Upload gambar"}</span><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={upload} /></label>{imageUrl && <Image src={imageUrl} alt="Preview" width={600} height={240} className="h-32 w-full rounded-lg object-cover" />}</CardContent></Card>
    </div>;
  }

  return <div className="mx-auto max-w-4xl space-y-5"><h1 className="text-2xl font-bold">{id ? `Edit ${titles[kind]}` : `Tambah ${titles[kind]}`}</h1>{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}<Card><CardContent className="space-y-4 p-6">{field(kind === "guru" || kind === "kerjasama-industri" ? "name" : "title", "Nama / Judul", false, true)}{kind === "guru" && <><div className="space-y-2"><Label htmlFor="position">Jabatan</Label><Input id="position" value={String(form.position ?? "")} onChange={(event) => set("position", event.target.value)} placeholder="Contoh: Guru Produktif" /></div><div className="space-y-2"><Label htmlFor="categoryId">Kategori</Label><NativeSelect id="categoryId" value={String(form.categoryId ?? "")} onChange={(event) => set("categoryId", event.target.value ? Number(event.target.value) : null)}><NativeSelectOption value="">Tanpa kategori</NativeSelectOption>{categories.map((category) => <NativeSelectOption key={category.id} value={String(category.id)}>{category.name}</NativeSelectOption>)}</NativeSelect></div></>}{field(kind === "guru" ? "bio" : "description", "Deskripsi", true)}<label className="grid min-h-28 cursor-pointer place-items-center rounded-lg border border-dashed p-4"><UploadCloud /><span className="text-sm">{uploading ? "Mengunggah..." : "Upload gambar"}</span><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={upload} /></label><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => router.back()}>Batal</Button><Button onClick={() => void save("publish")}>Simpan</Button></div></CardContent></Card></div>;
}
