import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto min-h-screen max-w-[1600px] px-5 py-10 md:px-10 lg:px-14">
      <Skeleton className="h-10 w-64 rounded-xl" />
      <Skeleton className="mt-4 h-5 w-full max-w-2xl rounded-lg" />
      <Skeleton className="mt-2 h-5 w-full max-w-xl rounded-lg" />
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-10 h-[420px] w-full rounded-xl" />
    </div>
  );
}
