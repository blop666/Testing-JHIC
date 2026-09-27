import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto min-h-screen max-w-[1720px] px-4 py-10 sm:px-6 lg:px-8 xl:px-10">
      <div className="grid items-stretch gap-6 lg:h-[650px] lg:grid-cols-[minmax(0,3fr)_minmax(390px,1fr)]">
        <Skeleton className="h-[520px] w-full rounded-[20px] lg:h-full" />
        <div className="flex flex-col gap-5">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-[150px] w-full rounded-[20px]" />
          <Skeleton className="h-[150px] w-full rounded-[20px]" />
          <Skeleton className="h-[150px] w-full rounded-[20px]" />
        </div>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-72 w-full rounded-[24px]" />
        ))}
      </div>
    </div>
  );
}
