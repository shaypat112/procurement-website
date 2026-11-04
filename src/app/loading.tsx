import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <main className="min-h-dvh bg-[var(--bg)] p-5 text-[var(--text)] lg:pl-[272px]"><div className="mx-auto max-w-[1400px] py-12"><Skeleton className="mb-3 h-9 w-64"/><Skeleton className="mb-8 h-4 w-48"/><DashboardSkeleton/></div></main>;
}
