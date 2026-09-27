"use client";
import { ResourcePage, StatusBadge } from "@/components/admin/resource-page";
import { Badge } from "@/components/ui/badge";
export default function FasilitasVokasiPage() { return <ResourcePage config={{ title: "Fasilitas Praktik Vokasi", description: "Fasilitas Teaching Factory (TEFA) per jurusan.", resource: "fasilitas-vokasi", createHref: "/admin/fasilitas-vokasi/baru", editPrefix: "/admin/fasilitas-vokasi", columns: ["Fasilitas", "TEFA", "Jurusan", "Status"], fields: (item) => [<span className="font-semibold">{item.title}</span>, <Badge variant="outline">{item.tefaName ?? "-"}</Badge>, <span className="text-slate-500">{item.jurusan ? `${item.jurusan.code} · ${item.jurusan.name}` : "Umum"}</span>, <StatusBadge published={item.isPublished} />] }} />; }
