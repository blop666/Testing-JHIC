"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Save, Send, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { apiErrorMessage } from "@/lib/api-response";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type Kind = "posts" | "guru" | "sarana-prasarana" | "kerjasama-industri";
const titles = { posts: "Konten", guru: "Guru & Staff", "sarana-prasarana": "Sarana & Prasarana", "kerjasama-industri": "Mitra Industri" } as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 240);
}

async function request(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!(init?.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await fetch(url, { ...init, headers, cache: "no-store" });
  const text = await response.text();
  let result: { success?: boolean; data?: any; error?: { message?: string } } = {};
  try { result = JSON.parse(text); } catch { /* non-JSON response */ }
  if (!response.ok || !result.success) throw new Error(apiErrorMessage(result.error, "Permintaan gagal."));
  return result.data;
}

async function requestWithRetry(url: string, init?: RequestInit, attempts = 2) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await request(url, init);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
  throw lastError;
}

export function EditorPage({ kind, id }: { kind: Kind; id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, unknown>>({ isPublished: false, sortOrder: 0, type: "berita", presentationSlot: "standard", galleryUrls: [] });
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) void requestWithRetry(`/api/${kind}/${id}`).then(setForm).catch((cause) => setError(cause instanceof Error ? cause.message : "Data gagal dimuat."));
    const categoryResource = kind === "posts" ? "post-categories" : kind === "guru" ? "guru-categories" : null;
    if (categoryResource) void requestWithRetry(`/api/${categoryResource}?limit=50`).then(setCategories).catch((cause) => setError(cause instanceof Error ? cause.message : "Kategori gagal dimuat."));
  }, [id, kind]);

  const set = (key: string, value: unknown) => setForm((previous) => ({ ...previous, [key]: value }));
  const setTitle = (value: string) => {
    setForm((previous) => {
      const type = String(previous.type ?? "berita");
      const autoSlug = type === "berita" && !previous.slug;
      return { ...previous, title: value, ...(autoSlug ? { slug: slugify(value) } : {}) };
    });
  };
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
      body.set("category", kind);
      const result = await requestWithRetry("/api/uploads", { method: "POST", body });
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
      const slug = String(form.slug ?? "").trim();
      const payload: Record<string, unknown> = {
        ...form,
        isPublished: mode === "publish",
        publishedAt: mode === "publish" ? new Date().toISOString() : null,
        body: type === "prestasi" ? null : form.body,
        slug: slug ? slug : undefined,
        isPopularOverride: Boolean(form.isPopularOverride),
      };
      if (type !== "agenda") { delete payload.eventDate; delete payload.eventEndDate; delete payload.eventLocation; }
      if (payload.categoryId === "" || payload.categoryId === null) payload.categoryId = null;
      await requestWithRetry(id ? `/api/${kind}/${id}` : `/api/${kind}`, { method: id ? "PUT" : "POST", body: JSON.stringify(payload) });
      toast.success(mode === "publish" ? "Konten diterbitkan." : "Konten disimpan sebagai draft.");
       const adminPath = kind === "posts" ? "konten" : kind === "kerjasama-industri" ? "mitra-industri" : kind;
       router.replace(`/admin/${adminPath}`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Perubahan gagal.");
      toast.error(cause instanceof Error ? cause.message : "Perubahan gagal.");
    } finally {
      setPending(false);
    }
  }

  if (kind === "posts") {
    const type = String(form.type ?? "berita");
    const imageUrl = typeof form.imageUrl === "string" ? form.imageUrl : "";
    const bodyValue = String(form.body ?? "");
    const wrapSelection = (tag: string) => {
      const textarea = document.getElementById("body") as HTMLTextAreaElement | null;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = bodyValue.slice(start, end) || "teks";
      const replacement = `<${tag}>${selected}</${tag}>`;
      const next = bodyValue.slice(0, start) + replacement + bodyValue.slice(end);
      set("body", next);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length + 2, start + tag.length + 2 + selected.length);
      });
    };
    const insertBlock = (tag: string) => {
      const textarea = document.getElementById("body") as HTMLTextAreaElement | null;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = bodyValue.slice(start, end) || "teks";
      const replacement = `<${tag}>${selected}</${tag}>`;
      const next = bodyValue.slice(0, start) + replacement + bodyValue.slice(end);
      set("body", next);
      requestAnimationFrame(() => textarea.focus());
    };
    const toolbarBtn = "rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-[#1D4F98]";
    return <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-semibold text-slate-400">Admin / Konten</p><h1 className="mt-1 text-2xl font-bold">{id ? "Edit konten" : "Buat konten"}</h1></div><div className="flex gap-2"><Button variant="outline" onClick={() => void save("draft")} disabled={pending}><Save />Simpan draft</Button><Button onClick={() => void save("publish")} disabled={pending} className="bg-[#1D4F98] hover:bg-[#0B3477]">{pending ? <LoaderCircle className="animate-spin" /> : <Send />}Terbitkan</Button></div></div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <Card><CardHeader><CardTitle>Informasi konten</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>Tipe</Label><NativeSelect value={type} onChange={(event) => set("type", event.target.value)}><NativeSelectOption value="berita">Berita</NativeSelectOption><NativeSelectOption value="pengumuman">Pengumuman</NativeSelectOption><NativeSelectOption value="prestasi">Prestasi</NativeSelectOption><NativeSelectOption value="agenda">Agenda</NativeSelectOption></NativeSelect></div>
        <div className="space-y-2"><Label>Kategori</Label><NativeSelect value={String(form.categoryId ?? "")} onChange={(event) => set("categoryId", event.target.value ? Number(event.target.value) : null)}><NativeSelectOption value="">Tanpa kategori</NativeSelectOption>{categories.map((category) => <NativeSelectOption key={category.id} value={String(category.id)}>{category.name}</NativeSelectOption>)}</NativeSelect></div>
        <div className="space-y-2 md:col-span-2"><Label htmlFor="title">Judul *</Label><Input id="title" value={String(form.title ?? "")} onChange={(event) => setTitle(event.target.value)} /></div>
        <div className="space-y-2 md:col-span-2"><Label htmlFor="slug">Slug URL{type === "berita" ? " (otomatis)" : ""}</Label><Input id="slug" value={String(form.slug ?? "")} onChange={(event) => set("slug", event.target.value)} placeholder={type === "berita" ? "Terisi otomatis dari judul" : "Contoh: judul-pengumuman"} /></div>
        <div className="space-y-2 md:col-span-2"><Label htmlFor="excerpt">{type === "prestasi" ? "Ringkasan prestasi" : "Ringkasan"}</Label><Textarea id="excerpt" value={String(form.excerpt ?? "")} onChange={(event) => set("excerpt", event.target.value)} /></div>
        {type === "agenda" && <div className="space-y-2 md:col-span-2"><Label htmlFor="eventDate">Tanggal agenda *</Label><Input id="eventDate" type="datetime-local" value={String(form.eventDate ?? "")} onChange={(event) => set("eventDate", event.target.value)} /></div>}
        {type === "agenda" && <div className="space-y-2 md:col-span-2"><Label htmlFor="eventEndDate">Tanggal selesai (opsional)</Label><Input id="eventEndDate" type="datetime-local" value={String(form.eventEndDate ?? "")} onChange={(event) => set("eventEndDate", event.target.value)} /></div>}
        {type === "agenda" && <div className="space-y-2 md:col-span-2"><Label htmlFor="eventLocation">Lokasi (opsional)</Label><Input id="eventLocation" value={String(form.eventLocation ?? "")} onChange={(event) => set("eventLocation", event.target.value)} placeholder="Contoh: Aula Sekolah" /></div>}
        <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
            <div><p className="text-sm font-semibold text-slate-800">Konten Populer</p><p className="text-xs text-slate-500">Prioritaskan di tab Populer.</p></div>
            <Switch checked={Boolean(form.isPopularOverride)} onCheckedChange={(checked) => set("isPopularOverride", checked)} aria-label="Konten populer" />
          </div>
        </div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>{type === "prestasi" ? "Media prestasi" : "Isi konten"}</CardTitle></CardHeader><CardContent className="space-y-4">{type !== "prestasi" && <div className="space-y-2"><Label htmlFor="body">Isi artikel</Label><div className="flex flex-wrap gap-1.5"><button type="button" className={toolbarBtn} onClick={() => wrapSelection("p")}>Paragraf</button><button type="button" className={toolbarBtn} onClick={() => wrapSelection("h2")}>Judul</button><button type="button" className={toolbarBtn} onClick={() => wrapSelection("h3")}>Subjudul</button><button type="button" className={toolbarBtn} onClick={() => wrapSelection("strong")}>Tebal</button><button type="button" className={toolbarBtn} onClick={() => wrapSelection("em")}>Miring</button><button type="button" className={toolbarBtn} onClick={() => wrapSelection("li")}>List item</button><button type="button" className={toolbarBtn} onClick={() => wrapSelection("blockquote")}>Kutipan</button></div><Textarea id="body" value={bodyValue} onChange={(event) => set("body", event.target.value)} rows={10} className="font-mono text-sm" placeholder="<h2>Judul bagian</h2>&#10;<p>Paragraf konten...</p>&#10;<ul><li>Poin pertama</li></ul>" /><div className="rounded-lg border border-slate-200 bg-white p-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Pratinjau</p><div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: bodyValue || "<p class=\"text-slate-400\">Pratinjau konten akan tampil di sini.</p>" }} /></div></div>}<label className="grid min-h-32 cursor-pointer place-items-center rounded-lg border border-dashed p-4 text-center"><UploadCloud className="mx-auto" /><span className="mt-1 text-sm">{uploading ? "Mengunggah..." : "Upload gambar"}</span><span className="text-xs text-slate-400">JPEG, PNG, WebP, atau AVIF · maks. 5 MB</span><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={upload} /></label>{imageUrl && <div className="overflow-hidden rounded-lg border border-slate-200"><Image src={imageUrl} alt="Preview" width={320} height={180} className="h-32 w-auto object-cover" /><p className="truncate bg-slate-50 px-3 py-1.5 text-xs text-slate-500">{imageUrl}</p></div>}</CardContent></Card>
    </div>;
  }

  return <div className="mx-auto max-w-4xl space-y-5"><h1 className="text-2xl font-bold">{id ? `Edit ${titles[kind]}` : `Tambah ${titles[kind]}`}</h1>{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}<Card><CardContent className="space-y-4 p-6">{field(kind === "guru" || kind === "kerjasama-industri" ? "name" : "title", "Nama / Judul", false, true)}{kind === "guru" && <><div className="space-y-2"><Label htmlFor="position">Jabatan</Label><Input id="position" value={String(form.position ?? "")} onChange={(event) => set("position", event.target.value)} placeholder="Contoh: Guru Produktif" /></div><div className="space-y-2"><Label htmlFor="categoryId">Kategori</Label><NativeSelect id="categoryId" value={String(form.categoryId ?? "")} onChange={(event) => set("categoryId", event.target.value ? Number(event.target.value) : null)}><NativeSelectOption value="">Tanpa kategori</NativeSelectOption>{categories.map((category) => <NativeSelectOption key={category.id} value={String(category.id)}>{category.name}</NativeSelectOption>)}</NativeSelect></div></>}{field(kind === "guru" ? "bio" : "description", "Deskripsi", true)}<label className="grid min-h-32 cursor-pointer place-items-center rounded-lg border border-dashed p-4 text-center"><UploadCloud className="mx-auto" /><span className="mt-1 text-sm">{uploading ? "Mengunggah..." : "Upload gambar"}</span><span className="text-xs text-slate-400">JPEG, PNG, WebP, atau AVIF · maks. 5 MB</span><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={upload} /></label>{typeof form.imageUrl === "string" && form.imageUrl && <div className="overflow-hidden rounded-lg border border-slate-200"><Image src={form.imageUrl} alt="Preview" width={320} height={180} className="h-32 w-auto object-cover" /><p className="truncate bg-slate-50 px-3 py-1.5 text-xs text-slate-500">{form.imageUrl}</p></div>}{kind === "kerjasama-industri" && typeof form.logoUrl === "string" && form.logoUrl && <div className="overflow-hidden rounded-lg border border-slate-200"><Image src={form.logoUrl} alt="Preview logo" width={160} height={160} className="h-24 w-auto object-contain" /><p className="truncate bg-slate-50 px-3 py-1.5 text-xs text-slate-500">{form.logoUrl}</p></div>}<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => router.back()}>Batal</Button><Button onClick={() => void save("publish")}>Simpan</Button></div></CardContent></Card></div>;
}
