import { FeatureEditor } from "@/components/admin/feature-editor";
export default async function EditFasilitasPage({ params }: { params: Promise<{ id: string }> }) { return <FeatureEditor kind="fasilitas-vokasi" id={(await params).id} />; }
