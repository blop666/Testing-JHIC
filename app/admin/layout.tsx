import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/session";
import { AdminQueryProvider } from "@/components/admin/query-provider";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  if (!session) redirect("/login");
  return <AdminQueryProvider><AdminShell session={{ name: session.name, role: session.role, jurusanName: session.jurusanName }}>{children}</AdminShell></AdminQueryProvider>;
}
