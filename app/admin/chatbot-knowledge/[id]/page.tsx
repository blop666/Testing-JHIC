import { KnowledgeEditor } from "@/components/admin/knowledge-editor";
export default async function EditKnowledgePage({ params }: { params: Promise<{ id: string }> }) { return <KnowledgeEditor id={(await params).id} />; }
