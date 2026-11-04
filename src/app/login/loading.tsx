import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return <main className="flex min-h-dvh items-center justify-center bg-[var(--bg)] p-4"><Card className="grid w-full max-w-5xl overflow-hidden md:grid-cols-2"><Skeleton className="h-64 rounded-none md:h-[500px]"/><CardContent className="flex flex-col justify-center space-y-5 p-8"><Skeleton className="h-3 w-24"/><Skeleton className="h-10 w-48"/><Skeleton className="h-4 w-full"/><Skeleton className="h-11 w-full"/></CardContent></Card></main>;
}
