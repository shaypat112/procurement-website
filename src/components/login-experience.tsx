"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import ActivityTerrain from "@/components/kokonutui/activity-terrain";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";

export function LoginExperience({ error }: { error?: string }) {
  const [ready, setReady] = useState(false);
  const [activity, setActivity] = useState<{ data: number[]; endDate: string } | null>(null);
  const [activityError, setActivityError] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setReady(true); return; }
    const timer = window.setTimeout(() => setReady(true), 1450);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/public/activity", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Activity unavailable");
        const result = await response.json();
        if (!Array.isArray(result.data) || typeof result.endDate !== "string") throw new Error("Invalid activity data");
        setActivity(result);
      })
      .catch(() => { if (!controller.signal.aborted) setActivityError(true); });
    return () => controller.abort();
  }, []);

  return <TooltipProvider><main className="relative flex min-h-dvh items-center justify-center bg-[var(--bg)] px-4 py-6 text-[var(--text)] sm:px-6 lg:px-10">
    <div className="absolute left-4 top-4 flex items-center gap-2 sm:left-8 sm:top-7"><img src="/mascot.png" alt="" className="size-8 object-contain"/><span className="text-sm font-semibold">Procurement</span></div>
    <div className="absolute right-4 top-4 sm:right-8 sm:top-7"><ThemeToggle/></div>
    <Card className="grid w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl shadow-black/10 md:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
      <div className="flex min-h-[270px] items-center justify-center border-b border-[var(--border)] bg-[var(--field)] p-3 sm:p-6 md:min-h-[500px] md:border-b-0 md:border-r md:p-8">
        {activity ? <ActivityTerrain title="Requests over the last 12 weeks" data={activity.data} endDate={activity.endDate} className="login-terrain w-full !max-w-none !rounded-xl !border-0 !bg-transparent !text-[var(--text)] !shadow-none" /> : <div className="flex min-h-48 w-full items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 text-center text-sm text-[var(--muted)]">{activityError ? "Request activity is temporarily unavailable." : "Loading request activity…"}</div>}
      </div>
      <div className="flex flex-col justify-center px-1 py-7 sm:px-4 sm:py-10 md:px-2">
        <CardHeader className="px-5 pb-0 sm:px-8"><p className="mb-5 text-xs font-medium text-[var(--muted)]">PROCUREMENT</p><CardTitle className="text-3xl font-semibold tracking-tight sm:text-4xl">Welcome.</CardTitle><CardDescription className="mt-3 max-w-sm text-sm sm:text-base">Find parts, track orders, and check inventory. Sign in to continue.</CardDescription></CardHeader>
        <CardContent className="px-5 pt-7 sm:px-8">
          {error && <p role="alert" className="mb-5 rounded-lg border border-[var(--border)] bg-[var(--field)] p-3 text-sm text-[var(--muted)]">{error === "configuration" ? "Discord sign-in needs its client ID, client secret, app URL, and auth secret configured." : "Sign-in did not finish. Please try again."}</p>}
          <form action="/api/auth/discord/start" method="get" className={`transition-all duration-500 motion-reduce:transition-none ${ready ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}><Button type="submit" className="h-11 w-full justify-between px-4 text-sm"><span>Continue with Discord</span><ArrowUpRight size={17}/></Button></form>
          <p className="mt-4 text-xs leading-5 text-[var(--faint)]">Your Discord account is used to identify your requests.</p>
        </CardContent>
      </div>
    </Card>
  </main></TooltipProvider>;
}
