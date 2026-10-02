"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Save, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { apiErrorMessage } from "@/lib/api-response";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

async function request(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!(init?.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await fetch(url, { ...init, headers, cache: "no-store" });
  const text = await response.text();
  let result: { success?: boolean; data?: any; error?: { message?: string } } = {};
  try { result = JSON.parse(text); } catch { /* ignore */ }
  if (!response.ok || !result.success) throw new Error(apiErrorMessage(result.error, "Permintaan gagal."));
  return result.data;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-").slice(0, 240);
}

export function JurusanEditor({ id }: { id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, unknown>>({ isPublished: true, sortOrder: 0, kategori: "IT", kompetensiText: "", fokusText: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState<"logoUrl" | "bgImageUrl" | null>(null);

  useEffect(() => {
    if (!id) return;
    void request(`/api/jurusan/${id}`).then((data) => {
      setForm({
        ...data,
        kategori: data.category,
        kompetensiText: Array.isArray(data.kompetensi) ? data.kompetensi.join("\n") : "",
        fokusText: Array.isArray(data.fokusKeahlian) ? data.fokusKeahlian.map((f: { title: string; icon: string }) => f.title).join("\n") : "",
      });
    }).catch((cause) => setError(cause instanceof Error ? cause.message : "Data gagal dimuat."));
  }, [id]);

  const set = (key: string, value: unknown) => setForm((previous) => ({ ...previous, [key]: value }));

  async function upload(event: ChangeEvent<HTMLInputElement>, field: "logoUrl" | "bgImageUrl") {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(field);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("category", "jurusan");
      const result = await request("/api/uploads", { method: "POST", body });
      set(field, result.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload gagal.");
    } finally {
      setUploading(null);
    }
  }

  async function save(mode: "draft" | "publish") {
    setPending(true);
    setError("");
    try {
      const kompetensi = String(form.kompetensiText ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
      const fokusKeahlian = String(form.fokusText ?? "").split("\n").map((s) => s.trim()).filter(Boolean).map((title) => ({ title, icon: "" }));
      const payload: Record<string, unknown> = {
        code: String(form.code ?? "").toUpperCase(),
        name: String(form.name ?? ""),
        fullName: String(form.fullName ?? ""),
        slug: String(form.slug ?? "").trim() || slugify(String(form.fullName ?? "")),
        category: form.kategori,
        description: String(form.description ?? ""),
        kompetensi,
        fokusKeahlian,
        prospek: String(form.prospek ?? ""),
        durasi: String(form.durasi ?? "").trim() || "3 Tahun",
        logoUrl: typeof form.logoUrl === "string" && form.logoUrl ? form.logoUrl : null,
        bgImageUrl: typeof form.bgImageUrl === "string" && form.bgImageUrl ? form.bgImageUrl : null,
        websiteUrl: typeof form.websiteUrl === "string" && form.websiteUrl ? form.websiteUrl : null,
        sortOrder: Number(form.sortOrder ?? 0) || 0,
        isPublished: mode === "publish",
      };
      await request(id ? `/api/jurusan/${id}` : "/api/jurusan", { method: id ? "PUT" : "POST", body: JSON.stringify(payload) });
      toast.success(mode === "publish" ? "Jurusan diterbitkan." : "Jurusan disimpan sebagai draft.");
      router.replace("/admin/jurusan");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Perubahan gagal.");
      toast.error(cause instanceof Error ? cause.message : "Perubahan gagal.");
    } finally {
      setPending(false);
    }
  }

  const previewUrl = (field: "logoUrl" | "bgImageUrl") => (typeof form[field] === "string" ? form[field] : "");

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400">Admin / Jurusan</p>
          <h1 className="mt-1 text-2xl font-bold">{id ? "Edit jurusan" : "Tambah jurusan"}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void save("draft")} disabled={pending}><Save />Simpan draft</Button>
          <Button onClick={() => void save("publish")} disabled={pending} className="bg-[#1D4F98] hover:bg-[#0B3477]">{pending ? <LoaderCircle className="animate-spin" /> : <Save />}Terbitkan</Button>
        </div>
      </div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <Card>
        <CardHeader><CardTitle>Informasi jurusan</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="code">Kode *</Label><Input id="code" value={String(form.code ?? "")} onChange={(e) => set("code", e.target.value)} placeholder="SIJA" /></div>
            <div className="space-y-2"><Label htmlFor="name">Nama singkat *</Label><Input id="name" value={String(form.name ?? "")} onChange={(e) => set("name", e.target.value)} placeholder="SIJA" /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="fullName">Nama lengkap *</Label><Input id="fullName" value={String(form.fullName ?? "")} onChange={(e) => set("fullName", e.target.value)} placeholder="Sistem Informasi, Jaringan dan Aplikasi" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="slug">Slug URL</Label><Input id="slug" value={String(form.slug ?? "")} onChange={(e) => set("slug", e.target.value)} placeholder="Otomatis dari nama lengkap" /></div>
            <div className="space-y-2"><Label htmlFor="durasi">Durasi</Label><Input id="durasi" value={String(form.durasi ?? "")} onChange={(e) => set("durasi", e.target.value)} placeholder="3 Tahun" /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="kategori">Kategori *</Label><NativeSelect id="kategori" value={String(form.kategori ?? "IT")} onChange={(e) => set("kategori", e.target.value)}><NativeSelectOption value="IT">IT</NativeSelectOption><NativeSelectOption value="Teknik">Teknik</NativeSelectOption></NativeSelect></div>
            <div className="space-y-2"><Label htmlFor="sortOrder">Urutan</Label><Input id="sortOrder" type="number" value={String(form.sortOrder ?? 0)} onChange={(e) => set("sortOrder", Number(e.target.value) || 0)} /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="description">Deskripsi *</Label><Textarea id="description" value={String(form.description ?? "")} onChange={(e) => set("description", e.target.value)} rows={4} /></div>
          <div className="space-y-2"><Label htmlFor="kompetensiText">Kompetensi (satu per baris) *</Label><Textarea id="kompetensiText" value={String(form.kompetensiText ?? "")} onChange={(e) => set("kompetensiText", e.target.value)} rows={6} placeholder={"Cybersecurity\nCloud Computing\nNetworking"} /></div>
          <div className="space-y-2"><Label htmlFor="fokusText">Fokus keahlian (satu per baris)</Label><Textarea id="fokusText" value={String(form.fokusText ?? "")} onChange={(e) => set("fokusText", e.target.value)} rows={4} placeholder={"Jaringan\nCloud"} /></div>
          <div className="space-y-2"><Label htmlFor="prospek">Prospek karier *</Label><Textarea id="prospek" value={String(form.prospek ?? "")} onChange={(e) => set("prospek", e.target.value)} rows={3} /></div>
          <div className="space-y-2"><Label htmlFor="websiteUrl">Website URL (opsional)</Label><Input id="websiteUrl" value={String(form.websiteUrl ?? "")} onChange={(e) => set("websiteUrl", e.target.value)} placeholder="https://..." /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Gambar</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Logo jurusan</Label>
            <label className="grid min-h-28 cursor-pointer place-items-center rounded-lg border border-dashed p-4 text-center">
              <UploadCloud className="mx-auto" />
              <span className="mt-1 text-sm">{uploading === "logoUrl" ? "Mengunggah..." : "Upload logo"}</span>
              <span className="text-xs text-slate-400">JPEG, PNG, WebP, atau AVIF · maks. 5 MB</span>
              <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => upload(e, "logoUrl")} />
            </label>
            {previewUrl("logoUrl") && <div className="overflow-hidden rounded-lg border border-slate-200"><Image src={previewUrl("logoUrl")} alt="Logo" width={120} height={120} className="h-24 w-auto object-contain" /><p className="truncate bg-slate-50 px-3 py-1.5 text-xs text-slate-500">{previewUrl("logoUrl")}</p></div>}
          </div>
          <div className="space-y-2">
            <Label>Gambar latar (bg)</Label>
            <label className="grid min-h-28 cursor-pointer place-items-center rounded-lg border border-dashed p-4 text-center">
              <UploadCloud className="mx-auto" />
              <span className="mt-1 text-sm">{uploading === "bgImageUrl" ? "Mengunggah..." : "Upload gambar latar"}</span>
              <span className="text-xs text-slate-400">JPEG, PNG, WebP, atau AVIF · maks. 5 MB</span>
              <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => upload(e, "bgImageUrl")} />
            </label>
            {previewUrl("bgImageUrl") && <div className="overflow-hidden rounded-lg border border-slate-200"><Image src={previewUrl("bgImageUrl")} alt="Background" width={320} height={160} className="h-32 w-auto object-cover" /><p className="truncate bg-slate-50 px-3 py-1.5 text-xs text-slate-500">{previewUrl("bgImageUrl")}</p></div>}
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => router.back()}>Batal</Button><Button onClick={() => void save("publish")}>Simpan</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}
