import { FeatureEditor } from "@/components/admin/feature-editor";
export default async function EditProgramPage({ params }: { params: Promise<{ id: string }> }) { return <FeatureEditor kind="program-unggulan" id={(await params).id} />; }
