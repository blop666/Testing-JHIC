"use client";
import { useEffect, useState } from "react";
import { ResourcePage, StatusBadge } from "@/components/admin/resource-page";

export default function GuruPage() {
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  useEffect(() => {
    void fetch("/api/guru-categories?limit=100").then((r) => r.json()).then((d) => { if (d.success) setCategories(d.data ?? []); }).catch(() => {});
  }, []);
  return <ResourcePage config={{
    title: "Guru & Staff",
    description: "Kelola data guru dan staff sekolah.",
    resource: "guru",
    createHref: "/admin/guru/baru",
    editPrefix: "/admin/guru",
    columns: ["Profil", "Jabatan", "Kategori", "Status"],
    filters: [{ key: "category", label: "Semua kategori", options: categories.map((c) => ({ value: String(c.id), label: c.name })) }],
    fields: (item) => [
      <span className="font-semibold">{item.name}</span>,
      <span className="text-slate-500">{item.position ?? "-"}</span>,
      <span className="text-slate-500">{item.category?.name ?? "Tanpa kategori"}</span>,
      <StatusBadge published={item.isPublished} />,
    ],
  }} />;
}
