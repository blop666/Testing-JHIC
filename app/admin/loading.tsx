import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <div>
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="mt-2 h-8 w-56 rounded-lg" />
        <Skeleton className="mt-2 h-4 w-72 rounded" />
      </div>
      <Skeleton className="h-10 w-28 rounded-lg" />
      <div className="rounded-xl border bg-white">
        <Skeleton className="h-12 w-full rounded-t-xl" />
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full border-t" />
        ))}
      </div>
    </div>
  );
}
