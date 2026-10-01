"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiErrorMessage } from "@/lib/api-response";

type RecordItem = { id: number; title?: string; name?: string; isPublished?: boolean };
type ApiList = { success: boolean; data: RecordItem[]; meta?: { total: number }; error?: { message: string; details?: Array<{ field: string; message: string }> } };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(apiErrorMessage(result.error, "Permintaan gagal."));
  return result;
}

export function ContentList({ resource, title, createBody }: { resource: "posts" | "guru"; title: string; createBody: Record<string, unknown> }) {
  const client = useQueryClient();
  const query = useQuery({ queryKey: [resource], queryFn: () => request<ApiList>(`/api/${resource}?page=1&limit=50`) });
  const create = useMutation({ mutationFn: () => request(`/api/${resource}`, { method: "POST", body: JSON.stringify(createBody) }), onSuccess: () => client.invalidateQueries({ queryKey: [resource] }) });
  const remove = useMutation({ mutationFn: (id: number) => request(`/api/${resource}/${id}`, { method: "DELETE" }), onSuccess: () => client.invalidateQueries({ queryKey: [resource] }) });
  return <main className="min-h-screen bg-slate-950 p-6 text-white"><div className="mx-auto max-w-5xl"><div className="flex items-center justify-between gap-4"><div><h1 className="text-2xl font-bold">{title}</h1><p className="mt-1 text-sm text-slate-300">{query.data?.meta?.total ?? 0} data</p></div><button onClick={() => create.mutate()} disabled={create.isPending} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold disabled:opacity-50">Tambah draft</button></div>{query.isLoading && <p className="mt-8">Memuat...</p>}{query.error && <p role="alert" className="mt-8 text-red-300">{query.error.message}</p>}<div className="mt-6 overflow-hidden rounded-xl border border-slate-700 bg-slate-900">{query.data?.data.map((item) => <div className="flex items-center justify-between gap-4 border-b border-slate-800 p-4 last:border-0" key={item.id}><span>{item.title ?? item.name}</span><button onClick={() => remove.mutate(item.id)} className="text-sm text-red-300">Nonaktifkan</button></div>)}</div></div></main>;
}
