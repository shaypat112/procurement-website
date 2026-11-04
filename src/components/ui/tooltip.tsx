"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function Tooltip({ children }: { children: React.ReactNode }) {
  return <span className="group relative inline-flex">{children}</span>;
}

function TooltipTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  return asChild ? <>{children}</> : <span tabIndex={0}>{children}</span>;
}

function TooltipContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span role="tooltip" className={cn("pointer-events-none absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1.5 text-[11px] text-[var(--text)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100", className)}>{children}</span>;
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
