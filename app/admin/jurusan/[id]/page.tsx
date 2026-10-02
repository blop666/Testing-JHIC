import { JurusanEditor } from "@/components/admin/jurusan-editor";
export default async function EditJurusanPage({ params }: { params: Promise<{ id: string }> }) { return <JurusanEditor id={(await params).id} />; }
