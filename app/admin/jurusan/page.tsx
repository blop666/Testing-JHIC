"use client";
import { ResourcePage, StatusBadge } from "@/components/admin/resource-page";
import { Badge } from "@/components/ui/badge";
export default function JurusanPage() {
  return <ResourcePage config={{
    title: "Jurusan",
    description: "Kelola program keahlian, konten, dan gambar jurusan.",
    resource: "jurusan",
    createHref: "/admin/jurusan/baru",
    editPrefix: "/admin/jurusan",
    columns: ["Kode", "Nama", "Kategori", "Status"],
    fields: (item: any) => [
      <span className="font-semibold">{item.code}</span>,
      <span>{item.fullName}</span>,
      <Badge variant="outline">{item.category}</Badge>,
      <StatusBadge published={item.isPublished} />,
    ],
  }} />;
}
