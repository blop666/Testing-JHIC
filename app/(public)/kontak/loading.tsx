import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto min-h-screen max-w-[1600px] px-5 py-10 md:px-10 lg:px-14">
      <Skeleton className="h-10 w-64 rounded-xl" />
      <Skeleton className="mt-4 h-5 w-full max-w-lg rounded-lg" />
      <Skeleton className="mt-8 h-[420px] w-full rounded-xl" />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.3fr]">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </div>
  );
}
