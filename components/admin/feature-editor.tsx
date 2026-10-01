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

type Kind = "program-unggulan" | "fasilitas-vokasi";

const titles: Record<Kind, string> = { "program-unggulan": "Program Unggulan", "fasilitas-vokasi": "Fasilitas Praktik Vokasi" };

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

export function FeatureEditor({ kind, id }: { kind: Kind; id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, unknown>>({ isPublished: false, sortOrder: 0 });
  const [jurusan, setJurusan] = useState<Array<{ id: number; code: string; name: string }>>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) void request(`/api/${kind}/${id}`).then(setForm).catch((cause) => setError(cause instanceof Error ? cause.message : "Data gagal dimuat."));
    void fetch("/api/jurusan?limit=100").then((r) => r.json()).then((d) => { if (d.success) setJurusan(d.data ?? []); }).catch(() => {});
  }, [id, kind]);

  const set = (key: string, value: unknown) => setForm((previous) => ({ ...previous, [key]: value }));

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("category", kind);
      const result = await request("/api/uploads", { method: "POST", body });
      set("imageUrl", result.url);
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
      const payload: Record<string, unknown> = { ...form, isPublished: mode === "publish" };
      if (kind === "program-unggulan") { delete payload.tefaName; }
      else { delete payload.label; }
      if (payload.jurusanId === "" || payload.jurusanId === null) payload.jurusanId = null;
      await request(id ? `/api/${kind}/${id}` : `/api/${kind}`, { method: id ? "PUT" : "POST", body: JSON.stringify(payload) });
      toast.success(mode === "publish" ? "Data diterbitkan." : "Data disimpan sebagai draft.");
      router.replace(`/admin/${kind === "program-unggulan" ? "program-unggulan" : "fasilitas-vokasi"}`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Perubahan gagal.");
      toast.error(cause instanceof Error ? cause.message : "Perubahan gagal.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400">Admin / {titles[kind]}</p>
          <h1 className="mt-1 text-2xl font-bold">{id ? `Edit ${titles[kind]}` : `Tambah ${titles[kind]}`}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void save("draft")} disabled={pending}><Save />Simpan draft</Button>
          <Button onClick={() => void save("publish")} disabled={pending} className="bg-[#1D4F98] hover:bg-[#0B3477]">{pending ? <LoaderCircle className="animate-spin" /> : <Save />}Terbitkan</Button>
        </div>
      </div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <Card>
        <CardHeader><CardTitle>Informasi {titles[kind]}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label htmlFor="title">Judul *</Label><Input id="title" value={String(form.title ?? "")} onChange={(event) => set("title", event.target.value)} /></div>
          {kind === "program-unggulan" && <div className="space-y-2"><Label htmlFor="label">Label *</Label><Input id="label" value={String(form.label ?? "")} onChange={(event) => set("label", event.target.value)} placeholder="Contoh: Pembelajaran digital" /></div>}
          {kind === "fasilitas-vokasi" && <div className="space-y-2"><Label htmlFor="tefaName">Nama TEFA</Label><Input id="tefaName" value={String(form.tefaName ?? "")} onChange={(event) => set("tefaName", event.target.value)} placeholder="Contoh: TeFa Software Development" /></div>}
          <div className="space-y-2"><Label htmlFor="jurusanId">Jurusan</Label><NativeSelect id="jurusanId" value={String(form.jurusanId ?? "")} onChange={(event) => set("jurusanId", event.target.value ? Number(event.target.value) : null)}><NativeSelectOption value="">{kind === "program-unggulan" ? "Program global" : "Umum / Keseluruhan"}</NativeSelectOption>{jurusan.map((item) => <NativeSelectOption key={item.id} value={String(item.id)}>{item.code} · {item.name}</NativeSelectOption>)}</NativeSelect></div>
          <div className="space-y-2"><Label htmlFor="description">Deskripsi{kind === "program-unggulan" ? " *" : ""}</Label><Textarea id="description" value={String(form.description ?? "")} onChange={(event) => set("description", event.target.value)} rows={4} /></div>
          <div className="space-y-2"><Label htmlFor="sortOrder">Urutan</Label><Input id="sortOrder" type="number" value={String(form.sortOrder ?? 0)} onChange={(event) => set("sortOrder", Number(event.target.value) || 0)} /></div>
          <label className="grid min-h-32 cursor-pointer place-items-center rounded-lg border border-dashed p-4 text-center">
            <UploadCloud className="mx-auto" />
            <span className="mt-1 text-sm">{uploading ? "Mengunggah..." : "Upload gambar"}</span>
            <span className="text-xs text-slate-400">JPEG, PNG, WebP, atau AVIF · maks. 5 MB</span>
            <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={upload} />
          </label>
          {typeof form.imageUrl === "string" && form.imageUrl && <div className="overflow-hidden rounded-lg border border-slate-200"><Image src={form.imageUrl} alt="Preview" width={320} height={180} className="h-32 w-auto object-cover" /><p className="truncate bg-slate-50 px-3 py-1.5 text-xs text-slate-500">{form.imageUrl}</p></div>}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => router.back()}>Batal</Button><Button onClick={() => void save("publish")}>Simpan</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}
