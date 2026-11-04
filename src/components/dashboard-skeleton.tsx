import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return <div className="grid grid-cols-2 gap-3 xl:grid-cols-6" aria-label="Loading dashboard">
    {[0, 1, 2].map((index) => <Card key={index} className="col-span-1 h-[164px]"><CardContent className="flex h-full flex-col justify-between p-4"><Skeleton className="h-4 w-24 max-w-full"/><div><Skeleton className="h-8 w-12"/><Skeleton className="mt-2 h-3 w-28 max-w-full"/></div></CardContent></Card>)}
    <Card className="col-span-2 h-[164px] xl:col-span-4"><CardContent className="space-y-4 p-4"><Skeleton className="h-4 w-24"/><Skeleton className="h-3 w-full"/><Skeleton className="h-3 w-3/4"/><Skeleton className="h-3 w-1/2"/></CardContent></Card>
    <Card className="col-span-2 h-[164px]"><CardContent className="space-y-4 p-4"><Skeleton className="h-4 w-24"/><Skeleton className="h-8 w-16"/><Skeleton className="h-3 w-1/2"/></CardContent></Card>
  </div>;
}
