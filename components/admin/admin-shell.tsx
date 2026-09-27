"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Award, BookOpen, Bot, Building2, GraduationCap, Handshake, LayoutDashboard, LogOut, Menu, Newspaper, Settings2, Tags, Wrench } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type NavItem = readonly [href: string, label: string, Icon: typeof LayoutDashboard];
type NavGroup = { title: string; items: NavItem[] };

type AdminShellSession = { name: string; role: "super_admin" | "jurusan_admin"; jurusanName: string | null };

const groups: NavGroup[] = [
  { title: "Umum", items: [["/admin", "Dashboard", LayoutDashboard]] },
  {
    title: "Kelola Konten",
    items: [
      ["/admin/konten", "Konten", Newspaper],
      ["/admin/kategori-konten", "Kategori Konten", Tags],
    ],
  },
  {
    title: "Kelola Guru",
    items: [
      ["/admin/guru", "Guru & Staff", GraduationCap],
      ["/admin/kategori-guru", "Kategori Guru", Tags],
    ],
  },
  {
    title: "Kelola Sekolah",
    items: [
      ["/admin/sarana-prasarana", "Sarana & Prasarana", Building2],
      ["/admin/fasilitas-vokasi", "Fasilitas Praktik Vokasi", Wrench],
      ["/admin/mitra-industri", "Mitra Industri", Handshake],
      ["/admin/program-unggulan", "Program Unggulan", Award],
    ],
  },
  {
    title: "AI Content Generation",
    items: [
      ["/admin/chatbot", "Chatbot AI", Bot],
      ["/admin/chatbot-knowledge", "Knowledge AI", BookOpen],
    ],
  },
  { title: "Lainnya", items: [["/admin/pengaturan", "Pengaturan", Settings2]] },
];

const JURUSAN_ADMIN_HIDDEN: Record<string, boolean> = {
  "/admin/sarana-prasarana": true,
  "/admin/pengaturan": true,
};

function visibleGroups(session: AdminShellSession): NavGroup[] {
  if (session.role === "super_admin") return groups;
  return groups.map((group) => ({ ...group, items: group.items.filter(([href]) => !JURUSAN_ADMIN_HIDDEN[href]) })).filter((group) => group.items.length > 0);
}

function Nav({ session, onNavigate }: { session: AdminShellSession; onNavigate?: () => void }) {
  const pathname = usePathname();
  return <nav className="space-y-5 px-3" aria-label="Navigasi admin">{visibleGroups(session).map((group) => (
    <div key={group.title}>
      <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-[.1em] text-slate-400">{group.title}</p>
      <div className="space-y-1">{group.items.map(([href, label, Icon]) => {
        const active = href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return <Link key={href} href={href} onClick={onNavigate} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${active ? "bg-[#E8F1F6] text-[#0B3477]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}><Icon className="size-[18px]" aria-hidden />{label}</Link>;
      })}</div>
    </div>
  ))}</nav>;
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function AdminShell({ children, session }: { children: React.ReactNode; session: AdminShellSession }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.replace("/login"); }
  const brand = <><Image src="/cropped-logo-SMKN-1-Cbn.png" alt="Logo SMKN 1 Cibinong" width={38} height={38} className="object-contain" /><div><p className="text-sm font-bold tracking-tight">CibiOne CMS</p><p className="text-xs text-slate-500">SMKN 1 Cibinong</p></div></>;
  const roleLabel = session.role === "super_admin" ? "Super Admin" : "Admin Jurusan";
  const scopeLabel = session.role === "jurusan_admin" ? `Scope: ${session.jurusanName ?? "-"}` : "Seluruh jurusan";
  return <div className="flex min-h-svh bg-[#F4F8FA] text-slate-950">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] border-r border-slate-200 bg-white md:flex md:flex-col"><div className="flex h-[88px] items-center gap-3 border-b border-slate-200 px-6">{brand}</div><div className="flex-1 overflow-y-auto py-6"><p className="mb-2 px-6 text-[11px] font-bold uppercase tracking-[.1em] text-slate-400">Workspace</p><Nav session={session} /></div><div className="border-t border-slate-200 p-4"><Button variant="ghost" className="w-full justify-start gap-3 text-slate-600" onClick={logout}><LogOut className="size-4" />Keluar</Button></div></aside>
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetContent side="left" className="w-[min(320px,88vw)] p-0"><SheetHeader className="flex h-[88px] flex-row items-center gap-3 border-b px-6 text-left">{brand}<SheetTitle className="sr-only">Navigasi admin</SheetTitle></SheetHeader><div className="py-6"><Nav session={session} onNavigate={() => setMobileOpen(false)} /></div></SheetContent></Sheet>
     <div className="flex min-h-svh min-w-0 flex-1 flex-col md:ml-[272px]"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:h-[72px] md:px-8"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Buka navigasi"><Menu className="size-5" /></Button><span className="text-sm font-semibold text-slate-700 md:hidden">CibiOne CMS</span><Separator orientation="vertical" className="hidden h-5 md:block" /><Badge variant="outline" className="hidden border-[#E8F1F6] bg-[#E8F1F6] text-[#0B3477] md:inline-flex">{scopeLabel}</Badge></div><div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-xs font-semibold">{session.name}</p><p className="text-[11px] text-slate-500">{roleLabel}</p></div><Avatar className="size-8"><AvatarFallback className="bg-[#1D4F98] text-xs text-white">{initials(session.name)}</AvatarFallback></Avatar><Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={logout} aria-label="Keluar"><LogOut className="size-4" /></Button></div></header><main className="min-h-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main></div>
  </div>;
}
