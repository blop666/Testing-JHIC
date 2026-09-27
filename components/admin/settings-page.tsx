"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BadgeCheck, LoaderCircle, Save, Target } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const settings = { school_vision_mission: { title: "Visi & Misi", icon: Target, description: "Kelola konten visi dan misi halaman Profil Sekolah." }, school_accreditation: { title: "Akreditasi", icon: BadgeCheck, description: "Kelola kartu akreditasi dan standar pendidikan." } } as const;
type Key = keyof typeof settings;
async function request(key: string, init?: RequestInit) { const response = await fetch(`/api/settings/${key}`, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } }); const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.error?.message ?? "Permintaan gagal."); return result.data; }

async function requestWithRetry(key: string, init?: RequestInit, attempts = 2) { let lastError: unknown; for (let attempt = 1; attempt <= attempts; attempt++) { try { return await request(key, init); } catch (error) { lastError = error; if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 500 * attempt)); } } throw lastError; }

export function SettingsIndex() { return <div className="mx-auto max-w-5xl space-y-6"><div><h1 className="text-2xl font-bold">Pengaturan</h1><p className="mt-2 text-sm text-slate-500">Kelola konten singleton halaman sekolah.</p></div><div className="grid gap-4 md:grid-cols-2">{Object.entries(settings).map(([key, item]) => { const Icon = item.icon; return <Card key={key} className="transition-shadow hover:shadow-md"><CardHeader><span className="mb-3 grid size-10 place-items-center rounded-xl bg-[#E8F1F6] text-[#1D4F98]"><Icon className="size-5" /></span><CardTitle>{item.title}</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-500">{item.description}</p><Link className="mt-4 inline-flex text-sm font-medium text-[#1D4F98] hover:underline" href={`/admin/pengaturan/${key === "school_vision_mission" ? "visi-misi" : "akreditasi"}`}>Kelola →</Link></CardContent></Card>; })}</div></div>; }

export function SettingEditor({ settingKey }: { settingKey: Key }) {
  const [value, setValue] = useState<Record<string, unknown>>({}); const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  useEffect(() => { void requestWithRetry(settingKey).then((result) => setValue(result.value ?? {})).catch((cause) => setError(cause instanceof Error ? cause.message : "Data tidak dapat dimuat.")); }, [settingKey]);
  async function save() { setPending(true); setError(""); try { await requestWithRetry(settingKey, { method: "PUT", body: JSON.stringify({ value }) }); } catch (cause) { setError(cause instanceof Error ? cause.message : "Perubahan gagal."); } finally { setPending(false); } }
  function update(key: string, next: unknown) { setValue((current) => ({ ...current, [key]: next })); }
  const title = settings[settingKey].title;
  return <div className="mx-auto max-w-5xl space-y-6"><div><p className="mb-2 text-xs font-semibold text-slate-400">Admin / Pengaturan</p><h1 className="text-2xl font-bold">{title}</h1></div>{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}<Card><CardHeader><CardTitle>Informasi {title}</CardTitle></CardHeader><CardContent className="space-y-5">{settingKey === "school_vision_mission" ? <><div className="space-y-2"><Label>Background image URL</Label><Input value={String(value.backgroundImageUrl ?? "")} onChange={(event) => update("backgroundImageUrl", event.target.value)} /></div>{(["vision", "mission"] as const).map((part) => { const panel = (value[part] as Record<string, unknown> | undefined) ?? {}; return <Card key={part} className="border-slate-200"><CardHeader><CardTitle className="text-base">{part === "vision" ? "Visi" : "Misi"}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label>Judul</Label><Input value={String(panel.title ?? "")} onChange={(event) => update(part, { ...panel, title: event.target.value })} /></div><div className="space-y-2"><Label>Subjudul</Label><Input value={String(panel.subtitle ?? "")} onChange={(event) => update(part, { ...panel, subtitle: event.target.value })} /></div><div className="space-y-2"><Label>Deskripsi</Label><Textarea value={String(panel.description ?? "")} onChange={(event) => update(part, { ...panel, description: event.target.value })} /></div></CardContent></Card>; })}</> : <><div className="space-y-2"><Label>Heading</Label><Input value={String(value.heading ?? "")} onChange={(event) => update("heading", event.target.value)} /></div><div className="space-y-2"><Label>Deskripsi</Label><Textarea value={String(value.description ?? "")} onChange={(event) => update("description", event.target.value)} /></div><p className="text-sm text-slate-500">Kartu akreditasi dikelola melalui data konfigurasi. Editor repeater akan ditambahkan setelah kontrak form final.</p></>}</CardContent></Card><div className="flex justify-end"><Button onClick={() => void save()} disabled={pending} className="bg-[#1D4F98] hover:bg-[#0B3477]">{pending ? <LoaderCircle className="animate-spin" /> : <Save />}Simpan perubahan</Button></div></div>;
}
