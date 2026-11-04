import * as React from "react";
import { cn } from "@/lib/utils";

function TypographyH1({ className, ...props }: React.ComponentProps<"h1">) {
  return <h1 className={cn("scroll-m-20 text-3xl font-extrabold tracking-tight text-balance md:text-4xl", className)} {...props} />;
}

function TypographyH2({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("scroll-m-20 text-2xl font-semibold tracking-tight md:text-3xl", className)} {...props} />;
}

function TypographyH3({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 className={cn("scroll-m-20 text-lg font-semibold tracking-tight", className)} {...props} />;
}

function TypographyP({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("leading-7", className)} {...props} />;
}

function TypographyLead({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-lg leading-7 text-[var(--muted)]", className)} {...props} />;
}

function TypographyMuted({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm leading-6 text-[var(--muted)]", className)} {...props} />;
}

function TypographySmall({ className, ...props }: React.ComponentProps<"small">) {
  return <small className={cn("text-xs leading-none font-medium", className)} {...props} />;
}

export { TypographyH1, TypographyH2, TypographyH3, TypographyP, TypographyLead, TypographyMuted, TypographySmall };
