"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Check, Eye, LoaderCircle, Save, Send, UploadCloud } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type ExtractResult = {
  title: string;
  contentText: string;
  sourceUrl: string | null;
  sourceFileName: string;
  sourceMimeType: string;
  sourceSizeBytes: number;
  sourceHash: string;
  pageCount: number | null;
  truncated: boolean;
  charCount: number;
};

async function request(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!(init?.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await fetch(url, { ...init, headers, cache: "no-store" });
  const text = await response.text();
  let result: { success?: boolean; data?: any; error?: { message?: string } } = {};
  try { result = JSON.parse(text); } catch { /* ignore */ }
  if (!response.ok || !result.success) throw new Error(result.error?.message ?? "Permintaan gagal.");
  return result.data;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function KnowledgeEditor({ id }: { id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, unknown>>({ title: "", contentText: "", isActive: true, isPublished: false });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractMeta, setExtractMeta] = useState<ExtractResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [testPrompt, setTestPrompt] = useState("");
  const [testResult, setTestResult] = useState<{ answer: string; status: string; confidence: number } | null>(null);

  useEffect(() => {
    if (id) {
      void request(`/api/chatbot-knowledge/${id}`)
        .then((data) => setForm({ title: data.title ?? "", contentText: data.contentText ?? "", sourceUrl: data.sourceUrl ?? "", sourceFileName: data.sourceFileName ?? "", sourceMimeType: data.sourceMimeType ?? "", sourceSizeBytes: data.sourceSizeBytes ?? null, sourceHash: data.sourceHash ?? "", effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom).toISOString().slice(0, 16) : "", effectiveUntil: data.effectiveUntil ? new Date(data.effectiveUntil).toISOString().slice(0, 16) : "", isActive: data.isActive, isPublished: data.isPublished }))
        .catch((cause) => setError(cause instanceof Error ? cause.message : "Data gagal dimuat."));
    }
  }, [id]);

  const set = (key: string, value: unknown) => setForm((previous) => ({ ...previous, [key]: value }));

  async function extract(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    setError("");
    setExtractMeta(null);
    try {
      const body = new FormData();
      body.set("file", file);
      const result = await request("/api/chatbot-knowledge/extract", { method: "POST", body });
      setExtractMeta(result);
      setForm((previous) => ({
        ...previous,
        title: result.title || previous.title,
        contentText: result.contentText || previous.contentText,
        sourceFileName: result.sourceFileName,
        sourceMimeType: result.sourceMimeType,
        sourceSizeBytes: result.sourceSizeBytes,
        sourceHash: result.sourceHash,
      }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ekstraksi gagal.");
    } finally {
      setExtracting(false);
      event.target.value = "";
    }
  }

  async function save(mode: "draft" | "publish") {
    setPending(true);
    setError("");
    try {
      const payload = {
        title: String(form.title ?? "").trim(),
        contentText: String(form.contentText ?? "").trim(),
        sourceUrl: form.sourceUrl ? String(form.sourceUrl) : null,
        sourceFileName: form.sourceFileName ? String(form.sourceFileName) : null,
        sourceMimeType: form.sourceMimeType ? String(form.sourceMimeType) : null,
        sourceSizeBytes: form.sourceSizeBytes ? Number(form.sourceSizeBytes) : null,
        sourceHash: form.sourceHash ? String(form.sourceHash) : null,
        effectiveFrom: form.effectiveFrom ? new Date(String(form.effectiveFrom)).toISOString() : null,
        effectiveUntil: form.effectiveUntil ? new Date(String(form.effectiveUntil)).toISOString() : null,
        isActive: Boolean(form.isActive),
        isPublished: mode === "publish",
      };
      await request(id ? `/api/chatbot-knowledge/${id}` : "/api/chatbot-knowledge", { method: id ? "PUT" : "POST", body: JSON.stringify(payload) });
      router.replace("/admin/chatbot-knowledge");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Perubahan gagal.");
    } finally {
      setPending(false);
    }
  }

  async function test() {
    if (!id) return;
    setTesting(true);
    setTestResult(null);
    try {
      setTestResult(await request(`/api/chatbot-knowledge/${id}/test`, { method: "POST", body: JSON.stringify({ prompt: testPrompt }) }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Uji gagal.");
    } finally {
      setTesting(false);
    }
  }

  const contentText = String(form.contentText ?? "");

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400">Admin / Knowledge AI</p>
          <h1 className="mt-1 text-2xl font-bold">{id ? "Edit knowledge" : "Tambah knowledge"}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void save("draft")} disabled={pending}><Save className="size-4" />Simpan draft</Button>
          <Button onClick={() => void save("publish")} disabled={pending} className="bg-[#1D4F98] hover:bg-[#0B3477]">{pending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}Publish</Button>
        </div>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <Card>
        <CardHeader><CardTitle>Informasi knowledge</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Judul / topik *</Label>
            <Input id="title" value={String(form.title ?? "")} onChange={(e) => set("title", e.target.value)} placeholder="Contoh: Biaya pendaftaran siswa baru" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="contentText">Isi knowledge *</Label>
            <Textarea id="contentText" value={contentText} onChange={(e) => set("contentText", e.target.value)} rows={10} placeholder="Tulis fakta resmi sekolah yang menjadi sumber jawaban chatbot..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sourceUrl">URL sumber (opsional)</Label>
            <Input id="sourceUrl" value={String(form.sourceUrl ?? "")} onChange={(e) => set("sourceUrl", e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="effectiveFrom">Berlaku mulai (opsional)</Label>
            <Input id="effectiveFrom" type="datetime-local" value={String(form.effectiveFrom ?? "")} onChange={(e) => set("effectiveFrom", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="effectiveUntil">Berlaku hingga (opsional)</Label>
            <Input id="effectiveUntil" type="datetime-local" value={String(form.effectiveUntil ?? "")} onChange={(e) => set("effectiveUntil", e.target.value)} />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
            <div><p className="text-sm font-semibold text-slate-800">Aktif</p><p className="text-xs text-slate-500">Nonaktifkan untuk arsip.</p></div>
            <Switch checked={Boolean(form.isActive)} onCheckedChange={(checked) => set("isActive", checked)} aria-label="Aktif" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Buat dari dokumen (PDF / DOCX)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <label className="grid min-h-32 cursor-pointer place-items-center rounded-lg border border-dashed p-4 text-center">
            <UploadCloud className="mx-auto size-6" />
            <span className="mt-1 text-sm">{extracting ? "Mengekstraksi..." : "Upload PDF atau DOCX"}</span>
            <span className="text-xs text-slate-400">PDF text-based atau DOCX · maks. 10 MB</span>
            <input className="sr-only" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={extract} disabled={extracting} />
          </label>
          {extractMeta && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="font-semibold">{extractMeta.sourceFileName}</p>
              <p className="text-xs text-slate-500">{formatBytes(extractMeta.sourceSizeBytes)} · {extractMeta.sourceMimeType} · {extractMeta.pageCount ? `${extractMeta.pageCount} halaman` : "DOCX"} · hash {extractMeta.sourceHash.slice(0, 12)}…</p>
              <p className="mt-1 text-xs text-slate-500">{extractMeta.charCount.toLocaleString("id-ID")} karakter hasil ekstraksi{extractMeta.truncated ? " (dipotong)" : ""}.</p>
            </div>
          )}
          <p className="text-xs text-slate-400">Dokumen asli tidak disimpan. Teks hasil ekstraksi dimuat ke kolom isi di atas untuk Anda periksa dan edit sebelum disimpan.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Pratinjau</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Konteks chatbot</p>
            <div className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{contentText || <span className="text-slate-400">Isi knowledge akan tampil di sini.</span>}</div>
          </div>
        </CardContent>
      </Card>

      {id && (
        <Card>
          <CardHeader><CardTitle>Uji jawaban</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={testPrompt} onChange={(e) => setTestPrompt(e.target.value)} placeholder="Contoh pertanyaan pengguna..." />
              <Button variant="outline" onClick={() => void test()} disabled={testing || !testPrompt.trim()}>{testing ? <LoaderCircle className="size-4 animate-spin" /> : <Bot className="size-4" />}Uji</Button>
            </div>
            {testResult && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                <div className="mb-2 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${testResult.status === "answered" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{testResult.status}</span>
                  <span className="text-xs text-slate-500">keyakinan {Math.round(testResult.confidence * 100)}%</span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{testResult.answer}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
