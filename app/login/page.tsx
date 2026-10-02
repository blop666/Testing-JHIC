"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { apiErrorMessage } from "@/lib/api-response";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
      const result = await response.json() as { success: boolean; error?: { message?: string; details?: Array<{ field: string; message: string }> } };
      if (!result.success) { setError(apiErrorMessage(result.error, "Email atau kata sandi tidak valid.")); return; }
      router.replace("/admin"); router.refresh();
    } catch { setError("Terjadi kendala. Coba lagi."); } finally { setPending(false); }
  }
  return <main className="grid min-h-svh bg-white lg:grid-cols-[1.12fr_.88fr]"><section className="relative hidden overflow-hidden lg:block"><Image src="/smkn-hero-banner.webp" alt="Gedung SMKN 1 Cibinong" fill priority className="object-cover" /><div className="absolute inset-0 bg-gradient-to-br from-[#082E70]/95 via-[#123E91]/80 to-[#1D4F98]/55" /><div className="relative z-10 flex h-full flex-col justify-between p-12 text-white"><div className="flex items-center gap-3"><Image src="/cropped-logo-SMKN-1-Cbn.png" alt="Logo SMKN 1 Cibinong" width={48} height={48} className="object-contain" /><div><p className="font-bold">CibiOne CMS</p><p className="text-sm text-white/70">SMKN 1 Cibinong</p></div></div><div className="max-w-lg"><p className="mb-4 text-sm font-semibold uppercase tracking-[.16em] text-blue-100">Admin workspace</p><h1 className="text-4xl font-bold leading-tight tracking-[-.04em]">Ruang kerja pengelola konten sekolah.</h1><p className="mt-5 text-base leading-relaxed text-white/75">Kelola informasi sekolah dalam satu ruang kerja yang rapi dan terarah.</p></div><p className="text-xs text-white/55">CibiOne CMS · JHIC 2026</p></div></section><section className="flex items-center justify-center bg-[#F4F8FA] p-5 sm:p-8"><div className="w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-[0_24px_64px_rgba(8,46,112,.12)] ring-1 ring-slate-200 sm:p-8"><div className="mb-8 lg:hidden"><Image src="/cropped-logo-SMKN-1-Cbn.png" alt="Logo SMKN 1 Cibinong" width={44} height={44} /></div><p className="text-sm font-semibold text-[#1D4F98]">CibiOne CMS</p><h2 className="mt-2 text-2xl font-bold tracking-[-.03em]">Masuk ke CibiOne CMS</h2><p className="mt-2 text-sm leading-relaxed text-slate-500">Gunakan akun administrator untuk mengelola konten sekolah.</p><form onSubmit={onSubmit} className="mt-8 space-y-5"><div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div><div className="space-y-2"><Label htmlFor="password">Kata sandi</Label><div className="relative"><Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required className="pr-10" /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 size-8" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>{showPassword ? <EyeOff /> : <Eye />}</Button></div></div>{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}<Button type="submit" className="h-10 w-full bg-[#1D4F98] hover:bg-[#0B3477]" disabled={pending}>{pending && <LoaderCircle className="animate-spin" />} {pending ? "Memproses..." : "Masuk"}</Button></form></div></section></main>;
}
